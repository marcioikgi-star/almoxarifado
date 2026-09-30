import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Almoxarifado Celta",
    short_name: "Almoxarifado",
    start_url: "/",
    display: "standalone",
    background_color: "#f1f5f9",
    theme_color: "#0f172a",
    lang: "pt-BR",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
