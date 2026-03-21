import { MappingBlock } from "../../blocks/operators/mapping.js";
import { ConnectionBlock } from "../../blocks/operators/connection.js";
import { NoiseBlock } from "../../blocks/patterns/noise.js";
import { ColorRampBlock } from "../../blocks/operators/colorRamp.js";
import { MixBlock } from "../../blocks/operators/mix.js";
import { MapRange } from "../../blocks/operators/mapRange.js";
import { BumpMultiplierBlock } from "../../blocks/operators/bumpMultiplier.js";
import { WaveBlock } from "../../blocks/patterns/wave.js";

export function getGraph() {

    // ── Mappings ──────────────────────────────────────────────────────────────

    // UV → waves (tissage)
    const mappingUV = new MappingBlock("mappingUV", {
        scale: [1, 1, 1],
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "uv"
    });

    // ── Tissage ───────────────────────────────────────────────────────────────

    // Grain léger pour déformer les waves
    const noise1 = new NoiseBlock("noise1", {
        input: "mappingUV",
        scale: 1,
        detail: 12,
        roughness: 0.5,
        lacunarity: 2,
        distortion: 3,
        normalized: true,
        mode: "fBm"
    });

    const mixDeformation = new MixBlock("mixDeformation", {
        inputA: "mappingUV",
        inputB: "noise1",
        mode: "mix",
        factor: 0.05
    });

    const wave1 = new WaveBlock("wave1", {
        input: "mixDeformation",
        type: "sine",
        pattern: "bands",
        axis: "Y",
        scale: 1000.0,
        distortion: 2.0,
        detail: 3,
        detailScale: 2.0,
        detailRoughness: 0.5,
        phase: 1.0
    });

    const wave2 = new WaveBlock("wave2", {
        input: "mixDeformation",
        type: "sine",
        pattern: "bands",
        axis: "X",
        scale: 1000.0,
        distortion: 2.0,
        detail: 3,
        detailScale: 2.0,
        detailRoughness: 0.5,
        phase: 1.0
    });

    const mixWave = new MixBlock("mixWave", {
        inputA: "wave1",
        inputB: "wave2",
        mode: "multiply",
        factor: 0.5
    });

    const waveRemap = new MapRange("waveRemap", {
        input: "mixWave.r",
        fromMin: 0.3,
        fromMax: 1.0,
        toMin: 0.0,
        toMax: 1.0,
        mode: "smoothstep"
    });

    // ── Camo pattern ──────────────────────────────────────────────────────────

    // Mapping plus petit = taches plus grandes
    const mappingLocal = new MappingBlock("mappingLocal", {
        scale: [4, 4, 4],  // ← était 4,4,4 — beaucoup plus grand
        offset: [0, 0, 0],
        rotation: [0, 0, 0],
        mode: "local"
    });

    const noiseCamo1 = new NoiseBlock("noiseCamo1", {
        input: "mappingLocal",
        scale: 1.0,
        detail: 3,        // ← peu de détail = formes larges et fluides
        roughness: 0.5,
        lacunarity: 2.0,
        distortion: 0.5,  // ← distortion faible
        normalized: true,
        mode: "fBm"
    });

    // Deuxième noise juste pour les petits détails des bords
    const noiseCamo2 = new NoiseBlock("noiseCamo2", {
        input: "mappingLocal",
        scale: 3.0,
        detail: 2,
        roughness: 0.5,
        lacunarity: 2.0,
        distortion: 0.3,
        normalized: true,
        mode: "fBm"
    });

    // Mix très léger — noiseCamo1 domine largement
    const mixCamo = new MixBlock("mixCamo", {
        inputA: "noiseCamo1",
        inputB: "noiseCamo2",
        mode: "mix",
        factor: 0.15   // ← 15% seulement de noiseCamo2
    });

    // 4 bandes bien distinctes comme la référence
    const colorRamp = new ColorRampBlock("colorRamp", {
        input: "mixCamo.r",
        positions: [0.0, 0.4, 0.6, 1.0],
        colors: [
            [20,  50,  20],    // vert très foncé
            [55,  90,  35],    // vert moyen
            [80,  60,  30],    // brun
            [20,  50,  20],    // retour vert foncé
        ],
        mode: "constant"
    });


    // ── Roughness & Bump ──────────────────────────────────────────────────────

    const roughnessFinal = new MapRange("roughnessFinal", {
        input: "waveRemap.r",
        fromMin: 0.0,
        fromMax: 1.0,
        toMin: 0.75,
        toMax: 0.45,
        mode: "linear"
    });

    const bump = new BumpMultiplierBlock("bump", {
        input: "mixWave",
        factor: 0.15
    });

    // ── Output ────────────────────────────────────────────────────────────────

    const output = new ConnectionBlock("output", {
        color: "colorRamp",       // ← colorRamp, pas noiseCamo2
        roughness: "roughnessFinal",
        metallic: "0.0",
        bump: "bump"
    });

    return [
        mappingUV,
        mappingLocal,
        noise1,
        mixDeformation,
        wave1,
        wave2,
        mixWave,
        waveRemap,
        noiseCamo1,
        noiseCamo2,
        mixCamo,  
        colorRamp,
        roughnessFinal,
        bump,
        output
    ];
}