export type RecorderStatus = "idle" | "recording" | "recorded";

export interface RecorderState {
  status: RecorderStatus;
  audioUrl: string | null;
  duration: number; // seconds
}

function idleState(): RecorderState {
  return { status: "idle", audioUrl: null, duration: 0 };
}

interface Session {
  recorder: MediaRecorder;
  finished: Promise<string | null>;
  cancel: () => void;
}

let state = idleState();
let session: Session | null = null;
let generation = 0;

export function getRecorderState(): RecorderState {
  return { ...state };
}

export function resetRecorder(): void {
  generation++;
  const previous = session;
  session = null;
  previous?.cancel();
  if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
  state = idleState();
}

export async function startRecording(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices) {
    throw new Error("Recording not supported in this environment");
  }

  resetRecorder();
  const request = generation;
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (error) {
    if (request !== generation) return false;
    throw error;
  }
  const releaseTracks = () => stream.getTracks().forEach((track) => track.stop());
  if (request !== generation) {
    releaseTracks();
    return false;
  }

  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(stream);
  } catch (error) {
    releaseTracks();
    throw error;
  }
  let chunks: Blob[] = [];
  const startTime = Date.now();
  let settled = false;
  let resolve!: (url: string | null) => void;
  const finished = new Promise<string | null>((done) => { resolve = done; });
  const finish = (keepRecording: boolean) => {
    if (settled) return;
    settled = true;
    releaseTracks();
    let audioUrl: string | null = null;
    if (keepRecording && request === generation && chunks.length > 0) {
      try {
        const blob = new Blob(chunks, { type: recorder.mimeType || chunks[0].type });
        audioUrl = URL.createObjectURL(blob);
      } catch {
        // A recording without a playable URL cannot be offered for comparison.
      }
    }
    chunks = [];
    if (request === generation) {
      session = null;
      state = audioUrl
        ? { status: "recorded", audioUrl, duration: Math.round((Date.now() - startTime) / 1000) }
        : idleState();
    }
    resolve(audioUrl);
  };
  const cancel = () => {
    finish(false);
    if (recorder.state !== "inactive") {
      try { recorder.stop(); } catch { /* tracks are already stopped */ }
    }
  };

  recorder.ondataavailable = (event) => {
    if (!settled && event.data.size > 0) chunks.push(event.data);
  };
  recorder.onstop = () => finish(true);
  recorder.onerror = cancel;
  session = { recorder, finished, cancel };
  try {
    recorder.start();
  } catch (error) {
    cancel();
    throw error;
  }
  state = { ...state, status: "recording" };
  return true;
}

export function stopRecording(): Promise<string | null> {
  if (!session) return Promise.resolve(state.audioUrl);
  const active = session;
  if (active.recorder.state !== "inactive") {
    try { active.recorder.stop(); } catch { active.cancel(); }
  }
  return active.finished;
}
