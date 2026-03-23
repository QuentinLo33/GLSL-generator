// operators
import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";
import { BumpMultiplierBlock } from "../../blocks/operators/bumpMultiplier.js";
import { ColorRampBlock } from "../../blocks/operators/colorRamp.js";
import { MapRange } from "../../blocks/operators/mapRange.js";

// patterns
import { NoiseBlock } from "../../blocks/patterns/noise.js";


export function getGraph() {

    const mapping1 = new MappingBlock("mapping1", {
        scale: [2, 2, 2],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    const noiseSurface = new NoiseBlock("noiseSurface", {
        input: "mapping1",
        scale: 3.0,
        detail: 5,
        roughness: 0.55,
        lacunarity: 2.0,
        distortion: 0.0,
        normalized: true
    });

    // Argent : gris très froid, quasi blanc sur les reflets
    const colorsteel = new ColorRampBlock("colorsteel", {
        input: "noiseSurface.r",
        positions: [0, 0.25, 0.55, 0.8, 1.0],
        colors: [
            [155, 155, 158],  // creux — gris moyen
            [188, 188, 192],  // argent foncé
            [210, 210, 213],  // argent moyen
            [228, 228, 230],  // argent clair
            [245, 245, 247],  // reflet blanc
        ],
        mode: "smooth"
    });

    // Argent très poli — roughness très basse
    const roughness = new MapRange("roughness", {
        input: "noiseSurface.r",
        fromMin: 0, fromMax: 1,
        toMin: 0.05,
        toMax: 0.22,
        mode: "linear"
    });

    const bump = new BumpMultiplierBlock("bump", {
        input: "noiseSurface",
        factor: 0.08
    });

    const output = new ConnectionBlock("output", {
        color: "colorsteel",
        roughness: "roughness",
        bump: "bump",
        metallic: 0.98
    });

    return [mapping1, noiseSurface, colorsteel, roughness, bump, output];
}