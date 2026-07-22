# CentralHub

Sitio web de **CentralHub** — consultora de IA agéntica con base en Santiago de Chile.
Diseñamos agentes comerciales que operan dentro de WhatsApp para pymes: contactan clientes, consultan stock, informan
del negocio, cierran ventas y recuperan clientes perdidos.

🔗 **https://onfuego.github.io/centralhub/**

## Stack

Estático puro: HTML, CSS y JavaScript vanilla. Sin build, sin framework, sin dependencias.

```
index.html          landing completa, una sola página
assets/styles.css   sistema visual (tokens en :root)
assets/main.js      interacciones (IIFE, sin imports)
```

## Desarrollo local

```bash
python3 -m http.server 8000
open http://localhost:8000
```

## Despliegue

GitHub Pages sirve la rama `main` desde la raíz. Cada push a `main` publica.

---

La documentación interna de negocio, marca y producto (`docs/`, `CLAUDE.md`) se mantiene
fuera de este repositorio a propósito — ver `.gitignore`.
