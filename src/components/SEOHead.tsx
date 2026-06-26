import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  schemas?: object[];
}

export default function SEOHead({ title, description, path, keywords, schemas = [] }: SEOHeadProps) {
  useEffect(() => {
    // 1. Update title
    document.title = title;

    // Helper to create or update meta tags
    const updateMetaTag = (attributeName: string, attributeValue: string, contentValue: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    // Helper to create or update link tags
    const updateLinkTag = (relValue: string, hrefValue: string) => {
      let element = document.querySelector(`link[rel="${relValue}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', relValue);
        document.head.appendChild(element);
      }
      element.setAttribute('href', hrefValue);
    };

    // 2. Update basic SEO tags
    updateMetaTag('name', 'description', description);
    if (keywords) {
      updateMetaTag('name', 'keywords', keywords);
    }
    updateLinkTag('canonical', `https://quickqrcode.pages.dev${path}`);

    // Robots rule
    updateMetaTag('name', 'robots', 'index, follow');

    // 3. Open Graph (OG) Tags for Social Media
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:url', `https://quickqrcode.pages.dev${path}`);
    updateMetaTag('property', 'og:type', 'website');
    updateMetaTag('property', 'og:site_name', 'Quick QR Code');
    updateMetaTag('property', 'og:image', 'https://quickqrcode.pages.dev/assets/og-image.png');
    updateMetaTag('property', 'og:image:width', '1200');
    updateMetaTag('property', 'og:image:height', '630');

    // 4. Twitter Cards
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:domain', 'quickqrcode.pages.dev');
    updateMetaTag('name', 'twitter:image', 'https://quickqrcode.pages.dev/assets/og-image.png');

    // 5. Schema.org JSON-LD structured data injection
    // Remove any existing JSON-LD script elements with our id
    const existingScripts = document.querySelectorAll('script[data-schema-id]');
    existingScripts.forEach((script) => script.remove());

    // Inject new schemas
    schemas.forEach((schema, idx) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-schema-id', `schema-${idx}`);
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    // Cleanup when component unmounts
    return () => {
      // Typically we don't have to revert title, but let's leave scripts clean
    };
  }, [title, description, path, schemas]);

  return null; // This component operates solely via side-effects
}
