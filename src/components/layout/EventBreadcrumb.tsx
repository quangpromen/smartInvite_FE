'use client';

import React from 'react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function EventBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Đường dẫn điều hướng" className="breadcrumbs">
      <Link href="/dashboard" style={{ color: 'var(--muted)', fontWeight: 600 }}>
        Dashboard
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <span aria-hidden="true" style={{ color: '#cbd5e1' }}>
              /
            </span>
            {isLast || !item.href ? (
              <span aria-current={isLast ? 'page' : undefined} style={{ color: isLast ? 'var(--ink)' : 'var(--muted)', fontWeight: isLast ? 700 : 500 }}>
                {item.label}
              </span>
            ) : (
              <Link href={item.href} style={{ color: 'var(--muted)', fontWeight: 500 }}>
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
