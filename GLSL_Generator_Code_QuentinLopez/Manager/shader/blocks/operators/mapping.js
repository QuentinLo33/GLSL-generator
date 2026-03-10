export class MappingBlock {
  constructor(name, {
      scale = [1, 1, 1],
      offset = [0, 0, 0],
      rotation = [0, 0, 0], // degrees
      mode = "local"
    }={}) {
    this.name = name;
    this.scale = scale;
    this.offset = offset;
    // degrees → radians
    this.rotation = rotation.map(v => v * Math.PI / 180);

    this.mode = mode;
  }

  generateCode() {

    let mainCode =
`   // MAPPING MAIN: ${this.name}, ${this.mode} mode`;
    const [sx, sy, sz] = this.scale.map(v => v.toFixed(3));
    const [ox, oy, oz] = this.offset.map(v => v.toFixed(3));
    const [rx, ry, rz] = this.rotation.map(v => v.toFixed(4));

    const rotationCode =
`   // Rotation
    mat3 rotX = mat3(1.0,0.0,0.0, 0.0,cos(${rx}),-sin(${rx}), 0.0,sin(${rx}),cos(${rx}));

    mat3 rotY = mat3(cos(${ry}),0.0,sin(${ry}),0.0,1.0,0.0,-sin(${ry}),0.0,cos(${ry}));

    mat3 rotZ = mat3(cos(${rz}),-sin(${rz}),0.0,sin(${rz}),cos(${rz}),0.0,0.0,0.0,1.0);

    mat3 rotationMat = rotZ * rotY * rotX;
`;

    // -------------------
    // UV MODE
    // -------------------

    if (this.mode === "uv") {

      const [sx2, sy2] = this.scale.slice(0,2).map(v => v.toFixed(3));
      const [ox2, oy2] = this.offset.slice(0,2).map(v => v.toFixed(3));

      mainCode+=
`    vec3 ${this.name} = vec3(vUv * vec2(${sx2},${sy2}) + vec2(${ox2},${oy2}),0.0);

`
      return {

        globals: "",

        mainCode

      };
    }

    // -------------------
    // POSITION MODE
    // (Generated Blender)
    // -------------------

    if (this.mode === "local") {
      mainCode +=`
${rotationCode}

    // Generated coordinates
    vec3 generated = normalize(vPosition) * 0.5 + 0.5;

    // Mapping transform
    vec3 ${this.name} = rotationMat * (generated * vec3(${sx},${sy},${sz}) + vec3(${ox},${oy},${oz}));
  
  `
      return {

        globals: "",

        mainCode
      };
    }

    throw new Error("MappingBlock mode unknown : " + this.mode);
  }
}

/*
    const mapping1 = new MappingBlock("mapping1",{
        scale:[1,1,1],
        offset:[0,0,0],
        rotation:[0,0,0], 
        mode:"local"
    });
*/