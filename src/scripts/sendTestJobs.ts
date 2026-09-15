import { labProcessingQueue } from "../services/bullMQ/queue";

/**
 * Script de prueba: envía una tanda de 20 jobs a la cola 'lab-processing'.
 * Incluye jobs válidos y jobs con datos inválidos (labType no permitido)
 * para representar el escenario de "bad data" del enunciado.
 */
async function seed() {
  console.log("[SEED] Enviando 20 trabajos de prueba a la cola...");

  const jobs = [
    // Lote de jobs válidos
    { patientId: "p-101", labType: "BLOOD_TEST", result: "NORMAL", receivedAt: new Date().toISOString() },
    { patientId: "p-102", labType: "URINE_TEST", result: "PATHOLOGY", receivedAt: new Date().toISOString() },
    { patientId: "p-103", labType: "X_RAY", result: "CLEAR", receivedAt: new Date().toISOString() },
    { patientId: "p-104", labType: "BLOOD_TEST", result: "POSITIVE", receivedAt: new Date().toISOString() },
    { patientId: "p-105", labType: "MRI", result: "NORMAL", receivedAt: new Date().toISOString() },
    { patientId: "p-106", labType: "BLOOD_TEST", result: "NEGATIVE", receivedAt: new Date().toISOString() },
    { patientId: "p-107", labType: "PCR_TEST", result: "POSITIVE", receivedAt: new Date().toISOString() },
    { patientId: "p-108", labType: "CT_SCAN", result: "CLEAR", receivedAt: new Date().toISOString() },
    { patientId: "p-109", labType: "URINE_TEST", result: "NORMAL", receivedAt: new Date().toISOString() },
    { patientId: "p-110", labType: "BLOOD_TEST", result: "PATHOLOGY", receivedAt: new Date().toISOString() },
    { patientId: "p-111", labType: "X_RAY", result: "FRACTURE", receivedAt: new Date().toISOString() },
    { patientId: "p-112", labType: "MRI", result: "ABNORMAL", receivedAt: new Date().toISOString() },
    { patientId: "p-113", labType: "PCR_TEST", result: "NEGATIVE", receivedAt: new Date().toISOString() },
    { patientId: "p-114", labType: "CT_SCAN", result: "PATHOLOGY", receivedAt: new Date().toISOString() },
    { patientId: "p-115", labType: "BLOOD_TEST", result: "NORMAL", receivedAt: new Date().toISOString() },
    { patientId: "p-116", labType: "URINE_TEST", result: "POSITIVE", receivedAt: new Date().toISOString() },
    { patientId: "p-117", labType: "X_RAY", result: "CLEAR", receivedAt: new Date().toISOString() },
    { patientId: "p-118", labType: "BLOOD_TEST", result: "ABNORMAL", receivedAt: new Date().toISOString() },
    // Jobs con datos inválidos (labType no permitido): simulan bad data.
    // Ojo: el worker falla por simulación aleatoria (50%), no valida labType.
    { patientId: "p-201", labType: "INVALID_TYPE", result: "ERROR", receivedAt: new Date().toISOString() },
    { patientId: "p-202", labType: "UNKNOWN", result: "ERROR", receivedAt: new Date().toISOString() },
  ];

  for (const job of jobs) {
    const addedJob = await labProcessingQueue.add("process-lab-result", job);
    console.log(
      `[SEED] Job ${addedJob.id} encolado | paciente: ${job.patientId} | labType: ${job.labType}`,
    );
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error("[SEED] Error enviando jobs:", err);
  process.exit(1);
});