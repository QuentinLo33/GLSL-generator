// ColorRampBlock.js
export class ColorRampBlock {
    // ColorRampBlock.js — constructeur sans instanceId
    constructor(name, {
        input = "vPosition",
        positions = [],
        colors = [],
        mode = "linear"
    } = {}) {
        this.name = name;
        this.instanceId = null; // assigné par ShaderGraph
        this.input = input;
        this.positions = positions;
        this.colors = colors;
        this.mode = mode;
    }

    generateCodeGlobal() { return ""; }

    // Main : juste l'appel avec l'instanceId
    generateCodeMain() {
        return `
    // COLOR RAMP — ${this.name}
    float ${this.name}_input = ${this.input};
    vec3  ${this.name} = colorRamp(${this.name}_input, ${this.instanceId});
`;
    }

    updateUniforms(gl, program, maxStops = 8) {
        const id  = this.instanceId;
        const modeMap = { linear: 0, smooth: 1, constant: 2 };

        gl.uniform1i(
            gl.getUniformLocation(program, `ramp_count[${id}]`),
            this.positions.length
        );
        gl.uniform1i(
            gl.getUniformLocation(program, `ramp_mode[${id}]`),
            modeMap[this.mode] ?? 0
        );

        // Remplir le slot de cet instance dans le array plat
        const offset = id * maxStops;
        this.positions.forEach((p, i) => {
            gl.uniform1f(
                gl.getUniformLocation(program, `ramp_positions[${offset + i}]`),
                p
            );
        });
        this.colors.forEach((c, i) => {
            gl.uniform3f(
                gl.getUniformLocation(program, `ramp_colors[${offset + i}]`),
                c[0]/255, c[1]/255, c[2]/255
            );
        });
    }
}