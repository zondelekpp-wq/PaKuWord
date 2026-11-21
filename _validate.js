#!/usr/bin/env node
/* PaKuWord content validator. Run: node _validate.js   (exit code 1 on errors) */
const fs=require('fs'),path=require('path'),vm=require('vm');
const dir=__dirname, LANGS=['en','pl','de','es','fr','zh','uk','lv'];
const ICONS=['scroll','staff','geometry','planet','star','numbers','quill','herb','globe','press','brush','telescope','apple','flask','note','fossil','bird','gear','lamp','pea','microscope','pot','brain','bolt','blocks','pyramid','atom','sigma','tree','you','scale','chat','chart','card','road','grid','loop','book'];
const errs=[],warn=[];
const ctx={window:{},self:{},console};ctx.window=ctx;ctx.self=ctx;vm.createContext(ctx);
function load(f){const p=path.join(dir,f);if(!fs.existsSync(p)){errs.push('missing file '+f);return;}
  try{vm.runInContext(fs.readFileSync(p,'utf8'),ctx,{filename:f});}catch(e){errs.push(f+': '+e.message);}}
['i18n.js','categories.js','figures.js','version.js','catalog.js'].forEach(load);
(ctx.PW_FILES||[]).forEach(load);
const I=ctx.PW_I18N||{},C=ctx.PW_CATS||{},P=ctx.PW_CONTENT||{},F=ctx.PW_FIG||[],FT=ctx.PW_FIG_TEXT||{};
// i18n
const enK=Object.keys(I.en||{});
LANGS.forEach(l=>{if(!I[l])return errs.push('i18n missing language '+l);enK.forEach(k=>{if(!(k in I[l]))errs.push(`i18n ${l} missing key ${k}`);});});
// categories
for(const c in C){const k=C[c];if(!/^[a-z0-9]{2,8}$/.test(c))errs.push('bad category id '+c);
  LANGS.forEach(l=>{if(!k.n||!k.n[l])errs.push(`category ${c} missing name in ${l}`);});
  if(!k.svg&&!ICONS.includes(k.icon))errs.push(`category ${c} has unknown icon ${k.icon} (use a built-in name or svg)`);}
// content
const report={};
for(const l in P){const ids=new Set();report[l]={};
  P[l].forEach((e,i)=>{const where=`${l}[${i}] ${e.id||'?'}`;
    if(!e.id||!/^[a-z][a-z0-9_]+$/.test(e.id))errs.push(where+': bad id');
    if(ids.has(e.id))errs.push(where+': duplicate id');ids.add(e.id);
    if(!C[e.cat])errs.push(where+': unknown category '+e.cat);
    ['t','s','l','x'].forEach(f=>{if(!e[f]||typeof e[f]!=='string')errs.push(where+': missing '+f);});
    if(e.j!==false)['js','jl','jx'].forEach(f=>{if(!e[f])errs.push(where+': missing junior field '+f+' (or set j:false)');});
    if(e.l&&e.l.length<200)warn.push(where+': long explanation is short ('+e.l.length+' chars)');
    if(e.id&&/^[a-z]+_(en|pl|de|es|fr|zh|uk|lv)_/.test(e.id)&&!e.only)warn.push(where+': language-specific id without only:1');
    report[l][e.cat]=(report[l][e.cat]||0)+1;});}
// shared ids should exist in en and pl
if(P.en&&P.pl){const pl=new Set(P.pl.map(e=>e.id));P.en.filter(e=>!e.only).forEach(e=>{if(!pl.has(e.id))warn.push('shared id only in en: '+e.id);});
  const en=new Set(P.en.map(e=>e.id));P.pl.filter(e=>!e.only).forEach(e=>{if(!en.has(e.id))warn.push('shared id only in pl: '+e.id);});}
// figures
if(F.length!==50)errs.push('expected 50 figures, got '+F.length);
for(const l in FT)for(const id in FT[l]){const x=FT[l][id];if(!F.find(f=>f.id===id))errs.push(`figtext ${l}: unknown figure ${id}`);
  if(!x.bio||!Array.isArray(x.facts)||x.facts.length<3||!x.term||!x.f)errs.push(`figtext ${l}.${id}: needs f, bio, 3 facts, term`);}
// version
if(!ctx.PW_VERSION||!Array.isArray(ctx.PW_CHANGES)||ctx.PW_CHANGES[0].v!==ctx.PW_VERSION)errs.push('version.js: PW_CHANGES[0].v must equal PW_VERSION');
else LANGS.forEach(l=>{if(!ctx.PW_CHANGES[0].notes[l])errs.push('version.js: newest notes missing language '+l);});
// output
console.log('Words per language/category:',JSON.stringify(report));
console.log('Figure bios:',Object.keys(FT).map(l=>l+'='+Object.keys(FT[l]).length).join(' '));
console.log('Categories:',Object.keys(C).length,'| Version:',ctx.PW_VERSION);
warn.forEach(w=>console.log('WARN',w));
errs.forEach(e=>console.log('ERROR',e));
console.log(errs.length?`FAILED with ${errs.length} error(s)`:'OK');
process.exit(errs.length?1:0);
