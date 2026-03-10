import * as THREE from "three";
import { getAmbientInputColor } from "../ui";
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

        // Look for the connection block
        let connectionBlock = null;
        let noiseBlock = false;
        for (const block of this.blocks) {

            const code = block.generateCode();

            // Avoid dupplication
            if (code.globals && !globalsSet.has(code.globals)) {
                globalsSet.add(code.globals);
                globals += code.globals + "\n";
            }

            if (code.mainCode) {
                mainCode += code.mainCode + "\n";
            }

            if (block.constructor.name === "ConnectionBlock") {
                connectionBlock = block;
            }

            if (block.constructor.name === "NoiseBlock") {
                noiseBlock = true;
            }
        }
        
        // some block function use snoise
        if(mainCode.includes("snoise") && noiseBlock == false) {
            const tmpNoise = new NoiseBlock("_tmp", { normalized: false });
            globals += tmpNoise.generateCode().globals + "\n";
        }

        // Define final output
        if (connectionBlock) {
            const connections = connectionBlock.connections || {};
            const colorVar = connections.color || "vec3(1.0)";
            const bumpVar = connections.bump || "vec3(0.0)";
            const roughnessVar = connections.roughness || "0.5";
            const metallicVar = connections.metallic || "0.0";

            mainCode +=
`    // Define final outputs with connection
    vec3 finalColor = ${colorVar};
    vec3 finalBump = ${bumpVar};
    float finalRoughness = ${roughnessVar}.r;
    float finalMetallic = ${metallicVar};
    `;
        }
        else {
        mainCode +=
`    // Define final outputs
    vec3 finalColor = ${this.blocks[this.blocks.length - 1].name};
    vec3 finalBump = vec3(0.0);
    float finalRoughness = 0.5;
    
    `;
        }

        // Vertex shader
        vertexShader = `
// ==================
// Vertex Shader
// ==================

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
    vNormal = normalMatrix * normal;

    vPosition = position;   // local space
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
        `;

        // Fragment shader avec bump et roughness
        fragmentShader = `
// ==================
// Fragment Shader
// ==================

// COMMON PART VARYING & UNIFORM
precision highp float;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

uniform vec3 uLightColor;
uniform vec3 uLightPos;
uniform vec3 uCameraPos;
uniform vec3 uAmbientColor;


${globals}

void main() {

${mainCode}

    // COMMON PART MAIN
    // Normal + Bump
    vec3 N = normalize(vNormal + finalBump * 0.5);
    vec3 L = normalize(uLightPos - vPosition);
    vec3 V = normalize(uCameraPos - vPosition);
    vec3 R = reflect(-L, N);
    float lambert = max(dot(N, L), 0.0);

    // Specular
    float shininess = mix(16.0, 256.0, 1.0 - finalRoughness);
    float spec = pow(max(dot(R, V), 0.0), shininess);
    vec3 specularColor = finalColor; // métal
    vec3 specular = specularColor * spec;

    // Diffuse
    vec3 diffuse = finalColor * lambert * (1.0 - finalMetallic);

    // Ambient
    vec3 ambient = uAmbientColor * finalColor * (1.0 - finalMetallic) + uAmbientColor * 0.03;

    // Final
    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}
    `;

    return { vertexShader, fragmentShader };}

    createMaterial(camera, light) {
        const { vertexShader, fragmentShader } = this.generateShaderStrings();
        const ambientColor = getAmbientInputColor();
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uLightColor: { value: new THREE.Color(1, 1, 1) },
                uLightPos: { value: new THREE.Vector3(5, 5, 5) },
                uCameraPos: { value: camera.position },
                uAmbientColor: { value: getAmbientInputColor() }
            },
            extensions: { derivatives: true }
        });
        return material;
    }
}

export function getVertexShader() {
    return vertexShader;
}

export function getFragmentShader() {
    return fragmentShader;
}