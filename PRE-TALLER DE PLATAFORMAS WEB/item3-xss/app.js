/**
 * =============================================
 * Auditoría XSS — JavaScript
 * Evaluación CIB302 - Ítem 3
 * =============================================
 * 
 * Demuestra:
 * - Vulnerabilidad XSS con innerHTML (PELIGROSO)
 * - Mitigación correcta con innerText/textContent (SEGURO)
 * - Ataque con <img src=x onerror=alert(1)>
 */

'use strict';

// ========== Referencias al DOM ==========
const formVulnerable = document.getElementById('formVulnerable');
const inputVulnerable = document.getElementById('inputVulnerable');
const comentariosVulnerables = document.getElementById('comentariosVulnerables');

const formSeguro = document.getElementById('formSeguro');
const inputSeguro = document.getElementById('inputSeguro');
const comentariosSeguros = document.getElementById('comentariosSeguros');

const btnCopiarPayload = document.getElementById('btnCopiarPayload');

// ========== Utilidades ==========

/**
 * Obtener la hora actual formateada
 * @returns {string} Hora en formato HH:MM:SS
 */
const obtenerHora = () => {
    const ahora = new Date();
    return ahora.toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

// ========== SECCIÓN VULNERABLE (innerHTML) ==========

/**
 * ❌ VERSIÓN VULNERABLE — Usa innerHTML
 * 
 * innerHTML interpreta el string como HTML real.
 * Si el usuario inyecta código como:
 *   <img src=x onerror=alert(1)>
 *   <script>alert('XSS')</script>
 *   <svg onload=alert(document.cookie)>
 * 
 * El navegador lo EJECUTARÁ, permitiendo:
 * - Robo de cookies (document.cookie)
 * - Redirección a sitios maliciosos
 * - Modificación del DOM
 * - Keylogging
 */
formVulnerable.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const comentario = inputVulnerable.value;
    if (comentario.trim() === '') return;

    // ❌ PELIGROSO: innerHTML interpreta HTML y ejecuta scripts
    // Este es el vector de ataque XSS (Cross-Site Scripting)
    const commentHTML = `
        <div class="comment-bubble vulnerable">
            ${comentario}
            <span class="comment-time">${obtenerHora()} — renderizado con innerHTML</span>
        </div>
    `;

    // ❌ innerHTML permite la ejecución de código malicioso
    comentariosVulnerables.innerHTML += commentHTML;

    inputVulnerable.value = '';
    console.warn('⚠️ Comentario agregado con innerHTML (VULNERABLE a XSS)');
});


// ========== SECCIÓN SEGURA (innerText / textContent) ==========

/**
 * ✅ VERSIÓN SEGURA — Usa createElement + textContent
 * 
 * textContent e innerText tratan TODO como texto plano.
 * Si el usuario escribe:
 *   <img src=x onerror=alert(1)>
 * 
 * Se mostrará literalmente como texto:
 *   "<img src=x onerror=alert(1)>"
 * 
 * El navegador NO lo interpreta como HTML ni ejecuta código.
 */
formSeguro.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const comentario = inputSeguro.value;
    if (comentario.trim() === '') return;

    // ✅ SEGURO: Crear elementos con createElement (no se interpreta HTML)
    const divComentario = document.createElement('div');
    divComentario.classList.add('comment-bubble', 'safe');

    // ✅ textContent trata TODA entrada como texto plano
    // Esto es la MITIGACIÓN contra XSS
    const textoComentario = document.createElement('span');
    textoComentario.textContent = comentario; // ← SEGURO: escapa HTML automáticamente

    const tiempoComentario = document.createElement('span');
    tiempoComentario.classList.add('comment-time');
    tiempoComentario.innerText = `${obtenerHora()} — renderizado con textContent`; // ← innerText también es seguro

    // Construir el DOM de forma segura
    divComentario.appendChild(textoComentario);
    divComentario.appendChild(tiempoComentario);

    // ✅ appendChild agrega el elemento ya sanitizado
    comentariosSeguros.appendChild(divComentario);

    inputSeguro.value = '';
    console.log('✅ Comentario agregado con textContent (SEGURO contra XSS)');
});


// ========== Botón copiar payload ==========
btnCopiarPayload.addEventListener('click', () => {
    const payload = '<img src=x onerror=alert(1)>';
    navigator.clipboard.writeText(payload).then(() => {
        btnCopiarPayload.textContent = '¡Copiado!';
        setTimeout(() => {
            btnCopiarPayload.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                Copiar
            `;
        }, 2000);
    });
});


// ========== Mensajes en consola ==========
console.log('🔒 Auditoría XSS — Cargado correctamente');
console.log('📌 Sección VULNERABLE: usa innerHTML (permite XSS)');
console.log('📌 Sección SEGURA: usa textContent/innerText (previene XSS)');
console.log('🎯 Payload de prueba: <img src=x onerror=alert(1)>');
