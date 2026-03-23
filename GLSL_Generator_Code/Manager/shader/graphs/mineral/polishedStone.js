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

    const mappingBase = new MappingBlock("mappingBase", {
        scale: [2, 2, 2],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    // Grandes variations de couleur — béton pas uniforme
    const noiseBase = new NoiseBlock("noiseBase", {
        input: "mappingBase",
        scale: 1.5,
        detail: 4,
        roughness: 0.6,
        lacunarity: 2.0,
        distortion: 0.0,
        normalized: true,
        mode: "fBm"
    });

    // Grain fin — texture de surface du béton
    const noiseGrain = new NoiseBlock("noiseGrain", {
        input: "mappingBase",
        scale: 12.0,
        detail: 6,
        roughness: 0.7,
        lacunarity: 2.0,
        distortion: 0.0,
        normalized: true,
        mode: "fBm"
    });

    // Micro-grain — pores et granulats
    const noiseMicro = new NoiseBlock("noiseMicro", {
        input: "mappingBase",
        scale: 30.0,
        detail: 3,
        roughness: 0.5,
        lacunarity: 2.0,
        distortion: 0.0,
        normalized: true,
        mode: "fBm"
    });

    // Mix base + grain
    const mixAB = new MixBlock("mixAB", {
        inputA: "noiseBase",
        inputB: "noiseGrain",
        mode: "multiply",
        factor: 0.6
    });

    // Mix + micro
    const mixFinal = new MixBlock("mixFinal", {
        inputA: "mixAB",
        inputB: "noiseMicro",
        mode: "mix",
        factor: 0.2
    });

    // ColorRamp béton — gris froid
    const colorRamp = new ColorRampBlock("colorRamp", {
        input: "mixFinal.r",
        positions: [0.0, 0.3, 0.6, 1.0],
        colors: [
            [95,  95,  92],    // gris foncé — zones humides/ombres
            [148, 146, 142],   // gris moyen ← dominant
            [185, 183, 178],   // gris clair
            [210, 208, 204],   // gris très clair — granulats clairs
        ],
        mode: "linear"
    });

    // Béton = très rugueux, aucun reflet
    const bump = new BumpMultiplierBlock("bump", {
        input: "mixFinal",
        factor: 0.8    // ← était 0.35, beaucoup plus fort
    });

    const roughnessFinal = new MapRange("roughnessFinal", {
        input: "mixFinal.r",
        fromMin: 0.0,
        fromMax: 1.0,
        toMin: 1.0,   // ← quasi 1.0
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
        mappingBase,
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