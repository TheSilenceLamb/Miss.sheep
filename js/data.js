/**
 * DataStore, Auth & PhotoStore 封装
 */

// 1. PhotoStore (IndexedDB 包装)
const PhotoStore = {
  dbName: 'ClassroomDB',
  storeName: 'photos',
  db: null,

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve();
      };
      request.onerror = (e) => reject(e);
    });
  },

  async put(fileBlob) {
    const photoId = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      store.put({ id: photoId, blob: fileBlob });
      tx.oncomplete = () => resolve(photoId);
      tx.onerror = (e) => reject(e);
    });
  },

  async get(photoId) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.get(photoId);
      req.onsuccess = () => resolve(req.result ? req.result.blob : null);
      req.onerror = (e) => reject(e);
    });
  },

  async remove(photoId) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      store.delete(photoId);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e);
    });
  }
};

// 2. Auth 系统与多账户数据隔离管理
const Auth = {
  getCurrentUser() {
    return localStorage.getItem('app_current_user');
  },

  getUsers() {
    const u = localStorage.getItem('app_users');
    return u ? JSON.parse(u) : {};
  },

  switchTab(type) {
    const loginTab = document.getElementById('tabLogin');
    const regTab = document.getElementById('tabRegister');
    const submitBtn = document.getElementById('authSubmitBtn');
    
    if (type === 'login') {
      loginTab.classList.add('active');
      regTab.classList.remove('active');
      submitBtn.innerText = '登录系统';
      submitBtn.dataset.mode = 'login';
    } else {
      regTab.classList.add('active');
      loginTab.classList.remove('active');
      submitBtn.innerText = '注册新账号';
      submitBtn.dataset.mode = 'register';
    }
  },

  handleSubmit(e) {
    e.preventDefault();
    const mode = document.getElementById('authSubmitBtn').dataset.mode || 'login';
    const user = document.getElementById('authUsername').value.trim();
    const pass = document.getElementById('authPassword').value.trim();

    if (!user || !pass) {
      App.showToast('请输入账号和密码');
      return;
    }

    const users = this.getUsers();

    if (mode === 'register') {
      if (users[user]) {
        App.showToast('该账号已被注册');
        return;
      }
      users[user] = { password: pass, className: '', subject: '', isOnboarded: false };
      localStorage.setItem('app_users', JSON.stringify(users));
      App.showToast('注册成功！正在为您自动登录');
    } else {
      if (!users[user] || users[user].password !== pass) {
        App.showToast('账号或密码错误');
        return;
      }
    }

    // 设置当前登录用户
    localStorage.setItem('app_current_user', user);
    
    // 初始化数据并检查是否需要设置班级
    DataStore.initUserData(user);
    App.checkAuthAndRender();
  },

  completeOnboarding() {
    const user = this.getCurrentUser();
    const className = document.getElementById('initClassName').value.trim() || '九年级(3)班';
    const subject = document.getElementById('initSubject').value.trim() || '通用';

    const users = this.getUsers();
    if (users[user]) {
      users[user].className = className;
      users[user].subject = subject;
      users[user].isOnboarded = true;
      localStorage.setItem('app_users', JSON.stringify(users));
    }

    document.getElementById('onboardingOverlay').classList.remove('active');
    App.showToast('设置完成！初始化平台为空，请在学生管理中导入人员数据。');
    App.checkAuthAndRender();
  },

  logout() {
    localStorage.removeItem('app_current_user');
    App.checkAuthAndRender();
    App.showToast('已安全退出账号');
  }
};

// 3. DataStore (针对当前登录用户的多隔离 Key 机制)
const DataStore = {
  getKey(key) {
    const currentUser = Auth.getCurrentUser() || 'guest';
    return `app_${currentUser}_${key}`;
  },

  get(key, defaultValue = []) {
    const val = localStorage.getItem(this.getKey(key));
    return val ? JSON.parse(val) : defaultValue;
  },

  set(key, value) {
    localStorage.setItem(this.getKey(key), JSON.stringify(value));
  },

  // 账号空初始化
  initUserData(username) {
    const initKey = `app_${username}_initialized`;
    if (!localStorage.getItem(initKey)) {
      // 默认为空平台数据结构
      this.set('students', []);
      this.set('dutyGroups', []);
      this.set('todos', []);
      this.set('communication', []);
      this.set('logs', []);
      this.set('scores', []);
      this.set('seating', { rows: 4, cols: 5, seats: [] });
      localStorage.setItem(initKey, 'true');
    }
  }
};

