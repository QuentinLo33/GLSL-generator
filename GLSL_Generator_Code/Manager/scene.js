import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"; // camera
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"; // model
import { currentGraphName, getEnvColors } from "./ui.js";
import { createShader } from "./shader/shaderBuilder.js"; // shader creation 


export let scene, camera, renderer, mesh, currentModel, ambientLight, updateAmbient, controls;
let resizeRequested = false;
let containerRef;

export let updateEnv = false;
export function requestEnvUpdate() { updateEnv = true; }

/* ----------------------
    Scene + renderer
   ---------------------- */
export function initScene(container) {
    containerRef = container;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#d0f3f4");

    // Light
    ambientLight = new THREE.AmbientLight(0xaaaaaa, 1);
    updateAmbient =false;
    scene.add(ambientLight);

    updateEnv = false;
    // Camera + control
    camera = new THREE.PerspectiveCamera(
        75, // field of view
        container.clientWidth / container.clientHeight, // ratio
        0.1, // near clipping plane
        1000 // far clipping plane
    );
    camera.position.set(3, 3, 3);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Controls camera + helper
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false; // no translation
    
    createViewHelper(container);

    createMesh("cube");

    // Resize
    const ro = new ResizeObserver(() => {
        resizeRequested = true;
    });
    ro.observe(containerRef);

    // Update
    animate();
}


function animate() {
    requestAnimationFrame(animate);
    controls.update();

    if (resizeRequested) {
        updateRendererSize();
        resizeRequested = false;
    }

    // Camera
    if (mesh && mesh.material && mesh.material.uniforms) {
        mesh.material.uniforms.uCameraPos.value.copy(camera.position);
    }

    // Ambient
    if (updateAmbient && mesh && mesh.material && mesh.material.uniforms) {
        mesh.material.uniforms.uAmbientColor.value.copy(ambientLight.color);
        updateAmbient = false;
    }

    // Environment
    if (updateEnv && mesh && mesh.material && mesh.material.uniforms) {
        const { envLight, envFill, envGround } = getEnvColors();
        mesh.material.uniforms.uEnvLight.value.copy(envLight);
        mesh.material.uniforms.uEnvFill.value.copy(envFill);
        mesh.material.uniforms.uEnvGround.value.copy(envGround);
        updateEnv = false;
    }

    // Helper
    if (helperRenderer && viewHelper && helperCamera) renderViewHelper();
    renderer.render(scene, camera);
}

function updateRendererSize() {
    if (!renderer || !camera || !containerRef) return;

    const width = containerRef.clientWidth;
    const height = containerRef.clientHeight;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}


/* ----------------------
    Apply shader + Model
   ---------------------- */
export function createShaderFromGraph() {
    return createShader(currentGraphName, mesh, camera, ambientLight);
}

export function requestAmbientUpdate(){
    updateAmbient = true;
}


export function createMesh(type = "cube") {
    if (currentModel) {
        scene.remove(currentModel);
        if (currentModel.geometry) currentModel.geometry.dispose();
        if (currentModel.material) currentModel.material.dispose();
        currentModel = null;
        mesh = null;
    }

    let geometry;
    switch (type) {
        case "sphere":   geometry = new THREE.SphereGeometry(0.5, 32, 32); break;
        case "torus":    geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100); break;
        case "cylinder": geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32); break;
        default:
            geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
            geometry = geometry.toNonIndexed();       // separate the vertices
            geometry.computeVertexNormals();           // compute the normals
            break;
    }

    mesh = new THREE.Mesh(geometry);
    mesh.scale.set(2, 2, 2);
    mesh.position.y = 0.5;
    scene.add(mesh);
    currentModel = mesh;

    if (window.__currentShaderGraph) {
        mesh.material = window.__currentShaderGraph.material;
    }
}

