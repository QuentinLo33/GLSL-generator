import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";

import { WaveBlock } from "../../blocks/patterns/wave.js";

export function getGraph() {
    const mapping1 = new MappingBlock("mapping1", {
        scale: [1, 1, 1],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    const wave1 = new WaveBlock("wave1", {
        input: "mapping1",
        type: "sine",
        pattern: "bands",
        axis: "Y",
        scale: 20.0,
        distortion: 0,
        detail: 3,
        detailScale: 2.0,
        detailRoughness: 0.5,
        phase: 1.0
    });

    const output = new ConnectionBlock("output", {
        color: "wave1",
        roughness: "wave1",
        metal: 0
    });

    return [mapping1, wave1, output];
}