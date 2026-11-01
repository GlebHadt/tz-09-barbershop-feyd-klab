# Фейд Клаб — сайт барбершопа (ТЗ-09/2026)

Практическая работа по ОП.03 «Информационные технологии». Исполнитель: ___ (фамилия, имя, группа).

| Что | Ссылка |
|---|---|
| Сайт на Vercel | https://tz-09-barbershop-feyd-klab.vercel.app |
| Таблица заявок «FadeClub — Bookings» | ___ |
| Дашборд DataLens «ФЕЙД КЛАБ — first_visit_nov_2026» | ___ |
| Instagram (публикации, Reel с автоответами) | ___ |
| ВКонтакте | ___ |
| Telegram | ___ |
| YouTube | ___ |

**Идентификатор ресурса GA4:** G-H77TTNTSYH
**Доступ Viewer к ресурсу GA4 выдан:** ___ (e-mail Заказчика)

---

## Структура

```
index.html services.html masters.html works.html style-quiz.html
contacts.html thanks.html privacy.html 404.html
css/style.css
js/analytics.js  — все события GA4 (gtag('event', …) только здесь)
js/main.js       — меню, сохранение UTM в sessionStorage, фильтры работ и мастеров
js/form.js       — календарь слотов и отправка формы в Apps Script
js/quiz.js       — тест «Форма лица»
js/thanks.js     — номер записи и файл .ics
img/  files/fade-club-price.pdf
apps-script/Code.gs — приёмник заявок (doPost) + setupSheet()
docs/ prompts.md events.md utm.csv images.md report.md afisha.pdf qr-u-12.png
screens/ ga4/ utm/ instagram/ reports/ explore/ datalens/ lighthouse/
```

## Запуск и настройка

1. **GA4.** Создать ресурс «ФЕЙД КЛАБ — сайт» (Москва, рубль), веб-поток с адресом Vercel, включить Enhanced measurement с формами. Заменить `G-H77TTNTSYH` во всех HTML-файлах на свой идентификатор (поиск и замена по папке).
2. **Таблица.** Создать Google Таблицу «FadeClub — Bookings» с листом `leads`. Расширения → Apps Script → вставить `apps-script/Code.gs`, в `SPREADSHEET_ID` указать id таблицы, выполнить `setupSheet()`.
3. **Приёмник.** Развернуть → Новое развёртывание → Веб-приложение (запуск от моего имени, доступ — все). Скопировать URL `…/exec` в `js/form.js` → `ENDPOINT`.
4. **Vercel.** Импортировать репозиторий, Framework — Other, без команды сборки. Если адрес отличается от `tz-09-barbershop-feyd-klab.vercel.app`, заменить его в `<link rel="canonical">`/`og:*` и в `docs/utm.csv`, перегенерировать QR.
5. **Реестр UTM.** Лист `utm`: полная ссылка собирается формулой, например
   `=СЦЕПИТЬ("https://tz-09-barbershop-feyd-klab.vercel.app/";I2;"?utm_source=";D2;"&utm_medium=";E2;"&utm_campaign=";F2;"&utm_content=";G2)`
   (для страниц с `#gift` якорь ставится после меток). В строках U-10 и U-11 заменить `blogger_nick_1/2` на ники одногруппников.
6. Для DebugView включайте расширение Google Analytics Debugger или временно добавляйте `{ debug_mode: true }` в `gtag('config', …)`. Перед сдачей параметр удалить целиком: GA4 включает отладку при любом его значении, даже `false`.

Не получилось: ___

Нейросеть использовалась для: ___
