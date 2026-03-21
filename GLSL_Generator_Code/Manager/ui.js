import { scene, createMesh, loadModel, currentModel, ambientLight, requestAmbientUpdate, requestEnvUpdate, createShaderFromGraph } from "./scene.js";
import * as THREE from "three";
import { getVertexShader, getFragmentShader, vertexShader } from "./shader/shaderGraph.js";

export let currentGraphName = "metal_bronze";

let glslBlocks;
/* ----------------------
    Init
   ---------------------- */
export async function initUI() {
    // Get view menu
    glslBlocks = document.querySelectorAll(".glsl-block");
    const bgInput = document.getElementById("bg-color");
    bgInput.value = "#" + scene.background.getHexString();
    const modelSelect = document.getElementById("model-select");
    const ambientInput = document.getElementById("ambient-color");

    // Background
    bgInput.addEventListener("input", () => {
        scene.background = new THREE.Color(bgInput.value);
    });

    // Shader & Model
    await initShader();

    modelSelect.addEventListener("change", () => {
        const value = modelSelect.value;

        if (["cube", "sphere", "torus", "cylinder"].includes(value)) {
            createMesh(value);
        } else {
            loadModel(`/Models/${value}.glb`);
        }

        updateGLSLPreview();
    });

    
    // Ambient
    ambientInput.addEventListener("input", () => {
        ambientLight.color.set(ambientInput.value);
        requestAmbientUpdate();
        updateGLSLPreview();
    });

    // Environment
    const envLight  = document.getElementById("env-light");
    const envFill   = document.getElementById("env-fill");
    const envGround = document.getElementById("env-ground");

    [envLight, envFill, envGround].forEach(input => {
        input.addEventListener("input", () => requestEnvUpdate());
    });

    // toogle
    document.querySelectorAll(".toggle-environment").forEach(toggle => {
        const content = toggle.closest(".settings-block").querySelector(".environment-content");
        content.style.display = "none";

        toggle.addEventListener("click", () => {
            const visible = content.style.display !== "none";
            content.style.display = visible ? "none" : "block";
            toggle.classList.toggle("active", !visible);
        });
    });

    // Code preview
    glslBlocks.forEach(block => {

        const toggle = block.querySelector(".glsl-toggle");
        const code = block.querySelector(".glsl-code");
        // visibility management
        toggle.addEventListener("click", () => {
            const visible = window.getComputedStyle(code).display !== "none";
            code.style.display = visible ? "none" : "block";

        });
    });

    // Downloads
    glslBlocks[0].querySelector(".glsl-download").addEventListener("click", () =>
        download("vertex_shader.glsl", glslBlocks[0].querySelector(".glsl-code").value)
    );

    glslBlocks[1].querySelector(".glsl-download").addEventListener("click", () =>
        download("fragment_shader.glsl", glslBlocks[1].querySelector(".glsl-code").value)
    );

    glslBlocks[2].querySelector(".glsl-download").addEventListener("click", () =>
        download("combined_shader.glsl", glslBlocks[2].querySelector(".glsl-code").value)
    );

    document.getElementById("download-all")?.addEventListener("click", () => {

        download("vertex_shader.glsl", glslBlocks[0].querySelector(".glsl-code").value);
        download("fragment_shader.glsl", glslBlocks[1].querySelector(".glsl-code").value);

    });

    updateGLSLPreview();
}

/* ----------------------
    GLSL code preview
   ---------------------- */

// preview GLSL shaders in the interface
export function updateGLSLPreview() {

    if (!currentModel || !glslBlocks) return;

    const vertexShader = getVertexShader();
    const fragmentShader = getFragmentShader();
    console.log("update glsl preview");
    glslBlocks[0].querySelector(".glsl-code").value = vertexShader;
    glslBlocks[1].querySelector(".glsl-code").value = fragmentShader;
    glslBlocks[2].querySelector(".glsl-code").value = vertexShader + "\n\n" + fragmentShader;
}

/* ----------------------
    Download
   ---------------------- */

function download(filename, content) {

    const blob = new Blob([content], { type: "text/plain" });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    URL.revokeObjectURL(link.href);

}


/* ----------------------
    Resize
   ---------------------- */

// get resizer
const resizerLeft = document.getElementById("resizer-left");
const resizerRight = document.getElementById("resizer-right");
const resizerHorizontal = document.getElementById("resizer-horizontal");

// get full colunm
const leftPanel = document.getElementById("left-column");
const rightPanel = document.getElementById("right-column");
const center = document.getElementById("central-column");

// state for drag
let isResizingLeft = false;
let isResizingRight = false;
let isResizingHorizontal = false;

// listener for drag
resizerLeft.addEventListener("mousedown", () => isResizingLeft = true);
resizerRight.addEventListener("mousedown", () => isResizingRight = true);
resizerHorizontal.addEventListener("mousedown", () => isResizingHorizontal = true);

