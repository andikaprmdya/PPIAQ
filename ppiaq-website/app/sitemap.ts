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

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const routes = [
    "",
    "/about",
    "/membership",
    "/contact",
    "/pesta-rakyat",
    "/meet-the-team",
    "/visi-misi",
    "/community-board",
    "/events/pre-departure-briefing",
    "/events/qut-market-day",
    "/events/uq-market-day",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.7,
  }));
}
