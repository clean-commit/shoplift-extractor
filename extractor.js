javascript: (function () {
  const extractorScript = document.createElement('script');
  extractorScript.textContent = `
    (function() {
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

        setTimeout(() => {
          statusDiv.remove();
        }, isError ? 5000 : 3000);
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
              reject(new Error(\`Elements not found: \${selector}\`));
              return;
            }
            
            setTimeout(checkElements, interval);
          };
          
          checkElements();
        });
      };

      // Extract test name and store name
      const getTestInfo = () => {
        let storeName = '';
        let testName = '';
        
        try {
          // Try to get store name from breadcrumbs or navigation
          const storeElements = document.querySelectorAll('.navbar-brand, h5.headline-bold');
          for (const el of storeElements) {
            const text = el.textContent.trim();
            if (text && !text.includes('debut-customized') && !text.includes('overland-addict')) {
              storeName = text;
              break;
            }
          }
          
          // Get store from URL if not found in DOM
          if (!storeName) {
            const storeMatch = window.location.href.match(/store\\/([^\\/]+)/);
            if (storeMatch && storeMatch[1]) {
              storeName = decodeURIComponent(storeMatch[1]);
            }
          }
          
          // Find test name in headings
          const testHeadings = document.querySelectorAll('h1, h2, h3, h4');
          for (const heading of testHeadings) {
            const text = heading.textContent.trim();
            if (text && !text.includes('Performance overview') && 
                !text.includes('Traffic overview') && 
                !text.includes('Device performance')) {
              testName = text;
              break;
            }
          }
        } catch (error) {
          console.error('Error extracting test info:', error);
        }

        return {
          storeName: storeName || 'Unknown Store',
          testName: testName || 'Unknown Test'
        };
      };

      // Extract test goal/type
      const getTestType = () => {
        try {
          const goalLabels = document.querySelectorAll('.label-blue.label-outline');
          for (const label of goalLabels) {
            if (label.textContent.includes('GOAL')) {
              // Look for nearby text to determine goal type
              const metrics = document.querySelectorAll('[data-bs-original-title]');
              for (const metric of metrics) {
                if (metric.getAttribute('data-bs-original-title')?.includes('Conversion')) {
                  return 'Conversion Rate Optimization';
                }
                if (metric.getAttribute('data-bs-original-title')?.includes('Revenue')) {
                  return 'Revenue Optimization';
                }
                if (metric.getAttribute('data-bs-original-title')?.includes('Average order')) {
                  return 'Average Order Value Optimization';
                }
              }
              return 'Conversion Rate Optimization'; // Default if specific type not found
            }
          }
          return 'Unknown Goal';
        } catch (error) {
          console.error('Error extracting test type:', error);
          return 'Unknown Goal';
        }
      };

      // Extract test overview (dates, status, etc.)
      const getTestOverview = () => {
        const overview = {
          status: 'Unknown',
          dateCreated: '',
          dateRange: '',
          duration: ''
        };

        try {
          // Find test status
          const statusLabels = document.querySelectorAll('.label-emerald, .label-blue, .label-red');
          for (const label of statusLabels) {
            const text = label.textContent.trim();
            if (text.includes('Live') || text.includes('Active') || text.includes('Completed') || text.includes('Draft')) {
              overview.status = text;
              break;
            }
          }

          // Find date created
          const dateLabels = document.querySelectorAll('label');
          for (const label of dateLabels) {
            const text = label.textContent.trim();
            if (text.includes('Date created:')) {
              overview.dateCreated = text.replace('Date created:', '').trim();
              break;
            }
          }
        } catch (error) {
          console.error('Error extracting test overview:', error);
        }

        return overview;
      };

      // Extract metrics from tables
      const extractMetrics = () => {
        const metrics = {
          overall: {},
          byDevice: {},
          byVisitorType: {}
        };

        try {
          // Extract main metrics from performance tables
          const tables = document.querySelectorAll('.performance-table');
          
          tables.forEach(table => {
            // First, identify the type of table by examining its headers
            const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
            const isDeviceTable = headers.includes('Device');
            const isVisitorTable = headers[0]?.includes('Visitors') || headers[0]?.includes('visitor');
            
            if (isDeviceTable) {
              // Map column headers to their indices for more reliable data extraction
              const headerMap = {};
              table.querySelectorAll('thead th').forEach((th, index) => {
                const headerText = th.textContent.trim().toLowerCase();
                
                // Handle special cases with data attributes
                if (th.querySelector('[data-bs-original-title="Conversion rate"]')) {
                  headerMap['cvr'] = index;
                } else if (th.querySelector('[data-bs-original-title="Average order value"]')) {
                  headerMap['aov'] = index;
                } else if (th.querySelector('[data-bs-original-title="Revenue per visitor"]')) {
                  headerMap['rpv'] = index;
                } else if (th.querySelector('[data-bs-original-title="Add to cart rate"]')) {
                  headerMap['acr'] = index;
                } else if (th.querySelector('[data-bs-original-title="Clickthrough rate"]')) {
                  headerMap['ctr'] = index;
                } else if (headerText.includes('device')) {
                  headerMap['device'] = index;
                } else if (headerText.includes('variant')) {
                  headerMap['variant'] = index;
                } else if (headerText.includes('visitors')) {
                  headerMap['visitors'] = index;
                } else if (headerText.includes('clicks')) {
                  headerMap['clicks'] = index;
                } else if (headerText.includes('cart adds')) {
                  headerMap['cartAdds'] = index;
                } else if (headerText.includes('bounce')) {
                  headerMap['bounceRate'] = index;
                } else if (headerText.includes('orders')) {
                  headerMap['orders'] = index;
                } else if (headerText.includes('revenue') && !headerText.includes('per')) {
                  headerMap['revenue'] = index;
                }
              });
              
              // Extract device metrics
              const deviceRows = table.querySelectorAll('tbody');
              
              deviceRows.forEach(tbody => {
                // Get device name from the first cell
                const deviceNameEl = tbody.querySelector('th span');
                if (!deviceNameEl) return;
                
                const deviceName = deviceNameEl.textContent.trim();
                if (!deviceName || deviceName === 'Variant') return;
                
                metrics.byDevice[deviceName] = {
                  original: {},
                  variant: {},
                  change: {}
                };
                
                // Get metrics for original and variant
                const rows = tbody.querySelectorAll('tr');
                rows.forEach(row => {
                  const rowType = row.querySelector('th')?.textContent.trim();
                  
                  if (rowType && rowType.includes('Original')) {
                    const cells = row.querySelectorAll('td');
                    const data = {};
                    
                    // Extract metrics based on the mapped column indices
                    Object.keys(headerMap).forEach(key => {
                      if (key !== 'device' && key !== 'variant') {
                        const index = headerMap[key] - 2; // Adjust for th columns
                        if (cells[index]) {
                          data[key] = cells[index].textContent.trim();
                        }
                      }
                    });
                    
                    metrics.byDevice[deviceName].original = data;
                  } 
                  else if (rowType && rowType.includes('Variant')) {
                    const cells = row.querySelectorAll('td');
                    const data = {};
                    const changes = {};
                    
                    // Extract metrics and changes
                    Object.keys(headerMap).forEach(key => {
                      if (key !== 'device' && key !== 'variant') {
                        const index = headerMap[key] - 2; // Adjust for th columns
                        if (cells[index]) {
                          data[key] = cells[index].textContent.split(' ')[0].trim();
                          
                          // Look for change labels
                          const changeLabel = cells[index].querySelector('.label-tint');
                          if (changeLabel) {
                            changes[key] = changeLabel.textContent.trim();
                          }
                        }
                      }
                    });
                    
                    metrics.byDevice[deviceName].variant = data;
                    metrics.byDevice[deviceName].change = changes;
                  }
                });
              });
            } else if (isVisitorTable) {
              // Similar approach for visitor tables as with device tables
              const headerMap = {};
              table.querySelectorAll('thead th').forEach((th, index) => {
                const headerText = th.textContent.trim().toLowerCase();
                
                if (th.querySelector('[data-bs-original-title="Conversion rate"]')) {
                  headerMap['cvr'] = index;
                } else if (headerText.includes('visitors')) {
                  headerMap['visitors'] = index;
                } else if (headerText.includes('orders')) {
                  headerMap['orders'] = index;
                } else if (headerText.includes('revenue') && !headerText.includes('per')) {
                  headerMap['revenue'] = index;
                }
              });
              
              const visitorRows = table.querySelectorAll('tbody');
              
              visitorRows.forEach(tbody => {
                const visitorTypeEl = tbody.querySelector('th span');
                if (!visitorTypeEl) return;
                
                const visitorType = visitorTypeEl.textContent.trim();
                if (!visitorType || visitorType === 'Variant') return;
                
                metrics.byVisitorType[visitorType] = {
                  original: {},
                  variant: {},
                  change: {}
                };
                
                const rows = tbody.querySelectorAll('tr');
                rows.forEach(row => {
                  const rowType = row.querySelector('th')?.textContent.trim();
                  
                  if (rowType && rowType.includes('Original')) {
                    const cells = row.querySelectorAll('td');
                    const data = {};
                    
                    Object.keys(headerMap).forEach(key => {
                      if (key !== 'visitorType' && key !== 'variant') {
                        const index = headerMap[key] - 2;
                        if (cells[index]) {
                          data[key] = cells[index].textContent.trim();
                        }
                      }
                    });
                    
                    metrics.byVisitorType[visitorType].original = data;
                  } 
                  else if (rowType && rowType.includes('Variant')) {
                    const cells = row.querySelectorAll('td');
                    const data = {};
                    const changes = {};
                    
                    Object.keys(headerMap).forEach(key => {
                      if (key !== 'visitorType' && key !== 'variant') {
                        const index = headerMap[key] - 2;
                        if (cells[index]) {
                          data[key] = cells[index].textContent.split(' ')[0].trim();
                          
                          const changeLabel = cells[index].querySelector('.label-tint');
                          if (changeLabel) {
                            changes[key] = changeLabel.textContent.trim();
                          }
                        }
                      }
                    });
                    
                    metrics.byVisitorType[visitorType].variant = data;
                    metrics.byVisitorType[visitorType].change = changes;
                  }
                });
              });
            } else {
              // Overall metrics from variant cards
              const variantCards = document.querySelectorAll('.test-report-variant-card-stats');
              if (variantCards.length >= 2) {
                const originalCard = variantCards[0];
                const variantCard = variantCards[1];
                
                // Get labels and values from cards
                const originalLabels = originalCard.querySelectorAll('.label-grey.label-sm');
                const originalValues = originalCard.querySelectorAll('.headline-bold');
                const variantLabels = variantCard.querySelectorAll('.label-grey.label-sm');
                const variantValues = variantCard.querySelectorAll('.headline-bold');
                
                // Extract metrics
                metrics.overall.original = {};
                metrics.overall.variant = {};
                metrics.overall.change = {};
                
                // Process original values
                for (let i = 0; i < originalLabels.length; i++) {
                  const label = originalLabels[i].textContent.trim().toLowerCase();
                  if (label && originalValues[i]) {
                    const value = originalValues[i].textContent.trim().split(' ')[0];
                    metrics.overall.original[label] = value;
                  }
                }
                
                // Process variant values and changes
                for (let i = 0; i < variantLabels.length; i++) {
                  const label = variantLabels[i].textContent.trim().toLowerCase();
                  if (label && variantValues[i]) {
                    // Get main value
                    const valueText = variantValues[i].textContent.trim();
                    const value = valueText.split(' ')[0];
                    metrics.overall.variant[label] = value;
                    
                    // Get change value if present
                    const changeLabel = variantValues[i].querySelector('.label-tint');
                    if (changeLabel) {
                      metrics.overall.change[label] = changeLabel.textContent.trim();
                    }
                  }
                }
              }
            }
          });
        } catch (error) {
          console.error('Error extracting metrics:', error);
        }

        return metrics;
      };

      // Extract traffic information from charts/tables
      const extractTrafficInfo = () => {
        const trafficInfo = {
          sources: {},
          devices: {}
        };

        try {
          // Device distribution
          // Look for pie charts or device distribution tables
          const trafficSection = document.querySelector('h4.headline-bold + .d-flex');
          if (trafficSection) {
            // Extract data from tooltips or visible data points
            const deviceTooltips = document.querySelectorAll('.w-170px');
            deviceTooltips.forEach(deviceTooltip => {
              const deviceRows = deviceTooltip.querySelectorAll('.flex.justify-between');
              deviceRows.forEach(row => {
                const deviceName = row.querySelector('.flex.gap-4px')?.textContent.trim();
                const percentage = row.querySelector('.label-black')?.textContent.trim();
                if (deviceName && percentage) {
                  trafficInfo.devices[deviceName] = percentage;
                }
              });
            });
          }
          
          // Look for traffic source data in tables - scan all tables
          // Find a table that has channel/source information
          const channelTables = document.querySelectorAll('.performance-table');
          channelTables.forEach(table => {
            // Look for tables with "Channel" or traffic source headers
            const headers = Array.from(table.querySelectorAll('th')).map(th => 
              th.textContent.trim().toLowerCase());
            
            const isChannelTable = headers.some(h => 
              h.includes('channel') || h.includes('source') || h.includes('traffic'));
            
            if (isChannelTable || headers.length > 0) {
              // Process each tbody as a potential traffic source
              const channelRows = table.querySelectorAll('tbody');
              
              channelRows.forEach(tbody => {
                const rows = tbody.querySelectorAll('tr');
                
                // Try to identify channel name from first row
                const firstRow = rows[0];
                if (!firstRow) return;
                
                const sourceName = firstRow.querySelector('th span')?.textContent.trim();
                if (!sourceName || sourceName.includes('All channels')) return;
                
                // Extract metrics for this traffic source
                const sourceMetrics = {};
                const cells = firstRow.querySelectorAll('td');
                
                // Map common metrics by position
                if (cells.length >= 1) sourceMetrics.visitors = cells[0]?.textContent.trim() || '0';
                if (cells.length >= 3) sourceMetrics.conversionRate = cells[2]?.textContent.trim().split(' ')[0] || '0%';
                if (cells.length >= 4) sourceMetrics.revenue = cells[3]?.textContent.trim().split(' ')[0] || '$0';
                
                trafficInfo.sources[sourceName] = sourceMetrics;
                
                // Check other rows for more detailed metrics
                if (rows.length > 1) {
                  const variantData = {};
                  const originalData = {};
                  
                  rows.forEach(row => {
                    const rowTitle = row.querySelector('th')?.textContent.trim();
                    if (rowTitle && rowTitle.includes('Variant')) {
                      const cells = row.querySelectorAll('td');
                      if (cells.length >= 1) variantData.visitors = cells[0]?.textContent.trim() || '0';
                      if (cells.length >= 3) variantData.conversionRate = cells[2]?.textContent.trim().split(' ')[0] || '0%';
                    } 
                    else if (rowTitle && rowTitle.includes('Original')) {
                      const cells = row.querySelectorAll('td');
                      if (cells.length >= 1) originalData.visitors = cells[0]?.textContent.trim() || '0';
                      if (cells.length >= 3) originalData.conversionRate = cells[2]?.textContent.trim().split(' ')[0] || '0%';
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

      // Main function to extract all data and generate JSON
      const extractTestData = async () => {
        showStatus('Extracting Shoplift test data...');
        
        try {
          // Wait for key elements to be loaded
          await waitForElements('.headline-bold', 10000);
          await waitForElements('.performance-table', 10000);
          
          // Add a little delay to ensure Vue has finished rendering
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Extract all data
          const testInfo = getTestInfo();
          const testType = getTestType();
          const testOverview = getTestOverview();
          const metrics = extractMetrics();
          const trafficInfo = extractTrafficInfo();
          
          // Compile into final JSON structure
          const testData = {
            storeName: testInfo.storeName,
            testName: testInfo.testName,
            testType: testType,
            testOverview: testOverview,
            metrics: metrics,
            traffic: trafficInfo
          };
          
          // Generate downloadable JSON
          const jsonString = JSON.stringify(testData, null, 2);
          const blob = new Blob([jsonString], {type: 'application/json'});
          const url = URL.createObjectURL(blob);
          
          // Create download link
          const downloadLink = document.createElement('a');
          downloadLink.href = url;
          downloadLink.download = \`shoplift-test-\${testInfo.testName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-\${new Date().toISOString().slice(0,10)}.json\`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          
          showStatus('Test data extracted successfully!');
        } catch (error) {
          console.error('Error extracting test data:', error);
          showStatus(\`Error extracting test data: \${error.message}\`, true);
        }
      };
      
      // Start the extraction process
      extractTestData();
    })();
  `;
  document.body.appendChild(extractorScript);
  extractorScript.remove();
})();
