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
        loginForm.addEventListener('submit', async function(e) {
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

            // 调用后端 API 进行登录
            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: username,
                        password: password
                    })
                });

                const data = await response.json();

                if (data.success) {
                    // 保存 token 和用户信息
                    localStorage.setItem('access_token', data.data.tokens.accessToken);
                    localStorage.setItem('refresh_token', data.data.tokens.refreshToken);
                    localStorage.setItem('user_info', JSON.stringify(data.data.user));

                    // 保存用户角色到 localStorage
                    localStorage.setItem('user_role', data.data.user.role);

                    alert(`登录成功！即将进入${role}中心`);
                    window.location.href = targetPage;
                } else {
                    alert(data.message || '登录失败，请检查账号密码');
                }
            } catch (error) {
                console.error('登录错误:', error);
                alert('登录失败，请检查网络连接或服务器状态');
            }
        });
    }
});
