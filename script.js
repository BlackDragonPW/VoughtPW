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
// CAROUSEL FUNCTIONALITY (FIXED)
// ======================
let currentAngle = 0;
const carousel = document.getElementById("carousel");
const dots = document.querySelectorAll('.dot');
const totalSlides = 5;
let autoRotateInterval;

// Update carousel rotation and dots
function updateCarousel() {
  carousel.style.transform = `rotateY(${currentAngle}deg)`;
  updateDots();
}

// Update dot indicators
function updateDots() {
  // Calculate current slide (0-4) based on angle
  let slideIndex = Math.round((360 - (currentAngle % 360)) / 72;
  slideIndex = slideIndex % totalSlides; // Ensure it's within 0-4
  
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === slideIndex);
  });
}

// Rotate carousel by specified angle
function rotateCarousel(angleChange) {
  currentAngle += angleChange;
  updateCarousel();
  resetAutoRotate();
}

// Rotate to specific slide index
function rotateToSlide(slideIndex) {
  currentAngle = 360 - (slideIndex * 72);
  updateCarousel();
  resetAutoRotate();
}

// Reset auto-rotation timer
function resetAutoRotate() {
  clearInterval(autoRotateInterval);
  autoRotateInterval = setInterval(() => rotateCarousel(-72), 5000); // Rotate left every 5 sec
}

// Initialize carousel
updateCarousel();
resetAutoRotate();

// Make functions available globally
window.rotateCarousel = rotateCarousel;
window.rotateToSlide = rotateToSlide;

// Event listeners for arrow controls
document.querySelector('.controls button:nth-child(1)').addEventListener('click', () => {
  rotateCarousel(72); // Left arrow rotates clockwise (positive)
});

document.querySelector('.controls button:nth-child(2)').addEventListener('click', () => {
  rotateCarousel(-72); // Right arrow rotates counter-clockwise (negative)
});

// Pause auto-rotation on hover
carousel.addEventListener('mouseenter', () => {
  clearInterval(autoRotateInterval);
});

carousel.addEventListener('mouseleave', resetAutoRotate);

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
});

// Close auth overlay
closeAuth.addEventListener('click', () => {
  document.body.classList.remove('no-scroll');
  authOverlay.classList.remove('active');
});

// Handle login
loginBtn.addEventListener('click', () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  
  if (!email || !password) {
    showStatus('Please enter both email and password', 'error');
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      showStatus('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = "member-portal.html";
      }, 1500);
    })
    .catch((error) => {
      showStatus(getErrorMessage(error), 'error');
    });
});

// Helper functions
function showStatus(message, type) {
  loginStatus.textContent = message;
  loginStatus.className = `status-message ${type}`;
}

function getErrorMessage(error) {
  switch (error.code) {
    case 'auth/invalid-email': return 'Invalid email format';
    case 'auth/user-disabled': return 'Account disabled';
    case 'auth/user-not-found': return 'Account not found';
    case 'auth/wrong-password': return 'Incorrect password';
    case 'auth/too-many-requests': return 'Too many attempts. Try again later.';
    default: return 'Login failed. Please try again.';
  }
}

// Close overlay when clicking outside
authOverlay.addEventListener('click', (e) => {
  if (e.target === authOverlay) {
    document.body.classList.remove('no-scroll');
    authOverlay.classList.remove('active');
  }
});

// Check auth state
auth.onAuthStateChanged((user) => {
  if (user && !window.location.pathname.includes('index.html')) {
    window.location.href = "member-portal.html";
  }
});
