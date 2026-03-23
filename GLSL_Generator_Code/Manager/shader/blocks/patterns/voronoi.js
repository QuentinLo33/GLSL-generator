export class VoronoiBlock {

    constructor(name, {
        input = "vPosition",
        scale = 1,
        detail = 3,
        roughness = 0.5,
        lacunarity = 2,
        randomness = 1,
        mode = "F1", // "F1", "F2", "F2-F1", "F1+F2"
        metric = "euclidean"  // "euclidean", "manhattan", "chebychev", "minkowski"
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

    generateCode() {

        const s = this.scale.toFixed(2);
        const d = this.detail;
        const r = this.roughness.toFixed(2);
        const l = this.lacunarity.toFixed(2);
        const rand = this.randomness.toFixed(2);

        const globals = `
// VORONOI GLOBALS (with modes: F1, F2, F2-F1, F1+F2)
vec3 hash33(vec3 p){
    p = fract(p * vec3(0.1031,0.11369,0.13787));
    p += dot(p, p.yxz + 19.19);
    return fract((p.xxy + p.yzz) * p.zyx);
}

void voronoiDistances(vec3 x, float randomness, int metric, out float F1, out float F2){
    vec3 p = floor(x);
    vec3 f = fract(x);
    F1 = 8.0;
    F2 = 8.0;

    for(int k=-1;k<=1;k++)
    for(int j=-1;j<=1;j++)
    for(int i=-1;i<=1;i++){
        vec3 b = vec3(i,j,k);
        vec3 r = b - f + hash33(p+b) * randomness;

        float d;
        if(metric == 0){ d = dot(r,r); }
        else if(metric == 1){ d = abs(r.x)+abs(r.y)+abs(r.z); }
        else if(metric == 2){ d = max(max(abs(r.x),abs(r.y)),abs(r.z)); }
        else if(metric == 3){ d = pow(pow(abs(r.x),4.0)+pow(abs(r.y),4.0)+pow(abs(r.z),4.0),0.25); }
        else { d = dot(r,r); }

        if(d < F1){ F2 = F1; F1 = d; }
        else if(d < F2){ F2 = d; }
    }

    if(metric == 0 || metric == 3){ F1 = pow(F1, (metric==0?0.5:0.25)); F2 = pow(F2,(metric==0?0.5:0.25)); }
}

vec3 getVoronoi(vec3 pos, int detail, float scale, float roughness, float lacunarity, float randomness, int metric, int mode){
    vec3 p = pos*scale;
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    float maxValue = 0.0;

    for(int i=0;i<detail;i++){
        float F1,F2;
        voronoiDistances(p*frequency, randomness, metric, F1, F2);

        float v = 0.0;
        if(mode == 0){ v = F1; }          // F1
        else if(mode == 1){ v = F2; }     // F2
        else if(mode == 2){ v = F2-F1; }  // F2-F1
        else if(mode == 3){ v = F1+F2; }  // F1+F2
        else { v = F1; }

        value += v * amplitude;
        maxValue += amplitude;
        amplitude *= roughness;
        frequency *= lacunarity;
    }

    value /= maxValue;
    return vec3(value);
}
`;

        // Map metric string to GLSL integer
        let metricIndex = 0;
        if(this.metric==="manhattan") metricIndex = 1;
        else if(this.metric==="chebyshev") metricIndex = 2;
        else if(this.metric==="minkowski") metricIndex = 3;

        // Map mode string to int: 0=F1,1=F2,2=F2-F1,3=F1+F2
        let modeIndex = 0;
        if(this.mode==="F2") modeIndex = 1;
        else if(this.mode==="F2-F1") modeIndex = 2;
        else if(this.mode==="F1+F2") modeIndex = 3;

        const mainCode = `
// VORONOI MAIN: ${this.name}, metric: ${this.metric}, mode: ${this.mode}
vec3 ${this.name} = getVoronoi(${this.input}, ${d}, ${s}, ${r}, ${l}, ${rand}, ${metricIndex}, ${modeIndex});
`;

        return { globals, mainCode };
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