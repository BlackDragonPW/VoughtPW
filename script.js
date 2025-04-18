// ======================
// FIREBASE INITIALIZATION
// ======================
const firebaseConfig = {
  apiKey: "AIzaSyDHrUcv8c6S04STttlQ8Ck02SuXdeM3psw",
  authDomain: "vought-international-eb8c7.firebaseapp.com",
  projectId: "vought-international-eb8c7",
  storageBucket: "vought-international-eb8c7.appspot.com",
  messagingSenderId: "596496897354",
  appId: "1:596496897354:web:8605892781e81358fb9db3",
  measurementId: "G-RL72T75YEV"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ======================
// CAROUSEL - GUARANTEED WORKING ARROWS
// ======================
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const carousel = document.getElementById("carousel");
  const leftBtn = document.querySelector('.controls button:first-child');
  const rightBtn = document.querySelector('.controls button:last-child');
  const dots = document.querySelectorAll('.dot');
  
  // Carousel Settings
  const totalSlides = 5;
  const anglePerSlide = 360 / totalSlides;
  let currentAngle = 0;
  let isAnimating = false;
  let autoRotateInterval;

  // Initialize Slide Positions
  const slides = document.querySelectorAll('.slide');
  slides.forEach((slide, index) => {
    slide.style.transform = `rotateY(${index * anglePerSlide}deg) translateZ(500px)`;
  });

  // Rotate Carousel Function
  function rotateCarousel(angleChange) {
    if (isAnimating) return;
    
    isAnimating = true;
    currentAngle += angleChange;
    
    carousel.style.transform = `rotateY(${currentAngle}deg)`;
    updateActiveDot();
    
    setTimeout(() => {
      isAnimating = false;
    }, 800); // Matches CSS transition duration
  }

  // Update Active Dot
  function updateActiveDot() {
    const activeDotIndex = Math.round((360 - (currentAngle % 360)) / anglePerSlide) % totalSlides;
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeDotIndex);
    });
  }

  // Arrow Controls (THIS IS WHAT FIXES THE ARROWS)
  leftBtn.addEventListener('click', () => {
    rotateCarousel(anglePerSlide); // Moves to previous slide
    resetAutoRotate();
  });

  rightBtn.addEventListener('click', () => {
    rotateCarousel(-anglePerSlide); // Moves to next slide
    resetAutoRotate();
  });

  // Dot Navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      const targetAngle = index * -anglePerSlide;
      const shortestRotation = ((targetAngle - currentAngle + 540) % 360) - 180;
      currentAngle += shortestRotation;
      carousel.style.transform = `rotateY(${currentAngle}deg)`;
      updateActiveDot();
      resetAutoRotate();
    });
  });

  // Auto-Rotation
  function startAutoRotate() {
    autoRotateInterval = setInterval(() => {
      rotateCarousel(-anglePerSlide); // Auto-rotate right
    }, 5000);
  }

  function resetAutoRotate() {
    clearInterval(autoRotateInterval);
    startAutoRotate();
  }

  // Initialize
  updateActiveDot();
  startAutoRotate();

  // Pause on Hover
  carousel.addEventListener('mouseenter', () => clearInterval(autoRotateInterval));
  carousel.addEventListener('mouseleave', resetAutoRotate);
});

// ======================
// AUTHENTICATION SYSTEM
// ======================
const authOverlay = document.getElementById('authOverlay');
const joinNowBtn = document.getElementById('joinNowBtn');
const closeAuth = document.getElementById('closeAuth');
const loginBtn = document.getElementById('loginBtn');
const loginStatus = document.getElementById('loginStatus');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');

// Toggle Auth Overlay
function toggleAuthOverlay(show) {
  document.body.classList.toggle('no-scroll', show);
  authOverlay.classList.toggle('active', show);
  if (show) loginEmail.focus();
}

// Login Function
async function handleLogin() {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    showStatus('Please enter both email and password', 'error');
    return;
  }

  try {
    showStatus('Authenticating...', 'info');
    loginBtn.disabled = true;
    
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    
    showStatus('Access granted! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = "member-portal.html";
    }, 1500);
    
  } catch (error) {
    handleAuthError(error);
    loginBtn.disabled = false;
  }
}

// Error Handling
function handleAuthError(error) {
  const errorMap = {
    'auth/invalid-email': 'Invalid email address',
    'auth/user-disabled': 'Account disabled',
    'auth/user-not-found': 'Account not found',
    'auth/wrong-password': 'Incorrect password',
    'auth/too-many-requests': 'Too many attempts. Try again later.'
  };
  
  showStatus(errorMap[error.code] || 'Authentication failed', 'error');
  loginPassword.value = '';
}

// Show Status Messages
function showStatus(message, type) {
  loginStatus.textContent = message;
  loginStatus.className = `status-message ${type}`;
}

// Event Listeners
joinNowBtn.addEventListener('click', () => toggleAuthOverlay(true));
closeAuth.addEventListener('click', () => toggleAuthOverlay(false));
loginBtn.addEventListener('click', handleLogin);
loginPassword.addEventListener('keypress', (e) => e.key === 'Enter' && handleLogin());

// Auth State Listener
auth.onAuthStateChanged((user) => {
  if (user && !window.location.pathname.endsWith('index.html')) {
    window.location.href = "member-portal.html";
  }
});
