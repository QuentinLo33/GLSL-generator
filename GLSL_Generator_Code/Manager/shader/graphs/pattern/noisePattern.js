// operators
import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";

// patterns
import { NoiseBlock } from "../../blocks/patterns/noise.js";


export function getGraph() {
    const mapping = new MappingBlock("mapping", {
        scale: [1, 1, 1],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    const noise = new NoiseBlock("noise", {
        inputA: "mapping",
        scale:8,
        detail:8,
        roughness: 0.6,
        lacunatrity:3,
        distortion:0,
        normalized:true,
        mode: "fBm"  // "fBm", "heteroTerrain"
    });

    const output = new ConnectionBlock("output", {
        color: "noise",
        roughness: "noise",
        metal: 0
    });

    return [mapping, noise, output];
}

export function getParams() {
  return {
    "Pattern": [
      {
        label: "Noise scale",
        targets: [{ block: "noise", prop: "scale" }],
        type: "range",
        min: 0.5, max: 30, step: 0.5,
        default: 8.0
      },
      {
        label: "Detail",
        targets: [{ block: "noise", prop: "detail" }],
        type: "int",
        min: 1, max: 16,
        default: 8
      },
      {
        label: "Roughness",
        targets: [{ block: "noise", prop: "roughness" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.6
      },
      {
        label: "Distortion",
        targets: [{ block: "noise", prop: "distortion" }],
        type: "range",
        min: 0, max: 5, step: 0.01,
        default: 0.0
      }
    ]
  };
}