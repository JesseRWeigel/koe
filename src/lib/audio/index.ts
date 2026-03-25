export {
  speak,
  stop,
  isSupported,
  getPreferredProvider,
  getAvailableVoices,
  LANG_MAP,
} from "./tts";
export type { TTSOptions, TTSProvider } from "./tts";
export {
  startRecording,
  stopRecording,
  getRecorderState,
  resetRecorder,
} from "./recorder";
export type { RecorderState, RecorderStatus } from "./recorder";
