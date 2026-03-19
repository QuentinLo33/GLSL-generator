export class VoronoiBlock {

    constructor(name, {
        input = "vPosition",
        scale = 1,
        detail = 3,
        roughness = 0.5,
        lacunarity = 2,
        randomness = 1,
        metric = "euclidean"  // "euclidean", "manhattan", "chebychev", "minkowski"
    } = {}) {

        this.name = name;
        this.input = input;  
        this.scale = scale;
        this.detail = detail;
        this.roughness = roughness;
        this.lacunarity = lacunarity;
        this.randomness = randomness;
        this.metric = metric.toLowerCase();
    }

    generateCode() {

        const s = this.scale.toFixed(2);
        const d = this.detail;
        const r = this.roughness.toFixed(2);
        const l = this.lacunarity.toFixed(2);
        const rand = this.randomness.toFixed(2);
        const metricStr = `"${this.metric}"`;

        const globals = `
// VORONOI GLOBALS: ${this.name}, metric ${this.metric}
// Hash function: generates a pseudo-random vector based on input position
vec3 hash33(vec3 p){
    p = fract(p * vec3(0.1031,0.11369,0.13787));
    p += dot(p, p.yxz + 19.19);
    return fract((p.xxy + p.yzz) * p.zyx);
}

// Single 3D Voronoi cell distance with metric
float voronoi(vec3 x, float randomness, int metric){
    vec3 p = floor(x);
    vec3 f = fract(x);

    float res = 8.0;

    for(int k=-1; k<=1; k++)
    for(int j=-1; j<=1; j++)
    for(int i=-1; i<=1; i++){
        vec3 b = vec3(i,j,k);
        vec3 r = b - f + hash33(p + b) * randomness;

        float d;
         // Euclidean
        if(metric == 0) {         
            d = dot(r,r);

        // Manhattan
        } else if(metric == 1) {   
            d = abs(r.x) + abs(r.y) + abs(r.z);
        
        // Chebyshev
        } else if(metric == 2) {
            d = max(max(abs(r.x), abs(r.y)), abs(r.z));
            
        // Minkowski p=4 (example)
        } else if(metric == 3) {  
            d = pow(pow(abs(r.x),4.0)+pow(abs(r.y),4.0)+pow(abs(r.z),4.0), 0.25);

        // default to Euclidean
        } else {
            d = dot(r,r);          
        }

        res = min(res, d);
    }

    // For Euclidean and Minkowski we return sqrt, for Manhattan and Chebyshev we can return raw
    if(metric == 0 || metric == 3) return pow(res, (metric == 0 ? 0.5 : 0.25));
    return res;
}

// Fractal 3D Voronoi noise with multiple octaves
vec3 getVoronoi(vec3 pos, int detail, float scale, float roughness, float lacunarity, float randomness, int metric){
    vec3 p = pos * scale;

    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    float maxValue = 0.0;

    for(int i=0; i<detail; i++){
        float v = voronoi(p * frequency, randomness, metric);
        value += v * amplitude;
        maxValue += amplitude;
        amplitude *= roughness;
        frequency *= lacunarity;
    }

    value /= maxValue;
    return vec3(value);
}
`;

        // Map metric string to GLSL integer: 0=euclidean, 1=manhattan, 2=chebyshev, 3=minkowski
        let metricIndex = 0;
        if(this.metric === "manhattan") metricIndex = 1;
        else if(this.metric === "chebyshev") metricIndex = 2;
        else if(this.metric === "minkowski") metricIndex = 3;

        const mainCode =
`//  VORONOI MAIN: ${this.name}, metric ${this.metric}
    vec3 ${this.name} = getVoronoi(${this.input}, ${d}, ${s}, ${r}, ${l}, ${rand}, ${metricIndex});
    
`;

        return { globals, mainCode };
    }
}

/*
  const voronoi1 = new VoronoiBlock("voronoi1", {
        input: "mapping1",
        scale: 1,
        detail: 3,
        roughness: 0.5,
        lacunarity: 2,
        randomness: 1,
        metric: "chebychev"
    });
*/