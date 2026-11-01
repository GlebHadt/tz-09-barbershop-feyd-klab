/* thanks.js — страница thanks.html: номер записи, дата и время, файл .ics для календаря. */

(function () {
  var ADDRESS = '614 111, г. Новоозёрск, ул. Кузнечная, д. 5';
  var SERVICE_RU = { haircut: 'Стрижка', beard: 'Моделирование бороды', combo: 'Стрижка + борода',
                     kids: 'Детская стрижка', father_son: '«Отец + сын»', gift_card: 'Подарочный сертификат' };
  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа',
                'сентября', 'октября', 'ноября', 'декабря'];

  var booking = null;
  try { booking = JSON.parse(sessionStorage.getItem('fc_booking')); } catch (e) {}

  var idBox = document.querySelector('[data-booking-id]');
  var slotBox = document.querySelector('[data-booking-slot]');
  var icsBtn = document.querySelector('[data-ics]');

  if (!booking) {                                   // зашли на страницу напрямую, без записи
    idBox.textContent = 'нет данных';
    slotBox.textContent = 'запишитесь на странице «Контакты»';
    icsBtn.hidden = true;
    return;
  }

  // slot хранится как "2026-11-02 18:00" — разбираем на части.
  var p = booking.slot.split(/[- :]/).map(Number); // [2026, 11, 2, 18, 0]
  var start = new Date(p[0], p[1] - 1, p[2], p[3], p[4]);
  var minutes = booking.service === 'combo' ? 90 : 60;       // «стрижка + борода» — 90 минут
  var end = new Date(start.getTime() + minutes * 60000);

  idBox.textContent = booking.id;
  slotBox.textContent = start.getDate() + ' ' + MONTHS[start.getMonth()] + ' ' + start.getFullYear() + ', ' + booking.slot.slice(11);

  // Формат даты для .ics: 20261102T180000 (местное время).
  function icsDate(d) {
    function pad(n) { return n < 10 ? '0' + n : String(n); }
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00';
  }

  icsBtn.addEventListener('click', function () {
    var lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Fade Club//Booking//RU', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:' + booking.id + '@fadeclub',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z', // момент создания, UTC
      'DTSTART;TZID=Europe/Moscow:' + icsDate(start),
      'DTEND;TZID=Europe/Moscow:' + icsDate(end),
      'SUMMARY:Фейд Клаб — ' + (SERVICE_RU[booking.service] || 'запись'),
      'DESCRIPTION:Номер записи ' + booking.id + '. Телефон: +7 (900) 909-09-90',
      'LOCATION:' + ADDRESS.replace(/,/g, '\\,'),
      'END:VEVENT', 'END:VCALENDAR'
    ];
    var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    var link = document.createElement('a');          // временная ссылка для скачивания
    link.href = URL.createObjectURL(blob);
    link.download = 'fade-club-zapis.ics';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  });
})();
