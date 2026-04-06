export class BumpMultiplierBlock {
    constructor(name, {
        input = "vPosition", // Input vector to be scaled (typically position or a normal/noise vector)
        factor = 1.0         // Multiplier applied to the input (controls bump intensity)
    } = {}) {
        this.name = name;
        this.input = input;
        this.factor = factor;
    }
    
    generateCodeGlobal() {
        // No global GLSL functions required for this block
        return "";
    } 

    generateCodeMain() {
        let codeMain =
`
    // =====================
    // BUMP MULTIPLIER MAIN: ${this.name}
    // =====================

    // Scale the input vector by a constant factor
    // This is typically used to amplify or reduce bump/normal-related data
    vec3 ${this.name} = ${this.input} * ${this.factor.toFixed(2)};
    
`;
        return codeMain;
    }
}

/*
    const bump1 = new BumpMultiplierBlock("bump1", {
        input: "noise1", // Input vector (e.g., noise output)
        factor: 2        // Strength of the bump effect
    });
*/