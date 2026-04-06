import * as THREE from "three";
import { getAmbientInputColor, getEnvColors } from "../ui";
import { NoiseBlock } from "./blocks/patterns/noise";
import { colorRampGlobalCode } from "./blocks/operators/colorRampGlobal";


// Convert hex color (#RGB / #RRGGBB / #RRGGBBAA) to GLSL vec3 string
function hexToVec3(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(c => c+c).join("");
    if (hex.length === 8) hex = hex.slice(0, 6); // ignore alpha
    const r = (parseInt(hex.slice(0,2), 16) / 255).toFixed(3);
    const g = (parseInt(hex.slice(2,4), 16) / 255).toFixed(3);
    const b = (parseInt(hex.slice(4,6), 16) / 255).toFixed(3);
    return `vec3(${r}, ${g}, ${b})`;
}

// Resolve a connection value into valid GLSL
function resolveConnection(value) {
    if (typeof value === "number") return value.toFixed(3); // number → float
    if (typeof value === "string" && value.startsWith("#")) return hexToVec3(value); // string hex → convert to GLSL vec3
    return value;
}

// Shared shader strings (used for preview/export)
export let vertexShader="";
export let fragmentShader="";

let fragmentMain ="";
let fragmentGlobal;


// ShaderGraph builds a full GLSL shader from modular blocks.
// It separates global code (functions) and main logic,
// and supports live updates from UI parameters.
export class ShaderGraph {
    constructor(blocks = [], outputVar = "finalColor") {
        this.blocks = blocks;
        this.outputVar = outputVar;

        // Vertex shader is static → generated once
        this.generateVertex();
    }

    // FullUpdate = false → skip fragment global recomputation
    generateShaderStrings(fullUptate = true) {
        if (fullUptate)
        {
            this.generateFragmentGlobal();
        }
        this.generateFragmentMain();
        this.generateFullFragment();
        return { vertexShader, fragmentShader };
    }

    // Assemble the fragment shader
    generateFullFragment() {
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

// Lighting uniforms
uniform vec3 uLightColor;
uniform vec3 uLightPos;
uniform vec3 uCameraPos;
uniform vec3 uAmbientColor;

// Fake environment lighting
uniform vec3 uEnvLight;
uniform vec3 uEnvFill;
uniform vec3 uEnvGround;

// Global functions (noise, ramps, etc.)
${fragmentGlobal}

void main() {

${fragmentMain}

    // Final normal (with optional bump)
    vec3 N = normalize(vNormal + finalBump * 0.15);

    vec3 V = normalize(-vViewPosition);
    vec3 lightPosView = (viewMatrix * vec4(uLightPos, 1.0)).xyz;
    vec3 L = normalize(lightPosView - vViewPosition);
    vec3 H = normalize(L + V); 
    vec3 R = reflect(-V, N);

    float NdotL = max(dot(N, L), 0.0);
    float NdotH = max(dot(N, H), 0.0);
    float NdotV = max(dot(N, V), 0.0);

    // Fresnel (Schlick approximation)
    float fresnel = 0.5 + 0.5 * pow(1.0 - NdotV, 3.0);

    // Fake environment lighting (3-point studio)
    float upness    = R.y * 0.5 + 0.5;
    float sideness  = abs(R.x) * 0.5 + 0.5;

    vec3 envColor = mix(uEnvGround, uEnvLight, upness);
    envColor      = mix(envColor,  uEnvFill,  sideness * (1.0 - upness));

    vec3 envReflect = envColor * finalColor * fresnel * finalMetallic * 2.0;  

    // Specular (Blinn-Phong style)
    float shininess = mix(32.0, 512.0, 1.0 - finalRoughness);
    float spec = pow(NdotH, shininess);
    vec3 specular = finalColor * spec * 1.5;

    // Diffuse
    vec3 diffuse = finalColor * NdotL * (1.0 - finalMetallic * 0.9);

    // Ambient
    vec3 ambient = uAmbientColor * finalColor * 0.15;

    gl_FragColor = vec4(ambient + diffuse + specular + envReflect, 1.0);
}
`;
    }

    // Static vertex shader
    generateVertex() {
        vertexShader = `
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
        return vertexShader;
    }

