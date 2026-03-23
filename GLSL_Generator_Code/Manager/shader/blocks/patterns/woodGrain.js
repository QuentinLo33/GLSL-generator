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

    generateCode() {
        const s = this.scale.toFixed(2);
        const dist = this.distortion.toFixed(2);
        const ns = this.noiseScale.toFixed(2);

        const globals = `
    // WOOD GRAIN GLOBAL:
    float getWoodGrain(vec3 pos, float scale, float distortion, float noiseScale) {
        
        // Noise étiré — déformation forte sur X, faible sur Y
        vec3 pN = vec3(pos.x * 0.5, pos.y * 3.0, pos.z * 0.5); // ← étire Y
        float nx = snoise(pN * noiseScale) * distortion;
        
        // Déplace uniquement X par le noise → lignes qui ondulent latéralement
        // mais ne forment JAMAIS de boucles fermées
        float xWarped = pos.x + nx;
        
        // Lignes parallèles sur la coordonnée déformée
        float grain = sin(xWarped * scale * 6.2831853);
        
        return grain * 0.5 + 0.5;
    }
    `;

        const mainCode = `
        // WOOD GRAIN MAIN: ${this.name}
        float ${this.name}_raw = getWoodGrain(${this.input}, ${s}, ${dist}, ${ns});
        vec3 ${this.name} = vec3(${this.name}_raw);
    `;

        return { globals, mainCode };
    }
}