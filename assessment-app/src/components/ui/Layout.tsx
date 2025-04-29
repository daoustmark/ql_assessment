import React from 'react';
import Link from 'next/link';
import { ProgressBar } from './ProgressBar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  progress?: number;
  showProgress?: boolean;
  totalSteps?: number;
  currentStep?: number;
}

export function Layout({ 
  children, 
  title, 
  subtitle,
  progress = 0,
  showProgress = false,
  totalSteps = 1,
  currentStep = 1
}: LayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background font-sans text-text-body">
      {/* App Header with updated styling */}
      <header className="bg-card border-b border-subtle shadow-card z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-primary font-bold text-lg flex items-center hover:text-primary/90 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 0 0 2.25 2.25h.75m0-3h-3a.75.75 0 0 1-.75-.75v-6a.75.75 0 0 1 .75-.75h3m3 0h-3" />
            </svg>
            Assessment App
          </Link>
          <Link 
            href="/profile" 
            className="text-sm bg-hover text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors duration-base shadow-sm hover:shadow-card"
          >
            My Account
          </Link>
        </div>
      </header>
      
      {/* Top progress bar that persists (main progress indicator) */}
      {showProgress && (
        <div className="sticky top-0 w-full bg-card shadow-sm z-10 px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <ProgressBar 
              current={progress} 
              total={100} 
              showText={false}
              variant="gradient"
              height="h-1.5"
              showPulse={true}
            />
          </div>
        </div>
      )}
      
      {/* Assessment Content Header - Only shown if explicitly provided */}
      {(title || subtitle) && (
        <div className="bg-background border-b border-subtle">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {showProgress && totalSteps > 1 && (
              <div className="mb-6 animate-fade-in">
                <ProgressBar 
                  current={currentStep} 
                  total={totalSteps} 
                  variant="primary" 
                  label="Section Progress"
                />
              </div>
            )}
            
            {title && <h1 className="text-heading font-bold text-text-heading tracking-heading mb-2 animate-fade-in">{title}</h1>}
            {subtitle && <p className="text-text-body text-lg leading-relaxed animate-slide-in-up">{subtitle}</p>}
          </div>
        </div>
      )}
      
      <main className="flex-grow w-full flex flex-col bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8 w-full">
          {children}
        </div>
      </main>
      
      <footer className="bg-card border-t border-subtle py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="mb-4 md:mb-0 text-text-light text-sm">&copy; {new Date().getFullYear()} Assessment App</p>
            <div className="flex space-x-6 text-sm text-text-light">
              <Link href="/help" className="hover:text-primary transition-colors duration-base">Help</Link>
              <Link href="/terms" className="hover:text-primary transition-colors duration-base">Terms</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors duration-base">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 