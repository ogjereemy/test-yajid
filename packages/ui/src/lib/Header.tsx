import React from 'react';
import Link from 'next/link';
import { cn } from '@property-right/utils';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          PropertyRight
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/dashboard" className={cn('hover:underline')}>Dashboard</Link>
          <Link href="/docs" className={cn('hover:underline')}>Docs</Link>
        </nav>
      </div>
    </header>
  );
};