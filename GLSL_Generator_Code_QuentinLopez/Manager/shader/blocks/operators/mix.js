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

    generateCode() {
        const f = this.factor.toFixed(2);

        const globals =
`// MIX GLOBAL: ${this.name}, ${this.name} mode
vec3 mixModes(vec3 a, vec3 b, float factor, int mode){
    vec3 result = a;

    // Darken
    if(mode == 0){ result = min(a,b); }

    // Lighten                            
    else if(mode == 1){ result = max(a,b); }

    // Multiply
    else if(mode == 2){ result = a * b; }

    // Add                              
    else if(mode == 3){ result = a + b; }

    // Subtract                             
    else if(mode == 4){ result = a - b; }
    
    // Linear light
    else if(mode == 5){ result = clamp(a + 2.0 * b - 1.0, 0.0, 1.0);}

    // Default linear interpolation
    else { result = mix(a, b, factor); }  

    // Blend with factor
    return mix(a, result, factor);
}

`;

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
        const mainCode =
`    // MIX MAIN: ${this.name}, ${this.mode} mode
    vec3 ${this.name} = mixModes(${this.inputA}, ${this.inputB}, ${f}, ${modeInt});`;

        return { globals, mainCode };
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