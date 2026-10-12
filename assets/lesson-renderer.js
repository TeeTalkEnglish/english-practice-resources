(() => {
  const lessonRoot = document.getElementById('lesson');
  const topic = new URLSearchParams(window.location.search).get('topic');

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const addParagraphs = (parent, paragraphs, className) => {
    (paragraphs || []).forEach((text) => parent.append(element('p', className, text)));
  };

  const makeCard = (className, title, description) => {
    const card = element('article', className);
    if (title) card.append(element('h3', '', title));
    if (description) card.append(element('p', '', description));
    return card;
  };

  const renderIntro = (data) => {
    const section = element('section', 'intro-section');
    section.id = 'lesson-introduction';
    section.append(element('div', 'section-number', '01'));
    const content = element('div');
    content.append(element('p', 'kicker', 'Lesson introduction'));
    content.append(element('h2', '', data.introduction.heading));
    addParagraphs(content, data.introduction.paragraphs);
    section.append(content);
    return section;
  };

  const renderVocabulary = (section) => {
    const grid = element('div', 'lesson-card-grid');
    section.items.forEach((item) => {
      const card = makeCard('lesson-content-card vocabulary-card', item.term);
      const intensity = element('span', 'intensity-label', `Intensity: ${item.intensity}`);
      card.append(intensity);
      card.append(element('p', '', item.definition));
      const example = element('blockquote', 'lesson-example', `“${item.example}”`);
      card.append(example);
      if (item.note) card.append(element('p', 'lesson-note', item.note));
      grid.append(card);
    });
    return grid;
  };

  const renderExpressions = (section) => {
    const list = element('div', 'lesson-stack');
    section.items.forEach((item) => {
      const card = makeCard('lesson-content-card expression-card', item.expression);
      const details = element('dl', 'expression-details');
      [['Meaning', item.meaning], ['When to use it', item.context], ['Tone', item.tone]].forEach(([label, value]) => {
        details.append(element('dt', '', label), element('dd', '', value));
      });
      card.append(details);
      if (item.caution) card.append(element('p', 'lesson-caution', item.caution));
      list.append(card);
    });
    return list;
  };

  const renderTone = (section) => {
    const grid = element('div', 'lesson-card-grid');
    section.versions.forEach((item) => {
      const card = makeCard('lesson-content-card tone-card', item.delivery);
      card.append(element('blockquote', 'lesson-example', `“${section.phrase}”`));
      card.append(element('p', '', item.explanation));
      grid.append(card);
    });
    const guidance = element('aside', 'lesson-callout');
    guidance.append(element('h3', '', 'Notice the delivery'));
    const list = element('ul');
    section.deliveryNotes.forEach((note) => list.append(element('li', '', note)));
    guidance.append(list);
    const practice = element('p', 'lesson-note', section.practice);
    const wrapper = element('div', 'lesson-stack');
    wrapper.append(grid, guidance, practice);
    return wrapper;
  };

  const renderDialogue = (section) => {
    const transcript = element('div', 'dialogue-transcript');
    section.turns.forEach((turn) => {
      const row = element('div', 'dialogue-turn');
      row.append(element('strong', '', turn.speaker), element('p', '', turn.line));
      transcript.append(row);
    });
    const wrapper = element('div', 'lesson-stack');
    wrapper.append(transcript);
    if (section.questions && section.questions.length) {
      wrapper.append(element('h3', 'subsection-title', 'Comprehension questions'));
      const questionList = element('div', 'lesson-stack');
      section.questions.forEach((item, index) => {
        questionList.append(renderRevealCard(`Question ${index + 1}`, item.question, item.answer, 'Show Answer'));
      });
      wrapper.append(questionList);
    }
    return wrapper;
  };

  const renderRevealCard = (label, prompt, answer, buttonText = 'Show Sample Answer') => {
    const card = element('article', 'lesson-content-card prompt-card');
    card.append(element('p', 'prompt-label', label), element('h3', '', prompt));
    const button = element('button', 'button button-primary answer-toggle', buttonText);
    button.type = 'button';
    button.setAttribute('aria-expanded', 'false');
    const answerPanel = element('div', 'sample-answer');
    answerPanel.hidden = true;
    answerPanel.append(element('p', '', answer));
    button.addEventListener('click', () => {
      const opening = answerPanel.hidden;
      answerPanel.hidden = !opening;
      button.textContent = opening ? 'Hide Sample Answer' : buttonText;
      button.setAttribute('aria-expanded', String(opening));
    });
    card.append(button, answerPanel);
    return card;
  };

  const renderMultipleChoice = (section) => {
    const list = element('div', 'lesson-stack');
    section.items.forEach((item, questionIndex) => {
      const card = makeCard('lesson-content-card quiz-card', `Question ${questionIndex + 1}`, item.question);
      if (item.context) card.append(element('p', 'lesson-note', item.context));
      const options = element('div', 'quiz-options');
      const feedback = element('p', 'quiz-feedback');
      feedback.setAttribute('aria-live', 'polite');
      item.options.forEach((option, optionIndex) => {
        const button = element('button', 'quiz-option', option.text);
        button.type = 'button';
        button.addEventListener('click', () => {
          const correct = optionIndex === item.correctIndex;
          options.querySelectorAll('button').forEach((choice, index) => {
            choice.disabled = true;
            if (index === item.correctIndex) choice.classList.add('correct');
            else if (index === optionIndex) choice.classList.add('incorrect');
          });
          feedback.textContent = `${correct ? 'Correct. ' : 'Not quite. '}${option.feedback}`;
          feedback.classList.toggle('success', correct);
          feedback.classList.toggle('error', !correct);
        });
        options.append(button);
      });
      card.append(options, feedback);
      list.append(card);
    });
    return list;
  };

  const normalizeAnswer = (value) => value.toLocaleLowerCase().trim().replace(/[.!?,;:'"“”‘’]/g, '').replace(/\s+/g, ' ');

  const renderFillBlank = (section) => {
    const list = element('div', 'lesson-stack');
    section.items.forEach((item, index) => {
      const card = makeCard('lesson-content-card fill-card', `Exercise ${index + 1}`);
      const sentence = element('p', 'fill-sentence');
      const parts = item.sentence.split('___');
      sentence.append(document.createTextNode(parts[0]));
      const input = element('input', 'fill-input');
      input.type = 'text';
      input.autocomplete = 'off';
      input.setAttribute('aria-label', `Answer for exercise ${index + 1}`);
      sentence.append(input, document.createTextNode(parts.slice(1).join('___')));
      const check = element('button', 'button button-primary');
      check.type = 'button';
      check.textContent = 'Check Answer';
      const feedback = element('p', 'quiz-feedback');
      feedback.setAttribute('aria-live', 'polite');
      const validate = () => {
        const answer = normalizeAnswer(input.value);
        if (!answer) {
          feedback.textContent = 'Enter an answer before checking.';
          feedback.className = 'quiz-feedback error';
          return;
        }
        const correct = item.answers.some((expected) => normalizeAnswer(expected) === answer);
        feedback.textContent = correct
          ? `Correct. ${item.explanation}`
          : `Not quite. A suitable answer is “${item.answers[0]}”. ${item.explanation}`;
        feedback.className = `quiz-feedback ${correct ? 'success' : 'error'}`;
      };
      check.addEventListener('click', validate);
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') validate();
      });
      card.append(sentence, check, feedback);
      list.append(card);
    });
    return list;
  };

  const renderSpeaking = (section) => {
    const list = element('div', 'lesson-stack');
    section.items.forEach((item, index) => {
      const card = renderRevealCard(`Speaking question ${index + 1}`, item.question, item.sampleAnswer);
      if (item.followUp) card.append(element('p', 'lesson-note', `Follow-up: ${item.followUp}`));
      list.append(card);
    });
    return list;
  };

  const renderReview = (section) => {
    const list = element('div', 'lesson-stack');
    section.items.forEach((item, index) => {
      list.append(renderRevealCard(`Review ${index + 1}`, item.question, item.answer, 'Show Answer'));
    });
    return list;
  };

  const sectionRenderers = {
    vocabulary: renderVocabulary,
    expressions: renderExpressions,
    tone: renderTone,
    dialogue: renderDialogue,
    multipleChoice: renderMultipleChoice,
    fillBlank: renderFillBlank,
    speaking: renderSpeaking,
    review: renderReview
  };

  const renderSection = (data, index) => {
    const section = element('section', 'section-block lesson-section');
    section.id = data.id;
    section.setAttribute('aria-labelledby', `${data.id}-title`);
    const heading = element('div', 'section-heading');
    heading.append(element('p', 'kicker', `${String(index + 2).padStart(2, '0')} · ${data.label}`));
    heading.append(element('h2', '', data.title));
    heading.querySelector('h2').id = `${data.id}-title`;
    if (data.description) heading.append(element('p', '', data.description));
    section.append(heading);
    section.append(sectionRenderers[data.type](data));
    return section;
  };

  const renderLesson = (data) => {
    if (!data || !data.title || !data.introduction || !Array.isArray(data.sections)) {
      throw new Error('Lesson data is missing its title, introduction, or sections.');
    }
    const hero = element('section', 'hero');
    hero.setAttribute('aria-labelledby', 'lesson-title');
    const heroInner = element('div', 'hero-inner');
    heroInner.append(element('div', 'eyebrow', `${data.category} · ${data.duration}`));
    const title = element('h1');
    title.id = 'lesson-title';
    title.textContent = data.title;
    heroInner.append(title, element('p', 'hero-lede', data.summary));
    hero.append(heroInner);

    const layout = element('div', 'lesson-layout');
    const nav = element('nav', 'lesson-nav');
    nav.setAttribute('aria-label', 'Lesson sections');
    nav.append(element('p', 'nav-label', 'In this lesson'));
    const content = element('article', 'lesson-content');
    const sections = [renderIntro(data)];
    data.sections.forEach((section, index) => {
      if (!sectionRenderers[section.type]) throw new Error(`Unsupported lesson section type: ${section.type}`);
      sections.push(renderSection(section, index));
    });
    sections.forEach((section, index) => {
      const link = element('a');
      link.href = `#${section.id}`;
      link.append(document.createTextNode(`${String(index + 1).padStart(2, '0')} `), element('span', '', index === 0 ? 'Introduction' : data.sections[index - 1].label));
      nav.append(link);
      content.append(section);
    });
    layout.append(nav, content);
    lessonRoot.replaceChildren(hero, layout);
    document.title = `${data.title} | TeeTalkEnglish`;
    document.querySelector('meta[name="description"]').content = data.summary;
  };

  if (!topic || !/^[a-z0-9-]+$/.test(topic)) {
    lessonRoot.replaceChildren(element('p', 'lesson-error', 'Choose a lesson from the Common Conversations page.'));
  } else {
    fetch(`data/${encodeURIComponent(topic)}.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`Lesson file returned ${response.status}.`);
        return response.json();
      })
      .then(renderLesson)
      .catch((error) => {
        console.error('Unable to load lesson:', error);
        lessonRoot.replaceChildren(element('p', 'lesson-error', 'This lesson could not be loaded. Please return to Common Conversations and try again.'));
      });
  }
})();
