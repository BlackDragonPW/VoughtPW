// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDHrUcv8c6S04STttlQ8Ck02SuXdeM3psw",
  authDomain: "vought-international-eb8c7.firebaseapp.com",
  projectId: "vought-international-eb8c7",
  storageBucket: "vought-international-eb8c7.appspot.com",
  messagingSenderId: "596496897354",
  appId: "1:596496897354:web:8605892781e81358fb9db3",
  measurementId: "G-RL72T75YEV"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const PNW_API_KEY = "7d58ca300d0ac2f7b373";

// DOM Elements
const sections = document.querySelectorAll('.content-section');
const navItems = document.querySelectorAll('.nav-item');
const newAnnouncementBtn = document.getElementById('newAnnouncementBtn');
const announcementModal = document.getElementById('announcementModal');
const closeModal = document.querySelector('.close-modal');
const announcementForm = document.getElementById('announcementForm');
const loanRequestForm = document.getElementById('loanRequestForm');
const econTabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const chatForm = document.getElementById('chatForm');
const chatMessagesContainer = document.querySelector('.chat-messages');
const profileEmail = document.getElementById('profileEmail');
const profileNationId = document.getElementById('profileNationId');
const profileRole = document.getElementById('profileRole');
const profilePassword = document.getElementById('profilePassword');

let currentUser = null;
let userNationId = null;
let isAdmin = false;

// Initialize the dashboard with enhanced error handling
auth.onAuthStateChanged(async (user) => {
  try {
    console.log("Auth state changed. User:", user);
    
    if (!user) {
      console.log("No user, redirecting to login");
      window.location.href = 'index.html';
      return;
    }

    currentUser = user;
    console.log("Current user email:", user.email);

    // Check if user exists in approvedUsers collection
    const userDoc = await db.collection('approvedUsers').doc(user.email).get();
    
    if (!userDoc.exists) {
      console.log("User not approved, signing out");
      await auth.signOut();
      throw new Error('Account not approved. Contact your alliance admin.');
    }

    userNationId = userDoc.data().nationId;
    isAdmin = userDoc.data().role === 'admin';
    console.log(`User loaded - NationID: ${userNationId}, Admin: ${isAdmin}`);

    // Initialize UI components
    loadProfile();
    setupNavigation();
    loadSection('home');
    setupAllListeners();

    // Show admin controls if admin
    if (isAdmin) {
      console.log("User is admin, showing admin controls");
      document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
      document.getElementById('newAnnouncementBtn').classList.remove('hidden');
    }

  } catch (error) {
    console.error('Dashboard initialization error:', error);
    showDashboardError(error.message || 'Error loading dashboard. Please try again.');
    setTimeout(() => {
      auth.signOut();
      window.location.href = 'index.html';
    }, 3000);
  }
});

function showDashboardError(message) {
  const loadingSpinner = document.querySelector('.loading-spinner');
  if (loadingSpinner) loadingSpinner.classList.add('hidden');

  const errorDiv = document.createElement('div');
  errorDiv.className = 'dashboard-error';
  errorDiv.innerHTML = `
    <div class="error-content">
      <h3>Error Loading Dashboard</h3>
      <p>${message}</p>
      <p>You will be redirected to login page shortly...</p>
    </div>
  `;
  document.body.appendChild(errorDiv);
}

// ... [Rest of your existing dashboard.js code remains the same]
