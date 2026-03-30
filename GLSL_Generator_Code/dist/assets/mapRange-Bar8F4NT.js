class r{constructor(t,{input:o="vPosition",positions:n=[],colors:i=[],mode:e="linear"}={}){this.name=t,this.instanceId=null,this.input=o,this.positions=n,this.colors=i,this.mode=e}generateCodeGlobal(){return""}generateCodeMain(){return`
    // COLOR RAMP — ${this.name}
    float ${this.name}_input = ${this.input};
    vec3  ${this.name} = colorRamp(${this.name}_input, ${this.instanceId});
`}updateUniforms(t,o,n=8){const i=this.instanceId,e={linear:0,smooth:1,constant:2};t.uniform1i(t.getUniformLocation(o,`ramp_count[${i}]`),this.positions.length),t.uniform1i(t.getUniformLocation(o,`ramp_mode[${i}]`),e[this.mode]??0);const a=i*n;this.positions.forEach((s,m)=>{t.uniform1f(t.getUniformLocation(o,`ramp_positions[${a+m}]`),s)}),this.colors.forEach((s,m)=>{t.uniform3f(t.getUniformLocation(o,`ramp_colors[${a+m}]`),s[0]/255,s[1]/255,s[2]/255)})}}class f{constructor(t,{input:o="vPosition",fromMin:n=0,fromMax:i=1,toMin:e=0,toMax:a=1,mode:s="linear"}={}){this.name=t,this.input=o,this.fromMin=n,this.fromMax=i,this.toMin=e,this.toMax=a,this.mode=s}generateCodeGlobal(){return`// MAP RANGE GLOBAL:

float mapRange(float value, float inMin, float inMax, float outMin, float outMax){
    float t = (value - inMin) / (inMax - inMin);
    return mix(outMin, outMax, t);
}

float smootherstep(float edge0, float edge1, float x){
    x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return x*x*x*(x*(x*6.0 - 15.0) + 10.0);
}

`}generateCodeMain(){const t=this.fromMin.toFixed(3),o=this.fromMax.toFixed(3),n=this.toMin.toFixed(3),i=this.toMax.toFixed(3);let e;return this.mode==="smoothstep"?e=`mix(${n}, ${i}, smoothstep(${t}, ${o}, ${this.input}))`:this.mode==="smootherstep"?e=`mix(${n}, ${i}, smootherstep(${t}, ${o}, ${this.input}))`:this.mode==="step"?e=`step(${t}, ${this.input})`:this.mode==="stepped"?e=`floor(mapRange(${this.input}, ${t}, ${o}, ${n}, ${i}))`:e=`mapRange(${this.input}, ${t}, ${o}, ${n}, ${i})`,`    // MAP RANGE MAIN: ${this.name} (${this.mode})
    vec3 ${this.name} = vec3(${e});

`}}export{r as C,f as M};
