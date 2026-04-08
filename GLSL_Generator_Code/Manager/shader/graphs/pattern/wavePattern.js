// operators
import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";

// patterns
import { WaveBlock } from "../../blocks/patterns/wave.js";


export function getGraph() {
    const mapping = new MappingBlock("mapping", {
        scale: [1, 1, 1],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    const wave = new WaveBlock("wave", {
        input: "mapping",
        type: "sine", // "sine", "triangle", "saw",           
        pattern: "bands", // "bands", "rings"
        axis: "X", // "X", "Y", "Z"
        scale: 20.0,
        distortion: 0,
        detail: 3,
        detailScale: 2.0,
        detailRoughness: 0.5,
        phase: 1.0
    });

    const output = new ConnectionBlock("output", {
        color: "wave",
        roughness: "wave",
        metal: 0
    });

    return [mapping, wave, output];
}

export function getParams() {
  return {
    "Pattern": [
      {
        label: "Wave scale",
        targets: [{ block: "wave", prop: "scale" }],
        type: "range",
        min: 1, max: 100, step: 0.5,
        default: 20.0
      },
      {
        label: "Distortion",
        targets: [{ block: "wave", prop: "distortion" }],
        type: "range",
        min: 0, max: 10, step: 0.1,
        default: 0.0
      },
      {
        label: "Detail",
        targets: [{ block: "wave", prop: "detail" }],
        type: "int",
        min: 0, max: 10,
        default: 3
      },
      {
        label: "Detail roughness",
        targets: [{ block: "wave", prop: "detailRoughness" }],
        type: "range",
        min: 0, max: 1, step: 0.01,
        default: 0.5
      },
      {
        label: "Phase",
        targets: [{ block: "wave", prop: "phase" }],
        type: "range",
        min: 0, max: 6.28, step: 0.01,
        default: 1.0
      }
    ]
  };
}