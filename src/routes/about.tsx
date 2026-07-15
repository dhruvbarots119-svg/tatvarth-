import { createFileRoute } from "@tanstack/react-router";
import { PageFrame } from "@/components/PageFrame";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | Tatvarth Heights" },
      { name: "description", content: "Learn about the vision and legacy of Tatvarth Heights." },
      { property: "og:title", content: "About | Tatvarth Heights" },
      { property: "og:description", content: "Learn about the vision and legacy." },
    ],
  }),
  component: () => <PageFrame src="/pages/about.html" title="About" />,
});
