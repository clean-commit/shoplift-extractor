# Shoplift Tests Extractor

A utility for extracting test data from Shoplift A/B testing platform. This tool helps you capture and analyze test results by extracting structured data in JSON format.

## Features

- Extract test information (name, store, type)
- Extract test metrics (conversion rates, revenue)
- Extract performance data by device type
- Extract traffic source information
- Download all data as a structured JSON file

## Bookmarklet

To use this tool, drag the link below to your bookmarks bar:

[Shoplift Extractor](javascript:javascript%3A(function()%7B%2F**%0A%20*%20Shoplift%20Tests%20Extractor%0A%20*%20A%20utility%20module%20for%20extracting%20test%20data%20from%20Shoplift%20test%20results%20pages%0A%20*%2F%0A%0A%2F%2F%20Show%20extraction%20status%20to%20user%0Aconst%20showStatus%20%3D%20(msg%2C%20isError%20%3D%20false)%20%3D%3E%20%7B%0A%20%20const%20statusDiv%20%3D%20document.createElement('div')%3B%0A%20%20statusDiv.style.position%20%3D%20'fixed'%3B%0A%20%20statusDiv.style.top%20%3D%20'10px'%3B%0A%20%20statusDiv.style.left%20%3D%20'50%25'%3B%0A%20%20statusDiv.style.transform%20%3D%20'translateX(-50%25)'%3B%0A%20%20statusDiv.style.background%20%3D%20isError%20%3F%20'%23f44336'%20%3A%20'%236d28d9'%3B%0A%20%20statusDiv.style.color%20%3D%20'white'%3B%0A%20%20statusDiv.style.padding%20%3D%20'10px%2020px'%3B%0A%20%20statusDiv.style.borderRadius%20%3D%20'5px'%3B%0A%20%20statusDiv.style.zIndex%20%3D%20'9999'%3B%0A%20%20statusDiv.style.boxShadow%20%3D%20'0%202px%2010px%20rgba(0%2C0%2C0%2C0.2)'%3B%0A%20%20statusDiv.textContent%20%3D%20msg%3B%0A%20%20document.body.appendChild(statusDiv)%3B%0A%0A%20%20setTimeout(%0A%20%20%20%20()%20%3D%3E%20%7B%0A%20%20%20%20%20%20statusDiv.remove()%3B%0A%20%20%20%20%7D%2C%0A%20%20%20%20isError%20%3F%205000%20%3A%203000%2C%0A%20%20)%3B%0A%7D%3B%0A%0A%2F%2F%20Check%20if%20elements%20are%20loaded%20and%20ready%20for%20extraction%0Aconst%20waitForElements%20%3D%20(selector%2C%20timeout%20%3D%205000%2C%20interval%20%3D%20200)%20%3D%3E%20%7B%0A%20%20return%20new%20Promise((resolve%2C%20reject)%20%3D%3E%20%7B%0A%20%20%20%20const%20startTime%20%3D%20Date.now()%3B%0A%0A%20%20%20%20const%20checkElements%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20%20%20const%20elements%20%3D%20document.querySelectorAll(selector)%3B%0A%20%20%20%20%20%20if%20(elements.length%20%3E%200)%20%7B%0A%20%20%20%20%20%20%20%20resolve(elements)%3B%0A%20%20%20%20%20%20%20%20return%3B%0A%20%20%20%20%20%20%7D%0A%0A%20%20%20%20%20%20if%20(Date.now()%20-%20startTime%20%3E%20timeout)%20%7B%0A%20%20%20%20%20%20%20%20reject(new%20Error(%60Elements%20not%20found%3A%20%24%7Bselector%7D%60))%3B%0A%20%20%20%20%20%20%20%20return%3B%0A%20%20%20%20%20%20%7D%0A%0A%20%20%20%20%20%20setTimeout(checkElements%2C%20interval)%3B%0A%20%20%20%20%7D%3B%0A%0A%20%20%20%20checkElements()%3B%0A%20%20%7D)%3B%0A%7D%3B%0A%0A%2F%2F%20Extract%20test%20name%20and%20store%20name%0Aconst%20getTestInfo%20%3D%20()%20%3D%3E%20%7B%0A%20%20let%20store_name%20%3D%20''%3B%0A%20%20let%20test_name%20%3D%20''%3B%0A%0A%20%20try%20%7B%0A%20%20%20%20%2F%2F%20Try%20to%20get%20store%20name%20from%20breadcrumbs%20or%20navigation%0A%20%20%20%20const%20storeElements%20%3D%20document.querySelectorAll('h5.headline-bold.mb-32px')%3B%0A%20%20%20%20store_name%20%3D%20storeElements%5B0%5D%3F.textContent.trim()%3B%0A%0A%20%20%20%20if%20(!store_name)%20%7B%0A%20%20%20%20%20%20const%20storeMatch%20%3D%20window.location.href.match(%2Fstore%5C%2F(%5B%5E%5C%2F%5D%2B)%2F)%3B%0A%20%20%20%20%20%20if%20(storeMatch%20%26%26%20storeMatch%5B1%5D)%20%7B%0A%20%20%20%20%20%20%20%20store_name%20%3D%20decodeURIComponent(storeMatch%5B1%5D)%3B%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%0A%20%20%20%20%2F%2F%20Find%20test%20name%20in%20headings%0A%20%20%20%20const%20testHeadings%20%3D%20document.querySelectorAll('h2')%3B%0A%20%20%20%20for%20(const%20heading%20of%20testHeadings)%20%7B%0A%20%20%20%20%20%20const%20text%20%3D%20heading.textContent.trim()%3B%0A%20%20%20%20%20%20if%20(%0A%20%20%20%20%20%20%20%20text%20%26%26%0A%20%20%20%20%20%20%20%20!text.includes('Performance%20overview')%20%26%26%0A%20%20%20%20%20%20%20%20!text.includes('Traffic%20overview')%20%26%26%0A%20%20%20%20%20%20%20%20!text.includes('Device%20performance')%0A%20%20%20%20%20%20)%20%7B%0A%20%20%20%20%20%20%20%20test_name%20%3D%20text%3B%0A%20%20%20%20%20%20%20%20break%3B%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%20catch%20(error)%20%7B%0A%20%20%20%20console.error('Error%20extracting%20test%20info%3A'%2C%20error)%3B%0A%20%20%7D%0A%0A%20%20return%20%7B%0A%20%20%20%20store_name%3A%20store_name%20%7C%7C%20'Unknown%20Store'%2C%0A%20%20%20%20test_name%3A%20test_name%20%7C%7C%20'Unknown%20Test'%2C%0A%20%20%7D%3B%0A%7D%3B%0A%0A%2F%2F%20Extract%20test%20goal%2Ftype%0Aconst%20getTestType%20%3D%20()%20%3D%3E%20%7B%0A%20%20try%20%7B%0A%20%20%20%20const%20goalLabels%20%3D%20document.querySelectorAll(%0A%20%20%20%20%20%20'div.d-flex.rounded-4px.items-center.p-16px.mt-8px%20div'%2C%0A%20%20%20%20)%3B%0A%0A%20%20%20%20if%20(goalLabels.length%20%3D%3D%3D%200)%20%7B%0A%20%20%20%20%20%20return%20'Unknown%20Goal'%3B%0A%20%20%20%20%7D%0A%0A%20%20%20%20const%20goalData%20%3D%20%7B%7D%3B%0A%20%20%20%20for%20(const%20label%20of%20goalLabels)%20%7B%0A%20%20%20%20%20%20const%20labels%20%3D%20label.querySelectorAll('label')%3B%0A%20%20%20%20%20%20goalData%5Blabels%5B0%5D.textContent.trim().toLowerCase().replace('%3A'%2C%20'')%5D%20%3D%0A%20%20%20%20%20%20%20%20labels%5B1%5D.textContent.trim()%3B%0A%20%20%20%20%7D%0A%20%20%20%20return%20goalData%3B%0A%20%20%7D%20catch%20(error)%20%7B%0A%20%20%20%20console.error('Error%20extracting%20test%20type%3A'%2C%20error)%3B%0A%20%20%20%20return%20'Unknown%20Goal'%3B%0A%20%20%7D%0A%7D%3B%0A%0A%2F%2F%20Extract%20test%20overview%20(dates%2C%20status%2C%20etc.)%0Aconst%20getTestOverview%20%3D%20()%20%3D%3E%20%7B%0A%20%20try%20%7B%0A%20%20%20%20%2F%2F%20Find%20test%20status%0A%20%20%20%20const%20testOverview%20%3D%20document.querySelectorAll(%0A%20%20%20%20%20%20'.test-report-overview-row%20%3E%20div'%2C%0A%20%20%20%20)%3B%0A%20%20%20%20const%20data%20%3D%20%7B%7D%3B%0A%0A%20%20%20%20for%20(const%20row%20of%20testOverview)%20%7B%0A%20%20%20%20%20%20const%20label%20%3D%20row.querySelector('label')%3B%0A%20%20%20%20%20%20const%20value%20%3D%20row.querySelector('div')%3B%0A%20%20%20%20%20%20data%5B%0A%20%20%20%20%20%20%20%20label.textContent%0A%20%20%20%20%20%20%20%20%20%20.trim()%0A%20%20%20%20%20%20%20%20%20%20.toLowerCase()%0A%20%20%20%20%20%20%20%20%20%20.replace('.'%2C%20'')%0A%20%20%20%20%20%20%20%20%20%20.replace(%2F%5Cs%2B%2Fg%2C%20'_')%0A%20%20%20%20%20%20%5D%20%3D%20value.textContent.trim().replace(%2F%5Cs%2B%2Fg%2C%20'%20')%3B%0A%20%20%20%20%7D%0A%0A%20%20%20%20return%20data%3B%0A%20%20%7D%20catch%20(error)%20%7B%0A%20%20%20%20console.error('Error%20extracting%20test%20overview%3A'%2C%20error)%3B%0A%20%20%7D%0A%0A%20%20return%20%7B%7D%3B%0A%7D%3B%0A%0A%2F%2F%20Extract%20metrics%20from%20tables%0Aconst%20extractMetrics%20%3D%20()%20%3D%3E%20%7B%0A%20%20const%20metrics%20%3D%20%7B%7D%3B%0A%20%20try%20%7B%0A%20%20%20%20%2F%2F%20Find%20all%20performance%20tables%0A%20%20%20%20const%20tables%20%3D%20document.querySelectorAll('.performance-table')%3B%0A%0A%20%20%20%20tables.forEach((table)%20%3D%3E%20%7B%0A%20%20%20%20%20%20%2F%2F%20Check%20if%20this%20is%20a%20device%20performance%20table%0A%20%20%20%20%20%20const%20headers%20%3D%20Array.from(table.querySelectorAll('thead%20th')).map((th)%20%3D%3E%0A%20%20%20%20%20%20%20%20th.textContent.trim()%2C%0A%20%20%20%20%20%20)%3B%0A%0A%20%20%20%20%20%20if%20(!headers.includes('Device'))%20return%3B%0A%0A%20%20%20%20%20%20%2F%2F%20Get%20all%20device%20sections%20(tbody%20elements)%0A%20%20%20%20%20%20const%20deviceSections%20%3D%20table.querySelectorAll('tbody')%3B%0A%0A%20%20%20%20%20%20deviceSections.forEach((tbody)%20%3D%3E%20%7B%0A%20%20%20%20%20%20%20%20%2F%2F%20Extract%20device%20name%20from%20the%20first%20cell%0A%20%20%20%20%20%20%20%20const%20deviceNameCell%20%3D%20tbody.querySelector('th%20span')%3B%0A%20%20%20%20%20%20%20%20if%20(!deviceNameCell)%20return%3B%0A%0A%20%20%20%20%20%20%20%20const%20deviceNameText%20%3D%20deviceNameCell.textContent.trim()%3B%0A%0A%20%20%20%20%20%20%20%20const%20deviceName%20%3D%20deviceNameText%0A%20%20%20%20%20%20%20%20%20%20.toLowerCase()%0A%20%20%20%20%20%20%20%20%20%20.replace(%2Fall%20devices%2Fi%2C%20'all_devices')%0A%20%20%20%20%20%20%20%20%20%20.replace(%2F%5Cs%2B%2Fg%2C%20'_')%3B%0A%0A%20%20%20%20%20%20%20%20%2F%2F%20Initialize%20device%20metrics%20structure%0A%20%20%20%20%20%20%20%20metrics%5BdeviceName%5D%20%3D%20%7B%7D%3B%0A%0A%20%20%20%20%20%20%20%20%2F%2F%20Map%20metrics%20to%20their%20column%20positions%0A%20%20%20%20%20%20%20%20const%20metricPositions%20%3D%20%7B%7D%3B%0A%20%20%20%20%20%20%20%20let%20searchable%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20'visitors'%2C%0A%20%20%20%20%20%20%20%20%20%20'clicks'%2C%0A%20%20%20%20%20%20%20%20%20%20%5B'ctr'%2C%20'clickthrough%20rate'%5D%2C%0A%20%20%20%20%20%20%20%20%20%20'cart%20adds'%2C%0A%20%20%20%20%20%20%20%20%20%20%5B'acr'%2C%20'add%20to%20cart%20rate'%5D%2C%0A%20%20%20%20%20%20%20%20%20%20'bounce%20rate'%2C%0A%20%20%20%20%20%20%20%20%20%20'orders'%2C%0A%20%20%20%20%20%20%20%20%20%20%5B'cvr'%2C%20'conversion%20rate'%5D%2C%0A%20%20%20%20%20%20%20%20%20%20'revenue'%2C%0A%20%20%20%20%20%20%20%20%20%20%5B'aov'%2C%20'average%20order%20value'%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%5B'rpv'%2C%20'revenue%20per%20visitor'%5D%2C%0A%20%20%20%20%20%20%20%20%5D%3B%0A%20%20%20%20%20%20%20%20headers.forEach((header%2C%20index)%20%3D%3E%20%7B%0A%20%20%20%20%20%20%20%20%20%20const%20headerText%20%3D%20header.toLowerCase()%3B%0A%20%20%20%20%20%20%20%20%20%20searchable.forEach((search%2C%20i)%20%3D%3E%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(Array.isArray(search))%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(search.some((s)%20%3D%3E%20headerText.includes(s)))%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20searchable.splice(i%2C%201)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20metricPositions%5Bsearch%5B0%5D%5D%20%3D%20index%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(headerText.includes(search))%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20searchable.splice(i%2C%201)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20metricPositions%5Bsearch%5D%20%3D%20index%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%7D)%3B%0A%20%20%20%20%20%20%20%20%7D)%3B%0A%0A%20%20%20%20%20%20%20%20%2F%2F%20Extract%20data%20from%20variant%20and%20original%20rows%0A%20%20%20%20%20%20%20%20const%20rows%20%3D%20tbody.querySelectorAll('tr')%3B%0A%20%20%20%20%20%20%20%20let%20variantRow%2C%20originalRow%3B%0A%0A%20%20%20%20%20%20%20%20%2F%2F%20Find%20variant%20and%20original%20rows%0A%20%20%20%20%20%20%20%20rows.forEach((row)%20%3D%3E%20%7B%0A%20%20%20%20%20%20%20%20%20%20%2F%2F%20Get%20text%20from%20the%20second%20th%20cell%20which%20contains%20variant%2Foriginal%20info%0A%20%20%20%20%20%20%20%20%20%20const%20variantCell%20%3D%0A%20%20%20%20%20%20%20%20%20%20%20%20row.querySelector('th%3Anth-child(2)')%20%7C%7C%20row.querySelector('th')%3B%0A%0A%20%20%20%20%20%20%20%20%20%20if%20(!variantCell)%20return%3B%0A%20%20%20%20%20%20%20%20%20%20const%20cellText%20%3D%20variantCell.textContent.trim()%3B%0A%0A%20%20%20%20%20%20%20%20%20%20if%20(cellText.includes('Variant'))%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20variantRow%20%3D%20row%3B%0A%20%20%20%20%20%20%20%20%20%20%7D%20else%20if%20(cellText.includes('Original'))%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20originalRow%20%3D%20row%3B%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D)%3B%0A%0A%20%20%20%20%20%20%20%20%2F%2F%20Process%20each%20metric%0A%20%20%20%20%20%20%20%20Object.keys(metricPositions).forEach((metric)%20%3D%3E%20%7B%0A%20%20%20%20%20%20%20%20%20%20%2F%2F%20Don't%20subtract%201%20-%20we%20use%20the%20actual%20index%20that%20matches%20the%20header%0A%20%20%20%20%20%20%20%20%20%20const%20position%20%3D%20metricPositions%5Bmetric%5D%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%2F%2F%20Skip%20if%20position%20is%20undefined%0A%20%20%20%20%20%20%20%20%20%20if%20(position%20%3D%3D%3D%20undefined)%20return%3B%0A%0A%20%20%20%20%20%20%20%20%20%20metrics%5BdeviceName%5D%5Bmetric%5D%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20original%3A%20'0'%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20variant%3A%20'0'%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20change%3A%20'0%25'%2C%0A%20%20%20%20%20%20%20%20%20%20%7D%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%2F%2F%20Extract%20original%20value%20-%20adjust%20for%20th%20cells%0A%20%20%20%20%20%20%20%20%20%20if%20(originalRow)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20const%20cells%20%3D%20originalRow.querySelectorAll('th%2C%20td')%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20The%20%2B1%20because%20the%20first%20cell%20is%20the%20empty%20th%2C%20then%20variant%20name%2C%20then%20data%0A%20%20%20%20%20%20%20%20%20%20%20%20const%20cell%20%3D%20cells%5Bposition%5D%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(cell)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20rawValue%20%3D%20cell.textContent.trim()%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20metrics%5BdeviceName%5D%5Bmetric%5D.original%20%3D%20rawValue.split('%20')%5B0%5D%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%0A%20%20%20%20%20%20%20%20%20%20%2F%2F%20Extract%20variant%20value%20and%20change%20percentage%0A%20%20%20%20%20%20%20%20%20%20if%20(variantRow)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20const%20cells%20%3D%20variantRow.querySelectorAll('th%2C%20td')%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20const%20cell%20%3D%20cells%5Bposition%5D%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20(cell)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20rawValue%20%3D%20cell.textContent.trim()%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Extract%20main%20value%20-%20before%20any%20labels%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20metrics%5BdeviceName%5D%5Bmetric%5D.variant%20%3D%20rawValue.split('%20')%5B0%5D%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Extract%20change%20label%20if%20present%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20changeLabel%20%3D%20cell.querySelector('.label-tint')%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(changeLabel)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20metrics%5BdeviceName%5D%5Bmetric%5D.change%20%3D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20changeLabel.textContent.trim()%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20originalValue%20%3D%20metrics%5BdeviceName%5D%5Bmetric%5D.original%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20const%20variantValue%20%3D%20metrics%5BdeviceName%5D%5Bmetric%5D.variant%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%2F%2F%20Only%20calculate%20if%20we%20have%20valid%20values%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20(originalValue%20%26%26%20variantValue)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20metrics%5BdeviceName%5D%5Bmetric%5D.change%20%3D%20calculateChange(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20originalValue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20variantValue%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D)%3B%0A%20%20%20%20%20%20%7D)%3B%0A%20%20%20%20%7D)%3B%0A%20%20%7D%20catch%20(error)%20%7B%0A%20%20%20%20console.error('Error%20extracting%20metrics%3A'%2C%20error)%3B%0A%20%20%7D%0A%0A%20%20return%20metrics%3B%0A%7D%3B%0A%0Aconst%20extractTrafficInfo%20%3D%20(metrics)%20%3D%3E%20%7B%0A%20%20const%20desktopVisitors%20%3D%0A%20%20%20%20parseValue(metrics.desktop.visitors.original)%20%2B%0A%20%20%20%20parseValue(metrics.desktop.visitors.variant)%3B%0A%20%20const%20mobileVisitors%20%3D%0A%20%20%20%20parseValue(metrics.mobile.visitors.original)%20%2B%0A%20%20%20%20parseValue(metrics.mobile.visitors.variant)%3B%0A%20%20const%20totalVisitors%20%3D%20desktopVisitors%20%2B%20mobileVisitors%3B%0A%0A%20%20return%20%7B%0A%20%20%20%20total%3A%20totalVisitors%2C%0A%20%20%20%20desktop%3A%20desktopVisitors%2C%0A%20%20%20%20mobile%3A%20mobileVisitors%2C%0A%20%20%7D%3B%0A%7D%3B%0A%0Aconst%20parseValue%20%3D%20(value)%20%3D%3E%20%7B%0A%20%20%2F%2F%20Remove%20any%20currency%20symbols%2C%20commas%2C%20and%20%25%20signs%0A%20%20if%20(!value)%20return%200%3B%0A%20%20return%20parseFloat(value.replace(%2F%5B%24%2C%E2%82%AC%C2%A3%25%5D%2Fg%2C%20''))%3B%0A%7D%3B%0A%0Aconst%20calculateChange%20%3D%20(original%2C%20variant)%20%3D%3E%20%7B%0A%20%20const%20originalValue%20%3D%20parseValue(original)%3B%0A%20%20const%20variantValue%20%3D%20parseValue(variant)%3B%0A%0A%20%20%2F%2F%20Handle%20division%20by%20zero%20case%0A%20%20if%20(originalValue%20%3D%3D%3D%200)%20%7B%0A%20%20%20%20return%20variantValue%20%3E%200%20%3F%20'%2B100%25'%20%3A%20'0%25'%3B%0A%20%20%7D%0A%0A%20%20const%20change%20%3D%20((variantValue%20-%20originalValue)%20%2F%20originalValue)%20*%20100%3B%0A%20%20%2F%2F%20Format%20to%201%20decimal%20place%20with%20%2B%20or%20-%20prefix%0A%20%20const%20sign%20%3D%20change%20%3E%200%20%3F%20'%2B'%20%3A%20''%3B%0A%20%20return%20%60%24%7Bsign%7D%24%7Bchange.toFixed(1)%7D%25%60%3B%0A%7D%3B%0A%0A%2F%2F%20Main%20extraction%20function%20to%20be%20exported%0Aconst%20async%20(isTest%20%3D%20false)%20%3D%3E%20%7B%0A%20%20showStatus('Extracting%20Shoplift%20test%20data...')%3B%0A%0A%20%20try%20%7B%0A%20%20%20%20%2F%2F%20Wait%20for%20key%20elements%20to%20be%20loaded%20(with%20shorter%20timeout%20for%20test%20environment)%0A%20%20%20%20const%20timeout%20%3D%20isTest%20%3F%203000%20%3A%2010000%3B%0A%20%20%20%20try%20%7B%0A%20%20%20%20%20%20await%20waitForElements('.headline-bold'%2C%20timeout)%3B%0A%20%20%20%20%20%20await%20waitForElements('.test-report-variant-card-stats'%2C%20timeout)%3B%0A%20%20%20%20%7D%20catch%20(err)%20%7B%0A%20%20%20%20%20%20%2F%2F%20Continue%20even%20if%20some%20elements%20aren't%20found%0A%20%20%20%20%20%20console.warn('Some%20page%20elements%20not%20found%3A'%2C%20err.message)%3B%0A%20%20%20%20%7D%0A%0A%20%20%20%20%2F%2F%20Add%20a%20little%20delay%20to%20ensure%20page%20is%20fully%20rendered%0A%20%20%20%20await%20new%20Promise((resolve)%20%3D%3E%20setTimeout(resolve%2C%20500))%3B%0A%0A%20%20%20%20%2F%2F%20Make%20sure%20all%20items%20are%20visible%0A%20%20%20%20const%20buttons%20%3D%20document.querySelectorAll(%0A%20%20%20%20%20%20%60.dropdown-item.d-flex.items-center.gap-8px.gap-8px%60%2C%0A%20%20%20%20)%3B%0A%20%20%20%20const%20allMetricsButtons%20%3D%20%5B...buttons%5D.filter((b)%20%3D%3E%0A%20%20%20%20%20%20b.innerText.toLowerCase().includes('all%20metrics')%2C%0A%20%20%20%20)%3B%0A%20%20%20%20%5B...allMetricsButtons%5D.forEach((el)%20%3D%3E%20el.click())%3B%0A%0A%20%20%20%20%2F%2F%20Extract%20all%20data%0A%20%20%20%20const%20testInfo%20%3D%20getTestInfo()%3B%0A%20%20%20%20const%20testType%20%3D%20getTestType()%3B%0A%20%20%20%20const%20testOverview%20%3D%20getTestOverview()%3B%0A%20%20%20%20const%20metrics%20%3D%20extractMetrics()%3B%0A%20%20%20%20const%20trafficInfo%20%3D%20extractTrafficInfo(metrics)%3B%0A%0A%20%20%20%20%2F%2F%20Compile%20into%20final%20JSON%20structure%0A%20%20%20%20const%20testData%20%3D%20%7B%0A%20%20%20%20%20%20store%3A%20testInfo.store_name%2C%0A%20%20%20%20%20%20test%3A%20testInfo.test_name%2C%0A%20%20%20%20%20%20configuration%3A%20testType%2C%0A%20%20%20%20%20%20overview%3A%20testOverview%2C%0A%20%20%20%20%20%20traffic%3A%20trafficInfo%2C%0A%20%20%20%20%20%20metrics%3A%20metrics%2C%0A%20%20%20%20%20%20extractedAt%3A%20new%20Date().toISOString()%2C%0A%20%20%20%20%7D%3B%0A%0A%20%20%20%20%2F%2F%20Generate%20downloadable%20JSON%0A%20%20%20%20const%20jsonString%20%3D%20JSON.stringify(testData%2C%20null%2C%202)%3B%0A%20%20%20%20if%20(document.querySelector('%23shoplift-test-data'))%20%7B%0A%20%20%20%20%20%20document.querySelector('%23shoplift-test-data').textContent%20%3D%0A%20%20%20%20%20%20%20%20JSON.stringify(testData%2C%20null%2C%204)%3B%0A%20%20%20%20%20%20return%20testData%3B%20%2F%2F%20Return%20data%20for%20testing%20purposes%0A%20%20%20%20%7D%0A%20%20%20%20const%20blob%20%3D%20new%20Blob(%5BjsonString%5D%2C%20%7B%20type%3A%20'application%2Fjson'%20%7D)%3B%0A%20%20%20%20const%20url%20%3D%20URL.createObjectURL(blob)%3B%0A%0A%20%20%20%20%2F%2F%20Create%20download%20link%0A%20%20%20%20const%20downloadLink%20%3D%20document.createElement('a')%3B%0A%20%20%20%20downloadLink.href%20%3D%20url%3B%0A%20%20%20%20downloadLink.download%20%3D%20%60shoplift-%24%7BtestInfo.test%0A%20%20%20%20%20%20.replace(%2F%5B%5Ea-z0-9%5D%2Fgi%2C%20'-')%0A%20%20%20%20%20%20.toLowerCase()%7D-%24%7Bnew%20Date().toISOString().slice(0%2C%2010)%7D.json%60%3B%0A%20%20%20%20document.body.appendChild(downloadLink)%3B%0A%20%20%20%20downloadLink.click()%3B%0A%20%20%20%20document.body.removeChild(downloadLink)%3B%0A%0A%20%20%20%20showStatus('Test%20data%20extracted%20successfully!')%3B%0A%0A%20%20%20%20return%20testData%3B%20%2F%2F%20Return%20data%20for%20testing%20purposes%0A%20%20%7D%20catch%20(error)%20%7B%0A%20%20%20%20console.error('Error%20extracting%20test%20data%3A'%2C%20error)%3B%0A%20%20%20%20showStatus(%60Error%20extracting%20test%20data%3A%20%24%7Berror.message%7D%60%2C%20true)%3B%0A%20%20%20%20throw%20error%3B%0A%20%20%7D%0A%7D%3B%0A%0A%2F%2F%20Initialize%20bookmarklet%20link%0Aconst%20(linkElement)%20%3D%3E%20%7B%0A%20%20if%20(!linkElement)%20return%3B%0A%0A%20%20%2F%2F%20Generate%20the%20bookmarklet%20code%0A%20%20const%20bookmarkletCode%20%3D%20%60javascript%3A(function()%7Bconst%20e%3Ddocument.createElement(%22script%22)%3Be.textContent%3D%22(function()%7Bconst%20showStatus%3D(msg%2CisError%3Dfalse)%3D%3E%7Bconst%20statusDiv%3Ddocument.createElement('div')%3BstatusDiv.style.position%3D'fixed'%3BstatusDiv.style.top%3D'10px'%3BstatusDiv.style.left%3D'50%25'%3BstatusDiv.style.transform%3D'translateX(-50%25)'%3BstatusDiv.style.background%3DisError%3F'%23f44336'%3A'%236d28d9'%3BstatusDiv.style.color%3D'white'%3BstatusDiv.style.padding%3D'10px%2020px'%3BstatusDiv.style.borderRadius%3D'5px'%3BstatusDiv.style.zIndex%3D'9999'%3BstatusDiv.style.boxShadow%3D'0%202px%2010px%20rgba(0%2C0%2C0%2C0.2)'%3BstatusDiv.textContent%3Dmsg%3Bdocument.body.appendChild(statusDiv)%3BsetTimeout(()%3D%3E%7BstatusDiv.remove()%3B%7D%2CisError%3F5000%3A3000)%3B%7D%3Bconst%20extractTestData%3Dasync()%3D%3E%7BshowStatus('Extracting%20Shoplift%20test%20data...')%3Btry%7Bawait%20new%20Promise(resolve%3D%3EsetTimeout(resolve%2C1000))%3B%24%7BrunExtractor%0A%20%20%20%20.toString()%0A%20%20%20%20.replace(%0A%20%20%20%20%20%20%2Fconst%20%2F%2C%0A%20%20%20%20%20%20''%2C%0A%20%20%20%20)%7DextractTestData()%3B%7D)()%3B%22%7D%3Bdocument.body.appendChild(e)%3Be.remove()%7D)()%3B%60%3B%0A%0A%20%20%2F%2F%20Set%20the%20href%20attribute%20of%20the%20link%0A%20%20linkElement.href%20%3D%20bookmarkletCode%3B%0A%0A%20%20%2F%2F%20Add%20click%20handler%20to%20prevent%20navigation%0A%20%20linkElement.addEventListener('click'%2C%20(e)%20%3D%3E%20%7B%0A%20%20%20%20e.preventDefault()%3B%0A%20%20%20%20alert(%0A%20%20%20%20%20%20%22To%20use%20this%20bookmarklet%2C%20drag%20it%20to%20your%20bookmarks%20bar.%20Then%20click%20it%20when%20you're%20viewing%20a%20Shoplift%20test%20results%20page.%22%2C%0A%20%20%20%20)%3B%0A%20%20%7D)%3B%0A%7D%3B%0ArunExtractor()%3B%7D)())

*Note: The bookmarklet size is 22.79 KB*

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
