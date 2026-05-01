'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean); // Quita los espacios vacíos

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-400 py-4">
      <Link href="/" className="hover:text-black">Home</Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;
        
        return (
          <span key={href} className="flex items-center">
            <span className="mx-2">/</span>
            {isLast ? (
              <span className="text-black font-semibold capitalize">
                {segment.replace(/-/g, ' ')}
              </span>
            ) : (
              <Link href={href} className="hover:text-black capitalize">
                {segment.replace(/-/g, ' ')}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}