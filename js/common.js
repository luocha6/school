// 页面加载完成后执行通用逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 1. 初始化默认数据
    initDefaultData();

    // 2. 导航栏菜单切换（移动端）
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // 3. 下拉菜单功能
    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (dropdownBtn && dropdownMenu) {
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });
        
        // 点击页面其他地方关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });
        
        // 点击下拉菜单项后关闭菜单
        const dropdownItems = dropdownMenu.querySelectorAll('a');
        dropdownItems.forEach(item => {
            item.addEventListener('click', () => {
                dropdownMenu.classList.remove('active');
            });
        });
    }

    // 4. 退出登录功能（统一跳转至首页）
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('确定要退出登录吗？')) {
                window.location.href = '../index.html';
            }
        });
    }

    // 5. 登录/注册页通用身份标签切换（去重复）
    const roleTabs = document.querySelectorAll('.role-tab');
    if (roleTabs.length > 0) {
        roleTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                roleTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
    }
});

// 初始化默认数据
function initDefaultData() {
    // 初始化用户数据
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {
                id: 'admin',
                name: '管理员',
                role: '管理员',
                password: '123456'
            },
            {
                id: 'teacher1',
                name: '李老师',
                role: '教师',
                password: '123456',
                department: '计算机系'
            },
            {
                id: 'student1',
                name: '张三',
                role: '学生',
                password: '123456',
                major: '计算机科学与技术',
                class: '计算机1班'
            },
            {
                id: 'student2',
                name: '李四',
                role: '学生',
                password: '123456',
                major: '软件工程',
                class: '计算机1班'
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }

    // 初始化题库数据
    if (!localStorage.getItem('banks')) {
        const defaultBanks = [
            {
                id: 'bank1',
                name: '高三英语3+2期末选择1',
                questionCount: 90,
                createDate: '2026-01-10',
                status: '已发布'
            },
            {
                id: 'bank2',
                name: '高三英语3+2期末选择2',
                questionCount: 50,
                createDate: '2026-01-08',
                status: '已发布'
            },
            {
                id: 'bank3',
                name: '数据结构基础题',
                questionCount: 20,
                createDate: '2026-01-05',
                status: '草稿'
            }
        ];
        localStorage.setItem('banks', JSON.stringify(defaultBanks));
    }

    // 初始化考试历史数据
    if (!localStorage.getItem('examHistory')) {
        const defaultHistory = [
            {
                id: 'history1',
                userId: 'student1',
                bankName: '高三英语3+2期末选择1',
                score: 85,
                total: 90,
                correct: 76,
                time: '45分钟',
                date: '2026-01-10'
            },
            {
                id: 'history2',
                userId: 'student1',
                bankName: '高三英语3+2期末选择2',
                score: 92,
                total: 50,
                correct: 46,
                time: '30分钟',
                date: '2026-01-08'
            },
            {
                id: 'history3',
                userId: 'student2',
                bankName: '数据结构基础题',
                score: 78,
                total: 20,
                correct: 15,
                time: '25分钟',
                date: '2026-01-05'
            }
        ];
        localStorage.setItem('examHistory', JSON.stringify(defaultHistory));
    }
}