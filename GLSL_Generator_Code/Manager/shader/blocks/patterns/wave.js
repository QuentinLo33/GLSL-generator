export class WaveBlock {
    constructor(name, {
        input = "vPosition",       // variable d'entrée
        type = "sine",             // sine / triangle / saw
        pattern = "bands",         // bands / rings
        axis = "X",                // X, Y ou Z
        scale = 1,
        distortion = 0,
        detail = 0,
        detailScale = 1,
        detailRoughness = 0.5,
        phase = 0
    } = {}) {
        this.name = name;
        this.input = input;
        this.type = type.toLowerCase();
        this.pattern = pattern.toLowerCase();
        this.axis = axis.toUpperCase();
        this.scale = scale;
        this.distortion = distortion;
        this.detail = detail;
        this.detailScale = detailScale;
        this.detailRoughness = detailRoughness;
        this.phase = phase;
    }

    generateCode() {
        const s = this.scale.toFixed(2);
        const dist = this.distortion.toFixed(2);
        const d = this.detail;
        const dS = this.detailScale.toFixed(2);
        const dR = this.detailRoughness.toFixed(2);
        const phase = this.phase.toFixed(2);

        const globals = `
// WAVE GLOBAL:
float waveFunc(float x, int type){
    // Sin
    if(type == 0) return sin(x);

    // Triangle
    else if(type == 1) return abs(fract(x / 6.2831853) * 2.0 - 1.0) * 2.0 - 1.0;
    
    // Saw
    else if(type == 2) return fract(x / 6.2831853) * 2.0 - 1.0; // saw
    return sin(x);
}
`;

        // type GLSL index : 0=sine,1=triangle,2=saw
        const typeIndex = this.type === "sine" ? 0 : this.type === "triangle" ? 1 : 2;

        // choisir la composante selon l'axe
        const axisComp = this.axis === "X" ? "pos.x" : this.axis === "Y" ? "pos.y" : "pos.z";

const prefix = this.name + "_";

const mainCode = 
`
    vec3 ${prefix}pos = ${this.input} * ${s};
    ${prefix}pos += snoise(${this.input} * ${dist}) * ${dist};
    float ${prefix}value = 0.0;

    ${this.pattern === "rings" ? `${prefix}value = length(${prefix}pos.xy);` : `${prefix}value = ${this.axis === "X" ? `${prefix}pos.x` : this.axis === "Y" ? `${prefix}pos.y` : `${prefix}pos.z`};`}

    ${prefix}value = waveFunc(${prefix}value + ${phase}, ${typeIndex});

    float ${prefix}amp = 0.5;
    float ${prefix}freq = 1.0;
    float ${prefix}maxVal = 0.0;
    for(int i=0;i<${d};i++){
        ${prefix}value += waveFunc(${prefix}value * ${prefix}freq, ${typeIndex}) * ${prefix}amp;
        ${prefix}maxVal += ${prefix}amp;
        ${prefix}amp *= ${dR};
        ${prefix}freq *= ${dS};
    }

    vec3 ${this.name} = vec3(${prefix}value);

    `;

        return { globals, mainCode };
    }
}

/*
    const wave1 = new WaveBlock("wave1", {
        input: "mapping1",
        type: "sine",
        pattern: "bands",
        axis: "Y",
        scale: 10.0,
        distortion: 0.5,
        detail: 3,
        detailScale: 2.0,
        detailRoughness: 0.5,
        phase: 1.0
    });
*/