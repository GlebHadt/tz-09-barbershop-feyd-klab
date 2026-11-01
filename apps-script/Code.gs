/**
 * Приёмник заявок «FadeClub — Bookings» (ТЗ-09/2026, раздел 6).
 * Веб-приложение: Развернуть → Новое развёртывание → Веб-приложение,
 *   «Запуск от имени» — Я, «Доступ» — Все. URL (…/exec) вставить в js/form.js → ENDPOINT.
 * Перед первым запуском выполнить setupSheet() — создаст заголовки, проверки и подсветку.
 */

var SPREADSHEET_ID = '192vY4NM72ONFR1dw1VVXOqktPy1bSgq6Hi04JPIQhh4';   // id из адреса таблицы: /spreadsheets/d/<ID>/edit
var SHEET_NAME = 'leads';

var HEADERS = ['request_id', 'created_at', 'name', 'phone', 'email', 'service', 'master_level',
               'slot', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'status'];
var SERVICES = ['haircut', 'beard', 'combo', 'kids', 'father_son', 'gift_card'];
var LEVELS = ['any', 'barber', 'top', 'brand'];
var STATUSES = ['new', 'confirmed', 'reminded', 'visited', 'no_show'];
var MAX_LEN = 200;

/** Принимает POST из формы сайта. */
function doPost(e) {
  var lock = LockService.getScriptLock();       // одновременные заявки пишутся по очереди
  try {
    lock.waitLock(10000);
    var p = (e && e.parameter) || {};
    var data = {};
    HEADERS.forEach(function (h) { data[h] = String(p[h] || '').trim(); });

    // Метки: пусто → значения по умолчанию (ТЗ, таблица 6.1).
    data.utm_source = data.utm_source || 'direct';
    data.utm_medium = data.utm_medium || 'none';
    data.utm_campaign = data.utm_campaign || 'not_set';
    data.utm_content = data.utm_content || 'not_set';

    var error = validate_(data);
    if (error) return json_({ ok: false, error: error });

    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

    // Повтор: строка с таким request_id уже есть — вторую не создаём.
    var found = sheet.getRange('A:A').createTextFinder(data.request_id).matchEntireCell(true).findNext();
    if (found) return json_({ ok: false, error: 'duplicate_request_id' });

    data.created_at = new Date();                 // ставит приёмник
    data.status = 'new';                          // status из браузера игнорируется
    var slotDate = parseSlot_(data.slot);

    sheet.appendRow(HEADERS.map(function (h) {
      if (h === 'slot') return slotDate;
      if (h === 'phone') return "'" + data.phone;  // чтобы «+7…» осталось текстом
      return data[h];
    }));
    return json_({ ok: true, request_id: data.request_id });
  } catch (err) {
    return json_({ ok: false, error: 'server_error' });
  } finally {
    lock.releaseLock();
  }
}

/** Проверки на стороне сервера. Возвращает текст ошибки или пустую строку. */
function validate_(d) {
  var required = ['request_id', 'name', 'phone', 'service', 'master_level', 'slot'];
  for (var i = 0; i < required.length; i++) {
    if (!d[required[i]]) return 'required:' + required[i];
  }
  for (var key in d) {
    if (d[key].length > MAX_LEN) return 'too_long:' + key;
  }
  if (!/^REQ-[A-Za-z0-9-]{8,}$/.test(d.request_id)) return 'format:request_id';
  if (d.name.length < 2 || d.name.length > 60) return 'length:name';
  if (!/^\+7\d{10}$/.test(d.phone)) return 'format:phone';
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return 'format:email';
  if (SERVICES.indexOf(d.service) === -1) return 'list:service';
  if (LEVELS.indexOf(d.master_level) === -1) return 'list:master_level';
  var slot = parseSlot_(d.slot);
  if (!slot) return 'format:slot';
  if (slot.getTime() < Date.now()) return 'past:slot';
  return '';
}

