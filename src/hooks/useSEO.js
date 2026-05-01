/**
 * useSEO — lightweight hook to update <title>, <meta description>,
 *           and <link rel="canonical"> without react-helmet.
 *
 * Usage:
 *   useSEO({
 *     title: 'Page Title | Doglicious.in',
 *     description: 'Page description …',
 *     canonical: 'https://doglicious.in/page',
 *   });
 */
import { useEffect } from 'react';

export function useSEO({ title, description, canonical } = {}) {
    useEffect(() => {
        // ── Title ──────────────────────────────────────────────────────
        if (title) {
            document.title = title;
        }

        // ── Meta description ──────────────────────────────────────────
        if (description) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.setAttribute('name', 'description');
                document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', description);
        }

        // ── Canonical ─────────────────────────────────────────────────
        if (canonical) {
            let link = document.querySelector('link[rel="canonical"]');
            if (!link) {
                link = document.createElement('link');
                link.setAttribute('rel', 'canonical');
                document.head.appendChild(link);
            }
            link.setAttribute('href', canonical);
        }
    }, [title, description, canonical]);
}
