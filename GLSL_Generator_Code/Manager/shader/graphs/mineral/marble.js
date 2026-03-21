import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";
import { NoiseBlock } from "../../blocks/patterns/noise.js";
import { ColorRampBlock } from "../../blocks/operators/colorRamp.js";
import { MixBlock } from "../../blocks/operators/mix.js";
import { MapRange } from "../../blocks/operators/mapRange.js";
import { BumpMultiplierBlock } from "../../blocks/operators/bumpMultiplier.js";
import { WoodGrainBlock } from "../../blocks/patterns/woodGrain.js";
import { WaveBlock } from "../../blocks/patterns/wave.js";
import { VoronoiBlock } from "../../blocks/patterns/voronoi.js";

export function getGraph() {

    const mappingBase = new MappingBlock("mappingBase", {
        scale: [4, 4, 4],   // ← plus grand = veines plus fines
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    // Noise mixé avec le mapping
    const noiseMix = new NoiseBlock("noiseMix", {
        input: "mappingBase",
        scale: 1.5,
        detail: 5,
        roughness: 0.5,
        lacunarity: 2.0,
        distortion: 0.0,
        normalized: true,
        mode: "fBm"
    });

    // Mix noise + mapping
    const mixNoise = new MixBlock("mixNoise", {
        inputA: "mappingBase",
        inputB: "noiseMix",
        mode: "mix",
        factor: 0.8
    });

    // Wave SAW sur le mix
    const waveSaw = new WaveBlock("waveSaw", {
        input: "mixNoise",
        type: "saw",
        pattern: "bands",
        axis: "X",
        scale: 5.0,         // ← réduit = veines plus larges et visibles
        distortion: 0.0,
        detail: 0,
        detailScale: 1.0,
        detailRoughness: 0.5,
        phase: 0.0
    });


    // Mix waveSaw + mapping → coordonnée déformée pour le Voronoi
    const mixWave = new MixBlock("mixWave", {
        inputA: "mappingBase",
        inputB: "waveSaw",
        mode: "mix",
        factor: 0.6
    });

    // Voronoi branché sur le résultat
    const voronoi = new VoronoiBlock("voronoi", {
        input: "mixWave",
        scale: 3.0,
        detail: 1,
        roughness: 0.5,
        lacunarity: 2.0,
        randomness: 0.8,
        mode: "F1",
        metric: "euclidean"
    });

    // ColorRamp marbre
    const colorRamp = new ColorRampBlock("colorRamp", {
        input: "voronoi.r",
    positions: [0.0, 0.12, 0.3, 0.6, 1.0],
        colors: [
            [25,  80,  70],    // ← plus sombre pour les taches
            [55,  130, 115],   // vert moyen
            [95,  190, 170],   // vert-bleu clair ← dominant
            [120, 205, 185],   // turquoise clair
            [75,  160, 140],   // retour vert moyen
        ],
        mode: "linear"
    });

    const roughnessFinal = new MapRange("roughnessFinal", {
        input: "voronoi.r",
        fromMin: 0.0,
        fromMax: 1.0,
        toMin: 0.2,
        toMax: 0.05,
        mode: "linear"
    });

    const bump = new BumpMultiplierBlock("bump", {
        input: "voronoi",
        factor: 0.05
    });

    const output = new ConnectionBlock("output", {
        color: "colorRamp",
        roughness: "roughnessFinal",
        metallic: "0.0",
        bump: "bump"
    });

    return [
        mappingBase,
        noiseMix,
        mixNoise,
        waveSaw,
        mixWave,
        voronoi,
        colorRamp,
        roughnessFinal,
        bump,
        output
    ];
}