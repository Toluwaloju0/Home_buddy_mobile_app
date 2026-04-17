export function resolveAssetPath(src) {
  if (!src || typeof src !== "string") {
    return src;
  }

  if (src.startsWith("/") || src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }

  return `/${src}`;
}