    // Generate shared GLSL functions (once per shader) & Avoid duplications
    generateFragmentGlobal() {
        fragmentGlobal = "";
        const globalsSet = new Set();

        // Inject noise only if required
        const needsSnoiseBlocks = ["WaveBlock", "WoodGrainBlock"];
        const hasBlockNeedingSnoise = this.blocks.some(b => needsSnoiseBlocks.includes(b.constructor.name));
        const hasNoiseBlock = this.blocks.some(b => b.constructor.name === "NoiseBlock");

        if (hasBlockNeedingSnoise && !hasNoiseBlock) {
            const tmpNoise = new NoiseBlock("_tmp", { normalized: false });
            const tmpCode = tmpNoise.generateCodeGlobal();
            globalsSet.add(tmpCode);
            fragmentGlobal += tmpCode + "\n";
        } else if (hasBlockNeedingSnoise) {
            const firstNoise = this.blocks.find(b => b.constructor.name === "NoiseBlock");
            if (firstNoise) {
                const noiseCode = firstNoise.generateCodeGlobal();
                globalsSet.add(noiseCode);
                fragmentGlobal += noiseCode + "\n";
            }
        }

        // Shared ColorRamp system (batched uniforms)
        const colorRamps = this.blocks.filter(b => b.constructor.name === "ColorRampBlock");
        if (colorRamps.length > 0) {
            const maxStops = Math.max(...colorRamps.map(b => b.positions.length));
            if (maxStops > 0) {
                colorRamps.forEach((b, i) => b.instanceId = i);
                fragmentGlobal += colorRampGlobalCode(colorRamps.length, maxStops);
            }
        }

        // Other blocks
        for (const block of this.blocks) {
            if (block.constructor.name === "ColorRampBlock") continue;

            const code = block.generateCodeGlobal();
            if (code && !globalsSet.has(code)) {
                globalsSet.add(code);
                fragmentGlobal += code;
            }
        }
    }


    // Generate fragment main -> call the functions
    generateFragmentMain() {
        fragmentMain = "";
        let connectionBlock = null;

        for (const block of this.blocks) {
            fragmentMain += block.generateCodeMain();
            if (block.constructor.name === "ConnectionBlock") connectionBlock = block;
        }

        // Resolve final outputs
        if (connectionBlock) {
            const connections = connectionBlock.connections || {};
            const colorVar     = resolveConnection(connections.color     || "vec3(1.0)");
            const bumpVar      = resolveConnection(connections.bump      || "vec3(0.0)");
            const roughnessRaw = resolveConnection(connections.roughness || "0.5");
            const metallicRaw  = resolveConnection(connections.metallic  || "0.0");

            const isNumber = (v) => !isNaN(parseFloat(v)) && isFinite(v);
            const roughnessVar = isNumber(roughnessRaw) ? roughnessRaw : roughnessRaw + ".r";
            const metallicVar  = isNumber(metallicRaw)  ? metallicRaw  : metallicRaw  + ".r";

            fragmentMain +=
`    // Final material outputs
    vec3 finalColor = ${colorVar};
    vec3 finalBump = ${bumpVar};
    float finalRoughness = ${roughnessVar};
    float finalMetallic = ${metallicVar};
    `;
        }
        else {
            // Fallback: last block output
            fragmentMain +=
`    vec3 finalColor = ${this.blocks[this.blocks.length - 1].name};
    vec3 finalBump = vec3(0.0);
    float finalRoughness = 0.5;
    float finalMetallic = 0.0;
    `;
        }
    }
    
