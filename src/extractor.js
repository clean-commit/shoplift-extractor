/**
 * Shoplift Tests Extractor
 * A utility module for extracting test data from Shoplift test results pages
 */

// Main extraction function to be exported
export const runExtractor = async (isTest = false) => {
  showStatus('Extracting Shoplift test data...');

  try {
    // Wait for key elements to be loaded (with shorter timeout for test environment)
    const timeout = isTest ? 3000 : 10000;
    try {
      await waitForElements('.headline-bold', timeout);
      await waitForElements('.test-report-variant-card-stats', timeout);
    } catch (err) {
      // Continue even if some elements aren't found
      console.warn('Some page elements not found:', err.message);
    }

    // Add a little delay to ensure page is fully rendered
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Make sure all items are visible
    const buttons = document.querySelectorAll(
      `.dropdown-item.d-flex.items-center.gap-8px.gap-8px`,
    );
    const allMetricsButtons = [...buttons].filter((b) =>
      b.innerText.toLowerCase().includes('all metrics'),
    );
    [...allMetricsButtons].forEach((el) => el.click());

    // Extract all data
    const testInfo = getTestInfo();
    const testType = getTestType();
    const testOverview = getTestOverview();
    const metrics = extractMetrics();
    const trafficInfo = extractTrafficInfo(metrics);

    // Compile into final JSON structure
    const testData = {
      store: testInfo.store_name,
      test: testInfo.test_name,
      configuration: testType,
      overview: testOverview,
      traffic: trafficInfo,
      metrics: metrics,
      extractedAt: new Date().toISOString(),
    };

    // Generate downloadable JSON
    const jsonString = JSON.stringify(testData, null, 2);
    if (document.querySelector('#shoplift-test-data')) {
      document.querySelector('#shoplift-test-data').textContent =
        JSON.stringify(testData, null, 4);
      return testData; // Return data for testing purposes
    }
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `shoplift-${testInfo.test
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    showStatus('Test data extracted successfully!');

    return testData; // Return data for testing purposes
  } catch (error) {
    console.error('Error extracting test data:', error);
    showStatus(`Error extracting test data: ${error.message}`, true);
    throw error;
  }
};

// Show extraction status to user
const showStatus = (msg, isError = false) => {
  const statusDiv = document.createElement('div');
  statusDiv.style.position = 'fixed';
  statusDiv.style.top = '10px';
  statusDiv.style.left = '50%';
  statusDiv.style.transform = 'translateX(-50%)';
  statusDiv.style.background = isError ? '#f44336' : '#6d28d9';
  statusDiv.style.color = 'white';
  statusDiv.style.padding = '10px 20px';
  statusDiv.style.borderRadius = '5px';
  statusDiv.style.zIndex = '9999';
  statusDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  statusDiv.textContent = msg;
  document.body.appendChild(statusDiv);

  setTimeout(
    () => {
      statusDiv.remove();
    },
    isError ? 5000 : 3000,
  );
};

// Check if elements are loaded and ready for extraction
const waitForElements = (selector, timeout = 5000, interval = 200) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkElements = () => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        resolve(elements);
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error(`Elements not found: ${selector}`));
        return;
      }

      setTimeout(checkElements, interval);
    };

    checkElements();
  });
};

// Extract test name and store name
const getTestInfo = () => {
  let store_name = '';
  let test_name = '';

  try {
    // Try to get store name from breadcrumbs or navigation
    const storeElements = document.querySelectorAll('h5.headline-bold.mb-32px');
    store_name = storeElements[0]?.textContent.trim();

    if (!store_name) {
      const storeMatch = window.location.href.match(/store\/([^\/]+)/);
      if (storeMatch && storeMatch[1]) {
        store_name = decodeURIComponent(storeMatch[1]);
      }
    }

    // Find test name in headings
    const testHeadings = document.querySelectorAll('h2');
    for (const heading of testHeadings) {
      const text = heading.textContent.trim();
      if (
        text &&
        !text.includes('Performance overview') &&
        !text.includes('Traffic overview') &&
        !text.includes('Device performance')
      ) {
        test_name = text;
        break;
      }
    }
  } catch (error) {
    console.error('Error extracting test info:', error);
  }

  return {
    store_name: store_name || 'Unknown Store',
    test_name: test_name || 'Unknown Test',
  };
};

// Extract test goal/type
const getTestType = () => {
  try {
    const goalLabels = document.querySelectorAll(
      'div.d-flex.rounded-4px.items-center.p-16px.mt-8px div',
    );

    if (goalLabels.length === 0) {
      return 'Unknown Goal';
    }

    const goalData = {};
    for (const label of goalLabels) {
      const labels = label.querySelectorAll('label');
      goalData[labels[0].textContent.trim().toLowerCase().replace(':', '')] =
        labels[1].textContent.trim();
    }
    console.log(goalData);
    return goalData;
  } catch (error) {
    console.error('Error extracting test type:', error);
    return 'Unknown Goal';
  }
};

// Extract test overview (dates, status, etc.)
const getTestOverview = () => {
  try {
    // Find test status
    const testOverview = document.querySelectorAll(
      '.test-report-overview-row > div',
    );
    console.log(testOverview);
    const data = {};

    for (const row of testOverview) {
      const label = row.querySelector('label');
      const value = row.querySelector('div');
      data[
        label.textContent
          .trim()
          .toLowerCase()
          .replace('.', '')
          .replace(/\s+/g, '_')
      ] = value.textContent.trim().replace(/\s+/g, ' ');
    }

    return data;
  } catch (error) {
    console.error('Error extracting test overview:', error);
  }

  return {};
};

// Extract metrics from tables
// const extractMetrics = () => {
//   const metrics = {
//     all_devices: {
//       visitors: {
//         original: 0,
//         variant: 0,
//         change: 0,
//       },
//       clicks: {
//         original: 0,
//         variant: 0,
//         change: 0,
//       },
//     },
//   };

//   try {
//     const metrics = document.querySelectorAll('.performance-table');
//   } catch (error) {
//     console.error('Error extracting metrics:', error);
//   }

//   return metrics;
// };

// Extract metrics from tables
// Extract metrics from tables
const extractMetrics = () => {
  const metrics = {};

  try {
    // Helper function to parse numeric values from various formats
    const parseValue = (value) => {
      if (!value) return 0;
      // Remove any currency symbols, commas, and % signs
      return parseFloat(value.replace(/[$,€£%]/g, ''));
    };

    // Helper function to calculate percentage change
    const calculateChange = (original, variant) => {
      const originalValue = parseValue(original);
      const variantValue = parseValue(variant);

      // Handle division by zero case
      if (originalValue === 0) {
        return variantValue > 0 ? '+100%' : '0%';
      }

      const change = ((variantValue - originalValue) / originalValue) * 100;
      // Format to 1 decimal place with + or - prefix
      const sign = change > 0 ? '+' : '';
      return `${sign}${change.toFixed(1)}%`;
    };

    // Find all performance tables
    const tables = document.querySelectorAll('.performance-table');

    // Debug
    console.log(`Found ${tables.length} performance tables`);

    tables.forEach((table) => {
      // Check if this is a device performance table
      const headers = Array.from(table.querySelectorAll('thead th')).map((th) =>
        th.textContent.trim(),
      );

      console.log('Table headers:', headers);

      if (!headers.includes('Device')) return;
      console.log('Processing device performance table');

      // Get all device sections (tbody elements)
      const deviceSections = table.querySelectorAll('tbody');
      console.log(`Found ${deviceSections.length} device sections`);

      deviceSections.forEach((tbody) => {
        // Extract device name from the first cell
        const deviceNameCell = tbody.querySelector('th span');
        if (!deviceNameCell) return;

        const deviceNameText = deviceNameCell.textContent.trim();
        console.log('Found device section:', deviceNameText);

        const deviceName = deviceNameText
          .toLowerCase()
          .replace(/all devices/i, 'all_devices')
          .replace(/\s+/g, '_');

        // Initialize device metrics structure
        metrics[deviceName] = {};

        // Map metrics to their column positions
        const metricPositions = {};
        headers.forEach((header, index) => {
          const headerText = header.toLowerCase();
          if (headerText.includes('visitors'))
            metricPositions['visitors'] = index;
          if (headerText.includes('clicks')) metricPositions['clicks'] = index;
          if (headerText === 'ctr' || headerText.includes('clickthrough rate'))
            metricPositions['ctr'] = index;
          if (headerText.includes('cart adds'))
            metricPositions['cart_adds'] = index;
          if (headerText === 'acr' || headerText.includes('add to cart rate'))
            metricPositions['acr'] = index;
          if (headerText.includes('bounce'))
            metricPositions['bounce_rate'] = index;
          if (headerText.includes('orders')) metricPositions['orders'] = index;
          if (headerText === 'cvr' || headerText.includes('conversion rate'))
            metricPositions['cvr'] = index;
          if (headerText.includes('revenue') && !headerText.includes('per'))
            metricPositions['revenue'] = index;
          if (
            headerText === 'aov' ||
            headerText.includes('average order value')
          )
            metricPositions['aov'] = index;
          if (
            headerText === 'rpv' ||
            headerText.includes('revenue per visitor')
          )
            metricPositions['rpv'] = index;
        });

        console.log('Metric positions:', metricPositions);

        // Extract data from variant and original rows
        const rows = tbody.querySelectorAll('tr');
        let variantRow, originalRow;

        // Find variant and original rows
        rows.forEach((row) => {
          // Get text from the second th cell which contains variant/original info
          const variantCell =
            row.querySelector('th:nth-child(2)') || row.querySelector('th');

          if (!variantCell) return;

          const cellText = variantCell.textContent.trim();
          console.log('Row type cell text:', cellText);

          if (cellText.includes('Variant')) {
            variantRow = row;
            console.log('Found variant row');
          } else if (cellText.includes('Original')) {
            originalRow = row;
            console.log('Found original row');
          }
        });

        // Process each metric
        Object.keys(metricPositions).forEach((metric) => {
          // Don't subtract 1 - we use the actual index that matches the header
          const position = metricPositions[metric];

          // Skip if position is undefined
          if (position === undefined) return;

          console.log(`Processing metric ${metric} at position ${position}`);

          metrics[deviceName][metric] = {
            original: '0',
            variant: '0',
            change: '0%',
          };

          // Extract original value - adjust for th cells
          if (originalRow) {
            // Use the correct selector to get all cells including th
            const cells = originalRow.querySelectorAll('th, td');
            // The +1 because the first cell is the empty th, then variant name, then data
            const cell = cells[position];

            if (cell) {
              const rawValue = cell.textContent.trim();
              console.log(`Original ${metric} raw value:`, rawValue);
              // Handle numbers and percentages differently
              metrics[deviceName][metric].original = rawValue.split(' ')[0];
            }
          }

          // Extract variant value and change percentage
          if (variantRow) {
            // Use the correct selector to get all cells including th
            const cells = variantRow.querySelectorAll('th, td');
            // The +1 because the first cell is the empty th, then variant name, then data
            const cell = cells[position];

            if (cell) {
              const rawValue = cell.textContent.trim();
              console.log(`Variant ${metric} raw value:`, rawValue);

              // Extract main value - before any labels
              metrics[deviceName][metric].variant = rawValue.split(' ')[0];

              // Extract change label if present
              const changeLabel = cell.querySelector('.label-tint');
              if (changeLabel) {
                metrics[deviceName][metric].change =
                  changeLabel.textContent.trim();
                console.log(
                  `Change for ${metric}:`,
                  metrics[deviceName][metric].change,
                );
              } else {
                // Calculate change if no label is present
                const originalValue = metrics[deviceName][metric].original;
                const variantValue = metrics[deviceName][metric].variant;

                // Only calculate if we have valid values
                if (originalValue && variantValue) {
                  metrics[deviceName][metric].change = calculateChange(
                    originalValue,
                    variantValue,
                  );
                  console.log(
                    `Calculated change for ${metric}:`,
                    metrics[deviceName][metric].change,
                  );
                }
              }
            }
          }
        });
      });
    });

    console.log('Final metrics object:', metrics);
  } catch (error) {
    console.error('Error extracting metrics:', error);
  }

  return metrics;
};

// Extract traffic information from charts/tables
const extractTrafficInfo = () => {
  const trafficInfo = {
    sources: {},
    devices: {},
  };

  try {
    // Device distribution
    // Look for pie charts or device distribution tables
    const trafficSection = document.querySelector('h4.headline-bold + .d-flex');
    if (trafficSection) {
      // Extract data from tooltips or visible data points
      const deviceTooltips = document.querySelectorAll('.w-170px');
      deviceTooltips.forEach((deviceTooltip) => {
        const deviceRows = deviceTooltip.querySelectorAll(
          '.flex.justify-between',
        );
        deviceRows.forEach((row) => {
          const deviceName = row
            .querySelector('.flex.gap-4px')
            ?.textContent.trim();
          const percentage = row
            .querySelector('.label-black')
            ?.textContent.trim();
          if (deviceName && percentage) {
            trafficInfo.devices[deviceName] = percentage;
          }
        });
      });
    }

    // Look for traffic source data in tables - scan all tables
    // Find a table that has channel/source information
    const channelTables = document.querySelectorAll('.performance-table');
    channelTables.forEach((table) => {
      // Look for tables with "Channel" or traffic source headers
      const headers = Array.from(table.querySelectorAll('th')).map((th) =>
        th.textContent.trim().toLowerCase(),
      );

      const isChannelTable = headers.some(
        (h) =>
          h.includes('channel') ||
          h.includes('source') ||
          h.includes('traffic'),
      );

      if (isChannelTable || headers.length > 0) {
        // Process each tbody as a potential traffic source
        const channelRows = table.querySelectorAll('tbody');

        channelRows.forEach((tbody) => {
          const rows = tbody.querySelectorAll('tr');

          // Try to identify channel name from first row
          const firstRow = rows[0];
          if (!firstRow) return;

          const sourceName = firstRow
            .querySelector('th span')
            ?.textContent.trim();
          if (!sourceName || sourceName.includes('All channels')) return;

          // Extract metrics for this traffic source
          const sourceMetrics = {};
          const cells = firstRow.querySelectorAll('td');

          // Map common metrics by position
          if (cells.length >= 1)
            sourceMetrics.visitors = cells[0]?.textContent.trim() || '0';
          if (cells.length >= 3)
            sourceMetrics.conversionRate =
              cells[2]?.textContent.trim().split(' ')[0] || '0%';
          if (cells.length >= 4)
            sourceMetrics.revenue =
              cells[3]?.textContent.trim().split(' ')[0] || '$0';

          trafficInfo.sources[sourceName] = sourceMetrics;

          // Check other rows for more detailed metrics
          if (rows.length > 1) {
            const variantData = {};
            const originalData = {};

            rows.forEach((row) => {
              const rowTitle = row.querySelector('th')?.textContent.trim();
              if (rowTitle && rowTitle.includes('Variant')) {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 1)
                  variantData.visitors = cells[0]?.textContent.trim() || '0';
                if (cells.length >= 3)
                  variantData.conversionRate =
                    cells[2]?.textContent.trim().split(' ')[0] || '0%';
              } else if (rowTitle && rowTitle.includes('Original')) {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 1)
                  originalData.visitors = cells[0]?.textContent.trim() || '0';
                if (cells.length >= 3)
                  originalData.conversionRate =
                    cells[2]?.textContent.trim().split(' ')[0] || '0%';
              }
            });

            if (Object.keys(originalData).length > 0) {
              trafficInfo.sources[sourceName].original = originalData;
            }
            if (Object.keys(variantData).length > 0) {
              trafficInfo.sources[sourceName].variant = variantData;
            }
          }
        });
      }
    });
  } catch (error) {
    console.error('Error extracting traffic info:', error);
  }

  return trafficInfo;
};
