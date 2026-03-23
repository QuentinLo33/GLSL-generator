// operators
import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";
import { MixBlock } from "../../blocks/operators/mix.js";
import { BumpMultiplierBlock } from "../../blocks/operators/bumpMultiplier.js";

// patterns
import { NoiseBlock } from "../../blocks/patterns/noise.js";
import { VoronoiBlock } from "../../blocks/patterns/voronoi.js";


export function getGraph() {
    // ── Mappings ──────────────────────────────────────────────────────────────
    // UV
    const mapping = new MappingBlock("mapping", {
        scale: [1, 1, 1],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });
    
    // Noise deformation
    const noiseDeformation = new NoiseBlock("noiseDeformation", {
        input: "mapping",
        scale: 10,
        detail: 12,
        roughness: 0.5,
        lacunatrity: 2,
        distortion: 3,
        normalized: true
    });
    
    // Deformation mapping
    const mixDeformation = new MixBlock("mixDeformation", {
        inputA: "mapping",
        inputB: "noiseDeformation",
        mode: "mix",
        factor: 0.03
    });

    // ── Pattern ──────────────────────────────────────────────────────────────
    const voronoi = new VoronoiBlock("voronoi", {
        input: "mixDeformation",
            scale: 80.0,
            detail: 1,
            roughness: 0.5,
            lacunarity: 2.0,
            randomness: 0.8,
            mode: "F1",
            metric: "euclidean"
        });



    // ── Connection ──────────────────────────────────────────────────────────────
    // Bump
    const bump = new BumpMultiplierBlock("bump", {
        input: "voronoi",
        factor: 1
    });

    const output = new ConnectionBlock("output", {
        color: "#1b1b1b",
        roughness: 0.92,
        bump: "bump",
        metallic: 0
    });

    return [
        mapping,
        noiseDeformation,
        mixDeformation,
        voronoi,
        bump,
        output
    ];
}