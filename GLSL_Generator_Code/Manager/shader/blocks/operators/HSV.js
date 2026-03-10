export class HSVBlock {
    constructor(name, {
        input = "vColor",
        hue = 0,
        saturation = 1.0,
        value = 1.0
    } = {}) {
        this.name = name;
        this.input = input;
        this.hue = hue;
        this.saturation = saturation;
        this.value = value;
    }

    generateCode() {
        const h = this.hue.toFixed(3);
        const s = this.saturation.toFixed(3);
        const v = this.value.toFixed(3);

        const globals = `
// HSV GLOBAL: ${this.name}
// Helper functions to convert between RGB and HSV
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0., -1./3., 2./3., -1.);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6. * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec3 p = abs(fract(c.xxx + vec3(0., 1./3., 2./3.)) * 6. - 3.);
    return c.z * mix(vec3(1.), clamp(p - 1., 0., 1.), c.y);
}
`;

        const mainCode =
`    // HSV MAIN: ${this.name}
    vec3 ${this.name}_hsv = rgb2hsv(${this.input});
    ${this.name}_hsv.x += ${h};           // hue shift
    ${this.name}_hsv.y *= ${s};           // adjust saturation
    ${this.name}_hsv.z *= ${v};           // adjust value/brightness
    vec3 ${this.name} = hsv2rgb(${this.name}_hsv);
`;

        return { globals, mainCode };
    }
}
/*
    const hsv1 = new HSVBlock("hsv1", {
        input: "ramp1",
        hue: 0.0,
        saturation: 0.7,
        value: 0.9 
    });
*/