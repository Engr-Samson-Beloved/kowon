import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://kowon.com.ng";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/"], // Prevent search engines from index-crawling active workspaces
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
