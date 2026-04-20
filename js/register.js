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
        registerForm.addEventListener('submit', async function(e) {
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

            // 调用后端 API 进行注册
            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        email: username,
                        password: password,
                        role: role
                    })
                });

                const data = await response.json();

                if (data.success) {
                    // 保存 token 和用户信息
                    localStorage.setItem('access_token', data.data.tokens.accessToken);
                    localStorage.setItem('refresh_token', data.data.tokens.refreshToken);
                    localStorage.setItem('user_info', JSON.stringify(data.data.user));
                    localStorage.setItem('user_role', data.data.user.role);

                    alert(`【${role}】账号注册成功！`);
                    window.location.href = 'login.html';
                } else {
                    alert(data.message || '注册失败，请稍后重试');
                }
            } catch (error) {
                console.error('注册错误:', error);
                alert('注册失败，请检查网络连接或服务器状态');
            }
        });
    }
});
