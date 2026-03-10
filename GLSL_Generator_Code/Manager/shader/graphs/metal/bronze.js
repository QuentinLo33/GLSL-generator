import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";
import { HSVBlock } from "../../blocks/operators/HSV.js";

import { NoiseBlock } from "../../blocks/patterns/noise.js";
import { VoronoiBlock } from "../../blocks/patterns/voronoi.js";
import { ColorRampBlock } from "../../blocks/operators/colorRamp.js";
import { MixBlock } from "../../blocks/operators/mix.js";

export function getGraph() {
    // 1. Mapping
    const mapping1 = new MappingBlock("mapping1", {
        scale: [1, 1, 1],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    // 2. Noise
    const noise1 = new NoiseBlock("noise1", {
        inputA: "noise1",
        scale:8,
        detail:8,
        roughness: 0.6,
        lacunatrity:3,
        distortion:0,
        normalized:true
    });

    // 3. Voronoi
    const voronoi1 = new VoronoiBlock("voronoi1", {
        input: "mapping1",
        scale: 8,
        detail: 4,
        roughness: 0.3,
        lacunarity: 2.0,
        randomness: 1.0,
        metric: "chebychev"
    });

    // 4. Mix Noise + Voronoi
    const mix1 = new MixBlock("mix1", {
        inputA: "noise1",
        inputB: "voronoi1",
        mode: "mix",
        factor: 0.27
    });

    // 5. Color

    const hsv1 = new HSVBlock("hsv1", {
        input: "mix1",
        hue: 0.0,
        saturation: 1,
        value: 1
    });

const rampColor = new ColorRampBlock("rampColor", {
    input: "hsv1.r",
    intervals: [[0, 0.4], [0.4, 1.0]],   // deux zones
    values: [
        [0.595, 0.495, 0.345],   // couleur des zones sombres + éclaircie
        [0.60, 0.50, 0.35]    // couleur des zones claires
    ],
    mode: "linear"
});
    
    // 6. Color ramp pour la roughness
    const rampRoughness = new ColorRampBlock("rampRoughness", {
        input: "mix1.r",
        intervals: [[0, 0.5], [0.5, 1.0]], 
        values: [[0.15, 0.15, 0.15], [0.35, 0.35, 0.35]],
        mode: "linear"
    }); 


    // 7. Output
    const output = new ConnectionBlock("output", {
        color: "rampColor",
        roughness: "rampRoughness",
        metal: 1
    });

    return [mapping1, voronoi1, noise1,mix1, hsv1, rampColor, rampRoughness, output];
}