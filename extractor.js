javascript: (function () {
  const runExtractor = async (isTest = false) => {
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
      const storeElements = document.querySelectorAll(
        'h5.headline-bold.mb-32px',
      );
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
  const extractMetrics = () => {
    const metrics = {};
    try {
      // Find all performance tables
      const tables = document.querySelectorAll('.performance-table');

      tables.forEach((table) => {
        // Check if this is a device performance table
        const headers = Array.from(table.querySelectorAll('thead th')).map(
          (th) => th.textContent.trim(),
        );

        if (!headers.includes('Device')) return;

        // Get all device sections (tbody elements)
        const deviceSections = table.querySelectorAll('tbody');

        deviceSections.forEach((tbody) => {
          // Extract device name from the first cell
          const deviceNameCell = tbody.querySelector('th span');
          if (!deviceNameCell) return;

          const deviceNameText = deviceNameCell.textContent.trim();

          const deviceName = deviceNameText
            .toLowerCase()
            .replace(/all devices/i, 'all_devices')
            .replace(/\s+/g, '_');

          // Initialize device metrics structure
          metrics[deviceName] = {};

          // Map metrics to their column positions
          const metricPositions = {};
          let searchable = [
            'visitors',
            'clicks',
            ['ctr', 'clickthrough rate'],
            'cart adds',
            ['acr', 'add to cart rate'],
            'bounce rate',
            'orders',
            ['cvr', 'conversion rate'],
            'revenue',
            ['aov', 'average order value'],
            ['rpv', 'revenue per visitor'],
          ];
          headers.forEach((header, index) => {
            const headerText = header.toLowerCase();
            searchable.forEach((search, i) => {
              if (Array.isArray(search)) {
                if (search.some((s) => headerText.includes(s))) {
                  searchable.splice(i, 1);
                  metricPositions[search[0]] = index;
                  return;
                }
              } else {
                if (headerText.includes(search)) {
                  searchable.splice(i, 1);
                  metricPositions[search] = index;
                  return;
                }
              }
            });
          });

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

            if (cellText.includes('Variant')) {
              variantRow = row;
            } else if (cellText.includes('Original')) {
              originalRow = row;
            }
          });

          // Process each metric
          Object.keys(metricPositions).forEach((metric) => {
            // Don't subtract 1 - we use the actual index that matches the header
            const position = metricPositions[metric];

            // Skip if position is undefined
            if (position === undefined) return;

            metrics[deviceName][metric] = {
              original: '0',
              variant: '0',
              change: '0%',
            };

            // Extract original value - adjust for th cells
            if (originalRow) {
              const cells = originalRow.querySelectorAll('th, td');
              // The +1 because the first cell is the empty th, then variant name, then data
              const cell = cells[position];

              if (cell) {
                const rawValue = cell.textContent.trim();
                metrics[deviceName][metric].original = rawValue.split(' ')[0];
              }
            }

            // Extract variant value and change percentage
            if (variantRow) {
              const cells = variantRow.querySelectorAll('th, td');
              const cell = cells[position];

              if (cell) {
                const rawValue = cell.textContent.trim();

                // Extract main value - before any labels
                metrics[deviceName][metric].variant = rawValue.split(' ')[0];

                // Extract change label if present
                const changeLabel = cell.querySelector('.label-tint');
                if (changeLabel) {
                  metrics[deviceName][metric].change =
                    changeLabel.textContent.trim();
                } else {
                  const originalValue = metrics[deviceName][metric].original;
                  const variantValue = metrics[deviceName][metric].variant;

                  // Only calculate if we have valid values
                  if (originalValue && variantValue) {
                    metrics[deviceName][metric].change = calculateChange(
                      originalValue,
                      variantValue,
                    );
                  }
                }
              }
            }
          });
        });
      });
    } catch (error) {
      console.error('Error extracting metrics:', error);
    }

    return metrics;
  };

  const extractTrafficInfo = (metrics) => {
    const desktopVisitors =
      parseValue(metrics.desktop.visitors.original) +
      parseValue(metrics.desktop.visitors.variant);
    const mobileVisitors =
      parseValue(metrics.mobile.visitors.original) +
      parseValue(metrics.mobile.visitors.variant);
    const totalVisitors = desktopVisitors + mobileVisitors;

    return {
      total: totalVisitors,
      desktop: desktopVisitors,
      mobile: mobileVisitors,
    };
  };

  const parseValue = (value) => {
    // Remove any currency symbols, commas, and % signs
    if (!value) return 0;
    return parseFloat(value.replace(/[$,€£%]/g, ''));
  };

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
  runExtractor();
})();
