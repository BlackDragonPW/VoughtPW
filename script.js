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
const rememberMeCheckbox = document.getElementById('rememberMe');
const errorMessage = document.getElementById('errorMessage');

// Check for remembered user
document.addEventListener('DOMContentLoaded', () => {
  const rememberedEmail = localStorage.getItem('rememberedEmail');
  if (rememberedEmail) {
    emailInput.value = rememberedEmail;
    rememberMeCheckbox.checked = true;
  }
});

// Login Form Submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const nationId = nationIdInput.value;
  const rememberMe = rememberMeCheckbox.checked;

  // Validate inputs
  if (!email || !password || !nationId) {
    showError('Please fill in all fields');
    return;
  }

  try {
    // Show loading state
    const loginBtn = loginForm.querySelector('button');
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> VERIFYING';

    // Set persistence based on remember me
    const persistence = rememberMe ? 
      firebase.auth.Auth.Persistence.LOCAL : 
      firebase.auth.Auth.Persistence.SESSION;

    await auth.setPersistence(persistence);

    // 1. Authenticate with Firebase Auth
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    
    // 2. Verify approval status in Firestore
    const userDoc = await db.collection('approvedUsers').doc(email).get();
    
    if (!userDoc.exists) {
      await auth.signOut();
      throw new Error('Account not approved. Contact your alliance admin.');
    }
    
    // 3. Verify Nation ID match
    if (userDoc.data().nationId !== Number(nationId)) {
      await auth.signOut();
      throw new Error('Nation ID does not match our records');
    }
    
    // Remember email if checked
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    
    // Login successful - redirect
    window.location.href = 'dashboard.html';
    
  } catch (error) {
    console.error('Login error:', error);
    handleLoginError(error);
  } finally {
    // Reset button state
    const loginBtn = loginForm.querySelector('button');
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.innerHTML = '<span class="btn-text">ACCESS SYSTEM</span> <i class="fas fa-arrow-right btn-icon"></i>';
    }
  }
});

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}

function handleLoginError(error) {
  let message = 'Login failed. Please try again.';
  
  if (error.code) {
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'Account not found';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email format';
        break;
      case 'auth/too-many-requests':
        message = 'Too many attempts. Try again later.';
        break;
    }
  } else if (error.message) {
    if (error.message.includes('not approved')) message = error.message;
    if (error.message.includes('Nation ID')) message = error.message;
  }
  
  showError(message);
}

// Check if dashboard exists before redirecting
async function checkDashboardExists() {
  try {
    const response = await fetch('dashboard.html', { method: 'HEAD' });
    if (!response.ok) {
      throw new Error('Dashboard page not found');
    }
  } catch (error) {
    console.error('Dashboard check failed:', error);
    showError('System error. Please contact admin.');
    return false;
  }
  return true;
}
