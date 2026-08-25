/**
 * App 极简路由控制与初始化入口
 */
const App = {
  currentRoute: 'dashboard',

  async init() {
    // 1. 初始化存储
    DataStore.initMock();
    await PhotoStore.init();

    // 2. 绑定当前时间
    document.getElementById('currentDateBadge').innerText = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
    });

    // 3. 初始路由跳转
    this.route('dashboard');
  },

  // 路由跳转机制
  route(routeName) {
    if (!Modules[routeName]) return;

    this.currentRoute = routeName;

    // 更新侧边栏高亮状态
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${routeName}`);
    if (activeNav) activeNav.classList.add('active');

    // 渲染视图
    const contentEl = document.getElementById('pageContent');
    contentEl.innerHTML = Modules[routeName].render();

    // 模块生命周期钩子（如相册异步加载、图表初始化等）
    if (routeName === 'album') {
      Modules.album.loadPhotos();
    } else if (routeName === 'scores') {
      Modules.scores.initChart();
    }
  },

  // 显示全局 Modal 弹窗
  showModal(title, bodyHtml, footerHtml = '') {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalFooter').innerHTML = footerHtml;
    document.getElementById('globalModal').classList.add('active');
  },

  // 关闭 Modal 弹窗
  closeModal() {
    document.getElementById('globalModal').classList.remove('active');
  },

  // 极简 Toast 消息提示
  showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 32px; right: 32px;
      background: rgba(0, 0, 0, 0.75); color: #fff;
      padding: 10px 20px; border-radius: 50px; font-size: 14px;
      z-index: 1000; backdrop-filter: blur(4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }
};

// 页面加载完成后自动启动
window.addEventListener('DOMContentLoaded', () => {
  App.init();
});
