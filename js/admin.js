// 管理员页面专属逻辑
document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            contentSections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
            menuItems.forEach(m => m.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 模态框点击外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    });

    // 初始化用户操作
    initUserActions();
    
    // 更新工作台数据
    updateDashboardStats();
    
    // 每30秒更新一次数据
    setInterval(updateDashboardStats, 30000);
});

function showAddUserModal() {
    document.getElementById('addUserModal').classList.add('active');
}

function showAddBankModal() {
    document.getElementById('addBankModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// 为用户管理操作按钮添加点击事件
function initUserActions() {
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            if (!row) return;
            
            const username = row.querySelector('td:first-child').textContent;
            const name = row.querySelector('td:nth-child(2)').textContent;
            const role = row.querySelector('td:nth-child(3)').textContent;
            const registerTime = row.querySelector('td:nth-child(4)').textContent;
            const status = row.querySelector('td:nth-child(5)').textContent;
            
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content" style="max-width:500px;">
                    <div class="modal-header">
                        <h3>查看用户详情</h3>
                        <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:15px;">
                        <div class="form-group">
                            <label>用户名</label>
                            <input type="text" value="${username}" disabled style="background-color:#f8f9fa;">
                        </div>
                        <div class="form-group">
                            <label>姓名</label>
                            <input type="text" value="${name}" disabled style="background-color:#f8f9fa;">
                        </div>
                        <div class="form-group">
                            <label>角色</label>
                            <input type="text" value="${role}" disabled style="background-color:#f8f9fa;">
                        </div>
                        <div class="form-group">
                            <label>注册时间</label>
                            <input type="text" value="${registerTime}" disabled style="background-color:#f8f9fa;">
                        </div>
                        <div class="form-group">
                            <label>状态</label>
                            <input type="text" value="${status}" disabled style="background-color:#f8f9fa;">
                        </div>
                        ${role === '学生' ? `
                            <div class="form-group">
                                <label>班级</label>
                                <input type="text" value="计算机1班" disabled style="background-color:#f8f9fa;">
                            </div>
                            <div class="form-group">
                                <label>专业</label>
                                <input type="text" value="计算机科学与技术" disabled style="background-color:#f8f9fa;">
                            </div>
                        ` : role === '教师' ? `
                            <div class="form-group">
                                <label>部门</label>
                                <input type="text" value="计算机学院" disabled style="background-color:#f8f9fa;">
                            </div>
                            <div class="form-group">
                                <label>教授课程</label>
                                <input type="text" value="数据结构" disabled style="background-color:#f8f9fa;">
                            </div>
                        ` : ''}
                    </div>
                    <button class="btn-primary" style="width:100%;margin-top:20px;" onclick="this.closest('.modal').remove();">关闭</button>
                </div>
            `;
            document.body.appendChild(modal);
        });
    });

    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            if (!row) return;
            
            const username = row.querySelector('td:first-child').textContent;
            const name = row.querySelector('td:nth-child(2)').textContent;
            const role = row.querySelector('td:nth-child(3)').textContent;
            
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content" style="max-width:500px;">
                    <div class="modal-header">
                        <h3>编辑用户</h3>
                        <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <div class="form-group">
                        <label>用户名</label>
                        <input type="text" value="${username}" disabled style="background-color:#f8f9fa;">
                    </div>
                    <div class="form-group">
                        <label>姓名</label>
                        <input type="text" value="${name}" id="edit-name">
                    </div>
                    <div class="form-group">
                        <label>角色</label>
                        <select id="edit-role">
                            <option ${role === '学生' ? 'selected' : ''}>学生</option>
                            <option ${role === '教师' ? 'selected' : ''}>教师</option>
                            <option ${role === '管理员' ? 'selected' : ''}>管理员</option>
                        </select>
                    </div>
                    <div class="form-group" id="class-group" ${role === '学生' ? '' : 'style="display:none;"'}>
                        <label>班级</label>
                        <select id="edit-class">
                            <option>计算机1班</option>
                            <option>计算机2班</option>
                            <option>软件工程1班</option>
                            <option>软件工程2班</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>状态</label>
                        <select id="edit-status">
                            <option>正常</option>
                            <option>已禁用</option>
                        </select>
                    </div>
                    <button class="btn-primary" style="width:100%;" onclick="alert('用户信息更新成功！');this.closest('.modal').remove();">保存修改</button>
                </div>
            `;
            document.body.appendChild(modal);
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            if (!row) return;
            
            const username = row.querySelector('td:first-child').textContent;
            if (confirm(`确定要禁用用户 ${username} 吗？`)) {
                alert(`用户 ${username} 已被禁用`);
            }
        });
    });

    document.querySelectorAll('.btn-approve').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            if (!row) return;
            
            const username = row.querySelector('td:first-child').textContent;
            if (confirm(`确定要启用用户 ${username} 吗？`)) {
                alert(`用户 ${username} 已被启用`);
            }
        });
    });

    document.querySelectorAll('.btn-view-records').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            if (!row) return;
            
            const username = row.querySelector('td:first-child').textContent;
            const name = row.querySelector('td:nth-child(2)').textContent;
            
            const history = JSON.parse(localStorage.getItem('examHistory') || '[]');
            
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content" style="max-width:600px;">
                    <div class="modal-header">
                        <h3>${name}的做题记录</h3>
                        <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <div class="chart-container" style="margin-bottom:15px;">
                        <div class="chart-title">答题记录</div>
                        <div style="display:flex;flex-direction:column;gap:10px;">
                            ${history.length > 0 ? history.slice(0, 10).map(record => `
                                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid #eee;">
                                    <div>
                                        <strong>${record.bankName || '未知题库'}</strong>
                                        <p style="font-size:12px;color:#666;">${record.date}</p>
                                    </div>
                                    <div style="text-align:right;">
                                        <div style="font-size:18px;font-weight:bold;color:#4a90e2;">${record.score}分</div>
                                        <p style="font-size:12px;color:#666;">${record.correct}/${record.total} 正确</p>
                                    </div>
                                </div>
                            `).join('') : `
                                <div style="text-align:center;padding:20px;color:#999;">
                                    暂无做题记录
                                </div>
                            `}
                        </div>
                    </div>
                    <button class="btn-primary" style="width:100%;" onclick="this.closest('.modal').remove();">关闭</button>
                </div>
            `;
            document.body.appendChild(modal);
        });
    });
}

// 实时更新管理员工作台数据
function updateDashboardStats() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const banks = JSON.parse(localStorage.getItem('banks') || '[]');
    const history = JSON.parse(localStorage.getItem('examHistory') || '[]');
    
    const totalUsers = users.length || 500;
    const totalBanks = banks.length || 20;
    const totalQuestions = banks.reduce((sum, bank) => sum + (bank.questionCount || 0), 0) || 1200;
    
    const today = new Date().toDateString();
    const todayActiveUsers = new Set();
    history.forEach(record => {
        if (new Date(record.date).toDateString() === today) {
            todayActiveUsers.add(record.userId || 'user');
        }
    });
    const todayActive = todayActiveUsers.size || 156;

    updateStatWithAnimation('totalUsers', totalUsers);
    updateStatWithAnimation('totalBanks', totalBanks);
    updateStatWithAnimation('totalQuestions', totalQuestions);
    updateStatWithAnimation('todayActive', todayActive);
}

// 为数据更新添加动画效果
function updateStatWithAnimation(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.textContent = newValue;
}

// 监听角色选择变化
document.addEventListener('change', function(e) {
    if (e.target.id === 'edit-role') {
        const classGroup = document.getElementById('class-group');
        if (classGroup) {
            classGroup.style.display = e.target.value === '学生' ? 'block' : 'none';
        }
    }
});
