document.getElementById('open-assistant').addEventListener('click', () => {
  // Send a message to the content script to open the sidebar
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'openSidebar' });
  });
});