import { ShaderGraph } from "./shaderGraph.js";

const graphs = {
    // metal
    "metal_bronze": () => import("./graphs/metal/bronze.js"),
    "metal_steel": () => import("./graphs/metal/steel.js"),
    // wood
    "wood_woodPlank": () => import("./graphs/wood/woodPlank.js"),

    // cloth
    "cloth_wovenFabric": () => import ("./graphs/cloth/wovenFabric.js"),
    "cloth_militaryFabric": () => import ("./graphs/cloth/militaryFabric.js"),

    // mineral
    "mineral_marble": () => import ("./graphs/mineral/marble.js"),
    "mineral_granite": () => import ("./graphs/mineral/granite.js"),
    "mineral_polishedStone": () => import ("./graphs/mineral/polishedStone.js"),

    // synthetic
    "synthetic_rubber": () => import ("./graphs/synthetic/rubber.js"),
    
    // patterns
    "pattern_noisePattern": () => import("./graphs/pattern/noisePattern.js"),
    "pattern_voronoiPattern": () => import("./graphs/pattern/voronoiPattern.js"),
    "pattern_wavePattern": () => import("./graphs/pattern/wavePattern.js"),
    "pattern_magicPattern": () => import("./graphs/pattern/magicPattern.js"),
    "pattern_woodGrainPattern": () => import("./graphs/pattern/woodGrainPattern.js"),
};

export async function createShader(graph_name, mesh, camera, light) {
    const importedGraph = graphs[graph_name];
    if (!importedGraph) {
        console.error("Unknown graph", graph_name);
        return;
    }
    try {
        // import graph & parameters
        const module = await importedGraph();
        const graphBlocks = module.getGraph();
        const params = module.getParams ? module.getParams() : {};

        const shaderGraph = new ShaderGraph(graphBlocks, "finalColor");
        const material = shaderGraph.createMaterial(camera, light);
        if (mesh) mesh.material = material;

        // Store the instance to allow access elsewhere without passing it as a parameter.
        window.__currentShaderGraph = shaderGraph;
        window.__currentShaderGraph.material = material;

        return { material, params };
    } catch(err) {
        console.error("Error loading graph:", graph_name, err);
    }
}