export class NoiseBlock {
    constructor(name, {
        input = "vPosition",   // Input coordinate attribute used as the base position for noise
        scale = 1,             // Overall scaling of the noise (higher = more zoomed-in noise)
        detail = 3,            // Number of octaves (layers of noise)
        roughness = 0.5,       // Controls amplitude decrease per octave
        lacunarity = 2,        // Controls frequency increase per octave
        distortion = 0,        // Secondary noise used to slightly distort the coordinates
        normalized = false,    // Whether to normalize output to [0,1]
        mode = "fBm"           // Noise type: "fBm" or "heteroTerrain"
    } = {}) {
        this.name = name;
        this.input = input;
        this.scale = scale;
        this.detail = detail;
        this.roughness = roughness;
        this.lacunarity = lacunarity;
        this.distortion = distortion;
        this.normalized = normalized;
        this.mode = mode;
    }

    generateCodeGlobal() {
        let codeGlobal =
`
// ===================== 
// NOISE GLOBAL
// =====================

// Hash/mod functions used by simplex noise
vec3 mod289(vec3 x){return x - floor(x/289.0)*289.0;}
vec4 mod289(vec4 x){return x - floor(x/289.0)*289.0;}

// Permutation function used to generate pseudo-random gradients
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}

// Fast inverse square root approximation used in normalization
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314*r;}

// 3D simplex noise function
float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);

    // Determine simplex cell
    vec3 i  = floor(v + dot(v,C.yyy));
    vec3 x0 = v - i + dot(i,C.xxx);

    // Determine ordering of coordinates
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;

    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    // Offsets for the simplex corners
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - 0.5;

    // Permutations for gradient selection
    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0,i1.z,i2.z,1.0))
      + i.y + vec4(0.0,i1.y,i2.y,1.0))
      + i.x + vec4(0.0,i1.x,i2.x,1.0));

    // Generate gradients
    vec4 j  = p - 49.0*floor(p/49.0);
    vec4 x_ = floor(j/7.0);
    vec4 y_ = floor(j - 7.0*x_);

    vec4 x  = (x_*2.0+0.5)/7.0 - 1.0;
    vec4 y  = (y_*2.0+0.5)/7.0 - 1.0;

    vec4 h  = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0+1.0;
    vec4 s1 = floor(b1)*2.0+1.0;

    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    // Gradient vectors
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    // Normalize gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;

    // Compute contributions from each corner
    vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
    m=m*m;

    // Final noise value
    return 42.0*dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}


// fBm (Fractal Brownian Motion)
// Combines multiple octaves of simplex noise
// Each octave increases frequency and decreases amplitude
// Produces smooth, natural-looking patterns (clouds, terrain, etc.)
vec3 getNoise_fBm(vec3 pos, int detail, float scale, float roughness, float lacunarity, float distortion, bool normalized){
    vec3 p = pos * scale;

    float value = 0.0;   // Accumulated noise value
    float amp   = 0.5;   // Amplitude of current octave
    float freq  = 1.0;    // Frequency of current octave
    float maxV  = 0.0;    // Used for normalization

    // Iterate over octaves
    for(int i=0;i<detail;i++){
        float n = snoise(p*freq); // Sample noise at current frequency
        value += n * amp;

        maxV  += amp;

        amp   *= roughness;   // Reduce amplitude each octave
        freq  *= lacunarity;  // Increase frequency each octave
    }

    // Normalize result to [-1,1] range
    value /= maxV;

    // Optionally remap to [0,1]
    if(normalized) value = value*0.5+0.5;

    // Add subtle coordinate distortion for extra variation
    value += snoise(pos*distortion)*0.1;

    return vec3(value);
}


// Hetero Terrain Noise
// Similar to fBm but each octave is multiplied by the previous value
// This creates sharper terrain features and more realistic landscapes
vec3 getNoise_heteroTerrain(vec3 pos, int detail, float scale, float roughness, float lacunarity, float distortion, bool normalized){
    vec3 p   = pos * scale;

    float freq  = 1.0;
    float amp   = roughness;

    // Base octave
    float value = snoise(p) * 0.5 + 0.5;

    // Accumulate higher octaves
    for(int i=1;i<detail;i++){
        freq  *= lacunarity;
        amp   *= roughness;

        // Each octave is influenced by the current accumulated value
        float increment = (snoise(p*freq)*0.5+0.5) * amp * value;
        value += increment;
    }

    // Clamp to valid range
    value = clamp(value, 0.0, 1.0);

    // Optionally remap back to [-1,1]
    if(!normalized) value = value*2.0-1.0;

    // Add small distortion for extra detail variation
    value += snoise(pos*distortion)*0.05;

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
        const dist = this.distortion.toFixed(2);

        // Map selected mode to the corresponding GLSL function
        const fnMap = {
            "fBm":           "getNoise_fBm",
            "heteroTerrain": "getNoise_heteroTerrain",
        };

        const fn = fnMap[this.mode] ?? "getNoise_fBm";

        let codeMain =
`   
    // ===================== 
    // NOISE MAIN: ${this.name} (${this.mode})
    // ===================== 
    
    // Call the selected noise function with configured parameters
    vec3 ${this.name} = ${fn}(
        ${this.input},   // Input position
        ${d},            // Number of octaves
        ${s},            // Scale
        ${r},            // Roughness
        ${l},            // Lacunarity
        ${dist},         // Distortion strength
        ${this.normalized ? "true" : "false"} // Normalization flag
    );

`;
        return codeMain;
    }
}

/*
    const noise = new NoiseBlock("noise", {
        inputA: "mapping",
        scale:8,
        detail:8,
        roughness: 0.6,
        lacunatrity:3,
        distortion:0,
        normalized:true,
        mode: "fBm"  // "fBm", "heteroTerrain"
    });
*/