import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        demo: resolve(__dirname, 'demo.html'),
      },
      output: {
        // Add bookmarklet output
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'bookmarklet'
            ? 'bookmarklet.js'
            : 'assets/[name]-[hash].js';
        },
      },
    },
    // Add custom bookmarklet generation after build
    emptyOutDir: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        passes: 2,
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
  },
  plugins: [
    {
      name: 'generate-bookmarklet',
      closeBundle: async () => {
        try {
          // Get the source file path
          const inputPath = resolve(__dirname, 'src/extractor.js');
          const outputPath = resolve(__dirname, 'dist/bookmarklet.js');
          const readmePath = resolve(__dirname, 'README.md');

          // Read and update the minified JS
          let code = await fs.promises.readFile(inputPath, 'utf8');

          // Optionally, you could let Vite handle the minification by creating a
          // Separate entry point just for the bookmarklet

          // Create bookmarklet code
          const bookmarkletCode = `javascript:(function(){${code.replace(
            /export\s+const\s+\w+\s*=\s*/g,
            'const ',
          )}runExtractor();})()`;

          // Save to dist
          await fs.promises.writeFile(outputPath, bookmarkletCode);

          // Generate bookmarklet link URL
          const bookmarkletUrl = `javascript:${encodeURIComponent(
            bookmarkletCode,
          )}`;

          // Update README.md with bookmarklet
          let readme = await fs.promises.readFile(readmePath, 'utf8');

          // Replace bookmarklet section in README
          const bookmarkletSection = `## Bookmarklet

To use this tool, drag the link below to your bookmarks bar:

<a href="${bookmarkletUrl}">Shoplift Extractor</a>

*Note: The bookmarklet size is ${(bookmarkletUrl.length / 1024).toFixed(2)} KB*

`;

          // Replace or add bookmarklet section
          if (readme.includes('## Bookmarklet')) {
            readme = readme.replace(
              /## Bookmarklet[\s\S]*?(?=##|$)/,
              bookmarkletSection,
            );
          } else {
            readme += `\n\n${bookmarkletSection}\n`;
          }

          await fs.promises.writeFile(readmePath, readme);

          console.log('Bookmarklet generated successfully!');
          console.log(
            `Bookmarklet size: ${(bookmarkletUrl.length / 1024).toFixed(2)} KB`,
          );
        } catch (error) {
          console.error('Error generating bookmarklet:', error);
        }
      },
    },
  ],
});
