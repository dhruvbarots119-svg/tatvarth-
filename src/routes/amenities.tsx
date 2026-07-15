import { createFileRoute } from "@tanstack/react-router";
import { PageFrame } from "@/components/PageFrame";

export const Route = createFileRoute("/amenities")({
  head: () => ({
    meta: [
      { title: "Amenities | Aethelgard Pavilion" },
      { name: "description", content: "Amenities at Aethelgard Pavilion, Tatvarth Heights." },
      { property: "og:title", content: "Amenities | Aethelgard Pavilion" },
      { property: "og:description", content: "Amenities at Aethelgard Pavilion." },
    ],
  }),
  component: () => <PageFrame src="/pages/amenities.html" title="Amenities" />,
});
