import * as THREE from "three";
import { getAmbientInputColor, getEnvColors } from "../ui";
import { NoiseBlock } from "./blocks/patterns/noise";

export let vertexShader="";
export let fragmentShader="";

export class ShaderGraph {
    constructor(blocks = [], outputVar = "finalColor") {
        this.blocks = blocks;
        this.outputVar = outputVar;
    }

    generateShaderStrings() {
        let globals = "";
        let mainCode = "";

        const globalsSet = new Set();

        let connectionBlock = null;
        let noiseBlock = false;

        for (const block of this.blocks) {
            const code = block.generateCode();

            if (code.globals && !globalsSet.has(code.globals)) {
                globalsSet.add(code.globals);
                globals += code.globals + "\n";
            }

            if (code.mainCode) {
                mainCode += code.mainCode + "\n";
            }

            if (block.constructor.name === "ConnectionBlock") connectionBlock = block;
            if (block.constructor.name === "NoiseBlock") noiseBlock = true;
        }

        if (mainCode.includes("snoise") && noiseBlock == false) {
            const tmpNoise = new NoiseBlock("_tmp", { normalized: false });
            globals += tmpNoise.generateCode().globals + "\n";
        }

        if (connectionBlock) {
            const connections = connectionBlock.connections || {};
            const colorVar = connections.color || "vec3(1.0)";
            const bumpVar  = connections.bump   || "vec3(0.0)";

            const roughnessRaw = connections.roughness || "0.5";
            const metallicRaw  = connections.metallic  || "0.0";

            const isNumber = (v) => !isNaN(parseFloat(v)) && isFinite(v);
            const roughnessVar = isNumber(roughnessRaw) ? roughnessRaw : roughnessRaw + ".r";
            const metallicVar  = isNumber(metallicRaw)  ? metallicRaw  : metallicRaw  + ".r";

            mainCode +=
`    // Define final outputs with connection
    vec3 finalColor = ${colorVar};
    vec3 finalBump = ${bumpVar};
    float finalRoughness = ${roughnessVar};
    float finalMetallic = ${metallicVar};
    `;
        } else {
            mainCode +=
`    // Define final outputs
    vec3 finalColor = ${this.blocks[this.blocks.length - 1].name};
    vec3 finalBump = vec3(0.0);
    float finalRoughness = 0.5;
    float finalMetallic = 0.0;
    `;
        }

        vertexShader = `
// ==================
// Vertex Shader
// ==================

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;

void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    vWorldPosition = worldPos.xyz;
    vViewPosition = mvPosition.xyz;
    vNormal = normalize(normalMatrix * normal);

    vPosition = position;
    vUv = uv;

    gl_Position = projectionMatrix * mvPosition;
}

        `;

        fragmentShader = `
// ==================
// Fragment Shader
// ==================

precision highp float;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;

uniform vec3 uLightColor;
uniform vec3 uLightPos;
uniform vec3 uCameraPos;
uniform vec3 uAmbientColor;


uniform vec3 uEnvLight;
uniform vec3 uEnvFill;
uniform vec3 uEnvGround;

${globals}

void main() {

${mainCode}

    vec3 N;
    #ifdef USE_UV_MAPPING
        N = normalize(vNormal + finalBump * 0.15);
    #else
        N = normalize(vNormal + finalBump * 0.15);
    #endif

    vec3 V = normalize(-vViewPosition); // direction vers la caméra
    vec3 lightPosView = (viewMatrix * vec4(uLightPos, 1.0)).xyz;
    vec3 L = normalize(lightPosView - vViewPosition); // direction towards the light
    vec3 H = normalize(L + V); 
    vec3 R = reflect(-V, N);

    float NdotL = max(dot(N, L), 0.0);
    float NdotH = max(dot(N, H), 0.0);
    float NdotV = max(dot(N, V), 0.0);

    // Fresnel Schlick
    float fresnel = 0.5 + 0.5 * pow(1.0 - NdotV, 3.0);

    // Fake environment map — simule un studio 3 points
    
    vec3 envLight  = uEnvLight;
    vec3 envFill   = uEnvFill;
    vec3 envGround = uEnvGround;

    // Mix with reflection
    float upness    = R.y * 0.5 + 0.5;          // 0 = down, 1 = up
    float sideness  = abs(R.x) * 0.5 + 0.5;    // side

    vec3 envColor = mix(envGround, envLight, upness);
    envColor      = mix(envColor,  envFill,  sideness * (1.0 - upness));

    // Fake environment
    vec3 envReflect = envColor * finalColor * fresnel * finalMetallic * 2.0;  

    // Specular
    float shininess = mix(32.0, 512.0, 1.0 - finalRoughness);
    float spec = pow(NdotH, shininess);
    vec3 specular = finalColor * spec * 1.5;

    // Diffuse
    vec3 diffuse = finalColor * NdotL * (1.0 - finalMetallic * 0.9);

    // Ambient minimal
    vec3 ambient = uAmbientColor * finalColor * 0.15;

    gl_FragColor = vec4(ambient + diffuse + specular + envReflect, 1.0);
}
    `;

        return { vertexShader, fragmentShader };
    }

    createMaterial(camera, light) {
        const { vertexShader, fragmentShader } = this.generateShaderStrings();
        const { envLight, envFill, envGround } = getEnvColors();
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uLightColor:  { value: new THREE.Color(1, 1, 1) },
                uLightPos:    { value: new THREE.Vector3(3, 3, 2) },
                uCameraPos:   { value: camera.position.clone() }, // clone to avoid issue with reference
                uAmbientColor:{ value: getAmbientInputColor() },
                uEnvLight:  { value: envLight.clone() },
                uEnvFill:   { value: envFill.clone() },
                uEnvGround: { value: envGround.clone() }
            },
            extensions: { derivatives: true }
        });
        return material;
    }
}

export function getVertexShader() { return vertexShader; }
export function getFragmentShader() { return fragmentShader; }