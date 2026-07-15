import { createFileRoute } from "@tanstack/react-router";
import { PageFrame } from "@/components/PageFrame";

export const Route = createFileRoute("/floors")({
  head: () => ({
    meta: [
      { title: "Floor Explorer | Tatvarth Heights" },
      { name: "description", content: "Explore floors and residences at Tatvarth Heights." },
      { property: "og:title", content: "Floor Explorer | Tatvarth Heights" },
      { property: "og:description", content: "Explore floors and residences at Tatvarth Heights." },
    ],
  }),
  component: () => <PageFrame src="/pages/floors.html" title="Floor Explorer" />,
});
