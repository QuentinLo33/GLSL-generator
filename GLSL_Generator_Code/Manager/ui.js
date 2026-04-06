import { scene, createMesh, loadModel, currentModel, ambientLight, requestAmbientUpdate, requestEnvUpdate, createShaderFromGraph } from "./scene.js";
import * as THREE from "three";
import { getVertexShader, getFragmentShader } from "./shader/shaderGraph.js";

export let currentGraphName = "metal_bronze";

let glslBlocks;
let dom = {};


/* =====================================================
   INIT UI
===================================================== */
export async function initUI() {
    //Store references to HTML elements in memory
    cacheDOM();
    initUtilityControls();

    // Scene UI
    initBackground();
    initLightControls();
    initEnvironmentControls();

    // Material + shader graph system
    initMaterialSystem();
    initModelControls();

    // GLSL preview UI
    initGLSLUI();

    // Initialize shader graph once at startup
    await initShader();
    updateGLSLPreview();
}


/* =====================================================
   DOM CACHE
===================================================== */
function cacheDOM() {
    // material selection
    dom.categorySelect = document.getElementById("material-category");
    dom.subSelect = document.getElementById("material-subcategory");

    // scene settings
    dom.bgInput = document.getElementById("bg-color");
    dom.modelSelect = document.getElementById("model-select");
    dom.ambientInput = document.getElementById("ambient-color");

    // code
    glslBlocks = document.querySelectorAll(".glsl-block");
}


/* =====================================================
   BACKGROUND
===================================================== */
function initBackground() {
    // Initialize input with current scene background
    dom.bgInput.value = "#" + scene.background.getHexString();

    dom.bgInput.addEventListener("input", () => {
        scene.background = new THREE.Color(dom.bgInput.value);
    });
}


/* =====================================================
   MATERIAL / SHADER SYSTEM
===================================================== */
function initMaterialSystem() {
    // Initialisation
    updateSubcategoryOptions(dom.categorySelect.value);
    updateMaterialType();

    // When the category changes → recalculation
    dom.categorySelect.addEventListener("change", () => {
        updateSubcategoryOptions(dom.categorySelect.value);
        updateMaterialType();
    });

    // When the subcategory changes → recalculation
    dom.subSelect.addEventListener("change", updateMaterialType);
}


/* =====================================================
   MODEL HANDLING
===================================================== */
function initModelControls() {
    dom.modelSelect.addEventListener("change", () => {
        handleModelChange(dom.modelSelect.value);
        updateGLSLPreview(); // ensures that the material is applied correctly
    });
}

// Switch between meshes from THREE and external GLB models
function handleModelChange(value) {
    if (["cube", "sphere", "torus", "cylinder"].includes(value)) {
        createMesh(value);
    } else {
        loadModel(`/Models/${value}.glb`);
    }
}

// Apply default model depending on selected material
function applyDefaultModel(categorySelect, subSelect, defaultModelByMaterial) {
    const modelSelect = document.getElementById("model-select");

    // get the model
    if (!categorySelect || !subSelect) return;

    const key = `${categorySelect.value}_${subSelect.value}`;
    const defaultModel = defaultModelByMaterial[key];

    if (!defaultModel) return;

    // update the UI and the model
    modelSelect.value = defaultModel;
    handleModelChange(defaultModel);
}


/* =====================================================
   GLSL PREVIEW
===================================================== */
function initGLSLUI() {
    initGLSLToggles();
    initDownloadButtons();
}

// Toogle to show or hide the code
function initGLSLToggles() {
    glslBlocks.forEach(block => {
        const toggle = block.querySelector(".glsl-toggle");
        const code = block.querySelector(".glsl-code");

        toggle.addEventListener("click", () => {
            const visible = window.getComputedStyle(code).display !== "none";
            code.style.display = visible ? "none" : "block";
        });
    });
}

// Update the code preview with the current shader
export function updateGLSLPreview() {
    if (!currentModel || !glslBlocks) return;

    // get the shader
    const vertexShader = getVertexShader();
    const fragmentShader = getFragmentShader();

    // Update preview textareas
    glslBlocks[0].querySelector(".glsl-code").value = vertexShader;
    glslBlocks[1].querySelector(".glsl-code").value = fragmentShader;
    glslBlocks[2].querySelector(".glsl-code").value = vertexShader + "\n\n" + fragmentShader;
}


