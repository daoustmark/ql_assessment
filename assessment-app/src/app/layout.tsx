import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./emergency-fix.css";
import { Layout } from "@/components/ui/Layout";
import { TextureProvider } from "@/components/ui";
import StyleFixer from "@/components/ui/StyleFixer";
import StyleFixerDirect from "@/components/ui/StyleFixerDirect";
import EmergencyRadioFix from "@/components/ui/EmergencyRadioFix";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Assessment App",
  description: "Take your assessment here",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Force some essential styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Next button text styling */
          .tracking-button {
            color: white !important;
            font-weight: 700 !important;
            font-size: 16px !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
            letter-spacing: 1px !important;
            text-transform: uppercase !important;
          }
        
          /* Hide error messages */
          .text-error.text-sm, 
          .absolute.-top-7.right-0.text-sm.text-error {
            display: none !important;
          }
          
          /* Remove horizontal rule at the bottom */
          .pt-8.mt-10.border-t.border-subtle {
            border-top: none !important;
            padding-top: 0 !important;
            margin-top: 20px !important;
          }
          
          /* Improve Next button styling */
          .bg-gradient-primary {
            background: linear-gradient(135deg, #3B6E8F 0%, #47B39D 100%) !important;
            color: white !important;
            font-weight: 600 !important;
            letter-spacing: 0.5px !important;
            padding: 12px 28px !important;
          }
          
          /* Fix question container width */
          .space-y-6.max-w-3xl.mx-auto {
            max-width: var(--container-4xl) !important;
            width: 100% !important;
          }
          
          /* Question container padding fix */
          .bg-white.rounded-lg.overflow-hidden {
            padding: 24px !important;
            margin-bottom: 24px !important;
            width: 100% !important;
          }
          
          .question-option {
            display: flex !important;
            align-items: center !important;
            border: 2px solid #D8E1E8 !important;
            border-radius: 12px !important;
            padding: 20px 24px !important;
            margin-bottom: 20px !important;
            background-color: white !important;
          }
          
          .radio-button__checkmark {
            width: 20px !important;
            height: 20px !important;
            min-width: 20px !important;
            border-radius: 50% !important;
            border: 2px solid #D8E1E8 !important;
            background-color: white !important;
            margin-right: 16px !important;
          }
          
          [aria-pressed="true"] .radio-button__checkmark {
            background-color: #47B39D !important;
            border-color: #47B39D !important;
          }
          
          [aria-pressed="true"] .radio-button__checkmark::after {
            content: "" !important;
            position: absolute !important;
            width: 8px !important;
            height: 8px !important;
            border-radius: 50% !important;
            background-color: white !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
          }
        `}} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StyleFixer />
        <StyleFixerDirect />
        <EmergencyRadioFix />
        <TextureProvider>
          <Layout>{children}</Layout>
        </TextureProvider>
      </body>
    </html>
  );
}
