class c{constructor(e,{input:s="vPosition",type:a="sine",pattern:o="bands",axis:n="X",scale:l=1,distortion:i=0,detail:t=0,detailScale:$=1,detailRoughness:h=.5,phase:r=0}={}){this.name=e,this.input=s,this.type=a.toLowerCase(),this.pattern=o.toLowerCase(),this.axis=n.toUpperCase(),this.scale=l,this.distortion=i,this.detail=t,this.detailScale=$,this.detailRoughness=h,this.phase=r}generateCodeGlobal(){return`
// WAVE GLOBAL:
float waveFunc(float x, int type){
    // Sin
    if(type == 0) return sin(x);

    // Triangle
    else if(type == 1) return abs(fract(x / 6.2831853) * 2.0 - 1.0) * 2.0 - 1.0;
    
    // Saw
    else if(type == 2) return fract(x / 6.2831853) * 2.0 - 1.0; // saw
    return sin(x);
}

`}generateCodeMain(){const e=this.scale.toFixed(2),s=this.distortion.toFixed(2),a=this.detail,o=this.detailScale.toFixed(2),n=this.detailRoughness.toFixed(2),l=this.phase.toFixed(2),i=this.type==="sine"?0:this.type==="triangle"?1:2;this.axis==="X"||this.axis;const t=this.name+"_";return`
    vec3 ${t}pos = ${this.input} * ${e};
    ${t}pos += snoise(${this.input} * ${s}) * ${s};
    float ${t}value = 0.0;

    ${this.pattern==="rings"?`${t}value = length(${t}pos.xy);`:`${t}value = ${this.axis==="X"?`${t}pos.x`:this.axis==="Y"?`${t}pos.y`:`${t}pos.z`};`}

    ${t}value = waveFunc(${t}value + ${l}, ${i});

    float ${t}amp = 0.5;
    float ${t}freq = 1.0;
    float ${t}maxVal = 0.0;
    for(int i=0;i<${a};i++){
        ${t}value += waveFunc(${t}value * ${t}freq, ${i}) * ${t}amp;
        ${t}maxVal += ${t}amp;
        ${t}amp *= ${n};
        ${t}freq *= ${o};
    }

    vec3 ${this.name} = vec3(${t}value);

`}}export{c as W};
