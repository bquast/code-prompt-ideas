// app.js - CodeBench with Smart Live Execution
let currentBattle = null;

async function loadBattle() {
    const container = document.getElementById('code-container');
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem;color:#666;">
        Generating fresh code from GPT-4o + Grok-4.20...
    </div>`;

    try {
        const res = await fetch('/api/battle');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        currentBattle = await res.json();

        document.getElementById('prompt-text').textContent = currentBattle.prompt;

        container.innerHTML = `
            <div class="option" id="opt1">
                <div class="option-label">OPTION A</div>
                <pre><code>${escapeHtml(currentBattle.codeA)}</code></pre>
                <div class="output" id="output1">Testing code...</div>
                <div class="model-name">${currentBattle.modelA}</div>
            </div>
            
            <div class="option" id="opt2">
                <div class="option-label">OPTION B</div>
                <pre><code>${escapeHtml(currentBattle.codeB)}</code></pre>
                <div class="output" id="output2">Testing code...</div>
                <div class="model-name">${currentBattle.modelB}</div>
            </div>
        `;

        // Run smart tests
        runCodeSmart(currentBattle.codeA, 'output1');
        runCodeSmart(currentBattle.codeB, 'output2');

    } catch (e) {
        console.error(e);
        container.innerHTML = `<div style="grid-column:1/-1;color:#ff5555;text-align:center;padding:3rem;">
            Error loading battle.<br><button onclick="loadBattle()">Try Again</button>
        </div>`;
    }
}

function escapeHtml(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Improved: Try to detect and test the function automatically
function runCodeSmart(code, outputId) {
    const outputEl = document.getElementById(outputId);
    let logs = [];

    const originalLog = console.log;
    console.log = (...args) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
    };

    try {
        // Create a safe execution context
        const func = new Function(`
            let output = [];
            const console = { log: (...args) => output.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')) };
            
            ${code}
            
            // Try to auto-test common patterns
            try {
                if (typeof reverseStr === 'function') {
                    output.push("Test: reverseStr('hello') → " + reverseStr('hello'));
                    output.push("Test: reverseStr('CodeBench') → " + reverseStr('CodeBench'));
                }
                if (typeof reverse === 'function') {
                    output.push("Test: reverse('test') → " + reverse('test'));
                }
            } catch(e) {}
            
            return output.join('\\n');
        `)();

        outputEl.textContent = func || logs.join('\n') || "(No output detected)";
        
    } catch (err) {
        outputEl.textContent = `Execution error: ${err.message}`;
        outputEl.style.color = '#ff6666';
    } finally {
        console.log = originalLog;
    }
}

let selected = null;

function selectOption(n) {
    document.getElementById('opt1').classList.toggle('selected', n === 1);
    document.getElementById('opt2').classList.toggle('selected', n === 2);
    selected = n;
}

async function vote(side) {
    if (!currentBattle) return;

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
    btn.style.background = '#00cc77';

    setTimeout(loadBattle, 1400);
}

function skip() {
    loadBattle();
}

window.onload = loadBattle;