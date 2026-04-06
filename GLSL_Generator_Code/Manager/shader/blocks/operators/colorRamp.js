export class ColorRampBlock {
    // Constructor for the Color Ramp node (no instanceId assigned here)
    constructor(name, {
        input = "vPosition", // Input scalar value used to sample the color ramp
        positions = [],      // Array of stop positions (values typically in [0,1])
        colors = [],         // Array of RGB colors corresponding to each stop
        mode = "linear"      // Interpolation mode: "linear", "smooth", or "constant"
    } = {}) {
        this.name = name;
        this.instanceId = null; // Assigned later by ShaderGraph (used for uniform indexing)
        this.input = input;
        this.positions = positions;
        this.colors = colors;
        this.mode = mode;
    }

    // No global GLSL functions required for this node
    generateCodeGlobal() { 
        return ""; 
    }

    // Generates the GLSL code that samples the color ramp
    generateCodeMain() {
        return `
    // =====================
    // COLOR RAMP MAIN: ${this.name}
    // =====================

    // Convert input to a local scalar value
    float ${this.name}_input = ${this.input};

    // Evaluate the color ramp using the instance ID
    // The shader uses uniform arrays indexed by instanceId
    vec3 ${this.name} = colorRamp(${this.name}_input, ${this.instanceId});
`;
    }

    // Uploads ramp data (positions, colors, mode) to GPU uniforms
    updateUniforms(gl, program, maxStops = 8) {
        const id  = this.instanceId;

        // Map interpolation mode to integer:
        // 0 = linear, 1 = smooth, 2 = constant
        const modeMap = { linear: 0, smooth: 1, constant: 2 };

        // Send number of active color stops for this ramp
        gl.uniform1i(
            gl.getUniformLocation(program, `ramp_count[${id}]`),
            this.positions.length
        );

        // Send interpolation mode
        gl.uniform1i(
            gl.getUniformLocation(program, `ramp_mode[${id}]`),
            modeMap[this.mode] ?? 0
        );

        // Flattened storage: each ramp has a fixed slot in uniform arrays
        const offset = id * maxStops;

        // Upload positions (scalar values defining where colors are sampled)
        this.positions.forEach((p, i) => {
            gl.uniform1f(
                gl.getUniformLocation(program, `ramp_positions[${offset + i}]`),
                p
            );
        });

        // Upload RGB colors (normalized from 0–255 to 0–1)
        this.colors.forEach((c, i) => {
            gl.uniform3f(
                gl.getUniformLocation(program, `ramp_colors[${offset + i}]`),
                c[0] / 255,
                c[1] / 255,
                c[2] / 255
            );
        });
    }
}

/*
    const colorRamp = new ColorRampBlock("colorRamp", {
        input: "noise.r",
        positions: [0, 0.3, 0.6, 1.0],
        colors: [
            [120, 60, 15], // deep hollows, shadow areas
            [185, 105, 38], // low main surface
            [215, 140, 55], // illuminated surface
            [235, 168, 68], // high points, metallic highlights
        ],
        mode: "smooth"
    });
*/