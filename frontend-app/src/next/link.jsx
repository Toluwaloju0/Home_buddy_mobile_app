import React from "react";

function normalizeHref(href) {
  if (typeof href === "string") {
    return href;
  }

  if (href && typeof href === "object") {
    const pathname = href.pathname || "/";
    const searchParams = href.query
      ? `?${new URLSearchParams(href.query).toString()}`
      : "";
    return `${pathname}${searchParams}${href.hash || ""}`;
  }

  return "/";
}

function navigate(href, replace = false, scroll = true) {
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({}, "", href);

  if (scroll) {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }
}

export default function Link({ href, onClick, replace = false, scroll = true, target, rel, children, ...props }) {
  const resolvedHref = normalizeHref(href);

  return (
    <a
      href={resolvedHref}
      target={target}
      rel={rel}
      onClick={(event) => {
        onClick?.(event);

        if (
          event.defaultPrevented ||
          target === "_blank" ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }

        event.preventDefault();
        navigate(resolvedHref, replace, scroll);
      }}
      {...props}
    >
      {children}
    </a>
  );
}