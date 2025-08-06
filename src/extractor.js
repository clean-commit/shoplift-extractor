javascript: (function () {
  const runExtractor = async () => {
    showStatus('Extracting Shoplift test data...');
    const isTest = window.location.href.includes('localhost');

    try {
      await ensureOverviewPage();

      try {
        await waitForElements('h4.mb-3.h-26px');
        await waitForElements('h6.mb-3.m-0.h-26px');
      } catch (err) {
        // Continue even if some elements aren't found
        console.warn('Some page elements not found:', err.message);
      }

      // Store our data object that will be populated through multiple pages
      let testData = {
        test: '',
        version: '2.0.1',
        store: null,
        store_url: null,
        configuration: {},
        overview: {},
        traffic: {},
        metrics: {},
        extractedAt: new Date().toISOString(),
      };

      // First extract data from the main page (test info, overview, etc.)
      await extractMainPageData(testData);

      // Then navigate to devices page and extract metrics, ensure all metrics are loaded and proceed
      await navigateToDevicesPage(isTest);

      showStatus('Extracting metrics and traffic information...');

      testData.metrics = extractMetrics();
      testData.traffic = extractTrafficInfo(testData.metrics);

      showStatus('Preparing download...');

      // Generate downloadable JSON
      const jsonString = JSON.stringify(testData, null, 2);
      if (isTest) {
        showStatus('Test data extracted successfully!');
        document.querySelector('#shoplift-test-data').textContent =
          JSON.stringify(testData, null, 4);
        return testData;
      }

      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `shoplift-${testData.test
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

  // Extract data from the main overview page
  const extractMainPageData = async (testData) => {
    showStatus('Extracting test information...');
    try {
      // Extract test info
      getExperimentInfo(testData);

      // Extract test config/type
      testData.configuration = getExperimentConfiguration();

      // Extract test overview data
      testData.overview = getTestOverview();

      showStatus('Test information extracted successfully!');
    } catch (err) {
      console.warn('Some page elements not found:', err.message);
    }
  };

  // Extract test name and store name
  const getExperimentInfo = (testData) => {
    let store_name = null; // Currently cannot be extracted from the page
    let store_url = null;
    let test_name = '';

    try {
      // Match store URL from the current page
      const shopMatch = window.location.href.match(/shop=([^&]+)/);
      if (shopMatch && shopMatch[1])
        store_url = decodeURIComponent(shopMatch[1]);

      test_name = document
        .querySelector('h3.headline-bold')
        ?.textContent.trim();
    } catch (error) {
      console.error('Error extracting test info:', error);
    }

    testData.store = store_name;
    testData.test = test_name;
    testData.store_url = store_url;
  };

  // Extract test goal/type/configuration
  const getExperimentConfiguration = () => {
    try {
      const details = document.querySelectorAll(
        'div.px-12px.py-3.rounded-6px.border.border-snow-300\\!.d-flex.flex-col.gap-3.overflow-hidden',
      );

      if (details.length === 0) {
        return null;
      }

      const goalData = {};
      for (const item of details) {
        const title = item.querySelector('h6');
        const readableTitle = title.textContent.trim();
        if (!readableTitle) {
          console.warn('No title found for goal item, skipping...');
          continue;
        }

        switch (readableTitle.toLowerCase()) {
          case 'details':
          case 'segment':
          case 'pages':
            const values = item.querySelectorAll('span.d-flex.gap-1.text-12px');
            values.forEach((span) => {
              const label = span
                .querySelector('span.text-snow-600')
                .textContent.trim();
              if (label) {
                goalData[label.toLowerCase().replace(' ', '_')] = span
                  .querySelector('span.text-snow-600 + span')
                  ?.textContent.trim();
              }
            });
            break;
          case 'traffic split':
            goalData['traffic split'] = `${item
              .querySelector('div.d-flex.items-center.gap-1.text-snow-500')
              .textContent.trim()
              .replace('%', '')}/${item
              .querySelector('div.d-flex.items-center.gap-1.text-blue-600')
              .textContent.trim()
              .replace('%', '')}`;
            break;
          case 'timeline':
            const i = item.querySelectorAll('div.d-flex.gap-2.flex-col.pt-3px');
            i.forEach((el) => {
              goalData[
                el
                  .querySelector('span')
                  .textContent.trim()
                  .toLowerCase()
                  .replace(' ', '_')
              ] = el.querySelector('span + span').textContent.trim();
            });
            break;
          // Ignore other types
          default:
            break;
        }
      }
      return goalData;
    } catch (error) {
      console.error('Error extracting test type:', error);
      return null;
    }
  };

  // Extract test overview (dates, status, etc.)
  const getTestOverview = () => {
    try {
      // Find test status
      const testOverview = document.querySelectorAll(
        'div.px-\\[16px\\].py-\\[24px\\].rounded-lg.relative.bg-white.px-12px.py-3.border.border-snow-300\\!.w-200px.d-flex.flex-col.items-start.justify-between.h-100\\%',
      );
      const testStatus = document.querySelectorAll(
        'div.px-\\[16px\\].py-\\[24px\\].rounded-lg.relative.bg-white.px-12px.py-3.border.border-snow-300\\!.d-flex.flex-col.justify-between.items-start',
      );
      const data = {
        trend: document
          .querySelector(
            'h4.fw-600.lh-130\\%.m-0.cursor-pointer.user-select-none',
          )
          .textContent.trim(),
      };

      for (const row of [...testOverview, ...testStatus]) {
        const label = row.querySelector('label');
        const value =
          row.querySelector('span > span') ||
          row.querySelector('span > div') ||
          row.querySelector('span');
        if (label && value) {
          data[
            label.textContent
              .trim()
              .toLowerCase()
              .replace('.', '')
              .replace(/\s+/g, '_')
          ] = value.textContent.trim().replace(/\s+/g, ' ');
        }
      }

      return data;
    } catch (error) {
      console.error('Error extracting test overview:', error);
    }
    return {};
  };

  // Extract metrics from tables in the device page
  const extractMetrics = () => {
    showStatus('Extracting device performance metrics...');
    const metrics = {};
    try {
      // Find all performance tables
      const tables = document.querySelectorAll('.performance-table');
      console.log(`Found ${tables.length} performance tables`);

      tables.forEach((table) => {
        // Check if this is a device performance table
        const headers = Array.from(table.querySelectorAll('thead th')).map(
          (th) => th.textContent.trim(),
        );

        if (!headers.includes('Device type')) {
          console.log('Not a device table, skipping...');
          return;
        }

        console.log(
          'Processing device performance table with headers:',
          headers,
        );

        // Get all device sections (tbody elements)
        const deviceSections = table.querySelectorAll('tbody');

        deviceSections.forEach((tbody) => {
          // Extract device name from the first cell
          const deviceNameCell = tbody.querySelector('th span');
          if (!deviceNameCell) return;

          const deviceNameText = deviceNameCell.textContent.trim();
          console.log(`Processing device: ${deviceNameText}`);

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
            ['clicks', 'clickthroughs'],
            ['ctr', 'clickthrough rate'],
            'added to cart',
            ['acr', 'add-to-cart rate'],
            'bounce rate',
            'orders',
            ['cvr', 'conversion rate'],
            'revenue',
            ['aov', 'average order value'],
            ['rpv', 'revenue per visitor'],
          ];

          headers.forEach((header, index) => {
            const headerText = header.toLowerCase();

            // Process each searchable metric
            for (let i = 0; i < searchable.length; i++) {
              const search = searchable[i];

              if (Array.isArray(search)) {
                if (search.some((s) => headerText.includes(s))) {
                  searchable.splice(i, 1);
                  metricPositions[search[0]] = index;
                  console.log(`Mapped ${search[0]} to column ${index}`);
                  break;
                }
              } else if (headerText.includes(search)) {
                searchable.splice(i, 1);
                metricPositions[search] = index;
                console.log(`Mapped ${search} to column ${index}`);
                break;
              }
            }
          });

          // Extract data from variant and original rows
          const rows = tbody.querySelectorAll('tr');
          let variantRow, originalRow;

          // Find variant and original rows
          rows.forEach((row) => {
            // Get text from the cells which contains variant/original info
            const cells = row.querySelectorAll('th, td');
            let cellText = '';

            for (let i = 0; i < cells.length; i++) {
              const text = cells[i].textContent.trim();
              if (text.includes('Variant') || text.includes('Original')) {
                cellText = text;
                break;
              }
            }

            if (cellText.includes('Variant')) {
              variantRow = row;
            } else if (cellText.includes('Original')) {
              originalRow = row;
            }
          });

          // Process each metric
          Object.keys(metricPositions).forEach((metric) => {
            const position = metricPositions[metric];

            // Skip if position is undefined
            if (position === undefined) return;

            metrics[deviceName][metric] = {
              original: '0',
              variant: '0',
              change: '0%',
            };

            // Extract original value
            if (originalRow) {
              const cells = originalRow.querySelectorAll('th, td');
              const cell = cells[position];

              if (cell) {
                const rawValue = cell.textContent.trim();
                metrics[deviceName][metric].original = rawValue
                  .split(' ')[0]
                  .trim();
              }
            }

            // Extract variant value and change percentage
            if (variantRow) {
              const cells = variantRow.querySelectorAll('th, td');
              const cell = cells[position];

              if (cell) {
                const rawValue = cell.textContent.trim();

                // Extract main value - before any labels
                metrics[deviceName][metric].variant = rawValue
                  .split(' ')[0]
                  .trim();

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
    showStatus('Getting traffic info for experiment...');
    try {
      const desktopVisitors =
        parseValue(metrics.desktop?.visitors?.original || '0') +
        parseValue(metrics.desktop?.visitors?.variant || '0');
      const mobileVisitors =
        parseValue(metrics.mobile?.visitors?.original || '0') +
        parseValue(metrics.mobile?.visitors?.variant || '0');
      const totalVisitors = desktopVisitors + mobileVisitors;

      return {
        total: totalVisitors,
        desktop: desktopVisitors,
        mobile: mobileVisitors,
      };
    } catch (error) {
      console.error('Error extracting traffic info:', error);
      return {
        total: 0,
        desktop: 0,
        mobile: 0,
      };
    }
  };

  const ensureOverviewPage = async (isTest = false) => {
    if (isTest) return;
    showStatus('Ensuring we are on the overview page...');
    // Check if we're on a page we want to avoid
    const currentHref = window.location.href;
    const unwantedPaths = [
      '/devices',
      '/visitors',
      '/channels',
      '/subscriptions',
    ];
    const onWrongPath = unwantedPaths.some((path) =>
      currentHref.toLowerCase().includes(path.toLowerCase()),
    );

    // Do nothing if we're already on the overview page
    if (!onWrongPath) return;

    if (onWrongPath) {
      try {
        // Find the devices tab link
        await clickNavigationLink('Overview');
        // Wait a bit for the page to stabilize
      } catch (error) {
        console.error('Error navigating to devices page:', error);
        throw new Error('Could not navigate to devices page');
      }
      return;
    }
  };

  const clickNavigationLink = async (labelText) => {
    const links = Array.from(document.querySelectorAll('.nav-link')).filter(
      (el) => {
        const label = el.querySelector('label');
        return label && label.textContent.includes(labelText);
      },
    );

    if (links.length > 0) {
      // Click the devices tab
      links[0].click();
      // Wait for devices page to load
      await wait(600);
    }
  };

  // Navigate to the devices page
  const navigateToDevicesPage = async (isTest = false) => {
    showStatus('Switching to devices view...');
    if (isTest) return;

    try {
      // Find the devices tab link
      await clickNavigationLink('Devices');
      await waitForElements('.performance-table', 10000);
      await ensureAllMetricsVisible();
    } catch (error) {
      console.error('Error navigating to devices page:', error);
      throw new Error('Could not navigate to devices page');
    }
  };

  const ensureAllMetricsVisible = async () => {
    const buttons = document.querySelectorAll(
      `.dropdown-item.d-flex.items-center.gap-8px.gap-8px`,
    );
    const allMetricsButtons = [...buttons].filter((b) =>
      b.innerText.toLowerCase().includes('all metrics'),
    );
    [...allMetricsButtons].forEach((el) => el.click());

    // Wait a bit for the dropdown to close and metrics to load
    await wait(500);
  };

  // Show extraction status to user
  const showStatus = (msg, isError = false) => {
    console.log('### STATUS: ', msg);
    const statusDiv = document.createElement('div');
    statusDiv.id = 'extractor-status';
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

    if (document.querySelector('#extractor-status')) {
      document.querySelector('#extractor-status').remove();
    }
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

  const wait = async (ms = 500) => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  };

  const parseValue = (value) => {
    // Remove any currency symbols, commas, and % signs
    if (!value) return 0;
    return parseFloat(value.replaceAll(/[$,€£%]/g, ''));
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
