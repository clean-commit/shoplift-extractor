import fs from 'fs';
import path from 'path';
import { minify } from 'terser';

async function buildBookmarklet() {
  try {
    // Read the extractor.js file
    const filePath = path.resolve('./extractor.js');
    const sourceCode = fs.readFileSync(filePath, 'utf8');

    // Minify the code
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

    // URL encode the code
    let bookmarklet = `javascript:${encodeURIComponent(minified.code)}`;

    // Check if bookmarklet is too large
    const sizeKB = (bookmarklet.length / 1024).toFixed(2);
    console.log(`Bookmarklet size: ${sizeKB} KB`);

    // Save both minified and bookmarklet versions
    fs.writeFileSync(path.resolve('./extractor.min.js'), minified.code);
    fs.writeFileSync(path.resolve('./bookmarklet.txt'), bookmarklet);

    // Generate an HTML file for easy bookmarklet creation
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
      <h1>Shoplift Data Extractor Bookmarklet</h1>
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

    fs.writeFileSync(path.resolve('./bookmarklet.html'), htmlContent);

    console.log('Bookmarklet build complete!');
  } catch (error) {
    console.error('Error building bookmarklet:', error);
  }
}

buildBookmarklet();
