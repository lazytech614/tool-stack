import { MetadataRoute } from "next";
import { ALL_TOOLS } from "@/constants/configs/tools";

const BASE_URL = "https://tool-stack-kappa.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...ALL_TOOLS.map((tool) => ({
      url: `${BASE_URL}${tool.href}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
