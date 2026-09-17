export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://coined.vercel.app/sitemap.xml",
  };
}
