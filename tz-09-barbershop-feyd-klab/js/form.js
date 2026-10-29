(function(){
var URL_APP='PASTE_APPS_SCRIPT_WEBAPP_URL';
var ss=window.sessionStorage;
try{var q=new URLSearchParams(location.search);['utm_source','utm_medium','utm_campaign','utm_content'].forEach(function(k){if(q.get(k))ss.setItem(k,q.get(k));});}catch(e){}
function get(k,d){try{return ss.getItem(k)||d;}catch(e){return d;}}
var $=function(s){return document.querySelector(s);};
// фильтры
document.querySelectorAll('[data-filter]').forEach(function(b){b.addEventListener('click',function(){var t=b.dataset.filter;document.querySelectorAll('.work').forEach(function(w){w.hidden=t!=='all'&&w.dataset.type!==t;});window.fcTrack('works_filter',{haircut_type:t});});});
document.querySelectorAll('[data-level]').forEach(function(b){b.addEventListener('click',function(){var l=b.dataset.level;document.querySelectorAll('#mlist .master').forEach(function(c){c.hidden=l!=='all'&&c.dataset.masterLevel!==l;});window.fcTrack('master_view',{master_level:l});});});
// тест
if($('#qbox')){var Q=[['Лицо длиннее, чем шире?','oval'],['Скулы шире подбородка?','square'],['Подбородок острый?','heart'],['Лоб и подбородок одной ширины?','round']];var i=0,sc={};
function ask(){var b=$('#qbox');if(i>=Q.length){var s=Object.keys(sc).sort(function(a,c){return sc[c]-sc[a];})[0]||'oval';var R={oval:'Подойдёт почти любая стрижка: классика или фейд.',square:'Фейд или кроп подчеркнут скулы.',heart:'Классика с объёмом сверху.',round:'Андеркат или фейд с объёмом сверху.'};b.innerHTML='';$('#shape').textContent=s;$('#rec').textContent=R[s];$('#res').hidden=false;window.fcTrack('face_quiz_complete',{face_shape:s});return;}
b.innerHTML='<p>'+Q[i][0]+'</p><button class="btn" data-a="1">Да</button> <button class="btn" data-a="0">Нет</button>';b.querySelectorAll('button').forEach(function(x){x.onclick=function(){if(x.dataset.a==='1')sc[Q[i][1]]=(sc[Q[i][1]]||0)+1;i++;ask();};});}ask();
$('#copy').addEventListener('click',function(){if(navigator.clipboard)navigator.clipboard.writeText('FIRST20');});}
// запись
var form=$('#lead');
if(form){var BUSY=['2:11:00','2:15:00','3:18:00','5:12:00','6:19:00','8:10:00'];var days=$('#days'),slots=$('#slots'),sel='';
var RU=['вс','пн','вт','ср','чт','пт','сб'];
for(var d=0;d<14;d++){(function(d){var dt=new Date();dt.setDate(dt.getDate()+d);var iso=dt.toISOString().slice(0,10);var b=document.createElement('button');b.type='button';b.className='btn';b.textContent=RU[dt.getDay()]+' '+dt.getDate()+'.'+(dt.getMonth()+1);b.onclick=function(){sel=iso;days.querySelectorAll('button').forEach(function(x){x.classList.remove('on');});b.classList.add('on');draw(d,iso,RU[dt.getDay()]);};days.appendChild(b);})(d);}
function draw(d,iso,wd){slots.innerHTML='';for(var h=10;h<=21;h++){(function(h){var t=('0'+h).slice(-2)+':00';var b=document.createElement('button');b.type='button';b.className='btn';b.textContent=t;var past=d===0&&h<=new Date().getHours();b.disabled=BUSY.indexOf(d+':'+h+':00')>-1||past;b.onclick=function(){form.slot.value=iso+'T'+t;slots.querySelectorAll('button').forEach(function(x){x.classList.remove('on');});b.classList.add('on');window.fcTrack('slot_select',{slot_date:iso,slot_time:t,weekday:wd});};slots.appendChild(b);})(h);}}
var lv=new URLSearchParams(location.search).get('level');if(lv)form.master_level.value=lv;
function err(f,m){var s=form.querySelector('[data-for="'+f+'"]');if(s)s.textContent=m;var i=form.elements[f];if(i&&i.classList)i.classList.add('bad');window.fcTrack('form_error',{field_name:f,error_type:m?'validation':'server'});}
function clear(){form.querySelectorAll('.err').forEach(function(s){s.textContent='';});form.querySelectorAll('.bad').forEach(function(x){x.classList.remove('bad');});}
var started=false;form.addEventListener('focusin',function(){if(!started){started=true;window.fcTrack('form_start',{form_id:'lead_form'});}});
form.addEventListener('submit',function(e){e.preventDefault();clear();var f=form.elements,bad=false;
if(f.name.value.trim().length<2||f.name.value.trim().length>60){err('name','Введите имя от 2 до 60 символов');bad=true;}
if(!/^\+7\d{10}$/.test(f.phone.value.trim())){err('phone','Телефон в формате +7 и 10 цифр');bad=true;}
if(f.email.value&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.value)){err('email','Проверьте e-mail');bad=true;}
if(!f.slot.value){err('slot','Выберите дату и время');bad=true;}
if(!f.consent.checked){err('consent','Нужно согласие на обработку данных');bad=true;}
if(bad)return;var btn=form.querySelector('button[type=submit]');btn.disabled=true;
var rid='REQ-'+(crypto.randomUUID?crypto.randomUUID():String(Date.now()));
var data={request_id:rid,name:f.name.value.trim(),phone:f.phone.value.trim(),email:f.email.value.trim(),service:f.service.value,master_level:f.master_level.value,slot:f.slot.value,utm_source:get('utm_source','direct'),utm_medium:get('utm_medium','none'),utm_campaign:get('utm_campaign','not_set'),utm_content:get('utm_content','not_set')};
fetch(URL_APP,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(data)}).then(function(r){return r.json();}).then(function(j){
if(j.ok){window.fcTrack('generate_lead',{lead_service:data.service,lead_master_level:data.master_level,lead_source:data.utm_source});try{ss.setItem('rid',rid);ss.setItem('slot',data.slot);}catch(e){}location.href='thanks.html';}
else{err('phone','');window.fcTrack('form_error',{field_name:'form',error_type:'server'});alert(j.error||'Ошибка');btn.disabled=false;}}).catch(function(){window.fcTrack('form_error',{field_name:'form',error_type:'server'});alert('Не удалось отправить. Попробуйте позже.');btn.disabled=false;});});}
// thanks
if($('#rid')){$('#rid').textContent=get('rid','—');var sl=get('slot','');$('#when').textContent=sl.replace('T',' ');
$('#ics').addEventListener('click',function(){if(!sl)return;var s=sl.replace(/[-:]/g,'')+'00';var h=parseInt(sl.slice(11,13),10)+1;var e=sl.slice(0,10).replace(/-/g,'')+'T'+('0'+h).slice(-2)+'0000';var t='BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:'+get('rid','x')+'@fadeclub\r\nDTSTART:'+s+'\r\nDTEND:'+e+'\r\nSUMMARY:Запись в Фейд Клаб\r\nLOCATION:г. Новоозёрск, ул. Кузнечная, д. 5\r\nEND:VEVENT\r\nEND:VCALENDAR';var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/calendar'}));a.download='fadeclub.ics';a.click();});}
})();