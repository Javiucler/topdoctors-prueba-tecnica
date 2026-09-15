import { labProcessingQueue } from "../services/bullMQ/queue";


async function seed() {
  console.log('🚀 Enviando trabajos de prueba a la cola...');

  const jobs = [
    { patientId: 'p-101', labType: 'BLOOD_TEST', result: 'NORMAL', receivedAt: new Date().toISOString() },
    { patientId: 'p-102', labType: 'URINE_TEST', result: 'PATHOLOGY', receivedAt: new Date().toISOString() },
    { patientId: 'p-103', labType: 'X_RAY', result: 'CLEAR', receivedAt: new Date().toISOString() },
    { patientId: 'p-999', labType: 'INVALID_TYPE', result: 'ERROR', receivedAt: new Date().toISOString() },
  ];

  for (const job of jobs) {
    const addedJob = await labProcessingQueue.add('lab-processing', job)
    console.log(`✅ Job añadido con ID: ${addedJob.id} para paciente ${job.patientId}`);
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error enviando jobs:', err);
  process.exit(1);
});