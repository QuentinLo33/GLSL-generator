class _{constructor(e,{scale:t=[1,1,1],offset:o=[0,0,0],rotation:a=[0,0,0],mode:i="local"}={}){this.name=e,this.scale=t,this.offset=o,this.rotation=a.map(n=>n*Math.PI/180),this.mode=i}generateCodeGlobal(){return""}generateCodeMain(){const[e,t,o]=this.scale.map(s=>s.toFixed(3)),[a,i,n]=this.offset.map(s=>s.toFixed(3)),[c,m,r]=this.rotation.map(s=>s.toFixed(4)),h=`
    mat3 rotX_${this.name} = mat3(1.0,0.0,0.0, 0.0,cos(${c}),-sin(${c}), 0.0,sin(${c}),cos(${c}));
    mat3 rotY_${this.name} = mat3(cos(${m}),0.0,sin(${m}), 0.0,1.0,0.0, -sin(${m}),0.0,cos(${m}));
    mat3 rotZ_${this.name} = mat3(cos(${r}),-sin(${r}),0.0, sin(${r}),cos(${r}),0.0, 0.0,0.0,1.0);
    mat3 rotMat_${this.name} = rotZ_${this.name} * rotY_${this.name} * rotX_${this.name};`;let $="";if(this.mode==="uv"){const[s,d]=this.scale.slice(0,2).map(l=>l.toFixed(3)),[M,P]=this.offset.slice(0,2).map(l=>l.toFixed(3));$=`
    // MAPPING UV: ${this.name}
    vec3 ${this.name} = vec3(vUv * vec2(${s},${d}) + vec2(${M},${P}), 0.0);

`}return this.mode==="local"&&($=`
    // MAPPING LOCAL: ${this.name}
    ${h}
    vec3 ${this.name} = rotMat_${this.name} * (vPosition * vec3(${e},${t},${o}) + vec3(${a},${i},${n}));

`),this.mode==="world"&&($=`
    // MAPPING WORLD: ${this.name}
    ${h}
    vec3 ${this.name} = rotMat_${this.name} * (vWorldPosition * vec3(${e},${t},${o}) + vec3(${a},${i},${n}));

`),this.mode==="generated"&&($=`
    // MAPPING GENERATED: ${this.name}
    ${h}
    vec3 generated_${this.name} = normalize(vPosition) * 0.5 + 0.5;
    vec3 ${this.name} = rotMat_${this.name} * (generated_${this.name} * vec3(${e},${t},${o}) + vec3(${a},${i},${n}));

`),$}}class p{constructor(e,t={}){this.name=e,this.connections={color:t.color||"vec3(1.0)",roughness:t.roughness||"0.5",bump:t.bump||"vec3(0.0)",metallic:t.metallic||"0.0"}}generateCodeGlobal(){return""}generateCodeMain(){return""}}export{p as C,_ as M};
