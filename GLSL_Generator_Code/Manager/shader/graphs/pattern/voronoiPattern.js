// operators
import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";

// patterns
import { VoronoiBlock } from "../../blocks/patterns/voronoi.js";


export function getGraph() {
    const mapping = new MappingBlock("mapping", {
        scale: [1, 1, 1],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    const voronoi = new VoronoiBlock("voronoi", {
        input: "mapping",
        scale: 2,
        detail: 4,
        roughness: 1,
        lacunarity: 2,
        randomness: 1,
        mode: "F1", // "F1", "F2", "F2-F1", "F1+F2"
        metric: "euclidean" // "euclidean", "manhattan", "chebychev", "minkowski"
    });

    const output = new ConnectionBlock("output", {
        color: "voronoi",
        roughness: "voronoi",
        metal: 0
    });

    return [mapping, voronoi, output];
}