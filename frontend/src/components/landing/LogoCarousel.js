import React from 'react';
import { Link } from 'react-router-dom';

function LogoCarousel({ items = [] }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="logo-carousel" data-testid="logo-carousel">
      <div className="logo-carousel-track">
        {items.map((item, index) => (
          <Link
            key={`${item.alt}-${index}`}
            to={item.link}
            className="logo-carousel-item"
            title={item.alt}
          >
            {item.src ? (
              <img src={item.src} alt={item.alt} />
            ) : (
              <div className="logo-carousel-placeholder">{item.alt}</div>
            )}
          </Link>
        ))}
        {items.map((item, index) => (
          <Link
            key={`copy-${item.alt}-${index}`}
            to={item.link}
            className="logo-carousel-item"
            title={item.alt}
          >
            {item.src ? (
              <img src={item.src} alt={item.alt} />
            ) : (
              <div className="logo-carousel-placeholder">{item.alt}</div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default LogoCarousel;
