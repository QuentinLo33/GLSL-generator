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
    const mapping1 = new MappingBlock("mapping1", {
        scale: [3, 3, 3],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    // Voronoi pour les grandes taches camo
    const voronoi1 = new VoronoiBlock("voronoi1", {
        input: "mapping1",
        scale: 2.5,
        detail: 1,
        roughness: 0.5,
        lacunarity: 2,
        randomness: 0.9,
        mode: "F1",
        metric: "euclidean"
    });

    // Noise pour déformer les bords des taches
    const noise1 = new NoiseBlock("noise1", {
        input: "mapping1",
        scale: 4,
        detail: 6,
        roughness: 0.6,
        lacunarity: 2,
        distortion: 0,
        normalized: true
    });

    // Mix voronoi + noise pour des bords organiques irréguliers
    const mixCamo = new MixBlock("mixCamo", {
        inputA: "voronoi1",
        inputB: "noise1",
        mode: "add",
        factor: 0.35
    });

    // Second noise pour subdiviser les taches (détail interne)
    const noise2 = new NoiseBlock("noise2", {
        input: "mapping1",
        scale: 8,
        detail: 4,
        roughness: 0.5,
        lacunarity: 2,
        distortion: 0,
        normalized: true
    });

    const mixDetail = new MixBlock("mixDetail", {
        inputA: "mixCamo",
        inputB: "noise2",
        mode: "multiply",
        factor: 0.5
    });

    // Remap pour bien étaler les valeurs sur [0,1]
    const remap = new MapRange("remap", {
        input: "mixDetail.r",
        fromMin: 0.0,
        fromMax: 1.0,
        toMin: 0.0,
        toMax: 1.0,
        mode: "smoothstep"
    });

    // ColorRamp palette woodland
    const colorRamp = new ColorRampBlock("colorRamp", {
        input: "remap.r",
        positions: [0.0, 0.3, 0.55, 0.8, 1.0],
        colors: [
            [34,  45,  22],   // vert très sombre
            [72,  83,  45],   // vert kaki
            [101, 85,  58],   // brun terre
            [185, 170, 112],  // beige sable
            [72,  83,  45],   // retour kaki (pour casser la monotonie)
        ],
        mode: "constant"  // bords francs = camouflage militaire
    });

    // Grain de toile militaire (texture rugueuse)
    const mappingWave = new MappingBlock("mappingWave", {
        scale: [80, 80, 80],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    const waveX = new WaveBlock("waveX", {
        input: "mappingWave",
        type: "sine",
        pattern: "bands",
        axis: "X",
        scale: 1.0,
        distortion: 0.3,
        detail: 2,
        detailScale: 2.0,
        detailRoughness: 0.5,
        phase: 0.0
    });

    const waveY = new WaveBlock("waveY", {
        input: "mappingWave",
        type: "sine",
        pattern: "bands",
        axis: "Y",
        scale: 1.0,
        distortion: 0.3,
        detail: 2,
        detailScale: 2.0,
        detailRoughness: 0.5,
        phase: 0.0
    });

    const mixWeave = new MixBlock("mixWeave", {
        inputA: "waveX",
        inputB: "waveY",
        mode: "multiply",
        factor: 1.0
    });

    // Roughness : tissu mat militaire, légèrement modulé par le tissage
    const roughnessFinal = new MapRange("roughnessFinal", {
        input: "mixWeave.r",
        fromMin: -1.0,
        fromMax: 1.0,
        toMin: 0.85,  // très mat
        toMax: 0.65,
        mode: "linear"
    });

    // Bump : relief du tissage
    const bump = new BumpMultiplierBlock("bump", {
        input: "mixWeave",
        factor: 0.2
    });

    const output = new ConnectionBlock("output", {
        color: "colorRamp",
        roughness: "roughnessFinal",
        metallic: "0.0",
        bump: "bump"
    });

    return [
        mapping1,
        voronoi1,
        noise1,
        mixCamo,
        noise2,
        mixDetail,
        remap,
        colorRamp,
        mappingWave,
        waveX,
        waveY,
        mixWeave,
        roughnessFinal,
        bump,
        output
    ];
}