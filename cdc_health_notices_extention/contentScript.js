// Add a help button to the top of the page
const helpButton = document.createElement('button');
helpButton.innerHTML = `
  CDC Travel Health Notices
  <span id="notification-badge" class="badge rounded-pill bg-danger position-absolute" style="top: -10px; right: -10px;">
    0
    <span class="visually-hidden">unread notices</span>
  </span>
`;
helpButton.id = 'help-navigate-button';
helpButton.classList.add('btn', 'btn-primary');
helpButton.style.position = 'fixed';
helpButton.style.top = '15px';
helpButton.style.right = '15px';
helpButton.style.zIndex = '1000';
helpButton.style.pointerEvents = 'auto';  // Ensure clickability
helpButton.style.display = 'flex';
helpButton.style.alignItems = 'center';
helpButton.style.justifyContent = 'center';
helpButton.style.width = 'fit-content';  // Adjust width to content
helpButton.style.padding = '10px';  // Add padding for better visibility

document.body.appendChild(helpButton);

// Fetch and display RSS feed immediately on page load
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
    <div style="position: fixed; top: 0; right: 0; width: 25%; height: 100%; background: #f8f9fa; border-left: 1px solid #ccc; z-index: 1001; overflow-y: auto; box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);">
      <h4 style="font-family: Arial, sans-serif; font-weight: bold;">CDC Travel Health Notices</h4>
      <p class="text small mb-1" style="font-size: 0.9em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; max-height: 5em;">CDC uses Travel Health Notices (THNs) to inform travelers about global health risks during outbreaks, special events or gatherings, and natural disasters, and to provide advice about protective actions travelers can take to prevent infection or adverse health effects.</p>
      <p class="small text-secondary mx-1 my-1 p-0">Learn more about this at <a href="">CDC Travelers' Health website</a>.</p>
      <div id="rss-cards-container"></div> <!-- Container for RSS feed cards -->
      <button id="close-sidebar" style="margin-top: 10px;">Close</button>
    </div>
  `;
  document.body.appendChild(sidebar);

  // Close sidebar functionality
  document.getElementById('close-sidebar').addEventListener('click', () => {
    sidebar.remove();
  });

  // Fetch and display RSS feed
  fetchAndDisplayRSS();
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
    const notificationBadge = document.getElementById('notification-badge');
    notificationBadge.innerText = items.length;
    notificationBadge.style.display = items.length > 0 ? 'inline' : 'none';

    items.forEach(item => {
      const title = item.querySelector('title').textContent;
      let pubDate = item.querySelector('pubDate').textContent;
      const category = item.querySelector('category').textContent;
      const description = item.querySelector('description').textContent;
      const link = item.querySelector('link').textContent;

      // Determine the level and corresponding background color
      let bgColor = '#26418f';  // Default Level 1
      if (title.includes('Level 2')) bgColor = '#ffd54f';
      else if (title.includes('Level 3')) bgColor = '#ffad42';
      else if (title.includes('Level 4')) bgColor = '#af4448';

      // Remove level information from the title
      const formattedTitle = title.replace(/Level \d+ - /, '');

      // Remove extra part at the end of time
      pubDate = pubDate.replace(/\s\d{2}:\d{2}:\d{2}\sGMT/, '');

      // Create card element
      const card = document.createElement('div');
      card.classList.add('card', 'mb-3');
      card.style.backgroundColor = 'white';
      card.style.borderRadius = '8px';
      card.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
      card.style.padding = '15px';

      card.innerHTML = `
        <div class="card-header" style="background-color: ${bgColor}; color: white; border-radius: 5px 5px 0 0; font-family: Arial, sans-serif; font-weight: bold;">
          ${formattedTitle}
        </div>
        <div class="card-body" style="padding: 10px;">
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

      // Add dismiss functionality for each card
      card.querySelector('.dismiss-card').addEventListener('click', () => {
        card.remove();
        updateNotificationBadge();
      });
    });
  } catch (error) {
    console.error('Failed to fetch RSS feed:', error);
    const cardsContainer = document.getElementById('rss-cards-container');
    if (cardsContainer) {
      cardsContainer.innerHTML = `<p class="text-danger">Failed to load travel notices. Please try again later.</p>`;
    }
  }
}

// Function to update the notification badge
function updateNotificationBadge() {
  const remainingCards = document.querySelectorAll('#rss-cards-container .card').length;
  const notificationBadge = document.getElementById('notification-badge');
  notificationBadge.innerText = remainingCards;
  notificationBadge.style.display = remainingCards > 0 ? 'inline' : 'none';
}