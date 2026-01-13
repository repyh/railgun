---
description: Refactor legacy modals to use the declarative ModalBuilder system.
---

1. **Analyze Legacy Component**  
   Open the target legacy modal. Identify all `useState` hooks and `react-hook-form` logic used for form state.
2. **Define Schema**  
   Create a [ModalSchema](cci:2://file:///c:/Users/LENOVO/Documents/web/railgun/src/lib/modal-builder/types.ts:57:0-70:1) object. Map each legacy input to its corresponding [ModalField](cci:2://file:///c:/Users/LENOVO/Documents/web/railgun/src/lib/modal-builder/types.ts:55:0-55:114) type ([text](cci:2://file:///c:/Users/LENOVO/Documents/web/railgun/src/contexts/ModalContext.tsx:4:0-8:1), `password`, `select`, `path-browse`, `dynamic-list`, `toggle`).
3. **Extract Logic**  
   Move the submission handling logic (e.g., IPC calls or state updates) into a standalone [handleSubmit](cci:1://file:///c:/Users/LENOVO/Documents/web/railgun/src/components/modals/CreateCommandModal.tsx:35:4-37:6) function.
4. **Implement ModalBuilder**  
   Replace the entire component body with a `<ModalBuilder />`.  
   Pass the `schema`, [open](cci:1://file:///c:/Users/LENOVO/Documents/web/railgun/src/contexts/ModalContext.tsx:15:4-15:64), `onOpenChange`, and `onSubmit` props.  
   Use `initialData` if the modal needs to be pre-populated.
5. **UI & Security Audit**  
   Verify the modal uses `backdrop-blur-xl` and `bg-zinc-950/90`.  
   Ensure sensitive fields use `type: 'password'` for the automatic visibility toggle.