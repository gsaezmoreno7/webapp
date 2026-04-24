# ⚛️ Lista Dinámica — React 18+

> **Evaluación CIB302 — Ítem 4: Desarrollo Moderno**  
> Migración de la lógica del Ítem 1 (DOM vanilla) a un componente funcional de React 18+.

---

## 📋 Descripción del Proyecto

Este proyecto implementa una **lista dinámica interactiva** donde el usuario puede agregar y eliminar elementos de texto. Cada elemento recibe un **color de fondo aleatorio** generado por JavaScript (HSL). 

La lógica fue originalmente implementada en JavaScript vanilla (Ítem 1) usando `document.createElement()` y `element.appendChild()`. En este ítem, se migró completamente a **React 18+** utilizando:

- **Componentes funcionales** (function components)
- **Hook `useState`** para gestión reactiva de estado
- **JSX** para renderizado declarativo
- **React 18 `createRoot`** API

---

## 🚀 Tecnologías Utilizadas

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React | 18.x | Biblioteca de UI |
| ReactDOM | 18.x | Renderizado al DOM |
| Babel | Standalone | Transpilación de JSX en navegador |
| CSS3 | — | Estilos con glassmorphism y animaciones |
| HTML5 | — | Estructura semántica |

---

## 📁 Estructura del Proyecto

```
item4-react/
├── index.html      # Punto de entrada con React 18 CDN
├── App.jsx         # Componente funcional principal
├── style.css       # Estilos premium
└── README.md       # Este archivo
```

---

## ⚡ Instalación y Ejecución

### Opción 1: Abrir directamente en el navegador
```bash
# Simplemente abrir el archivo index.html en un navegador moderno
# No requiere instalación de dependencias
```

### Opción 2: Con un servidor local (recomendado)
```bash
# Si tienes Node.js instalado:
npx -y serve .

# O con Python:
python -m http.server 8080
```

---

## 🧠 Explicación del Virtual DOM

### ¿Qué es el DOM Real?
El **DOM (Document Object Model)** es la representación en memoria que el navegador crea a partir del HTML. Es un árbol de nodos donde cada elemento HTML es un nodo. Manipular el DOM directamente es **costoso** porque cada cambio puede provocar un **reflow** (recálculo del layout) y un **repaint** (redibujo visual).

### ¿Qué es el Virtual DOM?
El **Virtual DOM** es una **copia ligera del DOM real** almacenada en memoria como un objeto JavaScript. React la utiliza como intermediario entre el código del desarrollador y el DOM real del navegador.

### ¿Cómo funciona?

```
┌──────────────────────────────────────────────────┐
│                    FLUJO REACT                    │
├──────────────────────────────────────────────────┤
│                                                  │
│  1. Estado cambia (setState)                     │
│           │                                      │
│           ▼                                      │
│  2. React crea un NUEVO Virtual DOM              │
│           │                                      │
│           ▼                                      │
│  3. DIFFING: React compara el Virtual DOM        │
│     nuevo con el anterior                        │
│           │                                      │
│           ▼                                      │
│  4. React identifica los CAMBIOS MÍNIMOS         │
│           │                                      │
│           ▼                                      │
│  5. RECONCILIACIÓN: Aplica SOLO esos cambios     │
│     al DOM real (batch updates)                  │
│           │                                      │
│           ▼                                      │
│  6. El navegador re-renderiza solo lo necesario  │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Ejemplo práctico en este proyecto

**Vanilla JS (Ítem 1) — Manipulación directa del DOM:**
```javascript
// Cada operación toca el DOM real directamente
const li = document.createElement('li');  // ← Operación DOM
li.textContent = texto;                   // ← Operación DOM
li.style.backgroundColor = color;         // ← Operación DOM
ul.appendChild(li);                       // ← Operación DOM (trigger reflow)
```
Cada línea es una operación directa sobre el DOM real, causando múltiples reflows.

**React (Ítem 4) — Virtual DOM:**
```javascript
// Solo actualizamos el ESTADO, React se encarga del DOM
const [items, setItems] = useState([]);

// Agregar un ítem: solo cambiamos el estado
setItems(prev => [...prev, { id: Date.now(), texto, color }]);

// React internamente:
// 1. Crea nuevo Virtual DOM con el ítem agregado
// 2. Compara con el Virtual DOM anterior (diffing)
// 3. Detecta: "solo se agregó un <li> nuevo"
// 4. Aplica UN SOLO cambio al DOM real
```

### Ventajas del Virtual DOM

| Aspecto | DOM Directo | Virtual DOM (React) |
|---------|-------------|---------------------|
| **Rendimiento** | Múltiples reflows por operación | Batch updates, mínimos reflows |
| **Mantenibilidad** | Código imperativo, difícil de escalar | Código declarativo, componible |
| **Eficiencia** | Actualiza todo el subárbol | Solo actualiza lo que cambió |
| **Abstracción** | Bajo nivel, manual | Alto nivel, automático |
| **Cross-platform** | Solo navegador | Server-side, mobile (React Native) |

---

## 🔑 Hook `useState` — Explicación

```javascript
const [textoInput, setTextoInput] = useState('');
//     ↑ estado     ↑ setter        ↑ valor inicial
```

- **`textoInput`**: Valor actual del estado (lectura)
- **`setTextoInput`**: Función para actualizar el estado (escritura)
- **`useState('')`**: Hook que inicializa el estado con string vacío

Cada vez que se llama `setTextoInput(nuevoValor)`:
1. React programa un re-render del componente
2. El Virtual DOM se recalcula
3. Solo los cambios necesarios se aplican al DOM real

---

## 👤 Autor

Evaluación CIB302 — Taller de Plataformas Web  
AIEP — Universidad Andrés Bello  
Ingeniería en Ciberseguridad

---

## 📜 Licencia

Proyecto académico — Uso educativo.
