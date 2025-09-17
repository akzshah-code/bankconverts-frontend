// src/components/Seo.tsx


interface SeoProps {
  title: string;
  description: string;
}

export default function Seo({ title, description }: SeoProps) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
    </>
  );
}
