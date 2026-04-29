# 🚀 React + Three.js Modular 3D Framework

A modular, extensible **Three.js + React-powered 3D framework** for building rich interactive web experiences with clean, scalable architecture.

Designed for developers who want the creative freedom of **Three.js** with the structured workflow of modern game engines.

It combines engine systems, modular features, runtime interactivity, and seamless **React** integration so developers can focus on building products, experiences, and applications instead of boilerplate.

The repository also includes example scene logic that demonstrates how to use the engine in real-world interactive applications.

---

# ✨ Why This Framework?

Three.js is incredibly powerful — but as projects grow, development often becomes harder than it needs to be.

Common pain points:

* Scattered logic across multiple files
* Repetitive renderer / camera setup
* Difficult interaction systems
* Hard-to-maintain scene architecture
* Messy coupling between UI and 3D logic
* Boilerplate repeated between projects
* Poor scalability for larger productions

This framework solves those problems through a clean modular architecture built for real-world development.

---

# 🎯 Built For

* 3D Product Configurators
* Interactive Websites
* Virtual Showrooms
* Portfolio Experiences
* Games & Prototypes
* Architectural Walkthroughs
* Data Visualization Scenes
* UI + 3D Hybrid Applications
* Immersive Brand Experiences

---

# 🚀 Core Features

## 🎮 Engine-Style Workflow

Inspired by modern game engine architecture:

* Engine lifecycle management
* Module / system registration
* Centralized update loop
* Scene orchestration
* Scalable project structure
* Reusable systems and managers

---

## ⚛️ Native React Integration

Use React as a true application layer connected to the 3D world.

Perfect for:

* HUD interfaces
* Product selectors
* Settings panels
* Runtime editors
* Overlay systems
* State-driven scene controls
* Dynamic dashboards

UI remains modular and can be fully customized or replaced.

---

## 🧩 Modular Architecture

Enable only what you need.

Current modules include:

* Interaction System
* Orbit Controls
* Selection Highlighting
* Auto Rotate
* Post Processing Support
* Expandable future modules

Each module can be independently added, removed, or extended.

---

## 🖱️ Advanced Interaction System

Built for real interactive scenes:

* Hover / Leave states
* Select / Deselect actions
* Raycasting management
* Object-specific behaviors
* Camera focus interactions
* Gameplay-style mechanics
* Reusable interactive entities

---

## 🎥 Camera & Renderer Abstractions

Simplified systems for:

* Perspective cameras
* Orthographic cameras
* Renderer initialization
* Resize handling
* Scene rendering lifecycle
* Controlled transitions

---

## 📦 Asset Management

Centralized loading pipeline for:

* Models
* Textures
* Animations
* Scene assets
* Future pipeline extensions

---

## 🧠 Scalable Scene Setup

Supports clean organization for larger scenes:

* Automated scene traversal
* Reusable setup pipelines
* Object grouping workflows
* Naming-convention friendly systems
* Large GLTF scene handling

---

## 🕹️ Runtime UI Controls

Optional React-powered tooling systems for:

* Sliders
* Color pickers
* Floating windows
* Live tweaking panels
* Scene debugging
* Configurator controls

Ideal for products, demos, and editors.

---

## 🎬 Animation Ready

Designed to work seamlessly with motion systems such as **GSAP**.

Examples:

* Camera transitions
* Hover feedback
* Doors / drawers / moving parts
* Continuous rotations
* Timelines
* Shader animation updates

---

# 🧱 Project Structure

```text
threejs/
├─ engine/
│  ├─ core/
│  │  ├─ Engine.ts
│  │  ├─ Scene.ts
│  │  ├─ Entity.ts
│  │  ├─ Renderer.ts
│  │  ├─ Camera.ts
│  │  ├─ AssetLoader.ts
│  │  ├─ Loop.ts
│  │  ├─ UpdatablesManager.ts
│  │  └─ Types.ts
│  │
│  ├─ modules/
│  │  ├─ interaction/
│  │  │  ├─ InteractionSystem.ts
│  │  │  ├─ InteractionManager.ts
│  │  │  ├─ InteractiveEntity.ts
│  │  │  ├─ RaycastSystem.ts
│  │  │  └─ types.ts
│  │  │
│  │  ├─ selection/
│  │  │  ├─ SelectionSystem.ts
│  │  │  ├─ selectionAnimation.ts
│  │  │  └─ materials/
│  │  │     ├─ emissive.ts
│  │  │     ├─ fresnel.ts
│  │  │     ├─ glitch.ts
│  │  │     └─ utils.ts
│  │  │
│  │  ├─ orbit-controls/
│  │  │  └─ OrbitControlsSystem.ts
│  │  │
│  │  ├─ postprocessing/
│  │  │  └─ PostProcessingSystem.ts
│  │  │
│  │  └─ stats/
│  │     └─ StatsSystem.ts
│  │
│  └─ config/
│     └─ engineSettings.ts
│
├─ examples/
│  └─ katana-room/
│     ├─ interaction/
│     │  └─ interactionLogic.ts
│     │
│     ├─ lighting/
│     │  └─ ambientLightDefaults.ts
│     │
│     ├─ meshes/
│     │  └─ createHoloSphere.ts
│     │
│     ├─ scene/
│     │  └─ createSceneControls.ts
│     │
│     ├─ shaders/
│     │  └─ shinyShader.ts
│     │
│     ├─ appLogic.ts
│     └─ index.ts
│
└─ ThreejsMain.ts

```

---

# 🧪 Included Examples

The repository includes real usage examples showing what can be built with the engine:

* Interactive rooms with clickable objects
* Runtime lighting controls
* Animated furniture / doors / drawers
* Product showcase scenes
* Camera focus transitions
* React-powered UI overlays
* Custom shader objects
* Hybrid DOM + 3D setups

Examples are designed to help developers learn practical workflows quickly.

---

# 🧠 Philosophy

This project is built around a few core principles:

* **Structure over chaos**
* **Modularity over monoliths**
* **Scalability over hacks**
* **Developer experience over boilerplate**
* **Separation of concerns**
* **Engine-like workflow for the web**

Three.js gives unmatched low-level freedom.

This engine adds the architecture needed to scale that freedom into production-ready applications.

---

# 🚀 Getting Started

## Install Dependencies

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

---

# 🛠 Basic Usage

```ts
import { Engine } from './engine'
import { InteractionModule } from './engine/modules/interaction'
import { OrbitControlsModule } from './engine/modules/orbitControls'

const engine = new Engine({
  canvas: document.getElementById('app'),
})

engine.addModule(InteractionModule)
engine.addModule(OrbitControlsModule)

engine.start()
```

---

# 🔮 Roadmap

* Physics integration
* Expanded post-processing pipeline
* Animation utilities
* Editor-like tooling
* ECS enhancements
* Plugin ecosystem
* Additional built-in modules

---

# 🤝 Contributing

Contributions, ideas, and feedback are welcome.

You can help by:

* Opening issues
* Suggesting features
* Improving systems
* Building modules
* Creating examples
* Submitting pull requests

---

# 🙏 Acknowledgements

If you use this project in a public application, a credit like:

> "Powered by Katana Engine"

or

> "Based on Katana Engine by Frakon"

would be greatly appreciated, but is not required.

---

# 📄 License

MIT License

---

# 💡 Final Notes

This project aims to bridge the gap between:

* 👉 Low-level flexibility of Three.js
* 👉 High-level workflow of Unity and Unreal Engine

Giving developers the best of both worlds for building modern interactive 3D web applications.
