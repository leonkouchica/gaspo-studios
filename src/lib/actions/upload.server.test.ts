import { describe, it, expect, vi, beforeEach } from "vitest";
import { convertAndUploadImage } from "./upload.server";

const { mockSharp, mockWebp, mockToBuffer } = vi.hoisted(() => ({
  mockToBuffer: vi.fn(),
  mockWebp: vi.fn(),
  mockSharp: vi.fn(),
}));

mockWebp.mockImplementation(() => ({
  toBuffer: mockToBuffer,
}));

mockSharp.mockImplementation(() => ({
  webp: mockWebp,
}));

vi.mock("sharp", () => ({
  default: mockSharp,
}));

// Mock Supabase storage
const mockUpload = vi.fn();
const mockCreateBucket = vi.fn();
const mockGetPublicUrl = vi.fn();

const mockStorage = {
  from: vi.fn().mockImplementation(() => ({
    upload: mockUpload,
    getPublicUrl: mockGetPublicUrl,
  })),
  createBucket: mockCreateBucket,
};

const mockSupabase = {
  storage: mockStorage,
};

vi.mock("../supabase.server.ts", () => ({
  getSupabaseAdmin: () => mockSupabase,
}));

describe("upload.server convertAndUploadImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw an error if no file is provided", async () => {
    await expect(convertAndUploadImage(null, "gallery")).rejects.toThrow(
      "No file was provided for upload",
    );
  });

  it("should throw an error for unsupported file types", async () => {
    await expect(convertAndUploadImage({} as any, "gallery")).rejects.toThrow(
      "Unsupported file type: must be File, Blob or Buffer",
    );
  });

  it("should handle Blob/File instances with arrayBuffer method", async () => {
    const arrayBufferData = new Uint8Array([1, 2, 3]).buffer;
    const mockFile = {
      arrayBuffer: vi.fn().mockResolvedValue(arrayBufferData),
    };

    mockToBuffer.mockResolvedValue(Buffer.from("webp-data"));
    mockUpload.mockResolvedValue({ data: {}, error: null });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://supabase/gaspo-media/gallery/test.webp" },
    });

    const result = await convertAndUploadImage(mockFile, "gallery");

    expect(mockFile.arrayBuffer).toHaveBeenCalled();
    expect(mockSharp).toHaveBeenCalledWith(Buffer.from(arrayBufferData));
    expect(mockWebp).toHaveBeenCalledWith({ quality: 90 });
    expect(mockToBuffer).toHaveBeenCalled();
    expect(mockStorage.from).toHaveBeenCalledWith("gaspo-media");
    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringMatching(/^gallery\/[a-z0-9]+\.webp$/),
      Buffer.from("webp-data"),
      expect.objectContaining({
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: true,
      }),
    );
    expect(result).toBe("https://supabase/gaspo-media/gallery/test.webp");
  });

  it("should handle raw Buffers", async () => {
    const rawBuffer = Buffer.from("raw-bytes");

    mockToBuffer.mockResolvedValue(Buffer.from("webp-data"));
    mockUpload.mockResolvedValue({ data: {}, error: null });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://supabase/gaspo-media/blog/test.webp" },
    });

    const result = await convertAndUploadImage(rawBuffer, "blog");

    expect(mockSharp).toHaveBeenCalledWith(rawBuffer);
    expect(result).toBe("https://supabase/gaspo-media/blog/test.webp");
  });

  it("should throw an error if arrayBuffer conversion fails", async () => {
    const mockFile = {
      arrayBuffer: vi.fn().mockRejectedValue(new Error("Read failure")),
    };

    await expect(convertAndUploadImage(mockFile, "events")).rejects.toThrow(
      "Failed to read upload buffer: Read failure",
    );
  });

  it("should throw an error if Sharp image processing fails", async () => {
    const rawBuffer = Buffer.from("bad-image-bytes");
    mockToBuffer.mockRejectedValue(new Error("Invalid image format"));

    await expect(convertAndUploadImage(rawBuffer, "team")).rejects.toThrow(
      "Sharp WebP processing failed: Invalid image format. Ensure the file is a valid image.",
    );
  });

  it("should throw an error if storage upload fails for general errors", async () => {
    const rawBuffer = Buffer.from("bytes");
    mockToBuffer.mockResolvedValue(Buffer.from("webp-data"));
    mockUpload.mockResolvedValue({
      data: null,
      error: { message: "Permission denied" },
    });

    await expect(convertAndUploadImage(rawBuffer, "gallery")).rejects.toThrow(
      "Supabase Storage upload failed: Permission denied",
    );
  });

  it("should handle 'Bucket not found' error by creating bucket and retrying", async () => {
    const rawBuffer = Buffer.from("bytes");
    mockToBuffer.mockResolvedValue(Buffer.from("webp-data"));

    // First upload fails with Bucket not found
    mockUpload.mockResolvedValueOnce({
      data: null,
      error: { message: "Bucket not found: gaspo-media" },
    });

    // Create bucket succeeds
    mockCreateBucket.mockResolvedValue({ data: {}, error: null });

    // Retry upload succeeds
    mockUpload.mockResolvedValueOnce({
      data: {},
      error: null,
    });

    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://supabase/gaspo-media/gallery/retry.webp" },
    });

    const result = await convertAndUploadImage(rawBuffer, "gallery");

    expect(mockStorage.createBucket).toHaveBeenCalledWith("gaspo-media", {
      public: true,
      allowedMimeTypes: ["image/webp", "image/png", "image/jpeg", "image/jpg"],
    });
    expect(mockUpload).toHaveBeenCalledTimes(2);
    expect(result).toBe("https://supabase/gaspo-media/gallery/retry.webp");
  });

  it("should throw error if bucket creation fails during auto-create flow", async () => {
    const rawBuffer = Buffer.from("bytes");
    mockToBuffer.mockResolvedValue(Buffer.from("webp-data"));

    mockUpload.mockResolvedValueOnce({
      data: null,
      error: { message: "Bucket not found" },
    });

    mockCreateBucket.mockResolvedValue({
      data: null,
      error: { message: "Database error during bucket creation" },
    });

    await expect(convertAndUploadImage(rawBuffer, "gallery")).rejects.toThrow(
      "Failed to create bucket 'gaspo-media': Database error during bucket creation",
    );
  });

  it("should throw error if retry upload fails after bucket creation", async () => {
    const rawBuffer = Buffer.from("bytes");
    mockToBuffer.mockResolvedValue(Buffer.from("webp-data"));

    mockUpload.mockResolvedValueOnce({
      data: null,
      error: { message: "Bucket not found" },
    });

    mockCreateBucket.mockResolvedValue({ data: {}, error: null });

    mockUpload.mockResolvedValueOnce({
      data: null,
      error: { message: "Connection timeout" },
    });

    await expect(convertAndUploadImage(rawBuffer, "gallery")).rejects.toThrow(
      "Failed to upload image after bucket creation: Connection timeout",
    );
  });

  it("should throw error if public URL retrieval fails or returns empty", async () => {
    const rawBuffer = Buffer.from("bytes");
    mockToBuffer.mockResolvedValue(Buffer.from("webp-data"));
    mockUpload.mockResolvedValue({ data: {}, error: null });
    mockGetPublicUrl.mockReturnValue({ data: null });

    await expect(convertAndUploadImage(rawBuffer, "gallery")).rejects.toThrow(
      "Failed to retrieve public URL for uploaded asset",
    );
  });
});
