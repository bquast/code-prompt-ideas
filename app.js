let currentBattle = null;

async function loadBattle() {
    const container = document.getElementById('code-container');
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem;color:#888;">
        Generating fresh code from GPT-4o + Grok-4.20...
    </div>`;

    try {
        const res = await fetch('/api/battle');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        currentBattle = await res.json();

        document.getElementById('prompt-text').textContent = currentBattle.prompt;

        container.innerHTML = `
            <div class="option" id="opt1">
                <div class="option-header">Model A</div>
                <pre><code>${escapeHtml(currentBattle.codeA)}</code></pre>
                <div class="output" id="output1">Testing code...</div>
                <div class="model-name" id="modelA">${currentBattle.modelA}</div>
            </div>
            
            <div class="option" id="opt2">
                <div class="option-header">Model B</div>
                <pre><code>${escapeHtml(currentBattle.codeB)}</code></pre>
                <div class="output" id="output2">Testing code...</div>
                <div class="model-name" id="modelB">${currentBattle.modelB}</div>
            </div>
        `;

        runCodeSmart(currentBattle.codeA, 'output1');
        runCodeSmart(currentBattle.codeB, 'output2');

    } catch (e) {
        console.error(e);
        container.innerHTML = `<div style="grid-column:1/-1;color:#ef4444;text-align:center;padding:3rem;">
            Error loading battle.<br><button onclick="loadBattle()" style="margin-top:1rem;padding:0.8rem 1.5rem;">Try Again</button>
        </div>`;
    }
}

function escapeHtml(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function runCodeSmart(code, outputId) {
    const outputEl = document.getElementById(outputId);
    let logs = [];

    const originalLog = console.log;
    console.log = (...args) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
    };

    try {
        const func = new Function(`
            let output = [];
            const console = { log: (...args) => output.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')) };
            
            ${code}
            
            try {
                if (typeof reverseStr === 'function') {
                    output.push("Test: reverseStr('hello') → " + reverseStr('hello'));
                    output.push("Test: reverseStr('CodeBench') → " + reverseStr('CodeBench'));
                }
            } catch(e) {}
            
            return output.join('\\n');
        `)();

        outputEl.textContent = func || logs.join('\n') || "(No output detected)";
        
    } catch (err) {
        outputEl.textContent = `Error: ${err.message}`;
        outputEl.style.color = '#ef4444';
    } finally {
        console.log = originalLog;
    }
}

async function vote(side) {
    if (!currentBattle) return;

    // Reveal model names
    document.getElementById('opt1').classList.add('revealed');
    document.getElementById('opt2').classList.add('revealed');

    try {
        await fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ battleId: currentBattle.battleId, winner: side })
        });
    } catch (e) {}

    const btn = document.getElementById(`vote${side}`);
    btn.textContent = '✓ Thank you!';
    btn.style.background = '#10B981';

    setTimeout(() => loadBattle(), 1400);
}

function skip() {
    loadBattle();
}

window.onload = loadBattle;
