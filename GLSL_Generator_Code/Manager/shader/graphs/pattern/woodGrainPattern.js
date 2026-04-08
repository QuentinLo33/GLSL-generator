// operators
import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";

// patterns
import { WoodGrainBlock } from "../../blocks/patterns/woodGrain.js";


export function getGraph() {
    const mapping = new MappingBlock("mapping", {
        scale: [1, 1, 1],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    const woodGrain = new WoodGrainBlock("woodGrain", {
        input: "mapping",
        scale: 2.5,
        distortion: 2.0,
        noiseScale: 0.25
    });

    const output = new ConnectionBlock("output", {
        color: "woodGrain",
        roughness: "woodGrain",
        metal: 0
    });

    return [mapping, woodGrain, output];
}

export function getParams() {
  return {
    "Pattern": [
      {
        label: "Grain scale",
        targets: [{ block: "woodGrain", prop: "scale" }],
        type: "range",
        min: 0.5, max: 15, step: 0.1,
        default: 2.5
      },
      {
        label: "Distortion",
        targets: [{ block: "woodGrain", prop: "distortion" }],
        type: "range",
        min: 0, max: 10, step: 0.05,
        default: 2.0
      },
      {
        label: "Noise scale",
        targets: [{ block: "woodGrain", prop: "noiseScale" }],
        type: "range",
        min: 0, max: 2, step: 0.01,
        default: 0.25
      }
    ]
  };
}