/**
 * 模块视图封装集合 (Modules.xxx)
 */
const Modules = {};

// 莫兰迪马卡龙配色库
const MacaronColors = [
  { bg: '#fce4ec', border: '#f8bbd0', text: '#880e4f' }, // 柔粉
  { bg: '#e3f2fd', border: '#bbdefb', text: '#0d47a1' }, // 柔蓝
  { bg: '#e8f5e9', border: '#c8e6c9', text: '#1b5e20' }, // 柔绿
  { bg: '#fff3e0', border: '#ffe0b2', text: '#e65100' }, // 柔橙
  { bg: '#f3e5f5', border: '#e1bee7', text: '#4a148c' }, // 柔紫
  { bg: '#e0f7fa', border: '#b2ebf2', text: '#006064' }, // 柔青
  { bg: '#fffde7', border: '#fff9c4', text: '#f57f17' }  // 柔黄
];

// 根据学科名称哈希生成确定色彩
function getSubjectColor(subjectName) {
  if (!subjectName) return MacaronColors[0];
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % MacaronColors.length;
  return MacaronColors[index];
}

// 1. 工作台首页
Modules.dashboard = {
  title: '工作台首页',
  render() {
    const todos = DataStore.get('todos');
    const logs = DataStore.get('logs');
    const comms = DataStore.get('communication');
    const students = DataStore.get('students');
    const dutyGroups = DataStore.get('dutyGroups');
    const schedule = DataStore.get('schedule');
    
    const user = Auth.getCurrentUser();
    const userInfo = Auth.getUsers()[user] || {};

    // 动态判断今日课程数量（按当前星期）
    const dayOfWeek = new Date().getDay(); // 0 是周日, 1-6 是周一至周六
    const currentDayStr = dayOfWeek === 0 ? '7' : String(dayOfWeek);
    const todayCourses = schedule.filter(c => String(c.day) === currentDayStr);

    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const todayDuty = dutyGroups.length > 0 ? dutyGroups[dayOfYear % dutyGroups.length] : { name: '未分配', members: [] };

    const holidays = [
      { name: '中秋/国庆节', date: '2026-10-01' },
      { name: '元旦', date: '2027-01-01' }
    ];
    const today = new Date();
    const nextHoliday = holidays[0];
    const diffDays = Math.max(0, Math.ceil((new Date(nextHoliday.date) - today) / (1000 * 60 * 60 * 24)));

    return `
      <div class="grid-2">
        <div class="card" style="background: linear-gradient(135deg, #fff 0%, var(--primary-light) 100%);">
          <h2 style="font-size:20px; margin-bottom:8px;">Hi, ${user} 老师 🌸</h2>
          <p style="color:var(--text-muted); font-size:14px;">欢迎回到工作台，极简办公，轻松减负！</p>
          <div style="margin-top:16px;" class="tag pink"><i class="ri-team-line"></i> ${userInfo.className || '未设定班级'} | ${userInfo.subject || '通用'}学科</div>
        </div>

        <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:12px; color:var(--text-muted)">距离下一个节假日【${nextHoliday.name}】</div>
            <div style="font-size:32px; font-weight:800; color:var(--primary-color);">${diffDays} <span style="font-size:16px;">天</span></div>
          </div>
          <i class="ri-plane-line" style="font-size:48px; color:var(--accent-mustard)"></i>
        </div>
      </div>

      <div class="grid-4" style="margin-top:10px;">
        <div class="card" onclick="App.route('students')" style="cursor:pointer;">
          <div style="color:var(--text-muted); font-size:13px;">班级总人数</div>
          <div style="font-size:24px; font-weight:700; margin-top:4px;">${students.length} 人</div>
        </div>
        <div class="card" onclick="App.route('schedule')" style="cursor:pointer;">
          <div style="color:var(--text-muted); font-size:13px;">今日课程</div>
          <div style="font-size:24px; font-weight:700; margin-top:4px;">${todayCourses.length} 节</div>
        </div>
        <div class="card" onclick="App.route('duty')" style="cursor:pointer;">
          <div style="color:var(--text-muted); font-size:13px;">今日值日</div>
          <div style="font-size:15px; font-weight:700; margin-top:8px;" class="tag mint">${todayDuty.name}: ${todayDuty.members.join(', ') || '暂无'}</div>
        </div>
        <div class="card" onclick="App.route('communication')" style="cursor:pointer;">
          <div style="color:var(--text-muted); font-size:13px;">待跟进沟通</div>
          <div style="font-size:24px; font-weight:700; margin-top:4px; color:var(--primary-color);">${comms.filter(c => c.status !== '已完成').length} 条</div>
        </div>
      </div>

      <div class="grid-2" style="margin-top:10px;">
        <div class="card">
          <h3><i class="ri-checkbox-line"></i> 待办事项</h3>
          <div style="margin-top:12px;">
            ${todos.length ? todos.map(t => `
              <div class="list-item">
                <span>${t.done ? `<del style="color:#aaa">${t.title}</del>` : t.title}</span>
                <span class="tag ${t.done ? 'mint' : 'yellow'}">${t.done ? '已完成' : '待办'}</span>
              </div>
            `).join('') : '<p style="color:var(--text-muted); font-size:13px;">暂无待办事项</p>'}
          </div>
        </div>

        <div class="card">
          <h3><i class="ri-chat-1-line"></i> 最近家校沟通</h3>
          <div style="margin-top:12px;">
            ${comms.length ? comms.slice(0, 3).map(c => `
              <div class="list-item">
                <div><strong>${c.student}</strong>: ${c.content}</div>
                <span class="tag blue">${c.date}</span>
              </div>
            `).join('') : '<p style="color:var(--text-muted); font-size:13px;">暂无沟通记录</p>'}
          </div>
        </div>
      </div>
    `;
  }
};

