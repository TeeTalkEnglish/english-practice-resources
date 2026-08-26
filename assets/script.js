const copyButtons = document.querySelectorAll('[data-copy]');

copyButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const originalLabel = button.textContent;
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      button.textContent = 'Copied!';
      button.setAttribute('aria-label', 'Prompt copied to clipboard');
      window.setTimeout(() => {
        button.textContent = originalLabel;
        button.removeAttribute('aria-label');
      }, 1800);
    } catch (error) {
      button.textContent = 'Copy unavailable';
      window.setTimeout(() => { button.textContent = originalLabel; }, 1800);
    }
  });
});

const challenges = [
  {
    message: '“Hey, are you still coming tonight?”',
    answer: '“Yes, I am! I should be there around 7. See you soon!”'
  },
  {
    message: '“Could you help me with this report?”',
    answer: '“Sure, I can take a look after lunch. What part do you need help with?”'
  },
  {
    message: '“Do you want to come to the market with us?”',
    answer: '“That sounds fun! What time are you going?”'
  },
  {
    message: '“What did you do yesterday?”',
    answer: '“I stayed home and watched a movie. It was relaxing.”'
  },
  {
    message: '“What do you think about this new cafe?”',
    answer: '“I like it. The coffee is good, and it is not too noisy.”'
  }
];

const challengeCard = document.querySelector('.challenge-card');
if (challengeCard && challengeCard.querySelector('.challenge-count')) {
  const messageBubble = challengeCard.querySelector('.message-bubble');
  const answerBox = challengeCard.querySelector('.revealed-answer');
  const answerText = answerBox.querySelector('p');
  const revealButton = challengeCard.querySelector('.reveal-button');
  const nextButton = challengeCard.querySelector('.next-challenge');
  const challengeCount = challengeCard.querySelector('.challenge-count');
  let challengeIndex = 0;

  revealButton.addEventListener('click', () => {
    answerBox.hidden = false;
    revealButton.hidden = true;
  });

  nextButton.addEventListener('click', () => {
    challengeIndex = (challengeIndex + 1) % challenges.length;
    const challenge = challenges[challengeIndex];
    messageBubble.textContent = challenge.message;
    answerText.textContent = challenge.answer;
    challengeCount.textContent = `${challengeIndex + 1} / ${challenges.length}`;
    answerBox.hidden = true;
    revealButton.hidden = false;
    revealButton.focus();
  });
}

document.querySelectorAll('[data-reveal]').forEach((button) => {
  button.addEventListener('click', () => {
    const answer = document.getElementById(button.dataset.reveal);
    if (!answer) return;
    answer.hidden = !answer.hidden;
    button.textContent = answer.hidden ? 'Reveal example answer' : 'Hide example answer';
  });
});

const interview = document.querySelector('[data-interview]');
if (interview) {
  const questions = JSON.parse(interview.dataset.interview);
  let questionIndex = 0;
  const question = interview.querySelector('[data-interview-question]');
  const answer = interview.querySelector('[data-interview-answer]');
  const count = interview.querySelector('[data-interview-count]');
  const reveal = interview.querySelector('[data-interview-reveal]');
  const next = interview.querySelector('[data-interview-next]');

  const renderQuestion = () => {
    question.textContent = questions[questionIndex].question;
    answer.textContent = questions[questionIndex].answer;
    count.textContent = `${questionIndex + 1} / ${questions.length}`;
    answer.hidden = true;
    reveal.hidden = false;
  };

  reveal.addEventListener('click', () => {
    answer.hidden = false;
    reveal.hidden = true;
  });
  next.addEventListener('click', () => {
    questionIndex = (questionIndex + 1) % questions.length;
    renderQuestion();
    next.focus();
  });
  renderQuestion();
}
