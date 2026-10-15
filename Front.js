const $=s=>document.querySelector(s), sum=a=>a.reduce((x,y)=>x+y,0);
const ZN=[['Hallux',76,44],['1.ª cabeza metatarsiana',70,90],['2.ª–3.ª cabezas metatarsianas',52,86],['4.ª–5.ª cabezas metatarsianas',36,92],['Dedos 2–5',42,40],['Mediopié lateral',38,150],['Talón medial',58,228],['Talón lateral',40,228]];
const RAD=[13,15,15,14,19,15,17,17];
// Silueta plantar: borde medial con arco, talón redondeado y cinco dedos separados
const SOLE='M84 70C90 84 91 100 88 118C85 136 77 148 76 166C75 186 76 202 72 222C70 244 60 258 48 258C34 258 27 244 26 224C25 204 26 186 26 168C26 148 21 128 21 106C20 84 30 68 50 66C62 64 76 62 84 70Z';
const TOES=[[76,44,12,16],[57,34,7,10],[44,40,6.5,9],[33,48,6,8.5],[24,60,5.5,7.5]];
const BASE=[60,95,90,55,25,30,85,80], N=60, T_PEAK=200, T_WARN=170; // umbrales de DEMO
const LV=[{t:'Todo en rango',s:'Sin picos fuera de lo esperado.'},{t:'Vigilar',s:'Algún pico se acerca al umbral.'},{t:'Alerta',s:'Hubo picos por encima del umbral.'}];
const rng=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const today=new Date();today.setHours(0,0,0,0);
const dateOf=i=>{const d=new Date(today);d.setDate(d.getDate()-i);return d};
const fmt=(d,o)=>d.toLocaleDateString('es-MX',o);
const DAYS=[],ALERTS=[];
for(let i=0;i<N;i++){
  const r=rng(i*97+11), f=()=>BASE.map(b=>Math.round(b*(.85+r()*.3)));
  const L=f(),R=f();
  if(r()<.22){const k=[1,2,6,7][Math.floor(r()*4)],a=r()<.5?L:R;a[k]=Math.round(a[k]*1.7)}
  const pk=a=>a.map(v=>Math.round(v*(1.3+r()*.25))), PL=pk(L), PR=pk(R);
  const mx=Math.max(...PL,...PR);
  let lvl=mx>=T_PEAK?2:mx>=T_WARN?1:0;
  if(lvl){const foot=Math.max(...PL)>=Math.max(...PR)?'L':'R',P=foot==='L'?PL:PR,k=P.indexOf(Math.max(...P));
    ALERTS.push({i,kind:'p',foot,k,val:P[k],sev:lvl,h:8+Math.floor(r()*11),m:Math.floor(r()*60),done:i>0&&r()<.6})}
  if(r()<.08){lvl=Math.max(lvl,1);ALERTS.push({i,kind:'t',val:(2.2+r()*.8).toFixed(1),sev:1,h:8+Math.floor(r()*11),m:Math.floor(r()*60),done:i>0})}
  DAYS.push({L,R,PL,PR,mx,lvl,pti:Math.round((sum(L)+sum(R))*.9)});
}
ALERTS.sort((a,b)=>a.i-b.i||b.h-a.h||b.m-a.m);
let tab='map',sel=0,mode='avg',view='map',nd={s:'L',k:7},mo=0;

const HM=[[0,[74,111,227]],[.25,[47,182,168]],[.5,[154,208,74]],[.75,[244,197,66]],[1,[229,72,77]]];
function col(v,mx){const t=Math.max(0,Math.min(v/mx,1));let j=0;while(j<3&&t>HM[j+1][0])j++;
  const a=HM[j],b=HM[j+1],u=(t-a[0])/(b[0]-a[0]);return`rgb(${a[1].map((c,n)=>Math.round(c+(b[1][n]-c)*u))})`}
function foot(side,vals,mx){
  const m=side==='R',X=x=>m?100-x:x,T=m?'transform="translate(100 0) scale(-1 1)"':'';
  const shape=`<path d="${SOLE}"/>`+TOES.map(t=>`<ellipse cx="${t[0]}" cy="${t[1]}" rx="${t[2]}" ry="${t[3]}"/>`).join('');
  return`<svg viewBox="0 0 100 270" role="img" aria-label="Mapa de calor del pie ${m?'derecho':'izquierdo'}"><defs><clipPath id="c${side}" ${T}>${shape}</clipPath><filter id="b${side}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4.5"/></filter></defs>
  <g ${T} fill="var(--accs)">${shape}</g>
  <g clip-path="url(#c${side})"><g filter="url(#b${side})">${ZN.map((z,k)=>`<circle cx="${X(z[1])}" cy="${z[2]}" r="${RAD[k]}" fill="${col(vals[k],mx)}" opacity=".92"/>`).join('')}</g></g>
  <g ${T} fill="none" stroke="var(--mut)" stroke-width="1.1">${shape}</g>`+
  ZN.map((z,k)=>{const on=!!nd&&nd.s===side&&nd.k===k,x=X(z[1]);
    return`<g class="nd" data-act="node" data-s="${side}" data-k="${k}" tabindex="0" role="button" aria-label="${z[0]}"><circle cx="${x}" cy="${z[2]}" r="13" fill="transparent"/><circle cx="${x}" cy="${z[2]}" r="${on?5.5:2.2}" fill="${on?'none':'#1c2333'}" fill-opacity=".55" ${on?'stroke="#fff" stroke-width="2.2"':''}/>${on?`<circle cx="${x}" cy="${z[2]}" r="1.8" fill="#fff"/>`:''}</g>`}).join('')+`</svg>`}

