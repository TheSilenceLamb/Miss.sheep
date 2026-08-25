/**
 * App 极简路由控制与初始化入口
 */
const App = {
  currentRoute: 'dashboard',

  async init() {
    await PhotoStore.init();

    // 绑定当前时间
    document.getElementById('currentDateBadge').innerText = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
    });

    // 检查登录状态并渲染对应视图
    this.checkAuthAndRender();
  },

  checkAuthAndRender() {
    const currentUser = Auth.getCurrentUser();
    const authContainer = document.getElementById('authContainer');
    const appMain = document.getElementById('appMain');
    const onboardingOverlay = document.getElementById('onboardingOverlay');

    if (!currentUser) {
      // 未登录
      authContainer.style.display = 'flex';
      appMain.style.display = 'none';
      onboardingOverlay.classList.remove('active');
    } else {
      // 已登录
      authContainer.style.display = 'none';
      appMain.style.display = 'flex';

      const users = Auth.getUsers();
      const userInfo = users[currentUser] || {};

      // 检查新用户是否完成了简单初始化设置
      if (!userInfo.isOnboarded) {
        onboardingOverlay.classList.add('active');
      } else {
        onboardingOverlay.classList.remove('active');
        
        // 更新顶栏与侧边栏用户相关界面
        document.getElementById('userDisplayName').innerText = `${currentUser} 老师`;
        document.getElementById('userClassBadge').innerText = userInfo.className || '未设定班级';
        document.getElementById('headerClassBadge').innerHTML = `<i class="ri-team-line"></i> ${userInfo.className || '未设定班级'}`;
        
        // 渲染主模块
        this.route(this.currentRoute);
      }
    }
  },

  route(routeName) {
    if (!Modules[routeName]) return;

    this.currentRoute = routeName;

    // 更新侧边栏高亮状态
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${routeName}`);
    if (activeNav) activeNav.classList.active;

    // 渲染视图
    const contentEl = document.getElementById('pageContent');
    contentEl.innerHTML = Modules[routeName].render();

    // 模块生命周期钩子
    if (routeName === 'album') {
      Modules.album.loadPhotos();
    } else if (routeName === 'scores') {
      Modules.scores.initChart();
    }
  },

  showModal(title, bodyHtml, footerHtml = '') {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalFooter').innerHTML = footerHtml;
    document.getElementById('globalModal').classList.add('active');
  },

  closeModal() {
    document.getElementById('globalModal').classList.remove('active');
  },

  showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 32px; right: 32px;
      background: rgba(0, 0, 0, 0.8); color: #fff;
      padding: 10px 20px; border-radius: 50px; font-size: 14px;
      z-index: 1000; backdrop-filter: blur(4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }
};

window.addEventListener('DOMContentLoaded', () => {
  App.init();
});
