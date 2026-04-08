// operators
import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";
import { MixBlock } from "../../blocks/operators/mix.js";
import { MapRange } from "../../blocks/operators/mapRange.js";
import { BumpMultiplierBlock } from "../../blocks/operators/bumpMultiplier.js";
import { ColorRampBlock } from "../../blocks/operators/colorRamp.js";

// patterns
import { NoiseBlock } from "../../blocks/patterns/noise.js";
import { VoronoiBlock } from "../../blocks/patterns/voronoi.js";
import { WoodGrainBlock } from "../../blocks/patterns/woodGrain.js";


export function getGraph() {
    // ── Mapping ──────────────────────────────────────────────────────────────
    const mapping = new MappingBlock("mapping", {
        scale: [1, 2, 1],   // ← plus étiré en Y = lignes plus longues
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    // ── Grain ──────────────────────────────────────────────────────────────
    // Grain1
    const woodGrain = new WoodGrainBlock("woodGrain", {
        input: "mapping",
        scale: 6.0,
        distortion: 1.5,
        noiseScale: 0.4
    });

    // Grain2
    const woodGrain2 = new WoodGrainBlock("woodGrain2", {
        input: "mapping",
        scale: 2.5,
        distortion: 2.0,
        noiseScale: 0.25
    });

    // Mix: Grain1, Grain2
    const mixGrain = new MixBlock("mixGrain", {
        inputA: "woodGrain",
        inputB: "woodGrain2",
        mode: "multiply",
        factor: 0.5
    });

    // ── Knot ──────────────────────────────────────────────────────────────
    // Noise knot
    const noiseKnot = new NoiseBlock("noiseKnot", {
        input: "mapping",
        scale: 0.8,
        detail: 2,
        roughness: 0.5,
        lacunarity: 2.0,
        distortion: 0.0,
        normalized: false,
        mode: "fBm"
    });

    // Voronoi knot
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

    // Mix: Noise, Voronoi
    const mixFinal = new MixBlock("mixFinal", {
        inputA: "mixGrain",
        inputB: "knotRemap",
        mode: "multiply",
        factor: 0.4
    });

    // ── Connection──────────────────────────────────────────────────────────────
    // Color
    const colorRamp = new ColorRampBlock("colorRamp", {
        input: "mixFinal.r",
        positions: [0.2, 0.1, 0.35, 0.65, 1.0],
        colors: [
            [140,  80,  25], // dark waves
            [150, 90,  35], // border waves
            [205, 148, 62], // middle waves
            [232, 195, 115], // random spot
            [222, 185, 105], // random spot center
        ],
        mode: "smooth"
    });

    // Roughness
    const roughnessFinal = new MapRange("roughnessFinal", {
        input: "mixFinal.r",
        fromMin: 0.0,
        fromMax: 1.0,
        toMin: 0.4,
        toMax: 0.12,
        mode: "linear"
    });

    // Bump
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
        mapping,

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

export function getParams() {
  return {
    "Pattern": [
      {
        label: "Scale",
        targets: [
          { block: "mapping", prop: "scale", transform: v => [v, v * 2, v] }
        ],
        type: "range",
        min: 0.5, max: 5, step: 0.1,
        default: 1.0
      },
      {
        label: "Grain 1 density",
        targets: [{ block: "woodGrain", prop: "scale" }],
        type: "range",
        min: 1, max: 15, step: 0.1,
        default: 6.0
      },
      {
        label: "Grain 1 distortion",
        targets: [{ block: "woodGrain", prop: "distortion" }],
        type: "range",
        min: 0, max: 5, step: 0.05,
        default: 1.5
      },
      {
        label: "Grain 2 density",
        targets: [{ block: "woodGrain2", prop: "scale" }],
        type: "range",
        min: 1, max: 15, step: 0.1,
        default: 2.5
      },
      {
        label: "Grain 2 distortion",
        targets: [{ block: "woodGrain2", prop: "distortion" }],
        type: "range",
        min: 0, max: 5, step: 0.05,
        default: 2.0
      },
      {
        label: "Knot intensity",
        targets: [{ block: "mixFinal", prop: "factor" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.4
      },
      {
        label: "Knot size",
        targets: [{ block: "voronoiKnot", prop: "scale" }],
        type: "range",
        min: 0.5, max: 8, step: 0.1,
        default: 2.5
      }
    ],

    "Surface": [
      {
        label: "Roughness min",
        targets: [{ block: "roughnessFinal", prop: "toMin" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.12
      },
      {
        label: "Roughness max",
        targets: [{ block: "roughnessFinal", prop: "toMax" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.4
      },
      {
        label: "Bump strength",
        targets: [{ block: "bump", prop: "factor" }],
        type: "range",
        min: 0, max: 0.5, step: 0.005,
        default: 0.15
      }
    ],

    "Base Color": [
      {
        label: "Dark waves",
        targets: [{ block: "colorRamp", prop: "colors", index: 0 }],
        type: "color",
        default: [140, 80, 25]
      },
      {
        label: "Border waves",
        targets: [{ block: "colorRamp", prop: "colors", index: 1 }],
        type: "color",
        default: [150, 90, 35]
      },
      {
        label: "Mid waves",
        targets: [{ block: "colorRamp", prop: "colors", index: 2 }],
        type: "color",
        default: [205, 148, 62]
      },
      {
        label: "Knot edge",
        targets: [{ block: "colorRamp", prop: "colors", index: 3 }],
        type: "color",
        default: [232, 195, 115]
      },
      {
        label: "Knot center",
        targets: [{ block: "colorRamp", prop: "colors", index: 4 }],
        type: "color",
        default: [222, 185, 105]
      }
    ]
  };
}