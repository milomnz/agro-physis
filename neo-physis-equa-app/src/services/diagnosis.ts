import { apiClient, getAuthHeaders } from "./api";
import type { DiagnosisAnswers, PestMatch } from "../utils/symptom-diagnosis";

export interface AnalyzeDiagnosisPayload {
  cropId: string;
  answers: DiagnosisAnswers;
  imageBase64?: string;
  mimeType?: string;
}

export interface AnalyzeDiagnosisResponse {
  imageUrl: string | null;
  source: "gemini" | "catalog";
  matches: PestMatch[];
}

export async function analyzeCropDiagnosis(
  payload: AnalyzeDiagnosisPayload,
): Promise<AnalyzeDiagnosisResponse> {
  const headers = await getAuthHeaders();
  return apiClient<AnalyzeDiagnosisResponse>("/api/diagnosis", {
    method: "POST",
    headers,
    body: payload,
    timeoutMs: 45000,
  });
}
