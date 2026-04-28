import { SitemapStream, streamToPromise } from 'sitemap';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { Readable } from 'stream';

// Configuration
const DOMAIN = 'https://doglicious.in';
const OUTPUT_PATH = resolve('./public/sitemap.xml');

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

  // Core sections (anchor links)
  { url: '/#vet', changefreq: 'monthly', priority: 0.9 },
  { url: '/#why', changefreq: 'monthly', priority: 0.8 },
  { url: '/#fresh', changefreq: 'monthly', priority: 0.8 },
  { url: '/#recipes', changefreq: 'weekly', priority: 0.9 },
  { url: '/#ingredients', changefreq: 'monthly', priority: 0.7 },
  { url: '/#case-studies', changefreq: 'monthly', priority: 0.7 },
  { url: '/#testimonials', changefreq: 'monthly', priority: 0.7 },
  { url: '/#video-stories', changefreq: 'monthly', priority: 0.7 },
  { url: '/#free-tools-section', changefreq: 'monthly', priority: 0.8 },
  { url: '/#blogs', changefreq: 'weekly', priority: 0.8 },
  { url: '/#faq', changefreq: 'monthly', priority: 0.7 },
  { url: '/#contact', changefreq: 'monthly', priority: 0.6 },

  // Blog articles
  { url: '/blog/ghar-ka-khana-for-dogs-science-behind-fresh-food', changefreq: 'monthly', priority: 0.8 },
  { url: '/blog/kibble-vs-fresh-dog-food-truth', changefreq: 'monthly', priority: 0.8 },
  { url: '/blog/dog-coat-dull-skin-itchy-stop-blaming-weather', changefreq: 'monthly', priority: 0.8 },
  { url: '/blog/how-to-switch-dog-to-fresh-food', changefreq: 'monthly', priority: 0.8 },
  { url: '/blog/what-indian-dogs-actually-need-to-eat', changefreq: 'monthly', priority: 0.8 },
  { url: '/blog/preservative-problem-indian-dog-food-aflatoxin', changefreq: 'monthly', priority: 0.8 },
  { url: '/blog/what-to-feed-puppy-first-year', changefreq: 'monthly', priority: 0.8 },
  { url: '/blog/senior-dog-eating-less-fresh-food-solution', changefreq: 'monthly', priority: 0.8 },
  { url: '/blog/indian-kitchen-safe-foods-for-dogs', changefreq: 'monthly', priority: 0.8 },
  { url: '/blog/five-indian-dogs-fresh-food-stories', changefreq: 'monthly', priority: 0.8 },

  // Free tools
  { url: '/tools/bmi-calculator', changefreq: 'monthly', priority: 0.7 },
  { url: '/tools/feeding-calculator', changefreq: 'monthly', priority: 0.7 },
  { url: '/tools/cost-calculator', changefreq: 'monthly', priority: 0.7 },
  { url: '/tools/age-calculator', changefreq: 'monthly', priority: 0.7 },
  { url: '/tools/best-vegetables', changefreq: 'monthly', priority: 0.7 },
  { url: '/tools/natural-healing', changefreq: 'monthly', priority: 0.7 },
  { url: '/tools/aafco-planner', changefreq: 'monthly', priority: 0.7 },
  { url: '/tools/health-quiz', changefreq: 'monthly', priority: 0.7 },

  // VetRx Scan
  { url: '/vetrxscan', changefreq: 'monthly', priority: 0.9 },

  // Legal pages
  { url: '/privacy-policy', changefreq: 'yearly', priority: 0.3 },
  { url: '/terms-of-service', changefreq: 'yearly', priority: 0.3 },
  { url: '/refund-policy', changefreq: 'yearly', priority: 0.3 },
  { url: '/shipping-policy', changefreq: 'yearly', priority: 0.3 },

  // Products page
  { url: '/products', changefreq: 'weekly', priority: 0.8 }
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
