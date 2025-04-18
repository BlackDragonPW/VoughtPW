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
const navItems = document.querySelectorAll('.sidebar-nav li');
const logoutBtn = document.getElementById('logoutBtn');
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

let currentUser = null;
let userNationId = null;
let isAdmin = false;

// Initialize the dashboard
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  currentUser = user;
  const userDoc = await db.collection('approvedUsers').doc(user.email).get();
  
  if (userDoc.exists) {
    userNationId = userDoc.data().nationId;
    isAdmin = userDoc.data().role === 'admin';
    
    // Load profile data
    loadProfile();
    
    // Show admin controls if admin
    if (isAdmin) {
      document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
    }

    // Load initial section
    loadSection('home');
    
    // Set up real-time listeners
    setupRealTimeListeners();
  } else {
    auth.signOut();
  }
});

// Navigation
navItems.forEach(item => {
  if (item.id !== 'logoutBtn') {
    item.addEventListener('click', () => {
      const section = item.getAttribute('data-section');
      loadSection(section);
    });
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  auth.signOut();
});

// Section loading
function loadSection(sectionName) {
  sections.forEach(section => {
    section.classList.add('hidden');
    if (section.id === sectionName) {
      section.classList.remove('hidden');
    }
  });

  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-section') === sectionName) {
      item.classList.add('active');
    }
  });

  // Load section-specific content
  switch (sectionName) {
    case 'home':
      loadNationData();
      break;
    case 'announcements':
      loadAnnouncements();
      break;
    case 'econ':
      loadLoanRequests();
      loadLoanHistory();
      break;
    case 'chat':
      loadChatMessages();
      break;
  }
}

// Load nation data from Politics and War API
async function loadNationData() {
  const nationDataEl = document.querySelector('.nation-data');
  const loadingSpinner = document.querySelector('.loading-spinner');
  
  nationDataEl.classList.add('hidden');
  loadingSpinner.classList.remove('hidden');
  
  try {
    const response = await fetch(`https://api.politicsandwar.com/graphql?api_key=${PNW_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetCompleteNationInfo {
            nations(id: ${userNationId}) {
              data {
                nation_name
                leader_name
                flag
                color
                continent
                num_cities
                population
                score
                war_policy
                domestic_policy
                alliance {
                  name
                }
                soldiers
                tanks
                aircraft
                ships
                missiles
                nukes
                spies
                cities {
                  name
                  infrastructure
                  land
                  powered
                }
                treasures {
                  name
                  bonus
                }
              }
            }
          }
        `
      })
    });

    const { data } = await response.json();
    displayNationData(data.nations.data[0]);
  } catch (error) {
    console.error('Error loading nation data:', error);
    nationDataEl.innerHTML = '<p class="error">Error loading nation data. Please try again later.</p>';
    loadingSpinner.classList.add('hidden');
    nationDataEl.classList.remove('hidden');
  }
}

function displayNationData(nation) {
  const nationDataEl = document.querySelector('.nation-data');
  const loadingSpinner = document.querySelector('.loading-spinner');
  
  loadingSpinner.classList.add('hidden');
  nationDataEl.classList.remove('hidden');
  
  nationDataEl.innerHTML = `
    <div class="nation-header">
      <img src="${nation.flag}" alt="${nation.nation_name} Flag" class="nation-flag">
      <div>
        <h2>${nation.nation_name}</h2>
        <p>Leader: ${nation.leader_name}</p>
        <p>Alliance: ${nation.alliance?.name || 'None'}</p>
        <p>Score: ${nation.score.toLocaleString()}</p>
      </div>
    </div>
    
    <div class="nation-stats-grid">
      <div class="stat-card">
        <h3>Military</h3>
        <p>Soldiers: ${nation.soldiers.toLocaleString()}</p>
        <p>Tanks: ${nation.tanks.toLocaleString()}</p>
        <p>Aircraft: ${nation.aircraft.toLocaleString()}</p>
        <p>Ships: ${nation.ships.toLocaleString()}</p>
        <p>Missiles: ${nation.missiles.toLocaleString()}</p>
        <p>Nukes: ${nation.nukes.toLocaleString()}</p>
        <p>Spies: ${nation.spies.toLocaleString()}</p>
      </div>
      
      <div class="stat-card">
        <h3>Policies</h3>
        <p>War Policy: ${nation.war_policy}</p>
        <p>Domestic Policy: ${nation.domestic_policy}</p>
        <p>Color: ${nation.color}</p>
        <p>Continent: ${nation.continent}</p>
      </div>
      
      <div class="stat-card">
        <h3>Cities (${nation.num_cities})</h3>
        ${nation.cities.map(city => `
          <div class="city-card">
            <h4>${city.name}</h4>
            <p>Infra: ${city.infrastructure.toLocaleString()}</p>
            <p>Land: ${city.land.toLocaleString()}</p>
            <p>Powered: ${city.powered ? 'Yes' : 'No'}</p>
          </div>
        `).join('')}
      </div>
      
      ${nation.treasures?.length > 0 ? `
      <div class="stat-card">
        <h3>Treasures</h3>
        ${nation.treasures.map(treasure => `
          <p>${treasure.name}: ${treasure.bonus}</p>
        `).join('')}
      </div>
      ` : ''}
    </div>
  `;
}

