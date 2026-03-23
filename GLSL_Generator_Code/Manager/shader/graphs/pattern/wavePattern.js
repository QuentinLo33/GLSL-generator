// operators
import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";

// patterns
import { WaveBlock } from "../../blocks/patterns/wave.js";


export function getGraph() {
    const mapping = new MappingBlock("mapping", {
        scale: [1, 1, 1],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    const wave = new WaveBlock("wave", {
        input: "mapping",
        type: "sine", // "sine", "triangle", "saw",           
        pattern: "bands", // "bands", "rings"
        axis: "X", // "X", "Y", "Z"
        scale: 20.0,
        distortion: 0,
        detail: 3,
        detailScale: 2.0,
        detailRoughness: 0.5,
        phase: 1.0
    });

    const output = new ConnectionBlock("output", {
        color: "wave",
        roughness: "wave",
        metal: 0
    });

    return [mapping, wave, output];
}