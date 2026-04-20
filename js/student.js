// 学生页面专属逻辑
const menuItems = document.querySelectorAll('.menu-item');
const contentSections = document.querySelectorAll('.content-section');

// 确保DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            console.log('点击菜单项:', targetId);
            
            // 隐藏所有内容区域
            contentSections.forEach(section => section.classList.remove('active'));
            
            // 显示目标内容区域
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                console.log('找到目标区域:', targetId);
                targetSection.classList.add('active');
                
                // 更新菜单项状态
                menuItems.forEach(m => m.classList.remove('active'));
                this.classList.add('active');
                
                // 加载相应内容
                if (targetId === 'error-section') loadErrorList();
                if (targetId === 'stats-section') loadStats();
            } else {
                console.error('未找到目标区域:', targetId);
            }
        });
    });
    
    // 为题库进入按钮添加点击事件监听器
    const startButtons = document.querySelectorAll('.bank-btn.start-btn');
    startButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bankId = this.getAttribute('data-bank-id');
            console.log('点击开始刷题按钮:', bankId);
            startExam(bankId);
        });
    });
    
    // 退出登录功能
    const logoutBtn = document.getElementById('logoutBtn');
    const dropdownLogoutBtn = document.getElementById('dropdown-logoutBtn');
    
    function handleLogout(e) {
        e.preventDefault();
        if (confirm('确定要退出登录吗？')) {
            // 清除本地存储
            localStorage.removeItem('examHistory');
            localStorage.removeItem('studentSettings');
            // 跳转到登录页面
            window.location.href = '../pages/login.html';
        }
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (dropdownLogoutBtn) {
        dropdownLogoutBtn.addEventListener('click', handleLogout);
    }
});

function loadDashboard() {
    const history = JSON.parse(localStorage.getItem('examHistory') || '[]');
    let totalQ = 0, totalCorrect = 0, totalErrors = 0;
    const today = new Date().toDateString();
    let todayCount = 0;

    history.forEach(record => {
        totalQ += record.total;
        totalCorrect += record.correct;
        totalErrors += record.errors.length;
        if (new Date(record.date).toDateString() === today) {
            todayCount += record.total;
        }
    });

    document.getElementById('totalQuestions').textContent = totalQ;
    document.getElementById('correctRate').textContent = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) + '%' : '0%';
    document.getElementById('errorCount').textContent = totalErrors;
    document.getElementById('todayCount').textContent = todayCount;
}