/** "2026-11-02 18:00" → Date (часовой пояс проекта: Europe/Moscow). */
function parseSlot_(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(s);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Проверка, что веб-приложение живо: открыть URL …/exec в браузере. */
function doGet() {
  return json_({ ok: true, service: 'FadeClub bookings receiver' });
}

/** Однократная настройка листа: заголовки, выпадающие списки, условное форматирование. */
function setupSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ss.setSpreadsheetTimeZone('Europe/Moscow');
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    // В новой таблице первый лист пустой — переименовываем его в leads.
    var first = ss.getSheets()[0];
    sheet = first.getLastRow() === 0 ? first.setName(SHEET_NAME) : ss.insertSheet(SHEET_NAME);
  }
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  sheet.setFrozenRows(1);

  var rows = sheet.getMaxRows() - 1;
  function col(name) { return HEADERS.indexOf(name) + 1; }
  function listRule(values) {
    return SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build();
  }
  sheet.getRange(2, col('status'), rows).setDataValidation(listRule(STATUSES));
  sheet.getRange(2, col('service'), rows).setDataValidation(listRule(SERVICES));
  sheet.getRange(2, col('master_level'), rows).setDataValidation(listRule(LEVELS));
  sheet.getRange(2, col('created_at'), rows).setNumberFormat('dd.MM.yyyy HH:mm:ss');
  sheet.getRange(2, col('slot'), rows).setNumberFormat('dd.MM.yyyy HH:mm');

  // Подсветка: пустые обязательные ячейки (в заполненных строках) и повторяющиеся request_id.
  var required = ['request_id', 'created_at', 'name', 'phone', 'service', 'master_level', 'slot',
                  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'status'];
  var rules = [];
  required.forEach(function (name) {
    var letter = columnLetter_(col(name));
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND(COUNTA($A2:$M2)>0,ISBLANK(' + letter + '2))')
      .setBackground('#f8d7da')
      .setRanges([sheet.getRange(2, col(name), rows)])
      .build());
  });
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND($A2<>"",COUNTIF($A:$A,$A2)>1)')
    .setBackground('#ffe08a')
    .setRanges([sheet.getRange(2, 1, rows)])
    .build());
  sheet.setConditionalFormatRules(rules);
  setupUtmSheet_(ss);
}

/** Лист utm — реестр ссылок (ТЗ, п. 5.2–5.3). Полная ссылка собирается формулой из столбцов меток. */
var SITE_URL = 'https://tz-09-barbershop-feyd-klab.vercel.app/';
var UTM_HEADERS = ['number', 'channel', 'placement', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
                   'page', 'full_url', 'short_url', 'post_url', 'published_at'];
var UTM_ROWS = [
  ['U-01', 'Instagram', 'ссылка в шапке профиля', 'instagram', 'social', 'first_visit_nov_2026', 'bio', 'index.html'],
  ['U-02', 'Instagram', 'автоответ под Reel (ManyChat)', 'instagram', 'social', 'first_visit_nov_2026', 'reel_fade_01', 'style-quiz.html'],
  ['U-03', 'Instagram', 'автоответ, ветка «ПОДАРОК»', 'instagram', 'social', 'gift_dec_2026', 'reel_fade_01_gift', 'services.html#gift'],
  ['U-04', 'Instagram', 'ссылка-стикер в Stories', 'instagram', 'social', 'first_visit_nov_2026', 'stories_01', 'contacts.html'],
  ['U-05', 'ВКонтакте', 'пост в сообществе', 'vk', 'social', 'first_visit_nov_2026', 'post_01', 'works.html'],
  ['U-06', 'ВКонтакте', 'кнопка действия «Записаться»', 'vk', 'social', 'first_visit_nov_2026', 'group_button', 'contacts.html'],
  ['U-07', 'Telegram', 'пост в канале', 'telegram', 'social', 'first_visit_nov_2026', 'post_01', 'index.html'],
  ['U-08', 'Telegram', 'пост о сертификатах', 'telegram', 'social', 'gift_dec_2026', 'post_02', 'services.html#gift'],
  ['U-09', 'YouTube', 'описание Shorts «Фейд за 40 минут»', 'youtube', 'social', 'first_visit_nov_2026', 'shorts_01', 'masters.html'],
  ['U-10', 'Блогер 1', 'ссылка у партнёра', 'blogger_nick_1', 'affiliate', 'first_visit_nov_2026', 'stories_01', 'index.html'],
  ['U-11', 'Блогер 2', 'ссылка у партнёра', 'blogger_nick_2', 'affiliate', 'first_visit_nov_2026', 'post_01', 'style-quiz.html'],
  ['U-12', 'Визитки', 'QR-код на визитке мастера', 'card_qr', 'qr', 'repeat_visit_2026', 'master_card', 'contacts.html']
];

function setupUtmSheet_(ss) {
  var sheet = ss.getSheetByName('utm') || ss.insertSheet('utm');
  sheet.getRange(1, 1, 1, UTM_HEADERS.length).setValues([UTM_HEADERS]).setFontWeight('bold');
  sheet.setFrozenRows(1);
  if (sheet.getLastRow() > 1) return;               // реестр уже заполнен — не трогаем
  sheet.getRange(2, 1, UTM_ROWS.length, 8).setValues(UTM_ROWS);
  var formulas = UTM_ROWS.map(function (r, i) {
    var n = i + 2;
    // страница без якоря + метки + якорь (#gift) в конце, если он есть
    return ['=CONCATENATE("' + SITE_URL + '", REGEXEXTRACT(H' + n + ', "^[^#]*"), "?utm_source=", D' + n +
            ', "&utm_medium=", E' + n + ', "&utm_campaign=", F' + n + ', "&utm_content=", G' + n +
            ', IFERROR(REGEXEXTRACT(H' + n + ', "#.*"), ""))'];
  });
  sheet.getRange(2, 9, formulas.length, 1).setFormulas(formulas);
  sheet.autoResizeColumns(1, 8);
}

function columnLetter_(n) {
  var s = '';
  while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}
