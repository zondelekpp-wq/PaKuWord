/* PaKuWord – app logic. © 2026 Piotr Żondełek. All rights reserved. */
'use strict';
(function(){
const LANGS=['en','pl','de','es','fr','zh','uk','lv'];
const TTS={en:'en-GB',pl:'pl-PL',de:'de-DE',es:'es-ES',fr:'fr-FR',zh:'zh-CN',uk:'uk-UA',lv:'lv-LV'};
const INT=[1,3,7,30,90];               // spaced repetition intervals (days)
const BADGES=[10,50,100,250,500,1000];
const KEY='pakuword.state.v1';
const APP_URL='https://zondelekpp-wq.github.io/PaKuWord/';
const COFFEE='https://buymeacoffee.com/Hieronim';
const FAM=window.PaKuFamily||null;           // shared PaKu family file; PaKuWord works fully without it
const SELF='word';
const ACCENTS=['#5B4BC4','#138A8A','#D9534F','#C98A12','#3C8D40','#2F6FD6'];
const CATS=()=>window.PW_CATS||{};
const catIc=c=>{const k=CATS()[c];if(k&&k.svg)return `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${k.svg}</svg>`;return svg((k&&k.icon)||'card');};
const FIGS=window.PW_FIG, TOTAL=FIGS.length; // 50 figures + "You" = 51 stages

const DEF=()=>({lang:'en',learn:'off',mode:'random',cats:['med','law','gen','psy','biz'],stageLen:20,notify:'',
  anim:(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)?'calm':'full',junior:false,theme:'light',accent:'#5B4BC4',learned:{},days:[],steps:0,earned:0,lastStepDay:'',
  today:{date:'',ids:[],rev:[]},cycle:[],lastCat:'',badges:[],fam:{},avatar:'unicorn',autoread:false,rate:'normal',seenVer:''});
let S=load();
let view='today', overlay=null, deferredPrompt=null, resetArm=false, rv=null, libQ='';
const queue=[], openMore=new Set(), freshReveal=new Set();

/* ---------- storage & helpers ---------- */
function load(){try{const o=JSON.parse(localStorage.getItem(KEY)||'{}');return Object.assign(DEF(),o);}catch(e){return DEF();}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){} writeNotifyCache();}
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function todayStr(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function dayNum(s){const [y,m,d]=s.split('-').map(Number);return Math.round(Date.UTC(y,m-1,d)/864e5);}
const daysBetween=(a,b)=>dayNum(b)-dayNum(a);
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function T(){return window.PW_I18N[S.lang]||window.PW_I18N.en;}
function t(k,v){let s=T()[k];if(s==null)s=window.PW_I18N.en[k];if(s==null)return k;if(v)for(const x in v)s=String(s).split('{'+x+'}').join(v[x]);return s;}
const cLang=()=>window.PW_CONTENT[S.lang]?S.lang:'en';
const pack=l=>window.PW_CONTENT[l]||[];
const getE=(id,l)=>pack(l||cLang()).find(e=>e.id===id);
const catName=c=>{const k=CATS()[c];return (k&&k.n&&(k.n[S.lang]||k.n.en))||(T().cats&&T().cats[c])||c;};
const animLvl=()=>S.anim;
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
const wordsN=()=>Object.keys(S.learned).length;

/* ---------- icons (one line style, drawn for PaKuWord) ---------- */
const IC={
 scroll:'<path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7"/><path d="M6 4a2 2 0 0 0-2 2v1h4V6a2 2 0 0 0-2-2zM7 20a2 2 0 0 1-2-2V7"/><path d="M10 9h6M10 13h6"/>',
 staff:'<path d="M12 3v18"/><path d="M9 7c0-1.6 6-1.6 6 0s-6 2-6 4 6 1.4 6 3.2-6 1.8-6 3.8"/><circle cx="12" cy="3.5" r="1"/>',
 geometry:'<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4"/>',
 planet:'<circle cx="12" cy="12" r="4.5"/><ellipse cx="12" cy="12" rx="10.5" ry="3.6" transform="rotate(-22 12 12)"/>',
 star:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
 numbers:'<path d="M4 8l2-1.5V17M3.5 17h5"/><path d="M11 9.5a2.2 2.2 0 1 1 3.6 1.7L11 17h4.5"/><path d="M17.5 7.5h3l-2 3.2a2.4 2.4 0 1 1-1.8 4.6"/>',
 quill:'<path d="M20 4C12 4 7 9 5 20"/><path d="M20 4c0 6-4 10-10 11"/><path d="M9 11.5h5"/>',
 herb:'<path d="M12 21V9"/><path d="M12 14c-4 0-6-3-6-6.5 4 0 6 3 6 6.5zM12 11c0-4 2-6.5 6-6.5 0 4-2 6.5-6 6.5z"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3.2 3 3.2 15 0 18M12 3c-3.2 3-3.2 15 0 18"/>',
 press:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7.5 18l4.5-12 4.5 12M9.2 13.5h5.6"/>',
 brush:'<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5S14 15 15 15h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="11" r="1.1"/><circle cx="10" cy="7" r="1.1"/><circle cx="15" cy="7.5" r="1.1"/>',
 telescope:'<path d="M3 13.5l11.5-6 2 3.8L5 17.3z"/><path d="M14.5 7.5l3.2-1.7 2 3.8-3.2 1.7"/><path d="M10 15.5L8 21M11 15l3 6"/>',
 apple:'<path d="M12 7.5c-2-1.5-7.5-1.2-7.5 5 0 4 3 8 5 8 1 0 1.5-.5 2.5-.5s1.5.5 2.5.5c2 0 5-4 5-8 0-6.2-5.5-6.5-7.5-5z"/><path d="M12 7.5c0-2 1-3.5 3-4.5"/>',
 flask:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7.3 15h9.4"/>',
 note:'<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
 fossil:'<path d="M12 12.5a1 1 0 1 1 1-1 2.5 2.5 0 1 1-3.5 2.2 4 4 0 1 1 6.2-4.7 5.6 5.6 0 1 1-9.4 5.5A7.5 7.5 0 0 1 12 3"/>',
 bird:'<path d="M3.5 15c3 0 5.5-2 6.5-5 .8-2.5 3-4 5.3-4L18 7.5l3 .8-3 1.4c-.4 5.2-4.3 9-10 9.3L4 20z"/><circle cx="15.5" cy="8" r=".6"/>',
 gear:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
 lamp:'<path d="M3.5 14.5h13a3.5 3.5 0 0 0 3.5-3.5h-4.5l-3-3H7a3.5 3.5 0 0 0-3.5 3.5z"/><path d="M7.5 18h9M12 8V6"/><path d="M20 11c0-2 .8-3 2-4"/>',
 pea:'<path d="M3.5 18.5C7.5 8 16 4 20.5 5.5c-1.8 4.6-8.5 13-17 13z"/><circle cx="9.5" cy="13.5" r="1.4"/><circle cx="13" cy="10.5" r="1.4"/><circle cx="16.3" cy="7.8" r="1.2"/>',
 microscope:'<path d="M5 21h13M8.5 18h7M12.5 18a6 6 0 0 0 4.8-9.3"/><path d="M9 2.8l3 1.2-3 8-3-1.2z"/><path d="M7.6 12.2L7 15h3"/>',
 pot:'<path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M2 10h20M9 6.5c0-1 1-1.5 1-2.5M14 6.5c0-1 1-1.5 1-2.5"/>',
 brain:'<path d="M9.5 4A3 3 0 0 0 6.6 6.6 3 3 0 0 0 4.5 12a3 3 0 0 0 2 5 3 3 0 0 0 5.5 1.2V5.5A2 2 0 0 0 9.5 4zM14.5 4a3 3 0 0 1 2.9 2.6 3 3 0 0 1 2.1 5.4 3 3 0 0 1-2 5 3 3 0 0 1-5.5 1.2"/>',
 bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
 blocks:'<rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/><path d="M12 3l4.5 7.5h-9z"/>',
 pyramid:'<path d="M2 20h20L12 4z"/><path d="M12 4l3.2 16M7 12.5h7"/>',
 atom:'<circle cx="12" cy="12" r="1.6"/><ellipse cx="12" cy="12" rx="10" ry="3.8"/><ellipse cx="12" cy="12" rx="10" ry="3.8" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="3.8" transform="rotate(120 12 12)"/>',
 sigma:'<path d="M18 5H6l6.5 7L6 19h12"/>',
 tree:'<path d="M12 22v-7.5M9.5 18l2.5-2 2.5 2"/><path d="M12 15c-5 0-8-3-8-6.2a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 3.2-3 6.2-8 6.2z"/>',
 you:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/><path d="M19 2.5l.7 1.6 1.7.2-1.3 1.1.4 1.7-1.5-.9-1.5.9.4-1.7-1.3-1.1 1.7-.2z"/>',
 scale:'<path d="M12 3v18M7 21h10M5 7h14M12 5l-7 2M12 5l7 2"/><path d="M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/>',
 chat:'<path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
 chart:'<path d="M4 20V10M10 20V5M16 20v-8M3 20h18"/><path d="M15 6l3-2 3 1"/>',
 card:'<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 8h8M8 12h8M8 16h5"/>',
 road:'<path d="M6 21c0-5 12-4 12-9S6 8 6 3"/><circle cx="6" cy="3" r="1.5"/><circle cx="18" cy="12" r="1.5"/><circle cx="6" cy="21" r="1.5"/>',
 grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
 loop:'<path d="M20 11a8 8 0 0 0-14.5-4.5L4 8"/><path d="M4 3.5V8h4.5"/><path d="M4 13a8 8 0 0 0 14.5 4.5L20 16"/><path d="M20 20.5V16h-4.5"/>',
 book:'<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 19V4.5M8 6h8"/>',
 cog:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
 menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 speaker:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
};
const svg=(n,c)=>`<svg class="ic ${c||''}" viewBox="0 0 24 24" aria-hidden="true">${IC[n]||IC.star}</svg>`;

/* ---------- mascot: a cheerful brain-unicorn, cousin of Honicorn (original PaKu character) ---------- */
function uniSvg(state){return `<svg class="owl uni owl-${state}" viewBox="0 0 100 112" aria-hidden="true">
 <g class="owl-b">
  <ellipse class="uni-arm" cx="16" cy="80" rx="7" ry="10" transform="rotate(28 16 80)"/>
  <g class="owl-wr"><ellipse class="uni-arm" cx="84" cy="80" rx="7" ry="10" transform="rotate(-28 84 80)"/></g>
  <path class="owl-feet" d="M41 104v5M47 105v4M53 105v4M59 104v5"/>
  <g class="uni-horn"><path d="M50 5L42.5 33Q50 36.5 57.5 33Z" fill="#F6C65B" stroke="#D99A2B" stroke-width="1.5" stroke-linejoin="round"/>
   <path d="M44.6 26Q50 28.6 55.4 26M46.6 19Q50 21 53.4 19M48.3 12.4Q50 13.5 51.7 12.4" fill="none" stroke="#D99A2B" stroke-width="1.6" stroke-linecap="round"/></g>
  <g class="uni-body"><circle cx="50" cy="44" r="15"/><circle cx="33" cy="50" r="14"/><circle cx="67" cy="50" r="14"/><circle cx="23" cy="66" r="14"/><circle cx="77" cy="66" r="14"/>
   <circle cx="29" cy="85" r="14"/><circle cx="71" cy="85" r="14"/><circle cx="50" cy="91" r="15"/><circle cx="50" cy="68" r="27"/></g>
  <path class="uni-lobe" d="M50 31Q46.5 39 51 46M26 57Q32.5 55 35 60.5M74 57Q67.5 55 65 60.5M20 75Q26 73 28.5 78.5M80 75Q74 73 71.5 78.5M35 93Q38 96 42 95.5M65 93Q62 96 58 95.5"/>
  <ellipse class="uni-cheek" cx="31" cy="78" rx="5.5" ry="3.2"/><ellipse class="uni-cheek" cx="69" cy="78" rx="5.5" ry="3.2"/>
  <path class="uni-brow" d="M31.5 53.5Q39 50 45.5 54M54.5 54Q61 50 68.5 53.5"/>
  <g class="owl-eyes-o"><ellipse class="owl-eye" cx="39" cy="66" rx="8" ry="9"/><ellipse class="owl-eye" cx="61" cy="66" rx="8" ry="9"/>
   <circle class="owl-pupil" cx="40" cy="67.5" r="4.6"/><circle class="owl-pupil" cx="60" cy="67.5" r="4.6"/>
   <circle fill="#fff" cx="41.8" cy="65.6" r="1.6"/><circle fill="#fff" cx="61.8" cy="65.6" r="1.6"/></g>
  <g class="owl-eyes-c"><path d="M31 67Q39 72.5 47 67M53 67Q61 72.5 69 67"/></g>
  <path class="uni-smile" d="M43 81Q50 87.5 57 81"/>
 </g>
 <g transform="translate(61 36) rotate(20) scale(.78)"><path class="owl-leaf" d="M0,-7.2 1.2,-4.6 2.6,-5.4 2.2,-1.4 4.4,-3.8 4.9,-2.6 7.4,-3.1 6.6,-0.6 7.6,-0.1 4.1,3.1 4.6,4.4 0.4,3.8 0.5,7.3 -0.5,7.3 -0.4,3.8 -4.6,4.4 -4.1,3.1 -7.6,-0.1 -6.6,-0.6 -7.4,-3.1 -4.9,-2.6 -4.4,-3.8 -2.2,-1.4 -2.6,-5.4 -1.2,-4.6z"/></g>
 <g class="uni-spark"><path d="M24 22l1.6 3.6 3.6 1.6-3.6 1.6L24 32.4l-1.6-3.6-3.6-1.6 3.6-1.6z"/><path d="M78 18l1.2 2.8 2.8 1.2-2.8 1.2L78 26l-1.2-2.8-2.8-1.2 2.8-1.2z"/></g>
 <text class="owl-z" x="80" y="26">z</text><text class="owl-z z2" x="88" y="16">z</text>
</svg>`;}
function owlSvg(state){return `<svg class="owl owl-${state}" viewBox="0 0 100 112" aria-hidden="true">
 <g class="owl-b">
  <path class="owl-wl" d="M20 58c-10 6-12 22-4 32 4-8 8-16 8-26z"/>
  <path class="owl-wr" d="M80 58c10 6 12 22 4 32-4-8-8-16-8-26z"/>
  <path class="owl-body" d="M50 20C24 20 16 44 18 70c2 24 16 34 32 34s30-10 32-34c2-26-6-50-32-50z"/>
  <path class="owl-body" d="M28 26L22 11l16 11zM72 26l6-15-16 11z"/>
  <ellipse class="owl-belly" cx="50" cy="78" rx="20" ry="19"/>
  <path class="owl-feather" d="M42 72q4 4 8 0q4 4 8 0M42 82q4 4 8 0q4 4 8 0"/>
  <g class="owl-eyes-o"><circle class="owl-eye" cx="37" cy="48" r="11"/><circle class="owl-eye" cx="63" cy="48" r="11"/>
   <circle class="owl-pupil" cx="38" cy="49" r="5"/><circle class="owl-pupil" cx="62" cy="49" r="5"/>
   <circle fill="#fff" cx="40" cy="47" r="1.6"/><circle fill="#fff" cx="64" cy="47" r="1.6"/></g>
  <g class="owl-eyes-c"><path d="M28 49q9 6 18 0M54 49q9 6 18 0"/></g>
  <path class="owl-beak" d="M46 56h8l-4 7z"/>
  <path class="owl-feet" d="M40 103v5M44 103v5M56 103v5M60 103v5"/>
 </g>
 <g transform="translate(66 17) rotate(14) scale(1.05)"><path class="owl-leaf" d="M0,-7.2 1.2,-4.6 2.6,-5.4 2.2,-1.4 4.4,-3.8 4.9,-2.6 7.4,-3.1 6.6,-0.6 7.6,-0.1 4.1,3.1 4.6,4.4 0.4,3.8 0.5,7.3 -0.5,7.3 -0.4,3.8 -4.6,4.4 -4.1,3.1 -7.6,-0.1 -6.6,-0.6 -7.4,-3.1 -4.9,-2.6 -4.4,-3.8 -2.2,-1.4 -2.6,-5.4 -1.2,-4.6z"/></g>
 <text class="owl-z" x="78" y="20">z</text><text class="owl-z z2" x="86" y="10">z</text>
</svg>`;}
function owl(state){
  const a=S.avatar||'unicorn';
  if(a==='owl')return owlSvg(state);
  const A=window.PW_AV_SVG;
  if(A&&A[a]&&A[a][state])return A[a][state];
  return uniSvg(state);
}
const avName=id=>{const n=(window.PW_AV_NAMES||{})[id];return n?(n[S.lang]||n.en):id;};
function avatarPicker(){
  return `<div class="avgrid">${(window.PW_AV_LIST||['unicorn','owl']).map(id=>{const cur=S.avatar||'unicorn';
    const prev=S.avatar;S.avatar=id;const pic=owl('hi');S.avatar=prev;
    return `<button class="avopt ${cur===id?'on':''}" data-act="avatar" data-v="${id}" aria-pressed="${cur===id}">${pic}<span>${esc(avName(id))}</span></button>`;}).join('')}</div>`;
}
function owlState(){
  const d=todayStr();
  if(S.today.date===d&&S.today.rev.length) return 'happy';
  const last=S.days[S.days.length-1];
  if(last&&daysBetween(last,d)>=3) return 'sleepy';
  return 'hi';
}

/* ---------- PaKu family: other apps are optional, shortcuts only for apps used on this device ---------- */
const famApps=()=>FAM?FAM.all().filter(a=>a.id!==SELF):[];
const famOn=a=>(S.fam&&a.id in S.fam)?!!S.fam[a.id]:FAM.used(a.id);
function famShortcuts(){
  if(!FAM)return '';
  const on=famApps().filter(famOn);if(!on.length)return '';
  return `<div class="famrow">${on.map(a=>`<a class="famchip" href="${esc(FAM.url(a))}"><img src="${esc(FAM.icon(a))}" alt="" width="22" height="22" onerror="this.remove()">${esc(a.name)}</a>`).join('')}</div>`;
}
function famBody(){
  if(!FAM)return `<p class="muted">–</p>`;
  return `<p class="muted">${esc(FAM.t('fam_d',S.lang))}</p>`+famApps().map(a=>`<div class="famapp">
    <img src="${esc(FAM.icon(a))}" alt="" width="44" height="44" onerror="this.style.visibility='hidden'">
    <div class="fa-t"><b>${esc(a.name)}</b><small>${esc(FAM.desc(a,S.lang))}</small>${FAM.used(a.id)?`<span class="chip">✓ ${esc(FAM.t('fam_used',S.lang))}</span>`:''}
      <label class="row fa-sw"><span>${esc(FAM.t('fam_link',S.lang))}</span><span class="switch"><input type="checkbox" ${famOn(a)?'checked':''} data-in="fam" data-id="${esc(a.id)}"><i></i></span></label></div>
    <a class="btn small" href="${esc(FAM.url(a))}">${esc(FAM.t(FAM.used(a.id)?'fam_open':'fam_get',S.lang))}</a></div>`).join('')+
   `<small class="muted">${esc(FAM.t('fam_link_d',S.lang))}</small><p><a class="btn" href="${esc(FAM.hub)}">🏡 ${esc(FAM.t('fam_hub',S.lang))}</a></p>`;
}
/* ---------- word picking ---------- */
const allCats=l=>[...new Set(pack(l).map(e=>e.cat))];
function okE(e){
  if(S.junior&&(e.j===false||!e.jl)) return false;
  if(S.mode==='random'||!S.cats.length) return true;
  return S.cats.includes(e.cat);
}
function pickNext(){
  const cl=cLang();
  const unl=pack(cl).filter(e=>okE(e)&&!S.learned[e.id]&&!S.today.ids.includes(e.id));
  if(!unl.length) return null;
  const avail=new Set(unl.map(e=>e.cat));
  let cat;
  if(S.mode==='cat'){
    const order=(S.cats.length?S.cats:allCats(cl)).filter(c=>avail.has(c));
    cat=order[(order.indexOf(S.lastCat)+1)%order.length];
  }else{
    const universe=(S.mode==='random'||!S.cats.length?allCats(cl):S.cats).filter(c=>avail.has(c));
    let cyc=(S.cycle||[]).filter(c=>universe.includes(c));
    if(!cyc.length){cyc=shuffle(universe.slice());if(cyc.length>1&&cyc[0]===S.lastCat)cyc.push(cyc.shift());}
    cat=cyc.shift();S.cycle=cyc;
  }
  S.lastCat=cat;
  const inCat=unl.filter(e=>e.cat===cat);
  return S.mode==='cat'?inCat[0]:inCat[Math.floor(Math.random()*inCat.length)];
}
function ensureToday(){
  const d=todayStr();
  if(S.today.date!==d) S.today={date:d,ids:[],rev:[]};
  S.today.ids=S.today.ids.filter(id=>getE(id));
  S.today.rev=S.today.rev.filter(id=>S.today.ids.includes(id));
  if(!S.today.ids.length){const e=pickNext();if(e)S.today.ids.push(e.id);}
  save();
}

/* ---------- learning, journey, badges ---------- */
function markLearned(id){
  const d=todayStr();
  if(!S.today.rev.includes(id)) S.today.rev.push(id);
  if(!S.learned[id]) S.learned[id]={d,s:0};
  if(S.lastStepDay!==d){                       // the road moves max. one step per day
    S.lastStepDay=d;
    if(!S.days.includes(d)) S.days.push(d);
    if(S.earned<=TOTAL){
      S.steps++;
      if(S.steps>=S.stageLen){S.steps=0;S.earned++;queue.push({type:'fig',i:S.earned-1});}
    }
  }
  const n=wordsN();
  BADGES.forEach(b=>{if(n>=b&&!S.badges.includes(b)){S.badges.push(b);queue.push({type:'badge',n:b});}});
  save(); writeNotifyCache();
}

/* ---------- figure helpers ---------- */
function figText(F){const L=window.PW_FIG_TEXT;return (L[S.lang]&&L[S.lang][F.id])||(L.en&&L.en[F.id])||null;}
function figName(F){const L=window.PW_FIG_TEXT;return (L[S.lang]&&L[S.lang][F.id]&&L[S.lang][F.id].n)||F.n;}
function years(F){const x=T(),c=F.a?x.circa:'';
  if(F.b<0&&F.d<0) return c+x.bcPre+(-F.b)+'–'+(-F.d)+x.bc;
  if(F.b<0) return c+x.bcPre+(-F.b)+x.bc+' – '+F.d;
  return c+F.b+'–'+F.d;}
const epochOf=i=>i>=TOTAL?5:window.PW_epochOf(FIGS[i].b);

/* ---------- speech (word, explanation, biography – also for blind users) ---------- */
let noVoiceShown={};
function voiceFor(lang){const code=(TTS[lang]||'en-GB').toLowerCase();const vs=speechSynthesis.getVoices();
  return vs.find(v=>v.lang&&v.lang.replace('_','-').toLowerCase()===code)||vs.find(v=>v.lang&&v.lang.toLowerCase().startsWith(code.slice(0,2)));}
function speak(parts,lang,btn){
  try{
    if(!('speechSynthesis' in window))return;
    if(speechSynthesis.speaking||speechSynthesis.pending){speechSynthesis.cancel();if(btn&&btn.classList.contains('talking')){btn.classList.remove('talking');return;}}
    document.querySelectorAll('.talking').forEach(b=>b.classList.remove('talking'));
    if(typeof parts==='string')parts=[parts];
    parts=parts.filter(Boolean);if(!parts.length)return;
    const v=voiceFor(lang);
    if(!v&&speechSynthesis.getVoices().length&&!noVoiceShown[lang]){noVoiceShown[lang]=1;toast(t('noVoice'));}
    if(btn)btn.classList.add('talking');
    parts.forEach((p,i)=>{const u=new SpeechSynthesisUtterance(p);u.lang=TTS[lang]||'en-GB';u.rate=S.rate==='slow'?.72:.95;if(v)u.voice=v;
      if(i===parts.length-1)u.onend=u.onerror=()=>{if(btn)btn.classList.remove('talking');};speechSynthesis.speak(u);});
  }catch(e){}
}
function cardParts(e){const x=txt(e);return [e.t,x.s,x.l,x.x?(t('example')+': '+x.x):'',e.f?(t('funFact')+' '+e.f):''];}
function toast(msg){const d=document.createElement('div');d.className='toast';d.setAttribute('role','status');d.textContent=msg;document.body.appendChild(d);setTimeout(()=>d.remove(),6000);}
/* ---------- particles ---------- */
function burst(kind,glyphs,count){
  if(animLvl()==='off') return;
  const n=Math.round((count||26)*(animLvl()==='calm'?.35:1));
  const layer=document.createElement('div');layer.className='fx-layer';
  const letters='ABCDEFGHIJKLMNOPRSTUWZŁŚŻ'.split('');
  const paint=['#E63946','#F4A261','#2A9D8F','#457B9D','#E9C46A','#9B5DE5'];
  for(let k=0;k<n;k++){
    const p=document.createElement('span');
    let cls='fx';
    if(kind==='bubbles'||kind==='glow'||kind==='paint'){
      cls+=' fx-dot '+(kind==='glow'?'fx-glow':kind==='paint'?'fx-paint':'fx-bub');
      if(kind==='paint')p.style.background=paint[k%paint.length];
      const sz=8+Math.random()*22;p.style.width=p.style.height=sz+'px';
      if(glyphs&&k%3===0){p.className='fx';p.textContent=glyphs[k%glyphs.length];}
    }else if(kind==='letters'||kind==='badge'){p.textContent=letters[Math.floor(Math.random()*letters.length)];p.style.color=paint[k%paint.length];cls+=' fx-letter';}
    else{p.textContent=(glyphs||['✦'])[k%(glyphs||['✦']).length];}
    if(!p.className)p.className=cls;
    p.classList.add(kind==='fall'?'fx-fall':'fx-rise');
    p.style.left=(Math.random()*100)+'vw';
    p.style.setProperty('--dx',(Math.random()*120-60)+'px');
    p.style.setProperty('--rot',(Math.random()*540-270)+'deg');
    p.style.animationDelay=(Math.random()*.9)+'s';
    p.style.animationDuration=(2.2+Math.random()*1.8)+'s';
    p.style.fontSize=(16+Math.random()*22)+'px';
    layer.appendChild(p);
  }
  document.body.appendChild(layer);
  setTimeout(()=>layer.remove(),5200);
}

/* ---------- rendering ---------- */
function applyLook(){
  const b=document.body;
  b.className=`theme-${S.theme} anim-${S.anim}${S.junior?' junior':''}`;
  b.style.setProperty('--acc',S.accent);
  document.documentElement.lang=S.lang;
  const m=document.querySelector('meta[name=theme-color]');if(m)m.content=S.accent;
}
function render(){
  applyLook();ensureToday();
  const v={today:vToday,journey:vJourney,gallery:vGallery,review:vReview,library:vLibrary}[view]();
  $('#app').innerHTML=`
  <header class="top"><div class="brand"><span class="logo">W</span><div><b>PaKuWord</b><small>${esc(t('tagline'))}</small></div></div>
   <div class="top-act"><button class="ibtn" data-act="ov" data-v="settings" aria-label="${esc(t('settings'))}">${svg('cog')}</button>
   <button class="ibtn" data-act="ov" data-v="menu" aria-label="${esc(t('menu'))}">${svg('menu')}</button></div></header>
  ${installBar()}
  <main class="view view-${view}">${v}</main>
  <nav class="tabs">${['today','journey','gallery','review','library'].map(k=>`<button class="tab ${view===k?'on':''}" data-act="view" data-v="${k}">${svg({today:'card',journey:'road',gallery:'grid',review:'loop',library:'book'}[k])}<span>${esc(t(k))}</span>${k==='review'&&dueList().length?`<i class="dot">${dueList().length}</i>`:''}</button>`).join('')}</nav>
  <div id="ov">${overlay?renderOverlay():''}</div>`;
  after();
}
function installBar(){
  if(standalone()) return '';
  if(deferredPrompt) return `<div class="install"><span>📲 PaKuWord</span><button class="btn small" data-act="install">${esc(t('install'))}</button></div>`;
  if(isIOS) return `<div class="install"><span>📲 ${esc(t('installIos'))}</span></div>`;
  return '';
}

/* ----- Today ----- */
function vToday(){
  const st=owlState(),cl=cLang();
  const msg={hi:t('hi'),happy:t('happy'),sleepy:t('sleepy')}[st];
  const pet=`<div class="mascot"><button class="avbtn" data-act="ov" data-v="avatar" aria-label="${esc(t('s_buddy'))}: ${esc(avName(S.avatar||'unicorn'))}">${owl(st)}</button><div class="bubble">${esc(msg)}</div></div>`;
  let main='';
  if(cl!==S.lang) main+=`<p class="note">${esc(t('fallback'))}</p>`;
  if(!S.today.ids.length) main+=`<div class="empty">${esc(t('allDone'))}</div>`;
  else{
    S.today.ids.forEach(id=>{main+=card(id);});
    if(S.today.ids.every(id=>S.today.rev.includes(id))){
      const can=pack(cl).some(e=>okE(e)&&!S.learned[e.id]&&!S.today.ids.includes(e.id));
      main+=can?`<button class="btn more-btn" data-act="more">＋ ${esc(t('oneMore'))}</button>`:`<div class="empty">${esc(t('allDone'))}</div>`;
    }
  }
  const due=dueList().length;
  let info=`<p class="count">${esc(t('todayCount',{n:S.today.rev.length}))} · ${esc(t('learnedN',{n:wordsN()}))}</p>`;
  info+=`<div class="side-extra">`;
  if(S.earned<=TOTAL) info+=`<button class="panel" data-act="view" data-v="journey"><b>${svg('road')} ${esc(t('journey'))}</b><div class="bar"><i style="width:${Math.round(S.steps/S.stageLen*100)}%"></i></div><small>${esc(t('stepOf',{n:S.steps,len:S.stageLen}))}</small></button>`;
  info+=`<button class="panel" data-act="view" data-v="review"><b>${svg('loop')} ${esc(t('review'))}</b><small>${esc(due?t('reviewDue',{n:due}):t('reviewNone'))}</small></button></div>`;
  info+=famShortcuts();
  return `<div class="today-grid"><div class="tg-pet">${pet}</div><div class="tg-main">${main}</div><div class="tg-info">${info}</div></div>`;
}
function txt(e){return S.junior&&e.jl?{s:e.js,l:e.jl,x:e.jx}:{s:e.s,l:e.l,x:e.x};}
function cardBody(e,fresh){
  const x=txt(e),cl=cLang(),open=openMore.has(e.id);
  const term=fresh?[...e.t].map((c,i)=>`<span style="animation-delay:${i*35}ms">${c===' '?'&nbsp;':esc(c)}</span>`).join(''):esc(e.t);
  let tags=`<span class="chip">${catIc(e.cat)}${esc(catName(e.cat))}</span>`;
  if(e.only) tags+=`<span class="chip gold">★ ${esc(t('onlyIn'))}</span>`;
  if(e.c) tags+=`<span class="chip">${esc(t('lawOf',{c:e.c}))}</span>`;
  let learn='';
  if(S.learn!=='off'&&S.learn!==cl){
    const L=window.PW_LANG_IN[S.lang]||window.PW_LANG_IN.en, lname=L[S.learn];
    const te=getE(e.id,S.learn);
    if(!window.PW_CONTENT[S.learn]) learn=`<div class="learn"><b>${esc(t('inLang',{lang:lname}))}</b> <i>${esc(t('soon'))}</i></div>`;
    else if(te&&!e.only) learn=`<div class="learn"><b>${esc(t('inLang',{lang:lname}))}</b> <span class="lt">${esc(te.t)}</span>
      <button class="ibtn sm" data-act="sayw" data-id="${e.id}" data-l="${S.learn}" aria-label="${esc(t('sayWord'))}">${svg('speaker')}</button><p>${esc(txt(te).s)}</p></div>`;
    else learn=`<div class="learn muted">${esc(t('noCounterpart'))}</div>`;
  }
  return `<div class="tags">${tags}</div>
   <h2 class="term ${fresh?'fresh':''}">${term}</h2>
   <div class="say-row"><button class="listen" data-act="sayw" data-id="${e.id}" data-l="${cl}">${svg('speaker')}<span>${esc(t('sayWord'))}</span></button>
   <button class="listen" data-act="saya" data-id="${e.id}" data-l="${cl}">${svg('speaker')}<span>${esc(t('sayAll'))}</span></button></div>
   <p class="short">${esc(x.s)}</p>
   <div class="morebox ${open?'open':''}">
     <p class="long">${esc(x.l)}</p>
     ${x.x?`<div class="ex"><b>${esc(t('example'))}</b><p>“${esc(x.x)}”</p></div>`:''}
     ${e.f?`<div class="fact"><b>💡 ${esc(t('funFact'))}</b><p>${esc(e.f)}</p></div>`:''}
   </div>
   <button class="link" data-act="toggle" data-id="${e.id}">${esc(open?t('less'):t('readMore'))} ${open?'▴':'▾'}</button>
   ${learn}`;
}
function card(id){
  const e=getE(id);if(!e)return '';
  const rev=S.today.rev.includes(id);
  if(rev){const f=freshReveal.has(id);freshReveal.delete(id);return `<article class="wcard ${f?'pop':''}">${cardBody(e,f)}</article>`;}
  if(S.junior) return `<article class="wcard scratchwrap" data-id="${id}">${cardBody(e,false)}<canvas class="scratch" data-id="${id}" aria-hidden="true"></canvas><button class="sr-reveal" data-act="srreveal" data-id="${id}">${esc(t('revealBtn'))}</button><div class="scratch-hint">✨ ${esc(t('scratchToReveal'))}</div></article>`;
  return `<div class="flipper" data-act="reveal" data-id="${id}" role="button" tabindex="0" aria-label="${esc(t('tapToReveal'))}">
    <div class="face front"><div class="qmark">?</div><div class="front-cat">${catIc(e.cat)}${esc(catName(e.cat))}</div><p>${esc(t('tapToReveal'))}</p></div>
    <div class="face back"><div class="qmark small">✦</div></div></div>`;
}

/* ----- Journey ----- */
function vJourney(){
  const cur=Math.min(S.earned,TOTAL), ep=epochOf(cur), E=t('epochs');
  let h=`<div class="jr ep${ep}"><h2>${esc(t('journeyTitle'))}</h2><p class="rule">${esc(t('rule'))}</p>`;
  if(S.earned<=TOTAL){
    const pct=Math.round(S.steps/S.stageLen*100);
    h+=`<div class="prog"><div class="bar"><i style="width:${pct}%"></i></div><span>${esc(t('stepOf',{n:S.steps,len:S.stageLen}))}</span></div>`;
  }
  h+=`<ol class="road">`;
  let lastEp=-1;
  for(let i=0;i<=TOTAL;i++){
    const e=epochOf(i);
    if(e!==lastEp){h+=`<li class="era ep${e}"><span>${esc(E[e])}</span></li>`;lastEp=e;}
    const done=i<S.earned, now=i===S.earned;
    if(i===TOTAL){
      h+=`<li class="st you ${done?'done':''} ${now?'now':''} ${i%2?'r':'l'}"><span class="node">${svg('you')}</span><span class="lbl">${done?esc(t('youTitle')):'?'}</span>${now?`<span class="here">${owl('hi')}</span>`:''}</li>`;break;}
    const F=FIGS[i];
    h+=`<li class="st ${done?'done':''} ${now?'now':''} ${i%2?'r':'l'}" ${done?`data-act="fig" data-i="${i}"`:''}>
      <span class="node">${done?svg(F.icon):now?`<b>${S.steps}/${S.stageLen}</b>`:svg('lock')}</span>
      <span class="lbl">${done?`<b>${esc(figName(F))}</b><small>${esc(years(F))}</small>`:esc(t('locked'))}</span>
      ${now?`<span class="here">${owl('hi')}</span>`:''}</li>`;
  }
  return h+`</ol></div>`;
}

/* ----- Gallery ----- */
function vGallery(){
  let h=`<h2 class="vt">${esc(t('figures'))}</h2><div class="gal">`;
  for(let i=0;i<TOTAL;i++){
    const F=FIGS[i];
    if(i<S.earned) h+=`<button class="gcard holo" data-act="fig" data-i="${i}"><span class="gi">${svg(F.icon)}</span><b>${esc(figName(F))}</b><small>${esc(years(F))}</small></button>`;
    else h+=`<div class="gcard locked"><span class="gi sil">?</span><small>${esc(t('locked'))}</small></div>`;
  }
  h+=S.earned>TOTAL?`<button class="gcard holo you" data-act="fig" data-i="${TOTAL}"><span class="gi">${svg('you')}</span><b>${esc(t('youTitle'))}</b></button>`:`<div class="gcard locked"><span class="gi sil">★</span><small>${esc(t('youTitle'))}</small></div>`;
  h+=`</div><h2 class="vt">${esc(t('badges'))}</h2><div class="badges">`;
  BADGES.forEach(b=>{const on=S.badges.includes(b);h+=`<div class="badge ${on?'on':''}"><b>${b}</b><small>${on?'✦':'·'}</small></div>`;});
  return h+`</div>`;
}

/* ----- Review ----- */
function dueList(){
  const d=todayStr();
  return Object.keys(S.learned).filter(id=>{const v=S.learned[id];return v.s<INT.length&&daysBetween(v.d,d)>=INT[v.s]&&getE(id);});
}
function newRv(){
  const due=dueList();if(!due.length){rv=null;return;}
  const id=due[0],e=getE(id);
  const others=shuffle(pack(cLang()).filter(o=>o.id!==id&&(!S.junior||o.jl))).slice(0,2);
  rv={id,opts:shuffle([e,...others].map(o=>({id:o.id,s:txt(o).s}))),ans:null};
}
function vReview(){
  if(!rv||!S.learned[rv.id]) newRv();
  const n=dueList().length;
  let h=`<h2 class="vt">${esc(t('reviewTitle'))}</h2>`;
  if(!rv) return h+`<div class="empty">${owl('happy')}<p>${esc(t('reviewNone'))}</p></div>`;
  const e=getE(rv.id);
  h+=`<p class="count">${esc(t('reviewDue',{n}))}</p><article class="wcard rq ${rv.ans?(rv.ans===rv.id?'bounce':'wiggle'):''}">
   <h2 class="term">${esc(e.t)}</h2><p class="muted">${esc(t('whichMeans'))}</p><div class="opts">`;
  rv.opts.forEach(o=>{
    let c='';if(rv.ans){if(o.id===rv.id)c='right';else if(o.id===rv.ans)c='wrong';}
    h+=`<button class="opt ${c}" data-act="ans" data-id="${o.id}" ${rv.ans?'disabled':''}>${esc(o.s)}</button>`;
  });
  h+=`</div>`;
  if(rv.ans) h+=`<p class="verdict">${esc(rv.ans===rv.id?t('correct'):t('notQuite'))}</p><button class="btn" data-act="rnext">${esc(t('next'))} →</button>`;
  return h+`</article>`;
}

/* ----- Library ----- */
function vLibrary(){
  const list=Object.keys(S.learned).map(id=>({id,v:S.learned[id],e:getE(id)})).filter(o=>o.e)
    .filter(o=>!libQ||(o.e.t+' '+txt(o.e).s).toLowerCase().includes(libQ.toLowerCase()))
    .sort((a,b)=>a.v.d<b.v.d?1:-1);
  let h=`<h2 class="vt">${esc(t('library'))}</h2><input class="search" type="search" placeholder="${esc(t('search'))}" value="${esc(libQ)}" data-in="lib">
   <p class="count">${esc(t('learnedN',{n:wordsN()}))}</p>`;
  if(!list.length) return h+`<div class="empty">${esc(t('libEmpty'))}</div>`;
  return h+`<ul class="lib">${list.map(o=>`<li data-act="word" data-id="${o.id}"><span class="li-ic">${catIc(o.e.cat)}</span><div><b>${esc(o.e.t)}</b><small>${esc(txt(o.e).s)}</small></div></li>`).join('')}</ul>`;
}

/* ---------- overlays ---------- */
function renderOverlay(){
  const o=overlay;
  const shell=(title,body,cls)=>`<div class="ov-bg" data-act="close"></div><section class="sheet ${cls||''}" role="dialog" aria-modal="true">
   <div class="sheet-h"><h3>${esc(title)}</h3><button class="ibtn" data-act="close" aria-label="${esc(t('close'))}">${svg('x')}</button></div><div class="sheet-b">${body}</div></section>`;
  if(o.type==='settings') return shell(t('settings'),settingsBody());
  if(o.type==='menu') return shell(t('menu'),`<ul class="menu">
    ${[['news','✨'],['about','💜'],['family','🏡'],['share','🔗'],['terms','📄'],['coffee','☕']].map(([k,i])=>`<li><button data-act="ov" data-v="${k}"><span>${i}</span>${esc(t(k==='news'?'whatsNew':k))}</button></li>`).join('')}</ul>`);
  if(o.type==='news')return shell(t('whatsNew'),newsBody());
  if(o.type==='avatar')return shell(t('s_buddy'),`<p class="muted">${esc(t('buddyHint'))}</p>`+avatarPicker());
  if(o.type==='about') return shell(t('about'),T().aboutText.map(p=>`<p>${esc(p)}</p>`).join(''));
  if(o.type==='terms') return shell(t('terms'),T().termsText.map(p=>`<p>${esc(p)}</p>`).join(''));
  if(o.type==='coffee') return shell(t('coffee'),`<p>${esc(t('coffeeText'))}</p><a class="btn" href="${COFFEE}" target="_blank" rel="noopener">☕ ${esc(t('coffee'))}</a>`);
  if(o.type==='family') return shell(FAM?FAM.t('fam_title',S.lang):t('family'),famBody());
  if(o.type==='share') return shell(t('share'),`<div class="qr"><img src="qr.png" alt="QR" width="220" height="220"><p>${esc(t('shareHint'))}</p><code>${APP_URL}</code>
     <button class="btn" data-act="copy">${esc(o.copied?t('copied'):t('copyLink'))}</button></div>`);
  if(o.type==='word'){const e=getE(o.id);return shell(catName(e.cat),`<article class="wcard flat">${cardBody(e,false)}</article>`);}
  if(o.type==='fig') return shell('',figCard(o.i),'figsheet');
  if(o.type==='cele') return celeBody(o);
  return '';
}
function newsBody(){
  const C=window.PW_CHANGES||[];
  return `<div class="news">${owl('happy')}<h2>${esc(t('newsTitle'))}</h2>`+C.slice(0,3).map(c=>`<h4>${esc(t('newsVer',{v:c.v}))}</h4><ul>${((c.notes[S.lang]||c.notes.en)||[]).map(n=>`<li>${esc(n)}</li>`).join('')}</ul>`).join('')+
   `<button class="listen" data-act="saynews">${svg('speaker')}<span>${esc(t('listen'))}</span></button></div>`;
}
function figCard(i){
  if(i>=TOTAL) return `<div class="bigcard holo you" data-tilt><span class="gi">${svg('you')}</span><h2>${esc(t('youTitle'))}</h2><p>${esc(t('youText'))}</p></div>`;
  const F=FIGS[i],x=figText(F);
  let h=`<div class="bigcard holo" data-tilt><span class="gi">${svg(F.icon)}</span><h2>${esc(figName(F))}</h2><small>${esc(years(F))}${x&&x.f?' · '+esc(x.f):''}</small></div>`;
  if(!x) return h+`<p class="muted center">${esc(t('bioSoon'))}</p>`;
  h+=`<button class="listen" data-act="sayfig" data-i="${i}">${svg('speaker')}<span>${esc(t('listenBio'))}</span></button><p class="bio">${esc(x.bio)}</p><div class="fact"><b>💡 ${esc(t('funFact'))}</b><ul>${x.facts.map(f=>`<li>${esc(f)}</li>`).join('')}</ul></div>`;
  if(x.term) h+=`<div class="ex"><b>${esc(t('termFrom'))}</b><p>${esc(x.term)}</p></div>`;
  return h;
}
function celeBody(o){
  let inner;
  if(o.item.type==='badge'){
    inner=`<div class="cele-badge">${o.item.n}</div><h2>${esc(t('badge',{n:o.item.n}))}</h2><p>${esc(t('badgeSub'))}</p>`;
  }else{
    const i=o.item.i;
    const prevEp=i>0?epochOf(i-1):-1, ep=epochOf(i);
    const cross=ep!==prevEp?`<div class="era-cross ep${ep}">${esc(t('crossEpoch',{e:t('epochs')[ep]}))}</div>`:'';
    if(i>=TOTAL) inner=`${cross}<div class="cele-ic you">${svg('you')}</div><h2>${esc(t('youTitle'))}</h2><p>${esc(t('youText'))}</p>`;
    else{const F=FIGS[i];
      inner=`${cross}<div class="cele-ic ic-${F.icon}">${svg(F.icon)}</div><h2>${esc(t(F.g==='f'?'proud_f':'proud_m',{name:figName(F)}))}</h2>
       <p>${esc(t('proudSub',{days:S.days.length,words:wordsN()}))}</p><button class="btn" data-act="fig" data-i="${i}">${esc(t('seeCard'))}</button>`;}
  }
  return `<div class="ov-bg dark" data-act="cnext"></div><section class="cele" role="dialog" aria-modal="true">${inner}<button class="link" data-act="cnext">${esc(t('close'))}</button></section>`;
}
function settingsBody(){
  const L=window.PW_LANGNAMES,cl=Object.keys(CATS()).filter(c=>pack(cLang()).some(e=>e.cat===c));
  const seg=(key,opts)=>`<div class="seg">${opts.map(([v,l])=>`<button class="${S[key]===v?'on':''}" data-act="set" data-k="${key}" data-v="${v}">${esc(l)}</button>`).join('')}</div>`;
  return `
  <div class="fld"><span>${esc(t('s_buddy'))}</span>${avatarPicker()}<small>${esc(t('buddyHint'))}</small></div>
  <label class="fld"><span>${esc(t('s_language'))}</span><select data-in="lang">${LANGS.map(l=>`<option value="${l}" ${S.lang===l?'selected':''}>${L[l]}</option>`).join('')}</select></label>
  <label class="fld"><span>${esc(t('s_learn'))}</span><select data-in="learn"><option value="off">${esc(t('off'))}</option>${LANGS.filter(l=>l!==S.lang).map(l=>`<option value="${l}" ${S.learn===l?'selected':''}>${L[l]}${window.PW_CONTENT[l]?'':' ('+esc(t('soon'))+')'}</option>`).join('')}</select></label>
  <div class="fld"><span>${esc(t('s_mode'))}</span>${['cat','random','mixed'].map(m=>`<label class="radio"><input type="radio" name="mode" value="${m}" ${S.mode===m?'checked':''} data-in="mode"> ${esc(t({cat:'modeCat',random:'modeRandom',mixed:'modeMixed'}[m]))}</label>`).join('')}</div>
  <div class="fld ${S.mode==='random'?'dim':''}"><span>${esc(t('s_cats'))}</span><div class="cats">${cl.map(c=>`<label class="catck"><input type="checkbox" value="${c}" ${S.cats.includes(c)?'checked':''} data-in="cat"> ${catIc(c)} ${esc(catName(c))}</label>`).join('')}</div></div>
  <label class="fld"><span>${esc(t('s_stage'))}: <b id="stv">${S.stageLen}</b></span><input type="range" min="5" max="50" step="1" value="${S.stageLen}" data-in="stage"><small>${esc(t('s_stageHint'))}</small></label>
  <div class="fld"><span>${esc(t('s_notify'))}</span><div class="row"><input type="time" value="${esc(S.notify||'09:00')}" data-in="ntime" ${S.notify?'':'disabled'}>
    <label class="switch"><input type="checkbox" ${S.notify?'checked':''} data-in="notify"><i></i></label></div><small>${esc(t('notifyHint'))}</small></div>
  <div class="fld"><span>${esc(t('s_voice'))}</span><div class="row"><span>${esc(t('s_autoread'))}</span><label class="switch"><input type="checkbox" ${S.autoread?'checked':''} data-in="autoread"><i></i></label></div><small>${esc(t('autoreadHint'))}</small>
    <span class="sub">${esc(t('s_rate'))}</span>${seg('rate',[['slow',t('slow')],['normal',t('normal')]])}</div>
  <div class="fld"><span>${esc(t('s_anim'))}</span>${seg('anim',[['full',t('animFull')],['calm',t('animCalm')],['off',t('animOff')]])}</div>
  <div class="fld"><span>${esc(t('s_junior'))}</span><label class="switch"><input type="checkbox" ${S.junior?'checked':''} data-in="junior"><i></i></label><small>${esc(t('juniorHint'))}</small></div>
  <div class="fld"><span>${esc(t('s_theme'))}</span>${seg('theme',[['light',t('light')],['dark',t('dark')]])}</div>
  <div class="fld"><span>${esc(t('s_accent'))}</span><div class="sw">${ACCENTS.map(a=>`<button class="swatch ${S.accent===a?'on':''}" style="background:${a}" data-act="set" data-k="accent" data-v="${a}" aria-label="${a}"></button>`).join('')}<input type="color" value="${esc(S.accent)}" data-in="accent" aria-label="${esc(t('s_accent'))}"></div></div>
  <div class="fld"><button class="btn danger" data-act="reset">${esc(resetArm?t('resetAgain'):t('s_reset'))}</button></div>`;
}

/* ---------- after render: scratch cards, tilt, focus ---------- */
function after(){
  document.querySelectorAll('canvas.scratch').forEach(initScratch);
  document.querySelectorAll('[data-tilt]').forEach(initTilt);
  if(view==='journey'){const n=document.querySelector('.st.now');if(n&&!overlay)n.scrollIntoView({block:'center',behavior:S.anim==='off'?'auto':'smooth'});}
}
function initScratch(cv){
  const wrap=cv.parentElement,id=cv.dataset.id,r=wrap.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
  cv.width=r.width*dpr;cv.height=r.height*dpr;
  const c=cv.getContext('2d');c.scale(dpr,dpr);
  const g=c.createLinearGradient(0,0,r.width,r.height);g.addColorStop(0,'#c9c3e8');g.addColorStop(.5,'#f2efff');g.addColorStop(1,'#b6aee0');
  c.fillStyle=g;c.fillRect(0,0,r.width,r.height);
  c.fillStyle='rgba(91,75,196,.35)';c.font='bold 28px system-ui';
  for(let y=30;y<r.height;y+=56)for(let x=(y/56%2)*28+10;x<r.width;x+=56)c.fillText('?',x,y);
  c.globalCompositeOperation='destination-out';c.fillStyle='#000';
  let down=false,moves=0,done=false;
  const pos=ev=>{const b=cv.getBoundingClientRect();return [ev.clientX-b.left,ev.clientY-b.top];};
  const scr=ev=>{if(!down||done)return;ev.preventDefault();const [x,y]=pos(ev);c.beginPath();c.arc(x,y,26,0,Math.PI*2);c.fill();
    if(++moves%6===0){const d=c.getImageData(0,0,cv.width,cv.height).data;let cl=0,tot=0;for(let i=3;i<d.length;i+=64){tot++;if(d[i]<40)cl++;}
      if(cl/tot>.45){done=true;cv.classList.add('gone');setTimeout(()=>{freshReveal.add(id);markLearned(id);burst('glyph',['✨','⭐','✦'],18);render();autoRead(id);processQueue();},420);}}};
  cv.addEventListener('pointerdown',e=>{down=true;cv.setPointerCapture(e.pointerId);scr(e);});
  cv.addEventListener('pointermove',scr);
  cv.addEventListener('pointerup',()=>down=false);
  cv.addEventListener('pointercancel',()=>down=false);
}
function initTilt(el){
  if(S.anim==='off')return;
  const set=(x,y)=>{el.style.setProperty('--mx',(x*100)+'%');el.style.setProperty('--my',(y*100)+'%');
    el.style.transform=`perspective(700px) rotateY(${(x-.5)*16}deg) rotateX(${(.5-y)*16}deg)`;};
  el.addEventListener('pointermove',e=>{const b=el.getBoundingClientRect();set((e.clientX-b.left)/b.width,(e.clientY-b.top)/b.height);});
  el.addEventListener('pointerleave',()=>{el.style.transform='';});
}
window.addEventListener('deviceorientation',e=>{
  const el=document.querySelector('[data-tilt]');if(!el||S.anim==='off'||e.gamma==null)return;
  const x=Math.min(1,Math.max(0,.5+e.gamma/60)),y=Math.min(1,Math.max(0,.5+(e.beta-40)/60));
  el.style.setProperty('--mx',(x*100)+'%');el.style.setProperty('--my',(y*100)+'%');
  el.style.transform=`perspective(700px) rotateY(${(x-.5)*14}deg) rotateX(${(.5-y)*14}deg)`;
});

function autoRead(id){if(!S.autoread)return;const e=getE(id);if(e)setTimeout(()=>speak(cardParts(e),cLang()),400);}
/* ---------- celebrations queue ---------- */
function processQueue(){
  if(overlay&&overlay.type==='cele')return;
  const item=queue.shift();if(!item)return;
  overlay={type:'cele',item};render();
  if(S.autoread){const c=document.querySelector('.cele');if(c)setTimeout(()=>speak([...c.querySelectorAll('.era-cross,h2,p')].map(n=>n.textContent),S.lang),S.today.rev.length?2500:300);}
  if(item.type==='badge') burst('badge',null,34);
  else if(item.i>=TOTAL) burst('glyph',['⭐','✨','🌟','💜'],40);
  else{const F=FIGS[item.i];burst(F.fx,F.gl,30);}
}

/* ---------- events ---------- */
document.addEventListener('click',ev=>{
  const el=ev.target.closest('[data-act]');if(!el)return;
  const a=el.dataset.act,id=el.dataset.id;
  if(a==='view'){view=el.dataset.v;overlay=null;render();window.scrollTo(0,0);}
  else if(a==='ov'){overlay={type:el.dataset.v};resetArm=false;render();}
  else if(a==='close'){overlay=null;resetArm=false;render();}
  else if(a==='reveal'){
    if(el.classList.contains('flipped'))return;
    el.classList.add('flipped');
    const go=()=>{freshReveal.add(id);markLearned(id);render();burst('glyph',['✦','✧','★'],14);autoRead(id);processQueue();};
    S.anim==='off'?go():setTimeout(go,620);
  }
  else if(a==='more'){const e=pickNext();if(e){S.today.ids.push(e.id);save();render();
    const last=document.querySelectorAll('.flipper,.scratchwrap');if(last.length)last[last.length-1].scrollIntoView({block:'center',behavior:'smooth'});}}
  else if(a==='toggle'){openMore.has(id)?openMore.delete(id):openMore.add(id);render();}
  else if(a==='sayw'){const e=getE(id,el.dataset.l);if(e)speak(e.t,el.dataset.l,el);}
  else if(a==='saya'){const e=getE(id,el.dataset.l);if(e)speak(cardParts(e),el.dataset.l,el);}
  else if(a==='sayfig'){const F=FIGS[+el.dataset.i],x=figText(F),tl=window.PW_FIG_TEXT[S.lang]&&window.PW_FIG_TEXT[S.lang][F.id]?S.lang:'en';if(x)speak([figName(F),years(F),x.bio,...x.facts,x.term],tl,el);}
  else if(a==='saynews'){const c=(window.PW_CHANGES||[])[0];if(c)speak([t('newsTitle'),...(c.notes[S.lang]||c.notes.en)],S.lang,el);}
  else if(a==='srreveal'){freshReveal.add(id);markLearned(id);render();autoRead(id);processQueue();}
  else if(a==='fig'){overlay={type:'fig',i:+el.dataset.i};render();}
  else if(a==='word'){overlay={type:'word',id};render();}
  else if(a==='cnext'){overlay=null;render();processQueue();}
  else if(a==='ans'){if(rv.ans)return;rv.ans=id;const v=S.learned[rv.id];
    if(id===rv.id){v.s=Math.min(INT.length,v.s+1);burst('glyph',['✨','⭐'],12);}else{v.s=Math.max(0,v.s-1);}
    v.d=todayStr();save();render();}
  else if(a==='rnext'){rv=null;render();}
  else if(a==='avatar'){S.avatar=el.dataset.v;save();if(overlay&&overlay.type==='avatar')overlay=null;render();burst('glyph',['✨','⭐'],10);}
  else if(a==='set'){S[el.dataset.k]=el.dataset.v;save();render();}
  else if(a==='reset'){if(!resetArm){resetArm=true;render();return;}
    const keep={lang:S.lang,theme:S.theme,accent:S.accent,anim:S.anim,junior:S.junior};S=Object.assign(DEF(),keep);save();resetArm=false;overlay=null;view='today';render();}
  else if(a==='install'){if(deferredPrompt){deferredPrompt.prompt();deferredPrompt.userChoice.finally(()=>{deferredPrompt=null;render();});}}
  else if(a==='copy'){try{navigator.clipboard.writeText(APP_URL);}catch(e){}overlay.copied=true;render();}
});
document.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('.flipper')){e.preventDefault();e.target.click();}
  if(e.key==='Escape'&&overlay){overlay=null;render();processQueue();}
});
document.addEventListener('input',ev=>{
  const el=ev.target,k=el.dataset.in;if(!k)return;
  if(k==='lib'){libQ=el.value;const pos=el.selectionStart;render();const s=document.querySelector('.search');if(s){s.focus();try{s.setSelectionRange(pos,pos);}catch(e){}}return;}
  if(k==='stage'){S.stageLen=+el.value;if(S.steps>=S.stageLen)S.steps=S.stageLen-1;const o=$('#stv');if(o)o.textContent=el.value;save();return;}
  if(k==='accent'){S.accent=el.value;save();applyLook();return;}
});
document.addEventListener('change',ev=>{
  const el=ev.target,k=el.dataset.in;if(!k)return;
  if(k==='lang'){S.lang=el.value;if(S.learn===S.lang)S.learn='off';rv=null;}
  else if(k==='learn')S.learn=el.value;
  else if(k==='mode'){S.mode=el.value;S.cycle=[];}
  else if(k==='cat'){const c=el.value;S.cats=el.checked?[...new Set([...S.cats,c])]:S.cats.filter(x=>x!==c);S.cycle=[];}
  else if(k==='junior'){S.junior=el.checked;rv=null;}
  else if(k==='autoread'){S.autoread=el.checked;}
  else if(k==='fam'){S.fam=Object.assign({},S.fam,{[el.dataset.id]:el.checked});}
  else if(k==='notify'){S.notify=el.checked?(document.querySelector('[data-in=ntime]').value||'09:00'):'';if(S.notify)setupNotify();}
  else if(k==='ntime'){if(S.notify){S.notify=el.value;setupNotify();}}
  else if(k==='stage'||k==='accent'){render();return;}
  else return;
  save();render();
});

