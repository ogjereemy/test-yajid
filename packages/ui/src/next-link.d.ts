declare module 'next/link' {
  import * as React from 'react';

  export interface LinkProps {
    href: string;
    className?: string;
    children?: React.ReactNode;
    [key: string]: any;
  }

  const Link: React.FC<LinkProps>;
  export default Link;
}