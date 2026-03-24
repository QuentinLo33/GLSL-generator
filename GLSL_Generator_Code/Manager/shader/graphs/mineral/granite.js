// operators
import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";
import { MixBlock } from "../../blocks/operators/mix.js";
import { BumpMultiplierBlock } from "../../blocks/operators/bumpMultiplier.js";
import { ColorRampBlock } from "../../blocks/operators/colorRamp.js";
import { MapRange } from "../../blocks/operators/mapRange.js";

// patterns
import { NoiseBlock } from "../../blocks/patterns/noise.js";


export function getGraph() {

    // ── Mapping ──────────────────────────────────────────────────────────────
    const mapping = new MappingBlock("mapping", {
        scale: [3, 3, 3],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    // ── Pattern ──────────────────────────────────────────────────────────────
    // Large spots
    const noiseA = new NoiseBlock("noiseA", {
        input: "mapping",
        scale: 4.0,
        detail: 16,
        roughness: 0.5,
        lacunarity: 2.0,
        distortion: 0.0,
        normalized: true,
        mode: "fBm"
    });

    // Medium spots
    const noiseB = new NoiseBlock("noiseB", {
        input: "mapping",
        scale: 8.0,
        detail: 16,
        roughness: 0.5,
        lacunarity: 2.0,
        distortion: 0.0,
        normalized: true,
        mode: "fBm"
    });

    // Mirco spots
    const noiseC = new NoiseBlock("noiseC", {
        input: "mapping",
        scale: 8.0,
        detail: 16,
        roughness: 0.5,
        lacunarity: 2.0,
        distortion: 0.0,
        normalized: true,
        mode: "fBm"
    });

    // ── Assembly ──────────────────────────────────────────────────────────────    
    // Mix noiseA, noiseB
    const mixAB = new MixBlock("mixAB", {
        inputA: "noiseA",
        inputB: "noiseB",
        mode: "darken",
        factor: 1.0
    });

    // Mix noiseAB, noiseC
    const mixFinal = new MixBlock("mixFinal", {
        inputA: "mixAB",
        inputB: "noiseC",
        mode: "lighten",
        factor: 1.0
    });

    const remapA = new MapRange("remapA", {
        input: "mixFinal.r",
        fromMin: 0.25,
        fromMax: 0.55,
        toMin: 0.0,
        toMax: 1.0,
        mode: "smoothstep"
    });

    // ── Connection ──────────────────────────────────────────────────────────────
    // Color
    const colorRamp = new ColorRampBlock("colorRamp", {
        input: "remapA.r",
        positions: [0.0, 0.01, 1.0],
        colors: [
            [20,  15,  12],    // center spots
            [185, 135, 105],   // background
            [230, 200, 175],   // border spots
        ],
        mode: "linear"
    });

    // Roughness
    const roughnessFinal = new MapRange("roughnessFinal", {
        input: "mixFinal.r",
        fromMin: 0.0,
        fromMax: 1.0,
        toMin: 0.45,
        toMax: 0.3,
        mode: "linear"
    });

    // Bump
    const bump = new BumpMultiplierBlock("bump", {
        input: "mixFinal",
        factor: 0.2
    });

    const output = new ConnectionBlock("output", {
        color: "colorRamp",
        roughness: "roughnessFinal",
        metallic: "0.0",
        bump: "bump"
    });

    return [
        mapping,

        noiseA,
        noiseB,
        noiseC,
        
        mixAB,
        mixFinal,
        remapA,
        
        colorRamp,
        roughnessFinal,
        bump,
        output
    ];
}