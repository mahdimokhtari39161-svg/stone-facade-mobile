(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const defaultMaterials=[
{id:'abbasabad',name:'عباس‌آباد کرم',file:'abbasabad.webp',color:'#d9c5a1'},
{id:'travertine-cream',name:'تراورتن کرم',file:'travertine-cream.webp',color:'#d8c7a4'},
{id:'silver-travertine',name:'تراورتن سیلور',file:'silver-travertine.webp',color:'#9a9b98'},
{id:'noce',name:'تراورتن شکلاتی',file:'noce.webp',color:'#80604c'},
{id:'red-travertine',name:'تراورتن قرمز',file:'red-travertine.webp',color:'#a95e4b'},
{id:'white-marble',name:'مرمریت سفید',file:'white-marble.webp',color:'#e7e5df'},
{id:'black-gold',name:'مشکی طلایی',file:'black-gold.webp',color:'#242326'},
{id:'green-marble',name:'مرمریت سبز',file:'green-marble.webp',color:'#315e4e'},
{id:'honey-onyx',name:'اونیکس عسلی',file:'honey-onyx.webp',color:'#d9aa4b'},
{id:'beige-limestone',name:'لایمستون بژ',file:'beige-limestone.webp',color:'#d6c9a7'},
{id:'gray-granite',name:'گرانیت طوسی',file:'gray-granite.webp',color:'#777a7d'},
{id:'charcoal-basalt',name:'بازالت زغالی',file:'charcoal-basalt.webp',color:'#333638'}];
const zoneNames={'front-left':'نمای جلو · چپ','front-center':'نمای جلو · وسط','front-right':'نمای جلو · راست','right-side':'نمای جانبی راست','left-side':'نمای جانبی چپ'};
const defaults={assignments:{'front-left':'abbasabad','front-center':'abbasabad','front-right':'abbasabad','right-side':'silver-travertine','left-side':'silver-travertine'},selectedZone:'front-center',viewSide:'right',zoom:1,light:'day',customMaterials:[],saved:[],customer:'',project:'',width:24,height:12,depth:10,openings:15,price:1500000,waste:10};
const storedState=loadState();
let state={...defaults,...storedState,assignments:{...defaults.assignments,...(storedState.assignments||{})}};
let materials=[...defaultMaterials,...(state.customMaterials||[])]; let imageCache={}; let currentEstimate=null; let toastTimer; let canvas=$('#facadeCanvas'),ctx=canvas.getContext('2d');
function loadState(){try{return JSON.parse(localStorage.getItem('sfs_mobile_state')||'{}')}catch(e){return {}}}
function persist(){state.customMaterials=materials.filter(m=>m.custom);localStorage.setItem('sfs_mobile_state',JSON.stringify(state));}
function toast(s){let t=$('#toast');t.textContent=s;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2300)}
function mat(id){return materials.find(m=>m.id===id)||materials[0]}
function imgFor(m){if(imageCache[m.id])return imageCache[m.id];let im=new Image();im.src=m.data||('./assets/stones/'+m.file);im.onload=()=>draw();imageCache[m.id]=im;return im}
function drawTo(c, miniature=false){let cctx=c.getContext('2d'),dpr=window.devicePixelRatio||1,w=c.clientWidth||430,h=c.clientHeight||310;if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr)}cctx.setTransform(dpr,0,0,dpr,0,0);cctx.clearRect(0,0,w,h);
 const baseW=430,baseH=350,scale=Math.min(w/baseW,h/baseH)*state.zoom,ox=(w-baseW*scale)/2,oy=(h-baseH*scale)/2;cctx.translate(ox,oy);cctx.scale(scale,scale);
 let isLeft=state.viewSide==='left';let sx=68, sy=-40;let frontL={x:75,y:300},frontR={x:335,y:300},topL={x:75,y:65},topR={x:335,y:65};let backDx=sx,backDy=sy;cctx.save();if(isLeft){cctx.translate(430,0);cctx.scale(-1,1)}
 let sideBL={x:frontR.x+backDx,y:frontR.y+backDy},sideTL={x:topR.x+backDx,y:topR.y+backDy};
 const floorH=(300-65)/4;
 // Ground and soft shadow
 cctx.save();cctx.fillStyle='#00000014';cctx.beginPath();cctx.ellipse(235,310,170,17,0,0,Math.PI*2);cctx.fill();cctx.restore();
 // Roof plane
 cctx.beginPath();cctx.moveTo(topL.x,topL.y);cctx.lineTo(topR.x,topR.y);cctx.lineTo(sideTL.x,sideTL.y);cctx.lineTo(topL.x+backDx,topL.y+backDy);cctx.closePath();cctx.fillStyle='#9d9b94';cctx.fill();cctx.strokeStyle='#ffffff';cctx.lineWidth=1;cctx.stroke();
 function fillFace(points,materialId,zone){let m=mat(materialId),im=imgFor(m);cctx.save();cctx.beginPath();points.forEach((p,i)=>i?cctx.lineTo(p.x,p.y):cctx.moveTo(p.x,p.y));cctx.closePath();cctx.clip();cctx.fillStyle=m.color;cctx.fillRect(0,0,430,350);if(im.complete&&im.naturalWidth){cctx.globalAlpha=.94;cctx.drawImage(im,0,0,430,350)}
  if(state.light==='sunset')cctx.fillStyle='#d88a4b20',cctx.fillRect(0,0,430,350);if(state.light==='night')cctx.fillStyle='#14273570',cctx.fillRect(0,0,430,350);
  cctx.restore();cctx.save();cctx.beginPath();points.forEach((p,i)=>i?cctx.lineTo(p.x,p.y):cctx.moveTo(p.x,p.y));cctx.closePath();cctx.strokeStyle='#59646a';cctx.lineWidth=1.2;cctx.stroke();
  if(zone===state.selectedZone&&!miniature){cctx.fillStyle='#c59e6940';cctx.fill();cctx.strokeStyle='#bd9054';cctx.lineWidth=3;cctx.stroke()}cctx.restore();}
 // Draw front as 3 vertical editable strips
 let fxs=[frontL.x,frontL.x+260/3,frontL.x+520/3,frontR.x];let fzones=['front-left','front-center','front-right'];
 fzones.forEach((z,i)=>fillFace([{x:fxs[i],y:300},{x:fxs[i+1],y:300},{x:fxs[i+1],y:65},{x:fxs[i],y:65}],state.assignments[z],z));
 // Side view is the visible side (the other can be accessed by flip)
 let visibleSide=isLeft?'left-side':'right-side';
 fillFace([{x:frontR.x,y:300},{x:sideBL.x,y:sideBL.y},{x:sideTL.x,y:sideTL.y},{x:topR.x,y:65}],state.assignments[visibleSide],visibleSide);
 // floor bands and cladding joints
 cctx.save();cctx.strokeStyle='#ffffff9c';cctx.lineWidth=1.3;
 for(let f=1;f<4;f++){let y=300-floorH*f;cctx.beginPath();cctx.moveTo(75,y);cctx.lineTo(335,y);cctx.stroke();cctx.beginPath();cctx.moveTo(335,y);cctx.lineTo(335+backDx,y+backDy);cctx.stroke()}
 cctx.strokeStyle='#ffffff66';for(let x=1;x<6;x++){let xx=75+x*260/6;cctx.beginPath();cctx.moveTo(xx,65);cctx.lineTo(xx,300);cctx.stroke()}
 cctx.restore();
 // Windows on front: 2 per segment per floor, framed
 for(let f=0;f<4;f++){let y=300-floorH*(f+1)+13;for(let z=0;z<3;z++){let segL=fxs[z],segW=fxs[z+1]-fxs[z];for(let j=0;j<2;j++){let ww=21,hh=29,x=segL+segW*(j?0.66:0.22);cctx.fillStyle='#263e4a';cctx.fillRect(x,y,ww,hh);cctx.fillStyle=state.light==='night'?'#e7bd70':'#8da4a6';cctx.globalAlpha=state.light==='night'?.92:.62;cctx.fillRect(x+2,y+2,ww-4,hh-4);cctx.globalAlpha=1;cctx.strokeStyle='#e9e2d5';cctx.lineWidth=2;cctx.strokeRect(x,y,ww,hh);cctx.beginPath();cctx.moveTo(x+ww/2,y);cctx.lineTo(x+ww/2,y+hh);cctx.strokeStyle='#d6d9d6';cctx.lineWidth=1;cctx.stroke()}}}
 // Side windows
 for(let f=0;f<4;f++){let y0=300-floorH*(f+1)+14;for(let j=0;j<2;j++){let t=.24+j*.42;let bx=frontR.x+backDx*t,by=frontR.y+backDy*t-floorH*(f+1)+14;cctx.fillStyle='#263e4a';cctx.beginPath();cctx.moveTo(bx,by);cctx.lineTo(bx+17,by-10);cctx.lineTo(bx+17,by+19);cctx.lineTo(bx,by+29);cctx.closePath();cctx.fill();cctx.fillStyle='#839a9d';cctx.globalAlpha=.7;cctx.fill();cctx.globalAlpha=1}}
 // Base plinth
 cctx.fillStyle='#626c6c';cctx.beginPath();cctx.moveTo(68,300);cctx.lineTo(342,300);cctx.lineTo(412,259);cctx.lineTo(412,310);cctx.lineTo(342,338);cctx.lineTo(68,338);cctx.closePath();cctx.fill();cctx.restore();
 cctx.fillStyle='#eee7db';cctx.font='bold 9px Vazirmatn, Tahoma';cctx.textAlign='center';cctx.fillText('STONE FACADE STUDIO',218,329);
 // outlines selected and labels
 if(!miniature){cctx.fillStyle='#20343a';cctx.globalAlpha=.85;cctx.fillRect(12,12,110,23);cctx.globalAlpha=1;cctx.fillStyle='#fff';cctx.font='10px Vazirmatn, Tahoma';cctx.textAlign='center';cctx.fillText(isLeft?'LEFT VIEW':'RIGHT VIEW',67,27)}
 // lighting vignette overlay
 if(state.light==='night'){cctx.fillStyle='#152c4380';cctx.fillRect(0,0,430,350)}
 }
