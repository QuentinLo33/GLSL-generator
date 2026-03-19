import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";

import { NoiseBlock } from "../../blocks/patterns/noise.js";
import { VoronoiBlock } from "../../blocks/patterns/voronoi.js";
import { ColorRampBlock } from "../../blocks/operators/colorRamp.js";
import { MixBlock } from "../../blocks/operators/mix.js";
import { MapRange } from "../../blocks/operators/mapRange.js";

export function getGraph() {
    // 1. Mapping
    const mapping1 = new MappingBlock("mapping1", {
        scale: [1, 0.1, 1],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });
    
    const noise1 = new NoiseBlock("noise1", {
        inputA: "mapping1",
        scale: 5,        // échelle du bois
        detail: 12,      // nombre d’octaves pour le grain
        roughness: 0.5,
        lacunatrity: 2,
        distortion: 3,   // torsion des anneaux
        normalized: true
    });

    const mapRange1 = new MapRange("mapRange1", {
        input: "noise1.r",
        fromMin: 0,
        fromMax: 1,
        toMin: 0.2,
        toMax: 1.0,
        mode: "linear"
    });

    const voronoi1 = new VoronoiBlock("voronoi1", {
        input: "mapRange1",
        scale: 3,
        detail: 4,
        roughness: 0.1,      // très doux
        lacunarity: 2.0,
        randomness: 1.0,
        mode: "F2",       // pour les bords subtils
        metric: "euclidean"
    });
    
    const mapRange2 = new MapRange("mapRange2", {
        input: "voronoi1.r",
        fromMin: 0,
        fromMax: 0.3,
        toMin: 0.5,
        toMax: 1.0,
        mode: "linear"
    });
    
    const woodColor = new ColorRampBlock("woodColor",{
        input:"voronoi1.r",

        positions:[
            0,
            0.8,
            0.805
        ],

        colors:[
            [92, 60, 30],       // zone foncée
            [200, 145, 85],      // zone claire
            [92, 60, 30],       // zone foncée
        ],

        mode:"linear"
    });
    const output = new ConnectionBlock("output", {
        color: "woodColor",
        roughness: "mapRange1",
        metal: 0
    });

    return [mapping1, noise1, mapRange1, voronoi1, mapRange2, woodColor, output];
}
