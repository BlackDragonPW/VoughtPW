// Initialize Firebase (same config as script.js)
const firebaseConfig = { /* same as above */ };
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const sections = document.querySelectorAll('.content-section');
const navItems = document.querySelectorAll('.nav-item');
const newAnnouncementBtn = document.getElementById('newAnnouncementBtn');
const announcementModal = document.querySelector('.modal');
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
    loadNationData();
    
    // Show admin controls
    if (isAdmin) {
      document.querySelectorAll('.btn-admin').forEach(el => el.classList.remove('hidden'));
    }
    
    // Show first section
    document.querySelector('.content-section').classList.add('active');
    
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
        section.classList.remove('active');
        if (section.id === target) {
          section.classList.add('active');
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
      loadNationData();
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
async function loadNationData() {
  const nationDataEl = document.querySelector('.nation-data');
  const loadingEl = document.querySelector('.loading');
  
  loadingEl.classList.remove('hidden');
  nationDataEl.classList.add('hidden');
  
  try {
    // Simulate API call - replace with your actual PnW API integration
    setTimeout(() => {
      nationDataEl.innerHTML = `
        <div class="stat-card">
          <h3>Nation Overview</h3>
          <p><strong>Nation Name:</strong> Example Nation</p>
          <p><strong>Score:</strong> 1,234.56</p>
          <p><strong>Cities:</strong> 5</p>
        </div>
        <div class="stat-card">
          <h3>Military</h3>
          <p><strong>Soldiers:</strong> 10,000</p>
          <p><strong>Tanks:</strong> 500</p>
        </div>
      `;
      
      loadingEl.classList.add('hidden');
      nationDataEl.classList.remove('hidden');
    }, 1000);
    
  } catch (error) {
    console.error('Nation data error:', error);
    nationDataEl.innerHTML = '<p class="error">Error loading nation data</p>';
    loadingEl.classList.add('hidden');
    nationDataEl.classList.remove('hidden');
  }
}

// Announcements System
function setupAnnouncements() {
  // Modal controls
  newAnnouncementBtn?.addEventListener('click', () => {
    announcementModal.classList.add('active');
  });
  
  closeModal?.addEventListener('click', () => {
    announcementModal.classList.remove('active');
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
      
      announcementModal.classList.remove('active');
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
      announcementsList.innerHTML += `
        <div class="announcement-card">
          <h4>${data.title}</h4>
          <p>${data.content}</p>
          <div class="announcement-meta">
            Posted by ${data.author} • ${new Date(data.createdAt?.toDate()).toLocaleString()}
          </div>
        </div>
      `;
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
  chatForm.addEventListener('submit', async (e) => {
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
