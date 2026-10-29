var SHEET_ID='PASTE_SPREADSHEET_ID';
var HEAD=['request_id','created_at','name','phone','email','service','master_level','slot','utm_source','utm_medium','utm_campaign','utm_content','status'];
var SERV=['haircut','beard','combo','kids','father_son','gift_card'],LVL=['any','barber','top','brand'];
function out(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
function doPost(e){
  var d;try{d=JSON.parse(e.postData.contents);}catch(x){return out({ok:false,error:'bad_json'});}
  var req=['request_id','name','phone','service','master_level','slot','utm_source','utm_medium','utm_campaign','utm_content'];
  for(var i=0;i<req.length;i++){if(!d[req[i]])return out({ok:false,error:'missing_'+req[i]});}
  for(var k in d){if(String(d[k]).length>200)return out({ok:false,error:'too_long_'+k});}
  if(d.name.length<2||d.name.length>60)return out({ok:false,error:'bad_name'});
  if(!/^\+7\d{10}$/.test(d.phone))return out({ok:false,error:'bad_phone'});
  if(d.email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email))return out({ok:false,error:'bad_email'});
  if(SERV.indexOf(d.service)<0||LVL.indexOf(d.master_level)<0)return out({ok:false,error:'bad_list'});
  if(new Date(d.slot)<new Date())return out({ok:false,error:'slot_in_past'});
  var lock=LockService.getScriptLock();lock.waitLock(10000);
  try{var sh=SpreadsheetApp.openById(SHEET_ID).getSheetByName('leads');
    var ids=sh.getRange(2,1,Math.max(sh.getLastRow()-1,1),1).getValues().flat();
    if(ids.indexOf(d.request_id)>-1)return out({ok:false,error:'duplicate'});
    sh.appendRow([d.request_id,new Date(),d.name,"'"+d.phone,d.email||'',d.service,d.master_level,d.slot,d.utm_source,d.utm_medium,d.utm_campaign,d.utm_content,'new']);
    return out({ok:true});
  }finally{lock.releaseLock();}
}
function setupSheet(){var sh=SpreadsheetApp.openById(SHEET_ID).getSheetByName('leads');sh.getRange(1,1,1,HEAD.length).setValues([HEAD]);
  sh.getRange('M2:M').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['new','confirmed','reminded','visited','no_show'],true).setAllowInvalid(false).build());}