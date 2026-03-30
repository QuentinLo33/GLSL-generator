class n{constructor(t,{inputA:e="vPosition",inputB:i="vPosition",mode:a="mix",factor:o=.5}={}){this.name=t,this.inputA=e,this.inputB=i,this.mode=a,this.factor=o}generateCodeGlobal(){return`// MIX GLOBAL:
vec3 mixModes(vec3 a, vec3 b, float factor, int mode){
    if(mode == 0){ return mix(a, min(a,b), factor); }   // darken
    if(mode == 1){ return mix(a, max(a,b), factor); }   // lighten
    if(mode == 2){ return mix(a, a * b, factor); }      // multiply
    if(mode == 3){ return clamp(mix(a, a + b, factor), 0.0, 1.0); } // add
    if(mode == 4){ return mix(a, a - b, factor); }      // subtract
    if(mode == 5){ return mix(a, clamp(a + 2.0*b - 1.0, 0.0, 1.0), factor); } // linear light
    return mix(a, b, factor); // default: mix
}

`}generateCodeMain(){const t=typeof this.factor=="string"?this.factor:this.factor.toFixed(2),i={darken:0,lighten:1,multiply:2,add:3,subtract:4,linear_light:5,mix:6}[this.mode]??6;return`    // MIX MAIN: ${this.name}, ${this.mode} mode
    vec3 ${this.name} = mixModes(${this.inputA}, ${this.inputB}, ${t}, ${i});
    
`}}export{n as M};
