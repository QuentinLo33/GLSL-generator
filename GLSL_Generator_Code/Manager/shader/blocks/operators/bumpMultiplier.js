export class BumpMultiplierBlock {
    constructor(name, {
        input="vPosition",
        factor=1.0
    } = {}) {
        this.name = name;
        this.input = input;
        this.factor = factor;
    }

    generateCode() {
        return {
            globals: "",
            mainCode:
`    // BUMP MAIN: ${this.name}
    vec3 ${this.name} = ${this.input} * ${this.factor.toFixed(2)};
    
    `
        };
    }
}

/*
    const bump1 = new BumpMultiplierBlock("bump1", {
        input:"noise1",
        factor:2
    });
*/