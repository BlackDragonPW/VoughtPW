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
const db = firebase.firestore();

// DOM Elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const nationIdInput = document.getElementById('nationId');
const errorMessage = document.getElementById('errorMessage');

// Login Form Submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = emailInput.value;
  const password = passwordInput.value;
  const nationId = nationIdInput.value;
  
  // Clear previous messages
  errorMessage.textContent = '';
  errorMessage.style.color = 'var(--primary)';
  errorMessage.textContent = 'Verifying credentials...';
  
  try {
    // Show loading state
    const loginBtn = loginForm.querySelector('button');
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESSING';
    
    // Check Firestore for approved user
    const userDoc = await db.collection('approvedUsers').doc(email).get();
    
    if (!userDoc.exists) {
      showError('Account not found. Contact admin for access.');
      return;
    }
    
    const userData = userDoc.data();
    if (userData.nationId !== Number(nationId)) {
      showError('Nation ID does not match our records');
      return;
    }
    
    // Sign in with Firebase Auth
    await auth.signInWithEmailAndPassword(email, password);
    
    // Update status message
    errorMessage.style.color = 'var(--primary)';
    errorMessage.textContent = 'Login successful! Redirecting...';
    
    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
    
  } catch (error) {
    console.error('Login error:', error);
    handleAuthError(error);
  } finally {
    // Reset button state
    const loginBtn = loginForm.querySelector('button');
    loginBtn.disabled = false;
    loginBtn.innerHTML = '<span class="btn-text">ACCESS SYSTEM</span> <i class="fas fa-arrow-right btn-icon"></i>';
  }
});

function handleAuthError(error) {
  let errorMsg = 'Authentication failed';
  switch (error.code) {
    case 'auth/user-not-found':
      errorMsg = 'Email not registered';
      break;
    case 'auth/wrong-password':
      errorMsg = 'Incorrect password';
      break;
    case 'auth/too-many-requests':
      errorMsg = 'Too many attempts. Try again later.';
      break;
    default:
      errorMsg = error.message || 'Login failed. Please try again.';
  }
  showError(errorMsg);
}

function showError(message) {
  errorMessage.style.color = 'var(--secondary)';
  errorMessage.textContent = message;
}
