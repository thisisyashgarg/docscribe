/**
 * API utility for communicating with the Doctor Backend.
 */

const BASE_URL = "https://docscribe-backend.vercel.app";

export interface SummaryResponse {
  success: boolean;
  data: {
    actualTranscript: string;
    summary: {
      symptoms: string;
      diagnosis: string;
      prescription: string;
    };
    formattedSummary: string;
  };
}

export interface WhatsAppResponse {
  success: boolean;
  data: {
    message: string;
  };
}

/**
 * Uploads an audio blob to the backend for transcription and summarization.
 */
export async function processConsultation(audioBlob: Blob): Promise<SummaryResponse> {
  const formData = new FormData();
  formData.append("audioBlob", audioBlob, "recording.webm");

  const response = await fetch(`${BASE_URL}/api/consultation/process`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  return response.json();
}

/**
 * Sends a medical summary to a phone number via WhatsApp.
 */
export async function sendWhatsAppSummary(
  phoneNumber: string,
  summary: string
): Promise<WhatsAppResponse> {
  const response = await fetch(`${BASE_URL}/api/consultation/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phoneNumber,
      summary,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  return response.json();
}
