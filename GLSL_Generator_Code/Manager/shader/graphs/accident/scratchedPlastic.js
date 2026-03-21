import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";
import { MagicTextureBlock } from "../../blocks/patterns/magicTexture.js";
import { ColorRampBlock } from "../../blocks/operators/colorRamp.js";
import { MapRange } from "../../blocks/operators/mapRange.js";
import { BumpMultiplierBlock } from "../../blocks/operators/bumpMultiplier.js";
import { MixBlock } from "../../blocks/operators/mix.js";
import { NoiseBlock } from "../../blocks/patterns/noise.js";

export function getGraph() {

    const mapping1 = new MappingBlock("mapping1", {
        scale: [1, 4, 1],   // ← étiré en Y = rayures longues
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    // Rayures principales — sin pur, pas de distortion
    const magic1 = new MagicTextureBlock("magic1", {
        input: "mapping1",
        scale: 100.0,      // ← nombre de rayures
        depth: 4,         // ← 1 seul octave = sin pur = rayures nettes
        distortion: 1  // ← zéro distortion = droites
    });

    // Remap agressif pour bords nets
    const rayuresRemap = new MapRange("rayuresRemap", {
        input: "magic1.r",
        fromMin: 0.3,
        fromMax: 0.7,
        toMin: 0.0,
        toMax: 1.0,
        mode: "smoothstep"
    });

    const colorRamp = new ColorRampBlock("colorRamp", {
        input: "rayuresRemap.r",
        positions: [0.0, 0.02, 0.02, 1.0],  // ← transition très dure
        colors: [
            [140, 15,  5],     // rouge très sombre
            [140, 15,  5],     // rouge très sombre
            [220, 45,  25],    // rouge vif
            [220, 45,  25],    // rouge vif
        ],
        mode: "linear"
    });

    const roughnessFinal = new MapRange("roughnessFinal", {
        input: "rayuresRemap.r",
        fromMin: 0.0,
        fromMax: 1.0,
        toMin: 0.5,
        toMax: 0.15,
        mode: "linear"
    });

    const bump = new BumpMultiplierBlock("bump", {
        input: "rayuresRemap",
        factor: 0.4
    });

    const output = new ConnectionBlock("output", {
        color: "rayuresRemap",
        roughness: "roughnessFinal",
        metallic: 0,
        bump: "bump"
    });

    return [
        mapping1,
        magic1,
        rayuresRemap,
        colorRamp,
        roughnessFinal,
        bump,
        output
    ];
}