function week(){let h='<div class="week">';
  for(let i=6;i>=0;i--){const d=dateOf(i);h+=`<button class="wd ${i===sel?'on':''}" data-act="day" data-i="${i}">${fmt(d,{weekday:'narrow'})}<b>${d.getDate()}</b><span class="dot l${DAYS[i].lvl}"></span></button>`}
  return h+'</div>'}

function vMap(){
  const d=DAYS[sel],A=[d.L,d.R],P=[d.PL,d.PR],v=mode==='avg'?A:P,mx=mode==='avg'?120:200,
    sL=sum(A[0]),sR=sum(A[1]),pL=Math.round(sL/(sL+sR)*100),n=ALERTS.filter(a=>a.i===sel&&!a.done).length,
    arr=nd?(nd.s==='L'?v[0]:v[1]):null,val=nd?arr[nd.k]:0;
  const sg=(k,items,cur)=>`<div class="seg" role="group">${items.map(i=>`<button class="${cur===i[0]?'on':''}" data-act="${k}" data-m="${i[0]}">${i[1]}</button>`).join('')}</div>`;
  const pc=x=>x>=T_PEAK?'h2':x>=T_WARN?'h1':'';
  const body=view==='map'?`<div class="feet" data-act="clear"><figure>${foot('L',v[0],mx)}Izquierdo</figure><figure>${foot('R',v[1],mx)}Derecho</figure></div>
  <div class="legend"></div><div><span>0 kPa</span><span>${mx/2}</span><span>${mx}+</span></div>
  ${nd?`<p style="margin:14px 0 0"><b>${ZN[nd.k][0]}</b> · pie ${nd.s==='L'?'izquierdo':'derecho'}<br><span class="sub">${val} kPa ${mode==='avg'?'promedio':'de pico'} · ${Math.round(val/sum(arr)*100)}% de la carga de ese pie · toca de nuevo para quitar la selección</span></p>`:`<p class="sub" style="margin:14px 0 0">Toca una zona para ver su detalle.</p>`}`
  :`<div class="tbl"><table><thead><tr><th></th><th colspan="2">Izquierdo</th><th colspan="2">Derecho</th></tr><tr><th>Zona (kPa)</th><th>Prom.</th><th>Pico</th><th>Prom.</th><th>Pico</th></tr></thead><tbody>
  ${ZN.map((z,k)=>`<tr><th>${z[0]}</th><td>${A[0][k]}</td><td class="${pc(P[0][k])}">${P[0][k]}</td><td>${A[1][k]}</td><td class="${pc(P[1][k])}">${P[1][k]}</td></tr>`).join('')}</tbody></table></div>
  <div class="kv"><div><span class="sub">Pico máximo</span><b>${d.mx} kPa</b></div><div><span class="sub">PTI del día</span><b>${d.pti} kPa·h</b></div><div><span class="sub">Carga izq. / der.</span><b>${pL}% / ${100-pL}%</b></div><div><span class="sub">Asimetría</span><b>${Math.abs(2*pL-100)}%</b></div></div>`;
  return`<h1>${sel===0?'Hoy':fmt(dateOf(sel),{weekday:'long'})}</h1><div class="sub">${fmt(dateOf(sel),{day:'numeric',month:'long'})}</div>${week()}
  <div class="card state"><div class="ring l${d.lvl}"></div><div><b style="font-size:18px">${LV[d.lvl].t}</b><div class="sub">${LV[d.lvl].s}<br>Pico máx. ${d.mx} kPa · PTI ${d.pti} kPa·h</div></div></div>
  <div class="card"><h2>Presión por zona</h2><div class="bar">${sg('view',[['map','Mapa'],['tbl','Tabla']],view)}${view==='map'?sg('mode',[['avg','Promedio'],['peak','Pico']],mode):''}</div>${body}</div>
  ${n?`<div class="card"><span class="chip">${n} alerta${n>1?'s':''} sin atender este día</span></div>`:''}
  <div class="note">Datos simulados · umbrales de demostración, sin validación clínica</div>`}

