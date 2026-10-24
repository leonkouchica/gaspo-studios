import { describe, it, expect, vi, beforeEach } from "vitest";
import { H3Event } from "h3";
import { handleOgRequest } from "../../server/api/og";

const mockResize = vi.fn();
const mockJpeg = vi.fn();
const mockToBuffer = vi.fn();

vi.mock("sharp", () => ({
  default: vi.fn(() => ({
    resize: mockResize.mockReturnValue({
      jpeg: mockJpeg.mockReturnValue({
        toBuffer: mockToBuffer,
      }),
    }),
  })),
}));

describe("server/api/og endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw 400 if url query parameter is missing", async () => {
    const event = new H3Event(new Request("http://localhost/api/og"));

    await expect(handleOgRequest(event)).rejects.toThrow(
      "Missing required 'url' query parameter",
    );
  });

  it("should throw 400 if url query parameter is invalid format", async () => {
    const event = new H3Event(new Request("http://localhost/api/og?url=://invalid-url"));

    await expect(handleOgRequest(event)).rejects.toThrow("Invalid URL format");
  });

  it("should throw 403 if protocol is not http or https", async () => {
    const event = new H3Event(new Request("http://localhost/api/og?url=file:///etc/passwd"));

    await expect(handleOgRequest(event)).rejects.toThrow("Protocol not allowed");
  });

  it("should throw 403 if host is not in allowed hostnames (SSRF prevention)", async () => {
    const event = new H3Event(
      new Request("http://localhost/api/og?url=https://malicious-site.com/evil.jpg"),
    );

    await expect(handleOgRequest(event)).rejects.toThrow("Host not allowed");
  });

  it("should successfully convert allowed image to 1200x630 JPEG with headers", async () => {
    const fakeImageBuffer = Buffer.from("fake-image-data");
    const fakeJpegBuffer = Buffer.from("converted-jpeg-data");

    // Mock fetch
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(fakeImageBuffer.buffer),
    });
    vi.stubGlobal("fetch", mockFetch);

    mockToBuffer.mockResolvedValue(fakeJpegBuffer);

    const event = new H3Event(
      new Request(
        "http://localhost/api/og?url=https://fhhxbjwcgfslvbznrvab.supabase.co/storage/v1/object/public/gaspo-media/blog/photo.webp",
      ),
    );

    const result = await handleOgRequest(event);

    expect(mockFetch).toHaveBeenCalled();
    expect(mockResize).toHaveBeenCalledWith(1200, 630, {
      fit: "cover",
      position: "center",
    });
    expect(mockJpeg).toHaveBeenCalledWith({
      quality: 85,
      progressive: true,
    });
    expect(result).toEqual(fakeJpegBuffer);
  });
});
