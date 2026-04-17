import React from "react";

const pageModules = import.meta.glob("../app/**/page.jsx", { eager: true });

function filePathToRoute(filePath) {
  const route = filePath
    .replace("../app", "")
    .replace(/\/page\.jsx$/, "")
    .replace(/\/+/g, "/");

  return route === "" ? "/" : route;
}

export const routes = Object.fromEntries(
  Object.entries(pageModules).map(([filePath, module]) => [
    filePathToRoute(filePath),
    module.default,
  ])
);

export function RouteNotFound() {
  return (
    <main className="min-h-screen bg-white px-6 py-24 text-center text-gray-900">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
        Page not found
      </p>
      <h1 className="mt-4 text-4xl font-bold">That route does not exist</h1>
      <p className="mx-auto mt-4 max-w-xl text-gray-600">
        The React router is active, but there is no matching page module for this path.
      </p>
    </main>
  );
}