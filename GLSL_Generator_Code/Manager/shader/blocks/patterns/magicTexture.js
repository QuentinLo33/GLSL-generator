export class MagicTextureBlock {
    constructor(name, {
        input = "vPosition",
        scale = 1.0,
        depth = 4,
        distortion = 0.5
    } = {}) {
        this.name = name;
        this.input = input;
        this.scale = scale;
        this.depth = depth;
        this.distortion = distortion;
    }

    generateCode() {
        const s = this.scale.toFixed(2);
        const d = this.depth;
        const dist = this.distortion.toFixed(2);

        const globals =
`// MAGIC TEXTURE GLOBALS:
vec3 magicTexture(vec3 p, float scale, int depth, float distortion) {
    p *= scale;
    float value = 0.0;
    float amp = 1.0;

    // Fractal loop (multiple octaves)
    for (int i = 0; i < depth; i++) {

        // Procedural pattern & remapped from [-1,1] to [0,1]
        value += (sin(p.x + sin(p.y + sin(p.z))) * 0.5 + 0.5) * amp;

        // Distort coordinates before the next octave
        p += vec3(
            sin(p.y + float(i)) * distortion,
            cos(p.z + float(i)) * distortion,
            sin(p.x + float(i)) * distortion
        );

        // Reduce amplitude for the next octave (fractal behavior)
        amp *= 0.5;
    }

    // Normalize the value: [0,1]
    value = clamp(value / (2.0 - pow(0.5, float(depth - 1))), 0.0, 1.0);

    return vec3(value);
}
        
`;

        const mainCode =
`    // MAGIC TEXTURE MAIN: ${this.name}
    vec3 ${this.name} = magicTexture(${this.input}, ${s}, ${d}, ${dist});

`;

        return { globals, mainCode };
    }
}

/*
    const magic1=new MagicTextureBlock ("magic1", {
        input:"mapping1",
        scale:5,
        depth:2,
        distortion:5
    });
*/