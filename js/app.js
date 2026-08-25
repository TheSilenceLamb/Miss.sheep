/**
 * js/app.js
 */
window.App = {
  init: function() {
    try {
      if (typeof Auth !== 'undefined' && typeof Auth.checkAuth === 'function') {
        Auth.checkAuth();
      } else {
        document.getElementById('appMain').style.display = 'flex';
        App.route('dashboard');
      }
    } catch (e) {
      console.error('初始化失败:', e);
      document.getElementById('appMain').style.display = 'flex';
      App.route('dashboard');
    }
  },

  route: function(pageId) {
    // 1. 高亮切换导航，严格保留手写 <i> 图标节点，只切换 active 类
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
    } else if (typeof Modules !== 'undefined' && Modules.todo && pageId === 'todo') {
      Modules.todo.render();
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
  }
};

/**
 * 账号与认证模块 (挂载到 window，防止 identifier repeat 报错)
 */
window.Auth = {
  checkAuth: function() {
    const currentUser = (typeof DataManager !== 'undefined') ? DataManager.get('currentUser') : null;
    
    if (!currentUser) {
      const defaultUser = { username: '老师', initialized: true, className: '九年级(3)班' };
      if (typeof DataManager !== 'undefined') DataManager.set('currentUser', defaultUser);
    }

    const authContainer = document.getElementById('authContainer');
    const appMain = document.getElementById('appMain');
    
    if (authContainer) authContainer.style.display = 'none';
    if (appMain) appMain.style.display = 'flex';

    App.route('dashboard');
  },

  switchTab: function(tab) {
    document.querySelectorAll('.auth-tab').forEach(el => el.classList.remove('active'));
    if (tab === 'login') {
      const btn = document.getElementById('tabLogin');
      if (btn) btn.classList.add('active');
      const submitBtn = document.getElementById('authSubmitBtn');
      if (submitBtn) submitBtn.innerText = '登录系统';
    } else {
      const btn = document.getElementById('tabRegister');
      if (btn) btn.classList.add('active');
      const submitBtn = document.getElementById('authSubmitBtn');
      if (submitBtn) submitBtn.innerText = '创建账号';
    }
  },

  handleSubmit: function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const usernameInput = document.getElementById('authUsername');
    const username = usernameInput ? usernameInput.value.trim() : '老师';

    const isRegister = document.getElementById('tabRegister') && document.getElementById('tabRegister').classList.contains('active');
    let user = {
      username: username || '老师',
      initialized: !isRegister,
      className: '九年级(3)班'
    };

    if (typeof DataManager !== 'undefined') DataManager.set('currentUser', user);
    Auth.checkAuth();
  },

  completeOnboarding: function() {
    const classInput = document.getElementById('initClassName');
    const className = classInput ? classInput.value : '九年级(3)班';
    let currentUser = (typeof DataManager !== 'undefined') ? DataManager.get('currentUser') : null;
    if (currentUser) {
      currentUser.className = className;
      currentUser.initialized = true;
      if (typeof DataManager !== 'undefined') DataManager.set('currentUser', currentUser);
    }
    const overlay = document.getElementById('onboardingOverlay');
    if (overlay) overlay.classList.remove('active');
    Auth.checkAuth();
  },

  logout: function() {
    if (typeof DataManager !== 'undefined') DataManager.remove('currentUser');
    location.reload();
  }
};

/**
 * 顶部快速一句话速记识别分发
 */
window.QuickNote = {
  processInput: function() {
    const input = document.getElementById('globalQuickInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const todos = (typeof DataManager !== 'undefined' && DataManager.get('todos')) || [];
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    todos.unshift({
      id: Date.now(),
      title: text,
      createdAt: dateStr,
      completed: false
    });
    
    if (typeof DataManager !== 'undefined') DataManager.set('todos', todos);
    input.value = '';

    App.showModal('识别成功', `<p style="font-size:14px; color:var(--text-dark);">已自动为你生成一条新的待办事项：<br><strong>"${text}"</strong></p>`);

    const activeNav = document.querySelector('.nav-item.active');
    if (activeNav && activeNav.id === 'nav-dashboard') {
      Modules.dashboard.render();
    } else if (activeNav && activeNav.id === 'nav-todo') {
      Modules.todo.render();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
