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
const loginOverlay = document.querySelector('.login-overlay');
const mainContent = document.getElementById('mainContent');

// Login Form Submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = emailInput.value;
  const password = passwordInput.value;
  const nationId = nationIdInput.value;
  
  // Validate inputs
  if (!email || !password || !nationId) {
    showError('All fields are required');
    return;
  }
  
  if (!/^\d+$/.test(nationId)) {
    showError('Nation ID must be a valid number');
    return;
  }
  
  try {
    // Show loading state
    const loginBtn = loginForm.querySelector('button');
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AUTHENTICATING';
    
    // Check if user exists in Firestore and has matching nation ID
    const userDoc = await db.collection('approvedUsers').doc(email).get();
    
    if (!userDoc.exists) {
      showError('Unauthorized access. Your email is not approved.');
      loginBtn.disabled = false;
      loginBtn.innerHTML = '<span class="btn-text">ACCESS SYSTEM</span> <i class="fas fa-arrow-right btn-icon"></i>';
      return;
    }
    
    const userData = userDoc.data();
    if (userData.nationId !== nationId) {
      showError('Nation ID does not match our records');
      loginBtn.disabled = false;
      loginBtn.innerHTML = '<span class="btn-text">ACCESS SYSTEM</span> <i class="fas fa-arrow-right btn-icon"></i>';
      return;
    }
    
    // Sign in with Firebase Auth
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    
    // Successful login
    loginOverlay.classList.remove('active');
    loginOverlay.classList.add('hidden');
    mainContent.classList.remove('hidden');
    
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific Firebase errors
    let errorMsg = 'Authentication failed';
    switch (error.code) {
      case 'auth/user-not-found':
        errorMsg = 'No account found with this email';
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
    
    // Reset button
    const loginBtn = loginForm.querySelector('button');
    loginBtn.disabled = false;
    loginBtn.innerHTML = '<span class="btn-text">ACCESS SYSTEM</span> <i class="fas fa-arrow-right btn-icon"></i>';
  }
});

// Check auth state on page load
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    loginOverlay.classList.remove('active');
    loginOverlay.classList.add('hidden');
    mainContent.classList.remove('hidden');
  } else {
    // User is signed out
    loginOverlay.classList.add('active');
    loginOverlay.classList.remove('hidden');
    mainContent.classList.add('hidden');
  }
});

// Helper function to show error messages
function showError(message) {
  errorMessage.textContent = message;
  setTimeout(() => {
    errorMessage.textContent = '';
  }, 5000);
}

// Logout functionality (add this to your main content when needed)
function logout() {
  auth.signOut().then(() => {
    window.location.reload();
  });
}
