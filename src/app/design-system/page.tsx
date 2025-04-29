'use client';

import React, { useState } from 'react';
import * as designSystem from '@/lib/designSystem';
import { exportDesignTokens } from '@/lib/designExporter';

// Component to display color swatches
const ColorPalette = ({ colors, name }: { colors: Record<string, string>, name: string }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">{name}</h3>
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(colors).map(([shade, color]) => (
          <div key={shade} className="flex flex-col">
            <div 
              className="h-16 rounded-md shadow-sm" 
              style={{ backgroundColor: color }}
            />
            <div className="text-xs mt-1 flex justify-between">
              <span>{shade}</span>
              <span className="font-mono">{color}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Component to display typography
const TypographyDisplay = () => {
  const { typography } = designSystem.designTokens;
  
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Typography</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Font Sizes</h3>
        <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm">
          {Object.entries(typography.fontSize).map(([name, size]) => (
            <div key={name} className="flex items-baseline">
              <div className="w-12 font-mono text-xs">{name}</div>
              <div style={{ fontSize: String(size) }} className="flex-1">
                The quick brown fox jumps over the lazy dog
              </div>
              <div className="text-xs font-mono text-gray-500">{String(size)}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Font Weights</h3>
        <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm">
          {Object.entries(typography.fontWeight).map(([name, weight]) => (
            <div key={name} className="flex items-baseline">
              <div className="w-24 font-mono text-xs">{name}</div>
              <div style={{ fontWeight: Number(weight) }} className="flex-1">
                The quick brown fox jumps over the lazy dog
              </div>
              <div className="text-xs font-mono text-gray-500">{String(weight)}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Line Heights</h3>
        <div className="space-y-6 bg-white p-4 rounded-lg shadow-sm">
          {Object.entries(typography.lineHeight).map(([name, height]) => (
            <div key={name} className="flex">
              <div className="w-16 font-mono text-xs pt-1">{name}</div>
              <div style={{ lineHeight: String(height) }} className="flex-1 border-l border-dashed border-gray-300 pl-2">
                The quick brown fox jumps over the lazy dog. This text demonstrates the line height setting.
                Multiple lines show how the spacing between lines is affected by this property.
              </div>
              <div className="text-xs font-mono text-gray-500 pt-1">{String(height)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Component to display spacing
const SpacingDisplay = () => {
  const { spacing } = designSystem.designTokens;
  
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Spacing</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(spacing).map(([name, value]) => (
          <div key={name} className="flex items-center bg-white p-2 rounded-lg shadow-sm">
            <div className="w-10 font-mono text-xs">{name}</div>
            <div 
              className="bg-blue-200 mx-4" 
              style={{ width: String(value), height: '24px' }}
            ></div>
            <div className="text-xs font-mono text-gray-500">{String(value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Component to display shadows
const ShadowsDisplay = () => {
  const { shadows } = designSystem.designTokens;
  
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Shadows</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(shadows).map(([name, value]) => (
          <div key={name} className="bg-white p-3 rounded-lg">
            <div 
              className="h-24 bg-white rounded-lg flex items-center justify-center"
              style={{ boxShadow: String(value) }}
            >
              <span className="font-mono text-sm">{name}</span>
            </div>
            <div className="mt-2 text-xs font-mono text-gray-500 truncate" title={String(value)}>
              {String(value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Component to display border radius
const BorderRadiusDisplay = () => {
  const { borderRadius } = designSystem.designTokens;
  
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Border Radius</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(borderRadius).map(([name, value]) => (
          <div key={name} className="bg-white p-3 rounded-lg shadow-sm">
            <div 
              className="h-16 bg-blue-500 flex items-center justify-center text-white"
              style={{ borderRadius: String(value) }}
            >
              {name}
            </div>
            <div className="mt-2 text-xs font-mono text-center">
              {String(value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DesignSystemPage() {
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const { colors } = designSystem.designTokens;

  const handleExport = async () => {
    try {
      setExportStatus('Exporting...');
      const results = await exportDesignTokens('./public/exports');
      setExportStatus(`Exported to: ${Object.values(results).join(', ')}`);
      
      // Set timeout to clear the status after 5 seconds
      setTimeout(() => setExportStatus(null), 5000);
    } catch (error) {
      setExportStatus(`Error: ${(error as Error).message}`);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Design System</h1>
        <button 
          onClick={handleExport}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Export Design Tokens
        </button>
      </div>
      
      {exportStatus && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
          {exportStatus}
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Colors</h2>
        {Object.entries(colors).map(([name, colorObj]) => (
          <ColorPalette key={name} colors={colorObj as Record<string, string>} name={name} />
        ))}
      </div>
      
      <TypographyDisplay />
      <SpacingDisplay />
      <BorderRadiusDisplay />
      <ShadowsDisplay />
    </div>
  );
} 