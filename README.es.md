<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:071a1e,100:11675f&height=190&section=header&text=ScanOps&fontSize=62&fontColor=ffffff&animation=fadeIn&fontAlignY=39&desc=Terminal%20de%20Inventario%20%C2%B7%20Demo%20de%20Ingeniería%20Pública&descAlignY=57" width="100%"/>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/React-TypeScript-087EA4?style=for-the-badge&logo=react&logoColor=white"/>
  <img src="https://img.shields.io/badge/API-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Datos-SQLite-0F80CC?style=for-the-badge&logo=sqlite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Proyecto%20Original-Privado-334155?style=for-the-badge"/>
  <br/>
  <a href="README.md">🇬🇧 English</a>
</div>

## El Problema

Los operadores de retail necesitan registrar movimientos de inventario de alta frecuencia con muy poca fricción: escanear un producto, identificar si el stock entra o sale, y ver el estado resultante de forma inmediata.

**ScanOps** es una demo pública del producto, derivada de ese problema operacional real. Contiene únicamente datos sintéticos y no expone código fuente ni datos del proyecto privado original.

![Vista previa del terminal de inventario ScanOps](docs/scanops-preview.png)

## Un Adelanto de lo que Puede Llegar a Ser

La demo pública es intencionadamente pequeña: un terminal, un catálogo y un movimiento de stock auditable. La oportunidad de producto detrás es mucho mayor: un sistema operacional simple donde una empresa pequeña o mediana pueda gestionar productos, ubicaciones, señales de compra y decisiones del día a día desde un flujo de trabajo consistente.

No un ERP pesado que requiere un especialista para operar. Un producto que puede empezar escaneando un código de barras y crecer con el negocio.

| Contexto de negocio | Un primer flujo de trabajo realista | Hacia dónde puede crecer el sistema |
|---|---|---|
| Tienda de barrio o minimarket | Recibir mercancía envasada, registrar ventas y ver el stock bajo de inmediato | Pedidos a proveedores, enriquecimiento de producto alimentario, alertas de caducidad y seguimiento de márgenes |
| Ferretería o tienda de materiales | Controlar cientos o miles de referencias en estanterías y almacén | Transferencias entre ubicaciones, sugerencias de compra, stock sin movimiento y permisos por equipo |
| Tienda de moda o accesorios | Contar unidades y registrar ventas o reposiciones por variante de producto | Catálogo multi-tienda, sincronización con canal online y análisis de temporadas |
| Café, panadería o tienda de alimentación especializada | Mantener visibles los productos envasados y los consumibles a la venta | Previsión de consumo, compras recurrentes e información de alérgenos/nutrición donde esté disponible |
| Pequeño distribuidor o almacén de e-commerce | Mantener la precisión del stock mientras se preparan pedidos | Operaciones multi-terminal, flujos de picking, devoluciones e integraciones de entrega |

## Dirección del Producto

```text
Entrada por código de barras / cámara / terminal
           |
           v
Catálogo unificado de productos ---- Enriquecimiento de datos externos
           |                         (opt-in, con fuente declarada)
           v
Libro mayor de eventos de inventario ------- Informes y alertas
           |
           v
Asistentes operacionales
(reposición, calidad del catálogo, revisiones de seguridad, briefing diario)
```

Un producto futuro construido sobre esta base podría ofrecer:

- Un catálogo de productos que soporte cualquier número de SKUs propios del negocio y múltiples ubicaciones.
- Eventos de compra, venta, recuento de stock, transferencia y devolución en un único historial auditable.
- Incorporación ligera de dispositivos para mostradores, almacenes o personal móvil.
- Alertas de riesgo de stock, calidad de datos, patrones de movimiento inesperados y productos que requieren revisión.
- Una capa de asistente unificada que explique qué ha ocurrido y proponga acciones, manteniendo la aprobación final en el operador.

## Datos que No Hay que Teclear Dos Veces

Un código de barras puede ser el inicio de un registro más rico. Estos son ejemplos de **posibles integraciones**, no funcionalidades reclamadas por esta demo:

