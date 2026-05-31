import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("utils cn helper", () => {
  it("should merge classes and return a single class string", () => {
    const result = cn("class1", "class2");
    expect(result).toBe("class1 class2");
  });

  it("should handle conditional/falsy class names correctly", () => {
    const active = true;
    const disabled = false;
    const result = cn(
      "base-class",
      active && "active-class",
      disabled && "disabled-class",
      undefined,
      null,
    );
    expect(result).toBe("base-class active-class");
  });

  it("should resolve tailwind utility conflicts using tailwind-merge", () => {
    const result = cn("p-4 p-6");
    expect(result).toBe("p-6");
  });

  it("should merge conflicts on conditional Tailwind styles", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });
});
