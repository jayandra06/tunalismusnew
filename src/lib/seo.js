/**
 * SEO utility functions for Tunalismus
 * Provides helper functions for generating SEO metadata and structured data
 */

/**
 * Generate page metadata for SEO
 * @param {Object} options - SEO options
 * @param {string} options.title - Page title
 * @param {string} options.description - Page description
 * @param {string} options.path - Page path
 * @param {string} options.image - Page image URL
 * @param {string} options.type - Page type (article, website, etc.)
 * @param {Object} options.article - Article-specific data
 * @returns {Object} SEO metadata object
 */
export const generateSEOMetadata = ({
  title,
  description,
  path = '',
  image = 'https://tunalismus.in/og-image.png',
  type = 'website',
  article = null,
}) => {
  const fullTitle = title ? `${title} | Tunalismus` : 'Tunalismus – Learn Languages the Human Way';
  const fullDescription = description || 'Learn languages the human way with Tunalismus. German, Turkish, and English courses guided by Sema in Hyderabad, India.';
  const fullUrl = `https://tunalismus.in${path}`;

  const metadata = {
    title: fullTitle,
    description: fullDescription,
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: fullUrl,
      siteName: 'Tunalismus',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: 'en_US',
      type: type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [image],
      creator: '@tunalismus',
    },
    alternates: {
      canonical: fullUrl,
    },
  };

  // Add article-specific metadata
  if (article && type === 'article') {
    metadata.openGraph.type = 'article';
    metadata.openGraph.article = {
      publishedTime: article.publishedTime,
      modifiedTime: article.modifiedTime,
      authors: article.authors || ['Sema – Founder of Tunalismus'],
      tags: article.tags || [],
    };
  }

  return metadata;
};

/**
 * Generate structured data for blog posts
 * @param {Object} post - Blog post data
 * @returns {Object} Structured data object
 */
export const generateBlogPostStructuredData = (post) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image || post.firebaseThumbnailPath || 'https://tunalismus.in/og-image.png',
    author: {
      '@type': 'Person',
      name: post.authorName || 'Sema',
      jobTitle: 'Language Educator',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Tunalismus',
      logo: {
        '@type': 'ImageObject',
        url: 'https://tunalismus.in/logo.png',
      },
    },
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://tunalismus.in/blog/${post.slug}`,
    },
    keywords: post.tags || [],
    articleSection: post.category || 'Language Learning',
    wordCount: post.content ? post.content.split(' ').length : 0,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    ...(post.type === 'video' && {
      video: {
        '@type': 'VideoObject',
        name: post.title,
        description: post.excerpt,
        thumbnailUrl: post.firebaseThumbnailPath || post.image,
        uploadDate: post.publishedAt || post.createdAt,
        duration: post.duration,
        ...(post.transcript && { transcript: post.transcript }),
      },
    }),
  };
};

/**
 * Generate structured data for courses
 * @param {Object} course - Course data
 * @returns {Object} Structured data object
 */
export const generateCourseStructuredData = (course) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'Tunalismus',
      url: 'https://tunalismus.in',
    },
    instructor: {
      '@type': 'Person',
      name: 'Sema',
      jobTitle: 'Language Educator',
    },
    courseMode: 'online',
    educationalLevel: course.difficulty || 'beginner',
    inLanguage: course.language || 'English',
    isAccessibleForFree: false,
    offers: {
      '@type': 'Offer',
      price: course.price || 0,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: course.rating ? {
      '@type': 'AggregateRating',
      ratingValue: course.rating,
      ratingCount: course.ratingCount || 1,
    } : undefined,
  };
};

/**
 * Generate breadcrumb structured data
 * @param {Array} breadcrumbs - Array of breadcrumb items
 * @returns {Object} Structured data object
 */
export const generateBreadcrumbStructuredData = (breadcrumbs) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

/**
 * Generate FAQ structured data
 * @param {Array} faqs - Array of FAQ items
 * @returns {Object} Structured data object
 */
export const generateFAQStructuredData = (faqs) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};

/**
 * Generate organization structured data
 * @returns {Object} Structured data object
 */
export const generateOrganizationStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Tunalismus',
    description: 'A modern, kind, and real-life-focused space to learn languages – guided by Sema in Hyderabad, India.',
    url: 'https://tunalismus.in',
    logo: 'https://tunalismus.in/logo.png',
    image: 'https://tunalismus.in/og-image.png',
    founder: {
      '@type': 'Person',
      name: 'Sema',
      jobTitle: 'Founder and Language Educator',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Hyderabad',
      addressCountry: 'India',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English', 'German', 'Turkish'],
    },
    sameAs: [
      'https://www.instagram.com/tunalismus',
      'https://www.facebook.com/tunalismus',
      'https://www.linkedin.com/company/tunalismus',
    ],
    offers: {
      '@type': 'Offer',
      category: 'Language Learning Courses',
      description: 'German, Turkish, and English language courses',
    },
  };
};

/**
 * Generate meta tags for a page
 * @param {Object} metadata - Page metadata
 * @returns {Array} Array of meta tag objects
 */
export const generateMetaTags = (metadata) => {
  const tags = [
    { name: 'title', content: metadata.title },
    { name: 'description', content: metadata.description },
    { name: 'keywords', content: metadata.keywords?.join(', ') },
    { property: 'og:title', content: metadata.title },
    { property: 'og:description', content: metadata.description },
    { property: 'og:url', content: metadata.url },
    { property: 'og:type', content: metadata.type || 'website' },
    { property: 'og:image', content: metadata.image },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: metadata.title },
    { name: 'twitter:description', content: metadata.description },
    { name: 'twitter:image', content: metadata.image },
  ];

  return tags.filter(tag => tag.content);
};

/**
 * Generate JSON-LD script tag
 * @param {Object} structuredData - Structured data object
 * @returns {string} JSON-LD script tag HTML
 */
export const generateJSONLD = (structuredData) => {
  return `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`;
};

export default {
  generateSEOMetadata,
  generateBlogPostStructuredData,
  generateCourseStructuredData,
  generateBreadcrumbStructuredData,
  generateFAQStructuredData,
  generateOrganizationStructuredData,
  generateMetaTags,
  generateJSONLD,
};
