// operators
import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";

// patterns
import { NoiseBlock } from "../../blocks/patterns/noise.js";


export function getGraph() {
    const mapping = new MappingBlock("mapping", {
        scale: [1, 1, 1],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    const noise = new NoiseBlock("noise", {
        inputA: "mapping",
        scale:8,
        detail:8,
        roughness: 0.6,
        lacunatrity:3,
        distortion:0,
        normalized:true,
        mode: "fBm"  // "fBm", "heteroTerrain"
    });

    const output = new ConnectionBlock("output", {
        color: "noise",
        roughness: "noise",
        metal: 0
    });

    return [mapping, noise, output];
}