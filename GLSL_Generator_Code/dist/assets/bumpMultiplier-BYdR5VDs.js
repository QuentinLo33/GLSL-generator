class o{constructor(t,{input:e="vPosition",factor:i=1}={}){this.name=t,this.input=e,this.factor=i}generateCodeGlobal(){return""}generateCodeMain(){return`    // BUMP MAIN: ${this.name}
    vec3 ${this.name} = ${this.input} * ${this.factor.toFixed(2)};
    
`}}export{o as B};
