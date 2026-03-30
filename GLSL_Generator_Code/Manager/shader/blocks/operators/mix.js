export class MixBlock {
    constructor(name, {
        inputA = "vPosition",
        inputB = "vPosition",
        mode = "mix", // darken, lighten, multiply, add, subtract, linear_light, mix
        factor = 0.5
    } = {}) {
        this.name = name;
        this.inputA = inputA;
        this.inputB = inputB;
        this.mode = mode;
        this.factor = factor;
    }
    generateCodeGlobal() {
        const codeGlobal =
`// MIX GLOBAL:
vec3 mixModes(vec3 a, vec3 b, float factor, int mode){
    if(mode == 0){ return mix(a, min(a,b), factor); }   // darken
    if(mode == 1){ return mix(a, max(a,b), factor); }   // lighten
    if(mode == 2){ return mix(a, a * b, factor); }      // multiply
    if(mode == 3){ return clamp(mix(a, a + b, factor), 0.0, 1.0); } // add
    if(mode == 4){ return mix(a, a - b, factor); }      // subtract
    if(mode == 5){ return mix(a, clamp(a + 2.0*b - 1.0, 0.0, 1.0), factor); } // linear light
    return mix(a, b, factor); // default: mix
}

`;
        return codeGlobal;
    }

    generateCodeMain() {
        const f = typeof this.factor === "string"
            ? this.factor
            : this.factor.toFixed(2);


        // map string mode -> int
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

        // mainCode
        let codeMain =
`    // MIX MAIN: ${this.name}, ${this.mode} mode
    vec3 ${this.name} = mixModes(${this.inputA}, ${this.inputB}, ${f}, ${modeInt});
    
`;
        return codeMain;
    }
}

/*
    const mix1 = new MixBlock("mix1", {
        inputA: "noise1",
        inputB: "voronoi1",
        mode: "darken",
        factor: 0.7
    });
*/