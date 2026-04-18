// Hoffmedia Dev Toolbar
// Only runs on localhost. Floats over the site for testing & annotation.
(function() {
  if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;

  const STYLE = `
    #hm-dev-toolbar, #hm-dev-toolbar * { box-sizing: border-box; font-family: 'DM Sans', system-ui, sans-serif; }
    #hm-dev-toolbar {
      position: fixed; bottom: 16px; right: 16px; z-index: 99999;
      background: rgba(10,10,12,0.92); backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.12); border-radius: 14px;
      color: #fafafa; font-size: 13px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.5);
      max-width: 340px; width: 340px;
      transition: transform 0.2s ease, opacity 0.2s ease;
    }
    #hm-dev-toolbar.collapsed { transform: translateY(calc(100% + 24px)); }
    .hm-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .hm-title { font-weight: 700; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
    .hm-title .hm-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #D4A017; margin-right: 6px; animation: hm-pulse 2s infinite; vertical-align: middle; }
    @keyframes hm-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
    .hm-min { background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; padding: 0; }
    .hm-min:hover { color: #fff; }
    .hm-body { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
    .hm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .hm-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      padding: 9px 10px; background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;
      color: #fafafa; font-size: 12px; font-weight: 600;
      cursor: pointer; font-family: inherit;
      transition: background 0.15s ease;
    }
    .hm-btn:hover { background: rgba(255,255,255,0.1); }
    .hm-btn.primary { background: #D4A017; border-color: #D4A017; color: #0a0a0c; }
    .hm-btn.primary:hover { background: #B8880F; }
    .hm-btn.danger { color: #f87171; }
    .hm-btn.active { background: rgba(212,160,23,0.15); border-color: rgba(212,160,23,0.4); color: #D4A017; }
    .hm-btn svg { width: 14px; height: 14px; }
    .hm-btn[disabled] { opacity: 0.5; cursor: not-allowed; }
    .hm-input, .hm-textarea {
      width: 100%; background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;
      padding: 8px 10px; color: #fafafa; font-size: 12px; font-family: inherit;
      resize: vertical; min-height: 32px;
    }
    .hm-input:focus, .hm-textarea:focus { outline: none; border-color: #D4A017; }
    .hm-log { max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
    .hm-issue {
      padding: 8px 10px; background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;
      font-size: 12px; display: flex; gap: 6px;
    }
    .hm-issue-pin { color: #D4A017; font-weight: 700; flex-shrink: 0; }
    .hm-issue-body { flex: 1; min-width: 0; }
    .hm-issue-note { line-height: 1.4; }
    .hm-issue-meta { font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 2px; }
    .hm-issue-actions { display: flex; gap: 4px; align-items: start; }
    .hm-issue-actions button { background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; padding: 2px; }
    .hm-issue-actions button:hover { color: #fafafa; }
    .hm-empty { color: rgba(255,255,255,0.4); font-size: 12px; text-align: center; padding: 10px; }
    .hm-status { font-size: 11px; color: rgba(255,255,255,0.5); padding: 4px 0; text-align: center; }
    .hm-status.success { color: #34D399; }
    .hm-status.error { color: #f87171; }
    .hm-status.busy { color: #D4A017; }
    .hm-tabs { display: flex; gap: 2px; padding: 0 12px; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .hm-tab { padding: 8px 10px; background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; font-size: 11px; font-weight: 600; border-bottom: 2px solid transparent; margin-bottom: -1px; text-transform: uppercase; letter-spacing: 0.05em; font-family: inherit; }
    .hm-tab:hover { color: #fafafa; }
    .hm-tab.active { color: #fafafa; border-color: #D4A017; }

    /* Toggle button (when collapsed) */
    #hm-toggle {
      position: fixed; bottom: 16px; right: 16px; z-index: 99999;
      width: 48px; height: 48px; border-radius: 50%;
      background: #D4A017; color: #0a0a0c; border: none; cursor: pointer;
      display: none; align-items: center; justify-content: center;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      transition: transform 0.2s ease;
    }
    #hm-toggle:hover { transform: scale(1.05); }
    #hm-toggle.visible { display: inline-flex; }
    #hm-toggle svg { width: 20px; height: 20px; }

    /* Annotation pins */
    .hm-pin {
      position: absolute; z-index: 99998;
      width: 24px; height: 24px; border-radius: 50%;
      background: #D4A017; color: #0a0a0c;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; font-family: inherit;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(212,160,23,0.4);
      animation: hm-pin-in 0.25s ease-out;
      pointer-events: auto;
    }
    @keyframes hm-pin-in {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }
    .hm-pin:hover { background: #B8880F; }

    /* Annotation cursor state */
    body.hm-annotating { cursor: crosshair !important; }
    body.hm-annotating * { cursor: crosshair !important; }
    body.hm-annotating #hm-dev-toolbar, body.hm-annotating #hm-dev-toolbar * { cursor: default !important; }

    /* Hover highlight during annotation mode */
    body.hm-annotating *:hover:not(#hm-dev-toolbar):not(#hm-dev-toolbar *):not(.hm-pin) {
      outline: 2px dashed rgba(212,160,23,0.8);
      outline-offset: 2px;
    }
  `;

  // Inject styles
  const styleEl = document.createElement('style');
  styleEl.textContent = STYLE;
  document.head.appendChild(styleEl);

  // State
  const state = {
    issues: [],
    annotating: false,
    activeTab: 'actions',
    collapsed: localStorage.getItem('hm-dev-collapsed') === 'true'
  };

  // Load issues from server
  async function loadIssues() {
    try {
      const res = await fetch('/__dev/issues');
      if (res.ok) state.issues = await res.json();
    } catch (e) { state.issues = []; }
    render();
  }

  async function saveIssue(issue) {
    await fetch('/__dev/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issue)
    });
    await loadIssues();
  }

  async function deleteIssue(id) {
    await fetch(`/__dev/issues/${id}`, { method: 'DELETE' });
    await loadIssues();
  }

  async function pushToVercel(message) {
    setStatus('Pushing to Vercel…', 'busy');
    try {
      const res = await fetch('/__dev/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message || 'Update' })
      });
      const data = await res.json();
      if (res.ok) setStatus('✓ Deployed', 'success');
      else setStatus('Error: ' + (data.error || 'failed'), 'error');
    } catch (e) {
      setStatus('Error: ' + e.message, 'error');
    }
  }

  function formatIssuesForClaude() {
    if (!state.issues.length) return '';
    const byPage = {};
    state.issues.forEach(i => {
      const p = i.page === '/' ? '/index.html' : i.page;
      (byPage[p] = byPage[p] || []).push(i);
    });
    let out = 'Please fix these issues logged via the dev toolbar:\n\n';
    Object.keys(byPage).sort().forEach(page => {
      out += `### ${page}\n`;
      byPage[page].forEach((i, idx) => {
        out += `${idx + 1}. **${i.note}**\n`;
        out += `   - Selector: \`${i.selector}\`\n`;
        if (i.elementText) out += `   - Element text: "${i.elementText}"\n`;
        out += `   - Coords: (${i.x}, ${i.y})\n`;
      });
      out += '\n';
    });
    return out.trimEnd();
  }

  async function copyForClaude(btn) {
    const text = formatIssuesForClaude();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      const orig = btn.innerHTML;
      btn.innerHTML = '<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" stroke-linecap="round" stroke-linejoin="round"/></svg>Copied!';
      btn.classList.add('active');
      setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('active'); }, 2000);
    } catch (e) {
      alert('Copy failed. Here it is to copy manually:\n\n' + text);
    }
  }

  function setStatus(msg, type) {
    const el = document.getElementById('hm-status');
    if (!el) return;
    el.textContent = msg;
    el.className = 'hm-status ' + (type || '');
    if (type === 'success' || type === 'error') {
      setTimeout(() => { el.textContent = ''; el.className = 'hm-status'; }, 5000);
    }
  }

  // Annotation mode
  function toggleAnnotating() {
    state.annotating = !state.annotating;
    document.body.classList.toggle('hm-annotating', state.annotating);
    render();
  }

  function handleAnnotationClick(e) {
    if (!state.annotating) return;
    // Don't annotate toolbar itself
    if (e.target.closest('#hm-dev-toolbar') || e.target.closest('#hm-toggle') || e.target.classList?.contains('hm-pin')) return;

    e.preventDefault();
    e.stopPropagation();

    const note = prompt('What needs attention here?');
    if (!note) return;

    const rect = e.target.getBoundingClientRect();
    const issue = {
      id: Date.now().toString(),
      note,
      selector: getSelector(e.target),
      page: location.pathname,
      x: Math.round(e.pageX),
      y: Math.round(e.pageY),
      elementText: (e.target.textContent || '').trim().slice(0, 60),
      createdAt: new Date().toISOString()
    };
    saveIssue(issue);
    toggleAnnotating();
  }

  function getSelector(el) {
    if (!el) return '';
    if (el.id) return '#' + el.id;
    const parts = [];
    let current = el;
    while (current && current.nodeType === 1 && parts.length < 5) {
      let part = current.nodeName.toLowerCase();
      if (current.className && typeof current.className === 'string') {
        const cls = current.className.split(' ').filter(c => c && !c.startsWith('hm-')).slice(0, 2);
        if (cls.length) part += '.' + cls.join('.');
      }
      parts.unshift(part);
      current = current.parentElement;
    }
    return parts.join(' > ');
  }

  function renderPins() {
    // Remove old pins
    document.querySelectorAll('.hm-pin').forEach(el => el.remove());
    // Only show pins for current page
    const pagePins = state.issues.filter(i => i.page === location.pathname);
    pagePins.forEach((issue, idx) => {
      const pin = document.createElement('div');
      pin.className = 'hm-pin';
      pin.style.left = (issue.x - 12) + 'px';
      pin.style.top = (issue.y - 12) + 'px';
      pin.textContent = idx + 1;
      pin.title = issue.note;
      pin.addEventListener('click', (e) => {
        e.stopPropagation();
        alert(`#${idx+1}\n\n${issue.note}\n\n${issue.selector}`);
      });
      document.body.appendChild(pin);
    });
  }

  function render() {
    const existing = document.getElementById('hm-dev-toolbar');
    if (existing) existing.remove();

    const existingToggle = document.getElementById('hm-toggle');
    if (existingToggle) existingToggle.remove();

    // Toggle button (when collapsed)
    const toggle = document.createElement('button');
    toggle.id = 'hm-toggle';
    toggle.className = state.collapsed ? 'visible' : '';
    toggle.innerHTML = '<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 6v12M6 12h12" stroke-linecap="round"/></svg>';
    toggle.title = 'Open dev toolbar';
    toggle.addEventListener('click', () => {
      state.collapsed = false;
      localStorage.setItem('hm-dev-collapsed', 'false');
      render();
    });
    document.body.appendChild(toggle);

    if (state.collapsed) return;

    const bar = document.createElement('div');
    bar.id = 'hm-dev-toolbar';

    // Header
    const header = document.createElement('div');
    header.className = 'hm-header';
    header.innerHTML = `<span class="hm-title"><span class="hm-dot"></span>Hoffmedia Dev</span>`;
    const min = document.createElement('button');
    min.className = 'hm-min';
    min.innerHTML = '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13h14" stroke-linecap="round"/></svg>';
    min.title = 'Minimize';
    min.addEventListener('click', () => {
      state.collapsed = true;
      localStorage.setItem('hm-dev-collapsed', 'true');
      render();
    });
    header.appendChild(min);
    bar.appendChild(header);

    // Tabs
    const tabs = document.createElement('div');
    tabs.className = 'hm-tabs';
    ['actions', 'issues'].forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'hm-tab' + (state.activeTab === t ? ' active' : '');
      btn.textContent = t === 'actions' ? 'Actions' : `Issues (${state.issues.filter(i => i.page === location.pathname).length})`;
      btn.addEventListener('click', () => { state.activeTab = t; render(); });
      tabs.appendChild(btn);
    });
    bar.appendChild(tabs);

    // Body
    const body = document.createElement('div');
    body.className = 'hm-body';

    if (state.activeTab === 'actions') {
      // Annotate toggle
      const annotateBtn = document.createElement('button');
      annotateBtn.className = 'hm-btn' + (state.annotating ? ' active' : '');
      annotateBtn.innerHTML = state.annotating
        ? '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>Cancel annotation'
        : '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2C7 2 3 6 3 11s4 9 9 9c0 0 9-3 9-9-1-5-4-9-9-9z"/><circle cx="12" cy="11" r="3"/></svg>Mark an element';
      annotateBtn.addEventListener('click', toggleAnnotating);
      body.appendChild(annotateBtn);

      if (state.annotating) {
        const hint = document.createElement('div');
        hint.className = 'hm-status';
        hint.textContent = 'Click any element on the page…';
        body.appendChild(hint);
      }

      // Commit message
      const commitMsg = document.createElement('input');
      commitMsg.className = 'hm-input';
      commitMsg.id = 'hm-commit-msg';
      commitMsg.placeholder = 'Commit message (optional)';
      body.appendChild(commitMsg);

      // Push button
      const pushRow = document.createElement('div');
      pushRow.className = 'hm-row';
      const pushBtn = document.createElement('button');
      pushBtn.className = 'hm-btn primary';
      pushBtn.innerHTML = '<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12l7-7 7 7M12 5v14" stroke-linecap="round" stroke-linejoin="round"/></svg>Push to Vercel';
      pushBtn.addEventListener('click', () => {
        const msg = document.getElementById('hm-commit-msg')?.value || '';
        pushToVercel(msg);
      });
      const liveBtn = document.createElement('a');
      liveBtn.href = 'https://wright-excavation.vercel.app' + location.pathname;
      liveBtn.target = '_blank';
      liveBtn.className = 'hm-btn';
      liveBtn.innerHTML = '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 3h7v7M21 3l-9 9M10 4H4a1 1 0 00-1 1v15a1 1 0 001 1h15a1 1 0 001-1v-6"/></svg>View live';
      pushRow.appendChild(pushBtn);
      pushRow.appendChild(liveBtn);
      body.appendChild(pushRow);

      // Status line
      const status = document.createElement('div');
      status.id = 'hm-status';
      status.className = 'hm-status';
      body.appendChild(status);
    } else {
      // Issues tab
      const pagePins = state.issues.filter(i => i.page === location.pathname);
      const otherPages = state.issues.filter(i => i.page !== location.pathname);

      if (pagePins.length === 0 && otherPages.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'hm-empty';
        empty.textContent = 'No issues logged. Use "Mark an element" to start.';
        body.appendChild(empty);
      } else {
        // Copy for Claude
        const copyBtn = document.createElement('button');
        copyBtn.className = 'hm-btn';
        copyBtn.innerHTML = '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>Copy for Claude';
        copyBtn.addEventListener('click', () => copyForClaude(copyBtn));
        body.appendChild(copyBtn);

        const log = document.createElement('div');
        log.className = 'hm-log';

        if (pagePins.length) {
          const label = document.createElement('div');
          label.style.cssText = 'font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:0.08em;text-transform:uppercase;font-weight:600;';
          label.textContent = 'This page';
          log.appendChild(label);

          pagePins.forEach((issue, idx) => {
            log.appendChild(renderIssue(issue, idx + 1));
          });
        }

        if (otherPages.length) {
          const label = document.createElement('div');
          label.style.cssText = 'font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:0.08em;text-transform:uppercase;font-weight:600;margin-top:8px;';
          label.textContent = 'Other pages';
          log.appendChild(label);

          otherPages.forEach((issue) => {
            log.appendChild(renderIssue(issue, null));
          });
        }

        body.appendChild(log);
      }
    }

    bar.appendChild(body);
    document.body.appendChild(bar);

    renderPins();
  }

  function renderIssue(issue, num) {
    const row = document.createElement('div');
    row.className = 'hm-issue';

    if (num !== null) {
      const pin = document.createElement('div');
      pin.className = 'hm-issue-pin';
      pin.textContent = '#' + num;
      row.appendChild(pin);
    }

    const body = document.createElement('div');
    body.className = 'hm-issue-body';
    const note = document.createElement('div');
    note.className = 'hm-issue-note';
    note.textContent = issue.note;
    body.appendChild(note);
    const meta = document.createElement('div');
    meta.className = 'hm-issue-meta';
    meta.textContent = (issue.page === location.pathname ? issue.selector : issue.page + ' · ' + issue.selector).slice(0, 60);
    body.appendChild(meta);
    row.appendChild(body);

    const actions = document.createElement('div');
    actions.className = 'hm-issue-actions';
    if (issue.page !== location.pathname) {
      const go = document.createElement('button');
      go.innerHTML = '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
      go.title = 'Go to page';
      go.addEventListener('click', () => { location.href = issue.page; });
      actions.appendChild(go);
    }
    const del = document.createElement('button');
    del.innerHTML = '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    del.title = 'Delete';
    del.addEventListener('click', () => deleteIssue(issue.id));
    actions.appendChild(del);
    row.appendChild(actions);

    return row;
  }

  // Wire up click handler for annotation mode (capture phase to catch everything)
  document.addEventListener('click', handleAnnotationClick, true);

  // Re-render pins on resize (absolute coords may shift)
  window.addEventListener('resize', () => renderPins());

  // Boot
  loadIssues();
})();
