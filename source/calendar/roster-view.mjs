const styles = `
:root{color-scheme:light dark;--bg:#f3f6fc;--paper:#fff;--ink:#152640;--muted:#50617b;--line:#d9e3f3;--blue:#1951bb;--tint:#e9f1ff;--on:#fff;font:100%/1.55 system-ui,"PingFang TC","Microsoft JhengHei",sans-serif}
@media(prefers-color-scheme:dark){:root{--bg:#101827;--paper:#17243a;--ink:#eff5ff;--muted:#bac8e0;--line:#354760;--blue:#a3c5ff;--tint:#253f67;--on:#112245}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink)}[hidden]{display:none!important}a{color:var(--blue)}button,select,input{font:inherit}button,select,.action{min-height:44px}button,.action{cursor:pointer}button:disabled,.button[aria-disabled=true]{cursor:default;opacity:.55}:focus-visible{outline:3px solid var(--blue);outline-offset:2px}h1,h2,h3,p,ul{margin:0}.wrap{width:min(1050px,calc(100% - 32px));margin:auto}.mast{background:var(--paper);border-bottom:1px solid var(--line);padding:14px 0}.brand{display:flex;align-items:center;gap:12px}.badge{display:grid;place-items:center;border-radius:10px;background:#205bd2;color:white;width:40px;height:40px;font-size:.8rem;font-weight:800}.mast small{display:block;color:var(--muted)}main{padding:30px 0 48px}h1{font-size:clamp(1.8rem,5vw,2.6rem);line-height:1.2;letter-spacing:-.035em}.intro{margin-top:8px;color:var(--muted)}.toolbar{display:flex;align-items:end;gap:12px;flex-wrap:wrap;margin:20px 0 14px}.toolbar label{display:grid;gap:5px;font-weight:650}.toolbar select{min-width:200px;padding:5px 12px;border:1px solid var(--line);border-radius:9px;background:var(--paper);color:var(--ink)}.button,.action{display:inline-flex;align-items:center;justify-content:center;text-align:center;padding:8px 14px;border:1px solid var(--line);border-radius:9px;background:var(--paper);color:var(--ink);text-decoration:none;font-weight:640}.primary{background:var(--blue);border-color:var(--blue);color:var(--on)}.status{color:var(--muted);font-size:.9rem;min-height:1.4em;margin-bottom:14px}.board{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:14px;align-items:start}.panel{min-width:0;background:var(--paper);border:1px solid var(--line);border-radius:16px;padding:16px}.month{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:12px}.month h2,h2{font-size:1.15rem}.week,.grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;text-align:center}.week{color:var(--muted);font-size:.88rem;padding-bottom:5px}.cell{display:flex;min-width:0;min-height:53px;flex-direction:column;justify-content:center;align-items:center;padding:3px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--muted);line-height:1.2}.cell.event{background:var(--tint);color:var(--blue);font-weight:700}.cell[aria-pressed=true]{border:2px solid var(--blue)}.cell[aria-current=date]{text-decoration:underline}.cell .short{font-size:.7rem;line-height:1.3}.agenda{display:grid;gap:12px;margin-top:11px}.shift{border:1px solid var(--line);border-radius:10px;padding:11px}.shift.active{border-color:var(--blue)}.shift h3{font-size:1rem}.shift p{margin-top:5px;color:var(--muted);font-size:.9rem}.roles{list-style:none;padding:0;margin-top:6px;display:grid;gap:4px}.roles li{display:flex;gap:9px;align-items:baseline}.roles span{color:var(--muted);flex:0 0 6.3em}.shift details{margin-top:7px}.shift summary{cursor:pointer;color:var(--blue)}.footnote{margin-top:16px;color:var(--muted);font-size:.85rem}
@media(max-width:700px){.board{grid-template-columns:1fr}.wrap{width:calc(100% - 22px)}main{padding-top:20px}.panel{padding:11px}.toolbar label{width:100%}.toolbar select{width:100%}.toolbar>.button{width:100%}.month .button{padding:5px 8px;font-size:.88rem}.cell{min-height:46px}.week,.grid{gap:2px}}
.home-link{margin-inline-start:auto;flex:none;font-size:.875rem}
.subscription-help{margin-bottom:14px;padding:10px 12px;border-radius:9px;background:var(--tint);font-size:.9rem}
.subscription-help p{margin-bottom:6px}.subscription-help input{display:block;width:100%;margin:6px 0}.subscription-help output{display:block}
.embedded{background:transparent}
.embedded main{width:100%;padding:0 0 12px}
.embedded main>h1{display:none}
.embedded .intro{margin-top:0}
`;

