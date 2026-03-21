import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";
import { NoiseBlock } from "../../blocks/patterns/noise.js";
import { VoronoiBlock } from "../../blocks/patterns/voronoi.js";
import { ColorRampBlock } from "../../blocks/operators/colorRamp.js";
import { MixBlock } from "../../blocks/operators/mix.js";
import { MapRange } from "../../blocks/operators/mapRange.js";
import { BumpMultiplierBlock } from "../../blocks/operators/bumpMultiplier.js";

export function getGraph() {

    const mapping1 = new MappingBlock("mapping1", {
        scale: [1.3, 1.3, 1.3],  // était 0.8
        offset: [0, 0, 0], rotation: [0, 0, 0], mode: "local"
    });

    const noise1 = new NoiseBlock("noise1", {
        input: "mapping1",
        scale: 2.5,   // était 1.5
        detail: 4,    // était 3 → un peu plus de détail
        roughness: 0.55,
        lacunarity: 2.0,
        distortion: 0.0,
        normalized: true
    });

    const colorBronze = new ColorRampBlock("colorBronze", {
        input: "noise1.r",
        positions: [0, 0.3, 0.6, 1.0],
        colors: [
            [120, 60,  15],   // creux très sombres — brun cuivre foncé
            [185, 105, 38],   // bronze foncé
            [215, 140, 55],   // bronze moyen
            [235, 168, 68],   // or-bronze (pas trop jaune)
        ],
        mode: "smooth"
    });

    const roughness = new MapRange("roughness", {
        input: "noise1.r",
        fromMin: 0, fromMax: 1,
        toMin: 0.05,   // très poli → highlights larges
        toMax: 0.25,
        mode: "linear"
    });

    const bump = new BumpMultiplierBlock("bump", {
        input: "noise1",
        factor: 0.08   // bump très léger
    });

    // Rajoute dans bronze.js
    const noiseOxide = new NoiseBlock("noiseOxide", {
        input: "mapping1",
        scale: 1.8,  // était 1.0
        detail: 2, roughness: 0.5,
        lacunarity: 2.0, distortion: 0.0, normalized: true
    });

    const oxideRemap = new MapRange("oxideRemap", {
        input: "noiseOxide.r",
        fromMin: 0.6, fromMax: 1.0,  // patine seulement au-dessus de 0.6
        toMin: 0.0,   toMax: 0.3,    // max 30% de patine
        mode: "smoothstep"
    });

    const colorOxide = new ColorRampBlock("colorOxide", {
        input: "noiseOxide.r",
        positions: [0, 0.5, 1.0],
        colors: [
            [185, 105, 38],
            [110, 130, 70],   // vert discret
            [85,  110, 88],
        ],
        mode: "smooth"
    });

    const mixFinal = new MixBlock("mixFinal", {
        inputA: "colorBronze",
        inputB: "colorOxide",
        factor: "oxideRemap.r",
        mode: "mix"
    });

    const output = new ConnectionBlock("output", {
        color: "mixFinal",
        roughness: "roughness",
        bump: "bump",
        metallic: 0.98
    });

return [mapping1, noise1, colorBronze, roughness, bump, noiseOxide, oxideRemap, colorOxide, mixFinal, output];
}