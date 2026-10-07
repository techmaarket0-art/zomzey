/* ==========================================================================
   ZOMZEY homepage — interactions
   Progressive enhancement: the page is complete without this file.
   ========================================================================== */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const mqMobile = window.matchMedia('(max-width: 767px)');
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
  };
  const svgNS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}) => {
    const n = document.createElementNS(svgNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };
  const debounce = (fn, ms = 120) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  /* ---------------- Header ---------------- */
  const header = $('[data-header]');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- Tools dropdown ---------------- */
  const toolsBtn = $('[data-tools-toggle]');
  const toolsMenu = $('[data-tools-menu]');
  if (toolsBtn && toolsMenu) {
    const close = (focus) => {
      toolsBtn.setAttribute('aria-expanded', 'false');
      toolsMenu.hidden = true;
      if (focus) toolsBtn.focus();
    };
    toolsBtn.addEventListener('click', () => {
      const open = toolsBtn.getAttribute('aria-expanded') === 'true';
      toolsBtn.setAttribute('aria-expanded', String(!open));
      toolsMenu.hidden = open;
    });
    document.addEventListener('click', (e) => {
      if (!toolsMenu.hidden && !e.target.closest('.nav__more')) close(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !toolsMenu.hidden) close(true);
    });
    toolsMenu.addEventListener('focusout', (e) => {
      if (!e.relatedTarget || !e.relatedTarget.closest('.nav__more')) close(false);
    });
  }

  /* ---------------- Dialog helpers (menu + brief sheet) ---------------- */
  const wireDialog = (dlg) => {
    if (!dlg) return;
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) dlg.close();            // backdrop
      if (e.target.closest('[data-close]')) dlg.close();
    });
  };
  const menu = $('[data-menu]');
  wireDialog(menu);
  const menuOpen = $('[data-menu-open]');
  if (menuOpen && menu) {
    menuOpen.addEventListener('click', () => menu.showModal());
    menu.addEventListener('close', () => menuOpen.focus());
  }

  /* ---------------- Intent: one state, many places ---------------- */
  const dockLabel = $('[data-dock-label]');
  const dockGlyph = $('[data-dock-glyph]');
  const dockCta = $('[data-dock-cta]');
  const setIntent = (intent, { focusTab = false, persist = true } = {}) => {
    root.dataset.intent = intent;
    $$('[data-intent-tab]').forEach((tab) => {
      const on = tab.dataset.intentTab === intent;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focusTab) tab.focus();
    });
    $$('[data-intent-panel]').forEach((p) => { p.hidden = p.dataset.intentPanel !== intent; });
    $$('[data-intent-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.intentToggle === intent)));
    if (dockLabel) {
      dockLabel.textContent = intent === 'need' ? 'Post free' : 'Join free';
      dockGlyph.className = intent === 'need' ? 'g g--sq' : 'g g--ci';
      dockCta.setAttribute('href', intent === 'need' ? '#join' : '#opportunities');
    }
    if (persist) store.set('zz-intent', intent);
    sizeAllPicks();
  };
  const tabs = $$('.intent__tab[data-intent-tab]');
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => setIntent(tab.dataset.intentTab));
    tab.addEventListener('keydown', (e) => {
      let j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') j = 0;
      if (e.key === 'End') j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); setIntent(tabs[j].dataset.intentTab, { focusTab: true }); }
    });
  });
  $$('[data-intent-toggle]').forEach((b) => b.addEventListener('click', () => setIntent(b.dataset.intentToggle)));

  /* Inline select sizing (fallback where field-sizing isn't supported) */
  const supportsFieldSizing = window.CSS && CSS.supports && CSS.supports('field-sizing', 'content');
  const measurer = document.createElement('span');
  measurer.setAttribute('aria-hidden', 'true');
  measurer.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;left:-9999px;top:0;';
  document.body.appendChild(measurer);
  function sizePick(sel) {
    if (supportsFieldSizing || sel.offsetParent === null) return;
    const cs = getComputedStyle(sel);
    measurer.style.font = cs.font;
    measurer.style.letterSpacing = cs.letterSpacing;
    measurer.style.fontStretch = cs.fontStretch;
    measurer.textContent = sel.options[sel.selectedIndex].text;
    const pad = parseFloat(cs.paddingRight) + parseFloat(cs.paddingLeft);
    sel.style.width = Math.ceil(measurer.getBoundingClientRect().width + pad + 2) + 'px';
  }
  function sizeAllPicks() { $$('select[data-autosize]').forEach(sizePick); }
  $$('select[data-autosize]').forEach((s) => s.addEventListener('change', () => sizePick(s)));

  /* Earn: sensible offer for each role */
  const roleSel = $('[data-earn-role]');
  const offerSel = $('[data-earn-offer]');
  const roleToOffer = { bookshop: 'shelf', creator: 'ugc', venue: 'slot', bookclub: 'pick', musician: 'slot', podcaster: 'reviews', cafe: 'shelf', community: 'event', agency: 'roster' };
  if (roleSel && offerSel) {
    roleSel.addEventListener('change', () => {
      const v = roleToOffer[roleSel.value];
      if (v) { offerSel.value = v; sizePick(offerSel); }
    });
  }

  /* Builder submit → take the visitor somewhere meaningful on this page */
  const needForm = $('[data-builder="need"]');
  const earnForm = $('[data-builder="earn"]');
  const whoToPio = { 'an author': 'authors', 'a brand': 'beauty', 'a founder': 'apps', 'a musician': 'music', 'a small business': 'food', 'a course creator': 'courses' };
  const roleToFilter = { bookshop: 'books', creator: 'all', venue: 'music', bookclub: 'books', musician: 'events', podcaster: 'all', cafe: 'food', community: 'all', agency: 'all' };
  if (needForm) needForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const who = needForm.elements.who.value;
    selectPioneer(whoToPio[who] || 'authors');
    $('#network').scrollIntoView({ behavior: mqReduce.matches ? 'auto' : 'smooth' });
  });
  if (earnForm) earnForm.addEventListener('submit', (e) => {
    e.preventDefault();
    applyFilter(roleToFilter[earnForm.elements.role.value] || 'all');
    $('#opportunities').scrollIntoView({ behavior: mqReduce.matches ? 'auto' : 'smooth' });
  });

  /* ---------------- Hero network ---------------- */
  const stage = $('[data-stage]');
  const linesSvg = $('[data-stage-lines]');
  const motionBtn = $('[data-motion-toggle]');
  let paused = mqReduce.matches || store.get('zz-motion') === 'off';
  let heroVisible = true;
  let routes = [];

  const LINKS = [
    { from: 'maya', fa: 'top', to: 'slipA', ta: 0.24, cls: 'ln', dot: true },
    { from: 'brightshelf', fa: 'top', to: 'slipA', ta: 0.62, cls: 'ln', dot: true },
    { from: 'lantern', fa: 'top', to: 'slipB', ta: 0.42, cls: 'ln', dot: true },
    { from: 'offerBS', fa: 'bottom', to: 'seal', ta: 'top', cls: 'ln ln--deal', dot: true, deal: true },
    { from: 'maya', fa: 'bottom', to: 'offerMaya', ta: 'top', cls: 'ln', short: true },
    { from: 'brightshelf', fa: 'bottom', to: 'offerBS', ta: 'top', cls: 'ln', short: true },
  ];

  function nodeBox(name, scale, sRect) {
    const n = stage.querySelector(`[data-node="${name}"]`);
    if (!n || n.offsetParent === null) return null;
    const r = n.firstElementChild.getBoundingClientRect();
    return { x: (r.left - sRect.left) / scale, y: (r.top - sRect.top) / scale, w: r.width / scale, h: r.height / scale, node: n };
  }

  function drawStage() {
    if (!stage || !linesSvg) return;
    linesSvg.innerHTML = '';
    routes = [];
    if (mqMobile.matches) return;
    const sRect = stage.getBoundingClientRect();
    // scale = rendered px per design unit, read from a node whose design width is known
    const ref = stage.querySelector('[data-node="slipA"]');
    const scale = ref ? ref.getBoundingClientRect().width / parseFloat(getComputedStyle(ref).getPropertyValue('--w')) : 0;
    if (!scale) return;
    linesSvg.setAttribute('viewBox', `0 0 ${(sRect.width / scale).toFixed(2)} ${(sRect.height / scale).toFixed(2)}`);
    LINKS.forEach((L) => {
      const a = nodeBox(L.from, scale, sRect);
      const b = nodeBox(L.to, scale, sRect);
      if (!a || !b) return;
      const ax = a.x + a.w / 2;
      const ay = L.fa === 'top' ? a.y : a.y + a.h;
      const bx = typeof L.ta === 'number' ? b.x + b.w * L.ta : b.x + b.w / 2;
      const by = L.ta === 'top' ? b.y : b.y + b.h;
      const dy = (by - ay);
      const d = L.short
        ? `M${ax} ${ay} L${ax} ${by}`
        : `M${ax} ${ay} C${ax} ${ay + dy * 0.55} ${bx} ${by - dy * 0.45} ${bx} ${by}`;
      const path = el('path', { d, class: L.cls });
      linesSvg.appendChild(path);
      if (!L.short) {
        linesSvg.appendChild(el('circle', { cx: ax, cy: ay, r: 3.4, class: 'end' }));
        linesSvg.appendChild(el('circle', { cx: bx, cy: by, r: 3.4, class: 'end' }));
      }
      if (L.dot) {
        const dot = el('circle', { r: 4.2, class: 'dot', opacity: 0 });
        linesSvg.appendChild(dot);
        routes.push({ path, dot, len: path.getTotalLength(), target: b.node, deal: !!L.deal });
      }
    });
    // offset start so dots don't move in unison
    routes.forEach((r, i) => { r.offset = i * 0.21; });
    renderDots(performance.now());
  }

  const PERIOD = 4200; // ms per journey
  let raf = 0;
  let lastArrive = new WeakMap();
  function renderDots(now) {
    routes.forEach((r) => {
      const t = ((now / PERIOD) + r.offset) % 1;
      // travel during the first 60% of the cycle, rest otherwise
      const p = Math.min(t / 0.6, 1);
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const pt = r.path.getPointAtLength(e * r.len);
      r.dot.setAttribute('cx', pt.x);
      r.dot.setAttribute('cy', pt.y);
      r.dot.setAttribute('opacity', p >= 1 ? 0 : Math.min(1, p * 6));
      if (p >= 1 && !r.deal) {
        const prev = lastArrive.get(r) || 0;
        if (now - prev > PERIOD * 0.8) {
          lastArrive.set(r, now);
          r.target.classList.remove('is-ping');
          void r.target.offsetWidth;
          r.target.classList.add('is-ping');
        }
      }
    });
  }
  function loop(now) {
    renderDots(now);
    raf = requestAnimationFrame(loop);
  }
  function syncMotion() {
    cancelAnimationFrame(raf);
    const run = !paused && heroVisible && !document.hidden && !mqMobile.matches;
    if (run) raf = requestAnimationFrame(loop);
    else routes.forEach((r) => r.dot.setAttribute('opacity', 0));
    if (motionBtn) {
      motionBtn.setAttribute('aria-pressed', String(paused));
      motionBtn.title = paused ? 'Play motion' : 'Pause motion';
      motionBtn.querySelector('use').setAttribute('href', paused ? '#i-play' : '#i-pause');
    }
  }
  if (motionBtn) motionBtn.addEventListener('click', () => {
    paused = !paused;
    store.set('zz-motion', paused ? 'off' : 'on');
    syncMotion();
  });
  mqReduce.addEventListener('change', () => { paused = mqReduce.matches; syncMotion(); });
  document.addEventListener('visibilitychange', syncMotion);
  if (stage) {
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; syncMotion(); }, { threshold: 0 }).observe(stage);
    new ResizeObserver(debounce(() => { drawStage(); syncMotion(); }, 80)).observe(stage);
  }

  /* Headline rows highlight their zone of the network */
  const heroEl = $('.hero');
  $$('.hero__row').forEach((row) => {
    const on = () => {
      const z = row.dataset.zone;
      heroEl.dataset.focus = z;
      row.classList.add('is-focus');
      if (stage) {
        stage.dataset.focus = z;
        $$('.node', stage).forEach((n) => n.classList.toggle('is-zone', n.dataset.zone === z));
      }
    };
    const off = () => {
      delete heroEl.dataset.focus;
      row.classList.remove('is-focus');
      if (stage) { delete stage.dataset.focus; $$('.node', stage).forEach((n) => n.classList.remove('is-zone')); }
    };
    row.addEventListener('mouseenter', on);
    row.addEventListener('mouseleave', off);
  });

  /* ---------------- Record: follow one opportunity ---------------- */
  let resetSteps = null;
  const steps = $$('[data-step]');
  const stepLinks = $$('[data-step-link]');
  const recordList = $('[data-record]');
  if (steps.length) {
    const setActive = (id) => {
      const idx = steps.findIndex((x) => x.dataset.step === id);
      steps.forEach((s, i) => s.classList.toggle('is-passed', i <= idx));
      steps.forEach((s) => {
        const on = s.dataset.step === id;
        s.classList.toggle('is-active', on);
        if (on) s.classList.add('is-seen');
      });
      stepLinks.forEach((a) => {
        if (a.dataset.stepLink === id) {
          a.setAttribute('aria-current', 'step');
          if (mqMobile.matches) {
            const bar = a.closest('ol');
            const target = a.offsetLeft - 16;
            if (bar && Math.abs(bar.scrollLeft - target) > 4) bar.scrollTo({ left: target, behavior: mqReduce.matches ? 'auto' : 'smooth' });
          }
        } else a.removeAttribute('aria-current');
      });
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.dataset.step); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    steps.forEach((s) => io.observe(s));
    resetSteps = () => { if (!steps[0].classList.contains('is-active') || stepLinks[0].getAttribute('aria-current') !== 'step') setActive('posted'); };
    // leaving the section upwards resets the stage chips to the start
    const recordSec = $('#how');
    if (recordSec) new IntersectionObserver(([e]) => { if (!e.isIntersecting && e.boundingClientRect.top > 0) setActive('posted'); }).observe(recordSec);
    setActive('posted');
    // stamps also land when their paper is comfortably visible
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.closest('[data-step]').classList.add('is-seen'); });
    }, { threshold: 0.55 });
    $$('[data-stamp]').forEach((s) => io2.observe(s));
  }

  // progress rail along the receipt
  let rail = null;
  function placeRail() {
    if (!recordList) return;
    const paper = $('.rstep__paper', recordList);
    if (!paper) return;
    if (!rail) {
      rail = document.createElement('div');
      rail.className = 'record__rail';
      rail.setAttribute('aria-hidden', 'true');
      rail.appendChild(document.createElement('span'));
      recordList.appendChild(rail);
    }
    rail.hidden = !window.matchMedia('(min-width: 1024px)').matches;
    rail.style.left = (paper.offsetLeft - 22) + 'px';
    updateRail();
  }
  function updateRail() {
    // above the record entirely → the stage chips start again at 01
    if (recordList && recordList.getBoundingClientRect().top > window.innerHeight && typeof resetSteps === 'function') resetSteps();
    if (!rail || rail.hidden) return;
    const r = recordList.getBoundingClientRect();
    const mid = window.innerHeight * 0.55;
    const p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
    rail.style.setProperty('--p', p.toFixed(4));
  }
  window.addEventListener('scroll', updateRail, { passive: true });

  /* ---------------- Index: who pitches whom ---------------- */
  const PAIRS = {
    authors: { inf: ['tiktok', 'podcast', 'newsletter', 'blog'], hub: ['bookshops', 'bookclubs', 'libraries'], text: '<b>Authors</b> are usually pitched by BookTok creators, podcasters, newsletter writers, bookshops, book clubs and libraries.' },
    music: { inf: ['tiktok', 'youtube', 'instagram', 'twitch'], hub: ['venues', 'cafes', 'clubs'], text: '<b>Musicians &amp; bands</b> hear from venues, cafés with a stage, clubs, and TikTok, YouTube and Twitch creators.' },
    food: { inf: ['instagram', 'tiktok', 'ugc'], hub: ['cafes', 'retail', 'boxes', 'trade'], text: '<b>Food &amp; drink</b> brands meet cafés, independent retailers, subscription boxes, trade shows and food creators.' },
    beauty: { inf: ['tiktok', 'instagram', 'youtube', 'ugc'], hub: ['retail', 'boxes'], text: '<b>Beauty &amp; cosmetics</b> brands meet TikTok, Instagram and UGC creators, independent retailers and subscription boxes.' },
    apps: { inf: ['youtube', 'podcast', 'newsletter', 'blog'], hub: ['community', 'trade'], text: '<b>App &amp; SaaS founders</b> are pitched by YouTubers, podcasters, newsletter writers, communities and trade shows.' },
    courses: { inf: ['youtube', 'newsletter', 'podcast', 'instagram'], hub: ['community', 'libraries', 'clubs'], text: '<b>Course creators</b> meet YouTubers, newsletter writers, podcasters, community groups, libraries and clubs.' },
    travel: { inf: ['youtube', 'instagram', 'blog'], hub: ['clubs', 'retail', 'boxes', 'community'], text: '<b>Travel gear makers</b> meet adventure clubs, outdoor YouTubers, bloggers, retailers and subscription boxes.' },
    kids: { inf: ['instagram', 'blog', 'ugc'], hub: ['libraries', 'community', 'retail'], text: '<b>Kids &amp; parenting</b> makers meet parenting creators, library storytimes, community groups and toy shops.' },
    fitness: { inf: ['tiktok', 'instagram', 'youtube'], hub: ['clubs', 'community', 'cafes'], text: '<b>Fitness &amp; wellness</b> brands meet clubs, community groups, cafés and TikTok, Instagram and YouTube creators.' },
  };
  const indexEl = $('[data-index]');
  const indexSvg = $('[data-index-lines]');
  const indexSummary = $('[data-index-summary]');
  let currentPio = 'authors';
  function selectPioneer(key, { animate = true } = {}) {
    if (!indexEl || !PAIRS[key]) return;
    currentPio = key;
    $$('[data-pio]', indexEl).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pio === key)));
    const m = PAIRS[key];
    $$('[data-index-list="inf"] li', indexEl).forEach((li) => li.classList.toggle('is-match', m.inf.includes(li.dataset.key)));
    $$('[data-index-list="hub"] li', indexEl).forEach((li) => li.classList.toggle('is-match', m.hub.includes(li.dataset.key)));
    if (indexSummary) indexSummary.innerHTML = m.text;
    drawIndex(animate);
  }
  function drawIndex(animate) {
    if (!indexSvg) return;
    indexSvg.innerHTML = '';
    if (mqMobile.matches) return;
    const map = indexSvg.parentElement.getBoundingClientRect();
    indexSvg.setAttribute('viewBox', `0 0 ${map.width} ${map.height}`);
    const btn = $(`[data-pio="${currentPio}"]`, indexEl);
    if (!btn) return;
    const b = btn.getBoundingClientRect();
    const by = b.top + b.height / 2 - map.top;
    const left = b.left - map.left - 14, right = b.right - map.left + 14;
    const textRect = (li) => li.getBoundingClientRect();
    // lines run level out of the Pioneer column, then fan out inside the gutter (never across labels)
    const pioCol = btn.closest('.index__col').getBoundingClientRect();
    const gutL = pioCol.left - map.left, gutR = pioCol.right - map.left;
    const mk = (x1, y1, x2, y2, i) => {
      const xg = x2 < x1 ? Math.min(x1, gutL) : Math.max(x1, gutR);
      const mx = (xg + x2) / 2;
      const p = el('path', { d: `M${x1} ${y1} L${xg} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}` });
      indexSvg.appendChild(p);
      const c = el('circle', { cx: x2, cy: y2, r: 4.5 });
      indexSvg.appendChild(c);
      if (animate && !mqReduce.matches) {
        const len = p.getTotalLength();
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
        p.getBoundingClientRect();
        p.style.transition = `stroke-dashoffset 640ms cubic-bezier(.2,.7,.2,1) ${i * 40}ms`;
        p.style.strokeDashoffset = 0;
        c.style.opacity = 0;
        c.style.transition = `opacity 240ms ease ${400 + i * 40}ms`;
        requestAnimationFrame(() => { c.style.opacity = 1; });
      }
    };
    let i = 0;
    $$('[data-index-list="inf"] li.is-match', indexEl).forEach((li) => {
      const r = textRect(li);
      mk(left, by, r.right - map.left + 2, r.top + r.height / 2 - map.top, i++);
    });
    $$('[data-index-list="hub"] li.is-match', indexEl).forEach((li) => {
      const r = textRect(li);
      mk(right, by, r.left - map.left - 2, r.top + r.height / 2 - map.top, i++);
    });
  }
  if (indexEl) {
    $$('[data-pio]', indexEl).forEach((b) => b.addEventListener('click', () => selectPioneer(b.dataset.pio)));
    selectPioneer('authors', { animate: false });
  }

  /* ---------------- Board: filters + brief sheet ---------------- */
  const board = $('[data-board]');
  const countEl = $('[data-board-count]');
  let currentFilter = 'all';
  function applyFilter(f) {
    if (!board) return;
    currentFilter = f;
    $$('[data-filter]', board).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === f)));
    const grid = $('[data-board-grid]', board);
    if (grid) grid.dataset.showing = f;
    let n = 0;
    const dimMode = !mqMobile.matches;   // desktop/tablet keep the board full and dim the rest
    $$('.board__item', board).forEach((it) => {
      const show = f === 'all' || it.dataset.cat === f;
      it.classList.toggle('is-dim', dimMode && !show);
      it.inert = dimMode && !show;
      if (dimMode) { it.hidden = false; if (show) n++; return; }
      if (show) {
        n++;
        if (it.hidden) { it.hidden = false; it.classList.remove('is-entering'); void it.offsetWidth; it.classList.add('is-entering'); }
      } else it.hidden = true;
    });
    if (!dimMode && f === 'all') n = Math.min(n, 5);   // mobile feed shows the first five
    if (countEl) countEl.textContent = `${n} opportunit${n === 1 ? 'y' : 'ies'} shown`;
  }
  if (board) $$('[data-filter]', board).forEach((c) => c.addEventListener('click', () => applyFilter(c.dataset.filter)));

  const BRIEFS = {
    'Halloran Street — debut EP tour': 'We’re a four-piece indie band from Leeds touring our debut EP across six UK cities this spring. We’d love venues and cafés with a stage to host a date, plus creators who can film a set or a behind-the-scenes piece.',
    'The Quiet Hours': 'Debut crime novel set in Salford. Looking for book clubs, independent bookshops and BookTok readers in the North West who love a slow-burn mystery.',
    'Fragrance-free SPF 50 launch': 'Launching a fragrance-free daily SPF for sensitive skin. Looking for skincare UGC creators with 5k–50k followers for honest first-impression videos.',
    'Small-batch hot sauce': 'Three small-batch hot sauces made in Bristol. Looking for cafés and delis for counter tastings, and food creators for recipe content.',
    'Tally — budgeting for students': 'A budgeting app built for students. Looking for personal-finance YouTubers, newsletter writers and student communities ahead of freshers’ season.',
    'Thursday open-mic nights': 'Independent venue in Glasgow running free open-mic nights every Thursday. Looking for local creators and student groups to help fill the room.',
    'Packable rain shell': 'A packable rain shell for hikers. Looking for hiking clubs, outdoor YouTubers and subscription boxes for field reviews and kit features.',
    'Wooden stacking toys': 'Hand-finished wooden stacking toys. Looking for parenting creators, library storytimes and independent toy shops.',
    'Watercolour for beginners': 'An online watercolour course for complete beginners. Looking for craft communities, YouTubers and creative newsletters.',
  };
  const brief = $('[data-brief]');
  const briefBody = $('[data-brief-body]');
  wireDialog(brief);
  let briefOpener = null;
  if (board && brief) {
    board.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-open-brief]');
      if (!btn) return;
      const card = btn.closest('.slip');
      const title = btn.textContent.trim().replace(/\u2011/g, '-').replace(/\u00a0/g, ' ');
      const tag = card.querySelector('.tag').outerHTML;
      const art = card.querySelector('.art svg');
      const facts = document.createElement('dl');
      facts.className = 'rec__facts';
      const add = (k, v) => { if (!v) return; const d = document.createElement('div'); const dt = document.createElement('dt'); const dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; d.append(dt, dd); facts.appendChild(d); };
      const metaVal = (label) => { const m = [...card.querySelectorAll('.slip__meta div')].find((d) => d.querySelector('dt').textContent.trim() === label); return m ? m.querySelector('dd').textContent.trim() : ''; };
      const loc = card.querySelector('.slip__loc');
      const offersEl = card.querySelector('.slip__offers').cloneNode(true);
      offersEl.querySelectorAll('.slip__time, .roster').forEach((n) => n.remove());
      const price = card.querySelector('.slip__price');
      add('Wants', card.dataset.wants || metaVal('Wants'));
      add('Where', loc ? loc.textContent.replace('Where:', '').trim() : metaVal('Where'));
      add('Budget', price ? price.textContent.trim() : '');
      add('Offers so far', offersEl.textContent.trim());
      const status = card.querySelector('.slip__head .status');
      briefBody.innerHTML = `<div class="brief__tags">${tag}${status ? status.outerHTML : ''}</div><div class="brief__art">${art ? art.outerHTML : ''}</div><h2 class="brief__title" id="brief-title"></h2><p class="brief__text"></p>`;
      briefBody.querySelector('.brief__title').textContent = title;
      briefBody.querySelector('.brief__text').textContent = BRIEFS[title] || '';
      briefBody.appendChild(facts);
      briefOpener = btn;
      brief.showModal();
    });
    brief.addEventListener('close', () => { if (briefOpener) briefOpener.focus(); });
  }

  /* ---------------- Calculator ---------------- */
  const calc = $('[data-calc]');
  if (calc) {
    const range = $('[data-calc-range]', calc);
    const out = $('[data-calc-out]', calc);
    const fEl = $('[data-calc-followers]', calc);
    const tEl = $('[data-calc-tier]', calc);
    const nice = (n) => n < 10000 ? Math.round(n / 100) * 100 : n < 100000 ? Math.round(n / 1000) * 1000 : Math.round(n / 10000) * 10000;
    const money = (v) => v < 100 ? Math.max(5, Math.round(v / 5) * 5) : v < 1000 ? Math.round(v / 10) * 10 : Math.round(v / 50) * 50;
    const update = () => {
      const v = Number(range.value);
      const followers = nice(1000 * Math.pow(10, 3 * v / 100));
      const price = money(followers / 1000 * 10);
      const tier = followers < 10000 ? 'Nano · 1k–10k' : followers < 100000 ? 'Micro · 10k–100k' : followers < 1000000 ? 'Macro · 100k–1M' : 'Mega · quoted individually';
      out.innerHTML = `<span class="num">≈ £${price.toLocaleString('en-GB')}</span>`;
      fEl.textContent = `${followers.toLocaleString('en-GB')} followers`;
      tEl.textContent = tier;
      range.style.setProperty('--fill', v + '%');
      range.setAttribute('aria-valuetext', `${followers.toLocaleString('en-GB')} followers, about £${price.toLocaleString('en-GB')} per feed post`);
    };
    range.value = 28;
    range.addEventListener('input', update);
    update();
  }

  /* ---------------- Dock (mobile) ---------------- */
  const dock = $('[data-dock]');
  if (dock) {
    let pastIntent = false, finaleIn = false;
    const sync = () => { const on = pastIntent && !finaleIn; dock.classList.toggle('is-visible', on); dock.inert = !on; };
    const intentEl = $('[data-intent-root]');
    if (intentEl) new IntersectionObserver(([e]) => { pastIntent = !e.isIntersecting && e.boundingClientRect.top < 0; sync(); }).observe(intentEl);
    const fin = $('.finale');
    if (fin) new IntersectionObserver(([e]) => { finaleIn = e.isIntersecting; sync(); }, { threshold: 0.15 }).observe(fin);
  }

  /* ---------------- Footer accordions on mobile ---------------- */
  const syncFooter = () => $$('.fcol').forEach((d) => {
    d.open = !mqMobile.matches;
    const s = $('summary', d); if (s) s.tabIndex = mqMobile.matches ? 0 : -1;   // static headings on desktop
  });
  $$('.fcol summary').forEach((s) => s.addEventListener('click', (e) => { if (!mqMobile.matches) e.preventDefault(); }));
  const offersList = $('.rec__offers');   // only a tab stop where it scrolls (mobile)
  const syncOffers = () => { if (offersList) offersList.tabIndex = mqMobile.matches ? 0 : -1; };
  syncOffers();
  syncFooter();

  /* ---------------- Reveal ---------------- */
  if (!mqReduce.matches && 'IntersectionObserver' in window) {
    const targets = $$('.record__head > *, .index__head > *, .board__head > *, .doors__head h2, .door, .finale__title, .finale__side, .index__agency');
    targets.forEach((t) => t.setAttribute('data-reveal', ''));
    const rio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach((t) => rio.observe(t));
  }

  /* ---------------- Init ---------------- */
  const saved = store.get('zz-intent');
  setIntent(saved === 'earn' ? 'earn' : 'need', { persist: false });
  const relayout = () => { drawStage(); placeRail(); drawIndex(false); syncMotion(); };
  mqMobile.addEventListener('change', () => { syncFooter(); syncOffers(); relayout(); applyFilter(currentFilter); });
  window.addEventListener('resize', debounce(() => { placeRail(); drawIndex(false); sizeAllPicks(); }, 120));
  const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  ready.then(() => { sizeAllPicks(); relayout(); });
  window.addEventListener('load', relayout);
})();

/* Brief starter (Pioneer door): live draft status, no backend in this concept */
(() => {
  const form = document.querySelector('[data-starter]');
  if (!form) return;
  const what = form.querySelector('[data-starter-what]');
  const status = form.querySelector('[data-starter-status]');
  const sync = () => {
    const ready = what.value.trim().length > 2;
    status.textContent = ready ? 'Ready to post' : 'Draft';
    status.className = 'status ' + (ready ? 'status--ready' : 'status--draft');
  };
  what.addEventListener('input', sync);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!what.value.trim()) { what.setAttribute('aria-invalid', 'true'); status.textContent = 'Add what you’re promoting'; status.className = 'status status--closing'; what.focus(); return; }
    what.removeAttribute('aria-invalid');
    status.textContent = 'Saved — create your free account to post';
    status.className = 'status status--ready';
  });
  what.addEventListener('blur', () => { if (what.value.trim()) what.removeAttribute('aria-invalid'); });
})();
