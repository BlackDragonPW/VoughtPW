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
const rememberMe = document.getElementById('rememberMe');
const errorMessage = document.getElementById('errorMessage');

// Login Form Submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const nationId = nationIdInput.value;

  try {
    // Show loading state
    const loginBtn = loginForm.querySelector('button');
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> VERIFYING';

    // Set persistence
    const persistence = rememberMe.checked ? 
      firebase.auth.Auth.Persistence.LOCAL : 
      firebase.auth.Auth.Persistence.SESSION;
    
    await auth.setPersistence(persistence);

    // Sign in
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    
    // Verify user is approved
    const userDoc = await db.collection('approvedUsers').doc(email).get();
    
    if (!userDoc.exists) {
      await auth.signOut();
      throw new Error('Account not approved');
    }
    
    // Verify nation ID
    if (userDoc.data().nationId !== nationId) {
      await auth.signOut();
      throw new Error('Nation ID mismatch');
    }
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
    
  } catch (error) {
    console.error('Login error:', error);
    let message = 'Login failed. Please try again.';
    
    if (error.code === 'auth/user-not-found') message = 'Account not found';
    if (error.code === 'auth/wrong-password') message = 'Incorrect password';
    if (error.message.includes('not approved')) message = error.message;
    if (error.message.includes('Nation ID')) message = error.message;
    
    errorMessage.textContent = message;
    
    // Reset button
    const loginBtn = loginForm.querySelector('button');
    loginBtn.disabled = false;
    loginBtn.innerHTML = '<span>ACCESS SYSTEM</span> <i class="fas fa-arrow-right"></i>';
  }
});

// Check for remembered user
window.addEventListener('DOMContentLoaded', () => {
  const rememberedEmail = localStorage.getItem('rememberedEmail');
  if (rememberedEmail) {
    emailInput.value = rememberedEmail;
    rememberMe.checked = true;
  }
});