function vCal(){
  const base=new Date(today.getFullYear(),today.getMonth()+mo,1),first=(base.getDay()+6)%7,days=new Date(base.getFullYear(),base.getMonth()+1,0).getDate();
  let c='<span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>'+'<i></i>'.repeat(first);
  for(let n=1;n<=days;n++){const i=Math.round((today-new Date(base.getFullYear(),base.getMonth(),n))/864e5),ok=i>=0&&i<N,l=ok?DAYS[i].lvl:'-';
    c+=`<button class="l${l} ${ok&&i===sel?'on':''}" ${ok?`data-act="pick" data-i="${i}"`:'disabled'} style="${ok?'color:#fff':'color:var(--mut);background:none'}">${n}</button>`}
  const d=DAYS[sel];
  return`<h1>Calendario</h1><div class="sub">Cada día se colorea según su nivel de riesgo</div>
  <div class="card"><div class="nav2"><button data-act="mo" data-d="-1" ${mo<=-2?'disabled':''} aria-label="Mes anterior">‹</button><b style="text-transform:capitalize">${fmt(base,{month:'long',year:'numeric'})}</b><button data-act="mo" data-d="1" ${mo>=0?'disabled':''} aria-label="Mes siguiente">›</button></div>
  <div class="cal">${c}</div>
  <div class="sub" style="margin-top:12px"><span class="dot l0"></span> En rango &nbsp;<span class="dot l1"></span> Vigilar &nbsp;<span class="dot l2"></span> Alerta</div></div>
  <div class="card"><b>${fmt(dateOf(sel),{weekday:'long',day:'numeric',month:'long'})}</b><div class="sub">${LV[d.lvl].t} · pico máx. ${d.mx} kPa · PTI ${d.pti} kPa·h</div>
  <p style="margin:10px 0 0"><button class="chip" data-act="tab" data-t="map">Ver mapa de este día</button></p></div>`}

function vAl(){
  let h='',last=-1;const p=ALERTS.filter(a=>!a.done).length;
  ALERTS.forEach((a,x)=>{
    if(a.i!==last){last=a.i;h+=`<div class="sub" style="margin-top:14px;text-transform:capitalize">${a.i===0?'Hoy':fmt(dateOf(a.i),{weekday:'long',day:'numeric',month:'short'})}</div>`}
    const t=a.kind==='p'?`Pico de ${a.val} kPa · ${ZN[a.k][0]} ${a.foot==='L'?'izq.':'der.'}`:`Diferencia de ${a.val} °C entre pies`;
    const tip=a.kind==='p'?`Alivia la presión en esa zona: cambia de postura o descansa unos minutos.`:`Revisa tus pies y avisa a tu equipo clínico si persiste.`;
    h+=`<div class="al ${a.done?'done':''}"><span class="dot l${a.sev}"></span><div style="flex:1"><b>${t}</b><div class="sub">${tip}</div><div class="sub">${String(a.h).padStart(2,'0')}:${String(a.m).padStart(2,'0')}</div></div><button class="chip" data-act="att" data-x="${x}">${a.done?'Reabrir':'Atendida'}</button></div>`});
  return`<h1>Alertas</h1><div class="sub">${p} sin atender</div><div class="card" style="padding-top:4px">${h}</div>`}

function render(){
  $('#app').innerHTML=({map:vMap,cal:vCal,al:vAl})[tab]();
  const p=ALERTS.filter(a=>!a.done).length;
  $('#nav div').innerHTML=[['map','<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>','Mapa'],['cal','<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>','Calendario'],['al','<path d="M6 17V11a6 6 0 0112 0v6l1.5 2h-15z"/><path d="M10 21h4"/>','Alertas'+(p?` (${p})`:'')]].map(t=>`<button class="${tab===t[0]?'on':''}" ${tab===t[0]?'aria-current="page"':''} data-act="tab" data-t="${t[0]}"><svg class="ic" viewBox="0 0 24 24">${t[1]}</svg>${t[2]}</button>`).join('')}

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;const D=b.dataset;
  if(D.act==='tab')tab=D.t;
  else if(D.act==='day')sel=+D.i;
  else if(D.act==='pick')sel=+D.i;
  else if(D.act==='mode')mode=D.m;
  else if(D.act==='view')view=D.m;
  else if(D.act==='node')nd=nd&&nd.s===D.s&&nd.k===+D.k?null:{s:D.s,k:+D.k};
  else if(D.act==='clear')nd=null;
  else if(D.act==='mo')mo+=+D.d;
  else if(D.act==='att')ALERTS[+D.x].done=!ALERTS[+D.x].done;
  render()});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset&&e.target.dataset.act==='node')e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}))});
render();
