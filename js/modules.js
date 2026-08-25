/**
 * js/modules.js - 各业务功能模块页面渲染及交互处理
 */
const Modules = {
  // 1. 首页 Dashboard 模块
  dashboard: {
    render: function() {
      const container = document.getElementById('pageContent');
      const todos = DataStore.get('todos') || [];
      
      // 过滤出未完成事项
      const pendingTodos = todos.filter(t => !t.done);

      let todoItemsHtml = pendingTodos.slice(0, 5).map(todo => `
        <div class="todo-item" style="display:flex; align-items:center; justify-content:space-between; padding:12px; border-bottom:1px solid var(--border-light); background: #fff; border-radius:8px; margin-bottom:8px;">
          <div style="flex:1; cursor:pointer;" onclick="App.route('todo')">
            <div style="font-weight:500; font-size:14px; color:var(--text-dark);">${todo.title}</div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">
              <i class="ri-time-line"></i> 设立时间：${todo.date || '未设定时间'}
            </div>
          </div>
          <input type="checkbox" 
                 style="width:18px; height:18px; cursor:pointer; accent-color:var(--primary-color);" 
                 onclick="event.stopPropagation(); Modules.todo.toggleComplete('${todo.id}')" 
                 title="勾选即标记完成">
        </div>
      `).join('');

      if (pendingTodos.length === 0) {
        todoItemsHtml = `<div style="text-align:center; padding:30px; color:var(--text-muted); font-size:13px;">🎉 太棒了，当前没有任何未完成的待办事项！</div>`;
      }

      container.innerHTML = `
        <div class="dashboard-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:20px;">
          <!-- 待办事项卡片 -->
          <div class="card todo-card">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="App.route('todo')">
              <h3 style="margin:0; font-size:16px; display:flex; align-items:center; gap:6px;">
                <i class="ri-checkbox-multiple-line" style="color:var(--primary-color);"></i> 待办事项
              </h3>
              <span style="font-size:12px; color:var(--primary-color); font-weight:500;">详情 (${todos.length}) &gt;</span>
            </div>
            <div class="card-body" style="padding: 12px 16px;">
              ${todoItemsHtml}
            </div>
          </div>

          <!-- 快捷入口卡片 -->
          <div class="card">
            <div class="card-header">
              <h3 style="margin:0; font-size:16px;"><i class="ri-rocket-line"></i> 快捷工作台</h3>
            </div>
            <div class="card-body" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
              <button class="capsule-btn" onclick="App.route('students')"><i class="ri-user-smile-line"></i> 学生管理</button>
              <button class="capsule-btn" onclick="App.route('schedule')"><i class="ri-calendar-event-line"></i> 课程表</button>
              <button class="capsule-btn" onclick="App.route('seating')"><i class="ri-layout-grid-line"></i> 座次表</button>
              <button class="capsule-btn" onclick="App.route('duty')"><i class="ri-sparkles-line"></i> 值日轮值表</button>
            </div>
          </div>
        </div>
      `;
    }
  },

  // 2. 待办事项详细模块
  todo: {
    render: function() {
      const container = document.getElementById('pageContent');
      const todos = DataStore.get('todos') || [];

      const pendingList = todos.filter(t => !t.done);
      const completedList = todos.filter(t => t.done);

      container.innerHTML = `
        <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <h2 style="font-size:20px; font-weight:600; display:flex; align-items:center; gap:8px;">
            <i class="ri-checkbox-multiple-line"></i> 待办事项管理
          </h2>
          <button class="capsule-btn primary" onclick="Modules.todo.showAddModal()"><i class="ri-add-line"></i> 新增待办</button>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
          <!-- 待处理事项 -->
          <div class="card">
            <div class="card-header" style="border-bottom:2px solid #f59e0b;">
              <h3 style="font-size:15px; margin:0;">⏳ 待处理事项 (${pendingList.length})</h3>
            </div>
            <div class="card-body" style="padding:12px;">
              ${pendingList.length === 0 ? '<p style="color:var(--text-muted); font-size:13px; text-align:center; padding:20px;">暂无待处理事项</p>' : 
                pendingList.map(item => `
                  <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; border-bottom:1px solid #f0f0f0; background:#fff; border-radius:6px; margin-bottom:8px;">
                    <div>
                      <div style="font-weight:600; font-size:14px; color:var(--text-dark);">${item.title}</div>
                      <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">
                        <i class="ri-time-line"></i> 设立时间：${item.date}
                      </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                      <input type="checkbox" style="width:18px; height:18px; cursor:pointer;" onchange="Modules.todo.toggleComplete('${item.id}')" title="标记为完成">
                      <button class="icon-btn" onclick="Modules.todo.deleteTodo('${item.id}')" style="color:#ef4444;" title="删除"><i class="ri-delete-bin-line"></i></button>
                    </div>
                  </div>
                `).join('')
              }
            </div>
          </div>

          <!-- 已完成事项 -->
          <div class="card">
            <div class="card-header" style="border-bottom:2px solid #10b981;">
              <h3 style="font-size:15px; margin:0;">✅ 已完成事项 (${completedList.length})</h3>
            </div>
            <div class="card-body" style="padding:12px;">
              ${completedList.length === 0 ? '<p style="color:var(--text-muted); font-size:13px; text-align:center; padding:20px;">暂无已完成记录</p>' : 
                completedList.map(item => `
                  <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; border-bottom:1px solid #f0f0f0; background:#fafafa; border-radius:6px; margin-bottom:8px;">
                    <div>
                      <div style="text-decoration:line-through; font-size:14px; color:var(--text-muted);">${item.title}</div>
                      <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">
                        <i class="ri-calendar-check-line"></i> 设立时间：${item.date}
                      </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                      <input type="checkbox" checked style="width:18px; height:18px; cursor:pointer;" onchange="Modules.todo.toggleComplete('${item.id}')" title="取消完成">
                      <button class="icon-btn" onclick="Modules.todo.deleteTodo('${item.id}')" style="color:#ef4444;" title="删除"><i class="ri-delete-bin-line"></i></button>
                    </div>
                  </div>
                `).join('')
              }
            </div>
          </div>
        </div>
      `;
    },

    toggleComplete: function(id) {
      let todos = DataStore.get('todos') || [];
      todos = todos.map(t => {
        if (t.id === id) {
          t.done = !t.done;
        }
        return t;
      });
      DataStore.set('todos', todos);
      Modules.todo.render();
    },

    showAddModal: function() {
      const html = `
        <div class="form-group">
          <label style="font-weight:500; font-size:13px;">待办事项内容</label>
          <input type="text" id="newTodoTitle" class="ui-input" placeholder="例如：准备明天上午第二节公开课课件" style="width:100%; margin-top:6px;">
        </div>
      `;
      App.showModal('新建待办事项', html, [
        { text: '取消', class: 'capsule-btn', onclick: 'App.closeModal()' },
        { text: '确认添加', class: 'capsule-btn primary', onclick: 'Modules.todo.saveTodo()' }
      ]);
    },

    saveTodo: function() {
      const input = document.getElementById('newTodoTitle');
      if (!input || !input.value.trim()) return;

      const todos = DataStore.get('todos') || [];
      const today = new Date().toISOString().split('T')[0];

      todos.unshift({
        id: 't_' + Date.now(),
        title: input.value.trim(),
        date: today,
        done: false
      });

      DataStore.set('todos', todos);
      App.closeModal();
      Modules.todo.render();
      App.showToast('待办事项已添加');
    },

    deleteTodo: function(id) {
      let todos = DataStore.get('todos') || [];
      todos = todos.filter(t => t.id !== id);
      DataStore.set('todos', todos);
      Modules.todo.render();
      App.showToast('待办事项已删除');
    }
  },

  // 3. 通用页面生成兜底逻辑
  createGenericModule: function(pageId) {
    const container = document.getElementById('pageContent');
    const titles = {
      students: '学生管理',
      schedule: '课程表',
      seating: '座次表',
      duty: '值日轮值表',
      scores: '成绩管理',
      logs: '班级日志',
      communication: '家校沟通',
      homework: '作业管理',
      classroom: '课堂记录',
      album: '班级相册',
      tools: '减负工具箱'
    };

    const title = titles[pageId] || '页面';
    container.innerHTML = `
      <div class="card" style="padding:24px;">
        <h2>${title}</h2>
        <p style="color:var(--text-muted); margin-top:10px;">该功能模块已就绪，正在准备展示界面...</p>
        <p style="color:var(--text-muted); font-size:13px; margin-top:16px;">💡 后续版本将逐步补全各模块功能。</p>
      </div>
    `;
  }
};