function runPage(data, calendarPeriod) {
  const byId = id => document.getElementById(id);
  function node(tag, label, css) {
    const element = document.createElement(tag);
    if(label) element.textContent=label;
    if(css) element.className=css;
    return element;
  }
  const monthName=byId('month-name');
  const calendar=byId('days');
  const agenda=byId('agenda');
  const names=byId('names');
  const add=byId('google');
  const status=byId('selection-status');
  const help=byId('subscription-help');
  const copy=byId('copy-subscription');
  const copyResult=byId('copy-result');
  const feedField=byId('subscription-url');
  let subscriptionUrl='';
  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const months=[...new Set(data.schedule.map(day=>day.date.slice(0,7)))];
  let month=Math.max(0,months.indexOf(today.slice(0,7)));
  if(today>data.schedule.at(-1).date) month=months.length-1;
  let selectedDay='';
  data.members.forEach((name,index)=>{const option=node('option',name);option.value=String(index);names.append(option);});
  const selectedName=()=>names.value===''?'':data.members[Number(names.value)];
  const dateText=date=>Number(date.slice(5,7))+' 月 '+Number(date.slice(8))+' 日';
  const match=day=>!selectedName() || [...day.roles,...(day.backup||[])].some(([,name])=>name===selectedName());
  const upcoming=day=>day.date>=today;
  function showDay(day) {
    const active=day.date===selectedDay;
    const item=node('article','',active?'shift active':'shift');
    item.id='day-'+day.date;
    item.append(node('h3',dateText(day.date)+' · '+day.title));
    item.append(node('p',(day.canceled?'已取消 · ':'')+day.place+' · '+day.start+(day.end?'–'+day.end:' 集合')));
    const addRoles=(entries,parent)=>{
      const list=node('ul','','roles');
      for(const [role,name] of entries) {
        if(selectedName() && name!==selectedName()) continue;
        const row=node('li'); row.append(node('span',role),node('strong',name)); list.append(row);
      }
      if(list.children.length) parent.append(list);
    };
    addRoles(day.roles,item);
    if(day.note) item.append(node('p',day.note));
    if(day.openRoles && !selectedName()) item.append(node('p',day.openRoles));
    if(day.backup && (!selectedName() || day.backup.some(([,person])=>person===selectedName()))) {
      const more=node('details');more.append(node('summary','備案班表')); addRoles(day.backup,more); item.append(more);
    }
    return item;
  }
  function render() {
    const current=months[month];
    const [year,num]=current.split('-').map(Number);
    monthName.textContent=year+' 年 '+num+' 月';
    byId('previous').disabled=month===0;
    byId('next').disabled=month===months.length-1;
    const visible=data.schedule.filter(day=>day.date.startsWith(current)&&match(day));
    if(!visible.some(day=>day.date===selectedDay)) selectedDay=(visible.find(upcoming)||visible[0])?.date||'';
    const relevant=new Map(visible.map(day=>[day.date,day]));
    const cells=[];
    for(let i=0;i<new Date(Date.UTC(year,num-1,1)).getUTCDay();i++) cells.push(node('span','','cell'));
    for(let day=1;day<=new Date(Date.UTC(year,num,0)).getUTCDate();day++) {
      const date=current+'-'+String(day).padStart(2,'0');
      const event=relevant.get(date);
      const cell=node(event?'button':'span',String(day),event?'cell event':'cell');
      if(date===today) cell.setAttribute('aria-current','date');
      if(event) {
        cell.type='button';cell.setAttribute('aria-pressed',String(date===selectedDay));
        cell.setAttribute('aria-label',dateText(date)+' '+event.title+(event.canceled?' 已取消':''));
        cell.append(node('small',event.canceled?'取消':event.title==='週六晚崇拜'?'晚崇':'活動','short'));
        cell.addEventListener('click',()=>{selectedDay=date;render();document.getElementById('day-'+date)?.scrollIntoView({block:'nearest'});calendar.querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});});
      }
      cells.push(cell);
    }
    calendar.replaceChildren(...cells);
    agenda.replaceChildren(...(visible.length?visible.map(showDay):[node('p','這個月沒有符合的班次。')]));
    const period=calendarPeriod(current+'-01');
    const name=selectedName();
    const count=name ? data.schedule.filter(day=>calendarPeriod(day.date)===period &&
      !day.canceled && day.roles.some(([,person])=>person===name)).length : 0;
    const path=count ? data.feedLinks[period]?.[names.value] : null;
    const nextUrl=path ? new URL(path,location.origin).href : '';
    if(nextUrl!==subscriptionUrl) {
      help.hidden=true;
      feedField.hidden=true;
      copyResult.textContent='';
    }
    subscriptionUrl=nextUrl;
    const canSubscribe=Boolean(subscriptionUrl);
    add.setAttribute('aria-disabled',String(!canSubscribe));
    if(canSubscribe) {
      const feed=new URL(subscriptionUrl);
      const google=new URL('https://calendar.google.com/calendar/render');
      google.searchParams.set('cid','webcal://'+feed.host+feed.pathname);
      add.href=google.href;
      add.removeAttribute('tabindex');
    } else {
      add.removeAttribute('href');
      add.tabIndex=-1;
    }
    status.textContent=name
      ? name+' · '+count+' 筆確定班次（'+period.slice(0,4)+' 年第 '+period.slice(-1)+' 季）'
      : '選擇姓名後，即可一次加入整季的確定班次。';
  }
  names.addEventListener('change',()=>{selectedDay='';render();});
  byId('previous').addEventListener('click',()=>{month--;selectedDay='';render();});
  byId('next').addEventListener('click',()=>{month++;selectedDay='';render();});
  add.addEventListener('click',()=>{
    if(subscriptionUrl) help.hidden=false;
  });
  copy.addEventListener('click',async()=>{
    try {
      await navigator.clipboard.writeText(subscriptionUrl);
      copyResult.textContent='已複製這一季的班表網址。';
    } catch {
      feedField.value=subscriptionUrl;
      feedField.hidden=false;
      feedField.select();
      copyResult.textContent='請複製選取的班表網址。';
    }
  });
  render();
}

