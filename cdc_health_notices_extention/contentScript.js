// Add a help button to the top of the page
const helpButton = document.createElement('button');
helpButton.innerHTML = `
  CDC Travel Health Notices
  <span id="notification-badge" class="badge rounded-pill bg-danger position-absolute" style="top: -10px; right: -10px;"></span>
`;
helpButton.id = 'help-navigate-button';
helpButton.classList.add('btn', 'btn-primary');
helpButton.style.position = 'fixed';
helpButton.style.top = '15px';
helpButton.style.right = '15px';
helpButton.style.zIndex = '9999';  // Set z-index very high to ensure visibility
helpButton.style.pointerEvents = 'auto';  // Ensure clickability
helpButton.style.display = 'flex';
helpButton.style.alignItems = 'center';
helpButton.style.justifyContent = 'center';
helpButton.style.width = 'fit-content';  // Adjust width to content
helpButton.style.padding = '10px';  // Add padding for better visibility

document.body.appendChild(helpButton);

// Fetch and display RSS feed after sidebar is created
fetchAndDisplayRSS();

// Handle button click to open a sidebar or modal
helpButton.addEventListener('click', () => {
  // Check if sidebar already exists
  if (document.getElementById('cdc-assistant-sidebar')) {
    return;
  }

  // Inject a sidebar with guidance
  const sidebar = document.createElement('div');
  sidebar.id = 'cdc-assistant-sidebar';
  sidebar.innerHTML = `
    <div style="position: fixed; top: 0; right: 0; width: 25%; height: 100%; background: #f8f9fa; border-left: 1px solid #ccc; z-index: 9999; overflow-y: auto; box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1)">
      <div style="position: sticky; top: 0; background: #f8f9fa; padding: 10px; border-bottom: 1px solid #ccc; display: flex; flex-direction: column; z-index:1002;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4 style="font-family: Arial, sans-serif; font-weight: bold; margin: 0;">CDC Travel Health Notices</h4>
            <p class="text small mb-1" style="font-size: 0.9em; margin: 0;">CDC uses Travel Health Notices (THNs) to inform travelers about global health risks during outbreaks, special events or gatherings, and natural disasters, and to provide advice about protective actions travelers can take to prevent infection or adverse health effects. Learn more about this at <a href="">CDC Travelers' Health website</a>.</p>
          </div>
          <button id="close-sidebar" style="background: none; border: none; font-size: 1.5em; cursor: pointer;">&times;</button>
        </div>
        <div style="display: flex; align-items: center; padding: 5px 0;">
          <label for="transparency-slider" style="margin-right: 10px;">Transparency:</label>
          <input type="range" id="transparency-slider" min="85" max="100" value="95">
        </div>
        <div style="padding: 10px;">
          <input type="text" id="notice-search" class="form-control" placeholder="Search notices..." style="margin-bottom: 10px;">
          <button id="expand-all" class="btn btn-sm btn-outline-primary" style="margin-right: 5px;">Expand All</button>
          <button id="collapse-all" class="btn btn-sm btn-outline-secondary">Collapse All</button>
        </div>
        <div style="margin-top: 10px;">
          <div class="row">
            <div class="col-6">
              <div class="form-check form-switch">
                <input class="form-check-input level-filter" type="checkbox" id="filter-level-1" checked>
                <label class="form-check-label" for="filter-level-1" style="color: #26418f;">Level 1 (<span id="level-1-count">0</span> notices)</label>
              </div>
            </div>
            <div class="col-6">
              <div class="form-check form-switch">
                <input class="form-check-input level-filter" type="checkbox" id="filter-level-2" checked>
                <label class="form-check-label" for="filter-level-2" style="color: #ffd54f;">Level 2 (<span id="level-2-count">0</span> notices)</label>
              </div>
            </div>
            <div class="col-6">
              <div class="form-check form-switch">
                <input class="form-check-input level-filter" type="checkbox" id="filter-level-3" checked>
                <label class="form-check-label" for="filter-level-3" style="color: #ffad42;">Level 3 (<span id="level-3-count">0</span> notices)</label>
              </div>
            </div>
            <div class="col-6">
              <div class="form-check form-switch">
                <input class="form-check-input level-filter" type="checkbox" id="filter-level-4" checked>
                <label class="form-check-label" for="filter-level-4" style="color: #af4448;">Level 4 (<span id="level-4-count">0</span> notices)</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="rss-cards-container" style="padding: 15px;"></div> <!-- Container for RSS feed cards -->
    </div>
  `;

  document.body.appendChild(sidebar);

  // Add transparency slider functionality
  document.getElementById('transparency-slider').addEventListener('input', function () {
    console.log('Slider value:', this.value);
    const transparencyValue = (this.value - 85) / 100;
    const sidebarInnerElement = document.querySelector('#cdc-assistant-sidebar > div');
    if (sidebarInnerElement) {
      sidebarInnerElement.style.opacity = `${1 - transparencyValue}`;
      sidebarInnerElement.style.transition = 'opacity 0.3s ease';
    }
  });
    

  // Fetch and display RSS feed after sidebar is added
  fetchAndDisplayRSS();

  // Close sidebar functionality
  document.getElementById('close-sidebar').addEventListener('click', () => {
    sidebar.remove();
  });

  

// Add search functionality to filter notices by title or content
document.getElementById('notice-search').addEventListener('input', function () {
  const query = this.value.toLowerCase();
  document.querySelectorAll('#rss-cards-container .card').forEach((card) => {
    const title = card.querySelector('.card-header').innerText.toLowerCase();
    const body = card.querySelector('.card-body').innerText.toLowerCase();
    card.style.display = title.includes(query) || body.includes(query) ? 'block' : 'none';
  });
  updateNotificationBadge();
});

// Expand/Collapse All functionality
document.getElementById('expand-all').addEventListener('click', () => {
  document.querySelectorAll('#rss-cards-container .card-body').forEach((body) => {
    body.style.display = 'block';
  });
});

document.getElementById('collapse-all').addEventListener('click', () => {
  document.querySelectorAll('#rss-cards-container .card-body').forEach((body) => {
    body.style.display = 'none';
  });
});

  // Add event listeners to the level filter switches
  document.querySelectorAll('.level-filter').forEach((filter) => {
    filter.addEventListener('change', filterNotices);
  });
});

