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


export function getParams() {
  return {
    "Pattern": [
      {
        label: "Scale",
        targets: [
          { block: "mapping", prop: "scale", transform: v => [v, v, v] },
          { block: "voronoi", prop: "scale", transform: v => v * 0.75  }
        ],
        type: "range",
        min: 1, max: 10, step: 0.1,
        default: 4.0
      },
      {
        label: "Vein density",
        targets: [{ block: "waveSaw", prop: "scale" }],
        type: "range",
        min: 1, max: 15, step: 0.1,
        default: 5.0
      },
      {
        label: "Deformation",
        targets: [{ block: "mixDeformation", prop: "factor" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.8
      },
      {
        label: "Vein mix",
        targets: [{ block: "mixWave", prop: "factor" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.6
      },
      {
        label: "Randomness",
        targets: [{ block: "voronoi", prop: "randomness" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.8
      }
    ],

    "Surface": [
      {
        label: "Roughness min",
        targets: [{ block: "roughnessFinal", prop: "toMin" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.05
      },
      {
        label: "Roughness max",
        targets: [{ block: "roughnessFinal", prop: "toMax" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.2
      },
      {
        label: "Bump strength",
        targets: [{ block: "bump", prop: "factor" }],
        type: "range",
        min: 0, max: 0.5, step: 0.005,
        default: 0.05
      }
    ],

    "Base Color": [
      {
        label: "Cell center",
        targets: [{ block: "colorRamp", prop: "colors", index: 0 }],
        type: "color",
        default: [25, 80, 70]
      },
      {
        label: "Near center",
        targets: [{ block: "colorRamp", prop: "colors", index: 1 }],
        type: "color",
        default: [55, 130, 115]
      },
      {
        label: "Main surface",
        targets: [{ block: "colorRamp", prop: "colors", index: 2 }],
        type: "color",
        default: [95, 190, 170]
      },
      {
        label: "Light areas",
        targets: [{ block: "colorRamp", prop: "colors", index: 3 }],
        type: "color",
        default: [120, 205, 185]
      },
      {
        label: "Veins",
        targets: [{ block: "colorRamp", prop: "colors", index: 4 }],
        type: "color",
        default: [75, 160, 140]
      }
    ]
  };
}