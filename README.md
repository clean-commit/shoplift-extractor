# Shoplift Tests Extractor

A utility for extracting test data from Shoplift A/B testing platform. This tool helps you capture and analyze test results by extracting structured data in JSON format.

## Features

- Extract test information (name, store, type)
- Extract test metrics (conversion rates, revenue)
- Extract performance data by device type
- Extract traffic source information
- Download all data as a structured JSON file

### How to use the bookmarklet?

1. Navigate to a Shoplift test results page
2. Click the bookmarklet in your bookmarks bar
3. The data will be downloaded as a JSON file

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

### Building

To build the project and generate the bookmarklet:

```bash
npm run build
```

This will:

- Compile and minify the code
- Generate the bookmarklet
- Update this README with the latest bookmarklet link
- Output files to the `dist` directory

### Testing the Extractor

You can test the extractor in two ways:

1. Click the "Run Extractor Script" button on the development page
2. Click the "Load Demo Page" button to load a simulated test results page
3. Use the bookmarklet on the demo page to test extraction functionality

### Project Structure

```
shoplift-tests/
├── src/                 # Source files
│   ├── extractor.js     # Main extractor logic
│   └── index.js         # Entry point
├── public/              # Static assets
├── demo/                # Demo test results page
├── dist/                # Build output (generated)
├── vite.config.js       # Vite configuration
├── package.json         # Project dependencies
└── README.md            # This file
```

## Usage

1. Navigate to a Shoplift test results page
2. Click the bookmarklet in your bookmarks bar
3. The data will be downloaded as a JSON file named `shoplift-test-[test-name]-[date].json`

## Data Format

The extracted data is structured as follows:

```json
{
  "storeName": "Store Name",
  "testName": "Test Name",
  "testType": "Conversion Rate Optimization",
  "testOverview": {
    "status": "Completed",
    "date_created": "Jan 1, 2023",
    "duration": "30 days"
  },
  "metrics": {
    "all_devices": {
      "visitors": { "original": "1000", "variant": "1000", "change": "0%" },
      "conversion_rate": {
        "original": "2.5%",
        "variant": "3.2%",
        "change": "+28%"
      }
    }
  },
  "traffic": {
    "sources": {},
    "devices": {}
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
