# 🔍 Informe de Auditoría de Accesibilidad — Falabella.com

> **Evaluación CIB302 — Ítem 2: Auditoría de Accesibilidad (Lighthouse)**  
> Análisis realizado sobre: [https://www.falabella.com/falabella-cl/](https://www.falabella.com/falabella-cl/)  
> Fecha del análisis: 12 de Abril de 2026

---

## 1. Sitio Analizado

| Dato | Detalle |
|------|---------|
| **Sitio web** | Falabella Chile |
| **URL** | https://www.falabella.com/falabella-cl/ |
| **Tipo de sitio** | E-commerce (tienda online multisegmento) |
| **Herramienta utilizada** | Google Chrome DevTools + análisis manual del DOM |

---

## 2. Identificación de Arquitectura

### Tipo: **SPA (Single Page Application)**

Falabella.com está construida como una **Single Page Application (SPA)** utilizando el framework **Next.js** (basado en React).

### Evidencias encontradas:

| Evidencia | Descripción |
|-----------|-------------|
| **Scripts Next.js** | Se detectaron scripts cargados desde rutas `/_next/static/chunks/`, patrón característico de Next.js |
| **CSS Modules** | Las clases CSS siguen el patrón de CSS Modules de Next.js, por ejemplo: `SearchBar-module_searchBar__Input__NDqpk` |
| **React Hydration** | Se observó el proceso de hidratación de componentes React en los logs de consola del navegador |
| **Navegación sin recarga** | Los enlaces internos realizan navegación client-side sin recargar la página completa (SPA behavior) |
| **Elemento `<div id="__next">`** | Contenedor raíz típico de Next.js que envuelve toda la aplicación |

### ¿Qué es una SPA?

Una **Single Page Application** carga una única página HTML inicial y luego actualiza dinámicamente el contenido mediante JavaScript, sin recargar toda la página. Esto se diferencia de una **MPA (Multi-Page Application)** donde cada navegación requiere una solicitud HTTP completa al servidor.

```
┌──────────────────────────────────────────────────┐
│                SPA vs MPA                         │
├──────────────────────────────────────────────────┤
│                                                  │
│  SPA (Falabella):                                │
│  - Carga inicial: HTML + JS bundle               │
│  - Navegación: JS actualiza el DOM               │
│  - No recarga la página                          │
│  - Framework: Next.js (React)                    │
│                                                  │
│  MPA (tradicional):                              │
│  - Cada página: nueva solicitud HTTP             │
│  - Navegación: servidor envía HTML completo      │
│  - Recarga completa del navegador                │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 3. Fallos de Accesibilidad Detectados

### 🔴 Fallo 1: Campo de Búsqueda sin Etiqueta Accesible

| Aspecto | Detalle |
|---------|---------|
| **Elemento afectado** | `<input id="testId-SearchBar-Input">` |
| **Ubicación** | Barra de búsqueda principal (header del sitio) |
| **Problema** | El campo de búsqueda no tiene un `<label>` asociado ni atributo `aria-label` |
| **Impacto** | Los usuarios que utilizan lectores de pantalla (JAWS, NVDA, VoiceOver) no pueden identificar el propósito del campo de búsqueda |
| **Criterio WCAG violado** | **1.3.1 Info and Relationships (Level A)** y **4.1.2 Name, Role, Value (Level A)** |
| **Severidad** | 🔴 Alta — La búsqueda es la funcionalidad principal de un e-commerce |

#### Código actual (vulnerable):
```html
<!-- ❌ Sin label ni aria-label -->
<input id="testId-SearchBar-Input" 
       type="text" 
       placeholder="¿Qué estás buscando?"
       class="SearchBar-module_searchBar__Input__NDqpk">
```

#### Propuesta de solución técnica:

**Opción A — Agregar `aria-label` (recomendada):**
```html
<!-- ✅ Con aria-label descriptivo -->
<input id="testId-SearchBar-Input" 
       type="text" 
       placeholder="¿Qué estás buscando?"
       aria-label="Buscar productos en falabella.com"
       class="SearchBar-module_searchBar__Input__NDqpk">
```

**Opción B — Agregar `<label>` oculto visualmente:**
```html
<!-- ✅ Con label asociado pero visualmente oculto -->
<label for="testId-SearchBar-Input" class="sr-only">
    Buscar productos en falabella.com
</label>
<input id="testId-SearchBar-Input" 
       type="text" 
       placeholder="¿Qué estás buscando?">
```

```css
/* Clase para ocultar visualmente pero mantener accesible */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}
```

---

### 🔴 Fallo 2: Controles de Carrusel sin Nombre Accesible

| Aspecto | Detalle |
|---------|---------|
| **Elemento afectado** | `<a class="carousel-v2-control-prev" role="button">` y `<a class="carousel-v2-control-next" role="button">` |
| **Ubicación** | Carruseles de productos y banners en la página principal |
| **Problema** | Los controles de navegación del carrusel usan `<a>` con `role="button"` pero carecen de texto interno y atributo `aria-label`, resultando en botones "vacíos" para tecnologías asistivas |
| **Impacto** | Los usuarios con lectores de pantalla escucharán "botón" sin contexto, sin saber qué acción realizarán al activarlo |
| **Criterio WCAG violado** | **4.1.2 Name, Role, Value (Level A)** y **2.4.4 Link Purpose (Level A)** |
| **Severidad** | 🟠 Media-Alta — Impide la navegación de contenido destacado |

#### Código actual (vulnerable):
```html
<!-- ❌ Botones sin texto accesible -->
<a class="carousel-v2-control-prev" role="button" href="#">
    <!-- Solo contiene un ícono SVG/CSS sin texto alternativo -->
