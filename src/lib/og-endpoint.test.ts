import { describe, it, expect, vi, beforeEach } from "vitest";
import { H3Event } from "h3";
import { handleUniversalOg } from "../../server/api/og/[...path].ts";

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

// Mock Supabase public client
vi.mock("./supabase.server.ts", () => ({
  getSupabasePublic: vi.fn(() => ({
    from: vi.fn((table: string) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data:
              table === "blog_posts"
                ? {
                    featured_image:
                      "https://fhhxbjwcgfslvbznrvab.supabase.co/storage/v1/object/public/gaspo-media/blog/mock.webp",
                  }
                : {
                    banner_image:
                      "https://fhhxbjwcgfslvbznrvab.supabase.co/storage/v1/object/public/gaspo-media/events/mock.webp",
                  },
            error: null,
          }),
        })),
      })),
    })),
  })),
}));

describe("Universal OG endpoint (server/api/og/[...path].ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should convert blog slug path to 1200x630 JPEG", async () => {
    const fakeImageBuffer = Buffer.from("fake-blog-image");
    const fakeJpegBuffer = Buffer.from("converted-blog-jpeg");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(fakeImageBuffer.buffer),
    });
    vi.stubGlobal("fetch", mockFetch);
    mockToBuffer.mockResolvedValue(fakeJpegBuffer);

    const event = new H3Event(new Request("http://localhost/api/og/blog/sample-post.jpg"));
    (event as any).context = { params: { path: "blog/sample-post.jpg" } };

    const result = await handleUniversalOg(event);

    expect(mockFetch).toHaveBeenCalled();
    expect(mockResize).toHaveBeenCalledWith(1200, 630, {
      fit: "cover",
      position: "center",
    });
    expect(result).toEqual(fakeJpegBuffer);
  });

  it("should convert event slug path to 1200x630 JPEG", async () => {
    const fakeImageBuffer = Buffer.from("fake-event-image");
    const fakeJpegBuffer = Buffer.from("converted-event-jpeg");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(fakeImageBuffer.buffer),
    });
    vi.stubGlobal("fetch", mockFetch);
    mockToBuffer.mockResolvedValue(fakeJpegBuffer);

    const event = new H3Event(new Request("http://localhost/api/og/events/annual-meet.jpg"));
    (event as any).context = { params: { path: "events/annual-meet.jpg" } };

    const result = await handleUniversalOg(event);

    expect(mockFetch).toHaveBeenCalled();
    expect(result).toEqual(fakeJpegBuffer);
  });

  it("should throw 403 if host is not in allowed hostnames (SSRF prevention)", async () => {
    const event = new H3Event(
      new Request("http://localhost/api/og?url=https://malicious-site.com/evil.jpg"),
    );

    await expect(handleUniversalOg(event)).rejects.toThrow("Host not allowed");
  });

  it("should convert query param ?url= to 1200x630 JPEG with headers", async () => {
    const fakeImageBuffer = Buffer.from("fake-image-data");
    const fakeJpegBuffer = Buffer.from("converted-jpeg-data");

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

    const result = await handleUniversalOg(event);

    expect(mockFetch).toHaveBeenCalled();
    expect(mockResize).toHaveBeenCalledWith(1200, 630, {
      fit: "cover",
      position: "center",
    });
    expect(result).toEqual(fakeJpegBuffer);
  });
});
