/**
 * js/app.js - 主应用控制器及辅助函数
 */
window.App = {
  currentRoute: 'dashboard',

  init: function() {
    try {
      // 初始化 PhotoStore
      PhotoStore.init().catch(e => console.warn('PhotoStore 初始化失败:', e));
      
      // 检查用户登录状态
      if (Auth.getCurrentUser()) {
        App.checkAuthAndRender();
      } else {
        App.showAuthUI();
      }
    } catch (e) {
      console.error('应用初始化失败:', e);
      App.showAuthUI();
    }
  },

  showAuthUI: function() {
    const authContainer = document.getElementById('authContainer');
    const appMain = document.getElementById('appMain');
    if (authContainer) authContainer.style.display = 'flex';
    if (appMain) appMain.style.display = 'none';
  },

  checkAuthAndRender: function() {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) {
      App.showAuthUI();
      return;
    }

    const authContainer = document.getElementById('authContainer');
    const appMain = document.getElementById('appMain');
    
    if (authContainer) authContainer.style.display = 'none';
    if (appMain) appMain.style.display = 'flex';

    // 更新用户界面信息
    App.updateUserDisplay();
    
    // 检查是否需要初始化
    const users = Auth.getUsers();
    if (users[currentUser] && !users[currentUser].isOnboarded) {
      const overlay = document.getElementById('onboardingOverlay');
      if (overlay) overlay.classList.add('active');
    } else {
      const overlay = document.getElementById('onboardingOverlay');
      if (overlay) overlay.classList.remove('active');
    }

    // 导航到首页
    App.route('dashboard');
  },

  updateUserDisplay: function() {
    const currentUser = Auth.getCurrentUser();
    const users = Auth.getUsers();
    const userData = users[currentUser] || {};
    
    const userDisplay = document.getElementById('userDisplayName');
    const userBadge = document.getElementById('userClassBadge');
    const headerBadge = document.getElementById('headerClassBadge');

    if (userDisplay) userDisplay.innerText = currentUser;
    if (userBadge) userBadge.innerText = userData.className || '班级未设定';
    if (headerBadge) headerBadge.innerHTML = `<i class="ri-team-line"></i> ${userData.className || '班级未设定'}`;
  },

  updateDateDisplay: function() {
    const now = new Date();
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekDays[now.getDay()]}`;
    const badge = document.getElementById('currentDateBadge');
    if (badge) badge.innerText = dateStr;
  },

  route: function(pageId) {
    App.currentRoute = pageId;
    
    // 1. 高亮切换导航
    document.querySelectorAll('.nav-menu .nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    const activeNav = document.getElementById(`nav-${pageId}`);
    if (activeNav) {
      activeNav.classList.add('active');
    }

    // 2. 路由分发
    if (typeof Modules !== 'undefined' && Modules[pageId] && typeof Modules[pageId].render === 'function') {
      Modules[pageId].render();
    } else if (typeof Modules !== 'undefined' && typeof Modules.createGenericModule === 'function') {
      Modules.createGenericModule(pageId);
    }
  },

  showModal: function(title, contentHtml, buttonsHtml = []) {
    const titleEl = document.getElementById('modalTitle');
    const bodyEl = document.getElementById('modalBody');
    const footer = document.getElementById('modalFooter');
    
    if (titleEl) titleEl.innerText = title;
    if (bodyEl) bodyEl.innerHTML = contentHtml;
    
    if (footer) {
      if (Array.isArray(buttonsHtml) && buttonsHtml.length > 0) {
        footer.innerHTML = buttonsHtml.map(btn => 
          `<button class="${btn.class || 'capsule-btn'}" onclick="${btn.onclick}">${btn.text}</button>`
        ).join('');
      } else {
        footer.innerHTML = `<button class="capsule-btn primary" onclick="App.closeModal()">确定</button>`;
      }
    }

    const modal = document.getElementById('globalModal');
    if (modal) modal.classList.add('active');
  },

  closeModal: function() {
    const modal = document.getElementById('globalModal');
    if (modal) modal.classList.remove('active');
  },

  showToast: function(message) {
    // 简单的 toast 实现
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--text-dark);
      color: white;
      padding: 12px 20px;
      border-radius: 50px;
      font-size: 13px;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
};

// 初始化事件监听
document.addEventListener('DOMContentLoaded', () => {
  App.updateDateDisplay();
  // 每分钟更新一次日期显示
  setInterval(() => App.updateDateDisplay(), 60000);
  App.init();
});
