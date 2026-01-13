module.exports = (ctx) => {
    ctx.registerView('railgun.debug-toolkit.view', (container, bridge) => {
        // Create UI
        container.innerHTML = `
            <div style="padding: 16px; color: #e4e4e7; height: 100%; display: flex; flex-direction: column;">
                <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem; color: #fff;">Debug Toolkit</h2>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button id="btn-ping" style="padding: 8px; background: #2563eb; border-radius: 4px; border: none; color: white; cursor: pointer; font-weight: 500;">
                        Bridge Ping
                    </button>
                    <button id="btn-fs" style="padding: 8px; background: #27272a; border-radius: 4px; border: 1px solid #3f3f46; color: white; cursor: pointer; transition: background 0.2s;">
                        List Files (FS)
                    </button>
                    <button id="btn-term" style="padding: 8px; background: #27272a; border-radius: 4px; border: 1px solid #3f3f46; color: white; cursor: pointer; transition: background 0.2s;">
                        Write to Terminal
                    </button>
                </div>
                <div style="margin-top: 16px; margin-bottom: 8px; font-size: 0.875rem; color: #a1a1aa;">Output</div>
                <div id="output" style="flex: 1; padding: 12px; background: #09090b; border: 1px solid #27272a; border-radius: 6px; font-family: monospace; font-size: 12px; color: #22c55e; overflow-y: auto; white-space: pre-wrap;">Ready.</div>
            </div>
        `;

        const btnPing = container.querySelector('#btn-ping');
        const btnFs = container.querySelector('#btn-fs');
        const btnTerm = container.querySelector('#btn-term');
        const output = container.querySelector('#output');

        const log = (msg) => {
            const timestamp = new Date().toLocaleTimeString();
            output.innerText = `[${timestamp}] ${msg}\n` + output.innerText;
        };

        btnPing.onclick = () => {
            bridge.ui.showNotification('info', 'Pong from Debug Toolkit!');
            bridge.ui.setStatusBar('Debug Toolkit Active');
            log('Sent notification & updated status bar.');
        };

        btnFs.onclick = async () => {
            try {
                log('Reading file system...');
                const files = await bridge.workspace.listFiles();
                log(`Files:\n${files.join('\n')}`);
            } catch (err) {
                log(`FS Error: ${err.message}`);
                bridge.ui.showNotification('error', 'FS Access Failed');
            }
        };

        btnTerm.onclick = () => {
            const cmd = "echo 'Hello from Plugin Bridge!'";
            bridge.terminal.execute(cmd);
            log(`Executed: ${cmd}`);
        };

        // Cleanup
        return () => {
            console.log('Debug Toolkit Unmounted');
        };
    });
};
