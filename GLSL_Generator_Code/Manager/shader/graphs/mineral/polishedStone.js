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
        default: 2.0
      },
      {
        label: "Base scale",
        targets: [{ block: "noiseBase", prop: "scale" }],
        type: "range",
        min: 0.5, max: 10, step: 0.1,
        default: 1.5
      },
      {
        label: "Grain scale",
        targets: [{ block: "noiseGrain", prop: "scale" }],
        type: "range",
        min: 1, max: 30, step: 0.5,
        default: 12.0
      },
      {
        label: "Micro scale",
        targets: [{ block: "noiseMicro", prop: "scale" }],
        type: "range",
        min: 5, max: 60, step: 1,
        default: 30.0
      },
      {
        label: "Grain mix",
        targets: [{ block: "mixAB", prop: "factor" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.6
      },
      {
        label: "Micro mix",
        targets: [{ block: "mixFinal", prop: "factor" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.2
      }
    ],

    "Surface": [
      {
        label: "Roughness min",
        targets: [{ block: "roughnessFinal", prop: "toMin" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.85
      },
      {
        label: "Roughness max",
        targets: [{ block: "roughnessFinal", prop: "toMax" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 1.0
      },
      {
        label: "Bump strength",
        targets: [{ block: "bump", prop: "factor" }],
        type: "range",
        min: 0, max: 2, step: 0.01,
        default: 0.8
      }
    ],

    "Base Color": [
      {
        label: "Dark aggregates",
        targets: [{ block: "colorRamp", prop: "colors", index: 0 }],
        type: "color",
        default: [95, 95, 92]
      },
      {
        label: "Base concrete",
        targets: [{ block: "colorRamp", prop: "colors", index: 1 }],
        type: "color",
        default: [148, 146, 142]
      },
      {
        label: "Light aggregates",
        targets: [{ block: "colorRamp", prop: "colors", index: 2 }],
        type: "color",
        default: [185, 183, 178]
      },
      {
        label: "White aggregates",
        targets: [{ block: "colorRamp", prop: "colors", index: 3 }],
        type: "color",
        default: [210, 208, 204]
      }
    ]
  };
}