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

// Prevent Firebase re-initialization
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();


// ======================
// CAROUSEL - GUARANTEED WORKING ARROWS
// ======================
document.addEventListener('DOMContentLoaded', function () {
  const carousel = document.getElementById("carousel");
  const leftBtn = document.querySelector('.controls button:first-child');
  const rightBtn = document.querySelector('.controls button:last-child');
  const dots = document.querySelectorAll('.dot');

  if (!carousel || !leftBtn || !rightBtn || dots.length === 0) {
    console.error("Carousel or controls not found.");
    return;
  }

  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  const anglePerSlide = 360 / totalSlides;
  let currentAngle = 0;
  let isAnimating = false;
  let autoRotateInterval;

  slides.forEach((slide, index) => {
    slide.style.transform = `rotateY(${index * anglePerSlide}deg) translateZ(500px)`;
  });

  function rotateCarousel(angleChange) {
    if (isAnimating) return;

    isAnimating = true;
    currentAngle += angleChange;
    carousel.style.transform = `rotateY(${currentAngle}deg)`;
    updateActiveDot();

    setTimeout(() => {
      isAnimating = false;
    }, 800);
  }

  function updateActiveDot() {
    const activeDotIndex = Math.round((360 - (currentAngle % 360)) / anglePerSlide) % totalSlides;
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeDotIndex);
    });
  }

  leftBtn.addEventListener('click', () => {
    rotateCarousel(anglePerSlide);
    resetAutoRotate();
  });

  rightBtn.addEventListener('click', () => {
    rotateCarousel(-anglePerSlide);
    resetAutoRotate();
  });

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

  function startAutoRotate() {
    autoRotateInterval = setInterval(() => {
      rotateCarousel(-anglePerSlide);
    }, 5000);
  }

  function resetAutoRotate() {
    clearInterval(autoRotateInterval);
    startAutoRotate();
  }

  updateActiveDot();
  startAutoRotate();

  carousel.addEventListener('mouseenter', () => clearInterval(autoRotateInterval));
  carousel.addEventListener('mouseleave', resetAutoRotate);
});


// ======================
// AUTHENTICATION SYSTEM
// ======================
document.addEventListener('DOMContentLoaded', () => {
  const authOverlay = document.getElementById('authOverlay');
  const joinNowBtn = document.getElementById('joinNowBtn');
  const closeAuth = document.getElementById('closeAuth');
  const loginBtn = document.getElementById('loginBtn');
  const loginStatus = document.getElementById('loginStatus');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');

  function toggleAuthOverlay(show) {
    document.body.classList.toggle('no-scroll', show);
    authOverlay.classList.toggle('active', show);
    if (show) loginEmail.focus();
  }

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

      await auth.signInWithEmailAndPassword(email, password);

      showStatus('Access granted! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = "member-portal.html";
      }, 1500);

    } catch (error) {
      handleAuthError(error);
      loginBtn.disabled = false;
    }
  }

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

  function showStatus(message, type) {
    loginStatus.textContent = message;
    loginStatus.className = `status-message ${type}`;
  }

  // Event Listeners
  if (joinNowBtn && closeAuth && loginBtn) {
    joinNowBtn.addEventListener('click', () => toggleAuthOverlay(true));
    closeAuth.addEventListener('click', () => toggleAuthOverlay(false));
    loginBtn.addEventListener('click', handleLogin);
    loginPassword.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
  }

  auth.onAuthStateChanged((user) => {
    if (user && !window.location.pathname.endsWith('index.html')) {
      window.location.href = "member-portal.html";
    }
  });
});
