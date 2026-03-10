import { initScene } from "./scene.js";
import { initUI } from "./ui.js";

let container;

document.addEventListener("DOMContentLoaded", () => {
    container = document.getElementById("scene-container");
    initScene(container);
    initUI();
});