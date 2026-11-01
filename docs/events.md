# Таблица событий GA4 — ТЗ-09/2026

Все вызовы `gtag('event', …)` — в `js/analytics.js` (функция `track`). В разметке события задаются атрибутами `data-event` и `data-*` (параметры), события без клика вызываются через `window.fcTrack(...)`. Номера строк — на момент первой версии; при правках обновите.

| № | Событие | Тип | Когда | Где отправляется (файл: строки) | Параметры | Пример значений |
|---|---|---|---|---|---|---|
| 1 | `page_view` | авто | Открытие любой страницы | расширенная статистика GA4 (без кода) | page_location, page_title | https://…/index.html, «Фейд Клаб — барбершоп…» |
| 2 | `scroll` | авто | Прокрутка до 90 % | расширенная статистика GA4 (без кода) | percent_scrolled | 90 |
| 3 | `click` | авто | Переход на внешний сайт | расширенная статистика GA4 (без кода) | link_url, outbound | https://t.me/fade_club_barber, true |
| 4 | `file_download` | авто | Скачивание PDF | расширенная статистика GA4 (без кода) | file_name, file_extension | /files/fade-club-price.pdf, pdf |
| 5 | `form_start` | авто | Первое взаимодействие с формой | расширенная статистика GA4 (без кода) | form_id | booking-form |
| 6 | `form_submit` | авто | Отправка формы | расширенная статистика GA4 (без кода) | form_id | booking-form |
| 7 | `generate_lead` | своё, ключевое | Приёмник ответил ok: true | js/form.js: 253 | lead_service, lead_master_level, lead_source | combo, top, instagram |
| 8 | `cta_click` | своё | Клик по кнопке записи | 404.html: 47, 59; contacts.html: 47; index.html: 47, 60, 61; masters.html: 47, 63, 72, 81, 90, 99 …; privacy.html: 47; services.html: 47; style-quiz.html: 47, 83; thanks.html: 47; works.html: 47 | button_name, page_section | hero_first_visit, hero |
| 9 | `service_view` | своё | Клик по карточке/строке услуги | index.html: 70, 75, 80, 85, 90, 95; services.html: 60 | service_name | haircut |
| 10 | `master_view` | своё | Фильтр или клик по карточке мастера | index.html: 107, 116, 125, 134; masters.html: 56, 57, 66, 75, 84, 93 … | master_level, master_id | top, m3 (фильтр: master_id = filter) |
| 11 | `works_filter` | своё | Изменение фильтра работ | index.html: 149; works.html: 56 | haircut_type | fade |
| 12 | `face_quiz_complete` | своё | Завершение теста | js/quiz.js: 99 | face_shape | oval / round / square / long |
| 13 | `slot_select` | своё | Выбор слота | js/form.js: 115 | slot_date, slot_time, weekday | 2026-11-02, 18:00, monday |
| 14 | `gift_card_click` | своё | Выбор номинала сертификата | index.html: 160; services.html: 72 | gift_amount, page_section | 3000, services_gift |
| 15 | `contact_click` | своё, ключевое | Клик по телефону или e-mail | 404.html: 46, 74, 75; contacts.html: 46, 123, 124, 153, 154; index.html: 46, 174, 175; masters.html: 46, 141, 142; privacy.html: 46, 90, 91; services.html: 46, 92, 93; style-quiz.html: 46, 99, 100; thanks.html: 46, 78, 79; works.html: 46, 71, 72 | contact_type | phone / email |
| 16 | `messenger_click` | своё, ключевое | Клик по Telegram или WhatsApp | contacts.html: 126, 127 | messenger | telegram / whatsapp |
| 17 | `social_click` | своё | Иконка соцсети в подвале / на thanks.html | 404.html: 79; contacts.html: 158; index.html: 179; masters.html: 146; privacy.html: 95; services.html: 97; style-quiz.html: 104; thanks.html: 65, 83; works.html: 76 | network, page_section | instagram, footer |
| 18 | `form_error` | своё | Ошибка поля или приёмника | js/form.js: 219, 260 | field_name, error_type | phone, format · form, server |
| 19 | `promo_copy` | своё, по выбору | Копирование промокода | style-quiz.html: 78 | promo_code | FIRST20 |
| 20 | `map_open` | своё, по выбору | Клик по ссылке на карту | contacts.html: 137, 138 | map_service | yandex / 2gis |

## Пользовательские параметры (Admin → Custom definitions, Event scope)

button_name, page_section, service_name, master_level, weekday, lead_service, messenger.

## Ключевые события

generate_lead, contact_click, messenger_click.
