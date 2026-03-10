# Procedural Shader Generator

## Description

Web application that dynamically generates **procedural GLSL shaders** with a **real-time 3D preview**.
Users can select a base material, modify its parameters, and immediately see the result applied to 3D models.

The application is built with:

- **HTML / CSS** for the interface
- **JavaScript** for the logic
- **GLSL** for shader generation
- **Three.js (WebGL)** for real-time 3D rendering

The system is based on **procedural blocks (nodes)** inspired by Blender shader nodes, allowing patterns such as **Noise, Voronoi, Wave, and Magic Texture** to be combined and applied to materials.

## Run the project

1. Open the project folder in **Visual Studio Code**
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open the **localhost URL** displayed in the terminal in your browser
   (Recommended: **Google Chrome**).
