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
        scale: [1, 1, 1],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    // 2. Pattern
    const noise1 = new NoiseBlock("noise1", {
        inputA: "noise1",
        scale:8,
        detail:8,
        roughness: 0.6,
        lacunatrity:3,
        distortion:0,
        normalized:true
    });

    const mapRange1= new MapRange("mapRange1", {
        input:"noise1.r",
        fromMin: 0,
        fromMax: 1,
        toMin: 0.8,
        toMax: 1,
        mode: "linear", 
    });
  

    const voronoi1 = new VoronoiBlock("voronoi1", {
        input: "mapping1",
        scale: 8,
        detail: 4,
        roughness: 0.3,
        lacunarity: 2.0,
        randomness: 1.0,
        mode: "F1",
        metric: "chebychev"
    });


    const mapRange2= new MapRange("mapRange2", {
        input:"voronoi1.r",
        fromMin: 0,
        fromMax: 1,
        toMin: 0.75,
        toMax: 1,
        mode: "linear", 
    });

    
    const mix1 = new MixBlock("mix1", {
        inputA: "mapRange1",
        inputB: "mapRange2",
        mode: "mix",
        factor: 0.27
    });

    // Color
    const colorRamp1 = new ColorRampBlock("ramp1",{
        input:"noise1.r",

        positions:[
            0,
            1
        ],

        colors:[
            [230, 145, 57],   // bronze sombre
            [250, 165, 77],  // bronze brillant
        ],

        mode:"linear"
    });

    // Roughness
    const mapRange3= new MapRange("mapRange3", {
        input:"mix1.r",
        fromMin: 0,
        fromMax: 1,
        toMin: 0.6,
        toMax: 1,
        mode: "linear", 
    });

    // 7. Output
    const output = new ConnectionBlock("output", {
        color: "ramp1",
        roughness: "mapRange3",
        metal: 1
    });


    return [mapping1, noise1, mapRange1, voronoi1, mapRange2, mix1, colorRamp1, mapRange3, output];
}