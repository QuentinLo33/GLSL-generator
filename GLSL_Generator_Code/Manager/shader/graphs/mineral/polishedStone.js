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
        scale: [2, 2, 2],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    // ── Patterns ──────────────────────────────────────────────────────────────
    // Large noise
    const noiseBase = new NoiseBlock("noiseBase", {
        input: "mapping",
        scale: 1.5,
        detail: 4,
        roughness: 0.6,
        lacunarity: 2.0,
        distortion: 0.0,
        normalized: true,
        mode: "fBm"
    });

    // Medium noise
    const noiseGrain = new NoiseBlock("noiseGrain", {
        input: "mapping",
        scale: 12.0,
        detail: 6,
        roughness: 0.7,
        lacunarity: 2.0,
        distortion: 0.0,
        normalized: true,
        mode: "fBm"
    });

    // Mirco noise
    const noiseMicro = new NoiseBlock("noiseMicro", {
        input: "mapping",
        scale: 30.0,
        detail: 3,
        roughness: 0.5,
        lacunarity: 2.0,
        distortion: 0.0,
        normalized: true,
        mode: "fBm"
    });

    // ── Assembly ──────────────────────────────────────────────────────────────  
    // Mix: large noise, medium noise
    const mixAB = new MixBlock("mixAB", {
        inputA: "noiseBase",
        inputB: "noiseGrain",
        mode: "multiply",
        factor: 0.6
    });

    // Mix: large&medium noise, micro noise
    const mixFinal = new MixBlock("mixFinal", {
        inputA: "mixAB",
        inputB: "noiseMicro",
        mode: "mix",
        factor: 0.2
    });

    // ── Connection ──────────────────────────────────────────────────────────────  
    const colorRamp = new ColorRampBlock("colorRamp", {
        input: "mixFinal.r",
        positions: [0.0, 0.3, 0.6, 1.0],
        colors: [
            [95, 95, 92], // dark aggregates, hollow areas, wet areas
            [148, 146, 142], // standard concrete, base color
            [185, 183, 178], // light aggregates, dry/bright areas
            [210, 208, 204], //white aggregates, quartz, very light areas
        ],
        mode: "linear"
    });

    // Bump
    const bump = new BumpMultiplierBlock("bump", {
        input: "mixFinal",
        factor: 0.8
    });

    // Roughness
    const roughnessFinal = new MapRange("roughnessFinal", {
        input: "mixFinal.r",
        fromMin: 0.0,
        fromMax: 1.0,
        toMin: 1.0,
        toMax: 0.85,
        mode: "linear"
    });

    const output = new ConnectionBlock("output", {
        color: "colorRamp",
        roughness: "roughnessFinal",
        metallic: 0,
        bump: "bump"
    });

    return [
        mapping,

        noiseBase,
        noiseGrain,
        noiseMicro,
        
        mixAB,
        mixFinal,
        
        colorRamp,
        roughnessFinal,
        bump,
        output
    ];
}