import React from 'react';
import { getHeaderBackground } from '../../imageRegistry';

function PageHeader({ pageKey, breadcrumb, title, subtitle, children }) {
  const background = getHeaderBackground(pageKey);
  return (
    <div className="ph" data-testid={`${pageKey}-header`}>
      <div
        className="phi"
        style={{
          backgroundImage: background,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      />
      <div className="pho" />
      <div className="phc">
        {breadcrumb && <div className="bc">{breadcrumb}</div>}
        {title && <div className="pht">{title}</div>}
        {subtitle && <div className="phs">{subtitle}</div>}
        {children}
      </div>
    </div>
  );
}

export default PageHeader;
