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

        // Map wave type to integer:
        // 0 = sine, 1 = triangle, 2 = saw
        const typeIndex =
            this.type === "sine" ? 0 :
            this.type === "triangle" ? 1 : 2;

        // Select axis component used for band generation
        // (X, Y, or Z coordinate of the input position)
        const axisComp =
            this.axis === "X" ? "pos.x" :
            this.axis === "Y" ? "pos.y" : "pos.z";

        // Prefix used to avoid naming conflicts in GLSL
        const prefix = this.name + "_";

        let codeMain = 
`
    // ===================== 
    // WAVE MAIN: ${this.name} (Pattern: ${this.pattern}, Type: ${this.type}, Axis: ${this.axis})
    // ===================== 
    
    // Apply global scaling to input position
    vec3 ${prefix}pos = ${this.input} * ${s};

    // Apply optional distortion using noise
    ${prefix}pos += snoise(${this.input} * ${dist}) * ${dist};

    float ${prefix}value = 0.0;

    // Pattern selection
    // Bands: use a single axis component
    // Rings: use radial distance in XY plane
    ${this.pattern === "rings"
        ? `${prefix}value = length(${prefix}pos.xy);`
        : `${prefix}value = ${axisComp};`
    }

    // Apply wave function with phase offset
    ${prefix}value = waveFunc(${prefix}value + ${phase}, ${typeIndex});

    // Fractal detail (multi-octave wave)
    float ${prefix}amp = 0.5;    // Initial amplitude
    float ${prefix}freq = 1.0;   // Initial frequency
    float ${prefix}maxVal = 0.0; // Normalization accumulator

    for(int i=0;i<${d};i++){
        // Add additional wave layers for more complexity
        ${prefix}value += waveFunc(${prefix}value * ${prefix}freq, ${typeIndex}) * ${prefix}amp;

        ${prefix}maxVal += ${prefix}amp;

        // Update amplitude and frequency for next octave
        ${prefix}amp *= ${dR};
        ${prefix}freq *= ${dS};
    }

    // Final output as a single float stored in a vec3
    vec3 ${this.name} = vec3(${prefix}value);

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