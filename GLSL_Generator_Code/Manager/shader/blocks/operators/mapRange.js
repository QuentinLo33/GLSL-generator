export class MapRange {
    constructor(name, {
        input = "vPosition",
        fromMin = 0,
        fromMax = 1,
        toMin = 0,
        toMax = 1,
        mode = "linear", // linear, stepped, smoothstep, smootherstep, step
    } = {}) {
        this.name = name;
        this.input = input;
        this.fromMin = fromMin;
        this.fromMax = fromMax;
        this.toMin = toMin;
        this.toMax = toMax;
        this.mode = mode;
    }

generateCodeGlobal () {
    let codeGlobal =
`
// =====================
// MAP RANGE GLOBAL
// =====================

float mapRange(float value, float inMin, float inMax, float outMin, float outMax){
    float t = (value - inMin) / (inMax - inMin);
    return mix(outMin, outMax, t);
}

float smootherstep(float edge0, float edge1, float x){
    x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return x*x*x*(x*(x*6.0 - 15.0) + 10.0);
}

`;
    return codeGlobal;
}


generateCodeMain () {
    const fromMin = this.fromMin.toFixed(3);
    const fromMax = this.fromMax.toFixed(3);
    const toMin = this.toMin.toFixed(3);
    const toMax = this.toMax.toFixed(3);

    let mapped;

    if (this.mode === "smoothstep") {
        mapped = `mix(${toMin}, ${toMax}, smoothstep(${fromMin}, ${fromMax}, ${this.input}))`;
    }

    else if (this.mode === "smootherstep") {
        mapped = `mix(${toMin}, ${toMax}, smootherstep(${fromMin}, ${fromMax}, ${this.input}))`;
    }

    else if (this.mode === "step") {
        mapped = `step(${fromMin}, ${this.input})`;
    }

    else if (this.mode === "stepped") {
        mapped = `floor(mapRange(${this.input}, ${fromMin}, ${fromMax}, ${toMin}, ${toMax}))`;
    }
    else { // linear
        mapped = `mapRange(${this.input}, ${fromMin}, ${fromMax}, ${toMin}, ${toMax})`;
    }

    let codeMain =
`   
    // =====================    
    // MAP RANGE MAIN: ${this.name} (${this.mode})
    // =====================

    vec3 ${this.name} = vec3(${mapped});

`;
    return codeMain;
}
}

/*   const wavesRemap = new MapRange("wavesRemap", {
        input: "mixWaves.r",
        fromMin: 0.3,
        fromMax: 1.0,
        toMin: 0.0,
        toMax: 1.0,
        mode: "smoothstep"
    });
*/