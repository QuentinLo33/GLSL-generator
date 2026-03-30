class a{constructor(e,{input:t="vPosition",scale:o=5,distortion:i=.5,noiseScale:n=1}={}){this.name=e,this.input=t,this.scale=o,this.distortion=i,this.noiseScale=n}generateCodeGlobal(){return`
    // WOOD GRAIN GLOBAL:
    float getWoodGrain(vec3 pos, float scale, float distortion, float noiseScale) {
        
        // Streched noise ++X, Y+
        vec3 pN = vec3(pos.x * 0.5, pos.y * 3.0, pos.z * 0.5); // ← étire Y
        float nx = snoise(pN * noiseScale) * distortion;
        
        // Déplace uniquement X par le noise → lignes qui ondulent latéralement
        float xWarped = pos.x + nx;
        
        // Parallel lines on the distorted coordinate
        float grain = sin(xWarped * scale * 6.2831853);
        
        return grain * 0.5 + 0.5;
    }

`}generateCodeMain(){const e=this.scale.toFixed(2),t=this.distortion.toFixed(2),o=this.noiseScale.toFixed(2);return`
        // WOOD GRAIN MAIN: ${this.name}
        float ${this.name}_raw = getWoodGrain(${this.input}, ${e}, ${t}, ${o});
        vec3 ${this.name} = vec3(${this.name}_raw);
        
`}}export{a as W};
