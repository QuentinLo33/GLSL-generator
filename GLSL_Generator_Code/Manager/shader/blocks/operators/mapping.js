export class MappingBlock {
    constructor(name, {
        scale = [1, 1, 1],
        offset = [0, 0, 0],
        rotation = [0, 0, 0],
        mode = "local"
    } = {}) {
        this.name = name;
        this.scale = scale;
        this.offset = offset;
        this.rotation = rotation.map(v => v * Math.PI / 180);
        this.mode = mode;
    }

    generateCode() {
        const [sx, sy, sz] = this.scale.map(v => v.toFixed(3));
        const [ox, oy, oz] = this.offset.map(v => v.toFixed(3));
        const [rx, ry, rz] = this.rotation.map(v => v.toFixed(4));

        const rotationCode = `
    mat3 rotX = mat3(1.0,0.0,0.0, 0.0,cos(${rx}),-sin(${rx}), 0.0,sin(${rx}),cos(${rx}));
    mat3 rotY = mat3(cos(${ry}),0.0,sin(${ry}), 0.0,1.0,0.0, -sin(${ry}),0.0,cos(${ry}));
    mat3 rotZ = mat3(cos(${rz}),-sin(${rz}),0.0, sin(${rz}),cos(${rz}),0.0, 0.0,0.0,1.0);
    mat3 rotMat_${this.name} = rotZ * rotY * rotX;`;

        // UV — suit les UV du mesh, idéal pour models importés
        if (this.mode === "uv") {
            const [sx2, sy2] = this.scale.slice(0, 2).map(v => v.toFixed(3));
            const [ox2, oy2] = this.offset.slice(0, 2).map(v => v.toFixed(3));
            return {
                globals: "",
                mainCode: `
    // MAPPING UV: ${this.name}
    vec3 ${this.name} = vec3(vUv * vec2(${sx2},${sy2}) + vec2(${ox2},${oy2}), 0.0);
`
            };
        }

        // LOCAL — coordonnées 3D du mesh en local space, texture suit la géométrie
        if (this.mode === "local") {
            return {
                globals: "",
                mainCode: `
    // MAPPING LOCAL: ${this.name}
    ${rotationCode}
    vec3 ${this.name} = rotMat_${this.name} * (vPosition * vec3(${sx},${sy},${sz}) + vec3(${ox},${oy},${oz}));
`
            };
        }

        // WORLD — coordonnées monde, texture "infinie" qui traverse les objets
        if (this.mode === "world") {
            return {
                globals: "",
                mainCode: `
    // MAPPING WORLD: ${this.name}
    ${rotationCode}
    vec3 ${this.name} = rotMat_${this.name} * (vWorldPosition * vec3(${sx},${sy},${sz}) + vec3(${ox},${oy},${oz}));
`
            };
        }

        // GENERATED — ancien comportement, projection sphérique normalisée (style Blender)
        if (this.mode === "generated") {
            return {
                globals: "",
                mainCode: `
    // MAPPING GENERATED: ${this.name}
    ${rotationCode}
    vec3 generated_${this.name} = normalize(vPosition) * 0.5 + 0.5;
    vec3 ${this.name} = rotMat_${this.name} * (generated_${this.name} * vec3(${sx},${sy},${sz}) + vec3(${ox},${oy},${oz}));
`
            };
        }

        // TRIPLANAR — projection sur les 3 axes, mélangée par la normale
        if (this.mode === "triplanar") {
            return {
                globals: `
// TRIPLANAR GLOBAL
vec3 triplanarMapping(vec3 pos, vec3 normal, float scale) {
    vec3 blending = abs(normal);
    blending = normalize(max(blending, 0.00001));
    float b = blending.x + blending.y + blending.z;
    blending /= b;
    vec3 xAxis = vec3(pos.y, pos.z, 0.0) * scale;
    vec3 yAxis = vec3(pos.x, pos.z, 0.0) * scale;
    vec3 zAxis = vec3(pos.x, pos.y, 0.0) * scale;
    return xAxis * blending.x + yAxis * blending.y + zAxis * blending.z;
}
`,
                mainCode: `
    // MAPPING TRIPLANAR: ${this.name}
    vec3 ${this.name} = triplanarMapping(vPosition, vNormal, ${sx}) + vec3(${ox},${oy},${oz});
`
            };
        }

        throw new Error("MappingBlock mode unknown: " + this.mode);
    }
}