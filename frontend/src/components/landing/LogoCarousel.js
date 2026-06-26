import React from 'react';
import { Link } from 'react-router-dom';

function LogoCarousel() {
  const items = [
    { src: './images/logos/trusted/logo1.svg', alt: 'Creative Co', link: '/apps' },
    { src: './images/logos/trusted/logo2.svg', alt: 'Studio A', link: '/apps' },
    { src: './images/logos/trusted/logo3.svg', alt: 'Apex Media', link: '/apps' },
  ];

  return (
    <div className="logo-carousel" data-testid="logo-carousel">
      {items.map((item, index) => (
        <Link
          key={`${item.alt}-${index}`}
          to={item.link}
          className="logo-carousel-item"
          title={item.alt}
        >
          <img src={item.src} alt={item.alt} />
        </Link>
      ))}
    </div>
  );
}

export default LogoCarousel;
