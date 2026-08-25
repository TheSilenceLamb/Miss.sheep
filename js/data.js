/**
 * DataStore & IndexedDB (PhotoStore) 封装与 Mock 初始化数据
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

// 2. DataStore (LocalStorage 数据引擎)
const DataStore = {
  get(key, defaultValue = []) {
    const val = localStorage.getItem('app_' + key);
    return val ? JSON.parse(val) : defaultValue;
  },
  set(key, value) {
    localStorage.setItem('app_' + key, JSON.stringify(value));
  },
  
  // 智能 Mock 数据初始化
  initMock() {
    if (!localStorage.getItem('app_initialized')) {
      this.set('students', [
        { id: '1', name: '李明', gender: '男', parent: '李先生', phone: '13800000001', score: 92, notes: '讲纪律，数学思维突出' },
        { id: '2', name: '张伟', gender: '男', parent: '张女士', phone: '13800000002', score: 78, notes: '近期作业偶有漏做' },
        { id: '3', name: '王芳', gender: '女', parent: '王先生', phone: '13800000003', score: 95, notes: '语文课代表，表现优异' },
        { id: '4', name: '赵强', gender: '男', parent: '赵女士', phone: '13800000004', score: 84, notes: '性格开朗，热爱体育活动' }
      ]);

      this.set('dutyGroups', [
        { name: '第1组', members: ['李明', '王芳'], tasks: '扫地 + 擦黑板' },
        { name: '第2组', members: ['张伟', '赵强'], tasks: '摆桌椅 + 倒垃圾' }
      ]);

      this.set('todos', [
        { id: 't1', title: '收齐周记', done: false, date: '2026-08-25' },
        { id: 't2', title: '准备周一主题班会 PPT', done: true, date: '2026-08-24' }
      ]);

      this.set('communication', [
        { id: 'c1', student: '张伟', content: '沟通近期数学作业退步问题，家长表示回家加强督促', date: '2026-08-24', status: '已完成' }
      ]);

      this.set('logs', [
        { id: 'l1', type: '日常', content: '全班出勤正常，无迟到现象。午休秩序良好。', date: '2026-08-25' }
      ]);

      this.set('scores', [
        { studentId: '1', name: '李明', chinese: 88, math: 96, english: 92, physics: 90, history: 85 },
        { studentId: '2', name: '张伟', chinese: 75, math: 68, english: 80, physics: 72, history: 78 },
        { studentId: '3', name: '王芳', chinese: 96, math: 90, english: 98, physics: 88, history: 92 }
      ]);

      this.set('seating', { rows: 4, cols: 4, seats: ['李明', '张伟', '王芳', '赵强', '', '', '', ''] });

      localStorage.setItem('app_initialized', 'true');
    }
  }
};

// 3. NLP 一句话智能识别分发引擎 (核心减负功能)
const QuickNote = {
  processInput() {
    const inputEl = document.getElementById('globalQuickInput');
    const text = inputEl.value.trim();
    if (!text) return;

    // 关键字分析
    const students = DataStore.get('students');
    const matchedStudent = students.find(s => text.includes(s.name));

    const matches = {
      communication: !!(text.includes('家长') || text.includes('沟通') || text.includes('提醒') || matchedStudent),
      log: !!(text.includes('班') || text.includes('课') || text.includes('表现') || text.includes('迟到')),
      todo: !!(text.includes('准备') || text.includes('交') || text.includes('收') || text.includes('完成')),
      studentNote: !!matchedStudent
    };

    // 弹出确认卡片，允许一键关联勾选
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
        stu.notes += ` | [${today}] ${text}`;
        DataStore.set('students', students);
      }
    }

    document.getElementById('globalQuickInput').value = '';
    App.closeModal();
    App.showToast('智能分发成功！已同步至各模块');
    App.route(App.currentRoute); // 刷新当前模块
  }
};
