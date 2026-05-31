import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchGalleryImages,
  uploadGalleryImage,
  toggleImageVisibility,
  updateImageMeta,
  deleteGalleryImage,
} from "./gallery";

const mockImages = [
  {
    id: "img-123",
    src: "https://example.com/gallery/photo1.webp",
    title: "Beautiful Portrait",
    alt: "Beautiful portrait description",
    category: "Portraits",
    visible: true,
    display_order: 1,
    uploaded_at: "2026-05-31T12:00:00Z",
  },
];

const mockQuery: any = {
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
  delete: vi.fn(),
  single: vi.fn(),
  then: vi.fn(),
};

mockQuery.select.mockReturnValue(mockQuery);
mockQuery.eq.mockReturnValue(mockQuery);
mockQuery.order.mockReturnValue(mockQuery);
mockQuery.update.mockReturnValue(mockQuery);
mockQuery.insert.mockReturnValue(mockQuery);
mockQuery.delete.mockReturnValue(mockQuery);
mockQuery.single.mockReturnValue(mockQuery);

const mockRemove = vi.fn().mockResolvedValue({ data: {}, error: null });
const mockStorage = {
  from: vi.fn().mockReturnValue({
    remove: mockRemove,
  }),
};

const mockSupabase = {
  from: vi.fn().mockReturnValue(mockQuery),
  storage: mockStorage,
};

vi.mock("../supabase.server.ts", () => ({
  getSupabaseAdmin: () => mockSupabase,
}));

vi.mock("./upload.server.ts", () => ({
  convertAndUploadImage: vi.fn().mockResolvedValue("https://example.com/gallery/test.webp"),
}));

// Mock window/File globally since we construct File in tests
globalThis.File = class File {
  constructor(public bits: any[], public name: string, public options?: any) {}
} as any;

describe("Gallery Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchGalleryImages", () => {
    it("should fetch, filter, and map gallery images sorted by display_order", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: mockImages, error: null }));
      });

      const result = await fetchGalleryImages({ category: "Portraits", visibleOnly: true });

      expect(mockSupabase.from).toHaveBeenCalledWith("gallery_images");
      expect(mockQuery.eq).toHaveBeenCalledWith("category", "Portraits");
      expect(mockQuery.eq).toHaveBeenCalledWith("visible", true);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "img-123",
        src: "https://example.com/gallery/photo1.webp",
        title: "Beautiful Portrait",
        alt: "Beautiful portrait description",
        category: "Portraits",
        visible: true,
        order: 1,
        uploadedAt: "2026-05-31T12:00:00Z",
      });
    });
  });

  describe("uploadGalleryImage", () => {
    it("should decode base64, trigger file upload, and save database row", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: mockImages[0], error: null }));
      });

      const result = await uploadGalleryImage({
        fileBase64: "dGVzdC1maWxlLWJ5dGVz", // "test-file-bytes"
        fileName: "portrait.png",
        mimeType: "image/png",
        title: "Beautiful Portrait",
        category: "Portraits",
        order: 1,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("gallery_images");
      expect(mockQuery.insert).toHaveBeenCalledWith({
        src: "https://example.com/gallery/test.webp",
        title: "Beautiful Portrait",
        alt: "Beautiful Portrait",
        category: "Portraits",
        visible: true,
        display_order: 1,
      });
      expect(result.src).toBe(mockImages[0].src);
    });
  });

  describe("toggleImageVisibility", () => {
    it("should toggle visibility database flag", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: { ...mockImages[0], visible: false }, error: null }));
      });

      const result = await toggleImageVisibility({ id: "img-123", visible: false });

      expect(mockSupabase.from).toHaveBeenCalledWith("gallery_images");
      expect(mockQuery.update).toHaveBeenCalledWith({ visible: false });
      expect(mockQuery.eq).toHaveBeenCalledWith("id", "img-123");
      expect(result.visible).toBe(false);
    });
  });

  describe("updateImageMeta", () => {
    it("should update title, alt, category, and display order", async () => {
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ data: mockImages[0], error: null }));
      });

      const result = await updateImageMeta({
        id: "img-123",
        title: "New Title",
        alt: "New Alt",
        category: "Commercial",
        order: 5,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("gallery_images");
      expect(mockQuery.update).toHaveBeenCalledWith({
        title: "New Title",
        alt: "New Alt",
        category: "Commercial",
        display_order: 5,
      });
      expect(mockQuery.eq).toHaveBeenCalledWith("id", "img-123");
      expect(result.id).toBe("img-123");
    });
  });

  describe("deleteGalleryImage", () => {
    it("should remove image record from database and storage", async () => {
      // 1. SELECT query to get image URL
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({
          data: { src: "https://example.com/storage/v1/object/public/gaspo-media/gallery/12345.webp" },
          error: null,
        }));
      });

      // 2. DELETE row query
      mockQuery.then.mockImplementationOnce((onfulfilled: any) => {
        return Promise.resolve(onfulfilled({ error: null }));
      });

      const result = await deleteGalleryImage({ id: "img-123" });

      expect(mockQuery.eq).toHaveBeenCalledWith("id", "img-123");
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockStorage.from).toHaveBeenCalledWith("gaspo-media");
      expect(mockRemove).toHaveBeenCalledWith(["gallery/12345.webp"]);
      expect(result.success).toBe(true);
    });
  });
});
