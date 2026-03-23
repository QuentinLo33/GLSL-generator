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
    // ── Mappings ──────────────────────────────────────────────────────────────
    // UV
    const mappingUV = new MappingBlock("mappingUV", {
        scale: [1, 1, 1],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "uv"
    });

    // Noise deformation
    const noiseDeformation = new NoiseBlock("noiseDeformation", {
        input: "mappingUV",
        scale: 1,
        detail: 12,
        roughness: 0.5,
        lacunatrity: 2,
        distortion: 3,
        normalized: true
    });

    // Deformation mapping
    const mixDeformation = new MixBlock("mixDeformation", {
        inputA: "mappingUV",
        inputB: "noiseDeformation",
        mode: "mix",
        factor: 0.05
    });

    // ── Weaving ──────────────────────────────────────────────────────────────
    // Wave X
    const waveX = new WaveBlock("waveX", {
        input: "mixDeformation",
        type: "sine",
        pattern: "bands",
        axis: "X",
        scale: 1000.0,
        distortion: 2.0,
        detail: 3,
        detailScale: 2.0,
        detailRoughness: 0.5,
        phase: 1.0
    });

    // Wave Y
    const waveY = new WaveBlock("waveY", {
        input: "mixDeformation",
        type: "sine",
        pattern: "bands",
        axis: "Y",
        scale: 1000.0,
        distortion: 2.0,
        detail: 3,
        detailScale: 2.0,
        detailRoughness: 0.5,
        phase: 1.0
    });

    // Mix: Wave X, Wave Y
    const mixWaves = new MixBlock("mixWaves", {
        inputA: "waveX",
        inputB: "waveY",
        mode: "multiply",
        factor: 0.5
    });

    const wavesRemap = new MapRange("wavesRemap", {
        input: "mixWaves.r",
        fromMin: 0.3,
        fromMax: 1.0,
        toMin: 0.0,
        toMax: 1.0,
        mode: "smoothstep"
    });

    // ── Connection ──────────────────────────────────────────────────────────────
    // Color
    const colorRamp = new ColorRampBlock("colorRamp", {
        input: "wavesRemap.r",  // ← utilise waveRemap pas mixWave
        positions: [0.0, 0.7, 1.0],
        colors: [
            [31, 31, 115],   // fibre
            [31, 31, 115],  // border hole
            [24, 24, 99],  // center hole
        ],
        mode: "linear"
    });
    
    // Roughness
    const roughnessFinal = new MapRange("roughnessFinal", {
        input: "wavesRemap.r",
        fromMin: 0.0,
        fromMax: 1.0,
        toMin: 0.75,   // intersections
        toMax: 0.45,   // wires
        mode: "linear"
    });

    // Bump
    const bump = new BumpMultiplierBlock("bump", {
        input: "mixWaves",
        factor: 0.15
    });


    const output = new ConnectionBlock("output", {
        color: "colorRamp",
        roughness: "roughnessFinal",
        metallic: "0.0",
        bump: "bump"
    });

    return [
        mappingUV,
        noiseDeformation,
        mixDeformation,
        
        waveX,
        waveY,
        mixWaves,
        wavesRemap,

        colorRamp,
        roughnessFinal,
        bump,
        output
    ];
}