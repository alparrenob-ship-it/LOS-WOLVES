# WOLVES MVP

WOLVES es una plataforma web de bienestar emocional estudiantil para Eight Academy. El MVP integra registro emocional, Wolf AI simulado, retos de bienestar, gamificación con Eight-Coins, NFTs educativos, Tienda Wolves, blockchain conceptual, Panel DECE, Panel Administrador y consola de demostración por roles.

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript puro
- localStorage para datos de prueba
- Diseño responsive
- Sin backend real en esta versión
- Sin frameworks complejos

## Estructura de carpetas

```text
wolves-mvp/
├── index.html
├── README.md
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── assets/
│   ├── logo/
│   ├── mascota/
│   ├── productos/
│   ├── nft/
│   └── screenshots/
└── docs/
    └── whitepaper.md
```

## Funcionalidades

- Portal público con problema, solución, ODS, equipo, misión, visión, planes SaaS y contacto.
- Modal de inicio de sesión y registro institucional.
- Panel Estudiante con Perfil RPG, Mood Check, Wolf AI, retos, wallet, blockchain, tienda y comunidad.
- Mood Check con recompensa de Eight-Coins, racha semanal y alertas automáticas.
- Wolf AI simulado con respuestas empáticas y detección de palabras de riesgo.
- Solicitud de citas con DECE.
- Retos mensuales con desbloqueo de NFTs educativos.
- Wallet con balance Eight-Coins, USD simulado e historial.
- Blockchain Explorer conceptual sin registrar información sensible.
- Tienda Wolves con carrito, stock y canjes.
- Comunidad Wolves con muro de aliento, likes, ranking, XP y logros.
- Panel DECE con alertas, semáforo emocional, mapa de bienestar, citas, fichas y estadísticas.
- Panel Administrador con usuarios, inventario, productos, NFTs, auditoría y configuración.
- Consola demo inferior fija para cambiar de rol sin recargar la página.

## Correos demo

Todos usan la contraseña:

```text
wolves123
```

```text
estudiante@colegio.edu.ec
dece@wolves.com
admin@wolves.com
```

## Cómo ejecutar localmente

Abre `index.html` directamente en el navegador. No requiere instalación ni servidor.

## Cómo publicar en Netlify

1. Entra a Netlify.
2. Selecciona "Add new site".
3. Conecta el repositorio de GitHub.
4. Usa como carpeta de publicación:

```text
wolves-mvp
```

5. No configures comando de build, porque es una web estática.

## Equipo y roles

- Maite Bravo: Líder del proyecto.
- Hazel Yánez: Marketing.
- David Palacios: Diseño y programación.
- Anita Parreño: Mentora.

## Nota de arquitectura

Esta versión usa localStorage como base de datos demo. En una versión productiva, los módulos de autenticación, usuarios, Mood Check, alertas, citas, seguimiento, tienda y auditoría deben migrarse a un backend real con reglas de seguridad, cifrado, control de permisos y cumplimiento de protección de datos.
