---
description: Routine security verification for bot credentials and storage integrity.
---

---
description: Routine security verification for bot credentials and storage integrity.
---

1. **Encryption Audit**  
   Inspect `src/services/StorageProvider.ts`. Verify that all sensitive keys (tokens, secrets) are wrapped in Electron's `safeStorage`.
2. **IPC Integrity**  
   Check `StorageIPC.ts` to ensure raw secrets are decrypted only in the Main process and passed securely to the renderer ONLY when necessary.
3. **Environment Sanitization**  
   Review `useBotControl` logic. Ensure environment variables passed to the child process are strictly sanitized.
4. **Config Scrub**  
   Check `railgun.config.json` templates to ensure no default secrets are committed to the repository.