// operators
import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";
import { BumpMultiplierBlock } from "../../blocks/operators/bumpMultiplier.js";
import { ColorRampBlock } from "../../blocks/operators/colorRamp.js";
import { MapRange } from "../../blocks/operators/mapRange.js";

// patterns
import { NoiseBlock } from "../../blocks/patterns/noise.js";


export function getGraph() {

    // ── Mapping ──────────────────────────────────────────────────────────────
    const mapping = new MappingBlock("mapping", {
        scale: [1.3, 1.3, 1.3],  // était 0.8
        offset: [0, 0, 0], rotation: [0, 0, 0], mode: "local"
    });


    // ── Pattern bronze ──────────────────────────────────────────────────────────────
    const noise = new NoiseBlock("noise", {
        input: "mapping",
        scale: 2.5,
        detail: 4,
        roughness: 0.55,
        lacunarity: 2.0,
        distortion: 0.0,
        normalized: true
    });

    // ── Connection ──────────────────────────────────────────────────────────────
    // Color
    const colorRamp = new ColorRampBlock("colorRamp", {
        input: "noise.r",
        positions: [0, 0.3, 0.6, 1.0],
        colors: [
            [120, 60, 15], // deep hollows, shadow areas
            [185, 105, 38], // low main surface
            [215, 140, 55], // illuminated surface
            [235, 168, 68], // high points, metallic highlights
        ],
        mode: "smooth"
    });

    // Roughness
    const roughness = new MapRange("roughness", {
        input: "noise.r",
        fromMin: 0, fromMax: 1,
        toMin: 0.05,
        toMax: 0.25,
        mode: "linear"
    });

    // Bump
    const bump = new BumpMultiplierBlock("bump", {
        input: "noise",
        factor: 0.08
    });

    const output = new ConnectionBlock("output", {
        color: "colorRamp",
        roughness: "roughness",
        bump: "bump",
        metallic: 0.98
    });

    return [
        mapping,

        noise,
        colorRamp,

        roughness,
        bump,
        output
    ];
}


// bronze.js
export function getParams() {
  return {
    "Pattern": [
      {
        label: "Scale",
        targets: [
          { block: "mapping", prop: "scale",      transform: v => [v, v, v] },
          { block: "noise",   prop: "scale",      transform: v => v * 2     }
        ],
        type: "range",
        min: 0.5, max: 5, step: 0.1,
        default: 1.3
      },
      {
        label: "Detail",
        targets: [{ block: "noise", prop: "detail" }],
        type: "int",
        min: 1, max: 16,
        default: 4
      },
      {
        label: "Distortion",
        targets: [{ block: "noise", prop: "distortion" }],
        type: "range",
        min: 0, max: 2, step: 0.01,
        default: 0.0
      }
    ],

    "Surface": [
      {
        label: "Roughness min",
        targets: [{ block: "roughness", prop: "toMin" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.05
      },
      {
        label: "Roughness max",
        targets: [{ block: "roughness", prop: "toMax" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.25
      },
      {
        label: "Metallic",
        targets: [{ block: "output", prop: "metallic" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.98
      },
      {
        label: "Bump strength",
        targets: [{ block: "bump", prop: "factor" }],
        type: "range",
        min: 0, max: 0.5, step: 0.005,
        default: 0.08
      }
    ],

    "Base Color": [
      {
        label: "Shadow",
        targets: [{ block: "colorRamp", prop: "colors", index: 0 }],
        type: "color",
        default: [120, 60, 15]
      },
      {
        label: "Low surface",
        targets: [{ block: "colorRamp", prop: "colors", index: 1 }],
        type: "color",
        default: [185, 105, 38]
      },
      {
        label: "Highlight",
        targets: [{ block: "colorRamp", prop: "colors", index: 2 }],
        type: "color",
        default: [215, 140, 55]
      },
      {
        label: "Peak",
        targets: [{ block: "colorRamp", prop: "colors", index: 3 }],
        type: "color",
        default: [235, 168, 68]
      }
    ]
  };
}