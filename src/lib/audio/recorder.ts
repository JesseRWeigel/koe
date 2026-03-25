export type RecorderStatus = "idle" | "recording" | "recorded";

export interface RecorderState {
  status: RecorderStatus;
  audioUrl: string | null;
  duration: number; // seconds
}

let state: RecorderState = {
  status: "idle",
  audioUrl: null,
  duration: 0,
};

let mediaRecorder: MediaRecorder | null = null;
let chunks: Blob[] = [];
let startTime = 0;

export function getRecorderState(): RecorderState {
  return { ...state };
}

export function resetRecorder(): void {
  if (state.audioUrl) {
    URL.revokeObjectURL(state.audioUrl);
  }
  state = { status: "idle", audioUrl: null, duration: 0 };
  mediaRecorder = null;
  chunks = [];
  startTime = 0;
}

export async function startRecording(): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices) {
    throw new Error("Recording not supported in this environment");
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  chunks = [];
  startTime = Date.now();

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);
    state = {
      status: "recorded",
      audioUrl: url,
      duration: Math.round((Date.now() - startTime) / 1000),
    };
    // Stop all tracks to release the mic
    stream.getTracks().forEach((t) => t.stop());
  };

  mediaRecorder.start();
  state = { ...state, status: "recording" };
}

export function stopRecording(): void {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
}
