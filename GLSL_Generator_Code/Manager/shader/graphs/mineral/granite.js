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


export function getParams() {
  return {
    "Pattern": [
      {
        label: "Scale",
        targets: [
          { block: "mapping", prop: "scale", transform: v => [v, v, v] }
        ],
        type: "range",
        min: 0.5, max: 10, step: 0.1,
        default: 3.0
      },
      {
        label: "Large spots scale",
        targets: [{ block: "noiseA", prop: "scale" }],
        type: "range",
        min: 0.5, max: 20, step: 0.1,
        default: 4.0
      },
      {
        label: "Medium spots scale",
        targets: [{ block: "noiseB", prop: "scale" }],
        type: "range",
        min: 0.5, max: 20, step: 0.1,
        default: 8.0
      },
      {
        label: "Micro spots scale",
        targets: [{ block: "noiseC", prop: "scale" }],
        type: "range",
        min: 0.5, max: 20, step: 0.1,
        default: 8.0
      },
      {
        label: "Contrast min",
        targets: [{ block: "remapA", prop: "fromMin" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.25
      },
      {
        label: "Contrast max",
        targets: [{ block: "remapA", prop: "fromMax" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.55
      }
    ],

    "Surface": [
      {
        label: "Roughness min",
        targets: [{ block: "roughnessFinal", prop: "toMin" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.3
      },
      {
        label: "Roughness max",
        targets: [{ block: "roughnessFinal", prop: "toMax" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.45
      },
      {
        label: "Bump strength",
        targets: [{ block: "bump", prop: "factor" }],
        type: "range",
        min: 0, max: 0.5, step: 0.005,
        default: 0.2
      }
    ],

    "Base Color": [
      {
        label: "Spot center",
        targets: [{ block: "colorRamp", prop: "colors", index: 0 }],
        type: "color",
        default: [20, 15, 12]
      },
      {
        label: "Background",
        targets: [{ block: "colorRamp", prop: "colors", index: 1 }],
        type: "color",
        default: [185, 135, 105]
      },
      {
        label: "Spot border",
        targets: [{ block: "colorRamp", prop: "colors", index: 2 }],
        type: "color",
        default: [230, 200, 175]
      }
    ]
  };
}