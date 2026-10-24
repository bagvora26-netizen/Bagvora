import { describe, expect, it } from "vitest";
import { parseImageDataUrl } from "../shared/imageUpload";

describe("product image uploads", () => {
  it("accepts supported image data URLs", () => {
    const result = parseImageDataUrl("data:image/png;base64,aGVsbG8=");
    expect(result.contentType).toBe("image/png");
    expect(result.extension).toBe("png");
  });

  it("rejects unsupported formats and oversized payloads", () => {
    expect(() => parseImageDataUrl("data:image/svg+xml;base64,PHN2Zz4=" )).toThrow();
    expect(() => parseImageDataUrl(`data:image/png;base64,${"A".repeat(5_500_001)}`)).toThrow();
  });
});
