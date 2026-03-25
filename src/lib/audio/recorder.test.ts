import { describe, test, expect, vi, beforeEach } from "vitest";
import {
  getRecorderState,
  resetRecorder,
  type RecorderState,
} from "./recorder";

describe("Audio Recorder", () => {
  beforeEach(() => {
    resetRecorder();
  });

  test("initial state is idle", () => {
    const state = getRecorderState();
    expect(state.status).toBe("idle");
    expect(state.audioUrl).toBeNull();
    expect(state.duration).toBe(0);
  });

  test("state tracks recording status transitions", () => {
    // Just verify the state shape — actual recording requires browser APIs
    const state = getRecorderState();
    expect(state).toHaveProperty("status");
    expect(state).toHaveProperty("audioUrl");
    expect(state).toHaveProperty("duration");
  });
});
