# Patient Lab Result Processing System

Backend para procesar resultados de laboratorio de pacientes. Recibe los resultados por HTTP y los procesa de forma asíncrona con un worker en segundo plano usando BullMQ. Si un job falla, se reintenta hasta 3 veces y, si sigue fallando, se envía a una cola de dead-letter.

## Stack

- TypeScript
- Express 5
- BullMQ
- Valkey (Redis-compatible)

## Estructura

```
src/
├── config/                Configuración (puerto, Redis)
├── controllers/           Lógica de los endpoints
├── middlewares/           Manejo de errores
├── routes/                Definición de rutas
├── scripts/               Script de prueba para enviar jobs
├── services/bullMQ/       Cola, worker, conexión y tipos
└── server.ts              Punto de entrada
```

## Cómo ponerlo en marcha

### Con Docker (recomendado)

```bash
docker compose up --build
```

Levanta la app en `http://localhost:3000` y Valkey en el puerto `6379`.

### En local

Necesitas una instancia de Redis/Valkey corriendo en `localhost:6379`.

```bash
npm install
npm run dev
```

### Scripts disponibles

| Script | Qué hace |
|--------|----------|
| `npm run dev` | Inicia el servidor con recarga automática |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Ejecuta la versión compilada |
| `npm run test:jobs` | Envía 20 jobs de prueba a la cola (18 válidos + 2 con datos inválidos) |

## Endpoints

### POST /lab-results

Envía un resultado de laboratorio para procesarlo de forma asíncrona.

```bash
curl -X POST http://localhost:3000/lab-results \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "12345",
    "labType": "blood",
    "result": "positive",
    "receivedAt": "2025-07-08T10:00:00Z"
  }'
```

Respuesta (202 Accepted):

```json
{
  "message": "Lab result accepted and queued for processing",
  "jobId": "1",
  "patientId": "12345"
}
```

Si falta algún campo, devuelve 400 con un mensaje indicando cuáles faltan.

### GET /health

Healthcheck del servicio: comprueba que el servidor responde y que la conexión con Valkey (Redis) está viva.

```bash
curl http://localhost:3000/health
```

Respuesta (200):

```json
{
  "status": "ok",
  "uptimeSeconds": 125,
  "timestamp": "2025-07-08T10:00:00Z"
}
```

Si Redis no responde, devuelve 503 con `status: "unhealthy"`. Docker Compose usa este endpoint para marcar el contenedor como healthy.

### GET /status

Muestra las métricas de la cola: jobs en espera, activos, completados, fallidos y en dead-letter.

```bash
curl http://localhost:3000/status
```

Respuesta (200):

```json
{
  "status": "HEALTHY",
  "timestamp": "2025-07-08T10:00:00Z",
  "queueMetrics": {
    "waitingJobs": 0,
    "activeJobs": 1,
    "completedJobs": 15,
    "failedInMainQueue": 0,
    "deadLetteredJobs": 2
  }
}
```

## Cómo funciona el flujo

1. `POST /lab-results` valida el payload y encola un job `process-lab-result` en la cola `lab-processing`.
2. El worker toma el job y lo procesa con un delay simulado de 500ms.
3. A propósito, el 50% de los jobs lanzan un error transitorio para probar la lógica de reintentos.
4. BullMQ reintenta los jobs fallidos hasta 3 veces (configurado con `attempts: 3`).
5. Si se agotan los intentos, el job pasa a la cola `dead-letter-queue` con contexto completo: payload original, motivo del error, stack trace y número de intentos.

## Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | `3000` | Puerto del servidor |
| `REDIS_HOST` | `localhost` | Host de Redis/Valkey |
| `REDIS_PORT` | `6379` | Puerto de Redis/Valkey |

## Qué mejoraría en producción

- **Persistencia**: guardar los datos de los jobs en una base de datos (MongoDB o PostgreSQL) para no depender de la memoria.
- **Logging estructurado**: sustituir los `console.log` por algo tipo Pino, con JSON y niveles de log.
- **Shutdown ordenado**: manejar SIGTERM/SIGINT para drenar la cola antes de que el proceso termine.
- **Rate limiting**: evitar que la API sature la cola de jobs.
- **Monitorización**: exportar métricas de BullMQ a Prometheus/Grafana u otro servicio de observability.
- **Recuperación de DLQ**: un endpoint o CLI para re-procesar jobs de la cola de dead-letter cuando se corrija la causa raíz.
- **Validación más fina**: validar `labType` contra un enum permitido y `receivedAt` como fecha ISO válida.