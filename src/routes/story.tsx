import { createFileRoute } from "@tanstack/react-router";
import { PageFrame } from "@/components/PageFrame";

export const Route = createFileRoute("/story")({
  head: () => ({
    meta: [
      { title: "The Story of Aethelgard Pavilion | Tatvarth Heights" },
      { name: "description", content: "The story of Aethelgard Pavilion at Tatvarth Heights." },
      { property: "og:title", content: "The Story of Aethelgard Pavilion" },
      { property: "og:description", content: "The story behind Aethelgard Pavilion." },
    ],
  }),
  component: () => <PageFrame src="/pages/story.html" title="Story" />,
});
