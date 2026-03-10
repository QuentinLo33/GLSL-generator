import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";

import {MagicTextureBlock} from "../../blocks/patterns/magicTexture.js"

export function getGraph() {
    const mapping1 = new MappingBlock("mapping1", {
        scale: [1, 1, 1],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    const magic1=new MagicTextureBlock ("magic1", {
        input:"mapping1",
        scale:5,
        depth:2,
        distortion:5
    });

    const output = new ConnectionBlock("output", {
        color: "magic1",
        roughness: "magic1",
        metal: 0
    });

    return [mapping1, magic1, output];
}