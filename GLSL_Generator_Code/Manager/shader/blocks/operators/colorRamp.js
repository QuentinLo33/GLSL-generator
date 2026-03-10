export class ColorRampBlock {
    constructor(name, {
        input = "vPosition",
        intervals = [],  // [[0,0.3],[0.3,0.6],[0.6,1]]
        values = [],     // [[0,0,0],[1,0,0],[1,1,1]]
        mode = "linear" // "linear", "constant", "smooth"
    } = {}) {
        this.name = name;
        this.input = input;
        this.intervals = intervals;
        this.values = values;
        this.mode = mode;
    }

    generateCode() {
        let globals =
`// COLOR RAMP GLOBAL: ${this.name}, ${this.mode} mode
vec3 apply_${this.name}(float inputVal) {
    vec3 outColor = vec3(0.0);\n`;
    

        for (let i = 0; i < this.intervals.length; i++) {
            const [minV, maxV] = this.intervals[i];
            const color = this.values[i];
            const prevColor = i === 0 ? [0,0,0] : this.values[i-1];
globals +=
`    
    // intervals: ${i}: input [${minV.toFixed(3)}, ${maxV.toFixed(3)}], output color [${color.map(v=>v.toFixed(3)).join(", ")}]\n`;
            if (this.mode === "linear") {
                globals +=
`    if (inputVal >= ${minV.toFixed(3)} && inputVal <= ${maxV.toFixed(3)}) {
        float t = clamp((inputVal - ${minV.toFixed(3)})/(${maxV.toFixed(3)}-${minV.toFixed(3)}),0.0,1.0);
        outColor = mix(vec3(${prevColor.map(v=>v.toFixed(3)).join(",")}), vec3(${color.map(v=>v.toFixed(3)).join(",")}), t);
    }\n`;
            } else if (this.mode === "constant") {
                globals +=
`    if(inputVal >= ${minV.toFixed(3)} && inputVal < ${maxV.toFixed(3)}) {
        outColor = vec3(${color.map(v=>v.toFixed(3)).join(",")});
    }\n`;
            } else if (this.mode === "smooth") {
                globals +=
`    if(inputVal >= ${minV.toFixed(3)} && inputVal <= ${maxV.toFixed(3)}) {
        float t = smoothstep(${minV.toFixed(3)}, ${maxV.toFixed(3)}, inputVal);
        outColor = mix(vec3(${prevColor.map(v=>v.toFixed(3)).join(",")}), vec3(${color.map(v=>v.toFixed(3)).join(",")}), t);
    }\n`;
            }
        }

        globals += `    return outColor;
}\n`;

        // Appel unique dans main()
        const mainCode =
`    // COLOR RAMP MAIN: ${this.name}, ${this.mode} mode
    float ${this.name}_input = ${this.input};
    vec3 ${this.name} = apply_${this.name}(${this.name}_input);

`;

        return { globals, mainCode };
    }
}

/*
    const ramp1 = new ColorRampBlock("ramp1",{
        input:"noise1.r",
        intervals:[[0,0.3],[0.3,0.6],[0.6,1.0]],
        values:[[0,0,0],[1,1,0],[1,1,1]],
        mode: linear
    });
*/