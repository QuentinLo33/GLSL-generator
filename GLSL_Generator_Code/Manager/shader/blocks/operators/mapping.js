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

    generateCodeGlobal() {
        return "";
    }
    generateCodeCode() {
        const [sx, sy, sz] = this.scale.map(v => v.toFixed(3));
        const [ox, oy, oz] = this.offset.map(v => v.toFixed(3));
        const [rx, ry, rz] = this.rotation.map(v => v.toFixed(4));

        const rotationCode = `
    mat3 rotX_${this.name} = mat3(1.0,0.0,0.0, 0.0,cos(${rx}),-sin(${rx}), 0.0,sin(${rx}),cos(${rx}));
    mat3 rotY_${this.name} = mat3(cos(${ry}),0.0,sin(${ry}), 0.0,1.0,0.0, -sin(${ry}),0.0,cos(${ry}));
    mat3 rotZ_${this.name} = mat3(cos(${rz}),-sin(${rz}),0.0, sin(${rz}),cos(${rz}),0.0, 0.0,0.0,1.0);
    mat3 rotMat_${this.name} = rotZ_${this.name} * rotY_${this.name} * rotX_${this.name};`;

        let codeMain ="";
        // UV — suit les UV du mesh, idéal pour models importés
        if (this.mode === "uv") {
            const [sx2, sy2] = this.scale.slice(0, 2).map(v => v.toFixed(3));
            const [ox2, oy2] = this.offset.slice(0, 2).map(v => v.toFixed(3));
            codeMain =
`
    // MAPPING UV: ${this.name}
    vec3 ${this.name} = vec3(vUv * vec2(${sx2},${sy2}) + vec2(${ox2},${oy2}), 0.0);
    
`;
        }

        // LOCAL — coordonnées 3D du mesh en local space, texture suit la géométrie
        if (this.mode === "local") {
            codeMain = `
    // MAPPING LOCAL: ${this.name}
    ${rotationCode}
    vec3 ${this.name} = rotMat_${this.name} * (vPosition * vec3(${sx},${sy},${sz}) + vec3(${ox},${oy},${oz}));

`;
        }

        // WORLD
        if (this.mode === "world") {
            codeMain = `
    // MAPPING WORLD: ${this.name}
    ${rotationCode}
    vec3 ${this.name} = rotMat_${this.name} * (vWorldPosition * vec3(${sx},${sy},${sz}) + vec3(${ox},${oy},${oz}));

`;
        }

        // GENERATED
        if (this.mode === "generated") {
            codeMain = `
    // MAPPING GENERATED: ${this.name}
    ${rotationCode}
    vec3 generated_${this.name} = normalize(vPosition) * 0.5 + 0.5;
    vec3 ${this.name} = rotMat_${this.name} * (generated_${this.name} * vec3(${sx},${sy},${sz}) + vec3(${ox},${oy},${oz}));

`;
        }
        return codeMain;
    }
}