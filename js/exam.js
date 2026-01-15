document.addEventListener('DOMContentLoaded', function() {
    // 1. 初始化变量
    let questionBank = [];
    let currentIndex = 0;
    let userAnswers = {};

    // 2. 获取DOM元素
    const questionTitle = document.getElementById('question-title');
    const optionList = document.getElementById('option-list');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');

    // 3. 异步读取JSON题库文件（路径修正）
    fetch('../data/questionBank.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('无法读取题库文件，请检查文件路径');
            }
            return response.json();
        })
        .then(data => {
            const shuffledQuestionList = shuffleArray(data.questions);
            questionBank = shuffledQuestionList.map(question => {
                return shuffleQuestionOptions(question);
            });
            renderQuestion(currentIndex);
        })
        .catch(error => {
            console.error('题库加载失败：', error);
            questionTitle.textContent = '题库加载失败，请刷新页面重试';
        });

    // 4. 渲染题目
    function renderQuestion(index) {
        const question = questionBank[index];
        questionTitle.textContent = question.title;
        
        optionList.innerHTML = '';
        
        question.options.forEach((opt, i) => {
            const optionItem = document.createElement('div');
            optionItem.className = 'option-item';
            const optValue = String.fromCharCode(65 + i);
            optionItem.innerHTML = `
                <input type="radio" name="answer" id="opt${i+1}" value="${optValue}">
                <label for="opt${i+1}">${optValue}. ${opt}</label>
            `;
            optionList.appendChild(optionItem);

            if (userAnswers[question.id] === optValue) {
                document.getElementById(`opt${i+1}`).checked = true;
            }
        });

        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === questionBank.length - 1;
    }

    // 5. 上一题事件监听
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0 && questionBank.length > 0) {
            saveAnswer();
            currentIndex--;
            renderQuestion(currentIndex);
        }
    });

    // 6. 下一题事件监听
    nextBtn.addEventListener('click', () => {
        if (currentIndex < questionBank.length - 1 && questionBank.length > 0) {
            saveAnswer();
            currentIndex++;
            renderQuestion(currentIndex);
        }
    });

    // 7. 提交试卷事件监听
    submitBtn.addEventListener('click', () => {
        if (questionBank.length === 0) return;
        saveAnswer();
        let score = 0;
        for (let q of questionBank) {
            if (userAnswers[q.id] === q.answer) {
                score += 10;
            }
        }
        alert(`答题完成！你的得分是：${score}分`);
        window.location.href = 'student.html';
    });

    // 8. 保存用户答案辅助函数
    function saveAnswer() {
        const selected = document.querySelector('input[name="answer"]:checked');
        if (selected) {
            userAnswers[questionBank[currentIndex].id] = selected.value;
        }
    }

    // 9. 工具函数：Fisher-Yates 数组洗牌
    function shuffleArray(arr) {
        const newArr = [...arr];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    }

    // 10. 工具函数：打乱单道题的选项顺序
    function shuffleQuestionOptions(question) {
        const optionWithLetter = question.options.map((opt, index) => {
            return {
                letter: String.fromCharCode(65 + index),
                content: opt
            };
        });

        const shuffledOptionWithLetter = shuffleArray(optionWithLetter);
        const shuffledOptions = shuffledOptionWithLetter.map(item => item.content);

        let newAnswer = '';
        const originalCorrectContent = question.options[question.answer.charCodeAt(0) - 65];
        shuffledOptionWithLetter.forEach(item => {
            if (item.content === originalCorrectContent) {
                newAnswer = item.letter;
            }
        });

        return {
            ...question,
            options: shuffledOptions,
            answer: newAnswer
        };
    }
});