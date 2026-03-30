export class ConnectionBlock {
    constructor(name, connections = {}) {

        this.name = name;

        this.connections = {
            color: connections.color || "vec3(1.0)",
            roughness: connections.roughness || "0.5",
            bump: connections.bump || "vec3(0.0)",
            metallic: connections.metallic || "0.0"
        };

    }

    generateCodeGlobal() {
        return "";
    }

    generateCodeMain() {
        return "";
    }
}

/*
    const output = new ConnectionBlock("output", {
        color: "mapping1",
        roughness: "ramp1",
        bump: "bump1"
    });
*/