// Resizing on mouse click & move
document.addEventListener("mousemove", e => {
    if (isResizingLeft) {
        const newWidth = e.clientX;
        leftPanel.style.width = newWidth + "px";
    }

    else if (isResizingRight) {
        const newWidth = window.innerWidth - e.clientX;
        rightPanel.style.width = newWidth + "px";
    }

    else if (isResizingHorizontal) {
        const containerHeight = window.innerHeight;
        const y = e.clientY;

        const topHeight = y;
        const bottomHeight = containerHeight - y;

        center.style.flexDirection = "-column";

        center.children[0].style.height = topHeight + "px";
        center.children[2].style.height = bottomHeight + "px";
    }
});

// Stop resizing on mouseup
document.addEventListener("mouseup", () => {
    isResizingLeft = false;
    isResizingRight = false;
    isResizingHorizontal = false;
});


/* ----------------------
    Initialisation
   ---------------------- */
const categories = {
    metal: ["bronze", "steel"],
    wood: ["woodPlank"],
    cloth: ["wovenFabric", "militaryFabric"],
    mineral: ["marble", "granite", "polishedStone"],
    synthetic: ["rubber"],

    test: ["noiseTest", "voronoiTest", "waveTest", "magicTest"],
};

const defaultModelByMaterial = {
    // metal
    "metal_bronze": "Gear",
    "metal_steel":  "Gear",
    
    // wood
    "wood_woodPlank": "cube",
    
    // cloth
    "cloth_wovenFabric":   "Cloth",
    "cloth_militaryFabric": "Cloth",

    // mineral
    "mineral_marble":   "Teapot",
    "mineral_granite":  "Suzanne",
    "mineral_polishedStone":  "Suzanne",

    // synthetic
    "synthetic_rubber": "torus",

    // test
    "test_noiseTest":   "cube",
    "test_voronoiTest": "cube",
    "test_waveTest":    "cube",
    "test_magicTest":   "cube",
};
// Add Listener for dynamic selection
const categorySelect = document.getElementById("material-category");
const subSelect = document.getElementById("material-subcategory");

categorySelect.addEventListener("change", () => {
    updateSubcategoryOptions(categorySelect.value);
    updateMaterialType();
});

subSelect.addEventListener("change", () => {
    updateMaterialType();
});

// Fill subcategory options
function updateSubcategoryOptions(category) {
    subSelect.innerHTML = "";
    categories[category].forEach(sub => {
        const option = document.createElement("option");
        option.value = sub;
        option.textContent = sub.charAt(0).toUpperCase() + sub.slice(1);
        subSelect.appendChild(option);
    });

    // select first option
    if (subSelect.options.length > 0) subSelect.value = subSelect.options[0].value;
}

function applyDefaultModel() {
    const modelSelect = document.getElementById("model-select");
    const key = `${categorySelect.value}_${subSelect.value}`;
    const defaultModel = defaultModelByMaterial[key];

    if (!defaultModel) return;

    modelSelect.value = defaultModel;

    if (["cube", "sphere", "torus", "cylinder"].includes(defaultModel)) {
        createMesh(defaultModel);
    } else {
        loadModel(`/Models/${defaultModel}.glb`);
    }

    updateGLSLPreview();
}

export async function initShader() {
    updateSubcategoryOptions(categorySelect.value);

    const mainCategory = categorySelect.value;
    const subCategory = subSelect.value;

    currentGraphName = `${mainCategory}_${subCategory}`;
    console.log("Initial graph:", currentGraphName);

    try {
        await createShaderFromGraph();
        console.log("Shader initialization successful!");
        applyDefaultModel();;
    } catch (err) {
        console.error("Error shader intialization :", err);
    }
}

/* ----------------------
    Dynamic slection
   ---------------------- */

// Adapt the model with the category
categorySelect.addEventListener("change", async () => {
    // Met à jour les sous-catégories
    updateSubcategoryOptions(categorySelect.value);
    updateMaterialType();
});


async function updateMaterialType() {
    currentGraphName = `${categorySelect.value}_${subSelect.value}`;
    console.log("Selected sub:", subSelect.value, "-> Graph:", currentGraphName);
    await createShaderFromGraph();
    applyDefaultModel();
    updateGLSLPreview();
}

/* ----------------------
    Light
   ---------------------- */

export function getAmbientInputColor() {
    const ambientInput = document.getElementById("ambient-color");
    if (!ambientInput) return new THREE.Color(0.3, 0.3, 0.3);
    return new THREE.Color(ambientInput.value);

}

export function getEnvColors() {
    const toVec3 = (id, fallback) => {
        const el = document.getElementById(id);
        if (!el) return fallback;
        return new THREE.Color(el.value);
    };
    return {
        envLight:  toVec3("env-light",  new THREE.Color(1, 1, 1)),
        envFill:   toVec3("env-fill",   new THREE.Color(0.6, 0.6, 0.65)),
        envGround: toVec3("env-ground", new THREE.Color(0.1, 0.1, 0.1)),
    };
}
