import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";
import { NoiseBlock } from "../../blocks/patterns/noise.js";
import { VoronoiBlock } from "../../blocks/patterns/voronoi.js";
import { ColorRampBlock } from "../../blocks/operators/colorRamp.js";
import { MixBlock } from "../../blocks/operators/mix.js";
import { MapRange } from "../../blocks/operators/mapRange.js";
import { BumpMultiplierBlock } from "../../blocks/operators/bumpMultiplier.js";

import { WoodGrainBlock } from "../../blocks/patterns/woodGrain.js";

export function getGraph() {

    const mappingGrain = new MappingBlock("mappingGrain", {
        scale: [1, 2, 1],   // ← plus étiré en Y = lignes plus longues
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    const woodGrain = new WoodGrainBlock("woodGrain", {
        input: "mappingGrain",
        scale: 6.0,
        distortion: 1.5,    // ← plus fort = ondulations plus visibles
        noiseScale: 0.4     // ← plus petit = ondulations plus larges/douces
    });

    const woodGrain2 = new WoodGrainBlock("woodGrain2", {
        input: "mappingGrain",
        scale: 2.5,
        distortion: 2.0,
        noiseScale: 0.25
    });

    const mixGrain = new MixBlock("mixGrain", {
        inputA: "woodGrain",
        inputB: "woodGrain2",
        mode: "multiply",
        factor: 0.5
    });

    // Knots
    const noiseKnot = new NoiseBlock("noiseKnot", {
        input: "mappingGrain",
        scale: 0.8,
        detail: 2,
        roughness: 0.5,
        lacunarity: 2.0,
        distortion: 0.0,
        normalized: false,
        mode: "fBm"
    });

    const voronoiKnot = new VoronoiBlock("voronoiKnot", {
        input: "noiseKnot",
        scale: 2.5,
        detail: 1,
        roughness: 0.5,
        lacunarity: 2.0,
        randomness: 1.0,
        mode: "F1",
        metric: "euclidean"
    });

    const knotRemap = new MapRange("knotRemap", {
        input: "voronoiKnot.r",
        fromMin: 0.0,
        fromMax: 0.2,
        toMin: 1.0,
        toMax: 0.0,
        mode: "smoothstep"
    });

    const mixFinal = new MixBlock("mixFinal", {
        inputA: "mixGrain",
        inputB: "knotRemap",
        mode: "multiply",
        factor: 0.4
    });

    const colorRamp = new ColorRampBlock("colorRamp", {
        input: "mixFinal.r",
        positions: [0.2, 0.1, 0.35, 0.65, 1.0],
        colors: [
            [140,  80,  25],
            [150, 90,  35],
            [205, 148, 62],
            [232, 195, 115],
            [222, 185, 105],
        ],
        mode: "smooth"
    });

    const roughnessFinal = new MapRange("roughnessFinal", {
        input: "mixFinal.r",
        fromMin: 0.0,
        fromMax: 1.0,
        toMin: 0.4,
        toMax: 0.12,
        mode: "linear"
    });

    const bump = new BumpMultiplierBlock("bump", {
        input: "mixFinal",
        factor: 0.15
    });

    const output = new ConnectionBlock("output", {
        color: "colorRamp",
        roughness: "roughnessFinal",
        metallic: "0.0",
        bump: "bump"
    });

    return [
        mappingGrain,
        woodGrain,
        woodGrain2,
        mixGrain,
        noiseKnot,
        voronoiKnot,
        knotRemap,
        mixFinal,
        colorRamp,
        roughnessFinal,
        bump,
        output
    ];
}