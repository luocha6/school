// 登录页面逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 角色标签切换
    const roleTabs = document.querySelectorAll('.role-tab');
    roleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            roleTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // 登录表单提交
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value.trim();
            
            if (!username) {
                alert('请输入账号！');
                document.getElementById('login-username').focus();
                return;
            }
            if (!password) {
                alert('请输入密码！');
                document.getElementById('login-password').focus();
                return;
            }
            
            const activeRoleTab = document.querySelector('.role-tab.active');
            const role = activeRoleTab ? activeRoleTab.dataset.role : 'student';
            
            let targetPage = '';
            switch(role) {
                case 'student':
                    targetPage = './student.html';
                    break;
                case 'teacher':
                    targetPage = './teacher.html';
                    break;
                case 'admin':
                    targetPage = './admin.html';
                    break;
                default:
                    targetPage = './student.html';
            }
            
            alert(`【${role}】登录成功！即将进入${role}中心`);
            window.location.href = targetPage;
        });
    }
});
