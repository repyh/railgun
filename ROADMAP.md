# Railgun Development Roadmap & Milestones

This document outlines the strategic development path for Railgun, transitioning from its current prototype state to a production-ready bot builder.

---

## 🏗️ Phase 1: Foundation & Parity (v0.1.0 - v0.3.0)
**Goal:** Establish a rock-solid core where generated bots work correctly and the editor is stable.

### **v0.1.0: The Compiler Core (Current State)**
*Status: In Progress / Near Completion*
- [x] **AST Compiler Overhaul**: Exhaustive type support, loops, logic, and variables.
- [x] **Mega Test Verification**: End-to-end verification of complex logic flows.
- [x] **Slash Command Builder**:
    - [x] UI for defining Slash Command options (Types, Required, Choices).
    - [x] Auto-deployment logic for Slash Commands.
- [ ] **Basic Discord Actions**: Send Message, Embeds, ephemeral replies.
- [ ] **Simple Export**: Ability to generate a raw `.js` file from the graph.

### **v0.2.0: The Developer Experience (DX)**
**Focus:** Making the editor safer and easier to use.
- [ ] **Visual Error Feedback**:
    - Highlight nodes in Red on the canvas when `LogicValidator` finds errors.
    - Show tooltip warnings for "Variable not defined" or "Type mismatch".
- [ ] **Type Safety Pass**:
    - Prevent connection of incompatible types (e.g., connecting a `String` to a `Number` socket).
- [ ] **Graph Persistence**:
    - Robust Load/Save of projects to JSON.
    - Autosave functionality.

### **v0.3.0: Discord Feature Parity**
**Focus:** Catching up with modern Discord features.
- [ ] **Interaction Handlers**:
    - Support for Button Clicks (`custom_id`).
    - Support for Modal Submits.
    - Support for Select Menus (String, User, Role, Channel).

---

## 🎨 Phase 2: Polish & Ecosystem (v0.4.0 - v0.6.0)

### **v0.4.0: The Visual Upgrade**
**Focus:** UI refinement and "Juice".
- [ ] **Theme Engine**: Dark mode is standard, but allow custom accent colors.
- [ ] **Node Redesign**:
    - Make nodes look less like "generic Rete" and distinctively "Railgun".
    - Icons for every node type (Discord icons, Logic icons).
- [ ] **Minimap & Navigation**: Better canvas controls for large graphs.

### **v0.5.0: The Plugin System**
**Focus:** Extensibility.
- [ ] **Plugin API**: Load external node definitions at runtime.
- [ ] **Marketplace UI**: A simple view to browse installed/available plugins.
- [ ] **Community Nodes**: Support for npm-based custom nodes.

### **v0.6.0: The Professional Export**
**Focus:** clean code generation.
- [ ] **Prettier Integration**: All generated code is formatted.
- [ ] **TypeScript Export**: Option to generate `.ts` files instead of `.js`.

---

## 🚀 Phase 3: Launch Readiness (v0.7.0 - v1.0.0)
**Goal:** Stability, documentation, and distribution.

### **v0.7.0: Templates & Onboarding**
- [ ] **Project Templates**: "Moderation Bot", "Music Bot", "Ticket System".
- [ ] **Interactive Tutorial**: A walkthrough inside the app teaching the basics.

### **v0.8.0: Cloud Integration (Optional)**
- [ ] **Bot Dashboards**: A generated web dashboard for the *users* of the bot.

### **v0.9.0: Beta Release Candidate**
- [ ] **Performance Audit**: Ensure editor handles 500+ nodes smoothly.
- [ ] **Security Audit**: Ensure generated code doesn't have injection vulnerabilities.

### **v1.0.0: Public Release**
- [ ] **Website Launch**: Documentation, download links, community showcase.
- [ ] **Stable API**: Commitment to not break the Plugin API.
