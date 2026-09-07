const rawUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
export const API_BASE_URL = rawUrl
  ? (rawUrl.endsWith('/api/v1') ? rawUrl : `${rawUrl}/api/v1`)
  : '';

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

export async function updateApplicationStatus(applicationId: string, status: string) {
  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(err.error?.message || 'Gagal mengubah status kandidat');
  }
  return response.json();
}

export async function checkProcessingJobStatus(processingJobId: string) {
  const response = await fetch(`${API_BASE_URL}/processing-jobs/${processingJobId}`);
  if (!response.ok) {
    throw new Error('Gagal mengambil status pemrosesan pekerjaan');
  }
  return response.json();
}
