// Function to check if dark mode is enabled
 // Get the toggle switch and its associated elements

const moonIcon = document.querySelector('.icon.moon');
 const sunIcon = document.querySelector('.icon.sun');
 const body = document.body;
function isDarkMode() {
  return document.body.classList.contains('dark-mode');
}

// Function to toggle between light and dark mode
function toggleLightDarkMode() {
  const body = document.body;
  const moonIcon = document.querySelector('.icon.moon');
  const sunIcon = document.querySelector('.icon.sun');

  if (isDarkMode()) {
    // If dark mode is enabled, switch to light mode
    body.classList.remove('dark-mode');
    sunIcon.style.transform = 'scale(0)';
    moonIcon.style.transform = 'scale(1)';
  } else {
    // If light mode is enabled, switch to dark mode
    body.classList.add('dark-mode');
    moonIcon.style.transform = 'scale(0)';
    sunIcon.style.transform = 'scale(1)';
  }

  // Save the user's preference in local storage
  localStorage.setItem('preferredMode', isDarkMode() ? 'dark' : 'light');
}

// Check if the user has a preference for dark mode using local storage
const preferredMode = localStorage.getItem('preferredMode');
if (preferredMode === 'dark') {
  // If user prefers dark mode, enable it by default
  toggleLightDarkMode();
}

// Add event listener to the toggle switch
const toggleSwitch = document.getElementById('toggle-light-mode');
toggleSwitch.addEventListener('change', toggleLightDarkMode);
