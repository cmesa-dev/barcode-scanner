<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,100:203a43&height=200&section=header&text=Barcode%20Scanner&fontSize=55&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Smart+inventory+%26+barcode+management+system&descAlignY=56&descAlign=50" width="100%"/>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Estado-Completado-success?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/Web_App-✓-blue?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Licencia-Privada-red?style=for-the-badge"/>
</div>

---

## 📦 ¿Qué es Barcode Scanner?

Sistema web de **escaneo y gestión de códigos de barras** diseñado para entornos empresariales. Permite gestionar inventario, registrar entradas/salidas de productos y generar reportes en tiempo real, todo desde el navegador — sin instalación.

---

## ✨ Funcionalidades

| Feature | Descripción |
|---|---|
| 📸 **Escaneo en vivo** | Usa la cámara del dispositivo para leer códigos QR y EAN |
| 🗄️ **Base de datos** | Registro de productos con nombre, precio, stock y categoría |
| 📊 **Dashboard** | Panel con métricas de inventario en tiempo real |
| 📥 **Entradas/Salidas** | Registro de movimientos con historial completo |
| 📄 **Exportación** | Generación de reportes en CSV y PDF |
| 🔔 **Alertas** | Notificaciones automáticas de stock mínimo |
| 📱 **Responsive** | Funciona en móvil, tablet y escritorio |

---

## 🏗️ Arquitectura del Sistema

```
┌──────────────────────────────────────────────────────┐
│                   CLIENTE (Browser)                   │
│                                                      │
│  ┌─────────────┐   ┌─────────────┐  ┌────────────┐  │
│  │   Scanner   │   │  Dashboard  │  │  Reportes  │  │
│  │  (Cámara)   │   │   Panel     │  │  & Export  │  │
│  └──────┬──────┘   └──────┬──────┘  └─────┬──────┘  │
│         └────────────┬────┘               │         │
│                      ▼                    │         │
│              ┌──────────────┐             │         │
│              │   API Layer  │◀────────────┘         │
│              └──────┬───────┘                       │
└─────────────────────┼────────────────────────────────┘
                      │ REST API
┌─────────────────────▼────────────────────────────────┐
│                    SERVIDOR                           │
│                                                      │
│  ┌─────────────┐   ┌─────────────┐  ┌────────────┐  │
│  │  Productos  │   │  Movimientos│  │  Usuarios  │  │
│  │  Service    │   │  Service    │  │  Auth      │  │
│  └─────────────┘   └─────────────┘  └────────────┘  │
│                         │                            │
│              ┌──────────▼──────────┐                 │
│              │      Base de Datos  │                 │
│              └─────────────────────┘                 │
└──────────────────────────────────────────────────────┘
```

---

## 🚀 Demo Interactiva

> ⚠️ El archivo `demo/index.html` contiene una demo funcional con datos de ejemplo.
> El código de producción y la lógica empresarial son privados.

```bash
# Clonar y abrir la demo
git clone https://github.com/cmesa-dev/barcode-scanner
cd barcode-scanner/demo
open index.html   # macOS
xdg-open index.html  # Linux
```

**La demo incluye:**
- ✅ Escáner simulado con productos de ejemplo
- ✅ Dashboard con métricas ficticias
- ✅ Interfaz completa (sin backend real)

---

## 🛠️ Stack Tecnológico

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)

---

## 📬 Contacto

[![Email](https://img.shields.io/badge/kmevi32@gmail.com-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:kmevi32@gmail.com)
[![LinkedIn](https://img.shields.io/badge/Carlos_Mesa_Viera-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/carlosmesaviera)

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:203a43,100:0f2027&height=100&section=footer" width="100%"/>
</div>
