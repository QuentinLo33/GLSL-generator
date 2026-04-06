export class WoodGrainBlock {
    constructor(name, {
        input = "vPosition", // Input position (world/object space coordinates)
        scale = 5.0,         // Controls the frequency of the wood rings (higher = tighter rings)
        distortion = 0.5,    // Strength of noise-based distortion applied to the grain
        noiseScale = 1.0      // Scale of the noise used for warping
    } = {}) {
        this.name = name;
        this.input = input;
        this.scale = scale;
        this.distortion = distortion;
        this.noiseScale = noiseScale;
    }

    generateCodeGlobal() {
        let codeGlobal =
`
// ===================== 
// WOOD GRAIN GLOBAL
// =====================
 
// Generates procedural wood grain based on sine waves + distorted noise
float getWoodGrain(vec3 pos, float scale, float distortion, float noiseScale) {
    
    // Stretch the position to bias noise direction
    // Y is exaggerated to create vertical variation
    vec3 pN = vec3(pos.x * 0.5, pos.y * 3.0, pos.z * 0.5);

    // Generate simplex noise used to warp the grain
    float nx = snoise(pN * noiseScale) * distortion;

    // Apply distortion only to the X axis
    // This creates wavy, irregular ring patterns
    float xWarped = pos.x + nx;

    // Generate repeating sine-based rings (wood growth rings)
    // 2π factor ensures proper periodicity
    float grain = sin(xWarped * scale * 6.2831853);

    // Remap from [-1,1] → [0,1] for usable output
    return grain * 0.5 + 0.5;
}

`;
        return codeGlobal;
    }

    generateCodeMain() {
        const s = this.scale.toFixed(2);
        const dist = this.distortion.toFixed(2);
        const ns = this.noiseScale.toFixed(2);

        let codeMain= `
    // ===================== 
    // WOOD GRAIN MAIN: ${this.name}
    // ===================== 

    // Evaluate the wood grain function using input position and parameters
    float ${this.name}_raw = getWoodGrain(
        ${this.input}, // Input position
        ${s},          // Scale (ring frequency)
        ${dist},       // Distortion strength
        ${ns}          // Noise scale for warping
    );

    // Convert scalar result into vec3 for shader compatibility
    vec3 ${this.name} = vec3(${this.name}_raw);

`;
        return codeMain;
    }
}

/*
    const woodGrain = new WoodGrainBlock("woodGrain", {
        input: "mapping",
        scale: 2.5,
        distortion: 2.0,
        noiseScale: 0.25
    });
*/