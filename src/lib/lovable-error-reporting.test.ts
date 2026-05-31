import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { reportLovableError } from "./lovable-error-reporting";

describe("lovable-error-reporting helper", () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    // Clean up window mock before each test
    vi.stubGlobal("window", undefined);
  });

  afterEach(() => {
    // Restore original window
    if (originalWindow !== undefined) {
      vi.stubGlobal("window", originalWindow);
    } else {
      vi.unstubAllGlobals();
    }
  });

  it("should return early and do nothing if window is undefined (SSR environment)", () => {
    const mockCapture = vi.fn();
    
    // Call the function in SSR-like environment (window is undefined)
    expect(() => reportLovableError(new Error("SSR Error"))).not.toThrow();
    expect(mockCapture).not.toHaveBeenCalled();
  });

  it("should invoke captureException on window.__lovableEvents when window is defined", () => {
    const mockCapture = vi.fn();
    
    // Mock the window object with appropriate nested handlers
    const mockWindow = {
      location: {
        pathname: "/admin/dashboard",
      },
      __lovableEvents: {
        captureException: mockCapture,
      },
    };
    
    vi.stubGlobal("window", mockWindow);

    const testError = new Error("Telemetry Test Error");
    const testContext = { userId: "user-123", extraInfo: "debug" };
    
    reportLovableError(testError, testContext);

    expect(mockCapture).toHaveBeenCalledTimes(1);
    expect(mockCapture).toHaveBeenCalledWith(
      testError,
      {
        source: "react_error_boundary",
        route: "/admin/dashboard",
        userId: "user-123",
        extraInfo: "debug",
      },
      {
        mechanism: "react_error_boundary",
        handled: false,
        severity: "error",
      },
    );
  });
});
