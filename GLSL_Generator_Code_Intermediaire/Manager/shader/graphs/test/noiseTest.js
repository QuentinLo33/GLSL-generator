import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";

import { NoiseBlock } from "../../blocks/patterns/noise.js";


export function getGraph() {
    const mapping1 = new MappingBlock("mapping1", {
        scale: [1, 1, 1],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    const noise1 = new NoiseBlock("noise1", {
        inputA: "noise1",
        scale:8,
        detail:8,
        roughness: 0.6,
        lacunatrity:3,
        distortion:0,
        normalized:true
    });

    const output = new ConnectionBlock("output", {
        color: "noise1",
        roughness: "noise1",
        metal: 0
    });

    return [mapping1, noise1, output];
}