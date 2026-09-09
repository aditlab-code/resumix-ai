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

export async function createJobApi(jobData: {
  title: string;
  description?: string;
  minimum_experience_months?: number;
  mandatory_skills: string[];
  preferred_skills?: string[];
}) {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: jobData.title,
      description: jobData.description || `Position for ${jobData.title}`,
      minimum_experience_months: jobData.minimum_experience_months || 0,
      mandatory_skills: jobData.mandatory_skills,
      preferred_skills: jobData.preferred_skills || [],
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(err.error?.message || 'Gagal membuat lowongan kerja baru');
  }
  return response.json();
}

export async function deleteJobApi(jobId: string) {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(err.error?.message || 'Gagal menghapus lowongan kerja');
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
