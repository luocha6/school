document.addEventListener('DOMContentLoaded', function() {
    // ========== 基础导航切换功能 ==========
    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            
            // 隐藏所有区域
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // 显示目标区域
            document.getElementById(targetId).classList.add('active');
        });
    });

    // ========== 刷题功能核心逻辑 ==========
    // 全局变量
    let questionBank = [];
    let originalQuestionBank = [];
    let currentIndex = 0;
    let userAnswers = {};
    let countdownTimer = null;
    let errorQuestions = [];
    let currentBankId = ''; // 当前选中的题库ID

    // DOM元素
    // 导航相关
    const bankSection = document.getElementById('bank-section');
    const examSection = document.getElementById('exam-section');
    
    // 刷题界面元素
    const bankExamTitle = document.getElementById('bank-exam-title');
    const bankQuestionTitle = document.getElementById('bank-question-title');
    const bankOptionList = document.getElementById('bank-option-list');
    const bankPrevBtn = document.getElementById('bank-prev-btn');
    const bankNextBtn = document.getElementById('bank-next-btn');
    const bankSubmitBtn = document.getElementById('bank-submit-btn');
    const bankBackBtn = document.getElementById('bank-back-btn');
    const bankCurrentQuestionNum = document.getElementById('bank-current-question-num');
    const bankTotalQuestions = document.getElementById('bank-total-questions');
    const bankCountdown = document.getElementById('bank-countdown');
    
    // 错题弹窗元素（提前定义，避免重复查找）
    let bankErrorModal = null;
    let bankErrorList = null;
    let bankErrorCount = null;
    let bankCloseModal = null;
    let bankReviewBtn = null;
    let bankBackToBankBtn = null;

    // ========== 核心修复：初始化弹窗和按钮（提前创建，避免动态丢失） ==========
    function initErrorModal() {
        // 1. 创建/获取错题弹窗
        bankErrorModal = document.getElementById('bank-errorModal');
        if (!bankErrorModal) {
            bankErrorModal = document.createElement('div');
            bankErrorModal.id = 'bank-errorModal';
            document.body.appendChild(bankErrorModal);
        }

        // 2. 创建弹窗内容容器（固定结构，避免动态重建丢失事件）
        let modalContent = bankErrorModal.querySelector('.error-modal-content');
        if (!modalContent) {
            modalContent = document.createElement('div');
            modalContent.className = 'error-modal-content';
            bankErrorModal.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600;">错题汇总</h3>
                    <button id="bank-closeModal" style="padding: 5px 10px; background: #e74c3c; color: #fff; border: none; border-radius: 4px; cursor: pointer;">×</button>
                </div>
                <div style="margin-bottom: 20px; font-size: 14px;">
                    错题数量：<span id="bank-error-count" style="color: #e74c3c; font-weight: 600;">0</span>道
                </div>
                <div id="bank-errorList" style="max-height: 60vh; overflow-y: auto;"></div>
                <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
                    <button id="bank-reviewBtn" style="padding: 8px 20px; background: #3498db; color: #fff; border: none; border-radius: 4px; cursor: pointer;">重新答题</button>
                    <button id="bank-backToBankBtn" style="padding: 8px 20px; background: #95a5a6; color: #fff; border: none; border-radius: 4px; cursor: pointer;">返回题库</button>
                </div>
            `;
            bankErrorModal.appendChild(modalContent);
        }

        // 3. 重新获取按钮元素（关键！）
        bankCloseModal = document.getElementById('bank-closeModal');
        bankReviewBtn = document.getElementById('bank-reviewBtn');
        bankBackToBankBtn = document.getElementById('bank-backToBankBtn');
        bankErrorCount = document.getElementById('bank-error-count');
        bankErrorList = document.getElementById('bank-errorList');

        // 4. 绑定弹窗按钮事件（一次性绑定，永久生效）
        // 关闭弹窗（左上角叉号）
        bankCloseModal.addEventListener('click', () => {
            bankErrorModal.style.display = 'none';
        });

        // 重新答题
        bankReviewBtn.addEventListener('click', () => {
            bankErrorModal.style.display = 'none';
            resetExamState();
            loadQuestionBank(currentBankId);
        });

        // 返回题库列表
        bankBackToBankBtn.addEventListener('click', () => {
            bankErrorModal.style.display = 'none';
            clearInterval(countdownTimer);
            resetExamState();
            // 切换回题库列表
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            bankSection.classList.add('active');
        });

        // 5. 弹窗样式（解决无背景、无法滑动）
        const modalStyle = document.createElement('style');
        modalStyle.textContent = `
            #bank-errorModal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.5);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                padding: 20px;
                box-sizing: border-box;
                overflow-y: auto;
            }
            .error-modal-content {
                background: #fff;
                border-radius: 8px;
                width: 100%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                padding: 20px;
                box-sizing: border-box;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            }
            .error-item {
                padding: 15px;
                border-bottom: 1px solid #eee;
                cursor: pointer;
                transition: background 0.2s;
            }
            .error-item:hover {
                background: #f8f9fa;
            }
            .error-item-title {
                font-weight: 600;
                margin-bottom: 8px;
                font-size: 14px;
            }
            .error-item-answer {
                font-size: 13px;
                margin-bottom: 10px;
            }
            .your-answer {
                color: #e74c3c;
                font-weight: 600;
            }
            .correct-answer {
                color: #27ae60;
                font-weight: 600;
            }
            .error-detail {
                display: none;
                padding: 10px;
                background: #fafafa;
                border-radius: 4px;
                margin-top: 10px;
                font-size: 13px;
            }
            #exam-section {
                background: #fff;
                min-height: 100vh;
                padding: 20px;
                box-sizing: border-box;
            }
            .option-item {
                margin: 10px 0;
            }
        `;
        document.head.appendChild(modalStyle);

        // 6. 点击弹窗外层关闭
        bankErrorModal.addEventListener('click', (e) => {
            if (e.target === bankErrorModal) {
                bankErrorModal.style.display = 'none';
            }
        });
    }

    // 初始化弹窗（页面加载时就创建，避免动态丢失）
    initErrorModal();

    // 题库按钮点击事件（修复变量未声明）
    const startButtons = document.querySelectorAll('.start-btn');
    startButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            currentBankId = this.getAttribute('data-bank-id');
            // 隐藏其他区域，显示刷题区域
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            examSection.classList.add('active');
            
            // 根据题库ID加载对应题库
            loadQuestionBank(currentBankId);
        });
    });

    // 返回题库按钮事件（刷题页面的返回按钮）
    bankBackBtn.addEventListener('click', function() {
        // 停止倒计时
        clearInterval(countdownTimer);
        // 重置状态
        resetExamState();
        // 切换回题库列表
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        bankSection.classList.add('active');
    });

    // 加载题库
    async function loadQuestionBank(bankId) {
        try {
            // 根据题库ID加载不同的JSON文件
            let jsonPath = '';
            let examTitle = '';
            switch(bankId) {
            case 'english-1': // 高三英语1的bankId
                jsonPath = '../data/english_final_exam_1.json';
                examTitle = '高三英语3+2期末选择1';
                break;
            case 'english-2': // 高三英语2的bankId
                jsonPath = '../data/english_final_exam_2.json';
                examTitle = '高三英语3+2期末选择2';
                break;
            case 'data-structure': // 占位题库
                jsonPath = '../data/structureQuestions.json';
                examTitle = '敬请期待';
                break;
            default: // 兜底：默认加载英语1
                    jsonPath = '../data/english_final_exam_1.json';
                    examTitle = '高三英语3+2期末选择1';
            }
            
            // 打印日志，方便排查
            console.log('当前选中的题库ID：', bankId);
            console.log('加载的题库路径：', jsonPath);
            
            // 更新刷题标题
            bankExamTitle.textContent = examTitle;
            
            // 加载题库数据（增加超时）
            const response = await fetch(jsonPath, { 
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`文件不存在，状态码：${response.status}`);
            }
            const data = await response.json();
            
            // 校验JSON格式
            if (!data.questions || !Array.isArray(data.questions)) {
                throw new Error('JSON格式错了：没有questions数组');
            }
            
            // 保存原始题库
            originalQuestionBank = [...data.questions];
            // 打乱题目和选项
            questionBank = shuffleArray([...originalQuestionBank]);
            questionBank = questionBank.map(question => shuffleQuestionOptions(question));
            
            bankTotalQuestions.textContent = questionBank.length;
            // 渲染第一题
            renderBankQuestion(0);
            // 启动倒计时
            startBankCountdown();
        } catch (error) {
            bankQuestionTitle.textContent = '题库加载失败，请刷新页面！';
            console.error('题库加载错误：', error);
        }
    }

    // 渲染题目
    function renderBankQuestion(index) {
        if (questionBank.length === 0) return;
        
        const question = questionBank[index];
        bankQuestionTitle.textContent = `${index + 1}. ${question.title.replace(/^\d+\./, '')}`;
        bankCurrentQuestionNum.textContent = index + 1;
        bankOptionList.innerHTML = '';
        
        // 生成选项
        question.options.forEach((opt, i) => {
            const optionChar = String.fromCharCode(65 + i);
            const optionItem = document.createElement('div');
            optionItem.className = 'option-item';
            optionItem.innerHTML = `
                <input type="radio" name="bank-answer" id="bank-opt${optionChar}" value="${optionChar}">
                <label for="bank-opt${optionChar}">${optionChar}. ${opt}</label>
            `;
            bankOptionList.appendChild(optionItem);

            // 回显答案
            if (userAnswers[question.id] === optionChar) {
                document.getElementById(`bank-opt${optionChar}`).checked = true;
            }
        });

        // 控制按钮状态
        bankPrevBtn.disabled = index === 0;
        bankNextBtn.disabled = index === questionBank.length - 1;
    }

    // 保存答案
    function saveBankAnswer() {
        const question = questionBank[currentIndex];
        const selectedOption = document.querySelector('input[name="bank-answer"]:checked');
        if (selectedOption) {
            userAnswers[question.id] = selectedOption.value;
        }
    }

    // 上一题
    bankPrevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            saveBankAnswer();
            currentIndex--;
            renderBankQuestion(currentIndex);
        }
    });

    // 下一题
    bankNextBtn.addEventListener('click', () => {
        if (currentIndex < questionBank.length - 1) {
            saveBankAnswer();
            currentIndex++;
            renderBankQuestion(currentIndex);
        }
    });

    // 提交试卷
    bankSubmitBtn.addEventListener('click', () => {
        if (questionBank.length === 0) return;
        
        saveBankAnswer();
        
        // 计算得分和错题
        let correctCount = 0;
        errorQuestions = [];
        
        questionBank.forEach(question => {
            const userAns = userAnswers[question.id];
            if (userAns === question.answer) {
                correctCount++;
            } else {
                errorQuestions.push({
                    id: question.id,
                    title: question.title,
                    options: question.options,
                    yourAnswer: userAns || '未作答',
                    correctAnswer: question.answer,
                    correctContent: question.options[question.answer.charCodeAt(0) - 65] || ''
                });
            }
        });
        
        // 停止倒计时
        clearInterval(countdownTimer);
        
        // 显示得分提示
        const score = (correctCount / questionBank.length) * 100;
        alert(`交卷成功！你的得分：${score.toFixed(1)}分，错题数：${errorQuestions.length}道`);
        
        // 显示错题弹窗
        showBankErrorModal();
    });

    // 显示错题弹窗（核心修复：只更新内容，不重建结构）
    function showBankErrorModal() {
        // 更新错题数
        bankErrorCount.textContent = errorQuestions.length;
        bankErrorList.innerHTML = '';
        
        // 无错题时的提示
        if (errorQuestions.length === 0) {
            bankErrorList.innerHTML = '<div style="text-align: center; padding: 20px; color: #27ae60;">恭喜！你没有错题 😊</div>';
            bankErrorModal.style.display = 'flex';
            return;
        }
        
        // 渲染错题列表
        errorQuestions.forEach((error, index) => {
            const errorItem = document.createElement('div');
            errorItem.className = 'error-item';
            errorItem.innerHTML = `
                <div class="error-item-title">${index + 1}. ${error.title.replace(/^\d+\./, '')}</div>
                <div class="error-item-answer">
                    你的答案：<span class="your-answer">${error.yourAnswer}</span> | 
                    正确答案：<span class="correct-answer">${error.correctAnswer}（${error.correctContent || '无'}）</span>
                </div>
                <div class="error-detail" id="bank-detail-${error.id}">
                    <div style="font-weight: 600; margin-bottom: 5px;">题目详情：</div>
                    ${error.options.map((opt, i) => {
                        const char = String.fromCharCode(65 + i);
                        let color = '';
                        if (char === error.correctAnswer) color = 'color: #27ae60;';
                        else if (char === error.yourAnswer) color = 'color: #e74c3c;';
                        return `<div style="${color}">${char}. ${opt}</div>`;
                    }).join('')}
                </div>
            `;
            
            // 点击展开详情
            errorItem.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止冒泡关闭弹窗
                const detail = document.getElementById(`bank-detail-${error.id}`);
                detail.style.display = detail.style.display === 'block' ? 'none' : 'block';
            });
            
            bankErrorList.appendChild(errorItem);
        });
        
        // 显示弹窗
        bankErrorModal.style.display = 'flex';
    }

    // 倒计时功能
    function startBankCountdown() {
        let minutes = 100;
        let seconds = 0;
        
        bankCountdown.textContent = `${minutes.toString().padStart(2, '0')}:00`;
        
        clearInterval(countdownTimer);
        countdownTimer = setInterval(() => {
            seconds--;
            if (seconds < 0) {
                minutes--;
                seconds = 59;
            }
            
            const formattedMin = minutes.toString().padStart(2, '0');
            const formattedSec = seconds.toString().padStart(2, '0');
            bankCountdown.textContent = `${formattedMin}:${formattedSec}`;
            
            if (minutes === 0 && seconds === 0) {
                clearInterval(countdownTimer);
                alert('时间到！自动提交试卷');
                bankSubmitBtn.click();
            }
        }, 1000);
    }

    // 重置刷题状态
    function resetExamState() {
        currentIndex = 0;
        userAnswers = {};
        errorQuestions = [];
        clearInterval(countdownTimer);
        // 重置倒计时显示
        if (bankCountdown) {
            bankCountdown.textContent = '100:00';
        }
    }

    // ========== 工具函数 ==========
    // Fisher-Yates 洗牌算法
    function shuffleArray(arr) {
        const newArr = [...arr];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    }

    // 打乱题目选项并适配正确答案
    function shuffleQuestionOptions(question) {
        const optionWithChar = question.options.map((opt, i) => ({
            char: String.fromCharCode(65 + i),
            content: opt
        }));
        
        const shuffledOptions = shuffleArray(optionWithChar);
        const newOptions = shuffledOptions.map(item => item.content);
        
        let newAnswer = '';
        const originalCorrectContent = question.options[question.answer.charCodeAt(0) - 65];
        // 修复：兼容正确答案匹配失败的情况
        const correctItem = shuffledOptions.find(item => item.content === originalCorrectContent);
        if (correctItem) {
            newAnswer = String.fromCharCode(65 + shuffledOptions.indexOf(correctItem));
        } else {
            newAnswer = question.answer; // 兜底：保留原答案
            console.warn('选项匹配失败，使用原答案', question.id);
        }

        return {
            ...question,
            options: newOptions,
            answer: newAnswer
        };
    }
});
