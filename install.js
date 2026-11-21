/* PaKu family – "Install the app" bar (same file in every PaKu app).
   Shown at the top as soon as the app opens in a browser, hidden once the app is installed.
   Android/desktop Chrome: the button opens the system install dialog.
   iPhone/iPad and other browsers: the button shows how to add the app to the home screen. */
(() => {
  const T = {
    en: ['Install the app', 'Works offline, like a regular app.', 'Install', 'Tap Share ⬆️ at the bottom of Safari, then “Add to Home Screen”.', 'Open the browser menu ⋮ and choose “Install app” or “Add to Home screen”.', 'Open this page in Chrome or Safari to install it (menu ⋯ → Open in browser).', 'Close', 'On Samsung phones, install through Chrome – then Android won\'t show a warning.', 'Open in Chrome', 'All PaKu apps', 'One icon for all PaKu apps.'],
    pl: ['Zainstaluj aplikację', 'Działa offline, jak zwykła aplikacja.', 'Zainstaluj', 'Stuknij „Udostępnij” ⬆️ na dole Safari, potem „Do ekranu początkowego”.', 'Otwórz menu przeglądarki ⋮ i wybierz „Zainstaluj aplikację” lub „Dodaj do ekranu głównego”.', 'Otwórz tę stronę w Chrome lub Safari, żeby ją zainstalować (menu ⋯ → Otwórz w przeglądarce).', 'Zamknij', 'Na telefonach Samsung zainstaluj aplikację przez Chrome – wtedy Android nie pokaże ostrzeżenia.', 'Otwórz w Chrome', 'Wszystkie aplikacje PaKu', 'Jedna ikona dla wszystkich aplikacji PaKu.'],
    de: ['App installieren', 'Funktioniert offline wie eine normale App.', 'Installieren', 'Tippe unten in Safari auf „Teilen“ ⬆️ und dann auf „Zum Home-Bildschirm“.', 'Öffne das Browsermenü ⋮ und wähle „App installieren“ oder „Zum Startbildschirm hinzufügen“.', 'Öffne diese Seite in Chrome oder Safari, um sie zu installieren (Menü ⋯ → Im Browser öffnen).', 'Schließen', 'Auf Samsung-Handys über Chrome installieren – dann zeigt Android keine Warnung.', 'In Chrome öffnen', 'Alle PaKu-Apps', 'Ein Symbol für alle PaKu-Apps.'],
    es: ['Instala la app', 'Funciona sin conexión, como una app normal.', 'Instalar', 'Toca Compartir ⬆️ abajo en Safari y luego «Añadir a pantalla de inicio».', 'Abre el menú del navegador ⋮ y elige «Instalar aplicación» o «Añadir a pantalla de inicio».', 'Abre esta página en Chrome o Safari para instalarla (menú ⋯ → Abrir en el navegador).', 'Cerrar', 'En móviles Samsung, instala desde Chrome: así Android no mostrará ninguna advertencia.', 'Abrir en Chrome', 'Todas las apps PaKu', 'Un solo icono para todas las apps PaKu.'],
    fr: ['Installer l’app', 'Fonctionne hors ligne, comme une app normale.', 'Installer', 'Touchez Partager ⬆️ en bas de Safari, puis « Sur l’écran d’accueil ».', 'Ouvrez le menu du navigateur ⋮ et choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil ».', 'Ouvrez cette page dans Chrome ou Safari pour l’installer (menu ⋯ → Ouvrir dans le navigateur).', 'Fermer', 'Sur les téléphones Samsung, installez via Chrome – Android n’affichera alors pas d’avertissement.', 'Ouvrir dans Chrome', 'Toutes les apps PaKu', 'Une seule icône pour toutes les apps PaKu.'],
    zh: ['安装应用', '可离线使用，就像普通应用一样。', '安装', '点击 Safari 底部的“分享”⬆️，然后选择“添加到主屏幕”。', '打开浏览器菜单 ⋮，选择“安装应用”或“添加到主屏幕”。', '请在 Chrome 或 Safari 中打开此页面进行安装（菜单 ⋯ → 在浏览器中打开）。', '关闭', '在三星手机上请通过 Chrome 安装，这样安卓就不会显示警告。', '在 Chrome 中打开', '全部 PaKu 应用', '一个图标，打开所有 PaKu 应用。'],
    uk: ['Встанови застосунок', 'Працює офлайн, як звичайний застосунок.', 'Встановити', 'Натисни «Поділитися» ⬆️ унизу Safari, потім «На початковий екран».', 'Відкрий меню браузера ⋮ і вибери «Установити застосунок» або «Додати на головний екран».', 'Відкрий цю сторінку в Chrome або Safari, щоб установити (меню ⋯ → Відкрити в браузері).', 'Закрити', 'На телефонах Samsung встановлюй через Chrome – тоді Android не покаже попередження.', 'Відкрити в Chrome', 'Усі застосунки PaKu', 'Одна іконка для всіх застосунків PaKu.'],
    lv: ['Instalē lietotni', 'Darbojas bezsaistē kā parasta lietotne.', 'Instalēt', 'Safari apakšā pieskaries “Kopīgot” ⬆️, tad “Pievienot sākuma ekrānam”.', 'Atver pārlūka izvēlni ⋮ un izvēlies “Instalēt lietotni” vai “Pievienot sākuma ekrānam”.', 'Atver šo lapu pārlūkā Chrome vai Safari, lai to instalētu (izvēlne ⋯ → Atvērt pārlūkā).', 'Aizvērt', 'Samsung tālruņos instalē caur Chrome – tad Android nerādīs brīdinājumu.', 'Atvērt pārlūkā Chrome', 'Visas PaKu lietotnes', 'Viena ikona visām PaKu lietotnēm.']
  };
  const mq = q => { try { return matchMedia(q).matches; } catch (e) { return false; } };
  const standalone = () => mq('(display-mode: standalone)') || mq('(display-mode: fullscreen)') || mq('(display-mode: minimal-ui)') || navigator.standalone === true;
  const ua = navigator.userAgent || '';
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const samsung = /SamsungBrowser/.test(ua);
  const inApp = /FBAN|FBAV|Instagram|Messenger|Line\/|TikTok|Snapchat|\bwv\)/.test(ua);
  const KEY = 'paku.install.hidden';
  /* opened from the PaKu launcher (one icon with tiles): show a way back instead of an install bar */
  const HUB = '/PaKuFamily/';
  const isHub = location.pathname.indexOf(HUB) === 0;
  const fromLauncher = () => { try { return !isHub && sessionStorage.getItem('paku.launcher') === '1'; } catch (e) { return false; } };
  let prompt = null, bar = null, hintOn = false;
  const hidden = () => { try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; } };
  const lang = () => { const l = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase(); return T[l] ? l : 'en'; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function css() {
    const s = document.createElement('style');
    s.textContent = `#pakuInstall{position:relative;z-index:50;display:flex;align-items:center;gap:.7rem;padding:.65rem .8rem;background:#EDE3FB;color:#2A1F45;border-bottom:1px solid #D9C8F3;font:15px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;text-align:left}
#pakuInstall img{width:40px;height:40px;border-radius:10px;flex:none}
#pakuInstall .pi-tx{flex:1;min-width:0}#pakuInstall b{display:block;font-size:15px}#pakuInstall small{display:block;font-size:13px;color:#5D5470}
#pakuInstall .pi-hint{display:block;margin-top:.35rem;font-size:13.5px;color:#2A1F45;font-weight:600}
#pakuInstall .pi-btn{display:inline-flex;align-items:center;text-decoration:none;flex:none;min-height:42px;padding:0 1rem;border:0;border-radius:999px;background:#7a5ca8;color:#fff;font:inherit;font-weight:700;cursor:pointer}
#pakuInstall .pi-x{flex:none;width:36px;height:36px;border:0;border-radius:50%;background:transparent;color:#5D5470;font-size:20px;cursor:pointer}
#pakuBack{position:relative;z-index:50;padding:calc(.35rem + env(safe-area-inset-top)) .8rem .35rem;background:#EDE3FB;border-bottom:1px solid #D9C8F3;font:15px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
#pakuBack a{display:inline-flex;align-items:center;min-height:40px;padding:0 .9rem;border-radius:999px;color:#2A1F45;font-weight:700;text-decoration:none}
#pakuBack a:focus-visible{outline:3px solid #7a5ca8}
@media (prefers-color-scheme: dark){#pakuBack{background:#2E2545;border-color:#45396A}#pakuBack a{color:#F1EBFB}#pakuInstall{background:#2E2545;color:#F1EBFB;border-color:#45396A}#pakuInstall small{color:#C9BEDF}#pakuInstall .pi-hint{color:#F1EBFB}#pakuInstall .pi-x{color:#C9BEDF}}`;
    document.head.appendChild(s);
  }
  function icon() {
    const l = document.querySelector('link[rel="apple-touch-icon"]') || document.querySelector('link[rel~="icon"]');
    return l ? l.getAttribute('href') : 'icon-192.png';
  }
  function render() {
    if (!bar) return;
    const t = T[lang()];
    if (bar.id === 'pakuBack') { bar.innerHTML = `<a href="${HUB}?home=1">← ${esc(t[9])}</a>`; return; }
    const hint = ios ? t[3] : inApp ? t[5] : samsung ? t[7] : t[4];
    /* Samsung Internet builds its own outdated package and Android warns about it – send people to Chrome instead */
    if (samsung && !inApp) {
      const url = 'intent://' + location.host + location.pathname + location.search + '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent(location.href) + ';end';
      bar.innerHTML = `<img src="${esc(icon())}" alt=""><span class="pi-tx"><b>${esc(t[0])}</b><span class="pi-hint">${esc(t[7])}</span></span><a class="pi-btn" href="${esc(url)}">${esc(t[8])}</a><button class="pi-x" type="button" aria-label="${esc(t[6])}">×</button>`;
      bar.querySelector('.pi-x').onclick = () => { try { sessionStorage.setItem(KEY, '1'); } catch (e) { } remove(); };
      return;
    }
    bar.innerHTML = `<img src="${esc(icon())}" alt=""><span class="pi-tx"><b>${esc(t[0])}</b><small>${esc(isHub ? t[10] : t[1])}</small>${hintOn ? `<span class="pi-hint" role="status">${esc(hint)}</span>` : ''}</span>` +
      (ios && !prompt ? '' : `<button class="pi-btn" type="button">${esc(t[2])}</button>`) +
      `<button class="pi-x" type="button" aria-label="${esc(t[6])}">×</button>`;
    const b = bar.querySelector('.pi-btn');
    if (b) b.onclick = async () => {
      if (prompt) { const p = prompt; prompt = null; p.prompt(); try { const r = await p.userChoice; if (r && r.outcome === 'accepted') remove(); } catch (e) { } render(); return; }
      hintOn = true; render();
    };
    bar.querySelector('.pi-x').onclick = () => { try { sessionStorage.setItem(KEY, '1'); } catch (e) { } remove(); };
  }
  function remove() { if (bar && bar.id !== 'pakuBack') { bar.remove(); bar = null; } }
  function show() {
    if (bar || /[?&]sos=1/.test(location.search)) return;
    if (fromLauncher()) {
      bar = document.createElement('nav'); bar.id = 'pakuBack';
      document.body.insertBefore(bar, document.body.firstChild);
      render(); return;
    }
    if (standalone() || hidden()) return;
    bar = document.createElement('div'); bar.id = 'pakuInstall'; bar.setAttribute('role', 'region');
    if (ios) hintOn = true;               // on iPhone there is no install button – show the steps right away
    document.body.insertBefore(bar, document.body.firstChild);
    render();
  }
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); prompt = e; render(); });
  window.addEventListener('appinstalled', () => { prompt = null; remove(); });
  try { matchMedia('(display-mode: standalone)').addEventListener('change', () => { if (standalone()) remove(); }); } catch (e) { }
  /* follow the app's language: every PaKu app sets <html lang> */
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  css();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show); else show();
})();