/* =====================================================
   DOWNLOAD THE CODE
===================================================== */

// Add listener
function initDownloadButtons() {
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
}

// Download the file
function download(filename, content) {
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    URL.revokeObjectURL(link.href);
}


/* =====================================================
   RESIZE HANDLING
===================================================== */
function initUtilityControls() {
    initResizeHandlers();
}

// Allows to resize the interface panels
function initResizeHandlers() {
    const resizerLeft = document.getElementById("resizer-left");
    const resizerRight = document.getElementById("resizer-right");
    const resizerHorizontal = document.getElementById("resizer-horizontal");

    const leftPanel = document.getElementById("left-column");
    const rightPanel = document.getElementById("right-column");
    const center = document.getElementById("central-column");

    let isResizingLeft = false;
    let isResizingRight = false;
    let isResizingHorizontal = false;

    resizerLeft.addEventListener("mousedown", () => isResizingLeft = true);
    resizerRight.addEventListener("mousedown", () => isResizingRight = true);
    resizerHorizontal.addEventListener("mousedown", () => isResizingHorizontal = true);

    document.addEventListener("mousemove", e => {
        if (isResizingLeft) {
            leftPanel.style.width = e.clientX + "px";
        }
        else if (isResizingRight) {
            rightPanel.style.width = (window.innerWidth - e.clientX) + "px";
        }
        else if (isResizingHorizontal) {
            const y = e.clientY;
            const containerHeight = window.innerHeight;

            // Adjust heights of top/bottom central panels
            center.children[0].style.height = y + "px";
            center.children[2].style.height = (containerHeight - y) + "px";
        }
    });

    document.addEventListener("mouseup", () => {
        isResizingLeft = false;
        isResizingRight = false;
        isResizingHorizontal = false;
    });
}


/* =====================================================
   LIGHT
===================================================== */
function initLightControls() {
    dom.ambientInput.addEventListener("input", () => {
        ambientLight.color.set(dom.ambientInput.value);
        requestAmbientUpdate();
    });
}

export function getAmbientInputColor() {
    const ambientInput = document.getElementById("ambient-color");
    if (!ambientInput) return new THREE.Color(0.3, 0.3, 0.3);
    return new THREE.Color(ambientInput.value);
}

export function getEnvColors() {
    // Convert hexadecimal to RGB
    const toVec3 = (id, fallback) => {
        const el = document.getElementById(id);
        if (!el) return fallback;
        return new THREE.Color(el.value);
    };

    return {
        envLight:  toVec3("env-light",  new THREE.Color(1, 1, 1)), // default value
        envFill:   toVec3("env-fill",   new THREE.Color(0.6, 0.6, 0.65)),
        envGround: toVec3("env-ground", new THREE.Color(0.1, 0.1, 0.1)),
    };
}


/* =====================================================
   ENVIRONMENT CONTROLS
===================================================== */
function initEnvironmentControls() {
    const envLight = document.getElementById("env-light");
    const envFill = document.getElementById("env-fill");
    const envGround = document.getElementById("env-ground");

    // add listener
    [envLight, envFill, envGround].forEach(input => {
        input.addEventListener("input", () => requestEnvUpdate());
    });

    // hide toggle-environment
    document.querySelectorAll(".toggle-environment").forEach(toggle => {
        const content = toggle.closest(".settings-block").querySelector(".environment-content");
        content.style.display = "none";

        toggle.addEventListener("click", () => {
            const visible = content.style.display !== "none";
            content.style.display = visible ? "none" : "block";
            toggle.classList.toggle("active", !visible);
        });
    });
}


/* =====================================================
   SHADER INIT
===================================================== */
const defaultModelByMaterial = {
    "metal_bronze": "Gear",
    "metal_steel":  "Gear",
    "wood_woodPlank": "cube",
    "cloth_wovenFabric":   "Cloth",
    "cloth_militaryFabric": "Cloth",
    "mineral_marble":   "Teapot",
    "mineral_granite":  "Suzanne",
    "mineral_polishedStone":  "Suzanne",
    "synthetic_rubber": "torus",
    "pattern_noisePattern":   "cube",
    "pattern_voronoiPattern": "cube",
    "pattern_wavePattern":    "cube",
    "pattern_magicPattern":   "cube",
    "pattern_woodGrainPattern":   "cube",
};

