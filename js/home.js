// 首页专属逻辑
// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        const offsetTop = targetElement.offsetTop - 80;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        if (document.querySelector('.nav-links').classList.contains('active')) {
            document.querySelector('.nav-links').classList.remove('active');
        }
    });
});

// 登录弹窗交互
const loginModal = document.getElementById('loginModal');
const loginBtn = document.querySelector('.login-btn');
const heroLoginBtn = document.getElementById('heroLoginBtn');
const closeBtn = document.getElementById('closeBtn');

if (heroLoginBtn) {
    heroLoginBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

if (document.querySelector('.modal-overlay')) {
    document.querySelector('.modal-overlay').addEventListener('click', () => {
        loginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

// 身份标签切换
document.querySelectorAll('.role-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
    });
});

// 登录表单提交
if (document.querySelector('.login-form')) {
    document.querySelector('.login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const role = document.querySelector('.role-tab.active').dataset.role;
        let targetPage = '';
        if (role === 'student') targetPage = './pages/student.html';
        else if (role === 'teacher') targetPage = './pages/teacher.html';
        else if (role === 'admin') targetPage = './pages/admin.html';
        
        alert(`已选择【${role}】身份，登录成功！`);
        loginModal.style.display = 'none';
        window.location.href = targetPage;
    });
}

// 移动端菜单交互
const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}