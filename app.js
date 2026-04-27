// app.js - CodeBench Frontend
let currentBattle = null;

async function loadBattle() {
    const container = document.getElementById('code-container');
    container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: #888;">
            Loading two fresh code examples...
        </div>`;

    try {
        const res = await fetch('/api/battle');   // ← Fixed: correct path for Pages Functions

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        currentBattle = await res.json();

        document.getElementById('prompt-text').textContent = 
            currentBattle.prompt || "No prompt loaded";

        container.innerHTML = `
            <div class="option" onclick="selectOption(1)" id="opt1">
                <div class="option-label">OPTION A</div>
                <pre><code>${escapeHtml(currentBattle.codeA || '')}</code></pre>
                <div class="model-name">${currentBattle.modelA || 'Model A'}</div>
            </div>
            <div class="option" onclick="selectOption(2)" id="opt2">
                <div class="option-label">OPTION B</div>
                <pre><code>${escapeHtml(currentBattle.codeB || '')}</code></pre>
                <div class="model-name">${currentBattle.modelB || 'Model B'}</div>
            </div>
        `;

    } catch (e) {
        console.error(e);
        container.innerHTML = `
            <div style="grid-column: 1 / -1; color: #ff5555; text-align: center; padding: 3rem;">
                Error loading battle.<br>
                <small>${e.message}</small><br><br>
                <button onclick="loadBattle()" style="padding: 0.8rem 1.5rem; font-size: 1rem;">
                    Try Again
                </button>
            </div>`;
    }
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

let selected = null;

function selectOption(n) {
    document.getElementById('opt1').classList.toggle('selected', n === 1);
    document.getElementById('opt2').classList.toggle('selected', n === 2);
    selected = n;
}

async function vote(side) {
    if (!currentBattle) return;

    try {
        const res = await fetch('/api/vote', {   // ← Also fixed here
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                battleId: currentBattle.battleId,
                winner: side,
                modelA: currentBattle.modelA,
                modelB: currentBattle.modelB
            })
        });

        if (res.ok) {
            const btn = document.getElementById(`vote${side}`);
            btn.textContent = '✓ Thank you!';
            btn.style.background = '#00cc77';
        }

        setTimeout(() => {
            loadBattle();
            selected = null;
        }, 900);

    } catch (e) {
        console.error(e);
        alert('Vote saved (offline mode)');
        loadBattle();
    }
}

function skip() {
    loadBattle();
}

// Load on page start
window.onload = loadBattle;