export async function initShader() {
    try {
        const result = await createShaderFromGraph();
        if (result?.params) renderParamsPanel(result.params);
        console.log("Shader initialization successful");
    } catch (err) {
        console.error("Shader initialization error:", err);
    }
}

async function updateMaterialType() {
    currentGraphName = `${document.getElementById("material-category").value}_${document.getElementById("material-subcategory").value}`;

    const result = await createShaderFromGraph();

    if (result?.params) {
        renderParamsPanel(result.params);
    }

    applyDefaultModel(
        document.getElementById("material-category"),
        document.getElementById("material-subcategory"),
        defaultModelByMaterial
    );

    updateGLSLPreview();
}

function updateSubcategoryOptions(category) {
    const subSelect = document.getElementById("material-subcategory");

    const categories = {
        metal: ["bronze", "steel"],
        wood: ["woodPlank"],
        cloth: ["wovenFabric", "militaryFabric"],
        mineral: ["marble", "granite", "polishedStone"],
        synthetic: ["rubber"],
        pattern: ["noisePattern", "voronoiPattern", "wavePattern", "magicPattern", "woodGrainPattern"],
    };

    subSelect.innerHTML = "";

    // fill the subcategoryOptions
    categories[category].forEach(sub => {
        const option = document.createElement("option");
        option.value = sub;
        option.textContent = sub;
        subSelect.appendChild(option);
    });

    // select the first
    subSelect.value = subSelect.options[0].value;
}


/* =====================================================
   PARAMS PANEL
===================================================== */

// Convert RGB array to hex color string
function rgbToHex([r, g, b]) {
    return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

function renderParamsPanel(params) {
    const panel = document.getElementById("params-panel");
    if (!panel) return;

    // Clear existing UI before re-rendering
    panel.innerHTML = "";

    // Loop through each parameter section
    for (const [sectionName, fields] of Object.entries(params)) {
        const section = document.createElement("div");
        section.className = "param-section";

        const header = document.createElement("div");
        header.className = "param-section-header";
        header.textContent = sectionName;

        const body = document.createElement("div");
        body.className = "param-section-body";
        body.style.display = "none";

        // Toggle section visibility
        header.addEventListener("click", () => {
            const isOpen = body.style.display !== "none";
            body.style.display = isOpen ? "none" : "block";
            header.classList.toggle("open", !isOpen);
        });

        section.appendChild(header);
        section.appendChild(body);

        // Create UI controls for each field in the section
        for (const field of fields) {
            const row = document.createElement("div");
            row.className = "param-row";

            const label = document.createElement("span");
            label.className = "param-label";
            label.textContent = field.label;

            row.appendChild(label);

            // Numeric parameters (slider inputs)
            if (["range", "float", "int"].includes(field.type)) {
                const slider = document.createElement("input");
                slider.type = "range";
                slider.min = field.min;
                slider.max = field.max;
                slider.step = field.step ?? (field.type === "int" ? 1 : 0.01);
                slider.value = field.default;

                const valueDisplay = document.createElement("span");
                valueDisplay.className = "param-value";
                valueDisplay.textContent = field.default;

                // Update shader parameter and UI when slider moves
                slider.addEventListener("input", () => {
                    const v = parseFloat(slider.value);

                    // Display formatted value depending on type
                    valueDisplay.textContent = field.type === "int" ? Math.round(v) : v.toFixed(2);

                    // Update shader graph parameter
                    window.__currentShaderGraph?.updateParam(field.targets, v);

                    // Refresh GLSL preview to reflect changes
                    updateGLSLPreview();
                });

                row.appendChild(slider);
                row.appendChild(valueDisplay);

            } 
            // Color parameters (color picker input)
            else if (field.type === "color") {
                const picker = document.createElement("input");
                picker.type = "color";
                picker.value = rgbToHex(field.default);

                // Convert hex color to RGB array and update shader
                picker.addEventListener("input", () => {
                    const hex = picker.value;
                    const rgb = [
                        parseInt(hex.slice(1, 3), 16),
                        parseInt(hex.slice(3, 5), 16),
                        parseInt(hex.slice(5, 7), 16)
                    ];

                    window.__currentShaderGraph?.updateParam(field.targets, rgb);
                    updateGLSLPreview();
                });

                row.appendChild(picker);
            }

            body.appendChild(row);
        }

        panel.appendChild(section);
    }
}