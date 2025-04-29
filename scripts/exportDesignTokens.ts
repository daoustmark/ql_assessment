import { exportDesignTokens } from '../src/lib/designExporter';

/**
 * Script to export design tokens for use in design tools
 * 
 * Usage:
 * npm run export-design-tokens
 */

async function run() {
  try {
    console.log('Exporting design tokens...');
    
    await exportDesignTokens({
      outputDir: './design-exports',
      formats: ['json', 'figma', 'sketch']
    });
    
    console.log('✅ Export completed successfully!');
    console.log('Design tokens can be found in the design-exports directory.');
    console.log('');
    console.log('Usage instructions:');
    console.log('- Figma: Import figma-variables.json via the Variables panel');
    console.log('- Sketch: Import sketch-document.json via File > Open');
    console.log('- JSON: Use design-tokens.json for reference or custom integrations');
  } catch (error) {
    console.error('❌ Error exporting design tokens:', error);
    process.exit(1);
  }
}

run(); 