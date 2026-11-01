/* main.js — общий код для всех страниц: меню, сохранение UTM-меток, фильтры работ и мастеров. */

(function () {
  /* ---------- 1. Мобильное меню ---------- */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');            // показать/скрыть меню
      burger.setAttribute('aria-expanded', String(open));    // для экранных дикторов
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    });
  }

  /* ---------- 2. UTM-метки ----------
     Метки читаются из адреса страницы и сохраняются в sessionStorage, чтобы не потеряться,
     пока посетитель ходит по сайту до формы записи (ТЗ, п. 6.3). */
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  try {
    var query = new URLSearchParams(location.search);       // разбираем ?utm_source=...&...
    if (query.get('utm_source')) {                          // пришли по размеченной ссылке
      UTM_KEYS.forEach(function (key) {
        sessionStorage.setItem(key, (query.get(key) || '').slice(0, 200));
      });
    }
  } catch (err) { /* sessionStorage может быть запрещён — тогда метки просто не сохраняются */ }

  /* ---------- 3. Фильтр работ (index.html, works.html) ---------- */
  var HINTS = {
    all: 'Все работы: фейд, кроп, классика и борода.',
    fade: 'Фейд — плавный переход от коротких висков к длине на макушке.',
    crop: 'Кроп — короткая текстурная стрижка с чёлкой вперёд.',
    classic: 'Классика — аккуратная форма с пробором или зачёсом.',
    beard: 'Борода — форма, контур и тонирование бороды.'
  };
  document.querySelectorAll('[data-filter]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.dataset.filter;                          // выбранная категория
      var section = btn.closest('section');                  // фильтруем только свою секцию
      section.querySelectorAll('[data-filter]').forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      section.querySelectorAll('.gallery__item').forEach(function (item) {
        item.hidden = !(cat === 'all' || item.dataset.cat === cat); // прячем лишние фото
      });
      var hint = section.querySelector('[data-filter-hint]');
      if (hint) hint.textContent = HINTS[cat];
      // Событие works_filter отправляет analytics.js по атрибуту data-event на кнопке.
    });
  });

  /* ---------- 4. Фильтр мастеров по уровню (masters.html) ---------- */
  document.querySelectorAll('[data-level-filter]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var level = btn.dataset.levelFilter;
      document.querySelectorAll('[data-level-filter]').forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      document.querySelectorAll('[data-masters] .master').forEach(function (card) {
        card.hidden = !(level === 'all' || card.dataset.level === level);
      });
    });
  });
})();
