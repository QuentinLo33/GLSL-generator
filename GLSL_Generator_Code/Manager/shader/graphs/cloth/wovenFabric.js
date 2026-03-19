import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";

import { NoiseBlock } from "../../blocks/patterns/noise.js";
import { VoronoiBlock } from "../../blocks/patterns/voronoi.js";
import { ColorRampBlock } from "../../blocks/operators/colorRamp.js";
import { MixBlock } from "../../blocks/operators/mix.js";

import { MapRange } from "../../blocks/operators/mapRange.js";
import { WaveBlock } from "../../blocks/patterns/wave.js";

export function getGraph() {
    // 1. Mapping
    const mapping1 = new MappingBlock("mapping1", {
        scale: [1, 0.1, 1],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });
    
    const noise1 = new NoiseBlock("noise1", {
        input: "mapping1",
        scale: 1,        // échelle du bois
        detail: 12,      // nombre d’octaves pour le grain
        roughness: 0.5,
        lacunatrity: 2,
        distortion: 3,   // torsion des anneaux
        normalized: true
    });

    const mix1 = new MixBlock("mix1", {
        inputA: "mapping1",
        inputB: "noise1",
        mode: "mix",
        factor: 0.05
    });
    
    const wave1 = new WaveBlock("wave1", {
        input: "mapping1",
        type: "sine",
        pattern: "bands",
        axis: "Y",
        scale: 5000.0,
        distortion: 0.5,
        detail: 3,
        detailScale: 2.0,
        detailRoughness: 0.5,
        phase: 1.0
    });

      const wave2 = new WaveBlock("wave2", {
        input: "mapping1",
        type: "sine",
        pattern: "bands",
        axis: "X",
        scale: 5000.0,
        distortion: 0.5,
        detail: 3,
        detailScale: 2.0,
        detailRoughness: 0.5,
        phase: 1.0
    });

        const mix2 = new MixBlock("mix2", {
        inputA: "wave1",
        inputB: "wave2",
        mode: "mix",
        factor: 0.05
    });

    const output = new ConnectionBlock("output", {
        color: "mix2",
        roughness: "mix1",
        metal: 0
    });

    return [mapping1, noise1, mix1, wave1, wave2, mix2, output];
}