function shell(content, script='', embedded=false) {
  const mast='<header class="mast"><div class="wrap brand"><span class="badge" aria-hidden="true">CLC</span><div><strong>安總服事</strong><small>江子翠行道會</small></div><a class="action home-link" href="./">回安總首頁</a></div></header>';
  return '<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>CLC 安總同工班表</title><style>'+styles+'</style></head>'
    +(embedded?'<body class="embedded">':'<body>'+mast)+'<main class="wrap">'+content+'</main>'+script+'</body></html>';
}
function reportEmbeddedHeight(origin) {
  if(window.parent===window)return;
  let lastHeight=0;
  const report=()=>{
    const height=Math.ceil(document.body.getBoundingClientRect().height);
    if(height===lastHeight)return;
    lastHeight=height;
    window.parent.postMessage({type:'clc-roster-height',height},origin);
  };
  new ResizeObserver(report).observe(document.body);
  report();
}
const page = `<h1>安總同工班表</h1><p class="intro">週六晚崇拜班表 · 台北時間</p>
<div class="toolbar"><label for="names">同工姓名<select id="names"><option value="">全部同工</option></select></label><a class="button primary" id="google" target="_blank" rel="noopener noreferrer" aria-disabled="true" tabindex="-1">將整季班表加入我的 Google 行事曆</a></div><p class="status" id="selection-status" aria-live="polite"></p><div class="subscription-help" id="subscription-help" hidden>
<p>在 Google 行事曆確認新增後，整季班次會出現在「其他日曆」。</p>
<p>若沒有看到新增畫面，請在電腦版 Google 行事曆選「其他日曆 → 透過網址」，貼上班表網址。</p>
<button class="button" id="copy-subscription" type="button">複製班表網址</button>
<input id="subscription-url" type="url" aria-label="班表訂閱網址" readonly hidden><output id="copy-result" aria-live="polite"></output></div>
<div class="board"><section class="panel" aria-labelledby="month-name"><div class="month"><button type="button" class="button" id="previous">上個月</button><h2 id="month-name" aria-live="polite"></h2><button type="button" class="button" id="next">下個月</button></div><div class="week" aria-hidden="true"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div><div class="grid" id="days"></div></section><section class="panel" aria-labelledby="agenda-title"><h2 id="agenda-title">本月班次</h2><div id="agenda" class="agenda"></div></section></div>
<p class="footnote">已取消和備案班次僅供查閱。</p>`;


