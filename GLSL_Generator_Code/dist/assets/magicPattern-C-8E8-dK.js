import{M as s,C as c}from"./connection-DBwQBGfk.js";class l{constructor(t,{input:e="vPosition",scale:o=1,depth:a=4,distortion:n=.5}={}){this.name=t,this.input=e,this.scale=o,this.depth=a,this.distortion=n}generateCodeGlobal(){return`// MAGIC TEXTURE GLOBALS:
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

`}generateCodeMain(){const t=this.scale.toFixed(2),e=this.depth,o=this.distortion.toFixed(2);return`    // MAGIC TEXTURE MAIN: ${this.name}
    vec3 ${this.name} = magicTexture(${this.input}, ${t}, ${e}, ${o});

`}}function p(){const i=new s("mapping",{scale:[1,1,1],offset:[0,0,0],rotation:[0,0,0],mode:"local"}),t=new l("magic",{input:"mapping",scale:5,depth:2,distortion:5}),e=new c("output",{color:"magic",roughness:"magic",metal:0});return[i,t,e]}export{p as getGraph};
