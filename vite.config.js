import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import { minify } from 'terser';

// Get version from package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const version = packageJson.version || '1.2.0';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    // Don't clean the output directory since we're managing files manually
    emptyOutDir: true,
  },
  plugins: [
    {
      name: 'bookmarklet-builder',
      // This executes instead of the normal build
      buildStart() {
        // Skip normal build process by providing empty input
        return [];
      },
      // This runs after Vite's build process (which won't do much with empty input)
      closeBundle: async () => {
        try {
          console.log('Building bookmarklet...');

          // Read the extractor.js file (same as in build.js)
          const filePath = resolve('./src/extractor.js');
          const sourceCode = await fs.promises.readFile(filePath, 'utf8');

          // Minify the code using the same options as build.js
          const minifyOptions = {
            compress: {
              drop_console: false,
              passes: 2,
            },
            mangle: true,
            output: {
              comments: false,
            },
          };

          const minified = await minify(sourceCode, minifyOptions);
          if (!minified || !minified.code) {
            throw new Error('Minification failed');
          }

          // Create the bookmarklet URL (javascript: prefix + URL encoded code)
          const bookmarklet = `javascript:${encodeURIComponent(minified.code)}`;

          // Check and log bookmarklet size
          const sizeKB = (bookmarklet.length / 1024).toFixed(2);
          console.log(`Bookmarklet size: ${sizeKB} KB`);

          // Ensure dist directory exists
          const distDir = resolve('./dist');
          if (!fs.existsSync(distDir)) {
            fs.mkdirSync(distDir, { recursive: true });
          }

          // Generate the HTML file (same as build.js but saved as index.html)
          const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Shoplift Data Extractor Bookmarklet</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .bookmarklet { display: inline-block; padding: 10px 15px; background: #6d28d9; color: white; 
                  text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .instructions { line-height: 1.6; }
    pre { background: #f5f5f5; padding: 15px; overflow: auto; }
    .warning { color: #e53e3e; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Shoplift Data Extractor Bookmarklet ${version}</h1>
  <div class="instructions">
    <p>Drag this link to your bookmarks bar:</p>
    <a class="bookmarklet" href="${bookmarklet}">Shoplift Extractor</a>
    
    <h2>Instructions</h2>
    <ol>
      <li>Drag the above link to your browser's bookmarks bar</li>
      <li>Navigate to a Shoplift test results page</li>
      <li>Click the bookmarklet to extract test data</li>
      <li>The data will be downloaded as a JSON file</li>
    </ol>
    
    ${
      bookmarklet.length > 10000
        ? '<p class="warning">Note: This bookmarklet is large and may not work in all browsers.</p>'
        : ''
    }
    
    <h2>Bookmarklet Size</h2>
    <p>${sizeKB} KB</p>
  </div>
</body>
</html>
          `;

          // Save as index.html in dist folder
          await fs.promises.writeFile(
            resolve(distDir, 'index.html'),
            htmlContent,
          );

          console.log(
            'Bookmarklet build complete! Output saved to dist/index.html',
          );
        } catch (error) {
          console.error('Error building bookmarklet:', error);
          throw error;
        }
      },
    },
  ],
});
