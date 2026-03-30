export class BumpMultiplierBlock {
    constructor(name, {
        input="vPosition",
        factor=1.0
    } = {}) {
        this.name = name;
        this.input = input;
        this.factor = factor;
    }
    
    generateCodeGlobal() {
        return "";
    } 
    generateCodeMain() {
        let codeMain =
`    // BUMP MAIN: ${this.name}
    vec3 ${this.name} = ${this.input} * ${this.factor.toFixed(2)};
    
`;
    return codeMain;
    }
}

/*
    const bump1 = new BumpMultiplierBlock("bump1", {
        input:"noise1",
        factor:2
    });
*/