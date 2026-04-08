export class WaveBlock {
    constructor(name, {
        input = "vPosition",   // Input position (usually world or object space coordinates)
        type = "sine",         // Wave function type: "sine", "triangle", or "saw"
        pattern = "bands",     // Pattern type: "bands" (linear) or "rings" (radial)
        axis = "X",            // Axis used for bands: "X", "Y", or "Z"
        scale = 1,             // Global scale applied to input coordinates
        distortion = 0,        // Amount of noise-based distortion applied to coordinates
        detail = 0,            // Number of additional wave octaves (fractal detail)
        detailScale = 1,       // Frequency multiplier between octaves
        detailRoughness = 0.5, // Amplitude falloff between octaves
        phase = 0              // Phase offset applied to the wave
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

    generateCodeGlobal() {
        let codeGlobal = 
`
// ===================== 
// WAVE GLOBAL FUNCTIONS
// ===================== 

// Converts a scalar input into a waveform based on the selected type
float waveFunc(float x, int type){

    // Sine wave (smooth periodic oscillation)
    if(type == 0) return sin(x);

    // Triangle wave (linear up/down pattern)
    else if(type == 1)
        return abs(fract(x / 6.2831853) * 2.0 - 1.0) * 2.0 - 1.0;

    // Sawtooth wave (linear ramp repeating every period)
    else if(type == 2)
        return fract(x / 6.2831853) * 2.0 - 1.0;

    // Default fallback
    return sin(x);
}

`;

        return codeGlobal;
    }

    generateCodeMain() {
        const s = this.scale.toFixed(2);
        const dist = this.distortion.toFixed(2);
        const d = this.detail;
        const dS = this.detailScale.toFixed(2);
        const dR = this.detailRoughness.toFixed(2);
        const phase = this.phase.toFixed(2);

        const typeIndex =
            this.type === "sine" ? 0 :
            this.type === "triangle" ? 1 : 2;

        let codeMain = 
    `
    // ===================== 
    // WAVE MAIN: ${this.name} (Pattern: ${this.pattern}, Type: ${this.type}, Axis: ${this.axis})
    // ===================== 
        
    vec3 ${this.name}_pos = ${this.input} * ${s};

    ${this.name}_pos += snoise(${this.input} * ${dist}) * ${dist};

    float ${this.name}_value = 0.0;

    ${this.pattern === "rings"
            ? `${this.name}_value = length(${this.name}_pos.xy);`
            : `${this.name}_value = ${
                this.axis === "X" ? `${this.name}_pos.x` :
                this.axis === "Y" ? `${this.name}_pos.y` :
                                    `${this.name}_pos.z`
            };`
        }

    ${this.name}_value = waveFunc(${this.name}_value + ${phase}, ${typeIndex});

    float ${this.name}_amp = 0.5;
    float ${this.name}_freq = 1.0;
    float ${this.name}_maxVal = 0.0;

    for(int i=0;i<${d};i++){
        ${this.name}_value += waveFunc(${this.name}_value * ${this.name}_freq, ${typeIndex}) * ${this.name}_amp;
        ${this.name}_maxVal += ${this.name}_amp;
        ${this.name}_amp *= ${dR};
        ${this.name}_freq *= ${dS};
    }

    vec3 ${this.name} = vec3(${this.name}_value);

    `;
        return codeMain;
    }
}
/*
    const wave = new WaveBlock("wave", {
        input: "mapping",
        type: "sine", // "sine", "triangle", "saw",           
        pattern: "bands", // "bands", "rings"
        axis: "X", // "X", "Y", "Z"
        scale: 20.0,
        distortion: 0,
        detail: 3,
        detailScale: 2.0,
        detailRoughness: 0.5,
        phase: 1.0
    });
*/