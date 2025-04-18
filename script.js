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

// Carousel functionality (unchanged)
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

window.rotateCarousel = rotateCarousel;
window.rotateToSlide = rotateToSlide;

resetAutoRotate();

carousel.addEventListener('mouseenter', () => {
  clearInterval(autoRotateInterval);
});

carousel.addEventListener('mouseleave', resetAutoRotate);
updateDots();

// Auth Functionality with Strict Validation
const authOverlay = document.getElementById('authOverlay');
const joinNowBtn = document.getElementById('joinNowBtn');
const closeAuth = document.getElementById('closeAuth');
const loginBtn = document.getElementById('loginBtn');
const loginStatus = document.getElementById('loginStatus');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');

// Show/hide auth overlay
joinNowBtn.addEventListener('click', () => {
  document.body.classList.add('no-scroll');
  authOverlay.classList.add('active');
});

closeAuth.addEventListener('click', () => {
  document.body.classList.remove('no-scroll');
  authOverlay.classList.remove('active');
});

// Strict Login Validation
loginBtn.addEventListener('click', async () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  
  if (!email || !password) {
    showStatus('Please fill in all fields', 'error');
    return;
  }

  try {
    showStatus('Verifying credentials...', 'success');
    
    // Attempt sign in
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    
    // If successful, check if email is verified (optional)
    if (userCredential.user) {
      showStatus('Login successful! Redirecting...', 'success');
      
      // Optional: Check if email is verified
      if (!userCredential.user.emailVerified) {
        // If you require email verification
        await auth.signOut();
        showStatus('Please verify your email first', 'error');
        return;
      }
      
      // Redirect to member area after short delay
      setTimeout(() => {
        window.location.href = "member-portal.html";
      }, 1500);
    }
  } catch (error) {
    let errorMessage;
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
      default:
        errorMessage = 'Login failed. Please try again later.';
        console.error('Login error:', error);
    }
    showStatus(errorMessage, 'error');
  }
});

// Helper function
function showStatus(message, type) {
  loginStatus.textContent = message;
  loginStatus.className = `status-message ${type}`;
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
  if (user) {
    console.log("Authenticated user:", user.email);
    // You could automatically redirect here if preferred
  }
});
