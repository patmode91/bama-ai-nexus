
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  name?: string;
  type?: string;
  image?: string;
}

const SEO = ({ title, description, name, type, image }: SEOProps) => {
  const siteName = name || 'BamaAI Connect';
  const siteType = type || 'website';
  const siteImage = image || 'https://lovable.dev/opengraph-image-p98pqg.png';

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{`${title} | ${siteName}`}</title>
      <meta name='description' content={description} />
      {/* End standard metadata tags */}
      {/* Facebook tags */}
      <meta property="og:type" content={siteType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={siteImage} />
      {/* End Facebook tags */}
      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={siteImage} />
      {/* End Twitter tags */}
    </Helmet>
  );
};

export default SEO;
