
interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

class MetaManager {
  private defaultMeta: MetaTag[] = [
    { name: 'description', content: 'Alabama Business Directory - Discover, connect, and grow with Alabama\'s premier business network' },
    { name: 'keywords', content: 'Alabama business, directory, networking, entrepreneurs, companies, Birmingham, Huntsville, Mobile, Montgomery' },
    { name: 'author', content: 'Alabama Business Directory' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: 'Alabama Business Directory' },
    { property: 'og:description', content: 'Discover, connect, and grow with Alabama\'s premier business network' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Alabama Business Directory' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Alabama Business Directory' },
    { name: 'twitter:description', content: 'Discover, connect, and grow with Alabama\'s premier business network' }
  ];

  setPageMeta(title: string, description: string, additionalMeta: MetaTag[] = []) {
    if (typeof document === 'undefined') return;

    // Set title
    document.title = `${title} - Alabama Business Directory`;

    // Remove existing meta tags
    this.clearExistingMeta();

    // Set default meta tags
    this.setMetaTags([
      ...this.defaultMeta.map(meta => 
        meta.name === 'description' || meta.property === 'og:description' || meta.name === 'twitter:description'
          ? { ...meta, content: description }
          : meta.property === 'og:title' || meta.name === 'twitter:title'
          ? { ...meta, content: title }
          : meta
      ),
      ...additionalMeta
    ]);
  }

  setBusinessMeta(business: any) {
    const title = `${business.businessname} - Alabama Business Directory`;
    const description = business.description || `${business.businessname} - ${business.category} business in ${business.location}`;
    
    const businessMeta: MetaTag[] = [
      { property: 'og:url', content: `${window.location.origin}/business/${business.id}` },
      { property: 'og:type', content: 'business.business' },
      { property: 'business:contact_data:locality', content: business.location || '' },
      { property: 'business:contact_data:region', content: 'Alabama' },
      { property: 'business:contact_data:country_name', content: 'United States' }
    ];

    if (business.logo_url) {
      businessMeta.push({ property: 'og:image', content: business.logo_url });
      businessMeta.push({ name: 'twitter:image', content: business.logo_url });
    }

    this.setPageMeta(business.businessname, description, businessMeta);
  }

  setStructuredData(data: StructuredData | StructuredData[]) {
    if (typeof document === 'undefined') return;

    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(Array.isArray(data) ? data : [data]);
    document.head.appendChild(script);
  }

  setBusinessStructuredData(business: any) {
    const structuredData: StructuredData = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: business.businessname,
      description: business.description,
      url: business.website,
      image: business.logo_url,
      address: {
        '@type': 'PostalAddress',
        addressLocality: business.location,
        addressRegion: 'Alabama',
        addressCountry: 'US'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        email: business.contactemail,
        contactType: 'customer service'
      }
    };

    if (business.rating && business.rating > 0) {
      structuredData.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: business.rating,
        ratingCount: 1 // This should be actual review count
      };
    }

    if (business.founded_year) {
      structuredData.foundingDate = business.founded_year.toString();
    }

    if (business.employees_count) {
      structuredData.numberOfEmployees = business.employees_count;
    }

    this.setStructuredData(structuredData);
  }

  generateBreadcrumbStructuredData(breadcrumbs: { name: string; url: string }[]) {
    const structuredData: StructuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url
      }))
    };

    this.setStructuredData(structuredData);
  }

  private setMetaTags(metaTags: MetaTag[]) {
    metaTags.forEach(meta => {
      const element = document.createElement('meta');
      
      if (meta.name) {
        element.setAttribute('name', meta.name);
      }
      
      if (meta.property) {
        element.setAttribute('property', meta.property);
      }
      
      element.setAttribute('content', meta.content);
      document.head.appendChild(element);
    });
  }

  private clearExistingMeta() {
    // Remove existing meta tags (except charset and viewport)
    const existingMeta = document.querySelectorAll('meta[name], meta[property]');
    existingMeta.forEach(meta => {
      const name = meta.getAttribute('name');
      const property = meta.getAttribute('property');
      
      if (name !== 'charset' && name !== 'viewport' && property !== 'charset') {
        meta.remove();
      }
    });
  }

  // Generate canonical URL
  setCanonicalUrl(url?: string) {
    if (typeof document === 'undefined') return;

    // Remove existing canonical link
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Add new canonical link
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = url || window.location.href;
    document.head.appendChild(canonical);
  }
}

export const metaManager = new MetaManager();