function loadErrorList() {
    const history = JSON.parse(localStorage.getItem('examHistory') || '[]');
    const container = document.getElementById('errorList');
    let allErrors = [];

    history.forEach(record => {
        if (record.errors && record.errors.length > 0) {
            record.errors.forEach(err => {
                allErrors.push({
                    ...err,
                    date: record.date,
                    bankName: record.bankName || '未知题库'
                });
            });
        }
    });

    if (allErrors.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-smile"></i>
                <p>暂无错题记录，继续保持！</p>
            </div>
        `;
        return;
    }

    // 按题库名称分组
    const errorsByBank = allErrors.reduce((groups, err) => {
        const bankName = err.bankName;
        if (!groups[bankName]) {
            groups[bankName] = [];
        }
        groups[bankName].push(err);
        return groups;
    }, {});

    // 生成按题库分类的HTML
    container.innerHTML = Object.entries(errorsByBank).map(([bankName, errors]) => {
        return `
            <div class="bank-error-section">
                <h4 class="bank-error-title">
                    ${bankName} (${errors.length}题)
                </h4>
                <div class="bank-error-list">
                    ${errors.map((err, i) => `
                        <div class="error-item-card">
                            <div class="error-item-header">
                                <span class="error-item-title">${i + 1}. ${err.title.replace(/^\d+\./, '')}</span>
                                <span class="error-item-date">${err.date}</span>
                            </div>
                            <div class="error-item-content">
                                ${err.options ? err.options.map((opt, j) => {
                                    const char = String.fromCharCode(65 + j);
                                    let style = '';
                                    if (char === err.correctAnswer) style = 'color:#27ae60;font-weight:bold;';
                                    else if (char === err.yourAnswer) style = 'color:#e74c3c;text-decoration:line-through;';
                                    return `<span style="${style}">${char}. ${opt}</span>  `;
                                }).join('') : '无选项'}
                            </div>
                            <div class="error-item-answer">
                                <span class="wrong-answer">你的答案：${err.yourAnswer}</span>
                                <span class="right-answer">正确答案：${err.correctAnswer}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function loadStats() {
    const history = JSON.parse(localStorage.getItem('examHistory') || '[]');
    loadWeeklyChart(history);
    loadHistoryList(history);
}

function loadWeeklyChart(history) {
    const chart = document.getElementById('weeklyChart');
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        const count = history.filter(r => new Date(r.date).toDateString() === dateStr)
            .reduce((sum, r) => sum + r.total, 0);
        weekData.push({
            day: days[date.getDay()],
            count: count,
            date: date.toLocaleDateString()
        });
    }

    const maxCount = Math.max(...weekData.map(d => d.count), 1);

    chart.innerHTML = weekData.map(d => `
        <div class="bar-item">
            <div class="bar-value">${d.count}</div>
            <div class="bar" style="height: ${(d.count / maxCount) * 150}px;"></div>
            <div class="bar-label">${d.day}</div>
        </div>
    `).join('');
}

function loadHistoryList(history) {
    const container = document.getElementById('historyList');

    if (history.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <p>暂无答题记录</p>
            </div>
        `;
        return;
    }

    container.innerHTML = history.slice(0, 10).map(record => `
        <div class="history-item">
            <div class="history-info">
                <h4>${record.bankName || '未知题库'}</h4>
                <p>日期：${record.date} | 用时：${record.time}分钟</p>
            </div>
            <div class="history-score">
                <div class="score">${record.correct}/${record.total}</div>
                <div class="date">${record.score}分</div>
            </div>
        </div>
    `).join('');
}

function saveStudentSettings() {
    const name = document.getElementById('settings-name').value;
    const major = document.getElementById('settings-major').value;
    const className = document.getElementById('settings-class').value;
    const phone = document.getElementById('settings-phone').value;
    const email = document.getElementById('settings-email').value;
    
    document.getElementById('userName').textContent = name;
    document.getElementById('userMajor').textContent = major + '专业';
    
    localStorage.setItem('studentSettings', JSON.stringify({
        name, major, className, phone, email
    }));
    
    alert('设置保存成功！');
}

// 头像上传功能
const avatarFile = document.getElementById('avatar-file');
const uploadBtn = document.getElementById('upload-btn');
const avatarPreview = document.getElementById('avatar-preview');
const uploadStatus = document.getElementById('upload-status');

if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
        avatarFile.click();
    });
}

if (avatarFile) {
    avatarFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarPreview.src = e.target.result;
                uploadStatus.textContent = '头像上传成功！';
                uploadStatus.style.color = '#27ae60';
            };
            reader.readAsDataURL(file);
        }
    });
}

// 开始刷题
function startExam(bankId) {
    window.location.href = `exam.html?bank=${bankId}`;
}

// 初始化页面
window.onload = function() {
    loadDashboard();
    
    // 加载学生设置
    const settings = JSON.parse(localStorage.getItem('studentSettings') || '{}');
    if (settings.name) {
        document.getElementById('userName').textContent = settings.name;
        document.getElementById('userMajor').textContent = (settings.major || '计算机科学与技术') + '专业';
        document.getElementById('settings-name').value = settings.name;
        document.getElementById('settings-major').value = settings.major || '计算机科学与技术';
        document.getElementById('settings-class').value = settings.className || '计算机1班';
        document.getElementById('settings-phone').value = settings.phone || '13800138000';
        document.getElementById('settings-email').value = settings.email || 'zhangsan@example.com';
    }
};