// operators
import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";
import { MixBlock } from "../../blocks/operators/mix.js";
import { BumpMultiplierBlock } from "../../blocks/operators/bumpMultiplier.js";
import { ColorRampBlock } from "../../blocks/operators/colorRamp.js";
import { MapRange } from "../../blocks/operators/mapRange.js";

// patterns
import { NoiseBlock } from "../../blocks/patterns/noise.js";
import { VoronoiBlock } from "../../blocks/patterns/voronoi.js";
import { WaveBlock } from "../../blocks/patterns/wave.js";


export function getGraph() {

    // ── Mapping ──────────────────────────────────────────────────────────────
    // Mapping
    const mapping = new MappingBlock("mapping", {
        scale: [4, 4, 4],   // ← plus grand = veines plus fines
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    // Noise Deformation
    const noiseDeformation = new NoiseBlock("noiseDeformation", {
        input: "mapping",
        scale: 1.5,
        detail: 5,
        roughness: 0.5,
        lacunarity: 2.0,
        distortion: 0.0,
        normalized: true,
        mode: "fBm"
    });

    // Mapping Deformation
    const mixDeformation = new MixBlock("mixDeformation", {
        inputA: "mapping",
        inputB: "noiseDeformation",
        mode: "mix",
        factor: 0.8
    });

    // ── Pattern ──────────────────────────────────────────────────────────────
    // Wave Saw
    const waveSaw = new WaveBlock("waveSaw", {
        input: "mixDeformation",
        type: "saw",
        pattern: "bands",
        axis: "X",
        scale: 5.0,
        distortion: 0.0,
        detail: 0,
        detailScale: 1.0,
        detailRoughness: 0.5,
        phase: 0.0
    });

    // Mix: mapping, wave
    const mixWave = new MixBlock("mixWave", {
        inputA: "mapping",
        inputB: "waveSaw",
        mode: "mix",
        factor: 0.6
    });

    // Voronoi
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

    // ── Connection ──────────────────────────────────────────────────────────────
    // Color
    const colorRamp = new ColorRampBlock("colorRamp", {
        input: "voronoi.r",
        positions: [0.0, 0.12, 0.3, 0.6, 1.0],
        colors: [
            [25,  80,  70],    // cell center — darkest/deepest areas
            [55,  130, 115],   // near the center — quick transition
            [95,  190, 170],   // main surface ← dominant (the majority of pixels)
            [120, 205, 185],   // light areas, near the edges
            [75,  160, 140],   // edges between cells — dark return (veins)
        ],
        mode: "linear"
    });

    // Roughness
    const roughnessFinal = new MapRange("roughnessFinal", {
        input: "voronoi.r",
        fromMin: 0.0,
        fromMax: 1.0,
        toMin: 0.2,
        toMax: 0.05,
        mode: "linear"
    });

    // Bump
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
        mapping,
        noiseDeformation,
        mixDeformation,

        waveSaw,
        mixWave,
        voronoi,

        colorRamp,
        roughnessFinal,
        bump,
        output
    ];
}
