// operators
import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";

// patterns
import {MagicTextureBlock} from "../../blocks/patterns/magicTexture.js"


export function getGraph() {
    const mapping = new MappingBlock("mapping", {
        scale: [1, 1, 1],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    const magic=new MagicTextureBlock ("magic", {
        input:"mapping",
        scale:5,
        depth:2,
        distortion:5
    });

    const output = new ConnectionBlock("output", {
        color: "magic",
        roughness: "magic",
        metal: 0
    });

    return [mapping, magic, output];
}

export function getParams() {
  return {
    "Pattern": [
      {
        label: "Magic scale",
        targets: [{ block: "magic", prop: "scale" }],
        type: "range",
        min: 0.5, max: 20, step: 0.1,
        default: 5.0
      },
      {
        label: "Depth",
        targets: [{ block: "magic", prop: "depth" }],
        type: "int",
        min: 1, max: 10,
        default: 2
      },
      {
        label: "Distortion",
        targets: [{ block: "magic", prop: "distortion" }],
        type: "range",
        min: 0, max: 20, step: 0.1,
        default: 5.0
      }
    ]
  };
}