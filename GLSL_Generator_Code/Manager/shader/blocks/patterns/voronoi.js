export class VoronoiBlock {

    constructor(name, {
        input = "vPosition",   // Input coordinate (typically vertex/world position)
        scale = 1,             // Global scaling of the Voronoi pattern
        detail = 3,            // Number of octaves (layers of Voronoi noise)
        roughness = 0.5,       // Controls amplitude falloff per octave
        lacunarity = 2,        // Controls frequency increase per octave
        randomness = 1,        // Controls jitter/random offset of Voronoi cells
        mode = "F1",           // Voronoi output mode: "F1", "F2", "F2-F1", "F1+F2"
        metric = "euclidean"   // Distance metric used to compute cell distances
    } = {}) {

        this.name = name;
        this.input = input;  
        this.scale = scale;
        this.detail = detail;
        this.roughness = roughness;
        this.lacunarity = lacunarity;
        this.randomness = randomness;
        this.mode = mode.toUpperCase();
        this.metric = metric.toLowerCase();
    }

    generateCodeGlobal() {
        let codeGlobal = `
// ===================== 
// VORONOI GLOBAL FUNCTIONS
// =====================

// Hash function used to generate pseudo-random feature point positions per cell
vec3 hash33(vec3 p){
    p = fract(p * vec3(0.1031,0.11369,0.13787));
    p += dot(p, p.yxz + 19.19);
    return fract((p.xxy + p.yzz) * p.zyx);
}

// Computes the two closest feature distances (F1 and F2)
// by iterating over neighboring cells in a 3x3x3 grid
void voronoiDistances(vec3 x, float randomness, int metric, out float F1, out float F2){
    vec3 p = floor(x);   // Integer cell coordinate
    vec3 f = fract(x);   // Local position inside the cell

    // Initialize distances with large values
    F1 = 8.0;
    F2 = 8.0;

    // Loop through neighboring cells
    for(int k=-1;k<=1;k++)
    for(int j=-1;j<=1;j++)
    for(int i=-1;i<=1;i++){

        vec3 b = vec3(i,j,k); // Neighbor offset
        vec3 r = b - f + hash33(p+b) * randomness; // Vector to feature point

        float d;

        // Distance metric selection
        if(metric == 0){ d = dot(r,r); } // Euclidean squared distance
        else if(metric == 1){ d = abs(r.x)+abs(r.y)+abs(r.z); } // Manhattan distance
        else if(metric == 2){ d = max(max(abs(r.x),abs(r.y)),abs(r.z)); } // Chebyshev distance
        else if(metric == 3){ d = pow(pow(abs(r.x),4.0)+pow(abs(r.y),4.0)+pow(abs(r.z),4.0),0.25); } // Minkowski-like
        else { d = dot(r,r); }

        // Track the two smallest distances
        if(d < F1){ F2 = F1; F1 = d; }
        else if(d < F2){ F2 = d; }
    }

    // Convert squared distances back to linear distances if needed
    if(metric == 0 || metric == 3){
        F1 = pow(F1, (metric==0?0.5:0.25));
        F2 = pow(F2, (metric==0?0.5:0.25));
    }
}

// Main Voronoi function supporting multiple modes and octave accumulation
vec3 getVoronoi(vec3 pos, int detail, float scale, float roughness, float lacunarity, float randomness, int metric, int mode){
    vec3 p = pos * scale;

    float value = 0.0;       // Accumulated Voronoi value
    float amplitude = 0.5;   // Contribution weight per octave
    float frequency = 1.0;   // Frequency multiplier per octave
    float maxValue = 0.0;    // Used for normalization

    // Iterate through octaves
    for(int i=0;i<detail;i++){
        float F1,F2;

        // Compute closest feature distances at current frequency
        voronoiDistances(p*frequency, randomness, metric, F1, F2);

        float v = 0.0;

        // Select output mode
        if(mode == 0){ v = F1; }          // Distance to closest point
        else if(mode == 1){ v = F2; }     // Second closest point
        else if(mode == 2){ v = F2 - F1; } // Cell edge structure
        else if(mode == 3){ v = F1 + F2; } // Combined distance
        else { v = F1; }

        // Accumulate weighted contribution
        value += v * amplitude;
        maxValue += amplitude;

        // Update amplitude and frequency for next octave
        amplitude *= roughness;
        frequency *= lacunarity;
    }

    // Normalize result
    value /= maxValue;

    return vec3(value);
}

`;
        return codeGlobal;
    }

    generateCodeMain() {
        const s = this.scale.toFixed(2);
        const d = this.detail;
        const r = this.roughness.toFixed(2);
        const l = this.lacunarity.toFixed(2);
        const rand = this.randomness.toFixed(2);

        // Convert metric string to GLSL integer
        let metricIndex = 0;
        if(this.metric==="manhattan") metricIndex = 1;
        else if(this.metric==="chebyshev") metricIndex = 2;
        else if(this.metric==="minkowski") metricIndex = 3;

        // Convert mode string to GLSL integer
        // 0 = F1, 1 = F2, 2 = F2-F1, 3 = F1+F2
        let modeIndex = 0;
        if(this.mode==="F2") modeIndex = 1;
        else if(this.mode==="F2-F1") modeIndex = 2;
        else if(this.mode==="F1+F2") modeIndex = 3;

        let codeMain = `
    // ===================== 
    // VORONOI MAIN: ${this.name} (Metric: ${this.metric}, Mode: ${this.mode})
    // ===================== 
    
    // Evaluate Voronoi field with selected parameters
    vec3 ${this.name} = getVoronoi(
        ${this.input},  // Input position
        ${d},           // Octave count
        ${s},           // Scale
        ${r},           // Roughness
        ${l},           // Lacunarity
        ${rand},        // Randomness factor
        ${metricIndex}, // Distance metric selector
        ${modeIndex}    // Output mode selector
    );

`;

        return codeMain;
    }
}

/*
    const voronoi = new VoronoiBlock("voronoi", {
        input: "mapping",
        scale: 2,
        detail: 4,
        roughness: 1,
        lacunarity: 2,
        randomness: 1,
        mode: "F1", // "F1", "F2", "F2-F1", "F1+F2"
        metric: "euclidean" // "euclidean", "manhattan", "chebychev", "minkowski"
    });
*/