(() => {
"use strict";
const DATA=window.DRAMA_DATA, ASSETS=DATA.assets;
const $=id=>document.getElementById(id);
const escape=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clone=x=>JSON.parse(JSON.stringify(x));
const kindLabels={image:"图片",document:"文稿",data:"清单",text:"文字",video:"视频",audio:"音频"};
let project=DATA.projects[0], state, filter="all", shotFilter="all", addTarget=null, uploadTarget=null, storageOK=true, lastFocus=null;
const storedFiles=new Map(), urls=new Map();
let db=null, observer=null, toastTimer;
const stateKey=id=>"dear-drama-preproduction-v1:"+id;
function initialState(p){
 const selected={};p.nodes.forEach(n=>n.items.forEach(i=>{if(i.initialSelected)selected[i.id]=true;}));
 return {version:1,projectId:p.id,metadata:clone(p.metadata),selected,chosen:{},designDecisions:{},designOpen:{R1:true},uploads:{},notes:{},extras:{},virtual:{},open:{N00:true,N04:true,N08:true,N09:true},plan:{scope:"all",sampleShot:"",route:"",tool:"",audioRoute:"",budget:"",quantity:""},checks:{continuity:false,voice:false},updatedAt:null};
}
function loadState(p){
 try{const saved=JSON.parse(localStorage.getItem(stateKey(p.id))||"null");if(saved&&saved.projectId===p.id&&saved.version===1)return Object.assign(initialState(p),saved,{designOpen:Object.assign({R1:true},saved.designOpen||{}),chosen:saved.chosen||{},designDecisions:saved.designDecisions||{}});}catch(e){storageOK=false;}
 return initialState(p);
}
function save(){
 state.updatedAt=new Date().toISOString();
 try{localStorage.setItem(stateKey(project.id),JSON.stringify(state));$("saveState").textContent="已保存到本机 · "+new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"});}
 catch(e){storageOK=false;$("saveState").textContent="当前浏览器保存不可用；请导出清单";}
}
function toast(text){$("toast").textContent=text;$("toast").classList.add("visible");clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("toast").classList.remove("visible"),3800);}
function initDB(){
 return new Promise(resolve=>{
  if(!window.indexedDB){resolve(null);return;}
  let req;try{req=indexedDB.open("dear-drama-preproduction-files",1);}catch(e){resolve(null);return;}
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains("files"))req.result.createObjectStore("files",{keyPath:"id"});};
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>resolve(null);
 });
}
async function hydrate(){
 if(!db)return;
 const ids=Object.values(state.uploads||{}).flat().map(f=>f.id);
 await Promise.all(ids.map(id=>new Promise(resolve=>{
  const req=db.transaction("files").objectStore("files").get(id);
  req.onsuccess=()=>{if(req.result?.blob)storedFiles.set(id,req.result.blob);resolve();};req.onerror=()=>resolve();
 })));
}
function putFile(id,blob){return new Promise((resolve,reject)=>{if(!db){storedFiles.set(id,blob);resolve(false);return;}const tx=db.transaction("files","readwrite");tx.objectStore("files").put({id,blob});tx.oncomplete=()=>{storedFiles.set(id,blob);resolve(true);};tx.onerror=()=>reject(tx.error);});}
function fileURL(file){
 if(file.url){if(!/^assets\/[A-Za-z0-9._-]+$|^materials\/[A-Za-z0-9._-]+$/.test(file.url)&&!/^data:(image\/(png|jpeg|webp|gif)|audio\/[a-z0-9.+-]+|video\/[a-z0-9.+-]+|application\/(pdf|octet-stream|vnd.openxmlformats-officedocument.wordprocessingml.document));base64,/i.test(file.url))return null;return file.url;}
 if(file.text!==undefined){
  if(!urls.has(file.id))urls.set(file.id,URL.createObjectURL(new Blob([file.text],{type:"text/plain;charset=utf-8"})));
  return urls.get(file.id);
 }
 if(!storedFiles.has(file.id))return null;
 if(!urls.has(file.id))urls.set(file.id,URL.createObjectURL(storedFiles.get(file.id)));
 return urls.get(file.id);
}
function nodeItems(n){return [...n.items,...(state.extras[n.id]||[])];}
function allItems(){return project.nodes.flatMap(nodeItems);}
function getItem(id){return allItems().find(i=>i.id===id);}
function getFiles(it){
 const defaults=(it.defaultAssets||[]).map(id=>ASSETS[id]).filter(Boolean);
 const own=(state.uploads[it.id]||[]).filter(f=>storedFiles.has(f.id)).map(f=>({id:f.id,name:f.name,filename:f.filename,kind:it.kind,bytes:f.bytes,version:f.version,uploaded:true}));
 const virtual=state.virtual[it.id]?[state.virtual[it.id]]:[];
 return [...virtual,...own.slice().reverse(),...defaults];
}
function lostFileCount(it){return (state.uploads[it.id]||[]).filter(f=>!storedFiles.has(f.id)).length;}
function currentFile(it){const files=getFiles(it);return state.chosen[it.id]?(files.find(f=>f.id===state.chosen[it.id])||null):(files[0]||null);}
function isSelected(it){return Boolean(currentFile(it))&&Boolean(state.selected[it.id]);}
function itemStatus(it){return getFiles(it).length?(isSelected(it)?["ready","已选用"]:["candidate","已有候选"]):["waiting","等待添加"];}
function stats(n){
 const items=nodeItems(n),filled=items.filter(i=>getFiles(i).length).length,selected=items.filter(isSelected).length;
 if(n.kind==="gate"){const checks=gateChecks(),done=checks.filter(c=>c.pass).length;return {filled:done,selected:done,total:checks.length,status:done===checks.length?"ready":done?"partial":"waiting",label:done===checks.length?"资料就绪":done?"部分准备":"等待填写"};}
 const status=filled===items.length&&selected===items.length?"ready":filled?"partial":"waiting";
 return {filled,selected,total:items.length,status,label:status==="ready"?"已选用":status==="partial"?"部分准备":"等待添加"};
}
function findAsset(id){
 if(ASSETS[id])return ASSETS[id];
 for(const it of allItems()){const file=getFiles(it).find(f=>f.id===id);if(file)return file;}
 return null;
}
function selectedForNodes(ids){
 const missing=[],shotIds=new Set(scopeGroups().map(g=>g.id));
 for(const id of ids){const n=project.nodes.find(n=>n.id===id);const items=nodeItems(n||{items:[],id}).filter(it=>!it.shotIds?.length||it.shotIds.some(s=>shotIds.has(s)));const groups=new Map();
 for(const it of items){if(!it.required)continue;if(it.choiceGroup){if(!groups.has(it.choiceGroup))groups.set(it.choiceGroup,[]);groups.get(it.choiceGroup).push(it);}else if(!isSelected(it))missing.push(it.title);}
 for(const [group,options] of groups)if(!options.some(isSelected))missing.push(group+'：至少选用一个候选');
 }
 return missing;
}
function scopeGroups(){const n=project.nodes.find(n=>n.id==="N08");if(!n)return [];if(state.plan.scope==="sample"){const chosen=state.plan.sampleShot||n.groups?.[0]?.id;return (n.groups||[]).filter(g=>g.id===chosen);} return n.groups||[];}
function gateChecks(){
 const m=state.metadata, requiredNodes=selectedForNodes(["N00","N01","N02","N03","N04","N05","N06","N07","N14"]);
 const keyItems=project.nodes.find(n=>n.id==="N08").items.filter(i=>scopeGroups().some(g=>g.id===i.group));
 const keyMissing=keyItems.filter(i=>!isSelected(i));
 const toolOK=Boolean(state.plan.route&&state.plan.tool.trim()&&String(state.plan.quantity).trim()&&String(state.plan.budget).trim()&&Number(state.plan.quantity)>0&&Number(state.plan.budget)>=0);
 const needsVoice=state.plan.audioRoute==="sync",voiceItem=getItem("n10-final"),voicePlanMissing=state.plan.audioRoute==="silent"?[]:selectedForNodes(["N10"]).filter(title=>title!==voiceItem?.title);
 return [
  {id:"specs",name:"本集时长、画幅与表现形式明确",pass:Boolean(m.title.trim()&&m.episode.trim()&&Number(m.duration)>0&&m.ratio&&m.form.trim()&&m.style.trim()),detail:m.ratio?m.ratio+" · "+(m.duration||"待填")+"秒 · "+(m.form||"表现形式待填"):"请先填写制作规格。",target:"N00"},
  {id:"assets",name:"剧本、角色、场景、道具与分镜已选用",pass:requiredNodes.length===0,detail:requiredNodes.length?requiredNodes.length+"个必需资料位尚未添加或选用。":"本批基础资料已选用；文件选择仍需制作人员检查质量。",target:"N02"},
  {id:"frames",name:"本批关键帧与必要结束状态齐全",pass:keyItems.length>0&&keyMissing.length===0,detail:scopeGroups().length+"镜 / "+keyItems.length+"帧位；"+(keyMissing.length?keyMissing.length+"个尚未添加或选用。":"起止资料位已选用。"),target:"N08"},
  {id:"voice",name:"对白、口型与配音路线明确",pass:Boolean(state.plan.audioRoute)&&voicePlanMissing.length===0&&(!needsVoice||Boolean(voiceItem&&isSelected(voiceItem)&&state.checks.voice)),detail:!state.plan.audioRoute?"选择同期音画、后期配音或无对白路线。":needsVoice?"同期口型路线需要最终对白音轨与试听确认。":"本批使用后期配音／无对白路线；正式声音可并行补齐。",target:"N10"},
  {id:"tool",name:"本批工具、数量与成本上限已填写",pass:toolOK,detail:toolOK?state.plan.tool+" · "+state.plan.quantity+"段 · 预算上限"+state.plan.budget+"；填写不代表工具已实测。":"填写工具名称、视频路线、数量和预算；免费路线可填0。",target:"N09"},
  {id:"continuity",name:"本批人物、空间与道具状态已人工复核",pass:Boolean(state.checks.continuity),detail:state.checks.continuity?"已在本页记录复核；新增或更换资料后会要求重新检查。":"确认角色身份、服装、场景布局、光线、物件位置与镜头起止状态。",target:"N14"}
 ];
}
function badge(status,label){return '<span class="badge '+status+'">'+escape(label)+'</span>';}
function materialPreview(it,files){
 if(!files.length)return "";
 const pictures=files.filter(f=>f.kind==="image");
 if(pictures.length)return '<div class="asset-feature">'+pictures.slice(0,3).map(f=>'<button class="preview-thumb '+(it.id.includes("turn")||f.id.startsWith("board")?"wide":"")+'" data-view="'+escape(f.id)+'" aria-label="查看'+escape(f.name)+'"><img src="'+escape(fileURL(f))+'" alt="'+escape(f.name)+'" loading="lazy"></button>').join("")+'</div>';
 const video=files.find(f=>f.kind==="video");
 if(video)return '<div class="asset-feature"><video class="inline-video" controls preload="metadata" playsinline src="'+escape(fileURL(video))+'" aria-label="'+escape(video.name)+'"></video></div>';
 const audio=files.filter(f=>f.kind==="audio");
 if(audio.length)return '<div class="asset-feature">'+audio.map(f=>'<div class="audio-line"><span>'+escape(f.name)+'</span><audio class="inline-audio" controls preload="none" src="'+escape(fileURL(f))+'" aria-label="'+escape(f.name)+'"></audio></div>').join("")+'</div>';
 return "";
}
function renderMaterial(it,compact=false){
 const files=getFiles(it),[status,label]=itemStatus(it),icon=files.length?(kindLabels[it.kind]||"资料"):"+",lost=lostFileCount(it);
 return '<article class="material '+(!files.length?"waiting":"")+'" data-material="'+escape(it.id)+'"><div class="material-main"><span class="material-icon" aria-hidden="true">'+icon+'</span><div class="material-info"><div class="material-title">'+escape(it.title)+(it.required?'':'<span class="optional">按需</span>')+'</div><div class="material-note">'+escape(it.note||"添加资料并注明版本。")+'</div></div><div class="material-actions">'+badge(status,label)+'<button class="button secondary small" data-upload="'+escape(it.id)+'">'+(files.length?"添加":"＋添加")+'</button></div></div>'+
 (files.length?'<div class="asset-list">'+files.map(f=>'<button class="asset-chip" data-view="'+escape(f.id)+'" title="'+escape(f.name)+'"><span>'+escape(f.name)+'</span><small>'+escape(f.version||kindLabels[f.kind]||"资料")+'</small></button>'+ (f.uploaded?'<button class="remove-chip" data-remove="'+escape(f.id)+'" data-slot="'+escape(it.id)+'" aria-label="移出'+escape(f.name)+'">×</button>':'')).join("")+'</div>'+(!compact?materialPreview(it,files):"")+'<label class="version-choice">当前参考版本<select data-version="'+escape(it.id)+'">'+files.map(f=>'<option value="'+escape(f.id)+'" '+(currentFile(it)?.id===f.id?'selected':'')+'>'+escape(f.name+' '+(f.version||''))+'</option>').join('')+'</select></label><label class="select-row"><input type="checkbox" data-select="'+escape(it.id)+'" '+(isSelected(it)?"checked":"")+'>选用当前版本作为本次参考</label>':'')+
 (lost?'<span class="attachment-note">'+lost+'个清单附件不在当前浏览器，请重新添加。</span>':'')+'</article>';
}
function renderGroups(n){
 return '<div class="groups '+(n.kind==="props"?"prop-grid":"")+'">'+n.groups.map(g=>{
  let visual="";if(n.kind==="props"){
   const hasSheet=nodeItems(n).filter(i=>i.group===g.id).some(i=>getFiles(i).some(f=>f.id==="propsheet"));
   if(hasSheet){const x=(g.sheetIndex%3)*512,y=g.sheetIndex<3?68:543;visual='<button class="prop-visual" data-view="propsheet" aria-label="查看'+escape(g.name)+'外观参考" style="width:100%;border:0"><img class="crop-image" src="'+ASSETS.propsheet.url+'" alt="'+escape(g.name)+'参考图（来自六格总表）" loading="lazy" style="width:300%;left:'+(-x/512*100)+'%;top:0;transform:translateY('+(-y/1024*100)+'%);height:auto"></button>';}
   else visual='<div class="prop-visual"><div class="prop-placeholder">外观参考 · 等待添加</div></div>';
  }
  return '<section class="group"><div class="group-header"><div><h3>'+escape(g.name)+'</h3><code>'+escape(g.code||"")+'</code>'+(g.note?'<p>'+escape(g.note)+'</p>':'')+'</div></div>'+visual+'<div class="materials">'+nodeItems(n).filter(i=>i.group===g.id).map(i=>renderMaterial(i,n.kind==="props")).join("")+'</div></section>';
 }).join("")+'</div>'+nodeItems(n).filter(i=>!i.group).map(i=>renderMaterial(i)).join("");
}
function renderFrames(n){
 const available=g=>n.items.filter(i=>i.group===g.id).every(i=>getFiles(i).length);
 const groups=n.groups.filter(g=>shotFilter==="all"||(shotFilter==="ready"?available(g):!available(g)));
 return '<div class="shot-toolbar"><span>'+n.groups.length+'镜 · '+n.items.length+'个计划帧位 · '+n.items.filter(i=>getFiles(i).length).length+'个已有图</span><select id="shotFilter" aria-label="关键帧显示范围"><option value="all" '+(shotFilter==="all"?"selected":"")+'>全部镜头</option><option value="missing" '+(shotFilter==="missing"?"selected":"")+'>等待添加</option><option value="ready" '+(shotFilter==="ready"?"selected":"")+'>已有起止图</option></select></div><div class="shot-grid">'+groups.map(g=>{
  const slots=n.items.filter(i=>i.group===g.id);
  return '<article class="shot '+(slots.length===1?"single-frame":"")+'"><div class="shot-top">'+escape(g.code)+'<span>'+(g.seconds?g.seconds+"秒预算":"时长待填写")+'</span></div><p class="shot-desc">'+escape(g.name)+'</p><div class="shot-pair">'+slots.map(it=>{
   const f=currentFile(it);return '<div><button class="frame-slot '+(f?"":"empty")+'" '+(f?'data-view="'+escape(f.id)+'"':'data-upload="'+escape(it.id)+'"')+' aria-label="'+escape(g.code+" "+it.title)+(f?" 预览":" 添加")+'">'+(f?'<img src="'+escape(fileURL(f))+'" alt="'+escape(g.code+" "+it.title)+'" loading="lazy">':'<span class="frame-plus" aria-hidden="true">＋</span><span>等待添加</span>')+'<span class="frame-label">'+escape(it.title)+'</span></button>'+(f?'<label class="frame-selection"><input type="checkbox" data-select="'+escape(it.id)+'" '+(isSelected(it)?"checked":"")+'>本次选用</label><div class="frame-options"><button data-upload="'+escape(it.id)+'">添加新版本</button><span>已有候选</span></div>':'')+'</div>';
  }).join("")+'</div></article>';
 }).join("")+'</div>'+(groups.length?"":'<div class="no-results">此筛选下没有镜头。</div>')+nodeItems(n).filter(i=>!i.group).map(i=>renderMaterial(i)).join("");
}
function gateMarkup(){
 const checks=gateChecks(),passed=checks.filter(c=>c.pass).length,all=passed===checks.length;
 const scopeOption="仅选择的样镜";
 return '<div class="gate-intro"><h3>'+ (all?"本批资料满足启动清单":"本批启动资料尚未齐全")+'</h3><p>'+passed+'/'+checks.length+'项已满足。这里只整理、检查和导出资料，不调用视频工具。</p></div>'+
 '<div class="video-settings"><label>本批范围<select data-plan="scope"><option value="all" '+(state.plan.scope==="all"?"selected":"")+'>本集全部镜头</option><option value="sample" '+(state.plan.scope==="sample"?"selected":"")+'>'+scopeOption+'</option></select></label>'+
 '<label>试做镜头<select data-plan="sampleShot">'+(project.nodes.find(n=>n.id==="N08")?.groups||[]).map(g=>'<option value="'+escape(g.id)+'" '+((state.plan.sampleShot||scopeGroups()[0]?.id)===g.id?'selected':'')+'>'+escape(g.code+' · '+g.name)+'</option>').join('')+'</select></label><label>视频路线<select data-plan="route"><option value="">等待选择</option><option value="ai" '+(state.plan.route==="ai"?"selected":"")+'>AI人物动态镜头</option><option value="comic" '+(state.plan.route==="comic"?"selected":"")+'>动态漫画／图像运动</option><option value="previs" '+(state.plan.route==="previs"?"selected":"")+'>静态节奏预演</option></select></label>'+
 '<label>工具／模型名称<input data-plan="tool" value="'+escape(state.plan.tool)+'" placeholder="等待填写" maxlength="100"></label>'+
 '<label>对白与音画路线<select data-plan="audioRoute"><option value="">等待选择</option><option value="post" '+(state.plan.audioRoute==="post"?"selected":"")+'>镜头完成后配音</option><option value="sync" '+(state.plan.audioRoute==="sync"?"selected":"")+'>同期音画／口型同步</option><option value="silent" '+(state.plan.audioRoute==="silent"?"selected":"")+'>本批无对白</option></select></label>'+
 '<label>本批视频段数<input data-plan="quantity" type="number" min="1" max="999" value="'+escape(state.plan.quantity)+'" placeholder="等待填写"></label>'+
 '<label>成本／积分上限<input data-plan="budget" type="number" min="0" value="'+escape(state.plan.budget)+'" placeholder="免费路线可填0"></label></div>'+
 '<label class="check-label"><input type="checkbox" data-check="continuity" '+(state.checks.continuity?"checked":"")+'>已逐镜复核本批人物、空间、道具与起止状态</label>'+
 '<label class="check-label"><input type="checkbox" data-check="voice" '+(state.checks.voice?"checked":"")+'>同期音画路线的最终对白已试听确认（其他路线按需）</label>'+
 '<div class="checklist">'+checks.map(c=>'<div class="gate-row '+(c.pass?"pass":"fail")+'"><span class="gate-indicator" aria-hidden="true">'+(c.pass?"✓":"·")+'</span><div><strong>'+escape(c.name)+'</strong><p>'+escape(c.detail)+'</p></div><a href="#'+c.target+'" data-jump="'+c.target+'">查看 ↗</a></div>').join("")+'</div>'+
 '<div class="gate-actions"><button class="button primary" data-export-task>导出本批视频任务卡</button><button class="button secondary" data-export-missing>导出待补资料清单</button></div><p class="gate-help">工具与成本字段是制作计划；真实模型可用性、动作质量和费用需在实际执行时核对。尚缺资料也可导出“准备中”任务卡。</p>';
}
function refreshGateStatus(){
 const gate=$("N09");if(!gate)return;
 const n=project.nodes.find(n=>n.id==="N09"),s=stats(n),temp=document.createElement("div");temp.innerHTML=gateMarkup();
 for(const selector of [".gate-intro",".checklist"])gate.querySelector(selector).innerHTML=temp.querySelector(selector).innerHTML;
 gate.querySelector(".node-count").textContent=s.filled+"/"+s.total+"项";
 gate.querySelector(".node-summary-side .badge").outerHTML=badge(s.status,s.label);
 const mark=document.querySelector('.nav-item[data-jump="N09"] .nav-mark');if(mark)mark.className="nav-mark "+s.status;
}
function renderNode(n,index){
 const s=stats(n),body=n.kind==="gate"?gateMarkup():n.kind==="shots"?renderFrames(n):["grouped","props"].includes(n.kind)?renderGroups(n):'<div class="materials">'+nodeItems(n).map(i=>renderMaterial(i)).join("")+'</div>';
 return '<details class="node" id="'+n.id+'" '+(state.open[n.id]?"open":"")+'><summary><span class="node-order">'+String(index+1).padStart(2,"0")+'</span><div class="node-heading"><h2>'+escape(n.title)+'</h2><p>'+escape(n.description)+'</p></div><div class="node-summary-side"><span class="node-count">'+s.filled+'/'+s.total+(n.kind==="gate"?"项":"资料位")+'</span>'+badge(s.status,s.label)+'<span class="chevron" aria-hidden="true">⌄</span></div></summary><div class="node-body"><div class="node-meta"><span class="meta-tag">'+n.id+'</span>'+ (n.depends.length?'<span>依赖 '+n.depends.join(" · ")+'</span>':'<span>流程起点</span>')+'</div>'+body+'<div class="node-footer"><textarea class="node-note" data-note="'+n.id+'" rows="1" placeholder="节点备注：版本、待补内容或检查结论" aria-label="'+escape(n.title)+'备注">'+escape(state.notes[n.id]||"")+'</textarea>'+(n.kind!=="gate"?'<button class="button subtle" data-add="'+n.id+'">＋ 新增资料位</button>':'')+'</div></div></details>';
}
function renderSummary(){
 const items=allItems(),filled=items.filter(i=>getFiles(i).length).length,selected=items.filter(isSelected).length,frames=project.nodes.find(n=>n.id==="N08").items,frameFilled=frames.filter(i=>getFiles(i).length).length,check=gateChecks(),pass=check.filter(c=>c.pass).length;
 $("projectTitle").textContent=state.metadata.title||"未命名作品";
 $("projectSubtitle").textContent=(state.metadata.episode||"集号待填")+" · "+"视频前制作资料"+" · "+(state.metadata.totalEpisodes?"计划"+state.metadata.totalEpisodes+"集":"体量待填写");
 const ratioText=state.metadata.ratio==="9:16"?"9:16竖屏":state.metadata.ratio==="16:9"?"16:9横屏":state.metadata.ratio||"画幅待选择";
 $("specLine").textContent=[ratioText,state.metadata.duration?state.metadata.duration+"秒":"时长待填写",state.metadata.form||"表现形式待填写"].join(" · ");
 const percentage=items.length?Math.round(filled/items.length*100):0;
 $("summary").innerHTML='<div class="summary-cell"><div class="summary-label">资料覆盖 · 已有文件</div><div class="summary-value">'+filled+'<small>/ '+items.length+'个资料位</small></div><div class="progress-track"><div class="progress-fill" style="width:'+percentage+'%"></div></div><div class="summary-sub">'+selected+'个已选用 · '+(items.length-filled)+'个等待添加</div></div>'+
 '<div class="summary-cell"><div class="summary-label">独立关键帧</div><div class="summary-value">'+frameFilled+'<small>/ '+frames.length+'个计划帧</small></div><div class="summary-sub">'+(frames.length-frameFilled)+'个帧位等待添加</div></div>'+
 '<div class="summary-cell"><div class="summary-label">视频启动检查</div><div class="summary-value '+(pass===check.length?"":"warning")+'">'+(pass===check.length?"资料就绪":"待补齐")+'</div><div class="summary-sub">'+pass+'/'+check.length+'项满足 · 按本批范围检查</div></div>';
 $("coverageHint").textContent=project.nodes.length+"个顺序节点，缺项已有资料位；展开查看并添加。";
}
function render(preserveOpen=true){
 if(preserveOpen&&$("nodes").dataset.projectId===project.id)document.querySelectorAll(".node").forEach(d=>{state.open[d.id]=d.open;});
 $("nodes").dataset.projectId=project.id;
 renderSummary();
 $("nodeNav").innerHTML=project.nodes.map((n,i)=>{const s=stats(n);return '<a class="nav-item" href="#'+n.id+'" data-jump="'+n.id+'"><span class="nav-number">'+String(i+1).padStart(2,"0")+'</span><span class="nav-title">'+escape(n.short)+'</span><i class="nav-mark '+s.status+'"></i></a>';}).join("");
 const visible=project.nodes.filter(n=>filter==="all"||(filter==="missing"?stats(n).filled<stats(n).total:stats(n).filled>0));
 $("nodes").innerHTML=visible.map(n=>renderNode(n,project.nodes.indexOf(n))).join("")||'<div class="no-results">此筛选下没有节点。</div>';
 document.querySelectorAll(".filters .filter").forEach(b=>b.classList.toggle("active",b.dataset.filter===filter));
 document.querySelectorAll(".node").forEach(d=>d.addEventListener("toggle",()=>{if(!d.isConnected)return;state.open[d.id]=d.open;save();}));
 if(observer)observer.disconnect();
 observer=new IntersectionObserver(entries=>{const top=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(top)document.querySelectorAll(".nav-item").forEach(a=>a.classList.toggle("active",a.dataset.jump===top.target.id));},{rootMargin:"-110px 0px -65% 0px"});
 document.querySelectorAll(".node").forEach(d=>observer.observe(d));
}
function fillMetadata(){for(const field of $("metadataForm").elements)if(field.name)field.value=state.metadata[field.name]??"";}
async function switchProject(id){
 project=DATA.projects.find(p=>p.id===id)||DATA.projects[0];state=loadState(project);filter="all";shotFilter="all";
 await hydrate();fillMetadata();render(false);renderCharacterDesign();document.title=(state.metadata.title||"新作品")+" · 视频前资料工作台";window.scrollTo({top:0,behavior:"auto"});
 try{localStorage.setItem("dear-drama-last-project",project.id);}catch(e){}
}
function inlineMarkdown(text){
 let s=escape(text);
 s=s.replace(/\[([^\]]+)\]\([^)]+\)/g,"$1");
 s=s.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/\x60([^\x60]+)\x60/g,"<code>$1</code>");
 return s;
}
function markdown(text){
 const lines=text.split(/\r?\n/);let html="",i=0;
 while(i<lines.length){
  const line=lines[i];if(!line.trim()){i++;continue;}
  if(line.startsWith(String.fromCharCode(96).repeat(3))){const block=[];i++;while(i<lines.length&&!lines[i].startsWith(String.fromCharCode(96).repeat(3)))block.push(lines[i++]);i++;html+="<pre>"+escape(block.join("\n"))+"</pre>";continue;}
  const head=line.match(/^(#{1,3})\s+(.+)/);if(head){const level=head[1].length;html+="<h"+level+">"+inlineMarkdown(head[2])+"</h"+level+">";i++;continue;}
  if(line.startsWith("|")){const table=[];while(i<lines.length&&lines[i].startsWith("|"))table.push(lines[i++]);const parsed=table.filter(l=>!/^\|[-:\s|]+\|$/.test(l)).map(l=>l.split("|").slice(1,-1).map(v=>v.trim()));html+='<div class="doc-table-wrap"><table>'+parsed.map((row,r)=>"<tr>"+row.map(v=>"<"+(r===0?"th":"td")+">"+inlineMarkdown(v)+"</"+(r===0?"th":"td")+">").join("")+"</tr>").join("")+"</table></div>";continue;}
  if(line.startsWith(">")){const q=[];while(i<lines.length&&lines[i].startsWith(">"))q.push(lines[i++].replace(/^>\s?/,""));html+="<blockquote>"+inlineMarkdown(q.join("\n")).replace(/\n/g,"<br>")+"</blockquote>";continue;}
  if(/^\s*[-*]\s+/.test(line)){let list="";while(i<lines.length&&/^\s*[-*]\s+/.test(lines[i]))list+="<li>"+inlineMarkdown(lines[i++].replace(/^\s*[-*]\s+/,""))+"</li>";html+="<ul>"+list+"</ul>";continue;}
  html+="<p>"+inlineMarkdown(line)+"</p>";i++;
 }
 return '<article class="document">'+html+"</article>";
}
async function view(id){
 const file=findAsset(id);if(!file){toast("当前资料无法读取，请重新添加。");return;}lastFocus=document.activeElement;
 $("viewerTitle").textContent=file.name;$("viewerMeta").textContent=[file.version||kindLabels[file.kind],file.note].filter(Boolean).join(" · ");
 const url=fileURL(file);if(!url){toast("附件不在当前浏览器，请重新添加。");return;}const body=$("viewerBody");body.innerHTML="";
 if(file.kind==="image"){const image=document.createElement("img");image.src=url;image.alt=file.name;body.appendChild(image);}
 else if(file.kind==="video"||file.kind==="audio"){const media=document.createElement(file.kind);media.src=url;media.controls=true;media.preload="metadata";if(file.kind==="video")media.playsInline=true;body.appendChild(media);media.onerror=()=>{const p=document.createElement("p");p.textContent="当前浏览器无法预览该格式，可下载原文件查看。";body.appendChild(p);};}
 else if(file.text!==undefined||storedFiles.has(file.id)){
  const blob=storedFiles.get(file.id),name=file.filename||file.name;
  if(file.text!==undefined||/\.(md|txt|json|srt|csv)$/i.test(name)){const text=file.text!==undefined?file.text:await blob.text();body.innerHTML=/\.md$/i.test(name)?markdown(text):"<pre>"+escape(text)+"</pre>";}
  else{const p=document.createElement("p");p.textContent="此文件已添加，可下载后使用相应软件查看。";body.appendChild(p);}
 }
 $("viewerFooter").innerHTML='<p>'+escape(file.filename||file.name)+'</p><a class="button secondary" href="'+escape(url)+'" download="'+escape(file.filename||file.name)+'">下载资料</a><button class="button primary" id="viewerDone">完成查看</button>';
 $("viewerDone").onclick=closeViewer;$("viewer").showModal();
}
function closeViewer(){document.querySelectorAll("#viewerBody video,#viewerBody audio").forEach(m=>m.pause());$("viewer").close();if(lastFocus?.isConnected)lastFocus.focus();}
function changed(){state.checks.continuity=false;save();render();}
function chooseUpload(id){
 const it=getItem(id);if(!it)return;uploadTarget=id;
 const accepts={image:".png,.jpg,.jpeg,.webp,.gif",video:".mp4,.webm,.mov",audio:".mp3,.wav,.m4a,.aiff",document:".md,.txt,.pdf,.docx,.json,.csv",data:".json,.csv,.txt,.md",text:".txt,.md,.srt,.csv,.json"};
 $("fileInput").accept=accepts[it.kind]||accepts.document;$("fileInput").value="";$("fileInput").click();
}
function validExtension(file,kind){const ext=(file.name.split(".").pop()||"").toLowerCase();return ({image:["png","jpg","jpeg","webp","gif"],video:["mp4","webm","mov"],audio:["mp3","wav","m4a","aiff"],document:["md","txt","pdf","docx","json","csv"],data:["json","csv","txt","md"],text:["txt","md","srt","csv","json"]}[kind]||[]).includes(ext);}
$("fileInput").addEventListener("change",async e=>{
 const item=getItem(uploadTarget);if(!item)return;const files=Array.from(e.target.files||[]);if(!files.length)return;
 let count=0,persistent=true;
 for(const file of files){
  if(!validExtension(file,item.kind)){toast(file.name+"与这个资料位的格式不符。");continue;}
  if(file.size>30*1024*1024){toast("单个文件上限30MB，请保留原件并添加较小的参考副本。");continue;}
  const id=project.id+"-"+Date.now()+"-"+Math.random().toString(36).slice(2);
  try{persistent=await putFile(id,file)&&persistent;}catch(err){toast("浏览器保存空间不足；文件尚未添加，请保留原件。");continue;}
  const rec={id,name:file.name,filename:file.name,kind:item.kind,bytes:file.size,version:"本机添加",createdAt:new Date().toISOString()};
  (state.uploads[item.id]||(state.uploads[item.id]=[])).push(rec);count++;
 }
 if(count){state.selected[item.id]=false;changed();toast(count+"份资料已添加；"+(persistent?"已保存在当前浏览器。":"本次可用，刷新后需要重新添加。"));}
 uploadTarget=null;
});
function downloadJSON(data,name){const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json;charset=utf-8"}),url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function missingList(){return project.nodes.filter(n=>n.kind!=="gate").map(n=>({node:n.id,title:n.title,missing:nodeItems(n).filter(it=>!getFiles(it).length).map(it=>({id:it.id,title:it.title,kind:kindLabels[it.kind],required:it.required,note:it.note})),awaitingSelection:nodeItems(n).filter(it=>getFiles(it).length&&!isSelected(it)).map(it=>({id:it.id,title:it.title}))}));}
function exportTask(){
 const checks=gateChecks(),n=project.nodes.find(n=>n.id==="N08");
 const selectedShots=scopeGroups().map(g=>({id:g.id,action:g.name,seconds:g.seconds,frames:n.items.filter(i=>i.group===g.id).map(i=>({id:i.id,state:itemStatus(i)[1],files:(currentFile(i)?[currentFile(i)]:[]).map(f=>({name:f.name,filename:f.filename,version:f.version,location:f.uploaded?"当前浏览器附件":f.url?.startsWith("data:")?"模板内嵌附件，请下载对应文件":f.url}))}))}));
 downloadJSON({project:state.metadata.title,episode:state.metadata.episode,specification:state.metadata,plan:state.plan,status:checks.every(c=>c.pass)?"资料清单满足，待实际执行":"准备中，资料待补",checks,shots:selectedShots,sourceNote:"网页状态仅反映本机整理与人工选用。文件、真实工具能力、实际动作和费用须分别核对。",exportedAt:new Date().toISOString()},(state.metadata.episode||"EP001")+"-视频启动任务卡.json");
 toast("已导出任务卡；未调用视频工具。");
}
function jump(id){
 if(!project.nodes.some(n=>n.id===id))return;if(!document.getElementById(id)){filter="all";render();}
 state.open[id]=true;save();const target=$(id);target.open=true;target.scrollIntoView({behavior:"smooth",block:"start"});
}
document.addEventListener("click",e=>{
 const b=e.target.closest("button,a");if(!b)return;
 if(b.dataset.jump){e.preventDefault();jump(b.dataset.jump);}
 else if(b.dataset.view)view(b.dataset.view);
 else if(b.dataset.upload)chooseUpload(b.dataset.upload);
 else if(b.dataset.filter){filter=b.dataset.filter;render();}
 else if(b.dataset.add){addTarget=b.dataset.add;$("addForm").reset();$("addDialog").showModal();}
 else if(b.dataset.remove){state.uploads[b.dataset.slot]=(state.uploads[b.dataset.slot]||[]).filter(f=>f.id!==b.dataset.remove);state.selected[b.dataset.slot]=false;changed();toast("已从资料位移出，原文件没有删除。");}
 else if(b.hasAttribute("data-export-task"))exportTask();
 else if(b.hasAttribute("data-export-missing"))downloadJSON({project:state.metadata,missing:missingList(),exportedAt:new Date().toISOString()},(state.metadata.episode||"EP001")+"-待补资料清单.json");
});
document.addEventListener("change",e=>{
 const f=e.target;
 if(f.dataset.select){const it=getItem(f.dataset.select);state.selected[it.id]=f.checked;state.chosen[it.id]=currentFile(it)?.id||null;if(f.checked&&it.choiceGroup)for(const other of allItems())if(other.id!==it.id&&other.choiceGroup===it.choiceGroup)state.selected[other.id]=false;state.checks.continuity=false;save();render();}
 if(f.dataset.version){state.chosen[f.dataset.version]=f.value;state.selected[f.dataset.version]=false;state.checks.continuity=false;save();render();}
 if(f.dataset.plan){state.plan[f.dataset.plan]=f.value;save();render();}
 if(f.dataset.check){state.checks[f.dataset.check]=f.checked;save();render();}
 if(f.dataset.note){state.notes[f.dataset.note]=f.value;save();}
 if(f.id==="shotFilter"){shotFilter=f.value;render();}
});
document.addEventListener("input",e=>{
 const f=e.target;
 if(f.dataset.plan){state.plan[f.dataset.plan]=f.value;save();renderSummary();refreshGateStatus();}
 if(f.dataset.note){state.notes[f.dataset.note]=f.value;save();}
});
function updateMetadata(e){
 const field=e.target;if(!field.name)return;state.metadata[field.name]=field.value;
 if(field.name==="ratio")state.selected["n00-choice"]=false;
 state.checks.continuity=false;
 save();render();document.title=(state.metadata.title||"新作品")+" · 视频前资料工作台";
}
$("metadataForm").addEventListener("input",updateMetadata);
$("metadataForm").addEventListener("change",updateMetadata);
$("checkButton").onclick=()=>{jump("N09");toast("已按本批范围更新启动资料检查。");};
$("closeViewer").onclick=closeViewer;
$("viewer").addEventListener("cancel",()=>document.querySelectorAll("#viewerBody video,#viewerBody audio").forEach(m=>m.pause()));
$("closeAdd").onclick=()=>$("addDialog").close();$("cancelAdd").onclick=()=>$("addDialog").close();
$("addForm").addEventListener("submit",e=>{
 e.preventDefault();const form=e.currentTarget,title=form.elements.title.value.trim();if(!title||!addTarget)return;
 const id=addTarget+"-extra-"+Date.now();(state.extras[addTarget]||(state.extras[addTarget]=[])).push({id,title,kind:form.elements.kind.value,defaultAssets:[],required:form.elements.required.checked,note:"本机新增资料位，等待添加。"});
 state.open[addTarget]=true;state.checks.continuity=false;save();render();$("addDialog").close();toast("已新增资料位，状态为等待添加。");
});
$("exportButton").onclick=()=>{downloadJSON({format:"dear-drama-preproduction-v1",projectId:project.id,state,exportedAt:new Date().toISOString(),attachmentNote:"清单保存状态、备注与文件名称，不包含上传文件的二进制内容。换浏览器使用时需要重新添加原文件。"},(state.metadata.title||"制作项目")+"-资料清单.json");toast("清单已导出；上传文件请另行保留原件。");};
$("importButton").onclick=()=>{$("importInput").value="";$("importInput").click();};
function safeImportedState(s){
 if(!s||s.version!==1||s.projectId!==project.id)throw new Error("清单格式或项目不匹配");
 const safe=initialState(project);
 for(const key of Object.keys(safe.metadata))if(typeof s.metadata?.[key]==="string")safe.metadata[key]=s.metadata[key].slice(0,200);
 for(const n of project.nodes){
  if(Array.isArray(s.extras?.[n.id]))safe.extras[n.id]=s.extras[n.id].slice(0,100).filter(i=>typeof i.id==="string"&&i.id.startsWith(n.id+"-extra-")&&typeof i.title==="string"&&kindLabels[i.kind]).map(i=>({id:i.id,title:i.title.slice(0,100),kind:i.kind,defaultAssets:[],required:Boolean(i.required),note:"导入的资料位。"}));
  if(typeof s.notes?.[n.id]==="string")safe.notes[n.id]=s.notes[n.id].slice(0,4000);
  if(typeof s.open?.[n.id]==="boolean")safe.open[n.id]=s.open[n.id];
 }
 const items=project.nodes.flatMap(n=>[...n.items,...(safe.extras[n.id]||[])]);
 for(const it of items){
  if(typeof s.selected?.[it.id]==="boolean")safe.selected[it.id]=s.selected[it.id];
  if(Array.isArray(s.uploads?.[it.id]))safe.uploads[it.id]=s.uploads[it.id].slice(0,50).filter(f=>typeof f.id==="string"&&f.id.startsWith(project.id+"-")&&typeof f.name==="string").map(f=>({id:f.id,name:f.name.slice(0,200),filename:String(f.filename||f.name).slice(0,200),kind:it.kind,bytes:Number(f.bytes)||0,version:"本机添加"}));
 }
 for(const it of items)if(typeof s.chosen?.[it.id]==="string")safe.chosen[it.id]=s.chosen[it.id];
 for(const round of project.characterDesign?.rounds||[]){const chosen=s.designDecisions?.[round.id];if(typeof chosen==="string"&&round.options.some(o=>o.id===chosen))safe.designDecisions[round.id]=chosen;if(typeof s.designOpen?.[round.id]==="boolean")safe.designOpen[round.id]=s.designOpen[round.id];if(typeof s.designDecisions?.[round.id+"-note"]==="string")safe.designDecisions[round.id+"-note"]=s.designDecisions[round.id+"-note"].slice(0,4000);}
 for(const key of Object.keys(safe.plan))if(typeof s.plan?.[key]==="string")safe.plan[key]=s.plan[key].slice(0,150);
 if(!["all","sample"].includes(safe.plan.scope))safe.plan.scope="all";
 if(!["","ai","comic","previs"].includes(safe.plan.route))safe.plan.route="";
 if(!["","post","sync","silent"].includes(safe.plan.audioRoute))safe.plan.audioRoute="";
 safe.checks={continuity:false,voice:false};return safe;
}
$("importInput").onchange=async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  if(file.size>2*1024*1024)throw new Error("清单文件过大");
  const data=JSON.parse(await file.text());if(data.format!=="dear-drama-preproduction-v1"||data.projectId!==project.id)throw new Error("清单格式或项目不匹配");
  state=safeImportedState(data.state);await hydrate();save();fillMetadata();render(false);renderCharacterDesign();document.title=(state.metadata.title||"新作品")+" · 视频前资料工作台";toast("清单已导入；不在当前浏览器的附件需重新添加。");
 }catch(err){toast("导入未完成："+err.message);}
};
$("projectSelect").innerHTML=DATA.projects.map(p=>'<option value="'+p.id+'">'+escape(p.metadata.title+" · "+p.metadata.episode)+'</option>').join("");
$("projectSelect").onchange=e=>switchProject(e.target.value);

function renderCharacterDesign(){
 const design=project.characterDesign,root=$("characterDesign");if(!design){root.hidden=true;return;}root.hidden=false;
 if(root.dataset.projectId===project.id)root.querySelectorAll("[data-round-panel]").forEach(d=>{state.designOpen[d.dataset.roundPanel]=d.open;});
 root.dataset.projectId=project.id;
 root.innerHTML='<div class="design-heading"><div><span class="eyebrow">CHARACTER DESIGN / 多轮选择</span><h2>'+escape(design.title||"角色设计")+'</h2><p>'+escape((design.expectations||[]).join(" · "))+'</p>'+((design.locked||[]).length?'<p><strong>已确认保留项：</strong>'+escape(design.locked.join('；'))+'</p>':'')+'</div><button class="button secondary" data-export-decisions>导出选择记录</button></div>'+ (design.rounds||[]).map(round=>'<details class="design-round" data-round-panel="'+escape(round.id)+'" '+((state.designOpen[round.id]??round.id==="R1")?'open':'')+'><summary>'+escape(round.id+' · '+round.title)+'<span>'+escape(state.designDecisions[round.id]||"等待选择")+'</span></summary><div class="direction-grid">'+(round.options||[]).map(option=>'<article class="direction-card '+(state.designDecisions[round.id]===option.id?'picked':'')+'"><h3>'+escape(option.id+' · '+option.title)+'</h3><p>'+escape(option.detail||"等待补充完整方向卡。")+'</p>'+((option.assetIds||[]).map(id=>{const a=ASSETS[id];return a&&a.kind==='image'?'<button class="preview-thumb" data-view="'+escape(id)+'"><img src="'+escape(fileURL(a))+'" alt="'+escape(a.name)+'"></button>':''}).join('')||'<div class="direction-placeholder">视觉小样等待添加</div>')+'<button class="button secondary small" '+(option.pending?'disabled':'')+' data-direction="'+escape(option.id)+'" data-round="'+escape(round.id)+'">'+(state.designDecisions[round.id]===option.id?'当前暂选':'暂选此方案')+'</button></article>').join('')+'</div>'+(!round.options?.length?'<p class="direction-placeholder">本轮方案等待设计 Skill 补充。</p>':'')+'<label class="design-note">保留、修改或组合要求<textarea data-design-note="'+escape(round.id)+'" placeholder="例如：D02的脸＋D04的外套；右眉缺口保留。">'+escape(state.designDecisions[round.id+'-note']||'')+'</textarea></label></details>').join('')+'<p class="gate-help">这里记录你的暂选与要求，不调用生成工具，不自动替换正式母版。导出记录后可交给 Codex 继续细化。</p>';
 root.querySelectorAll('[data-round-panel]').forEach(d=>d.addEventListener('toggle',()=>{if(!d.isConnected)return;state.designOpen[d.dataset.roundPanel]=d.open;save();}));
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.direction){state.designDecisions[b.dataset.round]=b.dataset.direction;state.checks.continuity=false;save();renderCharacterDesign();}if(b.hasAttribute('data-export-decisions'))downloadJSON({format:'dear-cg-design-decisions-v1',projectId:project.id,characterId:project.characterDesign?.characterId,decisions:state.designDecisions,source:'用户在当前网页的暂选记录；正式采用与资产检查需在创作对话中核对。',exportedAt:new Date().toISOString()},'角色多轮选择记录.json');});
document.addEventListener('input',e=>{if(e.target.dataset.designNote){state.designDecisions[e.target.dataset.designNote+'-note']=e.target.value;save();}});

async function start(){
 db=await initDB();let startID=DATA.projects[0].id;try{const stored=localStorage.getItem("dear-drama-last-project");if(DATA.projects.some(p=>p.id===stored))startID=stored;}catch(e){}
 $("projectSelect").value=startID;await switchProject(startID);if(!storageOK)$("saveState").textContent="本机保存不可用；可导出清单";
 const header=new ResizeObserver(()=>document.documentElement.style.setProperty("--topbar-height",document.querySelector(".topbar").offsetHeight+"px"));header.observe(document.querySelector(".topbar"));
}
start();
})();
