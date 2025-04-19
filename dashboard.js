// Initialize Firebase (same config as script.js)
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

// DOM Elements
const sections = document.querySelectorAll('.content-section');
const navItems = document.querySelectorAll('.nav-item');
const newAnnouncementBtn = document.getElementById('newAnnouncementBtn');
const announcementModal = document.getElementById('announcementModal');
const closeModal = document.querySelector('.close-modal');
const announcementForm = document.getElementById('announcementForm');
const chatForm = document.querySelector('.chat-input');
const chatMessages = document.querySelector('.chat-messages');
const channelItems = document.querySelectorAll('.channel-item');
const usernameSpan = document.getElementById('username');
const profileEmail = document.getElementById('profileEmail');
const profileNationId = document.getElementById('profileNationId');
const profileRole = document.getElementById('profileRole');

// App State
let currentUser = null;
let isAdmin = false;
let currentChannel = 'global';

// Initialize the dashboard
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  currentUser = user;
  
  try {
    // Load user data
    const userDoc = await db.collection('approvedUsers').doc(user.email).get();
    
    if (!userDoc.exists) {
      await auth.signOut();
      throw new Error('User not approved');
    }
    
    isAdmin = userDoc.data().role === 'admin';
    usernameSpan.textContent = user.email;
    
    // Load profile data
    profileEmail.textContent = user.email;
    profileNationId.textContent = userDoc.data().nationId;
    profileRole.textContent = isAdmin ? 'Admin' : 'Member';
    
    // Setup UI
    setupNavigation();
    setupAnnouncements();
    setupChat();
    loadNationData(userDoc.data().nationId);
    
    // Show admin controls
    if (isAdmin) {
      document.querySelectorAll('.btn-admin').forEach(el => el.classList.remove('hidden'));
    }
    
  } catch (error) {
    console.error('Dashboard error:', error);
    alert('Error loading dashboard. Please try again.');
    auth.signOut();
  }
});

// Navigation
function setupNavigation() {
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Update active nav item
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Show corresponding section
      const target = item.getAttribute('href').substring(1);
      sections.forEach(section => {
        section.classList.add('hidden');
        if (section.id === target) {
          section.classList.remove('hidden');
          loadSectionContent(target);
        }
      });
    });
  });
}

// Load section-specific content
function loadSectionContent(sectionId) {
  switch (sectionId) {
    case 'nation':
      const nationId = document.getElementById('profileNationId').textContent;
      loadNationData(nationId);
      break;
    case 'announcements':
      loadAnnouncements();
      break;
    case 'chat':
      loadChatMessages();
      break;
  }
}

// Nation Data
async function loadNationData(nationId) {
  const nationDataEl = document.querySelector('.nation-data');
  const loadingEl = document.querySelector('.loading');
  
  loadingEl.classList.remove('hidden');
  nationDataEl.classList.add('hidden');
  
  try {
    // Fetch nation data from PnW API
    const response = await fetch(`https://politicsandwar.com/api/nation/id=${nationId}&key=example`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.general_message || 'Failed to fetch nation data');
    }
    
    const nation = data.nation;
    nationDataEl.innerHTML = `
      <div class="stat-card">
        <h3>Nation Overview</h3>
        <p><strong>Nation Name:</strong> ${nation.nation_name}</p>
        <p><strong>Leader:</strong> ${nation.leader_name}</p>
        <p><strong>Score:</strong> ${nation.score.toLocaleString()}</p>
        <p><strong>Cities:</strong> ${nation.cities}</p>
        <p><strong>Alliance:</strong> ${nation.alliance || 'None'}</p>
      </div>
      <div class="stat-card">
        <h3>Resources</h3>
        <p><strong>Money:</strong> $${nation.money.toLocaleString()}</p>
        <p><strong>Food:</strong> ${nation.food.toLocaleString()}</p>
        <p><strong>Coal:</strong> ${nation.coal.toLocaleString()}</p>
        <p><strong>Oil:</strong> ${nation.oil.toLocaleString()}</p>
      </div>
      <div class="stat-card">
        <h3>Military</h3>
        <p><strong>Soldiers:</strong> ${nation.soldiers.toLocaleString()}</p>
        <p><strong>Tanks:</strong> ${nation.tanks.toLocaleString()}</p>
        <p><strong>Aircraft:</strong> ${nation.aircraft.toLocaleString()}</p>
        <p><strong>Ships:</strong> ${nation.ships.toLocaleString()}</p>
      </div>
    `;
    
    loadingEl.classList.add('hidden');
    nationDataEl.classList.remove('hidden');
    
  } catch (error) {
    console.error('Nation data error:', error);
    nationDataEl.innerHTML = `
      <div class="stat-card">
        <h3>Error Loading Data</h3>
        <p>${error.message}</p>
        <p>Showing sample data instead</p>
      </div>
      <div class="stat-card">
        <h3>Sample Nation</h3>
        <p><strong>Nation Name:</strong> Example Nation</p>
        <p><strong>Score:</strong> 1,234.56</p>
        <p><strong>Cities:</strong> 5</p>
      </div>
    `;
    loadingEl.classList.add('hidden');
    nationDataEl.classList.remove('hidden');
  }
}

