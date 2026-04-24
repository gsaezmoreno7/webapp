/**
 * =============================================
 * Lista Dinámica — React 18+ (Componente Funcional)
 * Evaluación CIB302 - Ítem 4
 * =============================================
 * 
 * Migración de la lógica del Ítem 1 (DOM vanilla) a React.
 * 
 * Conceptos demostrados:
 * - Componente funcional (function component)
 * - Hook useState para gestión de estado
 * - JSX para renderizado declarativo
 * - React 18 con createRoot
 * - Virtual DOM (explicado en README.md)
 */

const { useState } = React;

/**
 * Genera un color de fondo aleatorio en formato HSL.
 * Misma lógica que en Ítem 1, ahora usada como utilidad pura.
 * @returns {string} Color HSL
 */
const generarColorAleatorio = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 20) + 60;
    const lightness = Math.floor(Math.random() * 15) + 35;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * Componente Header
 * Muestra el título y subtítulo de la aplicación.
 */
const Header = () => (
    <header className="header">
        <div className="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        </div>
        <h1>Lista Dinámica — React 18+</h1>
        <p className="subtitle">Migración del Ítem 1 a componente funcional con Hook <code>useState</code></p>
    </header>
);

/**
 * Componente ItemLista
 * Renderiza un elemento individual de la lista.
 * 
 * @param {Object} props
 * @param {Object} props.item - Datos del ítem (id, texto, color)
 * @param {number} props.index - Índice del ítem
 * @param {Function} props.onEliminar - Callback para eliminar
 */
const ItemLista = ({ item, index, onEliminar }) => (
    <li
        className="list-item"
        style={{ backgroundColor: item.color, color: '#ffffff' }}
    >
        <div className="li-content">
            <span className="li-number">{index + 1}</span>
            <span className="li-text">{item.texto}</span>
        </div>
        <button
            className="btn-delete"
            onClick={() => onEliminar(item.id)}
            aria-label="Eliminar elemento"
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    </li>
);

/**
 * Componente EmptyState
 * Se muestra cuando la lista está vacía.
 */
const EmptyState = () => (
    <div className="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <p>No hay elementos aún. ¡Agrega el primero!</p>
    </div>
);

/**
 * Componente principal: ListaDinamica
 * =====================================
 * 
 * Este componente funcional de React migra la lógica completa del Ítem 1.
 * 
 * USO DE useState:
 * ----------------
 * - useState('') para el estado del input de texto (controlado)
 * - useState([]) para la lista de ítems (array de objetos)
 * 
 * Cada vez que el estado cambia con setState, React:
 * 1. Crea un nuevo Virtual DOM (representación en memoria)
 * 2. Lo compara con el Virtual DOM anterior (diffing)
 * 3. Calcula los cambios mínimos necesarios
 * 4. Aplica SOLO esos cambios al DOM real (reconciliación)
 * 
 * Esto es mucho más eficiente que manipular el DOM directamente
 * con innerHTML o appendChild (como en el Ítem 1).
 */
const ListaDinamica = () => {
    // ========== HOOK useState para gestión de estado ==========

    /**
     * Estado del texto del input.
     * useState retorna un array con:
     * [0] = valor actual del estado
     * [1] = función para actualizar el estado
     */
    const [textoInput, setTextoInput] = useState('');

    /**
     * Estado de la lista de ítems.
     * Cada ítem es un objeto: { id, texto, color }
     * Cuando se llama setItems(), React re-renderiza el componente
     * usando el Virtual DOM para calcular los cambios mínimos.
     */
    const [items, setItems] = useState([]);

    /**
     * Manejador del evento submit del formulario.
     * En React, actualizamos el ESTADO y React se encarga
     * de actualizar el DOM automáticamente (Virtual DOM).
     * 
     * Comparación con Ítem 1 (vanilla JS):
     * - Ítem 1: createElement → appendChild (manipulación directa del DOM)
     * - React: setItems() → Virtual DOM → DOM real (manipulación declarativa)
     */
    const manejarSubmit = (evento) => {
        evento.preventDefault();

        const textoLimpio = textoInput.trim();
        if (textoLimpio === '') return;

        // Crear nuevo ítem con color aleatorio
        const nuevoItem = {
            id: Date.now(), // ID único basado en timestamp
            texto: textoLimpio,
            color: generarColorAleatorio()
        };

        // ✅ setState actualiza el estado y React re-renderiza
        // Usamos spread operator para crear un nuevo array (inmutabilidad)
        setItems((prevItems) => [...prevItems, nuevoItem]);

        // Limpiar el input
        setTextoInput('');
    };

    /**
     * Eliminar un ítem por su ID.
     * filter() crea un nuevo array sin el ítem eliminado.
     * React detecta el cambio de estado y actualiza el DOM.
     */
    const eliminarItem = (id) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    };

    // ========== RENDERIZADO CON JSX ==========
    return (
        <div className="container">
            <Header />

            {/* Sección de input */}
            <section className="card input-section">
                <h2>Agregar Elemento</h2>
                <form className="form-group" onSubmit={manejarSubmit}>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            value={textoInput}
                            onChange={(e) => setTextoInput(e.target.value)}
                            placeholder="Escribe algo y presiona Enter o el botón..."
                            required
                        />
                        <button type="submit" className="btn-submit">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Agregar
                        </button>
                    </div>
                </form>
            </section>

            {/* Sección de lista */}
            <section className="card list-section">
                <div className="list-header">
                    <h2>Lista Dinámica</h2>
                    <span className="badge">
                        {items.length} elemento{items.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {items.length === 0 ? (
                    <EmptyState />
                ) : (
                    <ul className="dynamic-list">
                        {items.map((item, index) => (
                            <ItemLista
                                key={item.id}
                                item={item}
                                index={index}
                                onEliminar={eliminarItem}
                            />
                        ))}
                    </ul>
                )}
            </section>

            {/* Comparación React vs Vanilla */}
            <section className="card comparison-section">
                <h2>⚡ Comparación: Vanilla JS vs React</h2>
                <div className="comparison-grid">
                    <div className="comparison-col">
                        <h3>📦 Ítem 1 — Vanilla JS (DOM directo)</h3>
                        <pre><code>{`// Manipulación directa del DOM
const li = document.createElement('li');
li.textContent = texto;
li.style.backgroundColor = color;
ul.appendChild(li);`}</code></pre>
                    </div>
                    <div className="comparison-col">
                        <h3>⚛️ Ítem 4 — React (Virtual DOM)</h3>
                        <pre><code>{`// Declarativo: actualizamos estado
const [items, setItems] = useState([]);
setItems([...items, nuevoItem]);
// React actualiza el DOM automáticamente`}</code></pre>
                    </div>
                </div>
            </section>

            <footer className="footer">
                <p>Evaluación CIB302 — Ítem 4: React 18+ con Hook useState</p>
                <p className="footer-sub">
                    Virtual DOM • Componentes Funcionales • Estado Inmutable
                </p>
            </footer>
        </div>
    );
};

// ========== Montar la aplicación con React 18 createRoot ==========
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ListaDinamica />);

console.log('⚛️ React 18+ — Aplicación montada correctamente');
console.log('📌 Hook utilizado: useState (gestión de estado)');
console.log('📌 Renderizado: Virtual DOM → DOM real');
