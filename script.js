// ======================
// CAROUSEL - GUARANTEED WORKING ARROWS
// ======================
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const carousel = document.getElementById("carousel");
  const leftBtn = document.querySelector('.controls button:first-child');
  const rightBtn = document.querySelector('.controls button:last-child');
  const dots = document.querySelectorAll('.dot');
  
  // Settings
  const slideCount = 5;
  const anglePerSlide = 360 / slideCount;
  let currentAngle = 0;
  let autoRotateInterval;

  // Initialize slides
  const slides = document.querySelectorAll('.slide');
  slides.forEach((slide, index) => {
    const angle = index * anglePerSlide;
    slide.style.transform = `rotateY(${angle}deg) translateZ(500px)`;
  });

  // Rotate function
  function rotate(angleChange) {
    currentAngle += angleChange;
    carousel.style.transform = `rotateY(${currentAngle}deg)`;
    updateDots();
  }

  // Update dot indicators
  function updateDots() {
    const activeDot = ((360 - (currentAngle % 360)) / anglePerSlide % slideCount;
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeDot);
    });
  }

  // Arrow controls (THIS IS THE CRUCIAL FIX)
  leftBtn.addEventListener('click', () => {
    rotate(anglePerSlide); // Rotate clockwise (right movement)
    resetAutoRotate();
  });

  rightBtn.addEventListener('click', () => {
    rotate(-anglePerSlide); // Rotate counter-clockwise (left movement)
    resetAutoRotate();
  });

  // Dot controls
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentAngle = 360 - (index * anglePerSlide);
      carousel.style.transform = `rotateY(${currentAngle}deg)`;
      updateDots();
      resetAutoRotate();
    });
  });

  // Auto-rotation
  function resetAutoRotate() {
    clearInterval(autoRotateInterval);
    autoRotateInterval = setInterval(() => {
      rotate(-anglePerSlide); // Auto-rotate right
    }, 5000);
  }

  // Initialize
  updateDots();
  resetAutoRotate();

  // Pause on hover
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
