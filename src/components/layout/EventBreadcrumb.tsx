'use client';

import React from 'react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function EventBreadcrumb({
  items,
  rootLabel = 'Tổng quan',
  rootHref = '/dashboard',
}: {
  items: BreadcrumbItem[];
  rootLabel?: string;
  rootHref?: string;
}) {
  return (
    <nav aria-label="Đường dẫn điều hướng" className="breadcrumbs">
      <Link href={rootHref} style={{ color: '#475569', fontWeight: 600 }}>
        {rootLabel}
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <span aria-hidden="true" style={{ color: '#94a3b8' }}>
              /
            </span>
            {isLast || !item.href ? (
              <span
                aria-current={isLast ? 'page' : undefined}
                style={{
                  color: isLast ? 'var(--navy)' : '#475569',
                  fontWeight: isLast ? 700 : 500,
                }}
              >
                {item.label}
              </span>
            ) : (
              <Link href={item.href} style={{ color: '#475569', fontWeight: 500 }}>
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