// load gltf model
export function loadModel(url) {
    const loader = new GLTFLoader();
    loader.load(
        url,
        (gltf) => {
            // remove the previous
            if (currentModel) {
                scene.remove(currentModel);
                if (currentModel.geometry) currentModel.geometry.dispose();
                if (currentModel.material) currentModel.material.dispose();
            }

            // url with name
            const modelName = url.split("/").pop().replace(".glb", "").replace(".gltf", "").toLowerCase();

            currentModel = gltf.scene;

            currentModel.traverse((child) => {
                if (child.isMesh) {
                    mesh = child;
                    currentModel = child;
                    if (window.__currentShaderGraph) {
                        mesh.material = window.__currentShaderGraph.material;
                    }
                }
            });

            scene.add(currentModel);

            // position & scale
            switch (modelName) {
                case "teapot":
                    currentModel.position.set(0, -0.5, 0);
                    currentModel.scale.set(2, 2, 2);
                    break;
                case "suzanne":
                    currentModel.position.set(0, -0.8, 0);
                    currentModel.scale.set(1.5, 1.5, 1.5);
                    break;
                case "rock":
                    currentModel.position.set(0, -0.3, 0);
                    currentModel.scale.set(2, 2, 2);
                    break;
                case "cloth":
                    currentModel.position.set(0, -1, 0);
                    currentModel.scale.set(2, 2, 2);
                    break;
                case "gear":
                    currentModel.position.set(0, 0, 0);
                    currentModel.scale.set(2, 2, 2);
                    break;
                default:
                    currentModel.position.set(0, -0.5, 0);
                    currentModel.scale.set(2, 2, 2);
            }
        },
        undefined,
        (err) => console.error(err)
    );
}


/* ----------------------
    View helper
   ---------------------- */

let viewHelper, helperCamera, helperRenderer;

function createThickAxes(scene, size = 1.5) {

    const radius = 0.05;
    const coneRadius = 0.12;
    const coneLength = 0.3;

    const materialX = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const materialY = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const materialZ = new THREE.MeshBasicMaterial({ color: 0x0000ff });

    const cylGeo = new THREE.CylinderGeometry(radius, radius, size, 16);
    const coneGeo = new THREE.ConeGeometry(coneRadius, coneLength, 16);

    // X axis
    const xAxis = new THREE.Mesh(cylGeo, materialX);
    xAxis.rotation.z = -Math.PI / 2;
    xAxis.position.x = size / 2;
    scene.add(xAxis);

    const xTip = new THREE.Mesh(coneGeo, materialX);
    xTip.rotation.z = -Math.PI / 2;
    xTip.position.x = size;
    scene.add(xTip);

    // Y axis
    const yAxis = new THREE.Mesh(cylGeo, materialY);
    yAxis.position.y = size / 2;
    scene.add(yAxis);

    const yTip = new THREE.Mesh(coneGeo, materialY);
    yTip.position.y = size;
    scene.add(yTip);

    // Z axis
    const zAxis = new THREE.Mesh(cylGeo, materialZ);
    zAxis.rotation.x = Math.PI / 2;
    zAxis.position.z = size / 2;
    scene.add(zAxis);

    const zTip = new THREE.Mesh(coneGeo, materialZ);
    zTip.rotation.x = Math.PI / 2;
    zTip.position.z = size;
    scene.add(zTip);
}

function createViewHelper(container) {
    // Create the square for the view helper.
    helperRenderer = new THREE.WebGLRenderer({ antialias: true });
    helperRenderer.setSize(120, 120);
    helperRenderer.setClearColor(0x222244); // background
    helperRenderer.domElement.id = "view-helper";
    container.appendChild(helperRenderer.domElement);

    // Scene for the view helper
    viewHelper = new THREE.Scene();

    // Axis
    createThickAxes(viewHelper, 1.5);
    
    // Helper camera
    helperCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
    helperCamera.position.set(3, 3, 3);
    helperCamera.lookAt(viewHelper.position);

    // Interaction: click to change the view
    helperRenderer.domElement.addEventListener("click", (e) => {
        const rect = helperRenderer.domElement.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        if (Math.abs(x) > Math.abs(y)) {
            if (x > 0) setCameraRight();
            else setCameraLeft();
        }
        else {
            if (y > 0) setCameraBottom();
            else setCameraTop();
    }
});
}

// renderer view helper
function renderViewHelper() {
    if (!helperRenderer || !viewHelper || !helperCamera) return;

    helperCamera.position.set(3, 3, 3);
    helperRenderer.render(viewHelper, helperCamera);
}


// View Front (Z+)
function setCameraFront() {
    camera.position.set(0, 0, 5);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
}
// View back (Z-)
function setCameraBack() {
    camera.position.set(0, 0, -5);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
}

// View left (X-)
function setCameraLeft() {
    camera.position.set(-5, 0, 0);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
}

// View right (X+)
function setCameraRight() {
    camera.position.set(5, 0, 0);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
}

// View Top (Y+)
function setCameraTop() {
    camera.position.set(0, 5, 0);
    camera.lookAt(0, 0, 0);
}

// View Bottom (Y-)
function setCameraBottom() {
    camera.position.set(0, -5, 0);
    camera.lookAt(0, 0, 0);
}