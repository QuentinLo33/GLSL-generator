export class MixBlock {
    constructor(name, {
        inputA = "vPosition", // First input color/vector
        inputB = "vPosition", // Second input color/vector
        mode = "mix",         // Blend mode: darken, lighten, multiply, add, subtract, linear_light, mix
        factor = 0.5          // Blend factor (0 = only A, 1 = only B)
    } = {}) {
        this.name = name;
        this.inputA = inputA;
        this.inputB = inputB;
        this.mode = mode;
        this.factor = factor;
    }

    generateCodeGlobal() {
        const codeGlobal =
`
// =====================
// MIX GLOBAL FUNCTIONS
// =====================

// Blends two colors/vectors using different blending modes
vec3 mixModes(vec3 a, vec3 b, float factor, int mode){

    // Darken: takes the minimum of each channel
    if(mode == 0){ return mix(a, min(a,b), factor); }

    // Lighten: takes the maximum of each channel
    if(mode == 1){ return mix(a, max(a,b), factor); }

    // Multiply: multiplies the two colors
    if(mode == 2){ return mix(a, a * b, factor); }

    // Add: adds colors together and clamps to [0,1]
    if(mode == 3){ return mix(a, clamp(a + b, 0.0, 1.0), factor); }

    // Subtract: subtracts b from a
    if(mode == 4){ return mix(a, a - b, factor); }

    // Linear light: combines addition and subtraction for contrast effects
    if(mode == 5){ return mix(a, clamp(a + 2.0*b - 1.0, 0.0, 1.0), factor); }

    // Default: standard linear interpolation (lerp)
    return mix(a, b, factor);
}

`;
        return codeGlobal;
    }

    generateCodeMain() {

        // Factor can be either numeric or string (uniform/variable)
        const f = typeof this.factor === "string"
            ? this.factor
            : this.factor.toFixed(2);

        // Map string mode to integer for GLSL switch logic
        const modeMap = {
            "darken": 0,
            "lighten": 1,
            "multiply": 2,
            "add": 3,
            "subtract": 4,
            "linear_light": 5,
            "mix": 6
        };

        const modeInt = modeMap[this.mode] ?? 6;

        let codeMain =
`
    // =====================
    // MIX MAIN : ${this.name} (${this.mode})
    // =====================

    // Blend two inputs using the selected mode and factor
    vec3 ${this.name} = mixModes(
        ${this.inputA}, // First input
        ${this.inputB}, // Second input
        ${f},           // Blend factor
        ${modeInt}      // Mode selector
    );
    
`;
        return codeMain;
    }
}

/*
    const mix1 = new MixBlock("mix1", {
        inputA: "noise1",     // First texture/noise input
        inputB: "voronoi1",   // Second texture/noise input
        mode: "darken",       // Blend mode
        factor: 0.7           // Blend strength
    });
*/