// 2. 课程表模块 (支持一周七天、图例、莫兰迪卡片、点击详情弹窗、新增与批量Excel导入)
Modules.schedule = {
  title: '课程表',
  render() {
    const schedule = DataStore.get('schedule');
    const maxPeriods = 8; // 默认每日8节课

    // =================【新增：计算本周周一到周日的具体日期】=================
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0(周日) ~ 6(周六)
    // 计算当前日期距离本周一相差的天数 (JS 中 0 代表周日)
    const distanceToMonday = (currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek);
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);

    // 生成周一至周日的日期数组与表头名称
    const weekNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const daysHeader = weekNames.map((name, index) => {
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + index);
      
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      
      return `${name} (${year}.${month}.${day})`;
    });
    // =====================================================================

    // 提取所有出现的学科用于上方标注图例
    const subjects = [...new Set(schedule.map(s => s.subject))];

    return `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3>每周课程安排 (一周七天)</h3>
          <div style="display:flex; gap:8px;">
            <button class="capsule-btn secondary" onclick="Modules.schedule.downloadTemplate()"><i class="ri-download-line"></i> 下载课表模版</button>
            <button class="capsule-btn primary" onclick="document.getElementById('scheduleExcelInput').click()"><i class="ri-file-excel-line"></i> 批量导入课表 (.xlsx/.csv)</button>
            <button class="capsule-btn primary" onclick="Modules.schedule.addCourseModal()"><i class="ri-add-line"></i> 添加课程</button>
          </div>
        </div>

        <!-- 学科颜色图例标注栏 -->
        ${subjects.length > 0 ? `
          <div class="legend-bar">
            <span style="font-size:12px; color:var(--text-muted); font-weight:600;">学科标注图例：</span>
            ${subjects.map(sub => {
              const style = getSubjectColor(sub);
              return `
                <div class="legend-item">
                  <div class="legend-color" style="background:${style.bg}; border:1px solid ${style.border}"></div>
                  <span>${sub}</span>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}

        <!-- 周七天课程网格 -->
        <div class="schedule-table-wrapper">
          <div class="schedule-grid">
            <div class="schedule-header">节次 / 时间</div>
            
            <!-- 使用计算好的带日期的表头 -->
            ${daysHeader.map(d => `<div class="schedule-header">${d}</div>`).join('')}

            ${Array.from({ length: maxPeriods }).map((_, pIdx) => {
              const period = pIdx + 1;
              
              const rowHtml = `
                <div class="schedule-slot-title">第 ${period} 节</div>
                ${Array.from({ length: 7 }).map((_, dIdx) => {
                  const day = dIdx + 1;
                  const item = schedule.find(s => Number(s.day) === day && Number(s.period) === period);
                  if (item) {
                    const colorStyle = getSubjectColor(item.subject);
                    return `
                      <div class="schedule-cell">
                        <div class="course-card" 
                          style="background:${colorStyle.bg}; border:1px solid ${colorStyle.border}; color:${colorStyle.text};"
                          onclick="Modules.schedule.showCourseDetail('${item.id}')">
                          <div class="c-name">${item.subject}</div>
                          <div class="c-teacher">${item.teacher || '未知老师'}</div>
                        </div>
                      </div>
                    `;
                  } else {
                    return `<div class="schedule-cell" onclick="Modules.schedule.addCourseModal(${day}, ${period})"></div>`;
                  }
                }).join('')}
              `;

              // 上下午分隔线（第 4 节后插入）
              const dividerHtml = (period === 4) ? `
                <div class="schedule-noon-divider">
                  <span>☀️ 上午 (1-4节) &nbsp; | &nbsp; 🍱 午休时间 &nbsp; | &nbsp; 🌙 下午 (5-8节)</span>
                </div>
              ` : '';

              return rowHtml + dividerHtml;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  },
  
  // 其余 downloadTemplate / handleExcelImport / addCourseModal 等方法保持原样...

  downloadTemplate() {
    const templateData = [
      { "星期(1-7)": 1, "节次(1-8)": 1, "学科": "语文", "科任老师": "张老师", "上课地点": "本班教室" },
      { "星期(1-7)": 1, "节次(1-8)": 2, "学科": "数学", "科任老师": "李老师", "上课地点": "本班教室" },
      { "星期(1-7)": 2, "节次(1-8)": 1, "学科": "英语", "科任老师": "王老师", "上课地点": "本班教室" }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "课程表模版");
    XLSX.writeFile(wb, "班级课程表导入模版.xlsx");
  },

  handleExcelImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json(firstSheet);

        if (!jsonRows || jsonRows.length === 0) {
          App.showToast('未解析到课程数据');
          return;
        }

        const schedule = DataStore.get('schedule');
        let count = 0;

        jsonRows.forEach((row, idx) => {
          const day = row['星期(1-7)'] || row['星期'] || row['Day'];
          const period = row['节次(1-8)'] || row['节次'] || row['Period'];
          const subject = row['学科'] || row['课程'] || row['Subject'];

          if (day && period && subject) {
            // 覆盖重复时段
            const filtered = schedule.filter(s => !(s.day == day && s.period == period));
            filtered.push({
              id: 'crs_' + Date.now() + '_' + idx,
              day: Number(day),
              period: Number(period),
              subject: String(subject).trim(),
              teacher: row['科任老师'] || row['教师'] || '未填',
              location: row['上课地点'] || row['教室'] || '本班教室'
            });
            schedule.length = 0;
            schedule.push(...filtered);
            count++;
          }
        });

        DataStore.set('schedule', schedule);
        App.showToast(`成功导入 ${count} 节课程！`);
        App.route('schedule');
      } catch (err) {
        console.error(err);
        App.showToast('解析课程文件失败');
      }
      e.target.value = '';
    };
    reader.readAsArrayBuffer(file);
  },

  addCourseModal(defaultDay = 1, defaultPeriod = 1) {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const bodyHtml = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div class="form-group">
          <label>选择星期</label>
          <select id="crs_day" class="ui-select">
            ${days.map((d, i) => `<option value="${i + 1}" ${defaultDay === i + 1 ? 'selected' : ''}>${d}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>选择节次</label>
          <select id="crs_period" class="ui-select">
            ${Array.from({ length: 8 }).map((_, i) => `<option value="${i + 1}" ${defaultPeriod === i + 1 ? 'selected' : ''}>第 ${i + 1} 节</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>学科名称</label>
          <input type="text" id="crs_subject" class="ui-input" placeholder="例如：语文、数学、物理">
        </div>
        <div class="form-group">
          <label>科任老师</label>
          <input type="text" id="crs_teacher" class="ui-input" placeholder="例如：张老师">
        </div>
        <div class="form-group">
          <label>上课地点</label>
          <input type="text" id="crs_location" class="ui-input" placeholder="例如：本班教室 / 实验室" value="本班教室">
        </div>
      </div>
    `;
    App.showModal('手动添加/配置课程', bodyHtml, `<button class="capsule-btn primary" onclick="Modules.schedule.saveCourse()">保存课程</button>`);
  },

  saveCourse() {
    const day = Number(document.getElementById('crs_day').value);
    const period = Number(document.getElementById('crs_period').value);
    const subject = document.getElementById('crs_subject').value.trim();
    const teacher = document.getElementById('crs_teacher').value.trim() || '未指定老师';
    const location = document.getElementById('crs_location').value.trim() || '本班教室';

    if (!subject) {
      App.showToast('请输入学科名称');
      return;
    }

    let schedule = DataStore.get('schedule');
    schedule = schedule.filter(s => !(s.day === day && s.period === period));
    schedule.push({ id: 'crs_' + Date.now(), day, period, subject, teacher, location });
    
    DataStore.set('schedule', schedule);
    App.closeModal();
    App.showToast('课程已成功更新！');
    App.route('schedule');
  },

  showCourseDetail(courseId) {
    const schedule = DataStore.get('schedule');
    const item = schedule.find(s => s.id === courseId);
    if (!item) return;

    const days = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const bodyHtml = `
      <div style="padding:8px 0;">
        <div style="font-size:18px; font-weight:700; color:var(--primary-color); margin-bottom:12px;">${item.subject}</div>
        <p style="margin-bottom:8px;"><strong>时间：</strong>${days[item.day]} 第 ${item.period} 节</p>
        <p style="margin-bottom:8px;"><strong>科任老师：</strong>${item.teacher || '未指定'}</p>
        <p style="margin-bottom:8px;"><strong>上课地点：</strong>${item.location || '本班教室'}</p>
      </div>
    `;

    App.showModal('课程详细信息', bodyHtml, `
      <button class="capsule-btn secondary" style="color:#ef4444;" onclick="Modules.schedule.deleteCourse('${item.id}')">删除此课</button>
    `);
  },

  deleteCourse(courseId) {
    let schedule = DataStore.get('schedule');
    schedule = schedule.filter(s => s.id !== courseId);
    DataStore.set('schedule', schedule);
    App.closeModal();
    App.showToast('已从课表中移除该课程');
    App.route('schedule');
  }
};

// 3. 学生管理
Modules.students = {
  title: '学生管理',
  render() {
    const students = DataStore.get('students');
    return `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3>学生档案列表 (当前共有 ${students.length} 名学生)</h3>
          <div style="display:flex; gap:8px;">
            <button class="capsule-btn secondary" onclick="Modules.students.downloadTemplate()"><i class="ri-download-line"></i> 下载导入模版</button>
            <button class="capsule-btn primary" onclick="document.getElementById('studentExcelInput').click()"><i class="ri-file-excel-line"></i> 导入学生文件 (.xlsx/.csv)</button>
            <button class="capsule-btn primary" onclick="Modules.students.addStudentModal()"><i class="ri-add-line"></i> 单个新建</button>
          </div>
        </div>
        ${students.length === 0 ? `
          <div style="text-align:center; padding:40px; border:2px dashed var(--border-light); border-radius:12px;">
            <i class="ri-user-add-line" style="font-size:40px; color:var(--text-muted)"></i>
            <p style="margin-top:8px; color:var(--text-muted);">平台当前为空。点击上方【导入学生文件】直接导入 Excel / CSV 数据。</p>
          </div>
        ` : `
          <table style="width:100%; border-collapse:collapse; text-align:left;">
            <thead>
              <tr style="border-bottom:2px solid var(--border-light); color:var(--text-muted); font-size:13px;">
                <th style="padding:10px;">姓名</th>
                <th>性别</th>
                <th>家长姓名</th>
                <th>联系电话</th>
                <th>备注/档案</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(s => `
                <tr style="border-bottom:1px solid var(--border-light);">
                  <td style="padding:12px; font-weight:600;">${s.name}</td>
                  <td>${s.gender || '未知'}</td>
                  <td>${s.parent || '未填'}</td>
                  <td>${s.phone || '未填'}</td>
                  <td>${s.notes || '暂无说明'}</td>
                  <td>
                    <button class="capsule-btn secondary" onclick="Modules.students.showGrowth('${s.id}')">成长档案</button>
                    <button class="icon-btn" onclick="Modules.students.deleteStudent('${s.id}')" style="color:#ef4444;" title="删除"><i class="ri-delete-bin-line"></i></button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    `;
  },

  downloadTemplate() {
    const templateData = [
      { "姓名": "张三", "性别": "男", "家长姓名": "张爸爸", "联系电话": "13800000001", "备注": "爱好篮球" },
      { "姓名": "李四", "性别": "女", "家长姓名": "李妈妈", "联系电话": "13800000002", "备注": "学习认真" }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "学生导入模板");
    XLSX.writeFile(wb, "学生信息导入模板.xlsx");
  },

  handleExcelImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json(firstSheet);

        if (!jsonRows || jsonRows.length === 0) {
          App.showToast('未在文件中解析出有效数据');
          return;
        }

        const existingStudents = DataStore.get('students');
        let count = 0;

        jsonRows.forEach((row, idx) => {
          const name = row['姓名'] || row['Name'] || row['学生姓名'];
          if (name) {
            existingStudents.push({
              id: 'stu_' + Date.now() + '_' + idx,
              name: String(name).trim(),
              gender: row['性别'] || row['Gender'] || '未知',
              parent: row['家长姓名'] || row['家长'] || '未填',
              phone: row['联系电话'] || row['电话'] || row['手机号'] || '未填',
              score: 80,
              notes: row['备注'] || '导入数据'
            });
            count++;
          }
        });

        DataStore.set('students', existingStudents);
        App.showToast(`成功自动导入 ${count} 名学生！`);
        App.route('students');
      } catch (err) {
        console.error(err);
        App.showToast('解析文件失败，请确保格式正确');
      }
      e.target.value = '';
    };
    reader.readAsArrayBuffer(file);
  },

  showGrowth(studentId) {
    const student = DataStore.get('students').find(s => s.id === studentId);
    if (!student) return;
    const bodyHtml = `
      <h4>${student.name} - 成长轨迹</h4>
      <p style="margin-bottom:16px; color:var(--text-muted); font-size:13px;">历史考试表现趋势：</p>
      <canvas id="growthChart" style="max-height:250px;"></canvas>
    `;
    App.showModal('学生成长档案', bodyHtml);

    setTimeout(() => {
      const ctx = document.getElementById('growthChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['第一次月考', '期中考试', '第二次月考', '最近测试'],
          datasets: [{
            label: '综合表现',
            data: [75, 80, 85, student.score || 80],
            borderColor: '#f4a261',
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
        <input type="text" id="new_stu_name" class="ui-input" placeholder="学生姓名（必填）">
        <input type="text" id="new_stu_gender" class="ui-input" placeholder="性别（如：男/女）">
        <input type="text" id="new_stu_parent" class="ui-input" placeholder="家长姓名">
        <input type="text" id="new_stu_phone" class="ui-input" placeholder="联系电话">
      </div>
    `;
    App.showModal('新建学生档案', bodyHtml, `<button class="capsule-btn primary" onclick="Modules.students.saveStudent()">保存</button>`);
  },

  saveStudent() {
    const name = document.getElementById('new_stu_name').value.trim();
    if (!name) { App.showToast('姓名不能为空'); return; }

    const gender = document.getElementById('new_stu_gender').value.trim();
    const parent = document.getElementById('new_stu_parent').value.trim();
    const phone = document.getElementById('new_stu_phone').value.trim();

    const students = DataStore.get('students');
    students.push({ id: 'stu_' + Date.now(), name, gender, parent, phone, score: 80, notes: '手动添加' });
    DataStore.set('students', students);
    App.closeModal();
    App.route('students');
  },

  deleteStudent(id) {
    let students = DataStore.get('students');
    students = students.filter(s => s.id !== id);
    DataStore.set('students', students);
    App.route('students');
  }
};

// 4. 座次表
Modules.seating = {
  title: '座次表',
  render() {
    const seating = DataStore.get('seating');
    const students = DataStore.get('students');
    
    if (!seating.seats || seating.seats.length === 0) {
      seating.seats = students.map(s => s.name);
      DataStore.set('seating', seating);
    }

    return `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3>班级座次表 (讲台方向 ↑)</h3>
          <div>
            <button class="capsule-btn secondary" onclick="Modules.seating.autoSnake()">按学生列表排座</button>
          </div>
        </div>
        
        <div style="width:200px; margin:16px auto 8px auto; text-align:center; background:#e2e8f0; padding:4px; border-radius:4px; font-size:12px; color:var(--text-muted)">讲台</div>

        <div class="seat-grid" style="grid-template-columns: repeat(${seating.cols || 5}, 1fr);">
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
    const temp = seating.seats[sourceIndex];
    seating.seats[sourceIndex] = seating.seats[targetIndex];
    seating.seats[targetIndex] = temp;
    
    DataStore.set('seating', seating);
    App.route('seating');
  },

  autoSnake() {
    const students = DataStore.get('students').map(s => s.name);
    const seating = DataStore.get('seating');
    seating.seats = students;
    DataStore.set('seating', seating);
    App.route('seating');
  }
};

// 5. 班级相册
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
      container.innerHTML = `<p style="color:var(--text-muted)">暂无照片，请点击右上角上传。</p>`;
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
    
    App.showToast('照片已成功存入 IndexedDB');
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

// 6. 成绩管理
Modules.scores = {
  title: '成绩管理',
  render() {
    const scores = DataStore.get('scores');
    return `
      <div class="card">
        <h3>全科成绩概览与分析</h3>
        ${scores.length === 0 ? '<p style="color:var(--text-muted); margin-top:12px;">暂无成绩记录。</p>' : '<div style="margin-top:16px; max-height:280px;"><canvas id="scoresChart"></canvas></div>'}
      </div>
    `;
  },
  initChart() {
    const scores = DataStore.get('scores');
    if (!scores.length) return;
    const ctx = document.getElementById('scoresChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['平均分'],
        datasets: [{ label: '成绩', data: [85], backgroundColor: ['#f4a261'] }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
};

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

Modules.duty = createGenericModule('值日轮值表', 'ri-sparkles-line', '智能自动轮换，按日期周期自动对齐首页今日值日卡片。');
Modules.logs = createGenericModule('班级日志', 'ri-book-open-line', '记录日常、会议、突发事件。支持一句话速记自动归档。');
Modules.communication = createGenericModule('家校沟通', 'ri-chat-heart-line', '家校联动与逾期提醒，自动关联学生档案。');
Modules.homework = createGenericModule('作业管理', 'ri-task-line', '轻松打卡与作业完成度统计。');
Modules.classroom = createGenericModule('课堂记录', 'ri-presentation-line', '课堂表现、即时表扬与纪律扣分。');
Modules.tools = createGenericModule('减负工具箱', 'ri-briefcase-line', '包含周报月报生成器、班会 PPT 模板库等实用工具。');