export { shell, page };
export const browserSource = {"reportEmbeddedHeight":"function reportEmbeddedHeight(origin) {\n  if(window.parent===window)return;\n  let lastHeight=0;\n  const report=()=>{\n    const height=Math.ceil(document.body.getBoundingClientRect().height);\n    if(height===lastHeight)return;\n    lastHeight=height;\n    window.parent.postMessage({type:'clc-roster-height',height},origin);\n  };\n  new ResizeObserver(report).observe(document.body);\n  report();\n}","runPage":"function runPage(data, calendarPeriod) {\n  const byId = id => document.getElementById(id);\n  function node(tag, label, css) {\n    const element = document.createElement(tag);\n    if(label) element.textContent=label;\n    if(css) element.className=css;\n    return element;\n  }\n  const monthName=byId('month-name');\n  const calendar=byId('days');\n  const agenda=byId('agenda');\n  const names=byId('names');\n  const add=byId('google');\n  const status=byId('selection-status');\n  const help=byId('subscription-help');\n  const copy=byId('copy-subscription');\n  const copyResult=byId('copy-result');\n  const feedField=byId('subscription-url');\n  let subscriptionUrl='';\n  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());\n  const months=[...new Set(data.schedule.map(day=>day.date.slice(0,7)))];\n  let month=Math.max(0,months.indexOf(today.slice(0,7)));\n  if(today>data.schedule.at(-1).date) month=months.length-1;\n  let selectedDay='';\n  data.members.forEach((name,index)=>{const option=node('option',name);option.value=String(index);names.append(option);});\n  const selectedName=()=>names.value===''?'':data.members[Number(names.value)];\n  const dateText=date=>Number(date.slice(5,7))+' 月 '+Number(date.slice(8))+' 日';\n  const match=day=>!selectedName() || [...day.roles,...(day.backup||[])].some(([,name])=>name===selectedName());\n  const upcoming=day=>day.date>=today;\n  function showDay(day) {\n    const active=day.date===selectedDay;\n    const item=node('article','',active?'shift active':'shift');\n    item.id='day-'+day.date;\n    item.append(node('h3',dateText(day.date)+' · '+day.title));\n    item.append(node('p',(day.canceled?'已取消 · ':'')+day.place+' · '+day.start+(day.end?'–'+day.end:' 集合')));\n    const addRoles=(entries,parent)=>{\n      const list=node('ul','','roles');\n      for(const [role,name] of entries) {\n        if(selectedName() && name!==selectedName()) continue;\n        const row=node('li'); row.append(node('span',role),node('strong',name)); list.append(row);\n      }\n      if(list.children.length) parent.append(list);\n    };\n    addRoles(day.roles,item);\n    if(day.note) item.append(node('p',day.note));\n    if(day.openRoles && !selectedName()) item.append(node('p',day.openRoles));\n    if(day.backup && (!selectedName() || day.backup.some(([,person])=>person===selectedName()))) {\n      const more=node('details');more.append(node('summary','備案班表')); addRoles(day.backup,more); item.append(more);\n    }\n    return item;\n  }\n  function render() {\n    const current=months[month];\n    const [year,num]=current.split('-').map(Number);\n    monthName.textContent=year+' 年 '+num+' 月';\n    byId('previous').disabled=month===0;\n    byId('next').disabled=month===months.length-1;\n    const visible=data.schedule.filter(day=>day.date.startsWith(current)&&match(day));\n    if(!visible.some(day=>day.date===selectedDay)) selectedDay=(visible.find(upcoming)||visible[0])?.date||'';\n    const relevant=new Map(visible.map(day=>[day.date,day]));\n    const cells=[];\n    for(let i=0;i<new Date(Date.UTC(year,num-1,1)).getUTCDay();i++) cells.push(node('span','','cell'));\n    for(let day=1;day<=new Date(Date.UTC(year,num,0)).getUTCDate();day++) {\n      const date=current+'-'+String(day).padStart(2,'0');\n      const event=relevant.get(date);\n      const cell=node(event?'button':'span',String(day),event?'cell event':'cell');\n      if(date===today) cell.setAttribute('aria-current','date');\n      if(event) {\n        cell.type='button';cell.setAttribute('aria-pressed',String(date===selectedDay));\n        cell.setAttribute('aria-label',dateText(date)+' '+event.title+(event.canceled?' 已取消':''));\n        cell.append(node('small',event.canceled?'取消':event.title==='週六晚崇拜'?'晚崇':'活動','short'));\n        cell.addEventListener('click',()=>{selectedDay=date;render();document.getElementById('day-'+date)?.scrollIntoView({block:'nearest'});calendar.querySelector('[aria-pressed=\"true\"]')?.focus({preventScroll:true});});\n      }\n      cells.push(cell);\n    }\n    calendar.replaceChildren(...cells);\n    agenda.replaceChildren(...(visible.length?visible.map(showDay):[node('p','這個月沒有符合的班次。')]));\n    const period=calendarPeriod(current+'-01');\n    const name=selectedName();\n    const count=name ? data.schedule.filter(day=>calendarPeriod(day.date)===period &&\n      !day.canceled && day.roles.some(([,person])=>person===name)).length : 0;\n    const path=count ? data.feedLinks[period]?.[names.value] : null;\n    const nextUrl=path ? new URL(path,location.origin).href : '';\n    if(nextUrl!==subscriptionUrl) {\n      help.hidden=true;\n      feedField.hidden=true;\n      copyResult.textContent='';\n    }\n    subscriptionUrl=nextUrl;\n    const canSubscribe=Boolean(subscriptionUrl);\n    add.setAttribute('aria-disabled',String(!canSubscribe));\n    if(canSubscribe) {\n      const feed=new URL(subscriptionUrl);\n      const google=new URL('https://calendar.google.com/calendar/render');\n      google.searchParams.set('cid','webcal://'+feed.host+feed.pathname);\n      add.href=google.href;\n      add.removeAttribute('tabindex');\n    } else {\n      add.removeAttribute('href');\n      add.tabIndex=-1;\n    }\n    status.textContent=name\n      ? name+' · '+count+' 筆確定班次（'+period.slice(0,4)+' 年第 '+period.slice(-1)+' 季）'\n      : '選擇姓名後，即可一次加入整季的確定班次。';\n  }\n  names.addEventListener('change',()=>{selectedDay='';render();});\n  byId('previous').addEventListener('click',()=>{month--;selectedDay='';render();});\n  byId('next').addEventListener('click',()=>{month++;selectedDay='';render();});\n  add.addEventListener('click',()=>{\n    if(subscriptionUrl) help.hidden=false;\n  });\n  copy.addEventListener('click',async()=>{\n    try {\n      await navigator.clipboard.writeText(subscriptionUrl);\n      copyResult.textContent='已複製這一季的班表網址。';\n    } catch {\n      feedField.value=subscriptionUrl;\n      feedField.hidden=false;\n      feedField.select();\n      copyResult.textContent='請複製選取的班表網址。';\n    }\n  });\n  render();\n}","calendarPeriod":"function calendarPeriod(date) {\n  return date.slice(0, 4) + '-' + Math.ceil(Number(date.slice(5, 7)) / 3);\n}"};
