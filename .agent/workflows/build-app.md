---
description: Verify, build, and package the Railgun application for distribution.
---

---
description: Verify, build, and package the Railgun application for distribution.
---

// turbo-all
1. **Environment Preparation**  
   Run `npm install` to ensure dependencies are up to date and clear `dist` artifacts.
2. **Type Check**  
   Run `npx tsc --noEmit -p tsconfig.app.json` and `npx tsc --noEmit -p tsconfig.electron.json` to verify type safety.
3. **Build Components**  
   Run `npm run build` to generate production-ready assets.
4. **Package Distribution**  
   Run the Electron builder: `npm run dist:win` (or appropriate platform command).
5. **Verify Artifact**  
   Confirm the setup executable exists in the `dist` directory.