</a>
<a class="carousel-v2-control-next" role="button" href="#">
    <!-- Solo contiene un ícono SVG/CSS sin texto alternativo -->
</a>
```

#### Propuesta de solución técnica:

```html
<!-- ✅ Con aria-label descriptivo -->
<a class="carousel-v2-control-prev" 
   role="button" 
   href="#"
   aria-label="Ir al banner anterior">
    <!-- Ícono visual -->
</a>

<a class="carousel-v2-control-next" 
   role="button" 
   href="#"
   aria-label="Ir al siguiente banner">
    <!-- Ícono visual -->
</a>
```

**Mejora adicional recomendada:** Agregar `aria-live="polite"` al contenedor del carrusel para anunciar cambios de contenido:

```html
<div class="carousel-container" 
     role="region" 
     aria-label="Ofertas destacadas"
     aria-live="polite">
    <!-- Contenido del carrusel -->
</div>
```

---

## 4. Resumen de Hallazgos

| # | Fallo | Elemento | WCAG | Severidad | Solución |
|---|-------|----------|------|-----------|----------|
| 1 | Input sin label | Barra de búsqueda | 1.3.1, 4.1.2 (A) | 🔴 Alta | Agregar `aria-label` |
| 2 | Botones vacíos | Controles de carrusel | 4.1.2, 2.4.4 (A) | 🟠 Media-Alta | Agregar `aria-label` |

---

## 5. Recomendaciones Generales

1. **Auditoría automatizada**: Ejecutar Lighthouse periódicamente como parte del pipeline CI/CD
2. **Testing con lectores de pantalla**: Probar con NVDA (Windows) o VoiceOver (macOS)
3. **Cumplimiento WCAG 2.1**: Aspirar a nivel AA como mínimo para e-commerce
4. **Documentación**: Incluir guías de accesibilidad en el design system del equipo

---

> **Herramientas utilizadas**: Google Chrome DevTools, Inspección manual del DOM  
> **Estándar de referencia**: WCAG 2.1 (Web Content Accessibility Guidelines)  
> **Autor**: Evaluación CIB302 — Taller de Plataformas Web, AIEP
