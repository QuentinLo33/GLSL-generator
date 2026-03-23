// operators
import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";

// patterns
import { WoodGrainBlock } from "../../blocks/patterns/woodGrain.js";


export function getGraph() {
    const mapping = new MappingBlock("mapping", {
        scale: [1, 1, 1],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    const woodGrain = new WoodGrainBlock("woodGrain", {
        input: "mapping",
        scale: 2.5,
        distortion: 2.0,
        noiseScale: 0.25
    });

    const output = new ConnectionBlock("output", {
        color: "woodGrain",
        roughness: "woodGrain",
        metal: 0
    });

    return [mapping, woodGrain, output];
}