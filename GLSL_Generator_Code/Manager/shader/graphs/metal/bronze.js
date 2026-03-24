// operators
import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";
import { BumpMultiplierBlock } from "../../blocks/operators/bumpMultiplier.js";
import { ColorRampBlock } from "../../blocks/operators/colorRamp.js";
import { MapRange } from "../../blocks/operators/mapRange.js";

// patterns
import { NoiseBlock } from "../../blocks/patterns/noise.js";


export function getGraph() {

    // ── Mapping ──────────────────────────────────────────────────────────────
    const mapping = new MappingBlock("mapping", {
        scale: [1.3, 1.3, 1.3],  // était 0.8
        offset: [0, 0, 0], rotation: [0, 0, 0], mode: "local"
    });


    // ── Pattern bronze ──────────────────────────────────────────────────────────────
    const noise = new NoiseBlock("noise", {
        input: "mapping",
        scale: 2.5,
        detail: 4,
        roughness: 0.55,
        lacunarity: 2.0,
        distortion: 0.0,
        normalized: true
    });

    // ── Connection ──────────────────────────────────────────────────────────────
    // Color
    const colorRamp = new ColorRampBlock("colorRamp", {
        input: "noise.r",
        positions: [0, 0.3, 0.6, 1.0],
        colors: [
            [120, 60, 15], // deep hollows, shadow areas
            [185, 105, 38], // low main surface
            [215, 140, 55], // illuminated surface
            [235, 168, 68], // high points, metallic highlights
        ],
        mode: "smooth"
    });

    // Roughness
    const roughness = new MapRange("roughness", {
        input: "noise.r",
        fromMin: 0, fromMax: 1,
        toMin: 0.05,
        toMax: 0.25,
        mode: "linear"
    });

    // Bump
    const bump = new BumpMultiplierBlock("bump", {
        input: "noise",
        factor: 0.08
    });

    const output = new ConnectionBlock("output", {
        color: "colorRamp",
        roughness: "roughness",
        bump: "bump",
        metallic: 0.98
    });

    return [
        mapping,

        noise,
        colorRamp,

        roughness,
        bump,
        output
    ];
}