// 4. NLP 一句话智能识别分发引擎
const QuickNote = {
  processInput() {
    const inputEl = document.getElementById('globalQuickInput');
    const text = inputEl.value.trim();
    if (!text) return;

    const students = DataStore.get('students');
    const matchedStudent = students.find(s => text.includes(s.name));

    const matches = {
      communication: !!(text.includes('家长') || text.includes('沟通') || text.includes('提醒') || matchedStudent),
      log: !!(text.includes('班') || text.includes('课') || text.includes('表现') || text.includes('迟到')),
      todo: !!(text.includes('准备') || text.includes('交') || text.includes('收') || text.includes('完成')),
      studentNote: !!matchedStudent
    };

    const bodyHtml = `
      <p style="margin-bottom:12px; color:var(--text-muted)">系统智能识别到以下归属模块，请勾选确认并一键保存：</p>
      <div style="background:#f8fafc; padding:12px; border-radius:12px; margin-bottom:16px;"><strong>识别文本：</strong>"${text}"</div>
      
      <div style="display:flex; flex-direction:column; gap:10px;">
        <label><input type="checkbox" id="chk_comm" ${matches.communication ? 'checked' : ''}> 关联至【家校沟通记录】 ${matchedStudent ? `(关联学生: ${matchedStudent.name})` : ''}</label>
        <label><input type="checkbox" id="chk_log" ${matches.log ? 'checked' : ''}> 关联至【班级日志】</label>
        <label><input type="checkbox" id="chk_todo" ${matches.todo ? 'checked' : ''}> 关联至【待办事项】</label>
        ${matchedStudent ? `<label><input type="checkbox" id="chk_stu" ${matches.studentNote ? 'checked' : ''}> 追加至【${matchedStudent.name} 的学生档案】</label>` : ''}
      </div>
    `;

    App.showModal('一句话智能分发', bodyHtml, `
      <button class="capsule-btn primary" onclick="QuickNote.executeSave('${encodeURIComponent(text)}', '${matchedStudent ? matchedStudent.id : ''}')">一键分发保存</button>
    `);
  },

  executeSave(encodedText, studentId) {
    const text = decodeURIComponent(encodedText);
    const today = new Date().toISOString().split('T')[0];

    if (document.getElementById('chk_comm')?.checked) {
      const comms = DataStore.get('communication');
      const student = DataStore.get('students').find(s => s.id === studentId);
      comms.unshift({ id: 'c_' + Date.now(), student: student ? student.name : '全班', content: text, date: today, status: '跟进中' });
      DataStore.set('communication', comms);
    }

    if (document.getElementById('chk_log')?.checked) {
      const logs = DataStore.get('logs');
      logs.unshift({ id: 'l_' + Date.now(), type: '日常速记', content: text, date: today });
      DataStore.set('logs', logs);
    }

    if (document.getElementById('chk_todo')?.checked) {
      const todos = DataStore.get('todos');
      todos.unshift({ id: 't_' + Date.now(), title: text, done: false, date: today });
      DataStore.set('todos', todos);
    }

    if (document.getElementById('chk_stu')?.checked && studentId) {
      const students = DataStore.get('students');
      const stu = students.find(s => s.id === studentId);
      if (stu) {
        stu.notes = (stu.notes || '') + ` | [${today}] ${text}`;
        DataStore.set('students', students);
      }
    }

    document.getElementById('globalQuickInput').value = '';
    App.closeModal();
    App.showToast('智能分发成功！已同步至各模块');
    App.route(App.currentRoute);
  }
};
