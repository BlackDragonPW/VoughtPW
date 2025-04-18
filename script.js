// Carousel functionality
let angle = 0;
const carousel = document.getElementById("carousel");
const dots = document.querySelectorAll('.dot');
const totalSlides = 5;
let autoRotateInterval;

function updateDots() {
  const currentSlide = (360 - (angle % 360)) / 72;
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentSlide);
  });
}

function rotateCarousel(direction) {
  angle += direction * 72;
  carousel.style.transform = `rotateY(${angle}deg)`;
  updateDots();
  resetAutoRotate();
}

function rotateToSlide(slideIndex) {
  angle = 360 - (slideIndex * 72);
  carousel.style.transform = `rotateY(${angle}deg)`;
  updateDots();
  resetAutoRotate();
}

function resetAutoRotate() {
  clearInterval(autoRotateInterval);
  autoRotateInterval = setInterval(() => rotateCarousel(-1), 5000);
}

// Make functions available globally
window.rotateCarousel = rotateCarousel;
window.rotateToSlide = rotateToSlide;

// Start auto rotation
resetAutoRotate();

// Pause auto rotation on hover
carousel.addEventListener('mouseenter', () => {
  clearInterval(autoRotateInterval);
});

carousel.addEventListener('mouseleave', resetAutoRotate);

// Initialize dots
updateDots();

// Auth Overlay Functionality
const authOverlay = document.getElementById('authOverlay');
const joinNowBtn = document.getElementById('joinNowBtn');
const closeAuth = document.getElementById('closeAuth');
const loginBtn = document.getElementById('loginBtn');
const loginStatus = document.getElementById('loginStatus');

// Show auth overlay
joinNowBtn.addEventListener('click', () => {
  document.body.classList.add('no-scroll');
  authOverlay.classList.add('active');
});

// Close auth overlay
closeAuth.addEventListener('click', () => {
  document.body.classList.remove('no-scroll');
  authOverlay.classList.remove('active');
});

// Login functionality
loginBtn.addEventListener('click', () => {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  if(!email || !password) {
    loginStatus.textContent = 'Please fill in all fields';
    loginStatus.className = 'status-message error';
    return;
  }
  
  // Here you would normally verify the credentials with Firebase
  // For now we'll simulate a successful login
  if(email.endsWith('@vought.com')) {
    loginStatus.textContent = 'Login successful! Redirecting...';
    loginStatus.className = 'status-message success';
    
    // Simulate redirect after login
    setTimeout(() => {
      loginStatus.textContent = 'Redirecting to member portal...';
      // In a real implementation, you would redirect or show member content
    }, 1500);
  } else {
    loginStatus.textContent = 'Only vought.com emails are allowed';
    loginStatus.className = 'status-message error';
  }
});

// Close overlay when clicking outside the auth card
authOverlay.addEventListener('click', (e) => {
  if(e.target === authOverlay) {
    document.body.classList.remove('no-scroll');
    authOverlay.classList.remove('active');
  }
});
