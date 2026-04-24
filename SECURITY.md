# 🔐 SECURITY.md — Seguridad y Certificados SSL
## Proyecto: Banca en Línea | Taller de Plataformas Web — AIEP

---

## 1. Gestión de Certificados SSL / HTTPS

### ¿Cómo se Gestiona SSL en Esta Arquitectura?

Este proyecto utiliza **Vercel** como plataforma de despliegue, que provee HTTPS automático mediante **Let's Encrypt**.

```
Usuario → [HTTPS/TLS 443] → Vercel Edge Network → [HTTP interno] → Backend Node.js
```

### Flujo del Certificado

1. **Emisión Automática**: Al desplegar en Vercel, se solicita automáticamente un certificado SSL gratuito a [Let's Encrypt](https://letsencrypt.org/) (CA de confianza pública).
2. **Renovación Automática**: Los certificados se renuevan cada **90 días** sin intervención manual.
3. **Redirección HTTPS**: Vercel fuerza redirección de HTTP (puerto 80) → HTTPS (puerto 443) en todos los dominios.
4. **Dominio Personalizado**: Si se configura un dominio propio, Vercel gestiona el certificado para ese dominio automáticamente.

### Verificación del Certificado

```bash
# Verificar certificado SSL del dominio en producción
openssl s_client -connect tu-dominio.vercel.app:443 -servername tu-dominio.vercel.app

# Verificar desde curl
curl -vI https://tu-dominio.vercel.app/health
```

---

## 2. Seguridad Implementada en el Backend

### JSON Web Tokens (JWT)

El sistema usa **JWT via Supabase Auth** para manejo de sesiones:

```
[Login Request] → Supabase Auth → [JWT Token generado]
     ↓                                    ↓
[Cliente almacena token]         [Token firmado con RS256]
     ↓
[Requests con Bearer Token] → [Middleware verifica JWT] → [Acceso concedido/denegado]
```

**Características del JWT:**
- Algoritmo de firma: **RS256** (asimétrico)
- Tiempo de expiración: **1 hora** (access token)
- Refresh token: disponible para renovar sesión sin re-login
- Almacenamiento: `localStorage` en el cliente (con protección XSS via CSP)

### Headers de Seguridad HTTP (Helmet.js)

```javascript
// Implementado en server.js
app.use(helmet({
  contentSecurityPolicy: false, // Swagger UI requiere esto
  crossOriginEmbedderPolicy: false,
}));
```

Headers activos:
| Header | Función |
|--------|---------|
| `X-Content-Type-Options: nosniff` | Previene MIME sniffing |
| `X-Frame-Options: DENY` | Previene clickjacking |
| `X-XSS-Protection: 1; mode=block` | Protección XSS básica |
| `Strict-Transport-Security` | Fuerza HTTPS (HSTS) |
| `Referrer-Policy` | Controla info de referrer |

### CORS (Cross-Origin Resource Sharing)

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN, // Solo origenes permitidos
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

### Rate Limiting (Anti-Fuerza Bruta)

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| General | 100 requests | 15 min |
| Login | 5 intentos | 15 min |
| Transacciones | 30 por usuario | 15 min |

---

## 3. Seguridad en Base de Datos (Supabase/PostgreSQL)

### Row Level Security (RLS)

Cada usuario **solo puede ver sus propios datos** a nivel de base de datos:

```sql
-- Política: Solo el dueño puede leer su perfil
CREATE POLICY "Acceso personal perfiles" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Política: Solo el dueño puede ver su cuenta
CREATE POLICY "Acceso personal cuentas" ON accounts
  FOR SELECT USING (auth.uid() = user_id);

-- Política: Solo transacciones de las propias cuentas
CREATE POLICY "Acceso personal transacciones" ON transactions
  FOR SELECT USING (
    account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid())
  );
```

### Cifrado en Reposo

- Supabase (PostgreSQL en AWS) cifra todos los datos en reposo con **AES-256**.
- Las contraseñas nunca se almacenan — Supabase Auth las hashea con **bcrypt**.

---

## 4. Variables de Entorno Seguras

```env
# .env (NUNCA subir a GitHub)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...  # Clave pública (segura)
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Clave admin (SECRETA - solo backend)
JWT_SECRET=...
ADMIN_EMAIL=admin@banco.cl
CORS_ORIGIN=https://tu-app.vercel.app
```

---

## 5. Despliegue CI/CD con GitHub + Vercel

```
[Push a GitHub main] → [Vercel detecta cambio] → [Build automático] → [Deploy HTTPS]
```

**Configuración en `vercel.json`:**
- Routes configuradas para API y Frontend
- Variables de entorno en el Dashboard de Vercel (nunca en el código)
- HTTPS habilitado automáticamente en todos los dominios `.vercel.app`

---

## 6. Sellos de Confianza y Certificado SSL

| Elemento | Proveedor | Estado |
|----------|-----------|--------|
| Certificado SSL | Let's Encrypt (via Vercel) | ✅ Automático |
| Validación del dominio | DV (Domain Validated) | ✅ |
| HSTS (Strict-Transport-Security) | Vercel + Helmet | ✅ |
| Cipher Suite | TLS 1.2 / 1.3 | ✅ |
| Renovación automática | Vercel (cada 90 días) | ✅ |

> **Nota para el estudiante:** Let's Encrypt emite certificados DV (Domain Validation) gratuitos. Vercel los gestiona completamente: solicitud, emisión, instalación y renovación. El estudiante no necesita configurar nada manualmente — basta con conectar el dominio en el Dashboard de Vercel.

---

## 7. Cómo Verificar HTTPS en Producción

1. Abrir la URL del proyecto en el browser
2. Hacer clic en el 🔒 ícono del candado en la barra de dirección
3. Verificar: **"Conexión segura"** + certificado válido emitido por **Let's Encrypt**
4. En Chrome DevTools → Security tab → verificar TLS version y cipher

```bash
# Verificación alternativa desde terminal
curl -I https://tu-proyecto.vercel.app
# Respuesta esperada: "HTTP/2 200" con header "strict-transport-security"
```
