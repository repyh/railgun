---
description: Add a new functional node to the visual editor and the bot compiler.
---

---
description: Add a new functional node to the visual editor and the bot compiler.
---

1. **Schema Definition**  
   Open [src/lib/registries/NodeSchemaRegistry.ts](cci:7://file:///c:/Users/LENOVO/Documents/web/railgun/src/lib/registries/NodeSchemaRegistry.ts:0:0-0:0). Define the node's inputs, outputs, and metadata (title, category, description).
2. **Compiler Logic**  
   Locate the compiler's node resolver (e.g., `src/lib/compiler/NodeResolver.ts`). Implement the JavaScript generation logic for the new node.
3. **Iconography**  
   Assign a relevant `lucide-react` icon to the node in the registry.
4. **Registration**  
   Ensure the node is exported so it appears in the `FlowEditor` context menu.
5. **Verification**  
   Add the node to a test graph, connect it, and run a "COMPILE" test to ensure the generated code is syntactically correct.