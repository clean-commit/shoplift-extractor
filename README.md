# Shoplift Tests Extractor

A utility for extracting test data from Shoplift A/B testing platform. This tool helps you capture and analyze test results by extracting structured data in JSON format.

## How to use the bookmarklet?

1. Visit [Shoplift Extractor website](https://shoplift-extractor.netlify.app/) and drag the button to your bookmarks
2. Navigate to a Shoplift test results page
3. Click the bookmarklet in your bookmarks bar
4. The data will be downloaded as a JSON file, that's it!

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
├── markup/              # Extracted markup for dashboard versions
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
  "test": "Experiment name",
  "version": "2.0.1",
  "store": null,
  "store_url": "store.myshopify.com",
  "configuration": {
    "test_type": "Theme",
    "goal": "Conversion rate",
    "traffic split": "50/50",
    "devices": "All devices",
    "visitors": "New and returning",
    "audiences": "All audiences",
    "test_started": "April 17, 2025 at 4:34 PM",
    "test_ended": "May 12, 2025 at 12:17 PM"
  },
  "overview": {
    "trend": "Significance unlikely",
    "tested_visitors": "26208",
    "test_duration": "24 days 19 hours",
    "lift": "+3.6%",
    "win_chance_(b)": "70.3%",
    "time_to_significance": "-- days"
  },
  "traffic": {
    "total": 26208,
    "desktop": 3636,
    "mobile": 22572
  },
  "metrics": {
    "all_devices": {
      "visitors": {
        "original": "13,211",
        "variant": "12,997",
        "change": "-1.6%"
      },
      "clicks": {
        "original": "7,137",
        "variant": "7,130",
        "change": "-0.1%"
      },
      "ctr": {
        "original": "54.02%",
        "variant": "54.86%",
        "change": "+1.5%"
      },
      "bounce rate": {
        "original": "45.98%",
        "variant": "45.14%",
        "change": "-1.8%"
      },
      "added to cart": {
        "original": "1,641",
        "variant": "1,677",
        "change": "+2.2%"
      },
      "acr": {
        "original": "12.42%",
        "variant": "12.90%",
        "change": "+3.9%"
      },
      "orders": {
        "original": "563",
        "variant": "574",
        "change": "+2.0%"
      },
      "cvr": {
        "original": "4.26%",
        "variant": "4.42%",
        "change": "+3.6%"
      },
      "revenue": {
        "original": "$54,443.42",
        "variant": "$54,981.57",
        "change": "+1.0%"
      },
      "aov": {
        "original": "$96.70",
        "variant": "$95.79",
        "change": "-0.9%"
      },
      "rpv": {
        "original": "$4.12",
        "variant": "$4.23",
        "change": "+2.7%"
      }
    },
    "mobile": {
      "visitors": {
        "original": "11,413",
        "variant": "11,159",
        "change": "-2.2%"
      },
      "clicks": {
        "original": "6,503",
        "variant": "6,510",
        "change": "+0.1%"
      },
      "ctr": {
        "original": "56.98%",
        "variant": "58.34%",
        "change": "+2.4%"
      },
      "bounce rate": {
        "original": "43.02%",
        "variant": "41.66%",
        "change": "-3.2%"
      },
      "added to cart": {
        "original": "1,453",
        "variant": "1,479",
        "change": "+1.8%"
      },
      "acr": {
        "original": "12.73%",
        "variant": "13.25%",
        "change": "+4.1%"
      },
      "orders": {
        "original": "480",
        "variant": "484",
        "change": "+0.8%"
      },
      "cvr": {
        "original": "4.21%",
        "variant": "4.34%",
        "change": "+3.1%"
      },
      "revenue": {
        "original": "$40,776.15",
        "variant": "$41,790.32",
        "change": "+2.5%"
      },
      "aov": {
        "original": "$84.95",
        "variant": "$86.34",
        "change": "+1.6%"
      },
      "rpv": {
        "original": "$3.57",
        "variant": "$3.74",
        "change": "+4.8%"
      }
    },
    "desktop": {
      "visitors": {
        "original": "1,798",
        "variant": "1,838",
        "change": "+2.2%"
      },
      "clicks": {
        "original": "634",
        "variant": "620",
        "change": "-2.2%"
      },
      "ctr": {
        "original": "35.26%",
        "variant": "33.73%",
        "change": "-4.3%"
      },
      "bounce rate": {
        "original": "64.74%",
        "variant": "66.27%",
        "change": "+2.4%"
      },
      "added to cart": {
        "original": "188",
        "variant": "198",
        "change": "+5.3%"
      },
      "acr": {
        "original": "10.46%",
        "variant": "10.77%",
        "change": "+3.0%"
      },
      "orders": {
        "original": "83",
        "variant": "90",
        "change": "+8.4%"
      },
      "cvr": {
        "original": "4.62%",
        "variant": "4.90%",
        "change": "+6.1%"
      },
      "revenue": {
        "original": "$13,667.27",
        "variant": "$13,191.25",
        "change": "-3.5%"
      },
      "aov": {
        "original": "$164.67",
        "variant": "$146.57",
        "change": "-11.0%"
      },
      "rpv": {
        "original": "$7.60",
        "variant": "$7.18",
        "change": "-5.6%"
      }
    }
  },
  "extractedAt": "2025-06-18T08:38:41.856Z"
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
