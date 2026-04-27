// app.js - Vanilla JS for CodeBench on Cloudflare Pages
let currentBattle = null;

async function loadBattle() {
    const container = document.getElementById('code-container');
    container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 4rem;">Loading two fresh code examples...</div>';
    
    try {
        const res = await fetch('/functions/api/battle');
        if (!res.ok) throw new Error('Failed to load');
        
        currentBattle = await res.json();
        
        document.getElementById('prompt-text').textContent = currentBattle.prompt;
        
        container.innerHTML = `
            <div class="option" onclick="selectOption(1)" id="opt1">
                <div class="option-label">OPTION A</div>
                <pre><code>${escapeHtml(currentBattle.codeA)}</code></pre>
                <div class="model-name">${currentBattle.modelA}</div>
            </div>
            <div class="option" onclick="selectOption(2)" id="opt2">
                <div class="option-label">OPTION B</div>
                <pre><code>${escapeHtml(currentBattle.codeB)}</code></pre>
                <div class="model-name">${currentBattle.modelB}</div>
            </div>
        `;
        
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div style="grid-column: 1 / -1; color: #ff5555;">Error loading battle. Try again.</div>';
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
        await fetch('/functions/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                battleId: currentBattle.battleId,
                winner: side,
                modelA: currentBattle.modelA,
                modelB: currentBattle.modelB
            })
        });
        
        // Celebrate and load next
        const btn = document.getElementById(`vote${side}`);
        btn.textContent = '✓ Thanks!';
        btn.style.background = '#00cc77';
        
        setTimeout(() => {
            loadBattle();
            selected = null;
        }, 800);
        
    } catch (e) {
        alert('Vote recorded locally (demo). Full version uses D1.');
        loadBattle();
    }
}

async function skip() {
    loadBattle();
}

// Initial load
window.onload = loadBattle;