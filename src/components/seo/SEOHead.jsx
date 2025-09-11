"use client";
import Head from "next/head";

const SEOHead = ({ 
  title, 
  description, 
  keywords = [], 
  image = "/og-image.png",
  url,
  type = "website",
  structuredData
}) => {
  const fullTitle = title ? `${title} | Tunalismus` : "Tunalismus – Learn Languages the Human Way";
  const fullUrl = url ? `https://tunalismus.in${url}` : "https://tunalismus.in";
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`https://tunalismus.in${image}`} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Tunalismus" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`https://tunalismus.in${image}`} />
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
};

export default SEOHead;
