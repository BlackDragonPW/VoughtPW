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
let angle = 0;
const carousel = document.getElementById("carousel");
const dots = document.querySelectorAll('.dot');
let autoRotateInterval;

// Update dot indicators
function updateDots() {
  const currentSlide = (360 - (angle % 360)) / 72;
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentSlide);
  });
}

// Rotate carousel by specified direction
function rotateCarousel(direction) {
  angle += direction * 72;
  carousel.style.transform = `rotateY(${angle}deg)`;
  updateDots();
  resetAutoRotate();
}

// Rotate to specific slide
function rotateToSlide(slideIndex) {
  angle = 360 - (slideIndex * 72);
  carousel.style.transform = `rotateY(${angle}deg)`;
  updateDots();
  resetAutoRotate();
}

// Reset auto-rotation timer
function resetAutoRotate() {
  clearInterval(autoRotateInterval);
  autoRotateInterval = setInterval(() => rotateCarousel(-1), 5000);
}

// Make functions globally available
window.rotateCarousel = rotateCarousel;
window.rotateToSlide = rotateToSlide;

// Initialize carousel
resetAutoRotate();

// Pause auto-rotation on hover
carousel.addEventListener('mouseenter', () => {
  clearInterval(autoRotateInterval);
});

carousel.addEventListener('mouseleave', resetAutoRotate);

// Initialize dots
updateDots();

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

// Show auth overlay
joinNowBtn.addEventListener('click', () => {
  document.body.classList.add('no-scroll');
  authOverlay.classList.add('active');
  loginEmail.focus();
});

// Close auth overlay
closeAuth.addEventListener('click', () => {
  document.body.classList.remove('no-scroll');
  authOverlay.classList.remove('active');
});

// Handle login form submission
loginBtn.addEventListener('click', handleLogin);

// Also allow login on Enter key
loginPassword.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleLogin();
  }
});

async function handleLogin() {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  
  // Validate inputs
  if (!email || !password) {
    showStatus('Please enter both email and password', 'error');
    return;
  }

  try {
    showStatus('Authenticating...', '');
    loginBtn.disabled = true;
    
    // Attempt Firebase authentication
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    
    // Successful login
    showStatus('Login successful! Redirecting...', 'success');
    
    // Store login state in session
    sessionStorage.setItem('voughtAuthenticated', 'true');
    
    // Redirect after delay
    setTimeout(() => {
      window.location.href = "member-portal.html";
    }, 1500);
    
  } catch (error) {
    handleAuthError(error);
    loginBtn.disabled = false;
  }
}

// Handle different authentication errors
function handleAuthError(error) {
  let errorMessage = 'Login failed. Please try again.';
  
  switch (error.code) {
    case 'auth/invalid-email':
      errorMessage = 'Invalid email format';
      break;
    case 'auth/user-disabled':
      errorMessage = 'This account has been disabled';
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
    case 'auth/network-request-failed':
      errorMessage = 'Network error. Check your connection.';
      break;
    default:
      console.error('Authentication error:', error);
  }
  
  showStatus(errorMessage, 'error');
  loginPassword.value = '';
  loginPassword.focus();
}

// Display status messages
function showStatus(message, type) {
  loginStatus.textContent = message;
  loginStatus.className = type ? `status-message ${type}` : 'status-message';
}

// Close overlay when clicking outside
authOverlay.addEventListener('click', (e) => {
  if (e.target === authOverlay) {
    document.body.classList.remove('no-scroll');
    authOverlay.classList.remove('active');
  }
});

// Check authentication state on page load
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is logged in
    console.log('Authenticated user:', user.email);
    
    // If user somehow reached login page while authenticated
    if (window.location.pathname.includes('member-portal.html')) {
      window.location.href = "member-portal.html";
    }
  } else {
    // User is logged out
    console.log('User logged out');
    
    // Clear session if not on main page
    if (!window.location.pathname.endsWith('/') && 
        !window.location.pathname.endsWith('index.html')) {
      sessionStorage.removeItem('voughtAuthenticated');
    }
  }
});

// Check for redirect from member portal (logout)
if (sessionStorage.getItem('logoutRedirect')) {
  sessionStorage.removeItem('logoutRedirect');
  showStatus('You have been logged out successfully', 'success');
  setTimeout(() => {
    const statusElement = document.getElementById('loginStatus');
    if (statusElement) statusElement.textContent = '';
  }, 3000);
}

// ======================
// SESSION MANAGEMENT
// ======================

// Check for existing session on page load
window.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('voughtAuthenticated') {
    auth.currentUser?.getIdToken().then(token => {
      // You could verify token with backend here if needed
      console.log('User session maintained');
    }).catch(() => {
      sessionStorage.removeItem('voughtAuthenticated');
    });
  }
});

// Sample logout function (for member-portal.html)
window.logoutUser = function() {
  auth.signOut().then(() => {
    sessionStorage.removeItem('voughtAuthenticated');
    sessionStorage.setItem('logoutRedirect', 'true');
    window.location.href = "index.html";
  }).catch(error => {
    console.error('Logout error:', error);
  });
};
