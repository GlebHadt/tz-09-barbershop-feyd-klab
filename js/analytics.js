/* analytics.js — ВСЕ вызовы gtag('event', ...) сайта находятся только здесь (ТЗ, п. 4.3).
   Тег Google (gtag.js) подключён в <head> каждой страницы, здесь — только события.

   Как это работает:
   1) В разметке у кнопки или ссылки пишем атрибуты, например:
        data-event="cta_click" data-button-name="hero_first_visit" data-page-section="hero"
   2) Этот файл ловит клик, находит ближайший элемент с data-event
      и отправляет событие с параметрами из остальных data-атрибутов.
   3) Для событий, которые случаются не по клику (тест, выбор слота, отправка формы),
      другие скрипты вызывают функцию window.fcTrack(...), объявленную ниже. */

(function () {
  // Безопасная отправка события: если gtag не загрузился (блокировщик рекламы), сайт не ломается.
  function track(eventName, params, onDone) {
    params = params || {};                       // если параметров нет — пустой объект
    var finished = false;                        // флаг: колбэк уже вызван?
    function done() {                            // вызывает onDone ровно один раз
      if (finished) return;
      finished = true;
      if (typeof onDone === 'function') onDone();
    }
    // Значения параметров обрезаем до 100 символов — ограничение GA4.
    Object.keys(params).forEach(function (key) {
      if (typeof params[key] === 'string') params[key] = params[key].slice(0, 100);
    });
    if (typeof window.gtag === 'function') {
      params.event_callback = done;              // GA4 вызовет done, когда событие уйдёт
      params.event_timeout = 1500;               // ...но ждать не дольше 1,5 секунды
      window.gtag('event', eventName, params);   // отправляем событие в GA4
      setTimeout(done, 1600);                    // запасной вариант, если колбэк не сработал
    } else {
      done();                                    // gtag нет — сразу продолжаем
    }
  }

  // Делаем функцию доступной другим скриптам: form.js, quiz.js, main.js.
  window.fcTrack = track;

  // Превращает "button-name" из data-атрибута в имя параметра "button_name".
  // dataset отдаёт ключи в camelCase: data-button-name -> buttonName -> button_name.
  function toSnake(camel) {
    return camel.replace(/[A-Z]/g, function (letter) { return '_' + letter.toLowerCase(); });
  }

  // Один обработчик кликов на весь документ (делегирование событий).
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-event]');   // ближайший элемент с атрибутом data-event
    if (!el) return;                             // кликнули мимо размеченных элементов
    var name = el.dataset.event;                 // имя события, например "cta_click"
    var params = {};
    Object.keys(el.dataset).forEach(function (key) {
      if (key === 'event') return;               // само имя события параметром не передаём
      params[toSnake(key)] = el.dataset[key];    // все остальные data-* становятся параметрами
    });
    if (params.gift_amount) params.gift_amount = Number(params.gift_amount); // номинал — число
    track(name, params);
  });

  // Клавиатура: карточки услуг и мастеров с tabindex="0" срабатывают по Enter.
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var el = e.target;
    if (el.matches && el.matches('li[data-event], tr[data-event]')) el.click();
  });
})();
