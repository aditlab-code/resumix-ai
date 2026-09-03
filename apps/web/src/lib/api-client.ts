export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export async function fetchJobs() {
  const response = await fetch(`${API_BASE_URL}/jobs`);
  if (!response.ok) {
    throw new Error('Gagal mengambil daftar lowongan');
  }
  return response.json();
}

export async function createJobPosting(jobData: {
  title: string;
  description: string;
  minimum_experience_months?: number;
  mandatory_skills: string[];
  preferred_skills?: string[];
}) {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(err.error?.message || 'Gagal membuat lowongan kerja baru');
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

export async function uploadCVApplication(
  jobId: string,
  filename: string,
  fileBase64: string,
  jobCriteria?: any
) {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/applications`, {
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
    throw new Error(err.error?.message || 'Gagal mengunggah CV ke antrean');
  }
  return response.json();
}

export async function fetchJobApplications(jobId: string) {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/applications`);
  if (!response.ok) {
    throw new Error('Gagal mengambil daftar pelamar');
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

export async function fetchCandidateMatches(jobId: string, threshold: number = 0.5, limit: number = 20) {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/candidates/match?threshold=${threshold}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Gagal mengambil kandidat teratas berdasarkan vector match');
  }
  return response.json();
}

