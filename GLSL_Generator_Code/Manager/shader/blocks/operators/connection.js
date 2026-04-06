export class ConnectionBlock {

    constructor(name, connections = {}) {

        this.name = name;

        // Define default material/property inputs
        // These act as final outputs or fallback values if nothing is connected
        this.connections = {
            color: connections.color || "vec3(1.0)",     // Base color (RGB)
            roughness: connections.roughness || "0.5",   // Surface roughness (0 = smooth, 1 = rough)
            bump: connections.bump || "vec3(0.0)",       // Bump/normal-related input
            metallic: connections.metallic || "0.0"      // Metallic factor (0 = dielectric, 1 = metal)
        };

    }

    // No global GLSL functions required for this block
    generateCodeGlobal() {
        return "";
    }

    // This block does not generate GLSL code directly
    // It acts as a connection/output container for other nodes
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