/*
3D Simplex Noise implementation based on:

Stefan Gustavson
"Simplex Noise Demystified", 2005

GLSL implementation adapted from:
Ashima Arts / Stefan Gustavson
https://stegu.github.io/webgl-noise/

Related publication:
McEwan et al., "Efficient Computational Noise in GLSL", 2012

Original algorithm by Ken Perlin (2001).
*/

export class NoiseBlock {
    constructor(name, {
            input = "vPosition",
            scale = 1,
            detail = 3,
            roughness = 0.5,
            lacunarity = 2,
            distortion = 0,
            normalized = false 
        } = {}) {
        this.name = name;
        this.input = input,
        this.scale = scale;
        this.detail = detail;
        this.roughness = roughness;
        this.lacunarity = lacunarity;
        this.distortion = distortion;
        this.normalized = normalized;
    }

    generateCode() {
        const s = this.scale.toFixed(2);
        const d = this.detail;
        const r = this.roughness.toFixed(2);
        const l = this.lacunarity.toFixed(2);
        const dist = this.distortion.toFixed(2);
        const normalizeCode = this.normalized
            ? `
        float n = snoise(p*freq);
        n = n * 0.5 + 0.5;
        total += vec3(n) * amp;
      `
            : `
        total += vec3(snoise(p*freq)) * amp;
      `;
        // === globals ===
        const globals = 
`// NOISE GLOBAL:
// Simplex / Perlin noise 3D
vec3 mod289(vec3 x){return x - floor(x/289.0)*289.0;}
vec4 mod289(vec4 x){return x - floor(x/289.0)*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314*r;}
float snoise(vec3 v){
    // Skewing factors for simplex grid 
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);

    // Determine simplex cell
    vec3 i = floor(v + dot(v,C.yyy));
    vec3 x0 = v - i + dot(i,C.xxx);

    // Determine simplex corner offsets
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    // Offsets for remaining corners
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - 0.5;

    // Wrap indices to avoid overflow
    i = mod289(i);

    // Generate permutations for gradient lookup
    vec4 p = permute(permute(permute(i.z + vec4(0.0,i1.z,i2.z,1.0))
                + i.y + vec4(0.0,i1.y,i2.y,1.0))
                + i.x + vec4(0.0,i1.x,i2.x,1.0));
    vec3 ns = vec3(0.0);

    // Compute gradient indices
    vec4 j = p - 49.0 * floor(p / 49.0);

    vec4 x_ = floor(j / 7.0);
    vec4 y_ = floor(j - 7.0 * x_);

    // Map gradients to unit cube
    vec4 x = (x_*2.0+0.5)/7.0 - 1.0;
    vec4 y = (y_*2.0+0.5)/7.0 - 1.0;

    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0+1.0;
    vec4 s1 = floor(b1)*2.0+1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    // Final gradient vectors
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    // Normalize gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Compute contribution from each corner
    vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
    m = m*m;
    return 42.0*dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

vec3 getNoise(vec3 pos, int detail, float scale, float roughness, float lacunarity, float distortion, bool normalized){
    vec3 p = pos * scale;
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    float maxValue = 0.0;

    for(int i=0;i<detail;i++){
        float n = snoise(p * frequency);
        value += n * amplitude;
        maxValue += amplitude;
        amplitude *= roughness;
        frequency *= lacunarity;
    }

    value /= maxValue;
    
    if (normalized) {
        value = value * 0.5 + 0.5;
    }
    
    value += snoise(pos * distortion) * 0.1;
    return vec3(value);
}
        
`;

        // === mainCode ===
const mainCode = 
`    // NOISE MAIN: ${this.name}, normalized: ${this.normalized}
    vec3 ${this.name} = getNoise(${this.input}, ${d}, ${s}, ${r}, ${l}, ${dist}, ${this.normalized ? "true" : "false"});

`;
        return { globals, mainCode };
    }
}

/*
    const noise1 = new NoiseBlock("noise1", {
        input:"mapping1",
        scale:2,
        detail:8,
        roughness: 0.5,
        lacunatrity:2,
        distortion:0,
        normalized:true
    });
*/
