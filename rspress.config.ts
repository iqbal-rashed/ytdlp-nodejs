import path from 'path';
import fs from 'fs';
import { defineConfig } from 'rspress/config';

const siteUrl = 'https://iqbal-rashed.github.io/ytdlp-nodejs';
const siteName = 'ytdlp-nodejs';
const siteDescription =
  'A powerful Node.js wrapper for yt-dlp. Download, stream, and fetch metadata from videos with a simple, type-safe API.';
const siteKeywords =
  'ytdlp, yt-dlp, youtube downloader, video downloader, nodejs, typescript, npm, youtube, streaming, metadata';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: siteName,
  description: siteDescription,
  logoText: siteName,
  base: '/ytdlp-nodejs/',
  lang: 'en',
  locales: [
    {
      lang: 'en',
      label: 'English',
      title: siteName,
      description: siteDescription,
    },
  ],
  head: [
    // Primary Meta Tags
    ['meta', { name: 'keywords', content: siteKeywords }],
    ['meta', { name: 'author', content: 'Iqbal Rashed' }],
    ['meta', { name: 'robots', content: 'index, follow' }],
    ['meta', { name: 'googlebot', content: 'index, follow' }],
    [
      'meta',
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
    ],
    ['link', { rel: 'canonical', href: siteUrl }],

    // Open Graph / Facebook
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: siteUrl }],
    ['meta', { property: 'og:title', content: siteName }],
    ['meta', { property: 'og:description', content: siteDescription }],
    ['meta', { property: 'og:site_name', content: siteName }],
    ['meta', { property: 'og:locale', content: 'en_US' }],

    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:url', content: siteUrl }],
    ['meta', { name: 'twitter:title', content: siteName }],
    ['meta', { name: 'twitter:description', content: siteDescription }],

    // Additional SEO
    ['meta', { name: 'theme-color', content: '#3b82f6' }],

    // Structured Data (JSON-LD)
    `<script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        "name": "ytdlp-nodejs",
        "description": "${siteDescription}",
        "url": "${siteUrl}",
        "codeRepository": "https://github.com/iqbal-rashed/ytdlp-nodejs",
        "programmingLanguage": ["TypeScript", "JavaScript"],
        "runtimePlatform": "Node.js",
        "license": "https://opensource.org/licenses/MIT",
        "author": {
          "@type": "Person",
          "name": "Iqbal Rashed",
          "url": "https://github.com/iqbal-rashed"
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      }
    </script>`,
  ],
  ssg: {
    strict: true,
  },
  themeConfig: {
    nav: [
      {
        text: 'Guide',
        link: '/guide/introduction',
      },
      {
        text: 'Examples',
        link: '/guide/examples',
      },
      {
        text: 'API',
        link: '/api/ytdlp-class',
      },
    ],
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/iqbal-rashed/ytdlp-nodejs',
      },
    ],
    footer: {
      message: 'Released under the MIT License.',
    },
    sidebar: {
      '/': [
        {
          text: 'Guide',
          items: [
            {
              text: 'Introduction',
              link: '/guide/introduction',
            },
            {
              text: 'Installation',
              link: '/guide/installation',
            },
            {
              text: 'Quick Start',
              link: '/guide/quick-start',
            },
            {
              text: 'CLI Usage',
              link: '/guide/cli',
            },
            {
              text: 'Advanced Usage',
              link: '/guide/advanced',
            },
            {
              text: 'SponsorBlock',
              link: '/guide/start-sponsorblock',
            },
            {
              text: 'Subtitles',
              link: '/guide/subtitles',
            },
            {
              text: 'Playlists',
              link: '/guide/playlists',
            },
            {
              text: 'Authentication',
              link: '/guide/authentication',
            },
            {
              text: 'Troubleshooting',
              link: '/guide/troubleshooting',
            },
          ],
        },
        {
          text: 'Examples',
          items: [
            {
              text: 'Code Examples',
              link: '/guide/examples',
            },
          ],
        },
        {
          text: 'API Reference',
          items: [
            {
              text: 'YtDlp Class',
              link: '/api/ytdlp-class',
            },
            {
              text: 'Format Options',
              link: '/api/format-options',
            },
            {
              text: 'Interfaces',
              link: '/api/interfaces',
            },
          ],
        },
      ],
    },
  },
  markdown: {
    showLineNumbers: true,
  },
  plugins: [
    {
      name: 'sitemap-generator',
      async afterBuild(config, isProd) {
        if (!isProd) return;

        const pages = [
          '',
          '/guide/introduction',
          '/guide/installation',
          '/guide/quick-start',
          '/guide/cli',
          '/guide/advanced',
          '/guide/start-sponsorblock',
          '/guide/subtitles',
          '/guide/playlists',
          '/guide/authentication',
          '/guide/troubleshooting',
          '/guide/examples',
          '/api/ytdlp-class',
          '/api/format-options',
          '/api/interfaces',
        ];

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${siteUrl}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

        const outDir = config.outDir || 'doc_build';
        fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap);
        console.log('✓ Sitemap generated successfully');
      },
    },
  ],
});
