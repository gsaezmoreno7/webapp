/**
 * =============================================
 * El Cirujano del DOM — JavaScript ES6+
 * Evaluación CIB302 - Ítem 1
 * =============================================
 * 
 * Conceptos demostrados:
 * - document.createElement() para crear nodos
 * - element.appendChild() para insertar en el DOM
 * - Evento 'submit' con preventDefault()
 * - Generación de colores aleatorios con HSL
 * - ECMAScript moderno (const, let, arrow functions, template literals)
 */

'use strict';

// ========== Referencias al DOM ==========
const formulario = document.getElementById('formAgregar');
const inputTexto = document.getElementById('inputTexto');
const listaItems = document.getElementById('listaItems');
const contadorItems = document.getElementById('contadorItems');
const emptyState = document.getElementById('emptyState');

// ========== Estado ==========
let itemCount = 0;

// ========== Funciones Utilitarias ==========

/**
 * Genera un color de fondo aleatorio en formato HSL.
 * Se usa HSL para garantizar colores vibrantes y legibles:
 * - Hue (H): aleatorio entre 0 y 360
 * - Saturation (S): entre 60% y 80% para colores vivos
 * - Lightness (L): entre 35% y 50% para buen contraste con texto blanco
 * @returns {string} Color en formato HSL
 */
const generarColorAleatorio = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 20) + 60; // 60-80%
    const lightness = Math.floor(Math.random() * 15) + 35;  // 35-50%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * Actualiza el contador de elementos en la interfaz.
 */
const actualizarContador = () => {
    const totalItems = listaItems.children.length;
    contadorItems.textContent = `${totalItems} elemento${totalItems !== 1 ? 's' : ''}`;

    // Mostrar u ocultar el estado vacío
    if (totalItems === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }
};

/**
 * Crea un elemento <li> con contenido, color aleatorio y botón de eliminar.
 * Demuestra el uso de:
 * - document.createElement() para crear nuevos nodos del DOM
 * - element.appendChild() para insertarlos en el árbol DOM
 * 
 * @param {string} texto - El texto que contendrá el elemento de la lista
 * @returns {HTMLLIElement} El elemento <li> creado
 */
const crearElementoLista = (texto) => {
    // 1. Crear el elemento <li> con createElement
    const li = document.createElement('li');

    // 2. Asignar color de fondo aleatorio generado por JS
    const colorFondo = generarColorAleatorio();
    li.style.backgroundColor = colorFondo;
    li.style.color = '#ffffff';

    // 3. Incrementar contador
    itemCount += 1;

    // 4. Crear el contenido interno del <li>
    const contenido = document.createElement('div');
    contenido.classList.add('li-content');

    // 4a. Número del ítem
    const numero = document.createElement('span');
    numero.classList.add('li-number');
    numero.textContent = itemCount;

    // 4b. Texto del ítem
    const textoSpan = document.createElement('span');
    textoSpan.classList.add('li-text');
    textoSpan.textContent = texto;

    // 5. Usar appendChild para construir la estructura
    contenido.appendChild(numero);
    contenido.appendChild(textoSpan);

    // 6. Crear botón de eliminar
    const btnEliminar = document.createElement('button');
    btnEliminar.classList.add('btn-delete');
    btnEliminar.setAttribute('aria-label', 'Eliminar elemento');
    btnEliminar.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    `;

    // 7. Evento click para eliminar el elemento
    btnEliminar.addEventListener('click', () => {
        li.style.animation = 'fadeOut 0.3s ease forwards';
        li.addEventListener('animationend', () => {
            li.remove(); // Eliminar del DOM
            actualizarContador();
        });
    });

    // 8. Ensamblar el <li> usando appendChild
    li.appendChild(contenido);
    li.appendChild(btnEliminar);

    return li;
};

/**
 * Maneja el evento submit del formulario.
 * Captura el texto del input, crea un nuevo <li> y lo agrega a la lista.
 * 
 * @param {Event} evento - El evento submit del formulario
 */
const manejarSubmit = (evento) => {
    // Prevenir el comportamiento por defecto del formulario (recargar página)
    evento.preventDefault();

    // Obtener y limpiar el texto ingresado
    const texto = inputTexto.value.trim();

    // Validar que no esté vacío
    if (texto === '') {
        inputTexto.focus();
        return;
    }

    // Crear el nuevo elemento con createElement
    const nuevoElemento = crearElementoLista(texto);

    // Agregar al DOM usando appendChild
    listaItems.appendChild(nuevoElemento);

    // Actualizar el contador
    actualizarContador();

    // Limpiar el input y mantener el foco
    inputTexto.value = '';
    inputTexto.focus();
};

// ========== Event Listeners ==========

// Manejo de evento SUBMIT en el formulario
formulario.addEventListener('submit', manejarSubmit);

// Inicializar el estado
actualizarContador();

console.log('✅ El Cirujano del DOM — Cargado correctamente');
console.log('📌 Métodos utilizados: createElement, appendChild, addEventListener(submit)');
