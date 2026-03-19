import { MappingBlock } from "../../blocks/operators/mapping.js";
import { NoiseBlock } from "../../blocks/patterns/noise.js";
import { VoronoiBlock } from "../../blocks/patterns/voronoi.js";
import { BumpMultiplierBlock } from "../../blocks/operators/bumpMultiplier.js";
import { ColorRampBlock } from "../../blocks/operators/colorRamp.js";
import { MixBlock } from "../../blocks/operators/mix.js";
import { MagicTextureBlock } from "../../blocks/patterns/magicTexture.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";

export function getGraph() {
    const mapping1 = new MappingBlock("mapping1",{
        scale:[1,1,1],
        offset:[0,0,0],
        rotation:[0,0,0], 
        mode:"local"
    });

    const noise1 = new NoiseBlock("noise1", {
        input:"mapping1",
        scale:2,
        detail:8,
        normalized:true
    });

    const voronoi1 = new VoronoiBlock("voronoi1", {
        input: "mapping1",
        scale: 1,
        detail: 3,
        roughness: 0.5,
        lacunarity: 2,
        randomness: 1
    });

    const bump1 = new BumpMultiplierBlock("bump1", {
        input:"noise1",
        factor:2
    });

    const ramp1 = new ColorRampBlock("ramp1",{
        input:"noise1.r",
        intervals:[[0,0.3],[0.3,0.6],[0.6,1.0]],
        values:[[0,0,0],[1,1,0],[1,1,1]]
    });

    const mix1 = new MixBlock("mix1", {inputA:"noise1", inputB:"voronoi1", mode:"multiply", factor:0.7});

    const output = new ConnectionBlock("output", {
        color: "mapping1",
        roughness: "ramp1",
        bump: "bump1"
    });

    return [mapping1, noise1, voronoi1, bump1, ramp1, mix1, output];
}