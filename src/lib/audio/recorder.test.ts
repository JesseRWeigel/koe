import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { getRecorderState, resetRecorder, startRecording, stopRecording } from "./recorder";

class FakeRecorder {
  static last: FakeRecorder;
  state = "inactive";
  mimeType = "audio/ogg";
  ondataavailable?: (e: {data: Blob}) => void;
  onstop?: () => void;
  onerror?: () => void;
  start = () => { this.state = "recording"; };
  stop = () => { this.state = "inactive"; };
  constructor() { FakeRecorder.last = this; }
  finish() {
    this.ondataavailable?.({ data: new Blob(["clip"]) });
    this.onstop?.();
  }
}

const micStop = vi.fn();
const createUrl = vi.fn(() => "blob:clip");
const revokeUrl = vi.fn();
const stream = { getTracks: () => [{ stop: micStop }] };
const getUserMedia = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  getUserMedia.mockResolvedValue(stream);
  vi.stubGlobal("MediaRecorder", FakeRecorder);
  vi.stubGlobal("URL", { createObjectURL: createUrl, revokeObjectURL: revokeUrl });
  vi.stubGlobal("navigator", { mediaDevices: { getUserMedia } });
});
afterEach(() => { resetRecorder(); vi.unstubAllGlobals(); });

it("initial state is idle with no URL and zero duration", () => {
  expect(getRecorderState()).toEqual({ status: "idle", audioUrl: null, duration: 0 });
});

it("waits for the final recording data and preserves the browser's audio format", async () => {
  await startRecording();
  const result = stopRecording();
  expect(result).toBeInstanceOf(Promise);
  expect(createUrl).not.toHaveBeenCalled();
  FakeRecorder.last.finish();
  expect(await result).toBe("blob:clip");
  expect(createUrl).toHaveBeenCalledWith(expect.objectContaining({ type: "audio/ogg", size: 4 }));
  expect(micStop).toHaveBeenCalledTimes(1);
  expect(getRecorderState()).toMatchObject({ status: "recorded", audioUrl: "blob:clip" });
  resetRecorder();
  expect(revokeUrl).toHaveBeenCalledWith("blob:clip");
});

it("reset releases the microphone and ignores an old recorder finishing", async () => {
  await startRecording();
  const old = FakeRecorder.last;
  const result = stopRecording();
  resetRecorder();
  expect(micStop).toHaveBeenCalledTimes(1);
  await startRecording();
  old.finish();
  expect(getRecorderState().status).toBe("recording");
  expect(createUrl).not.toHaveBeenCalled();
  expect(await result).toBeNull();
});

it("releases a microphone grant that arrives after reset", async () => {
  let resolve!: (value: typeof stream) => void;
  getUserMedia.mockReturnValueOnce(new Promise<typeof stream>(r => { resolve = r; }));
  const start = startRecording();
  resetRecorder();
  resolve(stream);
  expect(await start).toBe(false);
  expect(micStop).toHaveBeenCalledTimes(1);
  expect(getRecorderState().status).toBe("idle");
});
