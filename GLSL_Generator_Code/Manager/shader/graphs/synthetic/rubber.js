import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";
import { NoiseBlock } from "../../blocks/patterns/noise.js";
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
            mode: "mix",        // ← "linear" n'existe pas, utilise "mix"
            factor: 0.03
        });

        const voronoi = new VoronoiBlock("voronoi", {
            input: "mixDeformation",
            scale: 200.0,         // ← réduit de 30 à 8 = cellules plus grandes
            detail: 1,
            roughness: 0.5,     // ← était 1, trop élevé
            lacunarity: 2.0,
            randomness: 0.8,    // ← réduit de 1 = moins chaotique
            mode: "F1",      // ← F2-F1 = texture de surface plus intéressante que F1
            metric: "euclidean"
        });


    const bump = new BumpMultiplierBlock("bump", {
        input: "voronoi",  // ← sur le remap
        factor: 1
    });

    const output = new ConnectionBlock("output", {
        color: "#1b1b1b",        // ← hex direct
        roughness: 0.92,         // ← très mat = caoutchouc
        bump: "bump",
        metallic: 0
    });

    return [
        mapping1,
        noise1,
        mixDeformation,
        voronoi,
        bump,
        output
    ];
}