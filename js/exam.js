// 考试页面逻辑
let questionBank = [];
let originalQuestionBank = [];
let currentIndex = 0;
let userAnswers = {};
let countdownTimer = null;
let errorQuestions = [];
let currentBankId = '';

const questionTitle = document.getElementById('question-title');
const optionList = document.getElementById('option-list');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const currentQuestionNum = document.getElementById('current-question-num');
const totalQuestions = document.getElementById('total-questions');
const countdown = document.getElementById('countdown');
const examTitle = document.getElementById('examTitle');
const bankSelector = document.getElementById('bankSelector');
const examWrapper = document.getElementById('examWrapper');
const backToBankBtn = document.getElementById('back-to-bank');

const errorModal = document.getElementById('errorModal');
const errorList = document.getElementById('errorList');
const errorCount = document.getElementById('error-count');
const closeModal = document.getElementById('closeModal');
const reviewBtn = document.getElementById('reviewBtn');
const backBtn = document.getElementById('backBtn');

// 事件监听器
document.querySelectorAll('.start-exam-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        currentBankId = this.getAttribute('data-bank');
        loadQuestionBank(currentBankId);
    });
});

backToBankBtn.addEventListener('click', () => {
    clearInterval(countdownTimer);
    resetExamState();
    examWrapper.classList.remove('active');
    bankSelector.style.display = 'block';
});

prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        saveCurrentAnswer();
        currentIndex--;
        renderQuestion(currentIndex);
    }
});

nextBtn.addEventListener('click', () => {
    if (currentIndex < questionBank.length - 1) {
        saveCurrentAnswer();
        currentIndex++;
        renderQuestion(currentIndex);
    }
});

submitBtn.addEventListener('click', () => {
    if (questionBank.length === 0) return;
    
    saveCurrentAnswer();
    
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
    
    const score = (correctCount / questionBank.length) * 100;
    clearInterval(countdownTimer);
    
    saveErrorToStorage(errorQuestions, score);
    showErrorModal(score, correctCount);
});

closeModal.addEventListener('click', () => {
    errorModal.style.display = 'none';
});

reviewBtn.addEventListener('click', () => {
    errorModal.style.display = 'none';
    // 可以添加查看错题的逻辑
});

backBtn.addEventListener('click', () => {
    errorModal.style.display = 'none';
    backToBankBtn.click();
});

// 处理选项点击
optionList.addEventListener('change', saveCurrentAnswer);

// 加载题库
async function loadQuestionBank(bankId) {
    let jsonPath = '';
    let title = '';
    
    switch(bankId) {
        case 'english-1':
            jsonPath = '../assets/data/english_final_exam_1.json';
            title = '高三英语3+2期末选择1';
            break;
        case 'english-2':
            jsonPath = '../assets/data/english_final_exam_2.json';
            title = '高三英语3+2期末选择2';
            break;
        case 'data-structure':
            jsonPath = '../assets/data/structureQuestions.json';
            title = '数据结构基础题';
            break;
        default:
            jsonPath = '../assets/data/english_final_exam_1.json';
            title = '高三英语3+2期末选择1';
    }

    try {
        const response = await fetch(jsonPath);
        if (!response.ok) throw new Error('题库加载失败');
        const data = await response.json();
        
        originalQuestionBank = [...data.questions];
        questionBank = shuffleArray([...originalQuestionBank]);
        questionBank = questionBank.map(question => shuffleQuestionOptions(question));
        
        examTitle.textContent = title;
        totalQuestions.textContent = questionBank.length;
        
        bankSelector.style.display = 'none';
        examWrapper.classList.add('active');
        
        renderQuestion(0);
        startCountdown();
    } catch (error) {
        questionTitle.textContent = '题库加载失败，请刷新页面！';
        console.error('题库加载错误：', error);
    }
}

