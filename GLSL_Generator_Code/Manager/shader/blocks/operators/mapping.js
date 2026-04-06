export class MappingBlock {
    constructor(name, {
        scale = [1, 1, 1],      // Scaling applied per axis (X, Y, Z)
        offset = [0, 0, 0],     // Translation offset applied after scaling
        rotation = [0, 0, 0],   // Rotation in degrees (converted to radians internally)
        mode = "local"          // Mapping mode: "local", "world", "uv", or "generated"
    } = {}) {
        this.name = name;
        this.scale = scale;
        this.offset = offset;

        // Convert rotation from degrees to radians for GLSL math
        this.rotation = rotation.map(v => v * Math.PI / 180);

        this.mode = mode;
    }

    // No global GLSL functions required
    generateCodeGlobal() {
        return "";
    }

    generateCodeMain() {

        // Format parameters for GLSL code injection
        const [sx, sy, sz] = this.scale.map(v => v.toFixed(3));
        const [ox, oy, oz] = this.offset.map(v => v.toFixed(3));
        const [rx, ry, rz] = this.rotation.map(v => v.toFixed(4));

        // Rotation matrices around X, Y, and Z axes
        const rotationCode = `
    // Rotation matrices for each axis
    mat3 rotX_${this.name} = mat3(
        1.0, 0.0, 0.0,
        0.0, cos(${rx}), -sin(${rx}),
        0.0, sin(${rx}), cos(${rx})
    );

    mat3 rotY_${this.name} = mat3(
        cos(${ry}), 0.0, sin(${ry}),
        0.0, 1.0, 0.0,
        -sin(${ry}), 0.0, cos(${ry})
    );

    mat3 rotZ_${this.name} = mat3(
        cos(${rz}), -sin(${rz}), 0.0,
        sin(${rz}), cos(${rz}), 0.0,
        0.0, 0.0, 1.0
    );

    // Combined rotation matrix (Z * Y * X order)
    mat3 rotMat_${this.name} = rotZ_${this.name} * rotY_${this.name} * rotX_${this.name};
`;

        let codeMain =
`
    // =====================
    // MAPPING MAIN: ${this.name} (${this.mode})
    // =====================

`

        // =====================
        // UV MODE
        // Uses 2D UV coordinates from the mesh
        // Ideal for imported models with proper UVs
        // =====================
        if (this.mode === "uv") {
            const [sx2, sy2] = this.scale.slice(0, 2).map(v => v.toFixed(3));
            const [ox2, oy2] = this.offset.slice(0, 2).map(v => v.toFixed(3));

            codeMain +=
`    // Apply scale and offset to UV coordinates
    vec3 ${this.name} = vec3(
        vUv * vec2(${sx2}, ${sy2}) + vec2(${ox2}, ${oy2}),
        0.0
    );

`;
        }

        // =====================
        // LOCAL MODE
        // Uses object/local space vertex positions
        // Texture follows the geometry of the mesh
        // =====================
        if (this.mode === "local") {
            codeMain +=
`    ${rotationCode}

    // Apply scale, offset, and rotation in local space
    vec3 ${this.name} = rotMat_${this.name} * (
        vPosition * vec3(${sx}, ${sy}, ${sz}) +
        vec3(${ox}, ${oy}, ${oz})
    );

`;
        }

        // =====================
        // WORLD MODE
        // Uses world-space coordinates (independent of object transforms)
        // Useful for global textures that stay fixed in the scene
        // =====================
        if (this.mode === "world") {
            codeMain += 
`    ${rotationCode}

    // Apply mapping in world space
    vec3 ${this.name} = rotMat_${this.name} * (
        vWorldPosition * vec3(${sx}, ${sy}, ${sz}) +
        vec3(${ox}, ${oy}, ${oz})
    );

`;
        }

        // =====================
        // GENERATED MODE
        // Generates spherical-like mapping from normalized position
        // Useful for procedural textures without UVs
        // =====================
        if (this.mode === "generated") {
            codeMain +=
`    ${rotationCode}

    // Convert position to a normalized 0–1 range
    vec3 generated_${this.name} = normalize(vPosition) * 0.5 + 0.5;

    // Apply rotation, scale, and offset
    vec3 ${this.name} = rotMat_${this.name} * (
        generated_${this.name} * vec3(${sx}, ${sy}, ${sz}) +
        vec3(${ox}, ${oy}, ${oz})
    );

`;
        }

        return codeMain;
    }
}

/*
    const mapping = new MappingBlock("mapping", {
        scale: [1.3, 1.3, 1.3],  // était 0.8
        offset: [0, 0, 0], rotation: [0, 0, 0], mode: "local"
    });
*/