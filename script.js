// Firebase configuration
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
// CAROUSEL FUNCTIONALITY
// ======================
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const carousel = document.getElementById("carousel");
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");
  
  // Carousel settings
  const totalSlides = 5;
  const angleBetweenSlides = 360 / totalSlides;
  let currentAngle = 0;
  let autoRotateInterval;
  let isRotating = false;
  const rotationDuration = 800; // ms

  // Initialize slide positions
  function initSlides() {
    slides.forEach((slide, index) => {
      const angle = index * angleBetweenSlides;
      slide.style.transform = `rotateY(${angle}deg) translateZ(500px)`;
    });
  }

  // Rotate carousel with animation
  function rotateCarousel(angleChange) {
    if (isRotating) return;
    isRotating = true;
    
    currentAngle += angleChange;
    carousel.style.transform = `rotateY(${currentAngle}deg)`;
    
    // Update dots after animation completes
    setTimeout(() => {
      updateDots();
      isRotating = false;
    }, rotationDuration);
    
    resetAutoRotate();
  }

  // Update dot indicators
  function updateDots() {
    const activeDotIndex = Math.round((360 - (currentAngle % 360)) / angleBetweenSlides) % totalSlides;
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeDotIndex);
    });
  }

  // Auto-rotation
  function startAutoRotate() {
    autoRotateInterval = setInterval(() => {
      rotateCarousel(-angleBetweenSlides);
    }, 5000);
  }

  function resetAutoRotate() {
    clearInterval(autoRotateInterval);
    startAutoRotate();
  }

  // Event listeners
  leftBtn.addEventListener('click', () => {
    rotateCarousel(angleBetweenSlides);
  });

  rightBtn.addEventListener('click', () => {
    rotateCarousel(-angleBetweenSlides);
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      const targetAngle = 360 - (index * angleBetweenSlides);
      const angleDiff = targetAngle - (currentAngle % 360);
      const shortestAngle = ((angleDiff + 180) % 360) - 180;
      currentAngle += shortestAngle;
      carousel.style.transform = `rotateY(${currentAngle}deg)`;
      updateDots();
      resetAutoRotate();
    });
  });

  // Pause on hover
  carousel.addEventListener('mouseenter', () => {
    clearInterval(autoRotateInterval);
  });

  carousel.addEventListener('mouseleave', () => {
    startAutoRotate();
  });

  // Initialize
  initSlides();
  startAutoRotate();
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

// Show/hide auth overlay
function toggleAuthOverlay(show) {
  document.body.classList.toggle('no-scroll', show);
  authOverlay.classList.toggle('active', show);
  if (show) loginEmail.focus();
}

joinNowBtn.addEventListener('click', () => toggleAuthOverlay(true));
closeAuth.addEventListener('click', () => toggleAuthOverlay(false));

// Handle login
async function handleLogin() {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  // Validation
  if (!email || !password) {
    showStatus('Please enter both email and password', 'error');
    return;
  }

  if (!email.endsWith('@vought.com')) {
    showStatus('Only @vought.com emails are allowed', 'error');
    return;
  }

  try {
    showStatus('Authenticating...', '');
    loginBtn.disabled = true;

    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    
    // Successful login
    showStatus('Login successful! Redirecting...', 'success');
    sessionStorage.setItem('voughtAuthenticated', 'true');
    
    setTimeout(() => {
      window.location.href = "member-portal.html";
    }, 1500);

  } catch (error) {
    handleAuthError(error);
    loginBtn.disabled = false;
  }
}

// Handle auth errors
function handleAuthError(error) {
  let errorMessage = 'Login failed. Please try again.';
  
  switch (error.code) {
    case 'auth/invalid-email':
      errorMessage = 'Invalid email format';
      break;
    case 'auth/user-disabled':
      errorMessage = 'Account disabled';
      break;
    case 'auth/user-not-found':
      errorMessage = 'Account not found';
      break;
    case 'auth/wrong-password':
      errorMessage = 'Incorrect password';
      break;
    case 'auth/too-many-requests':
      errorMessage = 'Too many attempts. Try again later.';
      break;
    default:
      console.error('Auth error:', error);
  }

  showStatus(errorMessage, 'error');
  loginPassword.value = '';
  loginPassword.focus();
}

// Show status messages
function showStatus(message, type) {
  loginStatus.textContent = message;
  loginStatus.className = type ? `status-message ${type}` : 'status-message';
}

// Event listeners
loginBtn.addEventListener('click', handleLogin);
loginPassword.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleLogin();
});

authOverlay.addEventListener('click', (e) => {
  if (e.target === authOverlay) toggleAuthOverlay(false);
});

// Check auth state
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User logged in:', user.email);
    if (!window.location.pathname.includes('member-portal.html')) {
      window.location.href = "member-portal.html";
    }
  } else {
    console.log('User logged out');
    if (!window.location.pathname.endsWith('index.html')) {
      sessionStorage.removeItem('voughtAuthenticated');
    }
  }
});

// Check for logout redirect
if (sessionStorage.getItem('logoutRedirect')) {
  sessionStorage.removeItem('logoutRedirect');
  showStatus('You have been logged out successfully', 'success');
  setTimeout(() => {
    if (document.getElementById('loginStatus')) {
      document.getElementById('loginStatus').textContent = '';
    }
  }, 3000);
        }
