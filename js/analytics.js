(function(){
function send(n,p){if(typeof gtag==='function')gtag('event',n,p||{});}
function camel(s){return s.replace(/-([a-z])/g,function(_,c){return c.toUpperCase();});}
var MAP={cta_click:['buttonName','pageSection'],service_view:['serviceName'],master_view:['masterLevel','masterId'],works_filter:['haircutType'],gift_card_click:['giftAmount'],contact_click:['contactType'],messenger_click:['messenger'],social_click:['network','pageSection'],promo_copy:['promoCode'],map_open:['mapService'],slot_select:['slotDate','slotTime','weekday']};
function snake(s){return s.replace(/[A-Z]/g,function(c){return '_'+c.toLowerCase();});}
document.addEventListener('click',function(e){var el=e.target.closest('[data-event]');if(!el)return;var n=el.dataset.event,p={};(MAP[n]||[]).forEach(function(k){if(el.dataset[k]!==undefined)p[snake(k)]=String(el.dataset[k]).slice(0,100);});send(n,p);});
window.fcTrack=send;})();