// Add a help button to the top of the page
const helpButton = document.createElement('div');
helpButton.innerHTML = `
  <div class="cdc-button-ring">
    <svg width="50" height="50" viewBox="0 0 36 36">
      <circle class="cdc-ring-background" cx="18" cy="18" r="15.9155" fill="none" stroke="#e6e6e6" stroke-width="3"/>
      <circle class="cdc-ring-level-1" id="ring-level-1" cx="18" cy="18" r="15.9155" fill="none" stroke="#26418f" stroke-width="3" stroke-dasharray="0, 100" stroke-dashoffset="0"/>
      <circle class="cdc-ring-level-2" id="ring-level-2" cx="18" cy="18" r="15.9155" fill="none" stroke="#ffd54f" stroke-width="3" stroke-dasharray="0, 100" stroke-dashoffset="0"/>
      <circle class="cdc-ring-level-3" id="ring-level-3" cx="18" cy="18" r="15.9155" fill="none" stroke="#ffad42" stroke-width="3" stroke-dasharray="0, 100" stroke-dashoffset="0"/>
      <circle class="cdc-ring-level-4" id="ring-level-4" cx="18" cy="18" r="15.9155" fill="none" stroke="#af4448" stroke-width="3" stroke-dasharray="0, 100" stroke-dashoffset="0"/>
    </svg>
    <div class="cdc-ring-text-container">
      <span class="cdc-ring-number" id="notification-badge">20</span>
      <span class="cdc-ring-label">CDC <br> Notices</span>
    </div>
  </div>
`;
helpButton.id = 'cdc-extension-help-button';
helpButton.classList.add('cdc-extension-button');
helpButton.style.background = 'transparent';
helpButton.style.border = 'none';
helpButton.style.cursor = 'pointer';
helpButton.style.textAlign = 'center';
helpButton.style.width = 'fit-content';
helpButton.style.position = 'absolute';
helpButton.style.top = '15px';
helpButton.style.left = '15px';

// Style for the new button ring
const style = document.createElement('style');
style.textContent = `
  .cdc-button-ring {
    position: relative;
    width: 50px;
    height: 50px;
    margin: 0 auto;
  }
  .cdc-ring-background, .cdc-ring-level-1, .cdc-ring-level-2, .cdc-ring-level-3, .cdc-ring-level-4 {
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
  }
  .cdc-ring-text-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }
  .cdc-ring-number {
    font-size: 16px;
    font-weight: bold;
    color: #000000;
    display: block;
  }
  .cdc-ring-label {
    font-size: 8px;
    color: #000000;
  }
`;
document.head.appendChild(style);

document.body.prepend(helpButton);

// Make the help button draggable
let offsetX, offsetY;
helpButton.addEventListener('mousedown', (e) => {
  offsetX = e.clientX - helpButton.getBoundingClientRect().left;
  offsetY = e.clientY - helpButton.getBoundingClientRect().top;
  document.addEventListener('mousemove', moveButton);
  document.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', moveButton);
  });
});

function moveButton(e) {
  helpButton.style.left = `${e.clientX - offsetX}px`;
  helpButton.style.top = `${e.clientY - offsetY}px`;
}

// Fetch and display RSS feed after sidebar is created
fetchAndDisplayRSS();