function draw(){if(!canvas)return;drawTo(canvas)}
function renderMaterials(){let target=$('#materialGrid');target.innerHTML='';materials.forEach(m=>{let b=document.createElement('button');b.className='material'+(state.assignments[state.selectedZone]===m.id?' selected':'');let im=document.createElement('img');im.alt=m.name;im.src=m.data||('./assets/stones/'+m.file);let label=document.createElement('span');label.textContent=m.name;b.append(im,label);if(m.custom){let tag=document.createElement('em');tag.textContent='شخصی';b.append(tag)}b.addEventListener('click',()=>{state.assignments[state.selectedZone]=m.id;persist();renderMaterials();draw();toast('سنگ روی '+zoneNames[state.selectedZone]+' اعمال شد')});target.append(b)})}
function renderZones(){ $$('.zone').forEach(b=>b.classList.toggle('selected',b.dataset.zone===state.selectedZone));$('#selectedZoneText').textContent=zoneNames[state.selectedZone];$('#selectedChip').textContent=state.selectedZone.startsWith('front')?'نمای جلو':'نمای جانبی';}
function switchScreen(id){$$('.screen').forEach(s=>s.classList.toggle('active',s.id==='screen-'+id));$$('.navitem').forEach(b=>b.classList.toggle('active',b.dataset.screen===id));if(id==='design')setTimeout(draw,60);if(id==='saved')renderSaved();window.scrollTo({top:0,behavior:'smooth'})}
$$('.navitem').forEach(b=>b.addEventListener('click',()=>switchScreen(b.dataset.screen)));
$$('.zone').forEach(b=>b.addEventListener('click',()=>{state.selectedZone=b.dataset.zone;renderZones();renderMaterials();draw()}));
$('#flipView').addEventListener('click',()=>{state.viewSide=state.viewSide==='right'?'left':'right';$('#flipView').innerHTML=state.viewSide==='right'?'نمای سمت مقابل <span>↔</span>':'نمای سمت مقابل <span>↔</span>';state.selectedZone=state.viewSide==='right'?'right-side':'left-side';renderZones();renderMaterials();draw()});
$('#zoomIn').addEventListener('click',()=>{state.zoom=Math.min(1.25,state.zoom+.08);$('#zoomValue').textContent=Math.round(state.zoom*100)+'%';draw()});$('#zoomOut').addEventListener('click',()=>{state.zoom=Math.max(.78,state.zoom-.08);$('#zoomValue').textContent=Math.round(state.zoom*100)+'%';draw()});$('#resetView').addEventListener('click',()=>{state.zoom=1;state.viewSide='right';state.selectedZone='front-center';$('#zoomValue').textContent='100%';renderZones();renderMaterials();draw()});
canvas.addEventListener('click',e=>{let r=canvas.getBoundingClientRect(),scale=Math.min(r.width/430,r.height/350)*state.zoom,ox=(r.width-430*scale)/2,oy=(r.height-350*scale)/2,rawX=(e.clientX-r.left-ox)/scale,x=state.viewSide==='left'?430-rawX:rawX,y=(e.clientY-r.top-oy)/scale;let zone;if(x>335&&y>65&&y<300)zone=state.viewSide==='left'?'left-side':'right-side';else if(x>=75&&x<=335&&y>=65&&y<=300){let i=Math.min(2,Math.floor((x-75)/(260/3)));zone=['front-left','front-center','front-right'][i]}if(zone){state.selectedZone=zone;renderZones();renderMaterials();draw()}});
function preset(ids){let zones=Object.keys(state.assignments);zones.forEach((z,i)=>state.assignments[z]=ids[i%ids.length]);persist();renderMaterials();draw()}
const presets={classic:['abbasabad','abbasabad','abbasabad','silver-travertine','silver-travertine'],warm:['noce','abbasabad','honey-onyx','noce','noce'],modern:['white-marble','silver-travertine','white-marble','charcoal-basalt','charcoal-basalt'],contrast:['beige-limestone','black-gold','beige-limestone','black-gold','black-gold']};
$$('[data-preset]').forEach(b=>b.addEventListener('click',()=>{preset(presets[b.dataset.preset]);toast('طرح آماده اعمال شد')}));
$('#randomBtn').addEventListener('click',()=>{let pool=materials.filter(m=>!m.custom||true);Object.keys(state.assignments).forEach(z=>state.assignments[z]=pool[Math.floor(Math.random()*pool.length)].id);persist();renderMaterials();draw();toast('ترکیب سنگ جدید ساخته شد')});
$('#showAllMaterials').addEventListener('click',()=>$('#materialGrid').scrollIntoView({behavior:'smooth',block:'center'}));
// save / load concepts
$('#saveDesignBtn').addEventListener('click',()=>{$('#designTitle').value=(state.project||'طرح جدید')+' - '+(state.saved.length+1);$('#saveDialog').showModal()});
$('#confirmSave').addEventListener('click',e=>{e.preventDefault();let title=$('#designTitle').value.trim()||'طرح بدون عنوان';state.saved.unshift({id:Date.now(),title,assignments:{...state.assignments},viewSide:state.viewSide,light:state.light,created:new Date().toLocaleDateString('fa-IR')});state.saved=state.saved.slice(0,30);persist();$('#saveDialog').close();toast('طرح ذخیره شد');renderSaved()});
function renderSaved(){let host=$('#savedList');host.innerHTML='';if(!state.saved.length){host.innerHTML='<div class="panel"><b>هنوز طرحی ذخیره نشده است.</b><p class="muted">از صفحه طراحی، روی «ذخیره طرح» بزنید تا طرح اینجا ثبت شود.</p></div>'}state.saved.forEach(s=>{let card=document.createElement('div');card.className='saved-card';let thumb=document.createElement('div');thumb.className='saved-thumb';let tc=document.createElement('canvas');thumb.append(tc);card.append(thumb);let info=document.createElement('div');info.className='saved-info';info.innerHTML=`<b>${escapeHtml(s.title)}</b><small>${s.created||''} · ${Object.keys(s.assignments||{}).length} بخش نما</small>`;card.append(info);let actions=document.createElement('div');actions.className='saved-actions';let load=document.createElement('button');load.textContent='بازکردن';load.onclick=()=>{state.assignments={...defaults.assignments,...s.assignments};state.viewSide=s.viewSide||'right';state.light=s.light||'day';persist();$$('[data-light]').forEach(x=>x.classList.toggle('active',x.dataset.light===state.light));renderMaterials();renderZones();draw();switchScreen('design');toast('طرح بارگذاری شد')};let del=document.createElement('button');del.textContent='حذف';del.onclick=()=>{state.saved=state.saved.filter(x=>x.id!==s.id);persist();renderSaved()};actions.append(load,del);card.append(actions);host.append(card);let oldA=state.assignments,oldV=state.viewSide,oldL=state.light,oldZ=state.selectedZone;state.assignments={...defaults.assignments,...s.assignments};state.viewSide=s.viewSide||'right';state.light=s.light||'day';state.selectedZone='';drawTo(tc,true);state.assignments=oldA;state.viewSide=oldV;state.light=oldL;state.selectedZone=oldZ}) ;$('#librarySummary').innerHTML=materials.map(m=>`<span>${escapeHtml(m.name)}</span>`).join('')}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
// Photo from mobile library, downscaled and stored locally
$('#stoneUpload').addEventListener('change',e=>{let f=e.target.files&&e.target.files[0];if(!f)return;if(!f.type.startsWith('image/')){toast('لطفاً فایل عکس انتخاب کنید');return}let reader=new FileReader();reader.onload=()=>{let im=new Image();im.onload=()=>{let c=document.createElement('canvas'),max=620,sc=Math.min(1,max/Math.max(im.width,im.height));c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);c.getContext('2d').drawImage(im,0,0,c.width,c.height);let data=c.toDataURL('image/webp',.76);let name=(f.name||'سنگ جدید').replace(/\.[^.]+$/,'').slice(0,28);let m={id:'custom-'+Date.now(),name,custom:true,data,color:'#a99a85'};materials.push(m);try{persist();renderMaterials();renderSaved();toast('عکس سنگ به کتابخانه اضافه شد')}catch(err){materials.pop();toast('حافظه مرورگر پر است؛ عکس کوچک‌تری انتخاب کنید')}};im.src=reader.result};reader.readAsDataURL(f);e.target.value=''});
// project fields and estimate
const fields={customerName:'customer',projectName:'project',facadeWidth:'width',facadeHeight:'height',buildingDepth:'depth',openingsRate:'openings',unitPrice:'price',wasteRate:'waste'};Object.entries(fields).forEach(([id,key])=>{let el=$('#'+id);el.value=state[key]??defaults[key];el.addEventListener('input',()=>{state[key]=['width','height','depth','openings','price','waste'].includes(key)?Number(el.value||0):el.value;persist();calculate()})});
function calculate(){let w=Math.max(0,Number($('#facadeWidth').value)||0),h=Math.max(0,Number($('#facadeHeight').value)||0),price=Math.max(0,Number($('#unitPrice').value)||0),waste=Math.max(0,Math.min(50,Number($('#wasteRate').value)||0));let depth=Math.max(0,Number($('#buildingDepth').value)||0),openings=Math.max(0,Math.min(80,Number($('#openingsRate').value)||0));let gross=(w+2*depth)*h;let area=gross*(1-openings/100),withWaste=area*(1+waste/100),total=withWaste*price;currentEstimate={gross,area,withWaste,total,price,waste,depth,openings};$('#estimateArea').textContent=fmt(area)+' مترمربع';$('#estimateWaste').textContent=fmt(withWaste)+' مترمربع';$('#estimateUnit').textContent=fmt(price)+' تومان';$('#estimateTotal').textContent=fmt(total);}
function fmt(n){return Math.round(n).toLocaleString('en-US')}
$('#calcBtn').addEventListener('click',()=>{calculate();toast('برآورد اولیه محاسبه شد')});calculate();
$('#exportCsv').addEventListener('click',()=>{if(!currentEstimate)calculate();let rows=[['عنوان','مقدار'],['نام مشتری',state.customer],['نام پروژه',state.project],['عرض نما m',state.width],['ارتفاع نما m',state.height],['عمق ساختمان m',currentEstimate.depth],['درصد بازشوها',currentEstimate.openings],['مساحت ناخالص نماها m2',currentEstimate.gross.toFixed(2)],['مساحت خالص تقریبی m2',currentEstimate.area.toFixed(2)],['مساحت با پرت m2',currentEstimate.withWaste.toFixed(2)],['قیمت واحد تومان',currentEstimate.price],['مبلغ کل تومان',Math.round(currentEstimate.total)],['توضیح','برآورد اولیه؛ بدون زیرسازی، نصب، حمل و مالیات']];let csv='\ufeff'+rows.map(r=>r.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');download(new Blob([csv],{type:'text/csv;charset=utf-8'}),'StoneFacade-Estimate.csv');});
function download(blob,name){let url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
// lighting presets
$$('[data-light]').forEach(b=>b.addEventListener('click',()=>{$$('[data-light]').forEach(x=>x.classList.toggle('active',x===b));state.light=b.dataset.light;persist();draw()}));
// Export image by drawing current canvas to a standalone PNG
let exportLong=$('#resetView');exportLong.addEventListener('contextmenu',e=>e.preventDefault());
function exportPreview(){draw();let a=document.createElement('a');a.download='StoneFacade-Preview.png';a.href=canvas.toDataURL('image/png');a.click();toast('تصویر پیش‌نمایش آماده شد')}
$('#exportPng').addEventListener('click',exportPreview);canvas.addEventListener('dblclick',exportPreview);
// Install prompt
let installPrompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#installBtn').style.display='block'});$('#installBtn').addEventListener('click',async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null}else toast('از منوی مرورگر گزینه Add to Home Screen یا افزودن به صفحه اصلی را بزنید')});
// first paint and service worker
renderZones();renderMaterials();renderSaved();draw();window.addEventListener('resize',draw);if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
})();