// 渲染题目
function renderQuestion(index) {
    if (questionBank.length === 0) return;
    
    const question = questionBank[index];
    questionTitle.textContent = `${index + 1}. ${question.title.replace(/^\d+\./, '')}`;
    currentQuestionNum.textContent = index + 1;
    optionList.innerHTML = '';
    
    question.options.forEach((opt, i) => {
        const optionChar = String.fromCharCode(65 + i);
        const optionItem = document.createElement('div');
        optionItem.className = 'option-item';
        optionItem.innerHTML = `
            <input type="radio" name="answer" id="opt${optionChar}" value="${optionChar}">
            <label for="opt${optionChar}">${optionChar}. ${opt}</label>
        `;
        optionList.appendChild(optionItem);

        if (userAnswers[question.id] === optionChar) {
            document.getElementById(`opt${optionChar}`).checked = true;
        }
    });

    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === questionBank.length - 1;
}

// 保存当前答案
function saveCurrentAnswer() {
    const question = questionBank[currentIndex];
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    if (selectedOption) {
        userAnswers[question.id] = selectedOption.value;
    }
}

// 保存错误到本地存储
function saveErrorToStorage(errors, score) {
    let history = JSON.parse(localStorage.getItem('examHistory') || '[]');
    history.unshift({
        date: new Date().toLocaleString(),
        bankId: currentBankId,
        score: score.toFixed(1),
        total: questionBank.length,
        correct: questionBank.length - errors.length,
        errors: errors
    });
    if (history.length > 20) history = history.slice(0, 20);
    localStorage.setItem('examHistory', JSON.stringify(history));
}

// 显示错误模态框
function showErrorModal(score, correctCount) {
    errorCount.textContent = errorQuestions.length;
    errorList.innerHTML = '';
    
    if (errorQuestions.length === 0) {
        errorList.innerHTML = '<div style="text-align:center;padding:20px;color:#27ae60;">恭喜！你没有错题</div>';
    } else {
        errorQuestions.forEach((error, index) => {
            const errorItem = document.createElement('div');
            errorItem.className = 'error-item';
            errorItem.innerHTML = `
                <div class="error-item-title">${index + 1}. ${error.title.replace(/^\d+\./, '')}</div>
                <div class="error-item-answer">
                    你的答案：<span class="your-answer">${error.yourAnswer}</span> | 
                    正确答案：<span class="correct-answer">${error.correctAnswer}（${error.correctContent || ''}）</span>
                </div>
                <div class="error-detail" id="detail-${error.id}">
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
            errorList.appendChild(errorItem);
        });
    }
    
    // 显示分数信息
    document.getElementById('score-display').textContent = score.toFixed(1);
    document.getElementById('correct-count').textContent = correctCount;
    document.getElementById('total-count').textContent = questionBank.length;
    
    errorModal.style.display = 'flex';
}

// 开始倒计时
function startCountdown() {
    let timeLeft = 30 * 60; // 30分钟
    
    function updateCountdown() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        countdown.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            submitBtn.click();
        }
        
        timeLeft--;
    }
    
    updateCountdown();
    countdownTimer = setInterval(updateCountdown, 1000);
}

// 数组洗牌
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 洗牌题目选项
function shuffleQuestionOptions(question) {
    const originalOptions = [...question.options];
    const shuffledOptions = shuffleArray([...originalOptions]);
    
    // 重新计算正确答案
    const answerIndex = originalOptions.indexOf(question.options[question.answer.charCodeAt(0) - 65]);
    if (answerIndex !== -1) {
        const correctOption = originalOptions[answerIndex];
        const newAnswerIndex = shuffledOptions.indexOf(correctOption);
        question.answer = String.fromCharCode(65 + newAnswerIndex);
    }
    
    question.options = shuffledOptions;
    return question;
}

// 重置考试状态
function resetExamState() {
    questionBank = [];
    originalQuestionBank = [];
    currentIndex = 0;
    userAnswers = {};
    errorQuestions = [];
    currentBankId = '';
}
