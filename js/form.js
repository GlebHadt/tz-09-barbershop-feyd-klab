/* form.js — страница contacts.html: календарь свободного времени и отправка формы записи
   в приёмник Google Apps Script (ТЗ, разделы 3.3 и 6). */

(function () {
  /* === НАСТРОЙКИ === */
  // Адрес веб-приложения Apps Script (Развернуть → Веб-приложение → URL, заканчивается на /exec).
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbwCd5c9u1UlvDHdieAXcrwijytIZp3OKdwBBFWaPLxn3PLh43UUoafIim3o2l67F13i/exec';

  var OPEN_HOUR = 10;           // первый слот 10:00
  var LAST_HOUR = 21;           // последний слот 21:00 (барбершоп работает до 22:00)
  var DAYS_AHEAD = 14;          // календарь на 14 дней вперёд

  // Занятые слоты: day — сколько дней от сегодня (0 — сегодня, 1 — завтра), time — время.
  var BUSY = [
    { day: 0, time: '19:00' }, { day: 0, time: '20:00' },
    { day: 1, time: '11:00' }, { day: 1, time: '15:00' }, { day: 1, time: '19:00' },
    { day: 2, time: '12:00' }, { day: 2, time: '13:00' }, { day: 2, time: '18:00' },
    { day: 3, time: '17:00' }, { day: 3, time: '20:00' },
    { day: 5, time: '10:00' }, { day: 5, time: '14:00' }, { day: 5, time: '18:00' },
    { day: 6, time: '12:00' }, { day: 6, time: '16:00' }, { day: 6, time: '17:00' },
    { day: 9, time: '19:00' }, { day: 12, time: '11:00' }, { day: 13, time: '18:00' }
  ];

  var WEEKDAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  var WEEKDAYS_EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа',
                'сентября', 'октября', 'ноября', 'декабря'];
  var LEVEL_RU = { any: 'Любой мастер', barber: 'Барбер', top: 'Топ-барбер', brand: 'Бренд-барбер' };
  var MASTER_NAMES = { m1: 'Глеб Орлов', m2: 'Руслан Каримов', m3: 'Илья Соколов', m4: 'Марат Ахмедов',
                       m5: 'Кирилл Власов', m6: 'Даниил Петров', m7: 'Егор Смирнов', m8: 'Тимофей Белов' };

  var form = document.querySelector('[data-booking-form]');
  if (!form) return;                                       // скрипт нужен только на contacts.html

  var daysBox = document.querySelector('[data-days]');
  var slotsBox = document.querySelector('[data-slots]');
  var pickedText = document.querySelector('[data-slot-picked]');
  var slotInput = document.getElementById('f-slot');       // скрытое поле slot
  var slotView = document.getElementById('f-slot-view');   // видимое поле «Дата и время»
  var submitBtn = form.querySelector('[data-submit]');
  var statusText = form.querySelector('[data-form-status]');

  /* ---------- Вспомогательные функции для дат ---------- */
  function pad(n) { return n < 10 ? '0' + n : String(n); }          // 9 -> "09"
  function isoDate(d) {                                              // Date -> "2026-11-02"
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }

  var today = new Date();
  today.setHours(0, 0, 0, 0);                                        // начало сегодняшнего дня
  var selectedDay = 0;                                               // выбранный день (смещение)

  function isBusy(dayOffset, time) {
    return BUSY.some(function (b) { return b.day === dayOffset && b.time === time; });
  }

  /* ---------- Кнопки дней ---------- */
  function renderDays() {
    daysBox.innerHTML = '';
    for (var i = 0; i < DAYS_AHEAD; i++) {
      var d = addDays(today, i);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'day' + (i === selectedDay ? ' is-active' : '');
      btn.dataset.offset = i;
      btn.setAttribute('aria-pressed', String(i === selectedDay));
      btn.setAttribute('aria-label', d.getDate() + ' ' + MONTHS[d.getMonth()]);
      btn.innerHTML = '<small>' + (i === 0 ? 'сегодня' : WEEKDAYS_SHORT[d.getDay()]) + '</small><b>' + d.getDate() + '</b>';
      daysBox.appendChild(btn);
    }
  }

  /* ---------- Кнопки времени ---------- */
  function renderSlots() {
    slotsBox.innerHTML = '';
    var now = new Date();
    for (var h = OPEN_HOUR; h <= LAST_HOUR; h++) {
      var time = pad(h) + ':00';
      var start = addDays(today, selectedDay);
      start.setHours(h);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot';
      btn.textContent = time;
      btn.dataset.time = time;
      // Неактивен, если слот занят или уже прошёл.
      btn.disabled = isBusy(selectedDay, time) || start <= now;
      if (btn.disabled) btn.setAttribute('aria-label', time + ' — занято');
      if (slotInput.value === isoDate(start) + ' ' + time) btn.classList.add('is-active');
      slotsBox.appendChild(btn);
    }
  }

  daysBox.addEventListener('click', function (e) {
    var btn = e.target.closest('.day');
    if (!btn) return;
    selectedDay = Number(btn.dataset.offset);
    renderDays();
    renderSlots();
  });

  slotsBox.addEventListener('click', function (e) {
    var btn = e.target.closest('.slot');
    if (!btn || btn.disabled) return;
    var d = addDays(today, selectedDay);
    var date = isoDate(d);
    var time = btn.dataset.time;
    slotInput.value = date + ' ' + time;                     // значение уходит в таблицу
    var human = d.getDate() + ' ' + MONTHS[d.getMonth()] + ', ' + WEEKDAYS_SHORT[d.getDay()] + ', ' + time;
    slotView.value = human;
    pickedText.textContent = 'Выбрано: ' + human;
    clearError('slot');
    renderSlots();
    window.fcTrack('slot_select', { slot_date: date, slot_time: time, weekday: WEEKDAYS_EN[d.getDay()] });
  });

  // Если сегодня свободных слотов уже нет (вечер), календарь сразу открывается на завтра.
  var nowCheck = new Date();
  var todayHasFree = false;
  for (var hh = OPEN_HOUR; hh <= LAST_HOUR; hh++) {
    var t = new Date(today); t.setHours(hh);
    if (t > nowCheck && !isBusy(0, pad(hh) + ':00')) todayHasFree = true;
  }
  if (!todayHasFree) selectedDay = 1;

  renderDays();
  renderSlots();

  /* ---------- Предзаполнение из ссылки (мастер, сертификат) ---------- */
  var params = new URLSearchParams(location.search);
  var levelParam = params.get('level');
  if (LEVEL_RU[levelParam]) form.master_level.value = levelParam;
  var masterId = params.get('master');
  if (MASTER_NAMES[masterId]) {
    var mp = document.querySelector('[data-master-pick]');
    mp.textContent = 'Мастер: ' + MASTER_NAMES[masterId] + ' (' + LEVEL_RU[levelParam] + ')';
    mp.hidden = false;
  }
  if (params.get('service') === 'gift_card') {
    form.service.value = 'gift_card';
    var amount = params.get('amount');
    var gp = document.querySelector('[data-gift-pick]');
    gp.textContent = 'Сертификат' + (amount ? ' на ' + Number(amount).toLocaleString('ru-RU') + ' ₽' : '') +
      '. Выберите удобное время, чтобы забрать его в барбершопе.';
    gp.hidden = false;
  }

  /* ---------- Скрытые поля: request_id и UTM ---------- */
  function makeId() {
    if (window.crypto && crypto.randomUUID) return 'REQ-' + crypto.randomUUID();
    return 'REQ-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }
  form.request_id.value = makeId();                          // один id на одну заявку

  function storedUtm(key) {
    try { return sessionStorage.getItem(key) || ''; } catch (e) { return ''; }
  }
  form.utm_source.value = storedUtm('utm_source') || 'direct';
  form.utm_medium.value = storedUtm('utm_medium') || 'none';
  form.utm_campaign.value = storedUtm('utm_campaign') || 'not_set';
  form.utm_content.value = storedUtm('utm_content') || 'not_set';

  /* ---------- Проверка полей ---------- */
  function normalizePhone(raw) {
    var digits = raw.replace(/\D/g, '');                     // оставляем только цифры
    if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) digits = digits.slice(1);
    return digits.length === 10 ? '+7' + digits : null;      // +7 и 10 цифр, иначе ошибка
  }

  function showError(field, text) {
    var box = document.getElementById('e-' + field);
    box.textContent = text;
    box.closest('.field').classList.add('is-invalid');
  }
  function clearError(field) {
    var box = document.getElementById('e-' + field);
    box.textContent = '';
    box.closest('.field').classList.remove('is-invalid');
  }

  function validate() {
    var errors = [];                                         // [{field, type, text}]
    var name = form.name.value.trim();
    if (!name) errors.push({ field: 'name', type: 'required', text: 'Введите имя' });
    else if (name.length < 2 || name.length > 60) errors.push({ field: 'name', type: 'length', text: 'Имя — от 2 до 60 символов' });

    var phoneRaw = form.phone.value.trim();
    if (!phoneRaw) errors.push({ field: 'phone', type: 'required', text: 'Введите телефон' });
    else if (!normalizePhone(phoneRaw)) errors.push({ field: 'phone', type: 'format', text: 'Телефон в формате +7 и 10 цифр' });

    var email = form.email.value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.push({ field: 'email', type: 'format', text: 'Проверьте e-mail' });

    if (!form.service.value) errors.push({ field: 'service', type: 'required', text: 'Выберите услугу' });
    if (!form.master_level.value) errors.push({ field: 'master_level', type: 'required', text: 'Выберите уровень мастера' });
    if (!slotInput.value) errors.push({ field: 'slot', type: 'required', text: 'Выберите дату и время в календаре' });
    if (!form.consent.checked) errors.push({ field: 'consent', type: 'required', text: 'Нужно согласие на обработку данных' });
    return errors;
  }

  // Ошибка исчезает, как только посетитель исправляет поле.
  ['name', 'phone', 'email', 'service', 'master_level', 'consent'].forEach(function (f) {
    form[f].addEventListener('input', function () { clearError(f); });
    form[f].addEventListener('change', function () { clearError(f); });
  });

  /* ---------- Отправка ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();                                      // без перезагрузки страницы
    statusText.textContent = '';
    statusText.classList.remove('is-error');

    var errors = validate();
    ['name', 'phone', 'email', 'service', 'master_level', 'slot', 'consent'].forEach(clearError);
    if (errors.length) {
      errors.forEach(function (err) {
        showError(err.field, err.text);
        window.fcTrack('form_error', { field_name: err.field, error_type: err.type });
      });
      var first = document.getElementById(err0Id(errors[0].field));
      if (first) first.focus();
      return;
    }

    // Данные заявки. Имя и телефон уходят только в таблицу, в GA4 — никогда.
    var data = {
      request_id: form.request_id.value,
      name: form.name.value.trim(),
      phone: normalizePhone(form.phone.value),
      email: form.email.value.trim(),
      service: form.service.value,
      master_level: form.master_level.value,
      slot: slotInput.value,
      utm_source: form.utm_source.value,
      utm_medium: form.utm_medium.value,
      utm_campaign: form.utm_campaign.value,
      utm_content: form.utm_content.value
    };

    submitBtn.disabled = true;                               // защита от двойного нажатия
    submitBtn.textContent = 'Отправляем…';

    fetch(ENDPOINT, { method: 'POST', body: new URLSearchParams(data) })
      .then(function (res) { return res.json(); })           // приёмник отвечает JSON
      .then(function (answer) {
        if (!answer.ok) throw new Error(answer.error || 'server');
        // Запоминаем запись для страницы «Спасибо» (без имени и телефона).
        try {
          sessionStorage.setItem('fc_booking', JSON.stringify({ id: data.request_id, slot: data.slot, service: data.service }));
        } catch (err) {}
        // generate_lead — только после ответа ok: true (ТЗ, п. 4.3).
        window.fcTrack('generate_lead', {
          lead_service: data.service,
          lead_master_level: data.master_level,
          lead_source: data.utm_source
        }, function () { location.href = 'thanks.html'; });
      })
      .catch(function (err) {
        window.fcTrack('form_error', { field_name: 'form', error_type: 'server' });
        statusText.textContent = 'Не удалось отправить запись. Попробуйте ещё раз или позвоните +7 (900) 909-09-90.';
        statusText.classList.add('is-error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Записаться';
      });
  });

  // id элемента, на который ставим фокус при ошибке
  function err0Id(field) {
    return { name: 'f-name', phone: 'f-phone', email: 'f-email', service: 'f-service',
             master_level: 'f-level', slot: 'f-slot-view', consent: 'f-consent' }[field];
  }
})();
