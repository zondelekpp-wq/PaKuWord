/* PaKuWord service worker – offline, monthly updates, optional daily reminder */
importScripts('version.js','catalog.js');
const BUILD=2; // raise for fixes between monthly releases
const CACHE='pakuword-'+self.PW_VERSION+'-'+BUILD;
const CORE=['./','index.html','styles.css','app.js','i18n.js','categories.js','figures.js','family.js','version.js','catalog.js','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable.png','qr.png','qr.svg'];
const FILES=CORE.concat(self.PW_FILES||[]);
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE&&n!=='pakuword-state').map(n=>caches.delete(n)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==location.origin)return;
  e.respondWith(caches.open(CACHE).then(c=>c.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{
    if(res.ok)c.put(e.request,res.clone());return res;}).catch(()=>c.match('index.html')))));
});
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
async function maybeNotify(){
  try{
    const c=await caches.open('pakuword-state');const r=await c.match('./__notify');if(!r)return;
    const st=await r.json();if(!st.time)return;
    const now=new Date(),[h,m]=st.time.split(':').map(Number),d=today();
    if(now.getHours()*60+now.getMinutes()<h*60+m)return;
    const lr=await c.match('./__notify_last');const last=lr?await lr.text():'';
    if(st.seen===d||last===d)return;
    await self.registration.showNotification(st.title,{body:st.body,icon:'icon-192.png',tag:'pakuword'});
    await c.put('./__notify_last',new Response(d));
  }catch(e){}
}
self.addEventListener('periodicsync',e=>{if(e.tag==='pakuword-daily')e.waitUntil(maybeNotify());});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window'}).then(cs=>cs.length?cs[0].focus():self.clients.openWindow('./')));});
