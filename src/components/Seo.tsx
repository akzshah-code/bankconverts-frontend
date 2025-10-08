// src/components/Seo.tsx

import { Helmet } from 'react-helmet';

interface SeoProps {
  title: string;
  description: string;
  keywords?: string; // Optional: A comma-separated list of keywords
  canonicalUrl?: string; // Optional: The full URL for the canonical link
}

export default function Seo({ title, description, keywords, canonicalUrl }: SeoProps) {
  const siteName = "BankConverts";
  const fullTitle = `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* --- Primary Meta Tags --- */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* --- Open Graph / Facebook --- */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {/* <meta property="og:image" content="URL_to_your_featured_image.jpg" /> */}

      {/* --- Twitter --- */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      {canonicalUrl && <meta property="twitter:url" content={canonicalUrl} />}
      {/* <meta property="twitter:image" content="URL_to_your_featured_image.jpg" /> */}
    </Helmet>
  );
}
