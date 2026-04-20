// 注册页面逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 角色标签切换
    const roleTabs = document.querySelectorAll('.role-tab');
    roleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            roleTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // 注册表单提交
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('reg-username').value.trim();
            const password = document.getElementById('reg-password').value.trim();
            const repassword = document.getElementById('reg-repassword').value.trim();
            const name = document.getElementById('reg-name').value.trim();
            
            const activeRoleTab = document.querySelector('.role-tab.active');
            const role = activeRoleTab ? activeRoleTab.dataset.role : 'student';

            if (!username || !password || !repassword || !name) {
                alert('请填写完整信息！');
                return;
            }

            if (password !== repassword) {
                alert('两次密码不一致！');
                return;
            }

            alert(`【${role}】账号注册成功！请登录`);
            window.location.href = 'login.html';
        });
    }
});