// Announcements
newAnnouncementBtn.addEventListener('click', () => {
  announcementModal.classList.remove('hidden');
});

closeModal.addEventListener('click', () => {
  announcementModal.classList.add('hidden');
});

announcementForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const title = document.getElementById('announcementTitle').value;
  const content = document.getElementById('announcementContent').value;
  const isPinned = document.getElementById('announcementPin').checked;
  
  try {
    await db.collection('announcements').add({
      title,
      content,
      authorEmail: currentUser.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      isPinned,
      isImportant: false
    });
    
    announcementModal.classList.add('hidden');
    announcementForm.reset();
    loadAnnouncements();
  } catch (error) {
    console.error('Error posting announcement:', error);
    alert('Failed to post announcement');
  }
});

async function loadAnnouncements() {
  const announcementsList = document.querySelector('.announcements-list');
  announcementsList.innerHTML = '<p>Loading announcements...</p>';
  
  try {
    const snapshot = await db.collection('announcements')
      .orderBy('isPinned', 'desc')
      .orderBy('createdAt', 'desc')
      .get();
    
    announcementsList.innerHTML = '';
    
    if (snapshot.empty) {
      announcementsList.innerHTML = '<p>No announcements yet.</p>';
      return;
    }
    
    snapshot.forEach(doc => {
      const announcement = doc.data();
      const announcementEl = document.createElement('div');
      announcementEl.className = `announcement-card ${announcement.isPinned ? 'pinned' : ''}`;
      announcementEl.innerHTML = `
        <h3>${announcement.title} ${announcement.isPinned ? '📌' : ''}</h3>
        <p>${announcement.content.replace(/\n/g, '<br>')}</p>
        <div class="announcement-meta">
          Posted by ${announcement.authorEmail} on ${new Date(announcement.createdAt?.toDate()).toLocaleString()}
        </div>
      `;
      announcementsList.appendChild(announcementEl);
    });
  } catch (error) {
    console.error('Error loading announcements:', error);
    announcementsList.innerHTML = '<p class="error">Error loading announcements.</p>';
  }
}

// Loan Requests
loanRequestForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const amount = parseInt(document.getElementById('loanAmount').value);
  
  try {
    await db.collection('loanRequests').add({
      nationId: userNationId,
      amount,
      requesterEmail: currentUser.email,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    loanRequestForm.reset();
    alert('Loan request submitted successfully!');
    loadLoanRequests();
  } catch (error) {
    console.error('Error submitting loan request:', error);
    alert('Failed to submit loan request');
  }
});

async function loadLoanRequests() {
  const requestsList = document.querySelector('.loan-requests-list');
  
  if (!isAdmin) return;
  
  requestsList.innerHTML = '<p>Loading loan requests...</p>';
  
  try {
    const snapshot = await db.collection('loanRequests')
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .get();
    
    requestsList.innerHTML = '';
    
    if (snapshot.empty) {
      requestsList.innerHTML = '<p>No pending loan requests.</p>';
      return;
    }
    
    snapshot.forEach(doc => {
      const request = doc.data();
      const requestEl = document.createElement('div');
      requestEl.className = 'loan-request-card';
      requestEl.innerHTML = `
        <p><strong>Nation ID:</strong> ${request.nationId}</p>
        <p><strong>Amount:</strong> $${request.amount.toLocaleString()}</p>
        <p><strong>Requested by:</strong> ${request.requesterEmail}</p>
        <p><strong>Date:</strong> ${new Date(request.createdAt?.toDate()).toLocaleString()}</p>
        <div class="loan-actions">
          <button class="btn-approve" data-id="${doc.id}">Approve</button>
          <button class="btn-reject" data-id="${doc.id}">Reject</button>
        </div>
      `;
      requestsList.appendChild(requestEl);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.btn-approve').forEach(btn => {
      btn.addEventListener('click', () => processLoanRequest(btn.dataset.id, 'approved'));
    });
    
    document.querySelectorAll('.btn-reject').forEach(btn => {
      btn.addEventListener('click', () => processLoanRequest(btn.dataset.id, 'rejected'));
    });
  } catch (error) {
    console.error('Error loading loan requests:', error);
    requestsList.innerHTML = '<p class="error">Error loading loan requests.</p>';
  }
}

