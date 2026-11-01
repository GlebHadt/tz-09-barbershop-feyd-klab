/* quiz.js — тест «Форма лица» на style-quiz.html: 4 вопроса → форма лица → 3 стрижки и промокод. */

(function () {
  var form = document.querySelector('[data-quiz]');
  if (!form) return;

  // Каждый ответ «голосует» за одну форму лица: oval, round, square, long.
  var QUESTIONS = [
    { q: 'Сравните длину и ширину лица', a: [
      ['long', 'Длина заметно больше ширины'],
      ['oval', 'Длина чуть больше ширины'],
      ['round', 'Почти равны, черты мягкие'],
      ['square', 'Почти равны, чёткие углы']] },
    { q: 'Какой у вас подбородок?', a: [
      ['round', 'Округлый, мягкий'],
      ['square', 'Широкий, с выраженной челюстью'],
      ['long', 'Узкий, вытянутый'],
      ['oval', 'Аккуратный, чуть заострённый']] },
    { q: 'Какая часть лица самая широкая?', a: [
      ['oval', 'Скулы'],
      ['round', 'Щёки'],
      ['square', 'Линия челюсти'],
      ['long', 'Всё лицо узкое и ровное по ширине']] },
    { q: 'Чего хотите от стрижки?', a: [
      ['round', 'Визуально вытянуть лицо'],
      ['square', 'Смягчить углы'],
      ['long', 'Добавить ширины по бокам'],
      ['oval', 'Подчеркнуть пропорции']] }
  ];

  // Результат: название, пояснение и номера фото из галереи работ (img/work-NN.webp).
  var RESULTS = {
    oval:   { name: 'овальное',   text: 'Самая универсальная форма: подойдут почти любые стрижки. Подчеркните пропорции аккуратным фейдом или классикой.',
              works: [[2, 'Мид-фейд'], [14, 'Полубокс'], [19, 'Оформление бороды']] },
    round:  { name: 'круглое',    text: 'Нужен объём сверху и короткие виски — так лицо визуально вытягивается.',
              works: [[9, 'Кроп с фейдом'], [18, 'Андеркат'], [1, 'Скин-фейд']] },
    square: { name: 'квадратное', text: 'Текстура и мягкие линии сглаживают выраженную челюсть.',
              works: [[8, 'Текстурный кроп'], [13, 'Классика с пробором'], [20, 'Короткая борода']] },
    long:   { name: 'вытянутое',  text: 'Чёлка и умеренная длина по бокам уравновешивают пропорции.',
              works: [[7, 'Французский кроп'], [10, 'Кроп с чёлкой'], [15, 'Канадка']] }
  };

  var body = form.querySelector('[data-quiz-body]');
  var stepText = form.querySelector('[data-quiz-step]');
  var bar = form.querySelector('[data-quiz-bar]');
  var backBtn = form.querySelector('[data-quiz-back]');
  var nextBtn = form.querySelector('[data-quiz-next]');
  var result = document.querySelector('[data-quiz-result]');
  var current = 0;                       // номер текущего вопроса
  var answers = [];                      // выбранные формы лица по вопросам

  function render() {
    var item = QUESTIONS[current];
    stepText.textContent = 'Вопрос ' + (current + 1) + ' из ' + QUESTIONS.length;
    bar.style.width = ((current + 1) / QUESTIONS.length * 100) + '%';
    var html = '<fieldset><legend>' + item.q + '</legend>';
    item.a.forEach(function (opt, i) {
      var checked = answers[current] === opt[0] ? ' checked' : '';
      html += '<label class="option"><input type="radio" name="q' + current + '" value="' + opt[0] + '"' + checked + '> ' + opt[1] + '</label>';
    });
    body.innerHTML = html + '</fieldset>';
    backBtn.disabled = current === 0;
    nextBtn.disabled = !answers[current];
    nextBtn.textContent = current === QUESTIONS.length - 1 ? 'Узнать результат' : 'Далее';
  }

  // Выбор ответа включает кнопку «Далее».
  body.addEventListener('change', function (e) {
    answers[current] = e.target.value;
    nextBtn.disabled = false;
  });

  backBtn.addEventListener('click', function () { current--; render(); });

  nextBtn.addEventListener('click', function () {
    if (current < QUESTIONS.length - 1) { current++; render(); return; }
    finish();
  });

  function finish() {
    // Считаем голоса; при равенстве побеждает ответ на первый вопрос.
    var score = { oval: 0, round: 0, square: 0, long: 0 };
    answers.forEach(function (shape) { score[shape]++; });
    var best = answers[0];
    Object.keys(score).forEach(function (shape) { if (score[shape] > score[best]) best = shape; });

    var r = RESULTS[best];
    result.querySelector('[data-face-name]').textContent = r.name;
    result.querySelector('[data-face-text]').textContent = r.text;
    result.querySelector('[data-reco]').innerHTML = r.works.map(function (w) {
      var n = w[0] < 10 ? '0' + w[0] : w[0];
      return '<li class="gallery__item"><figure><img src="img/work-' + n + '.webp" width="720" height="720" alt="' + w[1] +
             ' — рекомендуемая стрижка"><figcaption>' + w[1] + '</figcaption></figure></li>';
    }).join('');

    form.hidden = true;
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.fcTrack('face_quiz_complete', { face_shape: best });
  }

  // Кнопка «Скопировать» промокод. Событие promo_copy отправляет analytics.js по data-event.
  var copyBtn = document.getElementById('copy-promo');
  var copyDone = document.querySelector('[data-copy-done]');
  copyBtn.addEventListener('click', function () {
    var code = copyBtn.dataset.promoCode;            // "FIRST20" из data-promo-code
    function ok() { copyDone.textContent = 'Промокод ' + code + ' скопирован. Назовите его администратору.'; }
    if (navigator.clipboard) navigator.clipboard.writeText(code).then(ok, ok);
    else ok();
  });

  document.querySelector('[data-quiz-restart]').addEventListener('click', function () {
    answers = []; current = 0;
    result.hidden = true; form.hidden = false;
    copyDone.textContent = '';
    render();
  });

  render();
})();
