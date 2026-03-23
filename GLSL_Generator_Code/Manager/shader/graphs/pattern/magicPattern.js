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