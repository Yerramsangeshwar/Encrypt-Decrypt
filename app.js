/* ===================================================
   Caesar Cipher Tool — Application Logic
   SkillCraft Technology
   =================================================== */

(function () {
    'use strict';

    // ─── DOM Elements ──────────────────────────────
    const inputText     = document.getElementById('input-text');
    const shiftValue    = document.getElementById('shift-value');
    const shiftSlider   = document.getElementById('shift-slider');
    const shiftInc      = document.getElementById('shift-inc');
    const shiftDec      = document.getElementById('shift-dec');
    const btnEncrypt    = document.getElementById('btn-encrypt');
    const btnDecrypt    = document.getElementById('btn-decrypt');
    const modeSlider    = document.getElementById('mode-slider');
    const actionBtn     = document.getElementById('action-btn');
    const actionBtnText = document.querySelector('.action-btn-text');
    const outputText    = document.getElementById('output-text');
    const outputPlaceholder = document.getElementById('output-placeholder');
    const copyBtn       = document.getElementById('copy-btn');
    const copyText      = document.getElementById('copy-text');
    const charCounter   = document.getElementById('char-counter');
    const mappingGrid   = document.getElementById('mapping-grid');
    const cipherCanvas  = document.getElementById('cipher-wheel');
    const particlesEl   = document.getElementById('particles');

    // Stat elements
    const statTotal     = document.getElementById('stat-total');
    const statShifted   = document.getElementById('stat-shifted');
    const statShiftVal  = document.getElementById('stat-shift-val');
    const statMode      = document.getElementById('stat-mode');

    // ─── State ──────────────────────────────────────
    let mode = 'encrypt'; // 'encrypt' or 'decrypt'
    let shift = 3;
    let lastOutput = '';

    // ─── Constants ──────────────────────────────────
    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // ─── Initialize ─────────────────────────────────
    function init() {
        createParticles();
        buildMappingGrid();
        drawCipherWheel();
        bindEvents();
        updateStats();
    }

    // ─── Background Particles ───────────────────────
    function createParticles() {
        const count = 30;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = (8 + Math.random() * 14) + 's';
            p.style.animationDelay = (Math.random() * 10) + 's';
            p.style.width = p.style.height = (2 + Math.random() * 3) + 'px';
            p.style.background = Math.random() > 0.5
                ? 'rgba(108, 99, 255, 0.35)'
                : 'rgba(0, 217, 255, 0.25)';
            particlesEl.appendChild(p);
        }
    }

    // ─── Event Bindings ─────────────────────────────
    function bindEvents() {
        // Mode toggle
        btnEncrypt.addEventListener('click', () => setMode('encrypt'));
        btnDecrypt.addEventListener('click', () => setMode('decrypt'));

        // Shift controls
        shiftInc.addEventListener('click', () => setShift(shift + 1));
        shiftDec.addEventListener('click', () => setShift(shift - 1));
        shiftValue.addEventListener('input', () => {
            let v = parseInt(shiftValue.value);
            if (!isNaN(v)) setShift(v);
        });
        shiftSlider.addEventListener('input', () => {
            setShift(parseInt(shiftSlider.value));
        });

        // Input text
        inputText.addEventListener('input', onInputChange);

        // Action button
        actionBtn.addEventListener('click', processMessage);

        // Copy button
        copyBtn.addEventListener('click', copyOutput);

        // Keyboard shortcut: Enter to process
        inputText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                processMessage();
            }
        });
    }

    // ─── Mode Switching ─────────────────────────────
    function setMode(m) {
        mode = m;
        btnEncrypt.classList.toggle('active', mode === 'encrypt');
        btnDecrypt.classList.toggle('active', mode === 'decrypt');
        modeSlider.classList.toggle('decrypt', mode === 'decrypt');
        actionBtnText.textContent = mode === 'encrypt' ? 'Encrypt Message' : 'Decrypt Message';
        statMode.textContent = mode === 'encrypt' ? 'ENC' : 'DEC';

        // Re-process if there's input
        if (inputText.value.trim()) {
            processMessage();
        }
    }

    // ─── Shift Value ─────────────────────────────────
    function setShift(v) {
        shift = Math.max(1, Math.min(25, v));
        shiftValue.value = shift;
        shiftSlider.value = shift;
        statShiftVal.textContent = shift;
        buildMappingGrid();
        drawCipherWheel();

        // Re-process if there's input
        if (inputText.value.trim()) {
            processMessage();
        }
    }

    // ─── Input Change ───────────────────────────────
    function onInputChange() {
        const len = inputText.value.length;
        charCounter.textContent = len + ' character' + (len !== 1 ? 's' : '');

        if (inputText.value.trim()) {
            processMessage();
        } else {
            clearOutput();
        }
    }

    // ─── Caesar Cipher Algorithm ─────────────────────
    function caesarCipher(text, shiftAmount, encrypt) {
        const s = encrypt ? shiftAmount : (26 - shiftAmount);
        let result = '';
        let lettersShifted = 0;

        for (let i = 0; i < text.length; i++) {
            const c = text[i];
            if (/[a-z]/.test(c)) {
                result += String.fromCharCode(((c.charCodeAt(0) - 97 + s) % 26) + 97);
                lettersShifted++;
            } else if (/[A-Z]/.test(c)) {
                result += String.fromCharCode(((c.charCodeAt(0) - 65 + s) % 26) + 65);
                lettersShifted++;
            } else {
                result += c;
            }
        }

        return { result, lettersShifted };
    }

    // ─── Process Message ─────────────────────────────
    function processMessage() {
        const text = inputText.value;
        if (!text.trim()) {
            clearOutput();
            return;
        }

        const { result, lettersShifted } = caesarCipher(text, shift, mode === 'encrypt');

        lastOutput = result;
        outputText.textContent = result;
        outputText.style.display = 'block';
        outputPlaceholder.style.display = 'none';

        // Trigger animation
        outputText.style.animation = 'none';
        outputText.offsetHeight; // reflow
        outputText.style.animation = 'textReveal 0.4s ease-out';

        copyBtn.disabled = false;

        // Update stats
        statTotal.textContent = text.length;
        statShifted.textContent = lettersShifted;

        // Highlight mapped letters in the mapping grid
        highlightMappedLetters(text);

        // Pulse the output border
        const outputArea = document.getElementById('output-area');
        outputArea.style.borderColor = 'rgba(0, 217, 255, 0.4)';
        setTimeout(() => {
            outputArea.style.borderColor = '';
        }, 600);
    }

    // ─── Clear Output ───────────────────────────────
    function clearOutput() {
        lastOutput = '';
        outputText.style.display = 'none';
        outputPlaceholder.style.display = 'flex';
        copyBtn.disabled = true;
        statTotal.textContent = '0';
        statShifted.textContent = '0';
        clearMappingHighlights();
    }

    // ─── Copy Output ────────────────────────────────
    async function copyOutput() {
        if (!lastOutput) return;

        try {
            await navigator.clipboard.writeText(lastOutput);
            copyBtn.classList.add('copied');
            copyText.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyText.textContent = 'Copy to Clipboard';
            }, 2000);
        } catch {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = lastOutput;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            copyBtn.classList.add('copied');
            copyText.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyText.textContent = 'Copy to Clipboard';
            }, 2000);
        }
    }

    // ─── Update Stats ───────────────────────────────
    function updateStats() {
        statTotal.textContent = '0';
        statShifted.textContent = '0';
        statShiftVal.textContent = shift;
        statMode.textContent = mode === 'encrypt' ? 'ENC' : 'DEC';
    }

    // ─── Mapping Grid ───────────────────────────────
    function buildMappingGrid() {
        mappingGrid.innerHTML = '';

        for (let i = 0; i < 26; i++) {
            const plain = ALPHABET[i];
            const cipherIndex = (i + shift) % 26;
            const cipher = ALPHABET[cipherIndex];

            const cell = document.createElement('div');
            cell.className = 'map-cell';
            cell.dataset.letter = plain;
            cell.innerHTML = `
                <span class="map-plain">${plain}</span>
                <span class="map-arrow">↓</span>
                <span class="map-cipher">${cipher}</span>
            `;
            mappingGrid.appendChild(cell);
        }
    }

    function highlightMappedLetters(text) {
        clearMappingHighlights();
        const usedLetters = new Set(text.toUpperCase().replace(/[^A-Z]/g, '').split(''));
        const cells = mappingGrid.querySelectorAll('.map-cell');
        cells.forEach(cell => {
            if (usedLetters.has(cell.dataset.letter)) {
                cell.classList.add('highlighted');
            }
        });
    }

    function clearMappingHighlights() {
        mappingGrid.querySelectorAll('.map-cell.highlighted').forEach(c => c.classList.remove('highlighted'));
    }

    // ─── Cipher Wheel (Canvas) ──────────────────────
    function drawCipherWheel() {
        const ctx = cipherCanvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const size = 340;

        cipherCanvas.width = size * dpr;
        cipherCanvas.height = size * dpr;
        cipherCanvas.style.width = size + 'px';
        cipherCanvas.style.height = size + 'px';
        ctx.scale(dpr, dpr);

        const cx = size / 2;
        const cy = size / 2;
        const outerR = 155;
        const innerR = 110;
        const centerR = 40;

        ctx.clearRect(0, 0, size, size);

        // Outer ring background
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(108, 99, 255, 0.06)';
        ctx.fill();

        // Outer ring border
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(108, 99, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner ring background
        ctx.beginPath();
        ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 217, 255, 0.06)';
        ctx.fill();

        // Inner ring border
        ctx.beginPath();
        ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 217, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Center circle
        ctx.beginPath();
        ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
        const grad = ctx.createLinearGradient(cx - centerR, cy - centerR, cx + centerR, cy + centerR);
        grad.addColorStop(0, 'rgba(108, 99, 255, 0.2)');
        grad.addColorStop(1, 'rgba(0, 217, 255, 0.2)');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(108, 99, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Center text
        ctx.fillStyle = '#f1f5f9';
        ctx.font = '700 16px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+' + shift, cx, cy - 4);
        ctx.fillStyle = '#64748b';
        ctx.font = '500 9px "Inter", sans-serif';
        ctx.fillText('SHIFT', cx, cy + 12);

        // Outer letters (plain alphabet)
        for (let i = 0; i < 26; i++) {
            const angle = (i / 26) * Math.PI * 2 - Math.PI / 2;
            const r = outerR - 20;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;

            // Tick mark
            const tickStart = outerR - 4;
            const tickEnd = outerR;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * tickStart, cy + Math.sin(angle) * tickStart);
            ctx.lineTo(cx + Math.cos(angle) * tickEnd, cy + Math.sin(angle) * tickEnd);
            ctx.strokeStyle = 'rgba(108, 99, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#94a3b8';
            ctx.font = '600 11px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(ALPHABET[i], x, y);
        }

        // Inner letters (shifted alphabet)
        for (let i = 0; i < 26; i++) {
            const angle = (i / 26) * Math.PI * 2 - Math.PI / 2;
            const shiftedIndex = (i + shift) % 26;
            const r = innerR - 18;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;

            // Tick mark
            const tickStart = innerR - 4;
            const tickEnd = innerR;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * tickStart, cy + Math.sin(angle) * tickStart);
            ctx.lineTo(cx + Math.cos(angle) * tickEnd, cy + Math.sin(angle) * tickEnd);
            ctx.strokeStyle = 'rgba(0, 217, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#00D9FF';
            ctx.font = '700 11px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(ALPHABET[shiftedIndex], x, y);
        }

        // Draw connecting lines for first 3 letters as visual guide
        for (let i = 0; i < 3; i++) {
            const angle = (i / 26) * Math.PI * 2 - Math.PI / 2;
            const outerX = cx + Math.cos(angle) * (outerR - 32);
            const outerY = cy + Math.sin(angle) * (outerR - 32);
            const innerX = cx + Math.cos(angle) * (innerR - 6);
            const innerY = cy + Math.sin(angle) * (innerR - 6);

            ctx.beginPath();
            ctx.moveTo(outerX, outerY);
            ctx.lineTo(innerX, innerY);
            ctx.strokeStyle = 'rgba(108, 99, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Outer label
        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.font = '600 7px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PLAIN', cx, cy - outerR - 8);
        ctx.fillStyle = 'rgba(0, 217, 255, 0.5)';
        ctx.fillText('CIPHER', cx, cy - innerR - 8);
    }

    // ─── Launch ──────────────────────────────────────
    init();

})();
