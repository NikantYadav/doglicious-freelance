import { SitemapStream, streamToPromise } from 'sitemap';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { Readable } from 'stream';

// Configuration
const DOMAIN = 'https://doglicious.in';
const OUTPUT_PATH = resolve('./dist/sitemap.xml');

// Define all routes with their metadata
const routes = [
  // Homepage
  {
    url: '/',
    changefreq: 'weekly',
    priority: 1.0,
    img: [
      {
        url: `${DOMAIN}/assets/og-image.jpg`,
        title: 'Doglicious.in — Superfood for Dogs',
        caption: 'AI-Powered Nutrition. Backed by Science. Made with Love.'
      }
    ]
  },

  // Products page
  { url: '/products', changefreq: 'weekly', priority: 0.9 },

  // VetRx Scan
  { url: '/vetrxscan', changefreq: 'monthly', priority: 0.9 },

  // Blog hub
  { url: '/blogs', changefreq: 'weekly', priority: 0.8 },

  // Blog articles
  { url: '/blog/1', changefreq: 'monthly', priority: 0.8 },
  { url: '/blog/2', changefreq: 'monthly', priority: 0.8 },
  { url: '/blog/3', changefreq: 'monthly', priority: 0.8 },
  { url: '/blog/4', changefreq: 'monthly', priority: 0.8 },
  { url: '/blog/5', changefreq: 'monthly', priority: 0.8 },
  { url: '/blog/6', changefreq: 'monthly', priority: 0.8 },
  { url: '/blog/7', changefreq: 'monthly', priority: 0.8 },
  { url: '/blog/8', changefreq: 'monthly', priority: 0.8 },
  { url: '/blog/9', changefreq: 'monthly', priority: 0.8 },
  { url: '/blog/10', changefreq: 'monthly', priority: 0.8 },

  // Free Tools hub
  { url: '/tools', changefreq: 'monthly', priority: 0.8 },

  // Free tools
  { url: '/tools/bmi-calculator', changefreq: 'monthly', priority: 0.7 },
  { url: '/tools/feeding-calculator', changefreq: 'monthly', priority: 0.7 },
  { url: '/tools/cost-calculator', changefreq: 'monthly', priority: 0.7 },
  { url: '/tools/age-calculator', changefreq: 'monthly', priority: 0.7 },
  { url: '/tools/best-vegetables', changefreq: 'monthly', priority: 0.7 },
  { url: '/tools/natural-healing', changefreq: 'monthly', priority: 0.7 },
  { url: '/tools/aafco-planner', changefreq: 'monthly', priority: 0.7 },
  { url: '/tools/health-quiz', changefreq: 'monthly', priority: 0.7 },

  // Legal pages
  { url: '/privacy-policy', changefreq: 'yearly', priority: 0.3 },
  { url: '/terms-of-service', changefreq: 'yearly', priority: 0.3 },
  { url: '/refund-policy', changefreq: 'yearly', priority: 0.3 },
  { url: '/shipping-policy', changefreq: 'yearly', priority: 0.3 }
];

async function generateSitemap() {
  try {
    console.log('🚀 Generating sitemap...');

    // Create a stream to write to
    const stream = new SitemapStream({
      hostname: DOMAIN,
      xmlns: {
        news: false,
        xhtml: false,
        image: true,
        video: false
      }
    });

    // Convert routes array to a readable stream and pipe to sitemap stream
    const xmlString = await streamToPromise(
      Readable.from(routes).pipe(stream)
    ).then(data => data.toString());

    // Format the XML with proper indentation
    const formattedXml = formatXml(xmlString);

    // Write to file
    writeFileSync(OUTPUT_PATH, formattedXml, 'utf8');

    console.log('✅ Sitemap generated successfully at:', OUTPUT_PATH);
    console.log(`📊 Total URLs: ${routes.length}`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

// Simple XML formatter
function formatXml(xml) {
  let formatted = '';
  let indent = '';
  const tab = '  ';

  xml.split(/>\s*</).forEach(node => {
    if (node.match(/^\/\w/)) {
      indent = indent.substring(tab.length);
    }

    formatted += indent + '<' + node + '>\n';

    if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('?')) {
      indent += tab;
    }
  });

  return formatted.substring(1, formatted.length - 2);
}

// Run the generator
generateSitemap();
