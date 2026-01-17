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
    
    // 错题弹窗元素
    const bankErrorModal = document.getElementById('bank-errorModal');
    const bankErrorList = document.getElementById('bank-errorList');
    const bankErrorCount = document.getElementById('bank-error-count');
    const bankCloseModal = document.getElementById('bank-closeModal');
    const bankReviewBtn = document.getElementById('bank-reviewBtn');
    const bankBackToBankBtn = document.getElementById('bank-backToBankBtn');

    // 题库按钮点击事件
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

    // 返回题库按钮事件
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
            
           // 新增：打印日志，方便排查（可选，但建议保留）
        console.log('当前选中的题库ID：', bankId);
        console.log('加载的题库路径：', jsonPath);
        
        // 更新刷题标题
        bankExamTitle.textContent = examTitle;
        
        // 加载题库数据（增加超时）
        const response = await fetch(jsonPath, { timeout: 5000 });
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
                    correctContent: question.options[question.answer.charCodeAt(0) - 65]
                });
            }
        });
        
        // 停止倒计时
        clearInterval(countdownTimer);
        
        // 显示错题弹窗
        showBankErrorModal();
    });

    // 显示错题弹窗
    function showBankErrorModal() {
        bankErrorCount.textContent = errorQuestions.length;
        bankErrorList.innerHTML = '';
        
        errorQuestions.forEach((error, index) => {
            const errorItem = document.createElement('div');
            errorItem.className = 'error-item';
            errorItem.innerHTML = `
                <div class="error-item-title">${index + 1}. ${error.title.replace(/^\d+\./, '')}</div>
                <div class="error-item-answer">
                    你的答案：<span class="your-answer">${error.yourAnswer}</span> | 
                    正确答案：<span class="correct-answer">${error.correctAnswer}（${error.correctContent}）</span>
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
            errorItem.addEventListener('click', () => {
                const detail = document.getElementById(`bank-detail-${error.id}`);
                detail.style.display = detail.style.display === 'block' ? 'none' : 'block';
            });
            
            bankErrorList.appendChild(errorItem);
        });
        
        bankErrorModal.style.display = 'flex';
    }

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

    // 关闭弹窗
    bankCloseModal.addEventListener('click', () => {
        bankErrorModal.style.display = 'none';
    });

    // 点击弹窗外层关闭
    window.addEventListener('click', (e) => {
        if (e.target === bankErrorModal) {
            bankErrorModal.style.display = 'none';
        }
    });

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
        shuffledOptions.forEach(item => {
            if (item.content === originalCorrectContent) {
                newAnswer = String.fromCharCode(65 + shuffledOptions.indexOf(item));
            }
        });

        return {
            ...question,
            options: newOptions,
            answer: newAnswer
        };
    }
});