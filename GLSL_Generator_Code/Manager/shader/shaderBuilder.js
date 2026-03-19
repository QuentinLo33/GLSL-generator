import { ShaderGraph } from "./shaderGraph.js";

const graphs = {
    // metal
    "metal_bronze": () => import("./graphs/metal/bronze.js"),
    "metal_silver": () => import("./graphs/metal/silver.js"),
    // wood
    "wood_woodPlank": () => import("./graphs/wood/woodPlank.js"),

    // cloth
    "cloth_wovenFabric": () => import ("./graphs/cloth/wovenFabric.js"),
    //test
    "test_noiseTest": () => import("./graphs/test/noiseTest.js"),
    "test_voronoiTest": () => import("./graphs/test/voronoiTest.js"),
    "test_waveTest": () => import("./graphs/test/waveTest.js"),
    "test_magicTest": () => import("./graphs/test/magicTest.js"),
};

export async function createShader(graph_name, mesh, camera, light) {
    const importedGraph = graphs[graph_name];
    if (!importedGraph) {
        console.error("Unknown graph", graph_name);
        return;
    }
    try {
        // Import a graph and retrieve the code
        const module = await importedGraph();
        const graphBlocks = module.getGraph();

        // Create & apply shader
        const shaderGraph = new ShaderGraph(graphBlocks, "finalColor");
        const material = shaderGraph.createMaterial(camera, light);
        if(mesh) mesh.material = material;

        return material;
    } catch(err) {
        console.error("Error loading graph:", graph_name, err);
    }
}