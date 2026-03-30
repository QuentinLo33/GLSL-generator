export class WoodGrainBlock {
    constructor(name, {
        input = "vPosition",
        scale = 5.0,
        distortion = 0.5,
        noiseScale = 1.0
    } = {}) {
        this.name = name;
        this.input = input;
        this.scale = scale;
        this.distortion = distortion;
        this.noiseScale = noiseScale;
    }

    generateCodeGlobal() {
        const s = this.scale.toFixed(2);
        const dist = this.distortion.toFixed(2);
        const ns = this.noiseScale.toFixed(2);

        let codeGlobal = `
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

`;
        return codeGlobal;
    }

    generateCodeMain() {
        let codeMain= `
        // WOOD GRAIN MAIN: ${this.name}
        float ${this.name}_raw = getWoodGrain(${this.input}, ${s}, ${dist}, ${ns});
        vec3 ${this.name} = vec3(${this.name}_raw);
        
`;
        return codeMain;
    }
}

/*
    const woodGrain = new WoodGrainBlock("woodGrain", {
        input: "mapping",
        scale: 2.5,
        distortion: 2.0,
        noiseScale: 0.25
    });
*/