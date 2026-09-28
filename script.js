(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const CONFIG = window.SOFTIX_CONFIG || {};
  const projects = [...(window.SOFTIX_PROJECTS || [])];

  const icons = () => window.lucide?.createIcons({ attrs: { 'stroke-width': 1.75 } });
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const fmt = n => Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(n);

  /* ---------- Nav ---------- */
  const nav = $('#nav');
  const toggle = $('.nav__toggle');
  const menu = $('#nav-menu');
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 16);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = open => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('no-scroll', open);
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  menu.addEventListener('click', e => e.target.closest('a') && setMenu(false));
  addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));
  matchMedia('(min-width: 901px)').addEventListener('change', e => e.matches && setMenu(false));

  // Link ativo conforme a seção visível
  const navLinks = $$('.nav__links a');
  const spy = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) navLinks.forEach(a => a.classList.toggle('is-active', a.hash === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['#top', ...navLinks.map(a => a.hash), '#depoimentos', '#contato'].forEach(id => $(id) && spy.observe($(id)));

  /* ---------- Reveal on scroll ---------- */
  const revealIO = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('is-visible');
    revealIO.unobserve(en.target);
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  const reveal = (root = document) => $$('.reveal:not(.is-visible)', root).forEach(el => revealIO.observe(el));

  /* ---------- Counters ---------- */
  const countIO = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    countIO.unobserve(en.target);
    const el = en.target, end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const t0 = performance.now(), dur = 1800;
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = pre + Math.round(end * (1 - (1 - p) ** 4)) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: .6 });
  if (!reduceMotion) $$('[data-count]').forEach(el => countIO.observe(el));

  /* ---------- Headline typewriter ---------- */
  const typed = $('#typed');
  if (typed && !reduceMotion) {
    const words = typed.dataset.words.split(',');
    let wi = 0, ci = words[0].length, deleting = false;
    const tick = () => {
      let wait;
      if (!deleting) {
        if (ci < words[wi].length) { ci++; wait = 60 + Math.random() * 70; }
        else { deleting = true; wait = 2400; }
      } else if (ci > 0) { ci--; wait = 38; }
      else { deleting = false; wi = (wi + 1) % words.length; wait = 380; }
      typed.textContent = words[wi].slice(0, ci);
      setTimeout(tick, wait);
    };
    setTimeout(tick, 2600);
  }

  /* ---------- Editor: código sendo digitado ---------- */
  const code = $('#code');
  const deployCard = $('#deploy-card');
  if (code && !reduceMotion) {
    const pre = code.parentElement;
    pre.style.minHeight = pre.offsetHeight + 'px';
    const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push([walker.currentNode, walker.currentNode.data]);
    nodes.forEach(([n]) => { n.data = ''; });
    let i = 0, j = 0;
    const step = () => {
      if (i >= nodes.length) return setTimeout(() => deployCard.classList.add('is-in'), 350);
      const [node, full] = nodes[i];
      node.data = full.slice(0, ++j);
      const ch = full[j - 1];
      if (j >= full.length) { i++; j = 0; }
      setTimeout(step, ch === '\n' ? 120 : ch === ' ' ? 12 : 10 + Math.random() * 30);
    };
    setTimeout(step, 1100);
  } else deployCard?.classList.add('is-in');

  /* ---------- Hero: tilt 3D com o mouse ---------- */
  const stage = $('#stage');
  const hero = $('.hero');
  if (stage && finePointer && !reduceMotion) {
    const clamp = v => Math.max(-1, Math.min(1, v));
    hero.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      const x = clamp((e.clientX - r.left) / r.width * 2 - 1), y = clamp((e.clientY - r.top) / r.height * 2 - 1);
      stage.style.setProperty('--ry', (x * 6).toFixed(2) + 'deg');
      stage.style.setProperty('--rx', (-y * 5).toFixed(2) + 'deg');
    });
    hero.addEventListener('pointerleave', () => {
      stage.style.setProperty('--rx', '0deg');
      stage.style.setProperty('--ry', '0deg');
    });
  }

  /* ---------- Hero: circuito animado (eco do logo) ---------- */
  const canvas = $('#circuit');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const G = 28, TAIL = 80;
    const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
    let W = 0, H = 0, traces = [], running = false, last = 0;

    const makeTrace = () => {
      let x = Math.round(Math.random() * W / G) * G, y = Math.round(Math.random() * H / G) * G;
      let d = Math.random() * 8 | 0;
      const pts = [[x, y]], lens = [0];
      for (let s = 2 + (Math.random() * 3 | 0); s--;) {
        const n = (1 + (Math.random() * 4 | 0)) * G;
        x += DIRS[d][0] * n; y += DIRS[d][1] * n;
        pts.push([x, y]);
        lens.push(lens.at(-1) + Math.hypot(DIRS[d][0] * n, DIRS[d][1] * n));
        d = (d + (Math.random() < .5 ? 1 : 7)) % 8; // curva de 45°, como no logo
      }
      return { pts, lens, len: lens.at(-1), p: -Math.random() * 1400, v: 70 + Math.random() * 90 };
    };

    const pointAt = (t, dist) => {
      let i = 1;
      while (i < t.lens.length - 1 && t.lens[i] < dist) i++;
      const [x0, y0] = t.pts[i - 1], [x1, y1] = t.pts[i];
      const k = (dist - t.lens[i - 1]) / (t.lens[i] - t.lens[i - 1]);
      return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, i];
    };

    const node = (x, y, s) => {
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x - s / 2, y - s / 2, s, s, 1.5) : ctx.rect(x - s / 2, y - s / 2, s, s);
      ctx.fill();
    };

    const draw = dt => {
      ctx.clearRect(0, 0, W, H);
      ctx.lineJoin = ctx.lineCap = 'round';
      for (const t of traces) {
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(25,214,150,.1)';
        ctx.beginPath();
        t.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
        ctx.stroke();
        ctx.fillStyle = 'rgba(25,214,150,.28)';
        node(...t.pts[0], 6);
        node(...t.pts.at(-1), 6);

        t.p += t.v * dt;
        if (t.p > t.len + TAIL) t.p = -Math.random() * 1600;
        if (t.p <= 0) continue;
        const [ax, ay, ai] = pointAt(t, Math.max(0, t.p - TAIL));
        const [bx, by, bi] = pointAt(t, Math.min(t.p, t.len));
        const g = ctx.createLinearGradient(ax, ay, bx, by);
        g.addColorStop(0, 'rgba(25,214,150,0)');
        g.addColorStop(1, 'rgba(25,214,150,.85)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        for (let i = ai; i < bi; i++) ctx.lineTo(...t.pts[i]);
        ctx.lineTo(bx, by);
        ctx.stroke();
        if (t.p <= t.len) {
          ctx.fillStyle = '#6ff5c6';
          ctx.shadowColor = '#19d696';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(bx, by, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    };

    const build = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (w === W && Math.abs(h - H) < 120) return; // ignora a barra de endereço do mobile
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = w; H = h;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      traces = Array.from({ length: Math.round(W * H / 24000) }, makeTrace);
      if (reduceMotion) traces.forEach(t => { t.p = -1; });
      draw(0);
    };

    const loop = now => {
      if (!running) return;
      draw(Math.min((now - last) / 1000, .05));
      last = now;
      requestAnimationFrame(loop);
    };

    new ResizeObserver(build).observe(canvas);
    if (!reduceMotion) new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      if (running) { last = performance.now(); requestAnimationFrame(loop); }
    }).observe(canvas);
  }

  /* ---------- Spotlight nos cards ---------- */
  if (finePointer) $$('[data-spot]').forEach(group => group.addEventListener('pointermove', e => {
    for (const card of group.querySelectorAll('.spot')) {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', e.clientX - r.left + 'px');
      card.style.setProperty('--my', e.clientY - r.top + 'px');
    }
  }));

  /* ---------- Marquee de tecnologias ---------- */
  const STACK = [
    [['React', 'react'], ['Next.js', 'nextdotjs'], ['TypeScript', 'typescript'], ['Node.js', 'nodedotjs'], ['NestJS', 'nestjs'], ['Python', 'python'], ['FastAPI', 'fastapi'], ['Go', 'go'], ['.NET', 'dotnet'], ['GraphQL', 'graphql'], ['Vue.js', 'vuedotjs'], ['Tailwind CSS', 'tailwindcss']],
    [['Flutter', 'flutter'], ['Kotlin', 'kotlin'], ['Swift', 'swift'], ['PostgreSQL', 'postgresql'], ['MongoDB', 'mongodb'], ['Redis', 'redis'], ['Docker', 'docker'], ['Kubernetes', 'kubernetes'], ['Google Cloud', 'googlecloud'], ['Firebase', 'firebase'], ['Terraform', 'terraform'], ['GitHub Actions', 'githubactions'], ['Figma', 'figma']],
  ];
  $$('.marquee').forEach(row => {
    const items = STACK[row.dataset.row].map(([name, slug]) =>
      `<li class="tech"><span class="tech__logo" style="--i:url(https://cdn.jsdelivr.net/npm/simple-icons@13/icons/${slug}.svg)"></span>${name}</li>`).join('');
    row.innerHTML = `<ul class="marquee__track" style="--dur:${STACK[row.dataset.row].length * 4.5}s">${items}${items.replace(/<li /g, '<li aria-hidden="true" ')}</ul>`;
  });

  /* ==========================================================================
     Portfólio
     ========================================================================== */
  const grid = $('#projects-grid');
  const filtersEl = $('#filters');
  const modal = $('#project-modal');
  const modalBody = $('#modal-body');
  let filter = 'Todos';

  const LANG = { TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572a5', Go: '#00add8', Dart: '#00b4ab', Kotlin: '#a97bff', Swift: '#f05138', Java: '#b07219', 'C#': '#178600', PHP: '#4f5d95', Rust: '#dea584', Ruby: '#701516', Vue: '#41b883', HTML: '#e34c26', CSS: '#663399' };
  const COVER_BY_CATEGORY = { web: 'web', mobile: 'mobile', saas: 'dashboard', ia: 'chat', 'e-commerce': 'shop', 'open source': 'code' };
  const repoOf = s => String(s || '').trim().replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/\.git$|\/+$/g, '');

  // Gerador pseudoaleatório com semente (mesmo projeto → mesma capa)
  const rng = str => {
    let a = [...str].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0;
    return () => {
      a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };

  const S = (w, cls = '') => `<span class="sk ${cls}" style="width:${w | 0}%"></span>`;
  const BAR = '<div class="dv__bar"><i></i><i></i><i></i><span></span></div>';
  const COVERS = {
    web: () => `<div class="dv">${BAR}<div class="cv-web"><div class="cv-web__hero"><div class="cv-col">${S(38, 'sk--acc')}${S(94, 'sk--lg')}${S(72, 'sk--lg')}${S(90)}${S(66)}<span class="sk-btn"></span></div><span class="sk-img"></span></div><div class="cv-grid3">${'<span class="sk-box"></span>'.repeat(3)}</div></div></div>`,
    dashboard: r => `<div class="dv">${BAR}<div class="cv-dash"><div class="cv-col cv-dash__side">${S(80, 'sk--acc')}${[62, 74, 55, 68, 50, 60].map(w => S(w)).join('')}</div><div class="cv-dash__main"><div class="cv-grid3">${[0, 1, 2].map(() => `<span class="sk-kpi">${S(50)}${S(40 + r() * 45, 'sk--lg')}</span>`).join('')}</div><div class="cv-chart">${Array.from({ length: 14 }, (_, i) => `<i style="height:${18 + r() * 50 + i * 2.2 | 0}%"></i>`).join('')}</div></div></div></div>`,
    mobile: r => {
      const phone = cls => `<div class="phone ${cls}"><span class="phone__notch"></span><div class="phone__card">${S(40)}${S(66, 'sk--lg')}${S(30)}</div><div class="phone__icons">${'<i></i>'.repeat(4)}</div>${[0, 1, 2, 3].map(() => `<div class="phone__row"><i></i><div class="cv-col">${S(50 + r() * 40)}${S(28 + r() * 30)}</div></div>`).join('')}</div>`;
      return `<div class="cv-phones">${phone('phone--back')}${phone('')}</div>`;
    },
    chat: () => `<div class="dv">${BAR}<div class="cv-chat"><div class="bub">${S(92)}${S(60)}</div><div class="bub bub--out">${S(88)}${S(52)}</div><div class="bub">${S(95)}${S(82)}${S(46)}</div><div class="bub bub--dots"><i></i><i></i><i></i></div><div class="cv-input">${S(55)}<i></i></div></div></div>`,
    shop: () => `<div class="dv">${BAR}<div class="cv-shop"><div class="cv-shop__head">${S(20, 'sk--lg')}<div class="cv-shop__nav">${S(100)}${S(100)}${S(100)}</div></div><div class="cv-shop__grid">${[0, 1, 2, 3].map(i => `<div class="prod"><span class="prod__img" style="--h:${i * 28}deg"></span>${S(85)}${S(42, 'sk--acc')}</div>`).join('')}</div><div class="cv-grid3">${'<span class="sk-box"></span>'.repeat(3)}</div></div></div>`,
    code: r => `<div class="dv">${BAR}<div class="cv-code">${[0, 1, 1, 2, 2, 1, 0, 0, 1, 1, 0].map(ind => `<div class="cl" style="--in:${ind}">${Array.from({ length: 1 + (r() * 3 | 0) }, () => S(8 + r() * 22, ['sk--acc', 'sk--v', 'sk--b', 'sk--y', ''][r() * 5 | 0])).join('')}</div>`).join('')}</div></div>`,
  };

  const cover = p => p.image
    ? `<img class="cover-img" src="${esc(p.image)}" alt="" loading="lazy" decoding="async">`
    : `<div class="cover">${(COVERS[p.cover] || COVERS[COVER_BY_CATEGORY[String(p.category).toLowerCase()]] || COVERS.web)(rng(p.title))}</div>`;

  const ghLink = (repo, label) => `<a class="icon-btn" href="https://github.com/${esc(repo)}" target="_blank" rel="noopener" aria-label="${esc(label)}"><svg aria-hidden="true"><use href="#i-github"/></svg></a>`;

  const card = (p, i, instant) => {
    const repo = repoOf(p.github);
    const links = [
      p.url && `<a class="icon-btn" href="${esc(p.url)}" target="_blank" rel="noopener" aria-label="Abrir ${esc(p.title)} em nova aba"><i data-lucide="arrow-up-right"></i></a>`,
      repo && ghLink(repo, `Repositório de ${p.title} no GitHub`),
    ].filter(Boolean).join('') || '<span class="private"><i data-lucide="lock"></i>Privado</span>';
    return `
      <article class="project spot reveal${instant ? ' is-visible' : ''}" style="--c:${esc(p.accent || '#19d696')};--d:${(i % 3) * .08}s;view-transition-name:project-${i}">
        <button class="project__cover" type="button" data-open="${i}" tabindex="-1" aria-hidden="true">${cover(p)}<span class="project__view"><i data-lucide="arrow-up-right"></i></span></button>
        <div class="project__body">
          <div class="project__meta"><span class="badge">${esc(p.category)}</span>${p.year ? `<span>${esc(p.year)}</span>` : ''}</div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.summary)}</p>
          <ul class="tags">${(p.tags || []).map(t => `<li>${esc(t)}</li>`).join('')}</ul>
          ${repo ? `<div class="gh" data-gh="${esc(repo)}"></div>` : ''}
        </div>
        <footer class="project__foot">
          <button class="link" type="button" data-open="${i}">Ver detalhes<span class="sr-only"> de ${esc(p.title)}</span><i data-lucide="arrow-right"></i></button>
          <div class="project__links">${links}</div>
        </footer>
      </article>`;
  };

  const renderFilters = () => {
    const cats = ['Todos', ...new Set(projects.map(p => p.category))];
    filtersEl.innerHTML = cats.map(c => {
      const n = c === 'Todos' ? projects.length : projects.filter(p => p.category === c).length;
      return `<button class="filter${c === filter ? ' is-active' : ''}" type="button" aria-pressed="${c === filter}" data-filter="${esc(c)}">${esc(c)}<span>${n}</span></button>`;
    }).join('');
  };

  const renderProjects = instant => {
    grid.innerHTML = projects
      .map((p, i) => [p, i])
      .filter(([p]) => filter === 'Todos' || p.category === filter)
      .map(([p, i]) => card(p, i, instant)).join('');
    icons();
    reveal(grid);
    loadStats(grid);
  };

  filtersEl.addEventListener('click', e => {
    const btn = e.target.closest('[data-filter]');
    if (!btn || btn.dataset.filter === filter) return;
    filter = btn.dataset.filter;
    const update = () => { renderFilters(); renderProjects(true); };
    document.startViewTransition && !reduceMotion ? document.startViewTransition(update) : update();
  });

  /* ---------- GitHub API (pública, com cache de 1h) ---------- */
  const ghMemo = {};
  const ghFetch = path => ghMemo[path] ||= (async () => {
    const key = 'softix:gh:' + path;
    try {
      const cached = JSON.parse(localStorage.getItem(key));
      if (cached && Date.now() - cached.t < 36e5) return cached.d;
    } catch { /* storage indisponível */ }
    try {
      const res = await fetch('https://api.github.com/' + path, { headers: { Accept: 'application/vnd.github+json' } });
      const data = res.ok ? await res.json() : null;
      try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data })); } catch { /* ignore */ }
      return data;
    } catch { return null; }
  })();

  const loadStats = root => $$('[data-gh]', root).forEach(async el => {
    const r = await ghFetch('repos/' + el.dataset.gh);
    if (!r || !el.isConnected) return;
    el.innerHTML = [
      r.language && `<span><i class="dot" style="background:${LANG[r.language] || '#8aa0ab'}"></i>${esc(r.language)}</span>`,
      `<span title="Estrelas"><i data-lucide="star"></i>${fmt(r.stargazers_count)}</span>`,
      `<span title="Forks"><i data-lucide="git-fork"></i>${fmt(r.forks_count)}</span>`,
    ].filter(Boolean).join('');
    icons();
  });

  // Importa automaticamente os repositórios públicos de SOFTIX_CONFIG.githubUser
  const importRepos = async () => {
    const user = String(CONFIG.githubUser || '').trim();
    if (!user) return;
    $('#gh-profile').href = 'https://github.com/' + encodeURIComponent(user);
    $('#gh-more').hidden = false;
    const repos = await ghFetch(`users/${encodeURIComponent(user)}/repos?sort=pushed&per_page=100`);
    if (!Array.isArray(repos)) return;
    const known = new Set(projects.map(p => repoOf(p.github).toLowerCase()).filter(Boolean));
    const fresh = repos
      .filter(r => !r.fork && !r.archived && !known.has(r.full_name.toLowerCase()))
      .slice(0, CONFIG.githubLimit ?? 6)
      .map(r => ({
        title: r.name,
        category: 'Open Source',
        year: new Date(r.created_at).getFullYear(),
        summary: r.description || 'Repositório público no GitHub.',
        tags: r.topics?.length ? r.topics.slice(0, 4) : [r.language].filter(Boolean),
        url: r.homepage || '',
        github: r.full_name,
        cover: 'code',
      }));
    if (!fresh.length) return;
    projects.push(...fresh);
    renderFilters();
    renderProjects(true);
  };

  /* ---------- Modal de detalhes ---------- */
  const openProject = i => {
    const p = projects[i];
    if (!p) return;
    const repo = repoOf(p.github);
    modal.style.setProperty('--c', p.accent || '#19d696');
    modalBody.innerHTML = `
      <div class="modal__cover">${cover(p)}</div>
      <div class="modal__content">
        <div class="project__meta" style="--c:${esc(p.accent || '#19d696')}">
          <span class="badge">${esc(p.category)}</span>
          <span>${[p.client, p.year].filter(Boolean).map(esc).join(' · ')}</span>
        </div>
        <h3 id="modal-title">${esc(p.title)}</h3>
        <p class="modal__desc">${esc(p.description || p.summary)}</p>
        ${p.results?.length ? `<h4>Resultados</h4><ul class="results">${p.results.map(r => `<li><i data-lucide="circle-check"></i>${esc(r)}</li>`).join('')}</ul>` : ''}
        ${p.tags?.length ? `<h4>Tecnologias</h4><ul class="tags">${p.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
        ${repo ? `<div class="gh" data-gh="${esc(repo)}"></div>` : ''}
        <div class="modal__actions">
          ${p.url ? `<a class="btn btn--primary" href="${esc(p.url)}" target="_blank" rel="noopener">Ver projeto online<i data-lucide="arrow-up-right"></i></a>` : ''}
          ${repo ? `<a class="btn btn--ghost" href="https://github.com/${esc(repo)}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-github"/></svg>Código no GitHub</a>` : ''}
          ${!p.url && !repo ? '<span class="private"><i data-lucide="lock"></i>Projeto sob acordo de confidencialidade com o cliente</span>' : ''}
          <a class="btn btn--ghost" href="#contato" data-close>Quero um projeto assim<i data-lucide="arrow-right"></i></a>
        </div>
      </div>`;
    icons();
    loadStats(modalBody);
    modal.showModal();
    modalBody.scrollTop = 0;
  };

  grid.addEventListener('click', e => {
    const btn = e.target.closest('[data-open]');
    if (btn) openProject(+btn.dataset.open);
  });
  modal.addEventListener('click', e => {
    if (e.target === modal || e.target.closest('[data-close]')) modal.close();
  });

  /* ---------- Formulário de contato ---------- */
  const form = $('#contact-form');
  const LABELS = { nome: 'Nome', email: 'E-mail', empresa: 'Empresa', telefone: 'WhatsApp', tipo: 'Tipo de projeto', orcamento: 'Investimento', mensagem: 'Mensagem' };
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('button[type="submit"]', form);
    const label = $('.btn__label', btn);
    const status = $('.form__status', form);
    const show = (ok, msg) => { status.className = 'form__status ' + (ok ? 'is-ok' : 'is-err'); status.textContent = msg; };
    if (form.elements._gotcha.value) return; // bot
    const data = new FormData(form);

    btn.disabled = true;
    label.textContent = 'Enviando…';
    try {
      if (CONFIG.formEndpoint) {
        const res = await fetch(CONFIG.formEndpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        show(true, 'Mensagem enviada! Um especialista vai retornar em até 24h úteis.');
      } else {
        const body = [...data].filter(([k, v]) => k !== '_gotcha' && v).map(([k, v]) => `${LABELS[k] || k}: ${v}`).join('\n');
        const subject = `Novo projeto — ${data.get('nome')}`;
        location.href = `mailto:${CONFIG.email || 'contato@softix.com.br'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        show(true, 'Abrimos seu app de e-mail com a mensagem pronta — é só enviar.');
      }
    } catch {
      show(false, 'Não foi possível enviar agora. Tente novamente ou fale com a gente pelo WhatsApp.');
    } finally {
      btn.disabled = false;
      label.textContent = 'Enviar mensagem';
    }
  });

  /* ---------- Init ---------- */
  $('#year').textContent = new Date().getFullYear();
  renderFilters();
  renderProjects(false);
  icons();
  reveal();
  importRepos();
})();
