# События

| Событие | Где отправляется | Параметры |
|---|---|---|
| page_view,scroll,click,file_download,form_start,form_submit | авто (Enhanced measurement) | — |
| generate_lead | js/form.js, после ok:true | lead_service=haircut, lead_master_level=top, lead_source=instagram |
| cta_click | analytics.js (data-event) | button_name=hero_trial, page_section=hero |
| service_view | analytics.js | service_name=combo |
| master_view | analytics.js; form.js (фильтр) | master_level=top, master_id=m3 |
| works_filter | form.js | haircut_type=fade |
| face_quiz_complete | form.js | face_shape=oval |
| slot_select | form.js | slot_date=2026-11-02, slot_time=18:00, weekday=пн |
| gift_card_click | analytics.js | gift_amount=3000 |
| contact_click | analytics.js | contact_type=phone |
| messenger_click | analytics.js | messenger=telegram |
| social_click | analytics.js | network=vk, page_section=footer |
| form_error | form.js | field_name=phone, error_type=validation |
| promo_copy | analytics.js | promo_code=FIRST20 |
| map_open | analytics.js | map_service=yandex |

Строки файлов уточнить после правок.
