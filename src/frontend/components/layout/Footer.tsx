import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Logo variant="icon" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by Quiet Light. All rights reserved.
          </p>
        </div>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            to="/privacy"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Terms
          </Link>
          <Link
            to="/contact"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
} 