// Announcements System
function setupAnnouncements() {
  // Modal controls
  newAnnouncementBtn?.addEventListener('click', () => {
    announcementModal.classList.remove('hidden');
  });
  
  closeModal?.addEventListener('click', () => {
    announcementModal.classList.add('hidden');
  });
  
  announcementForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('announcementTitle').value;
    const content = document.getElementById('announcementContent').value;
    
    try {
      await db.collection('announcements').add({
        title,
        content,
        author: currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        isPinned: document.getElementById('announcementPin').checked
      });
      
      announcementModal.classList.add('hidden');
      announcementForm.reset();
      loadAnnouncements();
      
    } catch (error) {
      console.error('Post error:', error);
      alert('Failed to post announcement');
    }
  });
}

async function loadAnnouncements() {
  const announcementsList = document.querySelector('.announcements-list');
  announcementsList.innerHTML = '<p>Loading announcements...</p>';
  
  try {
    const snapshot = await db.collection('announcements')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();
    
    if (snapshot.empty) {
      announcementsList.innerHTML = '<p>No announcements yet</p>';
      return;
    }
    
    announcementsList.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      const announcement = document.createElement('div');
      announcement.className = 'announcement-card';
      announcement.innerHTML = `
        <h4>${data.title}</h4>
        <p>${data.content}</p>
        <div class="announcement-meta">
          Posted by ${data.author} • ${new Date(data.createdAt?.toDate()).toLocaleString()}
        </div>
      `;
      announcementsList.appendChild(announcement);
    });
    
  } catch (error) {
    console.error('Load error:', error);
    announcementsList.innerHTML = '<p class="error">Error loading announcements</p>';
  }
}

// Chat System
function setupChat() {
  // Channel switching
  channelItems.forEach(item => {
    item.addEventListener('click', () => {
      channelItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      currentChannel = item.dataset.channel;
      document.querySelector('.chat-header i').className = `fas ${
        currentChannel === 'global' ? 'fa-globe' : 'fa-headset'
      }`;
      document.querySelector('.chat-header').innerHTML = `
        <i class="fas ${currentChannel === 'global' ? 'fa-globe' : 'fa-headset'}"></i>
        ${currentChannel === 'global' ? 'Global' : 'Support'} Chat
      `;
      loadChatMessages();
    });
  });
  
  // Message sending
  chatForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = chatForm.querySelector('input');
    const message = input.value.trim();
    
    if (!message) return;
    
    try {
      await db.collection(`chat_${currentChannel}`).add({
        text: message,
        sender: currentUser.email,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        isAdmin: isAdmin
      });
      
      input.value = '';
      
    } catch (error) {
      console.error('Send error:', error);
      alert('Failed to send message');
    }
  });
}

function loadChatMessages() {
  chatMessages.innerHTML = '<p>Loading messages...</p>';
  
  let query = db.collection(`chat_${currentChannel}`)
    .orderBy('timestamp', 'desc')
    .limit(50);
  
  if (currentChannel === 'support' && !isAdmin) {
    query = query.where('sender', '==', currentUser.email);
  }
  
  query.onSnapshot(snapshot => {
    if (snapshot.empty) {
      chatMessages.innerHTML = `<p>No messages in ${currentChannel} chat yet</p>`;
      return;
    }
    
    chatMessages.innerHTML = '';
    const messages = [];
    
    snapshot.forEach(doc => {
      messages.unshift(doc.data()); // Reverse order
    });
    
    messages.forEach(msg => {
      const isCurrentUser = msg.sender === currentUser.email;
      const messageEl = document.createElement('div');
      messageEl.className = `message ${
        isCurrentUser ? 'message-outgoing' : 
        msg.isAdmin ? 'message-admin' : 'message-incoming'
      }`;
      
      messageEl.innerHTML = `
        <div class="message-sender">${msg.sender}</div>
        <div class="message-text">${msg.text}</div>
        <div class="message-time">
          ${new Date(msg.timestamp?.toDate()).toLocaleTimeString()}
        </div>
      `;
      
      chatMessages.appendChild(messageEl);
    });
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, error => {
    console.error('Chat error:', error);
    chatMessages.innerHTML = '<p class="error">Error loading chat</p>';
  });
}
