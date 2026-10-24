export const allowedImageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export function parseImageDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/);
  if (!match) throw new Error("صيغة الصورة غير مدعومة");
  const contentType = match[1] as keyof typeof allowedImageTypes;
  const base64 = match[2].replace(/\s/g, "");
  if (base64.length > 5_500_000) throw new Error("حجم الصورة يتجاوز 4 ميجابايت");
  return { contentType, base64, extension: allowedImageTypes[contentType] };
}