    // Create Three.js ShaderMaterial from graph
    createMaterial(camera, light) {
        const { vertexShader, fragmentShader } = this.generateShaderStrings();
        const { envLight, envFill, envGround } = getEnvColors();

        // Pack all color ramps into flat arrays
        const colorRamps = this.blocks.filter(b => b.constructor.name === "ColorRampBlock");
        const maxStops   = colorRamps.length > 0 ? Math.max(...colorRamps.map(b => b.positions.length)) : 1;
        const total      = colorRamps.length * maxStops;
        const modeMap    = { linear: 0, smooth: 1, constant: 2 };

        const posArr    = new Float32Array(total);
        const colorArr  = new Float32Array(total * 3);
        const countArr  = new Int32Array(colorRamps.length);
        const modeArr   = new Int32Array(colorRamps.length);

        colorRamps.forEach((ramp, i) => {
            const offset = i * maxStops;
            countArr[i]  = ramp.positions.length;
            modeArr[i]   = modeMap[ramp.mode] ?? 0;

            ramp.positions.forEach((p, j) => posArr[offset + j] = p);
            ramp.colors.forEach((c, j) => {
                colorArr[(offset + j) * 3 + 0] = c[0] / 255;
                colorArr[(offset + j) * 3 + 1] = c[1] / 255;
                colorArr[(offset + j) * 3 + 2] = c[2] / 255;
            });
        });

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uLightColor:    { value: new THREE.Color(1, 1, 1) },
                uLightPos:      { value: new THREE.Vector3(3, 3, 2) },
                uCameraPos:     { value: camera.position.clone() },
                uAmbientColor:  { value: getAmbientInputColor() },
                uEnvLight:      { value: envLight.clone() },
                uEnvFill:       { value: envFill.clone() },
                uEnvGround:     { value: envGround.clone() },

                // Color ramp packed uniforms
                ramp_count:     { value: countArr },
                ramp_mode:      { value: modeArr },
                ramp_positions: { value: posArr },
                ramp_colors:    { value: colorArr },
            },
            extensions: { derivatives: true }
        });

        this._material = material;
        return material;
    }

    // Update parameters from UI: modifies block values, regenerates main fragment shader & recompilation
    updateParam(targets, value) {
        for (const { block: blockName, prop, transform, index } of targets) {
            const block = this.blocks.find(b => b.name === blockName);
            if (!block) continue;

            const finalValue = transform ? transform(value) : value;

            if (index !== undefined) {
                block[prop][index] = finalValue;
            } else {
                block[prop] = finalValue;
            }
        }

        // Update GPU uniforms for color ramps only (no recompilation needed here)
        this._updateColorRampUniforms();

        // Regenerate shader (without global)
        this.generateShaderStrings(false);

        if (this._material) {
            this._material.fragmentShader = fragmentShader;
            this._material.needsUpdate = true; // forces GPU recompilation
        }
    }

    // Update color ramp uniforms without rebuilding shader
    _updateColorRampUniforms() {
        if (!this._material) return;

        const colorRamps = this.blocks.filter(b => b.constructor.name === "ColorRampBlock");
        if (colorRamps.length === 0) return;

        const maxStops = Math.max(...colorRamps.map(b => b.positions.length));
        const total    = colorRamps.length * maxStops;

        const colorArr = new Float32Array(total * 3);

        colorRamps.forEach((ramp, i) => {
            const offset = i * maxStops;
            ramp.colors.forEach((c, j) => {
                colorArr[(offset + j) * 3 + 0] = c[0] / 255;
                colorArr[(offset + j) * 3 + 1] = c[1] / 255;
                colorArr[(offset + j) * 3 + 2] = c[2] / 255;
            });
        });

        this._material.uniforms.ramp_colors.value = colorArr;
    }
}

// For the code preview
export function getVertexShader() { return vertexShader; }
export function getFragmentShader() { return fragmentShader; }