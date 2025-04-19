document.addEventListener('DOMContentLoaded', function() {
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

  // DOM Elements
  const sections = document.querySelectorAll('.content-section');
  const navItems = document.querySelectorAll('.nav-item');
  const initialLoader = document.querySelector('.initial-loader');
  const PNW_API_KEY = '7d58ca300d0ac2f7b373';

  // Show initial loader and hide content until ready
  document.body.classList.add('loading');
  initialLoader.style.display = 'flex';

  // Initialize the dashboard
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }

    try {
      // Load user data
      const userDoc = await db.collection('approvedUsers').doc(user.email).get();
      
      if (!userDoc.exists) {
        await auth.signOut();
        throw new Error('User not approved');
      }
      
      // Update UI
      document.getElementById('username').textContent = user.email;
      document.getElementById('profileEmail').textContent = user.email;
      document.getElementById('profileNationId').textContent = userDoc.data().nationId;
      
      const isAdmin = userDoc.data().role === 'admin';
      document.getElementById('profileRole').textContent = isAdmin ? 'Admin' : 'Member';
      
      if (isAdmin) {
        document.querySelectorAll('.btn-admin').forEach(el => el.classList.remove('hidden'));
      }

      // Load initial section
      loadSection('nation', userDoc.data().nationId);
      
      // Setup navigation
      setupNavigation(userDoc.data().nationId);
      
      // Setup other components
      setupAnnouncements();
      setupChat();
      
      // Hide loader and show content
      setTimeout(() => {
        initialLoader.style.display = 'none';
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
        document.querySelector('.main-content').style.display = 'block';
      }, 500);
      
    } catch (error) {
      console.error('Dashboard error:', error);
      alert(error.message);
      auth.signOut();
    }
  });

  function loadSection(sectionId, nationId) {
    sections.forEach(section => {
      section.classList.add('hidden');
      if (section.id === sectionId) {
        section.classList.remove('hidden');
      }
    });

    switch(sectionId) {
      case 'nation':
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

  function setupNavigation(nationId) {
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        const target = item.getAttribute('href').substring(1);
        loadSection(target, nationId);
      });
    });
  }

  async function loadNationData(nationId) {
    const nationDataEl = document.querySelector('.nation-data');
    const loadingEl = document.querySelector('.loading');
    
    loadingEl.classList.remove('hidden');
    nationDataEl.classList.add('hidden');
    
    try {
      const response = await fetch(`https://api.politicsandwar.com/graphql?api_key=${PNW_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetCompleteNationInfo {
              nations(id: ${nationId}) {
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

      const result = await response.json();
      
      if (!result.data?.nations?.data?.[0]) {
        throw new Error('Failed to load nation data');
      }

      const nation = result.data.nations.data[0];
      
      // Format data for display
      nationDataEl.innerHTML = `
        <div class="stat-card">
          <h3>Nation Overview</h3>
          <p><strong>Nation Name:</strong> ${nation.nation_name}</p>
          <p><strong>Leader:</strong> ${nation.leader_name}</p>
          <p><strong>Alliance:</strong> ${nation.alliance?.name || 'None'}</p>
          <p><strong>Score:</strong> ${nation.score.toLocaleString()}</p>
          <p><strong>Cities:</strong> ${nation.num_cities}</p>
          <p><strong>Population:</strong> ${nation.population.toLocaleString()}</p>
        </div>
        <div class="stat-card">
          <h3>Military</h3>
          <p><strong>Soldiers:</strong> ${nation.soldiers.toLocaleString()}</p>
          <p><strong>Tanks:</strong> ${nation.tanks.toLocaleString()}</p>
          <p><strong>Aircraft:</strong> ${nation.aircraft.toLocaleString()}</p>
          <p><strong>Ships:</strong> ${nation.ships.toLocaleString()}</p>
        </div>
        <div class="stat-card">
          <h3>Advanced Weapons</h3>
          <p><strong>Missiles:</strong> ${nation.missiles.toLocaleString()}</p>
          <p><strong>Nukes:</strong> ${nation.nukes.toLocaleString()}</p>
          <p><strong>Spies:</strong> ${nation.spies.toLocaleString()}</p>
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
        </div>
      `;
      loadingEl.classList.add('hidden');
      nationDataEl.classList.remove('hidden');
    }
  }

  function setupAnnouncements() {
    const newAnnouncementBtn = document.getElementById('newAnnouncementBtn');
    const announcementModal = document.getElementById('announcementModal');
    const closeModal = document.querySelector('.close-modal');
    const announcementForm = document.getElementById('announcementForm');

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
          author: auth.currentUser.email,
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

  function setupChat() {
    const channelItems = document.querySelectorAll('.channel-item');
    const chatForm = document.querySelector('.chat-input form');
    const chatMessages = document.querySelector('.chat-messages');
    let currentChannel = 'global';

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
        loadChatMessages(currentChannel);
      });
    });

    chatForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = chatForm.querySelector('input');
      const message = input.value.trim();
      
      if (!message) return;
      
      try {
        await db.collection(`chat_${currentChannel}`).add({
          text: message,
          sender: auth.currentUser.email,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          isAdmin: document.getElementById('profileRole').textContent === 'Admin'
        });
        
        input.value = '';
        
      } catch (error) {
        console.error('Send error:', error);
        alert('Failed to send message');
      }
    });
  }

  function loadChatMessages(channel = 'global') {
    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.innerHTML = '<p>Loading messages...</p>';
    
    let query = db.collection(`chat_${channel}`)
      .orderBy('timestamp', 'desc')
      .limit(50);
    
    if (channel === 'support' && document.getElementById('profileRole').textContent !== 'Admin') {
      query = query.where('sender', '==', auth.currentUser.email);
    }
    
    query.onSnapshot(snapshot => {
      if (snapshot.empty) {
        chatMessages.innerHTML = `<p>No messages in ${channel} chat yet</p>`;
        return;
      }
      
      chatMessages.innerHTML = '';
      const messages = [];
      
      snapshot.forEach(doc => {
        messages.unshift(doc.data());
      });
      
      messages.forEach(msg => {
        const isCurrentUser = msg.sender === auth.currentUser.email;
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
      
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, error => {
      console.error('Chat error:', error);
      chatMessages.innerHTML = '<p class="error">Error loading chat</p>';
    });
  }
});
