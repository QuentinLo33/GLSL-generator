import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";

import { NoiseBlock } from "../../blocks/patterns/noise.js";
import { VoronoiBlock } from "../../blocks/patterns/voronoi.js";

export function getGraph() {
    const mapping1 = new MappingBlock("mapping1", {
        scale: [1, 1, 1],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    const voronoi1 = new VoronoiBlock("voronoi1", {
        input: "mapping1",
        scale: 2,
        detail: 4,
        roughness: 1,
        lacunarity: 2,
        randomness: 1,
        metric: "chebychev"
    });

    const output = new ConnectionBlock("output", {
        color: "voronoi1",
        roughness: "voronoi1",
        metal: 0
    });

    return [mapping1, voronoi1, output];
}