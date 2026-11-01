/**
 * Приёмник заявок «FadeClub — Bookings» (ТЗ-09/2026, раздел 6).
 * Веб-приложение: Развернуть → Новое развёртывание → Веб-приложение,
 *   «Запуск от имени» — Я, «Доступ» — Все. URL (…/exec) вставить в js/form.js → ENDPOINT.
 * Перед первым запуском выполнить setupSheet() — создаст заголовки, проверки и подсветку.
 */

var SPREADSHEET_ID = 'PASTE_SPREADSHEET_ID';   // id из адреса таблицы: /spreadsheets/d/<ID>/edit
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
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
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
}

function columnLetter_(n) {
  var s = '';
  while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}