// Handle button click to open a sidebar or modal
helpButton.addEventListener('click', (e) => {
  // Prevent sidebar from opening after drag
  if (e.type === 'mouseup' && e.detail > 1) {
    return;
  }

  // Check if sidebar already exists
  if (document.getElementById('cdc-assistant-sidebar')) {
    return;
  }

  // Inject a sidebar with guidance
  const sidebar = document.createElement('div');
  sidebar.id = 'cdc-assistant-sidebar';
  sidebar.classList.add('cdc-extension-sidebar');
  sidebar.innerHTML = `
    <div class="cdc-extension-sidebar-content">
      <div class="cdc-extension-header">
        <div class="cdc-extension-header-content">
          <h4 class="cdc-extension-title">CDC Travel Health Notices</h4>
          <p class="cdc-extension-description">CDC uses Travel Health Notices (THNs) to inform travelers about global health risks during outbreaks, special events or gatherings, and natural disasters, and to provide advice about protective actions travelers can take to prevent infection or adverse health effects. Learn more about this at <a href="">CDC Travelers' Health website</a>.</p>
        </div>
        <button id="close-sidebar" class="cdc-extension-close-button">&times;</button>
      </div>
      <div class="cdc-extension-transparency">
        <label for="transparency-slider" class="cdc-extension-transparency-label">Transparency:</label>
        <input type="range" id="transparency-slider" class="cdc-extension-transparency-slider" min="85" max="100" value="95">
      </div>
      <div class="cdc-extension-controls">
        <input type="text" id="notice-search" class="cdc-extension-search" placeholder="Search notices...">
        <button id="expand-all" class="cdc-extension-expand-button">Expand All</button>
        <button id="collapse-all" class="cdc-extension-collapse-button">Collapse All</button>
      </div>
      <div class="cdc-extension-filters">
        <div class="cdc-extension-filter-row">
          <div class="cdc-extension-filter">
            <input class="cdc-extension-filter-checkbox" type="checkbox" id="filter-level-1" checked>
            <label class="cdc-extension-filter-label" for="filter-level-1">Level 1 (<span id="level-1-count">0</span> notices)</label>
          </div>
          <div class="cdc-extension-filter">
            <input class="cdc-extension-filter-checkbox" type="checkbox" id="filter-level-2" checked>
            <label class="cdc-extension-filter-label" for="filter-level-2">Level 2 (<span id="level-2-count">0</span> notices)</label>
          </div>
          <div class="cdc-extension-filter">
            <input class="cdc-extension-filter-checkbox" type="checkbox" id="filter-level-3" checked>
            <label class="cdc-extension-filter-label" for="filter-level-3">Level 3 (<span id="level-3-count">0</span> notices)</label>
          </div>
          <div class="cdc-extension-filter">
            <input class="cdc-extension-filter-checkbox" type="checkbox" id="filter-level-4" checked>
            <label class="cdc-extension-filter-label" for="filter-level-4">Level 4 (<span id="level-4-count">0</span> notices)</label>
          </div>
        </div>
      </div>
      <div id="rss-cards-container" class="cdc-extension-rss-cards-container"></div>
    </div>
  `;

  document.body.appendChild(sidebar);

  // Add transparency slider functionality
  document.getElementById('transparency-slider').addEventListener('input', function () {
    const transparencyValue = (this.value - 85) / 100;
    const sidebarInnerElement = document.querySelector('.cdc-extension-sidebar-content');
    if (sidebarInnerElement) {
      sidebarInnerElement.style.opacity = `${1 - transparencyValue}`;
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
    document.querySelectorAll('.cdc-extension-card').forEach((card) => {
      const title = card.querySelector('.cdc-extension-card-header').innerText.toLowerCase();
      const body = card.querySelector('.cdc-extension-card-body').innerText.toLowerCase();
      card.style.display = title.includes(query) || body.includes(query) ? 'block' : 'none';
    });
  });

  // Expand/Collapse All functionality
  document.getElementById('expand-all').addEventListener('click', () => {
    document.querySelectorAll('.cdc-extension-card-body').forEach((body) => {
      body.style.display = 'block';
    });
  });

  document.getElementById('collapse-all').addEventListener('click', () => {
    document.querySelectorAll('.cdc-extension-card-body').forEach((body) => {
      body.style.display = 'none';
    });
  });

  // Add event listeners to the level filter switches
  document.querySelectorAll('.cdc-extension-filter-checkbox').forEach((filter) => {
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
      let bgColor = 'cdc-extension-level-1';  // Default Level 1
      if (title.includes('Level 2')) {
        level = '2';
        bgColor = 'cdc-extension-level-2';
      } else if (title.includes('Level 3')) {
        level = '3';
        bgColor = 'cdc-extension-level-3';
      } else if (title.includes('Level 4')) {
        level = '4';
        bgColor = 'cdc-extension-level-4';
      }

      // Increment level count
      levelCounts[level]++;

      // Remove level information from the title
      const formattedTitle = title.replace(/Level \d+ - /, '');

      // Remove extra part at the end of time
      pubDate = pubDate.replace(/\s\d{2}:\d{2}:\d{2}\sGMT/, '');

      // Create card element
      const card = document.createElement('div');
      card.classList.add('cdc-extension-card', `cdc-extension-level-${level}`);

      card.innerHTML = `
        <div class="cdc-extension-card-header ${bgColor}">
          ${formattedTitle}
        </div>
        <div class="cdc-extension-card-body">
          <div class="cdc-extension-card-meta">
            <small class="cdc-extension-card-date">${pubDate}</small>
            <small class="cdc-extension-card-category">${category}</small>
          </div>
          <h5 class="cdc-extension-card-title"><a href="${link}" target="_blank" class="cdc-extension-card-link">${formattedTitle}</a></h5>
          <p class="cdc-extension-card-description">
            ${description}
          </p>
          <button class="cdc-extension-dismiss-button">Dismiss</button>
        </div>
      `;

      // Append the card to the rss-cards-container
      if (cardsContainer) {
        cardsContainer.appendChild(card);
      }

      // Add functionality to toggle card body visibility
      card.querySelector('.cdc-extension-card-header').addEventListener('click', () => {
        const body = card.querySelector('.cdc-extension-card-body');
        body.style.display = body.style.display === 'none' ? 'block' : 'none';
      });

      // Add dismiss functionality for each card
      card.querySelector('.cdc-extension-dismiss-button').addEventListener('click', () => {
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

    // Calculate total and percentages
    const totalNotices = items.length;
    const level1Percentage = (levelCounts['1'] / totalNotices) * 100;
    const level2Percentage = (levelCounts['2'] / totalNotices) * 100;
    const level3Percentage = (levelCounts['3'] / totalNotices) * 100;
    const level4Percentage = (levelCounts['4'] / totalNotices) * 100;

    // Update ring arcs based on percentages
    document.getElementById('ring-level-1').setAttribute('stroke-dasharray', `${level1Percentage}, 100`);
    document.getElementById('ring-level-2').setAttribute('stroke-dasharray', `${level2Percentage}, 100`);
    document.getElementById('ring-level-3').setAttribute('stroke-dasharray', `${level3Percentage}, 100`);
    document.getElementById('ring-level-4').setAttribute('stroke-dasharray', `${level4Percentage}, 100`);

    // Set dashoffsets for correct positioning
    document.getElementById('ring-level-2').setAttribute('stroke-dashoffset', `-${level1Percentage}`);
    document.getElementById('ring-level-3').setAttribute('stroke-dashoffset', `-${level1Percentage + level2Percentage}`);
    document.getElementById('ring-level-4').setAttribute('stroke-dashoffset', `-${level1Percentage + level2Percentage + level3Percentage}`);

  } catch (error) {
    console.error('Failed to fetch RSS feed:', error);
    const cardsContainer = document.getElementById('rss-cards-container');
    if (cardsContainer) {
      cardsContainer.innerHTML = `<p class="cdc-extension-error-message">Failed to load travel notices. Please try again later.</p>`;
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

  document.querySelectorAll('.cdc-extension-card').forEach((card) => {
    const level = card.classList[1].split('-')[3];
    card.style.display = levelFilters[level] ? 'block' : 'none';
  });
}