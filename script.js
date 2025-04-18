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
const tokenBtn = document.getElementById('tokenBtn');
const tokenStatus = document.getElementById('tokenStatus');

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

// Token verification
tokenBtn.addEventListener('click', () => {
  const token = document.getElementById('accessToken').value;
  
  if(!token) {
    tokenStatus.textContent = 'Please enter your access token';
    tokenStatus.className = 'status-message error';
    return;
  }
  
  // Here you would normally verify the token with Firebase
  // For now we'll simulate a successful verification
  tokenStatus.textContent = 'Token verified! Redirecting...';
  tokenStatus.className = 'status-message success';
  
  // Simulate redirect after verification
  setTimeout(() => {
    tokenStatus.textContent = 'Redirecting to member portal...';
    // In a real implementation, you would redirect or show member content
  }, 1500);
});

// Close overlay when clicking outside the auth card
authOverlay.addEventListener('click', (e) => {
  if(e.target === authOverlay) {
    document.body.classList.remove('no-scroll');
    authOverlay.classList.remove('active');
  }
});