| Fuente | Oportunidad de producto útil | Restricción de diseño a tener en cuenta |
|---|---|---|
| [Open Food Facts API](https://openfoodfacts.github.io/openfoodfacts-server/api/) | Enriquecer productos alimentarios con etiqueta pública, ingredientes e información nutricional cuando exista un código de barras coincidente | Los datos comunitarios/abiertos deben atribuirse, cachearse de forma responsable y revisarse para verificar su completitud |
| [Verified by GS1](https://www.gs1.org/services/verified-by-gs1) | Validar la identidad GTIN e información básica de marca/producto | El acceso público es limitado; el uso avanzado de la API depende de acuerdos de acceso con GS1 |
| [EU Safety Gate](https://ec.europa.eu/safety-gate/) | Ayudar a los minoristas no alimentarios a monitorizar alertas públicas de seguridad de productos relevantes para su catálogo | Asociar una alerta al stock interno requiere revisión controlada, no automatización ciega |

El principio es simple: solicitar información pública o con licencia útil cuando ahorra trabajo manual, conservar su fuente y nunca tratar datos de terceros como verdad operacional autoritaria de forma silenciosa.

## Agentes con un Trabajo Real que Hacer

Este sistema es un lugar natural para agentes con restricciones porque el trabajo de inventario contiene decisiones repetitivas respaldadas por eventos observables. Ejemplos de módulos futuros:

| Asistente | Input que utilizaría | Acción que podría preparar |
|---|---|---|
| **Asistente de incorporación de catálogo** | Nuevo código de barras y fuentes de datos de producto permitidas | Rellenar un borrador de ficha de producto para aprobación humana |
| **Asistente de reposición** | Historial de stock, niveles de reorden y entregas pendientes | Sugerir una lista de compras antes de que las estanterías se vacíen |
| **Asistente de revisión de seguridad** | Catálogo más alertas públicas de seguridad | Marcar productos potencialmente relevantes para que el operador los verifique |
| **Briefing de operaciones diarias** | Ventas/reposiciones, artículos con stock bajo y anomalías | Producir un informe conciso de apertura o cierre |

La regla de diseño importante es que un asistente puede recuperar, resumir y proponer; las acciones que modifican el stock permanecen autenticadas y auditables.

## Lo que Construí

- Interfaz de terminal responsiva con React y TypeScript.
- API REST implementada con Node.js.
- Persistencia con SQLite y movimientos de inventario transaccionales.
- Autenticación de demo con roles de operador, manager y auditor de solo lectura.
- Flujos de venta y reposición con validación y rechazo explícito de ventas imposibles.
- Entrada por escáner de teclado y captura de código de barras por cámara del navegador donde esté disponible.
- Historial de actividad reciente e indicadores de estado de stock bajo.
- Tests automatizados de dominio, API e interfaz, umbrales de calidad con Lighthouse, flujo CI, imagen Docker y vista previa alojada desplegable.

## Arquitectura

```text
UI React + TypeScript  ->  JSON REST API (Node.js)  ->  SQLite
```

El navegador lee el dashboard desde la API y envía eventos operacionales. Cada escaneo aceptado actualiza el stock y registra su estado resultante en una única transacción.

Lee las decisiones de diseño en [docs/architecture.md](docs/architecture.md).

## Vista Previa Alojada

La vista previa interactiva alojada está publicada en:

[`https://cmesa-dev.github.io/barcode-scanner/`](https://cmesa-dev.github.io/barcode-scanner/)

GitHub Pages ejecuta el mismo frontend con datos sintéticos en el navegador. La implementación de Node.js y SQLite se ejecuta localmente o a través del contenedor Docker, ya que el hosting estático no puede operar el servicio de API.

## Ejecutar en Local

Requiere Node.js 22.5 o superior porque la API usa el módulo SQLite integrado.

```bash
npm install
npm run api
```

En un segundo terminal:

```bash
npm run dev
```

Abre `http://localhost:5173`.

Cuentas de demo:

```text
operator@scanops.demo / demo-operator
manager@scanops.demo  / demo-manager
auditor@scanops.demo  / demo-auditor   (solo lectura)
```

### Ejecución estilo producción

```bash
npm run build
npm start
```

Abre `http://localhost:3000`.

### Contenedor

```bash
docker build -t scanops-demo .
docker run --rm -p 3000:3000 scanops-demo
```

## Verificación

```bash
npm run check
```

La suite de tests cubre métricas sembradas, comportamiento de decremento/incremento de stock, control de acceso, rechazo de ventas imposibles, respuestas de la API HTTP y el flujo de login/operación del frontend. La build realiza validación TypeScript antes de generar los assets del frontend. El flujo CI ejecuta Lighthouse contra la build estática con umbrales aplicables de accesibilidad y buenas prácticas.

## Límite de Alcance

| Implementación pública que puedes ejecutar hoy | Dirección del producto intencionalmente anticipada, no declarada como enviada |
|---|---|
| UI operacional, catálogo sintético, API REST y almacenamiento de eventos SQLite | Escala ilimitada de catálogo, multi-ubicación y compras a proveedor |
| Sesiones de demo, aplicación de roles, ventas/reposiciones y lista de auditoría | Identidad de producción, tenencia y aprovisionamiento de dispositivos |
| Entrada de código de barras por teclado/cámara | Enriquecimiento externo desde Open Food Facts, GS1 o fuentes de alertas de seguridad |
| Tests automatizados, Lighthouse, Docker y CI | Agentes con restricciones, recomendaciones, análisis y monitorización en producción |

## Próxima Iteración en Producción

Para un sistema multi-terminal desplegado, primero añadiría identidades de dispositivo autenticadas, ingestión de eventos idempotente, permisos por tenant, sincronización offline, migraciones, monitorización y procedimientos de backup/restauración. Una vez que el libro mayor operacional sea fiable, el enriquecimiento de datos y los asistentes basados en aprobación se convierten en capas de producto útiles en lugar de promesas sin soporte.
