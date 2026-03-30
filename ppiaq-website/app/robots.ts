import type { MetadataRoute } from "next";

const getSiteUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const baseUrl = envUrl
    ? envUrl
    : process.env.NODE_ENV === "production"
      ? "https://ppiaqueensland.org"
      : "http://localhost:3000";

  const withProtocol =
    baseUrl.startsWith("http://") || baseUrl.startsWith("https://")
      ? baseUrl
      : `https://${baseUrl}`;

  return withProtocol.replace(/\/+$/, "");
};

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
