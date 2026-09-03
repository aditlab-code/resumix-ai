export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export async function fetchJobs() {
  const response = await fetch(`${API_BASE_URL}/jobs`);
  if (!response.ok) {
    throw new Error('Gagal mengambil daftar lowongan');
  }
  return response.json();
}

export async function importLinkedInJob(rawText: string) {
  const response = await fetch(`${API_BASE_URL}/jobs/import-linkedin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw_text: rawText }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(err.error?.message || 'Gagal mengimpor lowongan dari LinkedIn/Glints');
  }
  return response.json();
}

export async function evaluateInstantCV(
  jobId: string,
  filename: string,
  fileBase64: string,
  jobCriteria?: any
) {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/evaluate-instant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename,
      file_base64: fileBase64,
      job_criteria: jobCriteria,
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(err.error?.message || 'Gagal melakukan evaluasi instan CV');
  }
  return response.json();
}
