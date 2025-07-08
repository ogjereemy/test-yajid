import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 mt-auto py-4 text-center text-sm text-gray-500">
      © {new Date().getFullYear()} PropertyRight. All rights reserved.
    </footer>
  );
};