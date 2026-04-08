import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";
import { NoiseBlock } from "../../blocks/patterns/noise.js";
import { ColorRampBlock } from "../../blocks/operators/colorRamp.js";
import { MixBlock } from "../../blocks/operators/mix.js";
import { MapRange } from "../../blocks/operators/mapRange.js";
import { BumpMultiplierBlock } from "../../blocks/operators/bumpMultiplier.js";
import { WaveBlock } from "../../blocks/patterns/wave.js";

export function getGraph() {
    // ── Mapping Weaving ──────────────────────────────────────────────────────────────
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
        factor: 0.5
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

    // ── Camo pattern ──────────────────────────────────────────────────────────
    // Local
    const mappingLocal = new MappingBlock("mappingLocal", {
        scale: [4, 4, 4],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    // Large noise
    const noiseCamo1 = new NoiseBlock("noiseCamo1", {
        input: "mappingLocal",
        scale: 1.0,
        detail: 3,
        roughness: 0.5,
        lacunarity: 2.0,
        distortion: 0.5,
        normalized: true,
        mode: "fBm"
    });

    // Small noise
    const noiseCamo2 = new NoiseBlock("noiseCamo2", {
        input: "mappingLocal",
        scale: 3.0,
        detail: 2,
        roughness: 0.5,
        lacunarity: 2.0,
        distortion: 0.3,
        normalized: true,
        mode: "fBm"
    });

    // Mix: noiseCamo1, noiseCamo2
    const mixCamo = new MixBlock("mixCamo", {
        inputA: "noiseCamo1",
        inputB: "noiseCamo2",
        mode: "mix",
        factor: 0.15 
    });


    // ── Connection ──────────────────────────────────────────────────────────────
    // Color
    const colorRamp = new ColorRampBlock("colorRamp", {
        input: "mixCamo.r",
        positions: [0.0, 0.4, 0.6, 1.0],
        colors: [
            [20,  50,  20],    // main
            [55,  90,  35],    // spot 1
            [80,  60,  30],    // spot 2
            [20,  250,  20],   // main
        ],
        mode: "constant"
    });


    // Roughness
    const roughnessFinal = new MapRange("roughnessFinal", {
        input: "wavesRemap.r",
        fromMin: 0.0,
        fromMax: 1.0,
        toMin: 0.75,
        toMax: 0.45,
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

        mappingLocal, 
        noiseCamo1,
        noiseCamo2,
        mixCamo,  

        colorRamp,
        roughnessFinal,
        bump,
        output
    ];
}

export function getParams() {
  return {
    "Weave": [
      {
        label: "Thread density",
        targets: [
          { block: "waveX", prop: "scale" },
          { block: "waveY", prop: "scale" }
        ],
        type: "range",
        min: 100, max: 3000, step: 10,
        default: 1000.0
      },
      {
        label: "Thread distortion",
        targets: [
          { block: "waveX", prop: "distortion" },
          { block: "waveY", prop: "distortion" }
        ],
        type: "range",
        min: 0, max: 10, step: 0.1,
        default: 2.0
      },
      {
        label: "Weave contrast",
        targets: [{ block: "wavesRemap", prop: "fromMin" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.3
      },
      {
        label: "Fabric deformation",
        targets: [{ block: "mixDeformation", prop: "factor" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.5
      },
      {
        label: "Bump strength",
        targets: [{ block: "bump", prop: "factor" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.15
      }
    ],

    "Camo Pattern": [
      {
        label: "Camo scale",
        targets: [
          { block: "mappingLocal", prop: "scale", transform: v => [v, v, v] }
        ],
        type: "range",
        min: 0.5, max: 15, step: 0.1,
        default: 4.0
      },
      {
        label: "Large patch scale",
        targets: [{ block: "noiseCamo1", prop: "scale" }],
        type: "range",
        min: 0.1, max: 5, step: 0.1,
        default: 1.0
      },
      {
        label: "Small patch scale",
        targets: [{ block: "noiseCamo2", prop: "scale" }],
        type: "range",
        min: 0.5, max: 10, step: 0.1,
        default: 3.0
      },
      {
        label: "Patch mix",
        targets: [{ block: "mixCamo", prop: "factor" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.15
      }
    ],

    "Surface": [
      {
        label: "Roughness thread",
        targets: [{ block: "roughnessFinal", prop: "toMax" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.45
      },
      {
        label: "Roughness hole",
        targets: [{ block: "roughnessFinal", prop: "toMin" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.75
      }
    ],

    "Base Color": [
      {
        label: "Dark",
        targets: [{ block: "colorRamp", prop: "colors", index: 0 }],
        type: "color",
        default: [20, 50, 20]
      },
      {
        label: "Spot 1",
        targets: [{ block: "colorRamp", prop: "colors", index: 1 }],
        type: "color",
        default: [55, 90, 35]
      },
      {
        label: "Spot 2",
        targets: [{ block: "colorRamp", prop: "colors", index: 2 }],
        type: "color",
        default: [80, 60, 30]
      },
      {
        label: "Light",
        targets: [{ block: "colorRamp", prop: "colors", index: 3 }],
        type: "color",
        default: [20, 250, 20]
      }
    ]
  };
}