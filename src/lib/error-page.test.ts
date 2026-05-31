import { describe, it, expect } from "vitest";
import { renderErrorPage } from "./error-page";

describe("error-page helper", () => {
  it("should return a string containing valid HTML layout", () => {
    const html = renderErrorPage();
    
    expect(typeof html).toBe("string");
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("<html");
    expect(html).toContain("</html>");
  });

  it("should contain the specific fallback error messages and title", () => {
    const html = renderErrorPage();
    
    expect(html).toContain("<title>This page didn't load</title>");
    expect(html).toContain("<h1>This page didn't load</h1>");
    expect(html).toContain("Something went wrong on our end. You can try refreshing or head back home.");
  });

  it("should contain standard primary and secondary interactive buttons", () => {
    const html = renderErrorPage();
    
    expect(html).toContain('class="primary" onclick="location.reload()"');
    expect(html).toContain('class="secondary" href="/"');
  });
});
