import fs from 'fs';
import path from 'path';
import * as designSystem from './designSystem';

type ExportFormat = 'json' | 'figma' | 'sketch';

// Use the design tokens from the imported module
const designTokens = designSystem.designTokens;

/**
 * Converts design tokens to a format usable in Figma
 */
function convertToFigmaFormat(designTokens: any): any {
  // This is a simplified example. In a real implementation,
  // this would convert the tokens to Figma Variables format
  return {
    name: 'Design System',
    lastModified: new Date().toISOString(),
    variables: {
      colors: designTokens.colors,
      typography: designTokens.typography,
      spacing: designTokens.spacing,
      borderRadius: designTokens.borderRadius,
      shadows: designTokens.shadows,
    },
  };
}

/**
 * Converts design tokens to a format usable in Sketch
 */
function convertToSketchFormat(designTokens: any): any {
  // This is a simplified example. In a real implementation,
  // this would convert the tokens to Sketch Library format
  return {
    document: {
      assets: {
        colorAssets: Object.entries(designTokens.colors).flatMap(([category, values]: [string, any]) => 
          Object.entries(values as Record<string, string>).map(([shade, color]) => ({
            name: `${category}/${shade}`,
            color: color,
          }))
        ),
        gradientAssets: [],
      },
      layerStyles: [],
      textStyles: Object.entries(designTokens.typography.fontSize as Record<string, string>).map(([key, size]) => ({
        name: `Text/${key}`,
        fontSize: size,
        fontFamily: designTokens.typography.fontFamily.sans,
      })),
    },
  };
}

/**
 * Ensures the export directory exists
 */
function ensureDirectoryExists(directoryPath: string): void {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

/**
 * Exports design tokens to specified format and saves to file
 */
function exportToFormat(
  format: ExportFormat, 
  outputDir: string, 
  filename?: string
): string {
  let formattedData: any;
  const outputFilename = filename || `design-tokens.${format}`;
  const outputPath = path.join(outputDir, outputFilename);
  
  // Convert data based on format
  switch (format) {
    case 'json':
      formattedData = JSON.stringify(designTokens, null, 2);
      break;
    case 'figma':
      formattedData = JSON.stringify(convertToFigmaFormat(designTokens), null, 2);
      break;
    case 'sketch':
      formattedData = JSON.stringify(convertToSketchFormat(designTokens), null, 2);
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
  
  // Ensure directory exists
  ensureDirectoryExists(outputDir);
  
  // Write data to file
  fs.writeFileSync(outputPath, formattedData);
  
  return outputPath;
}

/**
 * Main export function that handles exporting design tokens to various formats
 */
export async function exportDesignTokens(
  outputDir: string,
  formats: ExportFormat[] = ['json', 'figma', 'sketch']
): Promise<{ [key in ExportFormat]?: string }> {
  const results: { [key in ExportFormat]?: string } = {};
  
  try {
    // Process each requested format
    for (const format of formats) {
      const outputPath = exportToFormat(format, outputDir, `design-tokens.${format}`);
      results[format] = outputPath;
    }
    
    return results;
  } catch (error) {
    console.error('Error exporting design tokens:', error);
    throw error;
  }
} 