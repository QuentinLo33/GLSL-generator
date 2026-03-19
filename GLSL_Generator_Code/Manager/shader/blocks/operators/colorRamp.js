export class ColorRampBlock {
    constructor(name, {
        input = "vPosition",
        positions = [],   // [0,0.3,1]
        colors = [],      // [[r,g,b],[r,g,b],[r,g,b]]
        mode = "linear"   // linear | constant | smooth
    } = {}) {
        this.name = name;
        this.input = input;
        this.positions = positions;
        this.colors = colors;
        this.mode = mode;
    }

    generateCode(){

    const toGLSLColor = (c)=>c.map(v=>(v/255).toFixed(3)).join(",");

    let globals =
`// COLOR RAMP GLOBAL
vec3 apply_${this.name}(float inputVal){
    vec3 outColor = vec3(${toGLSLColor(this.colors[0])});
`;

    // segments
    for(let i=0;i<this.positions.length-1;i++){

        const p0 = this.positions[i].toFixed(3);
        const p1 = this.positions[i+1].toFixed(3);

        const c0 = this.colors[i];
        const c1 = this.colors[i+1];

        globals +=
`
    // segment ${i}
`;

        if(this.mode==="linear"){

    globals +=
`    if(inputVal >= ${p0} && inputVal <= ${p1}){
        float t = clamp((inputVal-${p0})/(${p1}-${p0}),0.0,1.0);
        outColor = mix(vec3(${toGLSLColor(c0)}),vec3(${toGLSLColor(c1)}),t);
    }
`;

        }

        else if(this.mode==="smooth"){

            globals +=
`    if(inputVal >= ${p0} && inputVal <= ${p1}){
        float t = smoothstep(${p0},${p1},inputVal);
        outColor = mix(vec3(${toGLSLColor(c0)}),vec3(${toGLSLColor(c1)}),t);
    }
`;

        }

        else if(this.mode==="constant"){

            globals +=
`    if(inputVal >= ${p0} && inputVal < ${p1}){
        outColor = vec3(${toGLSLColor(c0)});
    }
`;

        }
    }

    globals +=`
    return outColor;
}

`;

    const mainCode =
`
    // COLOR RAMP MAIN
    float ${this.name}_input = ${this.input};
    vec3 ${this.name} = apply_${this.name}(${this.name}_input);

`;

    return {globals, mainCode};

    }
}

/*
    const colorRamp1 = new ColorRampBlock("ramp1",{
        input:"noise1.r",

        positions:[
            0,
            0.3,
            1
        ],

        colors:[
            [0,0,0],
            [255,120,0],
            [255,255,255]
        ],

        mode:"linear"
    });
*/