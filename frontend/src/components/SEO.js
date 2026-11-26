import { useEffect } from 'react';

export default function SEO({ title, description, canonical, schema }) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Intermaven`;
    }

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content =
      description ||
      'Intermaven — Unified AI Business, Smart CRM & Reachout, Brand Kit AI, Social AI, and TuneMavens Creator Ecosystem. Start free with 150 Beta Credits.';

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    let ldJsonScript = document.getElementById('intermaven-json-ld');
    if (ldJsonScript) ldJsonScript.remove();

    if (schema) {
      ldJsonScript = document.createElement('script');
      ldJsonScript.id = 'intermaven-json-ld';
      ldJsonScript.type = 'application/ld+json';
      ldJsonScript.text = JSON.stringify(schema);
      document.head.appendChild(ldJsonScript);
    }

    return () => {
      if (ldJsonScript) ldJsonScript.remove();
    };
  }, [title, description, canonical, schema]);

  return null;
}
