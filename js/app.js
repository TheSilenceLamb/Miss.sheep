/**
 * 应用主逻辑及路由管理
 */
const App = {
  init: function() {
    Auth.checkAuth();
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
    if (Modules[pageId] && typeof Modules[pageId].render === 'function') {
      Modules[pageId].render();
    } else {
      Modules.createGenericModule(pageId);
    }
  },

  showModal: function(title, contentHtml, buttonsHtml = []) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerHTML = contentHtml;
    
    const footer = document.getElementById('modalFooter');
    if (Array.isArray(buttonsHtml) && buttonsHtml.length > 0) {
      footer.innerHTML = buttonsHtml.map(btn => 
        `<button class="${btn.class || 'capsule-btn'}" onclick="${btn.onclick}">${btn.text}</button>`
      ).join('');
    } else {
      footer.innerHTML = `<button class="capsule-btn primary" onclick="App.closeModal()">确定</button>`;
    }

    document.getElementById('globalModal').classList.add('active');
  },

  closeModal: function() {
    document.getElementById('globalModal').classList.remove('active');
  }
};

/**
 * 账号与认证模块
 */
const Auth = {
  checkAuth: function() {
    const currentUser = DataManager.get('currentUser');
    if (currentUser) {
      document.getElementById('authContainer').style.display = 'none';
      document.getElementById('appMain').style.display = 'flex';
      
      document.getElementById('userDisplayName').innerText = currentUser.username + ' 老师';
      if (currentUser.className) {
        document.getElementById('userClassBadge').innerText = currentUser.className;
        document.getElementById('headerClassBadge').innerHTML = `<i class="ri-team-line"></i> ${currentUser.className}`;
      }
      
      if (!currentUser.initialized) {
        document.getElementById('onboardingOverlay').classList.add('active');
      } else {
        document.getElementById('onboardingOverlay').classList.remove('active');
        App.route('dashboard');
      }
    } else {
      document.getElementById('authContainer').style.display = 'flex';
      document.getElementById('appMain').style.display = 'none';
    }
  },

  switchTab: function(tab) {
    document.querySelectorAll('.auth-tab').forEach(el => el.classList.remove('active'));
    if (tab === 'login') {
      document.getElementById('tabLogin').classList.add('active');
      document.getElementById('authSubmitBtn').innerText = '登录系统';
    } else {
      document.getElementById('tabRegister').classList.add('active');
      document.getElementById('authSubmitBtn').innerText = '创建账号';
    }
  },

  handleSubmit: function(e) {
    e.preventDefault();
    const username = document.getElementById('authUsername').value.trim();
    if (!username) return;

    const isRegister = document.getElementById('tabRegister').classList.contains('active');
    let user = {
      username: username,
      initialized: false,
      className: ''
    };

    if (isRegister) {
      user.initialized = false;
    } else {
      user.initialized = true;
      user.className = '九年级(3)班';
    }

    DataManager.set('currentUser', user);
    Auth.checkAuth();
  },

  completeOnboarding: function() {
    const className = document.getElementById('initClassName').value || '九年级(3)班';
    let currentUser = DataManager.get('currentUser');
    if (currentUser) {
      currentUser.className = className;
      currentUser.initialized = true;
      DataManager.set('currentUser', currentUser);
    }
    document.getElementById('onboardingOverlay').classList.remove('active');
    Auth.checkAuth();
  },

  logout: function() {
    DataManager.remove('currentUser');
    Auth.checkAuth();
  }
};

/**
 * 顶部快速一句话速记识别分发
 */
const QuickNote = {
  processInput: function() {
    const input = document.getElementById('globalQuickInput');
    const text = input.value.trim();
    if (!text) return;

    // 创建一条新待办
    const todos = DataManager.get('todos') || [];
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    todos.unshift({
      id: Date.now(),
      title: text,
      createdAt: dateStr,
      completed: false
    });
    
    DataManager.set('todos', todos);
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