async function loadLoanHistory() {
  const historyList = document.querySelector('.loan-history-list');
  historyList.innerHTML = '<p>Loading loan history...</p>';
  
  try {
    let query;
    if (isAdmin) {
      query = db.collection('loanRequests')
        .where('status', 'in', ['approved', 'rejected'])
        .orderBy('processedAt', 'desc')
        .limit(50);
    } else {
      query = db.collection('loanRequests')
        .where('requesterEmail', '==', currentUser.email)
        .where('status', 'in', ['approved', 'rejected'])
        .orderBy('processedAt', 'desc')
        .limit(50);
    }
    
    const snapshot = await query.get();
    
    historyList.innerHTML = '';
    
    if (snapshot.empty) {
      historyList.innerHTML = '<p>No loan history found.</p>';
      return;
    }
    
    snapshot.forEach(doc => {
      const request = doc.data();
      const requestEl = document.createElement('div');
      requestEl.className = `loan-request-card ${request.status}`;
      requestEl.innerHTML = `
        <p><strong>Status:</strong> <span class="status-${request.status}">${request.status.toUpperCase()}</span></p>
        <p><strong>Amount:</strong> $${request.amount.toLocaleString()}</p>
        <p><strong>Date:</strong> ${new Date(request.createdAt?.toDate()).toLocaleString()}</p>
        ${request.processedAt ? `<p><strong>Processed:</strong> ${new Date(request.processedAt?.toDate()).toLocaleString()}</p>` : ''}
        ${request.adminNotes ? `<p><strong>Notes:</strong> ${request.adminNotes}</p>` : ''}
      `;
      historyList.appendChild(requestEl);
    });
  } catch (error) {
    console.error('Error loading loan history:', error);
    historyList.innerHTML = '<p class="error">Error loading loan history.</p>';
  }
}

async function processLoanRequest(requestId, status) {
  const notes = prompt(`Enter notes for ${status} request:`);
  if (notes === null) return;
  
  try {
    await db.collection('loanRequests').doc(requestId).update({
      status,
      adminNotes: notes,
      processedAt: firebase.firestore.FieldValue.serverTimestamp(),
      processedBy: currentUser.email
    });
    
    loadLoanRequests();
    loadLoanHistory();
  } catch (error) {
    console.error('Error processing loan request:', error);
    alert('Failed to process loan request');
  }
}

// Chat
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const messageInput = document.getElementById('chatMessage');
  const message = messageInput.value.trim();
  
  if (!message) return;
  
  try {
    await db.collection('chatMessages').add({
      senderEmail: currentUser.email,
      senderNationId: userNationId,
      content: message,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      isAdmin: isAdmin
    });
    
    messageInput.value = '';
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Failed to send message');
  }
});

function loadChatMessages() {
  const chatContainer = document.querySelector('.chat-messages');
  chatContainer.innerHTML = '<p>Loading chat messages...</p>';
  
  db.collection('chatMessages')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .onSnapshot(snapshot => {
      chatContainer.innerHTML = '';
      
      if (snapshot.empty) {
        chatContainer.innerHTML = '<p>No messages yet. Be the first to chat!</p>';
        return;
      }
      
      const messages = [];
      snapshot.forEach(doc => {
        messages.unshift(doc.data()); // Reverse order to show newest at bottom
      });
      
      messages.forEach(msg => {
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${msg.isAdmin ? 'admin' : ''}`;
        messageEl.innerHTML = `
          <div class="message-header">
            <img src="https://politicsandwar.com/img/flags/${msg.senderNationId}.png" class="nation-flag-small">
            <strong>${msg.senderEmail}</strong>
            <span class="message-time">${new Date(msg.createdAt?.toDate()).toLocaleTimeString()}</span>
          </div>
          <p>${msg.content}</p>
        `;
        chatContainer.appendChild(messageEl);
      });
      
      // Auto-scroll to bottom
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, error => {
      console.error('Error loading chat messages:', error);
      chatContainer.innerHTML = '<p class="error">Error loading chat messages.</p>';
    });
}

// Profile
function loadProfile() {
  profileEmail.textContent = currentUser.email;
  
  db.collection('approvedUsers').doc(currentUser.email).get()
    .then(doc => {
      if (doc.exists) {
        const userData = doc.data();
        profileNationId.textContent = userData.nationId;
        profileRole.textContent = userData.role === 'admin' ? 'Admin' : 'Member';
      }
    });
}

// Tab switching
econTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    econTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    tabContents.forEach(content => content.classList.add('hidden'));
    document.getElementById(tab.dataset.tab).classList.remove('hidden');
  });
});

// Set up real-time listeners
function setupRealTimeListeners() {
  // Chat messages update in real-time
  loadChatMessages();
  
  // Announcements update in real-time
  db.collection('announcements')
    .orderBy('createdAt', 'desc')
    .onSnapshot(() => loadAnnouncements());
  
  // Loan requests update in real-time (for admins)
  if (isAdmin) {
    db.collection('loanRequests')
      .where('status', '==', 'pending')
      .onSnapshot(() => loadLoanRequests());
  }
      }
