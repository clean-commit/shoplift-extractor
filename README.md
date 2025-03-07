# Shoplift Tests Extractor

A utility for extracting test data from Shoplift A/B testing platform.

## Features

- Extract test information (name, store, type)
- Extract test metrics (conversion rates, revenue)
- Extract performance data by device type
- Extract traffic source information
- Download all data as a structured JSON file

## Development

### Prerequisites

- Node.js (v14 or newer)

### Setup

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The development server will start at http://localhost:3000.

### Testing the Extractor

You can test the extractor in two ways:

1. Click the "Run Extractor Script" button on the index page
2. Click the "Load Demo Page" button to load a simulated test results page

### Building the Bookmarklet

```bash
npm run bookmarklet
```

This will generate:

- `extractor.min.js` - The minified extractor script
- `bookmarklet.txt` - The bookmarklet link code
- `bookmarklet.html` - An HTML page for easy bookmarklet installation

## Usage

1. Drag the bookmarklet link to your browser's bookmarks bar
2. Navigate to a Shoplift test results page
3. Click the bookmarklet to extract test data
4. The data will be downloaded as a JSON file

## License

MIT
