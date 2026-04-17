import React from "react";

function resolveImageSrc(src) {
  if (!src) {
    return "";
  }

  if (typeof src !== "string") {
    return src;
  }

  if (src.startsWith("/") || src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }

  return `/${src}`;
}

export default function Image({ src, alt = "", ...props }) {
  return <img src={resolveImageSrc(src)} alt={alt} {...props} />;
}