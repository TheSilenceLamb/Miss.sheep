/**
 * 模块视图封装集合 (Modules.xxx)
 */
const Modules = {};

// 1. 工作台首页模块
Modules.dashboard = {
  title: '工作台首页',
  render() {
    const todos = DataStore.get('todos');
    const logs = DataStore.get('logs');
    const comms = DataStore.get('communication');
    const students = DataStore.get('students');
    const dutyGroups = DataStore.get('dutyGroups');

    // 计算自动轮值：按天取模
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const todayDuty = dutyGroups.length > 0 ? dutyGroups[dayOfYear % dutyGroups.length] : { name: '无', members: [] };

    // 节假日倒计时算法 (以中秋/国庆等为例)
    const holidays = [
      { name: '中秋节/国庆节', date: '2026-10-01' },
      { name: '元旦', date: '2027-01-01' }
    ];
    const today = new Date();
    const nextHoliday = holidays[0];
    const diffDays = Math.ceil((new Date(nextHoliday.date) - today) / (1000 * 60 * 60 * 24));

    return `
      <!-- 问候卡 & 节假日看板 -->
      <div class="grid-2">
        <div class="card" style="background: linear-gradient(135deg, #fff 0%, var(--primary-light) 100%);">
          <h2 style="font-size:20px; margin-bottom:8px;">Hi, 班主任老师 🌸</h2>
          <p style="color:var(--text-muted); font-size:14px;">今天也是充满活力的一天，极简办公，轻松减负！</p>
          <div style="margin-top:16px;" class="tag pink"><i class="ri-heart-3-line"></i> 九年级(3)班 | 班级状态正常</div>
        </div>

        <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:12px; color:var(--text-muted)">距离下一个节假日【${nextHoliday.name}】</div>
            <div style="font-size:32px; font-weight:800; color:var(--primary-color);">${diffDays} <span style="font-size:16px;">天</span></div>
          </div>
          <i class="ri-plane-line" style="font-size:48px; color:var(--accent-mustard)"></i>
        </div>
      </div>

      <!-- 4张快捷统计卡片 -->
      <div class="grid-4" style="margin-top:10px;">
        <div class="card" onclick="App.route('students')" style="cursor:pointer;">
          <div style="color:var(--text-muted); font-size:13px;">班级总人数</div>
          <div style="font-size:24px; font-weight:700; margin-top:4px;">${students.length} 人</div>
        </div>
        <div class="card" onclick="App.route('schedule')" style="cursor:pointer;">
          <div style="color:var(--text-muted); font-size:13px;">今日课程</div>
          <div style="font-size:24px; font-weight:700; margin-top:4px;">5 节</div>
        </div>
        <div class="card" onclick="App.route('duty')" style="cursor:pointer;">
          <div style="color:var(--text-muted); font-size:13px;">今日值日人员</div>
          <div style="font-size:16px; font-weight:700; margin-top:8px;" class="tag mint">${todayDuty.name}: ${todayDuty.members.join(', ')}</div>
        </div>
        <div class="card" onclick="App.route('communication')" style="cursor:pointer;">
          <div style="color:var(--text-muted); font-size:13px;">待跟进沟通</div>
          <div style="font-size:24px; font-weight:700; margin-top:4px; color:var(--primary-color);">${comms.filter(c => c.status !== '已完成').length} 条</div>
        </div>
      </div>

      <!-- 今日列表板块 -->
      <div class="grid-2" style="margin-top:10px;">
        <div class="card">
          <h3><i class="ri-checkbox-line"></i> 待办事项</h3>
          <div style="margin-top:12px;">
            ${todos.map(t => `
              <div class="list-item">
                <span>${t.done ? `<del style="color:#aaa">${t.title}</del>` : t.title}</span>
                <span class="tag ${t.done ? 'mint' : 'yellow'}">${t.done ? '已完成' : '待办'}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card">
          <h3><i class="ri-chat-1-line"></i> 最近家校沟通</h3>
          <div style="margin-top:12px;">
            ${comms.slice(0, 3).map(c => `
              <div class="list-item">
                <div>
                  <strong>${c.student}</strong>: ${c.content}
                </div>
                <span class="tag blue">${c.date}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
};

// 2. 学生管理模块（含成绩曲线图）
Modules.students = {
  title: '学生管理',
  render() {
    const students = DataStore.get('students');
    return `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3>学生档案列表</h3>
          <button class="capsule-btn primary" onclick="Modules.students.addStudentModal()"><i class="ri-add-line"></i> 新建学生档案</button>
        </div>
        <table style="width:100%; border-collapse:collapse; text-align:left;">
          <thead>
            <tr style="border-bottom:2px solid var(--border-light); color:var(--text-muted); font-size:13px;">
              <th style="padding:10px;">姓名</th>
              <th>性别</th>
              <th>家长联系人</th>
              <th>联系电话</th>
              <th>综合评级/备注</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${students.map(s => `
              <tr style="border-bottom:1px solid var(--border-light);">
                <td style="padding:12px; font-weight:600;">${s.name}</td>
                <td>${s.gender}</td>
                <td>${s.parent}</td>
                <td>${s.phone}</td>
                <td>${s.notes}</td>
                <td>
                  <button class="capsule-btn secondary" onclick="Modules.students.showGrowth('${s.id}')">成长档案</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  showGrowth(studentId) {
    const student = DataStore.get('students').find(s => s.id === studentId);
    const bodyHtml = `
      <h4>${student.name} - 综合成长轨迹</h4>
      <p style="margin-bottom:16px; color:var(--text-muted); font-size:13px;">近期多次考试成绩波动趋势：</p>
      <canvas id="growthChart" style="max-height:250px;"></canvas>
    `;
    App.showModal('学生成长档案', bodyHtml);

    // 渲染 Chart.js 趋势图
    setTimeout(() => {
      const ctx = document.getElementById('growthChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['第一次月考', '期中考试', '第二次月考', '期末模拟'],
          datasets: [{
            label: '综合成绩',
            data: [78, 82, 80, student.score],
            borderColor: '#ef8a8a',
            tension: 0.3,
            fill: false
          }]
        }
      });
    }, 100);
  },

  addStudentModal() {
    const bodyHtml = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <input type="text" id="new_stu_name" placeholder="学生姓名" style="padding:8px; border-radius:8px; border:1px solid #ccc;">
        <input type="text" id="new_stu_parent" placeholder="家长姓名" style="padding:8px; border-radius:8px; border:1px solid #ccc;">
        <input type="text" id="new_stu_phone" placeholder="联系电话" style="padding:8px; border-radius:8px; border:1px solid #ccc;">
      </div>
    `;
    App.showModal('新建学生档案', bodyHtml, `<button class="capsule-btn primary" onclick="Modules.students.saveStudent()">保存</button>`);
  },

  saveStudent() {
    const name = document.getElementById('new_stu_name').value;
    const parent = document.getElementById('new_stu_parent').value;
    const phone = document.getElementById('new_stu_phone').value;
    if (!name) return;

    const students = DataStore.get('students');
    students.push({ id: Date.now().toString(), name, gender: '男', parent, phone, score: 80, notes: '新入学' });
    DataStore.set('students', students);
    App.closeModal();
    App.route('students');
  }
};

// 3. 座次表模块（支持行列拖拽换座）
Modules.seating = {
  title: '座次表',
  render() {
    const seating = DataStore.get('seating');
    return `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3>班级座次表 (讲台方向 ↑)</h3>
          <div>
            <button class="capsule-btn secondary" onclick="Modules.seating.autoSnake()">蛇形自动排座</button>
          </div>
        </div>
        
        <div style="width:200px; margin:16px auto 8px auto; text-align:center; background:#cbd5e1; padding:4px; border-radius:4px; font-size:12px;">讲台</div>

        <div class="seat-grid" style="grid-template-columns: repeat(${seating.cols}, 1fr);">
          ${seating.seats.map((seat, index) => `
            <div class="seat-item ${seat ? 'occupied' : ''}" draggable="true" ondragstart="Modules.seating.drag(event, ${index})" ondragover="event.preventDefault()" ondrop="Modules.seating.drop(event, ${index})">
              ${seat || '空位'}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  drag(ev, index) {
    ev.dataTransfer.setData("text/plain", index);
  },

  drop(ev, targetIndex) {
    ev.preventDefault();
    const sourceIndex = ev.dataTransfer.getData("text/plain");
    const seating = DataStore.get('seating');
    // 调换位置
    const temp = seating.seats[sourceIndex];
    seating.seats[sourceIndex] = seating.seats[targetIndex];
    seating.seats[targetIndex] = temp;
    
    DataStore.set('seating', seating);
    App.route('seating');
  },

  autoSnake() {
    const students = DataStore.get('students').map(s => s.name);
    const seating = DataStore.get('seating');
    seating.seats = seating.seats.map((_, i) => students[i] || '');
    DataStore.set('seating', seating);
    App.route('seating');
  }
};

// 4. 班级相册 (IndexedDB 大图存储)
Modules.album = {
  title: '班级相册',
  render() {
    return `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3>班级相册照片集</h3>
          <input type="file" id="photoInput" accept="image/*" style="display:none;" onchange="Modules.album.uploadPhoto(event)">
          <button class="capsule-btn primary" onclick="document.getElementById('photoInput').click()"><i class="ri-upload-cloud-line"></i> 上传照片到 IndexedDB</button>
        </div>
        <div id="photoContainer" class="grid-3">
          <p style="color:var(--text-muted)">正在读取 IndexedDB 本地图片...</p>
        </div>
      </div>
    `;
  },

  async loadPhotos() {
    const photoIds = DataStore.get('album_photos', []);
    const container = document.getElementById('photoContainer');
    if (photoIds.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted)">暂无照片，请点击上传。</p>`;
      return;
    }

    let html = '';
    for (let id of photoIds) {
      const blob = await PhotoStore.get(id);
      if (blob) {
        const url = URL.createObjectURL(blob);
        html += `
          <div style="position:relative; border-radius:12px; overflow:hidden; border:1px solid var(--border-light);">
            <img src="${url}" style="width:100%; height:180px; object-fit:cover;">
            <button onclick="Modules.album.deletePhoto('${id}')" style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.5); color:#fff; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer;">×</button>
          </div>
        `;
      }
    }
    container.innerHTML = html;
  },

  async uploadPhoto(e) {
    const file = e.target.files[0];
    if (!file) return;

    const photoId = await PhotoStore.put(file);
    const photoIds = DataStore.get('album_photos', []);
    photoIds.push(photoId);
    DataStore.set('album_photos', photoIds);
    
    App.showToast('照片已成功压缩存入 IndexedDB');
    App.route('album');
  },

  async deletePhoto(photoId) {
    await PhotoStore.remove(photoId);
    let photoIds = DataStore.get('album_photos', []);
    photoIds = photoIds.filter(id => id !== photoId);
    DataStore.set('album_photos', photoIds);
    App.route('album');
  }
};

// 5. 成绩管理模块 (全科分析 & 图表)
Modules.scores = {
  title: '成绩管理',
  render() {
    const scores = DataStore.get('scores');
    return `
      <div class="card">
        <h3>全科成绩概览与分析</h3>
        <div style="margin-top:16px; max-height:280px;">
          <canvas id="scoresChart"></canvas>
        </div>
      </div>

      <div class="card">
        <h3>详细数据表</h3>
        <table style="width:100%; border-collapse:collapse; margin-top:12px;">
          <thead>
            <tr style="border-bottom:2px solid var(--border-light); text-align:left;">
              <th style="padding:8px;">姓名</th>
              <th>语文</th>
              <th>数学</th>
              <th>英语</th>
              <th>物理</th>
              <th>历史</th>
            </tr>
          </thead>
          <tbody>
            ${scores.map(s => `
              <tr style="border-bottom:1px solid var(--border-light);">
                <td style="padding:10px; font-weight:600;">${s.name}</td>
                <td>${s.chinese}</td>
                <td>${s.math}</td>
                <td>${s.english}</td>
                <td>${s.physics}</td>
                <td>${s.history}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  initChart() {
    const scores = DataStore.get('scores');
    const avgChinese = (scores.reduce((a,b)=>a+b.chinese,0)/scores.length).toFixed(1);
    const avgMath = (scores.reduce((a,b)=>a+b.math,0)/scores.length).toFixed(1);
    const avgEnglish = (scores.reduce((a,b)=>a+b.english,0)/scores.length).toFixed(1);

    const ctx = document.getElementById('scoresChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['语文人均分', '数学人均分', '英语人均分'],
        datasets: [{
          label: '班级均分',
          data: [avgChinese, avgMath, avgEnglish],
          backgroundColor: ['#ef8a8a', '#a8e6cf', '#ffd3b6']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
};

// 通用占位渲染模块（用于课程表、日志、工具箱等）
const createGenericModule = (title, icon, text) => ({
  title,
  render() {
    return `
      <div class="card" style="text-align:center; padding:40px;">
        <i class="${icon}" style="font-size:48px; color:var(--primary-color);"></i>
        <h3 style="margin-top:12px;">${title}</h3>
        <p style="color:var(--text-muted); margin-top:8px;">${text}</p>
      </div>
    `;
  }
});

Modules.schedule = createGenericModule('课程表', 'ri-calendar-event-line', '支持晚自习与周末上课的课程管理。');
Modules.duty = createGenericModule('值日轮值表', 'ri-sparkles-line', '智能自动轮换，按日期周期自动对齐首页今日值日卡片。');
Modules.logs = createGenericModule('班级日志', 'ri-book-open-line', '记录日常、会议、突发事件。支持一句话速记自动归档。');
Modules.communication = createGenericModule('家校沟通', 'ri-chat-heart-line', '家校联动与逾期提醒，自动关联学生档案。');
Modules.homework = createGenericModule('作业管理', 'ri-task-line', '轻松打卡与作业完成度统计。');
Modules.classroom = createGenericModule('课堂记录', 'ri-presentation-line', '课堂表现、即时表扬与纪律扣分。');
Modules.tools = createGenericModule('减负工具箱', 'ri-briefcase-line', '包含周报月报生成器、班会 PPT 模板库等实用工具。');
