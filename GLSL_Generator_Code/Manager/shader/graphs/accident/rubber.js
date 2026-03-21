import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";
import { NoiseBlock } from "../../blocks/patterns/noise.js";
import { ColorRampBlock } from "../../blocks/operators/colorRamp.js";
import { MapRange } from "../../blocks/operators/mapRange.js";
import { BumpMultiplierBlock } from "../../blocks/operators/bumpMultiplier.js";
import { MixBlock } from "../../blocks/operators/mix.js";
import { VoronoiBlock } from "../../blocks/patterns/voronoi.js";

export function getGraph() {

      const mapping1 = new MappingBlock("mapping1", {
            scale: [1, 1, 1],
            offset: [0, 0, 0],
            rotation: [0, 0, 0],
            mode: "uv"
        });
    
        // 2. Grain / bruit léger pour déformation
        const noise1 = new NoiseBlock("noise1", {
            input: "mapping1",
            scale: 10,
            detail: 12,
            roughness: 0.5,
            lacunatrity: 2,
            distortion: 3,
            normalized: true
        });
    
        const mixDeformation = new MixBlock("mixDeformation", {
            inputA: "mapping1",
            inputB: "noise1",
            mode: "linear",
            factor: 0.2 // très léger pour déformer subtilement
        });

        const voronoi = new VoronoiBlock("voronoi", {
            input: "mixDeformation",
            scale: 30.0,
            detail: 1,
            roughness: 1,
            lacunarity: 2.0,
            randomness: 1,
            mode: "F1",
            metric: "euclidean",
            normalized:false
        });
    

    const bump = new BumpMultiplierBlock("bump", {
        input: "voronoi",
        factor: 0.08
    });

    const output = new ConnectionBlock("output", {
        color: "voronoi",
        roughness: "0.4",
        bump: "bump",
        metallic: 0
    });
        //color: "#303030",
    return [mapping1, noise1, mixDeformation, voronoi, bump, output];
}