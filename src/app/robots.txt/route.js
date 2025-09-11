import { NextResponse } from 'next/server';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /trainer/
Disallow: /student/
Disallow: /login
Disallow: /register
Disallow: /dashboard/

# Allow important pages
Allow: /courses/
Allow: /blog/
Allow: /about
Allow: /contact
Allow: /resources

# Sitemap location (Dynamic)
Sitemap: https://tunalismus.in/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1

# Additional directives for better SEO
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

# Block bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
}