/* ---------- reminders (optional, off by default) ---------- */
async function writeNotifyCache(){
  try{if(!('caches' in window))return;const c=await caches.open('pakuword-state');
    await c.put('./__notify',new Response(JSON.stringify({time:S.notify,title:t('notifyTitle'),body:t('notifyBody'),seen:S.today.rev.length?S.today.date:''})));}catch(e){}
}
let localTimer=null;
async function setupNotify(){
  try{
    if(!S.notify||!('Notification' in window))return;
    if(Notification.permission==='default')await Notification.requestPermission();
    if(Notification.permission!=='granted')return;
    await writeNotifyCache();
    const reg=await navigator.serviceWorker.ready;
    if('periodicSync' in reg){try{await reg.periodicSync.register('pakuword-daily',{minInterval:4*3600*1000});}catch(e){}}
    clearTimeout(localTimer);
    const [h,m]=S.notify.split(':').map(Number),now=new Date(),at=new Date();at.setHours(h,m,0,0);
    const ms=at-now;
    if(ms>0&&ms<864e5)localTimer=setTimeout(()=>{if(!(S.today.date===todayStr()&&S.today.rev.length))reg.showNotification(t('notifyTitle'),{body:t('notifyBody'),icon:'icon-192.png',tag:'pakuword'});},ms);
  }catch(e){}
}

