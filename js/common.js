// 页面加载完成后执行通用逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 1. 导航栏菜单切换（移动端）
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // 2. 退出登录功能（统一跳转至根目录login.html）
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('确定要退出登录吗？')) {
                window.location.href = '../pages/login.html';
            }
        });
    }

    // 3. 登录/注册页通用身份标签切换（去重复）
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