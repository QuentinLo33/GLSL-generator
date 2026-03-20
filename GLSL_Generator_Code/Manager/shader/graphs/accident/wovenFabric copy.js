import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";
import { NoiseBlock } from "../../blocks/patterns/noise.js";
import { VoronoiBlock } from "../../blocks/patterns/voronoi.js";
import { ColorRampBlock } from "../../blocks/operators/colorRamp.js";
import { MixBlock } from "../../blocks/operators/mix.js";
import { MapRange } from "../../blocks/operators/mapRange.js";
import { BumpMultiplierBlock } from "../../blocks/operators/bumpMultiplier.js";
import { WaveBlock } from "../../blocks/patterns/wave.js";

export function getGraph() {
    // 1. Mapping de base
    const mapping1 = new MappingBlock("mapping1", {
        scale: [1, 1, 1],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "uv"
    });

    // 2. Grain / bruit léger pour déformation
    const noise1 = new NoiseBlock("noise1", {
        input: "mapping1",
        scale: 1,
        detail: 12,
        roughness: 0.5,
        lacunatrity: 2,
        distortion: 3,
        normalized: true
    });

    const mixDeformation = new MixBlock("mixDeformation", {
        inputA: "mapping1",
        inputB: "noise1",
        mode: "mix",
        factor: 0.05 // très léger pour déformer subtilement
    });

    // 3. Première vague (Y)
    const wave1 = new WaveBlock("wave1", {
        input: "mixDeformation",
        type: "sine",
        pattern: "bands",
        axis: "Y",
        scale: 600.0,
        distortion: 2.0,
        detail: 3,
        detailScale: 2.0,
        detailRoughness: 0.5,
        phase: 1.0
    });

    // 4. Deuxième vague (X)
    const wave2 = new WaveBlock("wave2", {
        input: "mixDeformation",
        type: "sine",
        pattern: "bands",
        axis: "X",
        scale: 600.0,
        distortion: 2.0,
        detail: 3,
        detailScale: 2.0,
        detailRoughness: 0.5,
        phase: 1.0
    });

    // 5. Mix des deux vagues pour effet tissage
    const mixWave = new MixBlock("mixWave", {
        inputA: "wave1",
        inputB: "wave2",
        mode: "multiply",
        factor: 0.6
    });

    // 6. Remap pour roughness
    const roughnessMap = new MapRange("roughnessMap", {
        input: "mixWave.r",
        fromMin: -1,
        fromMax: 1,
        toMin: 0.2,
        toMax: 0.8
    });

    // 7. Color ramp pour couleur des fibres
    const colorRamp = new ColorRampBlock("colorRamp", {
        input: "mixWave.r",
        positions: [0.1, 0.2, 0.3],
        colors: [
            [250, 0, 0], // clair
            [0, 250, 0], // clair
            [0, 0, 0]    // foncé
        ],
        mode: "linear"
    });

    // 8. Bump subtil pour relief
    const bump = new BumpMultiplierBlock("bump", {
        input: "mixWave",
        factor: 0.05
    });

    // 9. Output final
    const output = new ConnectionBlock("output", {
        color: "colorRamp",
        roughness: "colorRamp",
        metal: 0,
        bump: "colorRamp"
    });

    return [
        mapping1,
        noise1,
        mixDeformation,
        wave1,
        wave2,
        mixWave,
        roughnessMap,
        colorRamp,
        bump,
        output
    ];
}