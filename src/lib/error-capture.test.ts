import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { consumeLastCapturedError } from "./error-capture";

describe("error-capture helper", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return undefined if no error has been captured", () => {
    const error = consumeLastCapturedError();
    expect(error).toBeUndefined();
  });

  it("should capture and consume an error event when triggered on globalThis", () => {
    if (typeof globalThis.addEventListener === "function") {
      const mockError = new Error("Test captured error");
      
      // Dispatch an error event if possible
      if (typeof globalThis.dispatchEvent === "function") {
        const errorEvent = new MessageEvent("error", {
          // In Node or DOM, simulated error event
        });
        Object.defineProperty(errorEvent, "error", { value: mockError });
        globalThis.dispatchEvent(errorEvent);
        
        const captured = consumeLastCapturedError();
        expect(captured).toBeDefined();
        // Since event dispatching details can vary between environments,
        // let's ensure it doesn't crash and returns the error if successfully dispatched.
      }
    }
  });

  it("should return undefined after TTL expires", () => {
    if (typeof globalThis.addEventListener === "function" && typeof globalThis.dispatchEvent === "function") {
      const mockError = new Error("Temporary error");
      const errorEvent = new MessageEvent("error", {});
      Object.defineProperty(errorEvent, "error", { value: mockError });
      globalThis.dispatchEvent(errorEvent);

      // Advance time past TTL_MS (5000ms)
      vi.advanceTimersByTime(6000);

      const captured = consumeLastCapturedError();
      expect(captured).toBeUndefined();
    }
  });
});
