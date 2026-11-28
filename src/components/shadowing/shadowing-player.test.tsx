import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ShadowingPlayer } from "./shadowing-player";

const recorder = vi.hoisted(() => ({
  startRecording: vi.fn(async () => true),
  stopRecording: vi.fn<() => Promise<string | null>>(),
  resetRecorder: vi.fn(),
}));

vi.mock("@/lib/audio/recorder", () => recorder);
vi.mock("@/lib/audio/tts", () => ({
  speak: vi.fn(async () => {}),
  stop: vi.fn(),
  ensureVoicesReady: vi.fn(async () => {}),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const sentence = (key: string) => (
  <ShadowingPlayer key={key} language="ja" sentence={key} meaning="Good morning" />
);

async function stopWithDeferredClip() {
  let resolve!: (url: string) => void;
  recorder.stopRecording.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
  fireEvent.click(screen.getByRole("button", { name: "2. Record Yourself" }));
  fireEvent.click(await screen.findByRole("button", { name: "Stop Recording" }));
  expect(screen.getByRole("button", { name: /finishing recording/i })).toBeDisabled();
  expect(screen.queryByRole("button", { name: "Your Recording" })).not.toBeInTheDocument();
  return resolve;
}

it("shows the comparison only after the browser delivers the recording", async () => {
  render(sentence("おはよう"));
  const finish = await stopWithDeferredClip();
  await act(async () => { finish("blob:recording"); });
  expect(screen.getByRole("button", { name: "Your Recording" })).toBeEnabled();
});

it("discards an in-flight clip when the Japanese sentence changes", async () => {
  const { rerender } = render(sentence("おはよう"));
  const finish = await stopWithDeferredClip();
  recorder.resetRecorder.mockClear();
  rerender(sentence("こんにちは"));
  expect(recorder.resetRecorder).toHaveBeenCalledTimes(1);
  await act(async () => { finish("blob:old-clip"); });
  expect(screen.getByText("こんにちは")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Your Recording" })).not.toBeInTheDocument();
});
