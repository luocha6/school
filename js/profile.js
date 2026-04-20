document.addEventListener('DOMContentLoaded', function() {
    // 1. 获取头像相关元素
    const avatarFile = document.getElementById('avatar-file');
    const avatarPreview = document.getElementById('avatar-preview');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadStatus = document.getElementById('upload-status');

    if (!avatarFile || !avatarPreview || !uploadBtn) return;

    // 2. 点击头像/按钮触发文件选择框
    uploadBtn.addEventListener('click', () => avatarFile.click());
    avatarPreview.addEventListener('click', () => avatarFile.click());

    // 3. 选择文件后处理
    avatarFile.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // 验证文件类型和大小
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 2 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
            uploadStatus.textContent = '错误：仅支持JPG/PNG/GIF格式';
            uploadStatus.className = 'upload-status error';
            return;
        }

        if (file.size > maxSize) {
            uploadStatus.textContent = '错误：文件大小不能超过2M';
            uploadStatus.className = 'upload-status error';
            return;
        }

        // 本地预览头像
        const reader = new FileReader();
        reader.onload = function(e) {
            avatarPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // 模拟上传
        uploadStatus.textContent = '';
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<span class="loading"></span> 上传中';

        setTimeout(() => {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '更换头像';
            uploadStatus.textContent = '上传成功！';
            uploadStatus.className = 'upload-status';
            avatarFile.value = '';
        }, 1500);
    });
});