// Function to fetch and parse the RSS feed with error handling
async function fetchAndDisplayRSS() {
  try {
    // Fetch the RSS feed
    const response = await fetch('https://tools.cdc.gov/api/v2/resources/media/285740.rss');
    if (!response.ok) throw new Error('Network response was not ok');
    
    const rssText = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(rssText, "application/xml");

    // Clear existing content in the rss-cards-container
    const cardsContainer = document.getElementById('rss-cards-container');
    if (cardsContainer) {
      cardsContainer.innerHTML = '';  // Remove existing content
    }

    // Parse each item in the RSS feed
    const items = xml.querySelectorAll('item');
    const levelCounts = { '1': 0, '2': 0, '3': 0, '4': 0 };
    const notificationBadge = document.getElementById('notification-badge');
    if (notificationBadge) {
      notificationBadge.innerText = items.length;
    }

    items.forEach(item => {
      const title = item.querySelector('title')?.textContent || '';
      let pubDate = item.querySelector('pubDate')?.textContent || '';
      const category = item.querySelector('category')?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';

      // Determine the level and corresponding background color
      let level = '1';
      let bgColor = '#26418f';  // Default Level 1
      if (title.includes('Level 2')) {
        level = '2';
        bgColor = '#ffd54f';
      } else if (title.includes('Level 3')) {
        level = '3';
        bgColor = '#ffad42';
      } else if (title.includes('Level 4')) {
        level = '4';
        bgColor = '#af4448';
      }

      // Increment level count
      levelCounts[level]++;

      // Remove level information from the title
      const formattedTitle = title.replace(/Level \d+ - /, '');

      // Remove extra part at the end of time
      pubDate = pubDate.replace(/\s\d{2}:\d{2}:\d{2}\sGMT/, '');

      // Create card element
      const card = document.createElement('div');
      card.classList.add('card', 'mb-3', `level-${level}`);
      card.style.backgroundColor = 'white';
      card.style.borderRadius = '8px';
      card.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
      card.style.padding = '15px';

      card.innerHTML = `
        <div class="card-header" style="background-color: ${bgColor}; color: white; border-radius: 5px 5px 0 0; font-family: Arial, sans-serif; font-weight: bold; cursor: pointer;">
          ${formattedTitle}
        </div>
        <div class="card-body" style="padding: 10px; display: none;">
          <div class="d-flex justify-content-between" style="font-size: 0.8em; font-family: Arial, sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            <small class="text-muted">${pubDate}</small>
            <small class="text-muted">${category}</small>
          </div>
          <h5 class="card-title" style="text-align: left; font-size: 1.1em; font-weight: bold; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;"><a href="${link}" target="_blank" class="text-dark" style="text-decoration: none;">${formattedTitle}</a></h5>
          <p class="card-text text-muted" style="font-size: 0.9em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; max-height: 4.8em; font-family: Arial, sans-serif;">
            ${description}
          </p>
          <button class="btn btn-link btn-sm text-danger dismiss-card" style="padding: 0; text-decoration: underline; font-family: Arial, sans-serif;">Dismiss</button>
        </div>
      `;

      // Append the card to the rss-cards-container
      if (cardsContainer) {
        cardsContainer.appendChild(card);
      }

      // Add functionality to toggle card body visibility
      card.querySelector('.card-header').addEventListener('click', () => {
        const body = card.querySelector('.card-body');
        body.style.display = body.style.display === 'none' ? 'block' : 'none';
      });

      // Add dismiss functionality for each card
      card.querySelector('.dismiss-card').addEventListener('click', () => {
        card.remove();
        
      });
    });

    // Update level counts after processing all items
    const level1Count = document.getElementById('level-1-count');
    if (level1Count) level1Count.innerText = levelCounts['1'];
    const level2Count = document.getElementById('level-2-count');
    if (level2Count) level2Count.innerText = levelCounts['2'];
    const level3Count = document.getElementById('level-3-count');
    if (level3Count) level3Count.innerText = levelCounts['3'];
    const level4Count = document.getElementById('level-4-count');
    if (level4Count) level4Count.innerText = levelCounts['4'];

  } catch (error) {
    console.error('Failed to fetch RSS feed:', error);
    const cardsContainer = document.getElementById('rss-cards-container');
    if (cardsContainer) {
      cardsContainer.innerHTML = `<p class="text-danger">Failed to load travel notices. Please try again later.</p>`;
    }
  }
}


// Function to filter notices based on selected levels
function filterNotices() {
  const levelFilters = {
    '1': document.getElementById('filter-level-1').checked,
    '2': document.getElementById('filter-level-2').checked,
    '3': document.getElementById('filter-level-3').checked,
    '4': document.getElementById('filter-level-4').checked
  };

  document.querySelectorAll('#rss-cards-container .card').forEach((card) => {
    const level = card.classList[2].split('-')[1];
    card.style.display = levelFilters[level] ? 'block' : 'none';
  });

  
}
