import { createFileRoute } from "@tanstack/react-router";
import { PageFrame } from "@/components/PageFrame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tatvarth Heights — Architectural Healthcare" },
      { name: "description", content: "Tatvarth Heights: architectural healthcare and residences at Aethelgard Pavilion." },
      { property: "og:title", content: "Tatvarth Heights — Architectural Healthcare" },
      { property: "og:description", content: "Architectural healthcare and residences at Aethelgard Pavilion." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PageFrame src="/pages/home.html" title="Home" />,
});
