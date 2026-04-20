// 教师页面专属逻辑
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

function showAddBankModal() {
    document.getElementById('addBankModal').classList.add('active');
}

function showAddStudentModal() {
    document.getElementById('addStudentModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function saveTeacherSettings() {
    const name = document.getElementById('settings-name').value;
    const dept = document.getElementById('settings-dept').value;
    document.getElementById('teacherName').textContent = name;
    document.getElementById('teacherDept').textContent = dept;
    localStorage.setItem('teacherSettings', JSON.stringify({
        name, dept,
        phone: document.getElementById('settings-phone').value,
        email: document.getElementById('settings-email').value
    }));
    alert('设置保存成功！');
}

// 班级筛选功能
function initClassFilter() {
    const classFilter = document.getElementById('classFilter');
    if (classFilter) {
        classFilter.addEventListener('change', function() {
            const selectedClass = this.value;
            const studentCards = document.querySelectorAll('.student-card');
            studentCards.forEach(card => {
                if (selectedClass === 'all' || card.dataset.class === selectedClass) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

// 加载题库列表
function loadBankTable() {
    const table = document.getElementById('bankTable');
    const tbody = table.querySelector('tbody');
    
    // 模拟题库数据
    const banks = [
        { id: 1, name: '高三英语3+2期末选择1', type: '选择题', count: 90, difficulty: '中等', createTime: '2024-01-01' },
        { id: 2, name: '高三英语3+2期末选择2', type: '选择题', count: 50, difficulty: '简单', createTime: '2024-01-02' },
        { id: 3, name: '数据结构基础题', type: '选择题', count: 20, difficulty: '较难', createTime: '2024-01-03' }
    ];
    
    tbody.innerHTML = banks.map(bank => `
        <tr>
            <td>${bank.id}</td>
            <td>${bank.name}</td>
            <td>${bank.type}</td>
            <td>${bank.count}</td>
            <td>${bank.difficulty}</td>
            <td>${bank.createTime}</td>
            <td>
                <div class="bank-actions">
                    <button class="btn-view">查看</button>
                    <button class="btn-edit">编辑</button>
                    <button class="btn-delete">删除</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // 添加操作按钮事件
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const bankName = row.cells[1].textContent;
            alert(`查看题库：${bankName}`);
        });
    });
    
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const bankName = row.cells[1].textContent;
            alert(`编辑题库：${bankName}`);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const bankName = row.cells[1].textContent;
            if (confirm(`确定删除题库：${bankName}？`)) {
                row.remove();
                alert('删除成功！');
            }
        });
    });
}

// 加载学生列表
function loadStudentList() {
    const container = document.getElementById('studentList');
    
    // 模拟学生数据
    const students = [
        { id: 1, name: '张三', class: '计算机1班', major: '计算机科学与技术', phone: '13800138000' },
        { id: 2, name: '李四', class: '计算机1班', major: '软件工程', phone: '13800138001' },
        { id: 3, name: '王五', class: '计算机2班', major: '计算机科学与技术', phone: '13800138002' },
        { id: 4, name: '赵六', class: '计算机2班', major: '软件工程', phone: '13800138003' }
    ];
    
    container.innerHTML = students.map(student => `
        <div class="student-card" data-class="${student.class}">
            <div class="student-info">
                <h4>${student.name}</h4>
                <p>班级：${student.class} | 专业：${student.major}</p>
                <p>电话：${student.phone}</p>
            </div>
            <div class="student-actions">
                <button class="btn-view-student">查看</button>
                <button class="btn-edit-student">编辑</button>
            </div>
        </div>
    `).join('');
    
    // 添加操作按钮事件
    document.querySelectorAll('.btn-view-student').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.student-card');
            const studentName = card.querySelector('h4').textContent;
            alert(`查看学生：${studentName}`);
        });
    });
    
    document.querySelectorAll('.btn-edit-student').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.student-card');
            const studentName = card.querySelector('h4').textContent;
            alert(`编辑学生：${studentName}`);
        });
    });
    
    // 初始化班级筛选
    initClassFilter();
}

// 加载成绩统计
function loadScoreStats() {
    const container = document.getElementById('scoreStats');
    
    // 模拟成绩数据
    const stats = [
        { student: '张三', subject: '英语', score: 85, date: '2024-01-01' },
        { student: '李四', subject: '英语', score: 90, date: '2024-01-01' },
        { student: '张三', subject: '数据结构', score: 75, date: '2024-01-02' },
        { student: '李四', subject: '数据结构', score: 80, date: '2024-01-02' }
    ];
    
    container.innerHTML = stats.map(stat => `
        <div class="score-item">
            <div class="score-info">
                <h4>${stat.student}</h4>
                <p>科目：${stat.subject} | 日期：${stat.date}</p>
            </div>
            <div class="score-value">${stat.score}分</div>
        </div>
    `).join('');
}

// 搜索学生成绩
function searchStudentScore() {
    const searchInput = document.getElementById('searchStudent');
    const studentName = searchInput.value.trim();
    
    if (!studentName) {
        alert('请输入学生姓名');
        return;
    }
    
    // 模拟搜索结果
    const results = [
        { subject: '英语', score: 85, date: '2024-01-01' },
        { subject: '数据结构', score: 75, date: '2024-01-02' }
    ];
    
    const container = document.getElementById('scoreStats');
    container.innerHTML = `
        <h3>${studentName}的成绩记录</h3>
        ${results.map(result => `
            <div class="score-item">
                <div class="score-info">
                    <h4>${result.subject}</h4>
                    <p>日期：${result.date}</p>
                </div>
                <div class="score-value">${result.score}分</div>
            </div>
        `).join('')}
    `;
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 加载教师设置
    const settings = JSON.parse(localStorage.getItem('teacherSettings') || '{}');
    if (settings.name) {
        document.getElementById('teacherName').textContent = settings.name;
        document.getElementById('teacherDept').textContent = settings.dept || '计算机系';
        document.getElementById('settings-name').value = settings.name;
        document.getElementById('settings-dept').value = settings.dept || '计算机系';
        document.getElementById('settings-phone').value = settings.phone || '13800138000';
        document.getElementById('settings-email').value = settings.email || 'teacher@example.com';
    }
    
    // 加载题库列表
    loadBankTable();
    
    // 加载学生列表
    loadStudentList();
    
    // 加载成绩统计
    loadScoreStats();
    
    // 绑定搜索按钮事件
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchStudentScore);
    }
});