/* ---------- start ---------- */
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;render();});
window.addEventListener('appinstalled',()=>{deferredPrompt=null;render();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&S.today.date!==todayStr())render();});
if('serviceWorker' in navigator&&location.protocol!=='file:'){
  const had=!!navigator.serviceWorker.controller;let reloaded=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had&&!reloaded){reloaded=true;location.reload();}});
  navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(r=>{try{r.update();}catch(e){}}).catch(()=>{});
}
if('speechSynthesis' in window){speechSynthesis.getVoices();speechSynthesis.onvoiceschanged=()=>{};}
function loadPacks(files){return new Promise(res=>{let n=files.length;if(!n)return res();
  files.forEach(f=>{const sc=document.createElement('script');sc.src=f;sc.async=false;sc.onload=sc.onerror=()=>{if(--n===0)res();};document.head.appendChild(sc);});});}
loadPacks(window.PW_FILES||[]).then(()=>{
  const V=window.PW_VERSION||'';
  if(S.seenVer&&S.seenVer!==V&&!overlay)overlay={type:'news'};
  S.seenVer=V;save();
  render();
  if(overlay&&overlay.type==='news'&&S.autoread){const c=(window.PW_CHANGES||[])[0];if(c)setTimeout(()=>speak([t('newsTitle'),...(c.notes[S.lang]||c.notes.en)],S.lang),600);}
  if(S.notify)setupNotify();
  if(FAM){FAM.detect().then(render).catch(()=>{});FAM.refresh().then(()=>FAM.detect()).then(render).catch(()=>{});}
});
window.__pw={get S(){return S;},markLearned,render,todayStr};
})();
