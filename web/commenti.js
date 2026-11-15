/*
 * I commenti come negli editor web (HyFile, SPEC §19.7): una parte della pelle di HyFile
 * sopra ONLYOFFICE Docs.
 * Copyright (C) 2026 Ruben Leo.
 *
 * Questo programma è software libero: puoi ridistribuirlo e/o modificarlo secondo i
 * termini della GNU Affero General Public License versione 3, come pubblicata dalla
 * Free Software Foundation. È distribuito senza alcuna garanzia. Il testo della licenza
 * sta nel file LICENSE accanto a questo, e su https://www.gnu.org/licenses/agpl-3.0.html.
 * Poggia su ONLYOFFICE Docs (Ascensio System SIA, AGPL v3), che non è stato modificato.
 *
 * Cosa fa.
 *   - Documenti: ogni discussione è una scheda nel margine a destra del foglio, all'altezza
 *     del testo commentato; le schede si impilano senza sovrapporsi e scorrono col
 *     documento. Se la finestra è stretta il margine non c'è: restano dei segni accanto
 *     alla pagina e la scheda si apre sopra, accanto al testo.
 *   - Fogli e presentazioni: la scheda si apre sulla cella o sull'oggetto.
 *   - Ovunque: il pannello «Tutti i commenti» a destra, coi filtri, e la tendina «@».
 * Come. I dati e i gesti sono quelli del controllore dei commenti di ONLYOFFICE
 * (`Common.Controllers.Comments`): la sua raccolta tiene i commenti aggiornati anche
 * quando scrive un altro, i suoi metodi rispondono, risolvono, eliminano e mandano
 * l'avviso a chi è menzionato (`onRequestSendNotify`). Della finestrella di ONLYOFFICE
 * («popover») si tiene il cervello e si spegne la faccia: quando vorrebbe mostrarsi, al
 * suo posto si accende la scheda. L'altezza di ogni commento nei documenti la dà
 * `asc_showComment`, che manda l'evento `asc_onShowComment` con le coordinate: durante
 * la misura l'evento si ferma qui e non arriva a ONLYOFFICE.
 * Se qualcosa manca (una versione nuova di ONLYOFFICE) le schede non partono e restano i
 * commenti di ONLYOFFICE com'erano: non deve mai impedire di scrivere.
 */
(function () {
  'use strict';
  if (window.__pelleCommentiHyfile) return;
  window.__pelleCommentiHyfile = true;

  /* ------------------------------------------------------------------ attrezzi */
  var ICONE = {
    spunta: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
    altro: 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    chiudi: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    commento: 'M22 4c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4zm-2 13.17L18.83 16H4V4h16v13.17zM13 5h-2v4H7v2h4v4h2v-4h4V9h-4z',
    fumetto: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z',
    riapri: 'M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z',
    matita: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
    cestino: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
    link: 'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z',
  };
  function svg(nome) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + (ICONE[nome] || '') + '"/></svg>';
  }
  function el(tag, attr, html) {
    var e = document.createElement(tag);
    if (attr) for (var k in attr) {
      if (k === 'class') e.className = attr[k];
      else e.setAttribute(k, attr[k]);
    }
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function prova(f, dopo) { try { return f(); } catch (e) { if (window.console) console.warn('pelle-commenti', e); return dopo; } }
  // Le stesse iniziali e la stessa tavolozza della pelle (pelle.js), così il tondo di chi
  // scrive è uguale in testata e nei commenti.
  var PALETTE = ['#1a73e8', '#d93025', '#188038', '#e37400', '#9334e6', '#c5221f', '#129eaf', '#b06000', '#a142f4', '#e52592'];
  function coloreDi(s) { var h = 0; s = String(s || ''); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return PALETTE[Math.abs(h) % PALETTE.length]; }
  function iniziali(nome) {
    var p = String(nome || '?').trim().split(/\s+/);
    return ((p[0] || '?')[0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
  }
  var MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
  /** La data come negli editor web: «21:08 Oggi», «9:15 Ieri», «12 nov», «3 mar 2025». */
  function quando(t) {
    if (!t) return '';
    var d = new Date(t), ora = new Date();
    if (isNaN(d)) return '';
    var hm = d.getHours() + ':' + ('0' + d.getMinutes()).slice(-2);
    var giorno = function (x) { return x.getFullYear() + '-' + x.getMonth() + '-' + x.getDate(); };
    if (giorno(d) === giorno(ora)) return hm + ' Oggi';
    var ieri = new Date(ora.getTime() - 864e5);
    if (giorno(d) === giorno(ieri)) return hm + ' Ieri';
    return d.getDate() + ' ' + MESI[d.getMonth()] + (d.getFullYear() === ora.getFullYear() ? '' : ' ' + d.getFullYear());
  }

  /* ------------------------------------------------------------------ stato */
  var K = {
    sel: null,        // uid della discussione scelta
    nuovo: null,      // il commento che si sta scrivendo: {y, x, lx, doc}
    ultimo: null,     // l'ultima posizione chiesta da ONLYOFFICE per la sua finestrella
    flott: null,      // la scheda sopra il documento: {uids, x, y, lx, accenno}
    aperto: false,    // il pannello «Tutti i commenti»
    filtro: 'tutti',
    pos: {},          // documenti: uid -> {x, y} rispetto a #editor_sdk
    destra: null,     // documenti: il bordo destro della pagina, rispetto a #editor_sdk
    schede: {},       // uid -> {el, firma}
    modifica: null,   // {uid, rid} quando si modifica un commento o una risposta
    utenti: null,     // le persone menzionabili, da HyFile (onRequestUsers)
    nomi: {},         // email -> nome
    larghezza: 0,     // della colonna a destra
    zoom: 100,
    modo: '',
  };
  var MARGINE = 300;   // la colonna delle schede nei documenti, quando c'è spazio
  var PANNELLO = 360;  // il pannello «Tutti i commenti»
  var SCHEDA_FL = 296; // la scheda sopra il documento

  /** Per un attimo dopo un gesto sulla scheda (rispondere, modificare) la scelta resta. */
  function tieni(per) {
    if (per) { K.tieniFino = Date.now() + per; return true; }
    return Date.now() < (K.tieniFino || 0);
  }
  function io() { return String(K.mode && K.mode.user && K.mode.user.id || K.ctrl && K.ctrl.currentUserId || ''); }
  function mioNome() { return K.mode && K.mode.user && (K.mode.user.fullname || K.mode.user.name) || ''; }
  function scrive() { return !!(K.mode && K.mode.canComments); }

  /* ------------------------------------------------------------------ attesa */
  (function prova0() {
    var giri = 0;
    (function guarda() {
      var APP = window.DE || window.SSE || window.PE;
      if (APP && window.Common && Common.NotificationCenter && window.$) {
        var fatto = false;
        Common.NotificationCenter.on('app:ready', function () {
          if (fatto) return;
          fatto = true;
          // Dopo la pelle (che parte anche lei su app:ready): la testata e la barra ci sono già.
          setTimeout(function () { prova(function () { avvia(APP); }); }, 30);
        });
        return;
      }
      if (giri++ < 400) setTimeout(guarda, 25);
    })();
  })();

  /* ------------------------------------------------------------------ avvio */
  function avvia(APP) {
    var ctrl = APP.getController('Common.Controllers.Comments');
    if (!ctrl || !ctrl.collection || !ctrl.api || typeof ctrl.getPopover !== 'function') return;
    K.APP = APP;
    K.TIPO = window.DE ? 'word' : window.SSE ? 'cell' : 'slide';
    K.ctrl = ctrl;
    K.api = ctrl.api;
    K.mode = ctrl.mode || APP.getController('Main').appOptions || {};
    if (!K.mode.canViewComments && !K.mode.canComments) return;
    K.invio = trovaInvio(K.api);

    document.body.classList.add('hf-commenti', 'hf-commenti-' + K.TIPO);
    creaColonna();
    creaStrato();
    if (!spegniFinestrella()) return;
    spegniPannelloVecchio();
    ascolta();

    window.pelleCommenti = {
      apri: function () { apriPannello(true); },
      chiudi: function () { apriPannello(false); },
      aperti: function () { return K.aperto; },
      alterna: function () { apriPannello(!K.aperto); },
      nuovo: nuovoCommento,
      // Per le prove su aurora: com'è messa la colonna, a secco.
      stato: function () {
        return {
          modo: K.modo, larghezza: K.larghezza, sel: K.sel, nuovo: !!K.nuovo, aperto: K.aperto, filtro: K.filtro,
          commenti: visibili().length, pos: K.pos, destra: K.destra, invio: !!K.invio,
          schede: Array.prototype.map.call(document.querySelectorAll('.hf-scheda'), function (s) {
            var r = s.getBoundingClientRect();
            return { uid: s.getAttribute('data-uid'), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), scelta: s.classList.contains('scelta'), vista: r.width > 0 };
          }),
        };
      },
    };
    // Chiudendo la cronologia HyFile ricarica l'editor: chi ha chiesto i commenti dalla
    // cronologia lo lascia scritto qui (pelle.js), e il pannello si riapre da solo.
    prova(function () {
      if (sessionStorage.getItem('pelle-commenti-apri') === '1') { sessionStorage.removeItem('pelle-commenti-apri'); K.aperto = true; }
    });
    pianifica(true);
  }

  /** Il nome nascosto della funzione che manda gli eventi dell'editor (sendEvent, che il
   *  codice di ONLYOFFICE chiama col suo nome accorciato): serve a fermare
   *  `asc_onShowComment` durante la misura delle altezze. */
  function trovaInvio(api) {
    if (typeof api.sendEvent !== 'function') return null;
    for (var k in api) { if (k !== 'sendEvent' && api[k] === api.sendEvent) return k; }
    return null;
  }

  /* ------------------------------------------------------------------ la colonna e lo strato */
  // La colonna a destra entra nel layout orizzontale di ONLYOFFICE come un pannello suo
  // (come il pannello destro delle proprietà): l'editor si stringe, la pagina si sposta a
  // sinistra e il righello e lo scorrimento restano giusti. Senza layout si va sopra.
  function creaColonna() {
    K.colonna = el('div', { id: 'hf-cm-colonna', class: 'layout-item' });
    K.colonna.style.display = 'none';
    var hl = prova(function () {
      var vp = K.APP.getController('Viewport');
      var v = vp.viewport || vp.getView('Viewport');
      return v && v.hlayout;
    });
    var i = hl && hl.panels ? hl.panels.findIndex(function (p) { return p.stretch; }) : -1;
    if (i >= 0 && hl.panels[i].el && hl.panels[i].el[0] && hl.panels[i].el[0].parentNode) {
      var dopo = hl.panels[i].el[0];
      dopo.parentNode.insertBefore(K.colonna, dopo.nextSibling);
      K.panLayout = { el: $(K.colonna), width: 0, rely: false };
      hl.panels.splice(i + 1, 0, K.panLayout);
      K.hl = hl;
    } else {
      K.colonna.classList.add('hf-cm-sopra');
      document.body.appendChild(K.colonna);
    }
  }
  function mettiLarghezza(w) {
    if (K.larghezza === w) return;
    K.larghezza = w;
    K.colonna.style.display = w ? '' : 'none';
    if (K.panLayout) {
      K.panLayout.width = w;
      // Il layout dell'editor si rifà e l'editor si ridisegna nella misura nuova.
      prova(function () { Common.NotificationCenter.trigger('layout:changed', 'rightmenu'); });
      prova(function () { K.hl.doLayout(); });
      prova(function () { (K.api.Resize || K.api.asc_Resize).call(K.api); });
    } else {
      K.colonna.style.width = w + 'px';
    }
  }
  function creaStrato() {
    var sdk = document.getElementById('editor_sdk');
    K.sdk = sdk;
    K.strato = el('div', { id: 'hf-cm-strato' });
    (sdk && sdk.parentNode || document.body).appendChild(K.strato);
  }
  /** La posizione di #editor_sdk rispetto a un elemento: le coordinate di ONLYOFFICE
   *  (finestrella, commenti) sono tutte rispetto a #editor_sdk. */
  function scarto(rispetto) {
    if (!K.sdk) return { x: 0, y: 0 };
    var a = K.sdk.getBoundingClientRect(), b = rispetto.getBoundingClientRect();
    return { x: a.left - b.left, y: a.top - b.top };
  }

  /* ------------------------------------------------------------------ la finestrella di ONLYOFFICE */
  // La finestrella dei commenti (Common.Views.ReviewPopover) resta viva, perché il
  // controllore le parla, ma non si mostra più per i commenti: al suo posto la scheda.
  // Le revisioni (modifiche rilevate) la usano ancora e si vedono come sempre.
  function spegniFinestrella() {
    var pop = prova(function () { return K.ctrl.getPopover(); });
    if (!pop || typeof pop.showComments !== 'function' || typeof pop.setLeftTop !== 'function') return false;
    K.pop = pop;
    var lt = pop.setLeftTop, nasc = pop.hideComments;
    pop.setLeftTop = function (x, y, lx) {
      if (x !== undefined || y !== undefined) K.ultimo = { x: x, y: y, lx: lx };
      if (K.flott && y !== undefined) { K.flott.x = x; K.flott.y = y; K.flott.lx = lx; pianifica(); }
      return lt.apply(this, arguments);
    };
    pop.showComments = function () { daFinestrella(); };
    pop.hideComments = function () {
      var me = this;
      if (me.$window) prova(function () { nasc.call(me); });
      else if (me.handlerHide) prova(function () { me.handlerHide(); });
      if (!K.nuovo && !tieni()) { K.sel = null; K.flott = null; pianifica(); }
    };
    return true;
  }
  /** ONLYOFFICE vuole mostrare dei commenti (il cursore è entrato nel testo commentato, il
   *  mouse passa su una cella con la nota, si è chiesto un commento nuovo). */
  function daFinestrella() {
    var modelli = K.ctrl.popoverComments ? K.ctrl.popoverComments.models : [];
    var u = K.ultimo || {};
    var finto = modelli.filter(function (m) { return m.get('dummy'); })[0];
    if (finto) {
      K.nuovo = { y: u.y, x: u.x, lx: u.lx, doc: false };
      K.sel = null;
      K.flott = null;
      pianifica(true, function () { fuocoNuovo(); });
      return;
    }
    var uids = modelli.filter(function (m) { return !m.get('hide'); }).map(function (m) { return m.get('uid'); });
    if (!uids.length) return;
    var accenno = modelli.every(function (m) { return m.get('hint'); });
    K.sel = uids[0];
    K.flott = { uids: uids, x: u.x, y: u.y, lx: u.lx, accenno: accenno };
    pianifica(true);
  }

  /* ------------------------------------------------------------------ il pannello vecchio */
  // Il pannello dei commenti a sinistra di ONLYOFFICE non si vede più: chi lo chiede
  // (la voce di un menu, il commento sul documento intero) apre il pannello di destra.
  function spegniPannelloVecchio() {
    prova(function () {
      var lm = K.APP.getController('LeftMenu').leftMenu;
      if (!lm || typeof lm.showMenu !== 'function') return;
      var mostra = lm.showMenu;
      lm.showMenu = function (nome) {
        if (nome === 'comments') { apriPannello(true); return; }
        return mostra.apply(this, arguments);
      };
      if (lm.btnComments && lm.btnComments.on) {
        lm.btnComments.on('toggle', function (b, premuto) {
          if (!premuto) return;
          setTimeout(function () {
            prova(function () { lm.btnComments.toggle(false, true); lm.close ? lm.close() : lm.onBtnMenuClick(lm.btnComments); });
            apriPannello(true);
          }, 0);
        });
      }
    });
    // Il commento sul documento intero (senza testo scelto): ONLYOFFICE apre il suo
    // pannello con il campo vuoto; qui nasce la scheda nuova in cima al pannello.
    prova(function () {
      var v = K.ctrl.getView ? K.ctrl.getView() : K.ctrl.view;
      if (!v || typeof v.showEditContainer !== 'function') return;
      var sec = v.showEditContainer;
      v.showEditContainer = function (si) {
        var r = sec.apply(this, arguments);
        if (si && scrive()) {
          K.nuovo = { doc: true };
          K.sel = null;
          apriPannello(true);
          pianifica(true, function () { fuocoNuovo(); });
        }
        return r;
      };
    });
  }

  /* ------------------------------------------------------------------ gli ascolti */
  function ascolta() {
    var api = K.api;
    var c = K.ctrl.collection;
    c.on('add remove reset change sort', function () { pianifica(true); });
    prova(function () {
      api.asc_registerCallback('asc_onHideComment', function () { if (!K.nuovo && !tieni()) { K.sel = null; K.flott = null; pianifica(); } });
      api.asc_registerCallback('asc_onZoomChange', function (z) { if (z) K.zoom = z; pianifica(); });
      api.asc_registerCallback('asc_onDocumentPlaceChanged', function () { pianifica(); });
      api.asc_registerCallback('asc_onUpdateCommentPosition', function () { pianifica(); });
    });
    // Documenti: l'evento dello scorrimento c'è solo se lo si chiede. Il controllore lo
    // spegne quando chiude un commento nuovo: si riaccende subito dopo.
    if (K.TIPO === 'word') {
      var accendi = function () { prova(function () { api.asc_SetDocumentPlaceChangedEnabled && api.asc_SetDocumentPlaceChangedEnabled(true); }); };
      accendi();
      ['clearDummyComment', 'onAddDummyComment'].forEach(function (n) {
        var f = K.ctrl[n];
        if (typeof f !== 'function') return;
        K.ctrl[n] = function () { var r = f.apply(this, arguments); accendi(); return r; };
      });
      // Mentre si scrive il testo si sposta senza scorrere: un'occhiata ogni tanto.
      setInterval(function () { if (K.modo === 'margine' || K.modo === 'stretto' || K.modo === 'pannello') pianifica(); }, 700);
    }
    Common.NotificationCenter.on('comments:cleardummy', function () {
      if (!K.nuovo || K.nuovo.doc) return;
      togliNuova();
      pianifica(true);
    });
    // Le persone menzionabili (risposta di HyFile a onRequestUsers) e i nomi.
    Common.NotificationCenter.on('mentions:setusers', function (tipo, utenti, paginato) {
      (utenti || []).forEach(function (u) { if (u && u.email) K.nomi[u.email.toLowerCase()] = u.name || u.email; });
      if (tipo && tipo !== 'mention') return;
      if (paginato === undefined) K.utenti = utenti || [];
      menzioni.risposta(utenti || [], paginato);
    });
    // «Link a questo commento»: HyFile risponde a onMakeActionLink con setActionLink.
    prova(function () {
      Common.Gateway.on('setactionlink', function (url) {
        if (!K.attesaLink) return;
        K.attesaLink = false;
        copia(url);
      });
    });
    window.addEventListener('resize', function () { pianifica(); });
    // La cronologia si apre e si chiude: le schede spariscono e tornano.
    prova(function () { Common.NotificationCenter.on('collaboration:history', function () { setTimeout(function () { pianifica(true); }, 300); }); });
    if (K.TIPO !== 'word') setInterval(function () { if (K.modo !== 'vuoto' && inCronologia()) pianifica(true); }, 1000);
    // Ctrl+Alt+M: commento nuovo, come negli editor web.
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.altKey && !e.shiftKey && (e.code === 'KeyM' || String(e.key).toLowerCase() === 'm')) {
        if (!scrive()) return;
        e.preventDefault();
        e.stopPropagation();
        nuovoCommento();
      }
    }, true);
    document.addEventListener('mousedown', function (e) {
      if (K.menu && !K.menu.contains(e.target)) chiudiMenu();
      if (menzioni.el && !menzioni.el.contains(e.target)) menzioni.chiudi();
    }, true);
  }

  function nuovoCommento() {
    if (!scrive()) return;
    var b = prova(function () { var t = K.APP.getController('Toolbar'); var g = t.btnsComment || t.toolbar && t.toolbar.btnsComment; return g && !g.$el && typeof g.length === 'number' ? g[0] : g; });
    if (b && b.$el && !(b.isDisabled && b.isDisabled())) {
      var btn = b.$el.is('button') ? b.$el : b.$el.find('button').first();
      btn.trigger('click');
      return;
    }
    prova(function () { Common.NotificationCenter.trigger('app:comment:add', 'toolbar'); });
  }

  /* ------------------------------------------------------------------ i dati */
  function visibili() {
    return K.ctrl.collection.filter(function (m) { return !m.get('hide') && !m.get('dummy'); });
  }
  function trova(uid) { return K.ctrl.collection.findWhere({ uid: uid }); }
  function ordinePosizione(lista) {
    var p = {};
    lista.forEach(function (m) {
      var u = m.get('uid');
      p[u] = prova(function () { return K.api.asc_GetCommentLogicPosition ? Number(K.api.asc_GetCommentLogicPosition(u)) : NaN; }, NaN);
    });
    return lista.slice().sort(function (a, b) {
      var pa = p[a.get('uid')], pb = p[b.get('uid')];
      if (!isNaN(pa) && !isNaN(pb) && pa !== pb) return pa - pb;
      return (a.get('time') || 0) - (b.get('time') || 0);
    });
  }
  /** Chi ha scritto, da un commento o da una risposta. */
  function autore(m) {
    var nome = m.get('parsedName') || m.get('username') || '';
    return { nome: nome, colore: m.get('usercolor') || coloreDi(m.get('userid') || nome), mio: String(m.get('userid')) === io() };
  }
  function miaEmail() {
    var u = K.mode && K.mode.user || {};
    if (u.email) return String(u.email).toLowerCase();
    var n = mioNome().toLowerCase();
    var t = (K.utenti || []).filter(function (x) { return x && (x.name || '').toLowerCase() === n; })[0];
    return t && t.email ? t.email.toLowerCase() : '';
  }
  var RE_MENZIONE = /(^|[\s(])[@+]([A-Z0-9._%+-]+@[A-Z0-9._-]+\.[A-Z]+)\b/gi;
  function menziona(testo, email) {
    if (!email || !testo) return false;
    var re = new RegExp(RE_MENZIONE.source, 'gi'), m;
    while ((m = re.exec(testo))) { if (m[2].toLowerCase() === email) return true; }
    return false;
  }
  /** «Per te»: le discussioni che mi menzionano, o le mie a cui ha risposto qualcuno. */
  function perMe(m) {
    var em = miaEmail();
    if (menziona(m.get('comment'), em)) return true;
    var r = m.get('replys') || [];
    if (r.some(function (x) { return menziona(x.get('reply'), em); })) return true;
    return autore(m).mio && r.some(function (x) { return String(x.get('userid')) !== io(); });
  }
  /** Il testo di un commento: a capo, link e menzioni come negli editor web. */
  function testoHtml(t) {
    var h = esc(t);
    h = h.replace(/(https?:\/\/[^\s<]+)/g, function (u) { return '<a href="' + u + '" target="_blank" rel="noopener">' + u + '</a>'; });
    h = h.replace(new RegExp(RE_MENZIONE.source, 'gi'), function (tutto, prima, email) {
      var nome = K.nomi[email.toLowerCase()] || email;
      return prima + '<span class="hf-cm-menzione" title="' + esc(email) + '">@' + esc(nome) + '</span>';
    });
    return h.replace(/\n/g, '<br>');
  }

  /* ------------------------------------------------------------------ disegno */
  var giro = null, rifare = false, dopoGiro = [];
  /** Si ridisegna al prossimo fotogramma: tanti eventi in fila fanno un giro solo. */
  function pianifica(ricostruisci, poi) {
    if (ricostruisci) rifare = true;
    if (poi) dopoGiro.push(poi);
    if (giro) return;
    giro = requestAnimationFrame(function () {
      giro = null;
      var r = rifare; rifare = false;
      prova(function () { disegna(r); });
      var l = dopoGiro; dopoGiro = [];
      l.forEach(function (f) { prova(f); });
    });
  }

  /** Nella cronologia delle versioni si guarda un documento di prima: niente schede,
   *  come negli editor web. */
  function inCronologia() {
    var h = document.getElementById('left-panel-history');
    if (h && h.offsetWidth > 0) return true;
    return !!prova(function () { var p = K.APP.getController('LeftMenu').leftMenu.panelHistory; return p && p.isVisible && p.isVisible(); }, false);
  }

  function calcolaModo() {
    if (inCronologia()) { K.aperto = false; K.sel = null; K.flott = null; return 'vuoto'; }
    if (K.TIPO !== 'word') return K.aperto ? 'pannello' : 'flottante';
    if (K.aperto) return 'pannello';
    var ci = visibili().some(function (m) { return !m.get('resolved') && !m.get('unattached'); });
    if (!ci && !(K.nuovo && !K.nuovo.doc)) return 'vuoto';
    return K.colonnaPossibile ? 'margine' : 'stretto';
  }

  /** Documenti: c'è posto per la colonna accanto alla pagina? Si guarda la larghezza
   *  della pagina (dalle coordinate dei commenti, o dalla sezione e dallo zoom) e quella
   *  dell'editor senza la colonna. */
  function postoColonna() {
    // righello a sinistra, scorrimento a destra, un respiro accanto alla pagina
    var resta = larghezzaTutta() - larghezzaPagina() - 34 - 40;
    return resta >= 236 ? Math.min(MARGINE, resta) : 0;
  }
  /** La larghezza dell'editor come se la colonna non ci fosse. */
  function larghezzaTutta() {
    if (!K.panLayout) return K.sdk ? K.sdk.getBoundingClientRect().width : 0;
    var ec = K.colonna.previousElementSibling;
    return (ec ? ec.getBoundingClientRect().width : 0) + K.larghezza;
  }
  function larghezzaPagina() {
    var vista = document.getElementById('id_main_view');
    var pag = null;
    if (K.destra != null && vista) {
      var v = vista.getBoundingClientRect(), s = K.sdk.getBoundingClientRect();
      pag = 2 * (K.destra - (v.left - s.left)) - v.width;
    }
    if (!(pag > 100)) {
      pag = prova(function () {
        var sp = K.api.asc_GetSectionProps();
        return sp.get_W() * (K.zoom || 100) / 100 * 96 / 25.4;
      }, 820);
    }
    return pag;
  }

  function disegna(ricostruisci) {
    var modo = calcolaModo();
    if (modo === 'margine' || modo === 'stretto') {
      misura();
      var w = postoColonna();
      K.colonnaPossibile = w > 0;
      modo = calcolaModo();
      if (modo === 'margine' && w !== K.larghezza && Math.abs(w - K.larghezza) > 24) mettiLarghezza(w);
      else if (modo === 'margine' && !K.larghezza) mettiLarghezza(w);
    }
    if (modo === 'pannello') {
      var pw = PANNELLO;
      if (K.TIPO === 'word' && K.panLayout) {
        // Se col pannello la pagina non ci sta più, il pannello va sopra al documento. La
        // pagina si rimisura nella disposizione di adesso; vicino al limite non si cambia
        // idea a ogni giro.
        misura();
        var avanzo = larghezzaTutta() - PANNELLO - 34 - 16 - larghezzaPagina();
        if (K.pannelloSopra === undefined || Math.abs(avanzo) > 20) K.pannelloSopra = avanzo < 0;
      } else K.pannelloSopra = !K.panLayout;
      mettiLarghezza(K.pannelloSopra ? 0 : pw);
    } else if (modo !== 'margine') {
      mettiLarghezza(0);
    }
    if (modo !== K.modo) { ricostruisci = true; K.modo = modo; }
    document.body.classList.toggle('hf-cm-margine', modo === 'margine');
    document.body.classList.toggle('hf-cm-pannello', modo === 'pannello');

    scorrimentoInFondo(modo === 'margine' && K.larghezza > 0);
    if (ricostruisci) aggiornaSchede();
    if (modo === 'margine') disponiMargine();
    else if (modo === 'pannello') disponiPannello();
    disponiStrato(modo);
  }

  /** Con la colonna, lo scorrimento del documento va in fondo a destra, dopo le schede,
   *  come negli editor web. Si sposta con `left` (non con una trasformazione: ONLYOFFICE
   *  calcola dove si preme dalla posizione vera). ONLYOFFICE lo rimette al suo posto a
   *  ogni ridimensionamento: si risposta a ogni giro. */
  function scorrimentoInFondo(si) {
    var sb = document.getElementById('id_panel_right');
    if (!sb || !K.sdk || !K.panLayout) return;
    if (si) {
      var l = K.sdk.offsetWidth - sb.offsetWidth + K.larghezza;
      if (sb.style.getPropertyValue('left') !== l + 'px' || sb.style.getPropertyPriority('left') !== 'important') sb.style.setProperty('left', l + 'px', 'important');
      sb.classList.add('hf-cm-in-fondo');
    } else if (sb.classList.contains('hf-cm-in-fondo')) {
      sb.classList.remove('hf-cm-in-fondo');
      sb.style.setProperty('left', (K.sdk.offsetWidth - sb.offsetWidth) + 'px');
    }
  }

  /* ------------------------------------------------------------------ misura (documenti) */
  function misura() {
    var api = K.api, nome = K.invio;
    var lista = visibili().filter(function (m) { return !m.get('resolved') && !m.get('unattached'); });
    var pos = {};
    if (!nome || !lista.length || typeof api.asc_showComment !== 'function') { K.pos = pos; return; }
    var proprio = Object.prototype.hasOwnProperty.call(api, nome);
    var orig = api[nome];
    api[nome] = function (ev, a, b, c) {
      if (ev === 'asc_onShowComment') {
        (a || []).forEach(function (u) { if (!pos[u]) pos[u] = { x: b, y: c }; });
        return true;
      }
      if (ev === 'asc_onHideComment' || ev === 'asc_onUpdateCommentPosition') return true;
      return orig.apply(this, arguments);
    };
    try {
      lista.forEach(function (m) { api.asc_showComment(m.get('uid'), false); });
    } catch (e) { /* una versione nuova: niente posizioni, si resta senza margine */ } finally {
      if (proprio) api[nome] = orig; else delete api[nome];
    }
    K.pos = pos;
    for (var u in pos) { if (pos[u].x > 0) { K.destra = pos[u].x; break; } }
  }

  /* ------------------------------------------------------------------ le schede */
  function firmaDi(m) {
    return JSON.stringify([m.get('comment'), m.get('resolved'), m.get('lock'), m.get('username'), m.get('time'), m.get('quote'),
      (m.get('replys') || []).map(function (r) { return [r.get('id'), r.get('reply'), r.get('time'), r.get('username')]; }),
      K.modifica && K.modifica.uid === m.get('uid') ? K.modifica.rid || '-' : '', !!K.utenti]);
  }
  function aggiornaSchede() {
    var vivi = {};
    visibili().forEach(function (m) {
      var uid = m.get('uid'), f = firmaDi(m), s = K.schede[uid];
      vivi[uid] = true;
      if (s && s.firma === f) return;
      var nuova = scheda(m);
      if (s) {
        // Una risposta arrivata mentre si scrive: la bozza resta, e anche il fuoco.
        var vecchio = s.el.querySelector('.hf-cm-rispondi:not(.hf-cm-modifica) textarea');
        var nuovo = nuova.querySelector('.hf-cm-rispondi:not(.hf-cm-modifica) textarea');
        var aveva = vecchio && document.activeElement === vecchio;
        if (vecchio && nuovo && vecchio.value) { nuovo.value = vecchio.value; nuova.querySelector('.hf-cm-rispondi').classList.add('attivo'); campoCambiato(nuovo); }
        if (s.el.parentNode) s.el.parentNode.replaceChild(nuova, s.el);
        if (aveva && nuovo) { nuovo.focus(); nuovo.selectionStart = nuovo.selectionEnd = nuovo.value.length; }
      }
      K.schede[uid] = { el: nuova, firma: f };
    });
    Object.keys(K.schede).forEach(function (u) {
      if (!vivi[u]) { var s = K.schede[u]; if (s.el.parentNode) s.el.parentNode.removeChild(s.el); delete K.schede[u]; }
    });
    if (K.sel && !vivi[K.sel]) K.sel = null;
  }

  function tondo(a, piccolo) {
    return '<div class="hf-cm-tondo' + (piccolo ? ' piccolo' : '') + '" style="background:' + esc(a.colore) + '" aria-hidden="true">' + esc(iniziali(a.nome)) + '</div>';
  }
  function bottone(ico, titolo, classe) {
    return '<button type="button" class="hf-cm-ico ' + (classe || '') + '" title="' + esc(titolo) + '" aria-label="' + esc(titolo) + '">' + svg(ico) + '</button>';
  }

  /** Una discussione: il commento, le risposte, il campo per rispondere. */
  function scheda(m) {
    var uid = m.get('uid');
    var a = autore(m);
    var risolta = !!m.get('resolved');
    var bloccata = !!m.get('lock');
    var s = el('div', { class: 'hf-scheda' + (risolta ? ' risolta' : '') + (m.get('unattached') ? ' sul-documento' : ''), 'data-uid': uid, tabindex: '-1' });
    var h = '<div class="hf-cm-testa">' + tondo(a) +
      '<div class="hf-cm-chi"><div class="hf-cm-nome">' + esc(a.nome) + '</div><div class="hf-cm-data">' + esc(quando(m.get('time'))) + '</div></div>';
    if (scrive() && !bloccata) {
      h += risolta ? bottone('riapri', 'Riapri la discussione', 'hf-cm-riapri') : bottone('spunta', 'Risolvi: segna come fatto e nascondi la discussione', 'hf-cm-risolvi');
    }
    if (vociMenu(m, null).length) h += bottone('altro', 'Altre opzioni', 'hf-cm-menu');
    h += '</div>';
    if (risolta) h += '<div class="hf-cm-segno">Risolta</div>';
    if (m.get('quote') && K.TIPO === 'word') h += '<div class="hf-cm-citazione">' + esc(String(m.get('quote')).replace(/[\t]+/g, ' ').trim()) + '</div>';
    if (K.modifica && K.modifica.uid === uid && !K.modifica.rid) h += campoModifica(m.get('comment'));
    else h += '<div class="hf-cm-testo">' + testoHtml(m.get('comment')) + '</div>';
    var risposte = m.get('replys') || [];
    if (risposte.length) {
      h += '<div class="hf-cm-quante">' + (risposte.length === 1 ? '1 risposta' : risposte.length + ' risposte') + '</div>';
      h += '<div class="hf-cm-risposte">';
      risposte.forEach(function (r) {
        var ra = autore(r);
        h += '<div class="hf-cm-risposta" data-rid="' + esc(r.get('id')) + '"><div class="hf-cm-testa">' + tondo(ra, true) +
          '<div class="hf-cm-chi"><div class="hf-cm-nome">' + esc(ra.nome) + '</div><div class="hf-cm-data">' + esc(quando(r.get('time'))) + '</div></div>' +
          (vociMenu(m, r).length ? bottone('altro', 'Altre opzioni', 'hf-cm-menu') : '') + '</div>';
        if (K.modifica && K.modifica.uid === uid && K.modifica.rid === r.get('id')) h += campoModifica(r.get('reply'));
        else h += '<div class="hf-cm-testo">' + testoHtml(r.get('reply')) + '</div>';
        h += '</div>';
      });
      h += '</div>';
    }
    if (bloccata) h += '<div class="hf-cm-segno">Qualcuno la sta modificando</div>';
    else if (scrive() && !risolta && !K.modifica) {
      h += '<div class="hf-cm-rispondi"><textarea rows="1" placeholder="' + (K.mode.canRequestUsers ? 'Rispondi o aggiungi altri utenti con @' : 'Rispondi') + '"></textarea>' +
        '<div class="hf-cm-bottoni"><button type="button" class="hf-cm-pieno hf-cm-invia" disabled>Rispondi</button><button type="button" class="hf-cm-testuale hf-cm-annulla">Annulla</button></div></div>';
    }
    s.innerHTML = h;
    collegaScheda(s, m);
    return s;
  }
  function campoModifica(testo) {
    return '<div class="hf-cm-rispondi hf-cm-modifica attivo"><textarea rows="2">' + esc(testo) + '</textarea>' +
      '<div class="hf-cm-bottoni"><button type="button" class="hf-cm-pieno hf-cm-salva">Salva</button><button type="button" class="hf-cm-testuale hf-cm-annulla">Annulla</button></div></div>';
  }
  function vociMenu(m, r) {
    var v = [];
    var chi = r || m;
    var mio = String(chi.get('userid')) === io();
    if (scrive() && !m.get('lock')) {
      if (mio && chi.get('editable') !== false) v.push({ t: 'Modifica', ico: 'matita', f: function () { K.modifica = { uid: m.get('uid'), rid: r ? r.get('id') : null }; pianifica(true, fuocoModifica); } });
      // Solo sulle proprie, come Modifica: le discussioni degli altri si risolvono.
      if (mio && chi.get('removable') !== false) {
        v.push({ t: 'Elimina', ico: 'cestino', f: function () { eliminaChiedi(m, r); } });
      }
    }
    if (!r && K.mode.canMakeActionLink && m.get('guid')) v.push({ t: 'Link a questo commento', ico: 'link', f: function () { chiediLink(m); } });
    return v;
  }

  function collegaScheda(s, m) {
    var uid = m.get('uid');
    s.addEventListener('mousedown', function (e) {
      // Il clic su una scheda non deve ridare il fuoco al documento prima del tempo.
      if (!e.target.closest('textarea, a')) e.preventDefault();
    });
    s.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (b && b.classList.contains('hf-cm-risolvi')) { e.stopPropagation(); risolvi(m, true); return; }
      if (b && b.classList.contains('hf-cm-riapri')) { e.stopPropagation(); risolvi(m, false); return; }
      if (b && b.classList.contains('hf-cm-menu')) {
        e.stopPropagation();
        var rEl = b.closest('.hf-cm-risposta');
        var r = rEl ? (m.get('replys') || []).filter(function (x) { return String(x.get('id')) === rEl.getAttribute('data-rid'); })[0] : null;
        apriMenu(b, vociMenu(m, r));
        return;
      }
      if (b && b.classList.contains('hf-cm-invia')) { e.stopPropagation(); rispondi(m, s.querySelector('.hf-cm-rispondi:not(.hf-cm-modifica) textarea')); return; }
      if (b && b.classList.contains('hf-cm-salva')) { e.stopPropagation(); salvaModifica(m, s.querySelector('.hf-cm-modifica textarea')); return; }
      if (b && b.classList.contains('hf-cm-annulla')) {
        e.stopPropagation();
        if (K.modifica) { K.modifica = null; pianifica(true); return; }
        var t = s.querySelector('.hf-cm-rispondi:not(.hf-cm-modifica) textarea');
        if (t) { t.value = ''; campoCambiato(t); t.blur(); t.parentNode.classList.remove('attivo'); }
        return;
      }
      if (e.target.closest('a')) return;
      if (e.target.closest('textarea')) { scegli(uid, false); return; }
      scegli(uid, true);
    });
    Array.prototype.forEach.call(s.querySelectorAll('textarea'), function (t) { collegaCampo(t, s); });
  }

  /** Sceglie una discussione: la scheda si alza e, se si vuole, il cursore va al testo. */
  function scegli(uid, alTesto) {
    var cambia = K.sel !== uid;
    K.sel = uid;
    var m = trova(uid);
    if (alTesto && m && m.get('quote') !== null && !m.get('unattached')) {
      prova(function () { K.api.asc_selectComment(uid); });
      if (K.TIPO !== 'word') prova(function () { K.api.asc_showComment(uid, false); });
    }
    if (cambia) pianifica(true);
  }

  function risolvi(m, si) {
    if (!!m.get('resolved') === si) return;
    prova(function () { K.ctrl.onResolveComment(m.get('uid')); });
    if (si) { if (K.sel === m.get('uid')) K.sel = null; avviso('Discussione risolta'); }
  }
  function rispondi(m, t) {
    var v = t && t.value.replace(/\s+$/, '');
    if (!v) return;
    t.value = '';
    campoCambiato(t);
    tieni(1500);
    prova(function () { K.ctrl.onAddReplyComment(m.get('uid'), v); });
  }
  function salvaModifica(m, t) {
    var v = t && t.value.replace(/\s+$/, '');
    var mod = K.modifica;
    K.modifica = null;
    tieni(1500);
    if (v && mod) {
      if (mod.rid) prova(function () { K.ctrl.onChangeReplyComment(m.get('uid'), mod.rid, v); });
      else prova(function () { K.ctrl.onChangeComment(m.get('uid'), v); });
    }
    pianifica(true);
  }
  function eliminaChiedi(m, r) {
    conferma(r ? 'Eliminare questa risposta?' : 'Eliminare questa discussione?',
      r ? 'La risposta sparisce per tutti.' : 'Il commento e le sue risposte spariscono per tutti.',
      'Elimina', function () {
        if (r) prova(function () { K.ctrl.onRemoveReplyComment(m.get('uid'), r.get('id')); });
        else {
          if (K.sel === m.get('uid')) K.sel = null;
          prova(function () { K.ctrl.onRemoveComment(m.get('uid')); });
        }
      });
  }
  function chiediLink(m) {
    K.attesaLink = true;
    prova(function () { Common.Gateway.requestMakeActionLink({ action: { type: 'comment', data: m.get('guid') } }); });
    setTimeout(function () { if (K.attesaLink) { K.attesaLink = false; avviso('Il link non è arrivato: riprova'); } }, 6000);
  }
  function copia(testo) {
    var fatto = function () { avviso('Link copiato negli appunti'); };
    var aMano = function () {
      var t = el('textarea', { style: 'position:fixed;left:-9999px;top:0' });
      t.value = testo;
      document.body.appendChild(t);
      t.select();
      var ok = prova(function () { return document.execCommand('copy'); }, false);
      t.remove();
      if (ok) fatto(); else avviso('Link: ' + testo, true);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(testo).then(fatto, aMano);
    else aMano();
  }

  /* ------------------------------------------------------------------ i campi */
  function collegaCampo(t, s) {
    var box = t.parentNode;
    // I tasti scritti qui non arrivano al documento (ONLYOFFICE ascolta il suo campo
    // nascosto): non serve spegnere i suoi tasti, e così non restano mai spenti.
    t.addEventListener('focus', function () { box.classList.add('attivo'); });
    t.addEventListener('blur', function () {
      setTimeout(function () { if (!t.value && document.activeElement !== t && !box.classList.contains('hf-cm-modifica')) box.classList.remove('attivo'); }, 150);
    });
    t.addEventListener('input', function () { campoCambiato(t); menzioni.guarda(t); });
    t.addEventListener('keydown', function (e) {
      if (menzioni.tasto(e, t)) return;
      e.stopPropagation();
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        var b = box.querySelector('.hf-cm-pieno');
        if (b && !b.disabled) b.click();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        var a = box.querySelector('.hf-cm-annulla');
        if (a) a.click();
      }
    });
    void s;
  }
  function campoCambiato(t) {
    t.style.height = 'auto';
    t.style.height = Math.min(t.scrollHeight, 200) + 'px';
    var b = t.parentNode.querySelector('.hf-cm-pieno');
    if (b) b.disabled = !t.value.trim();
    pianifica();
  }
  function fuocoModifica() {
    var t = document.querySelector('.hf-cm-modifica textarea');
    if (t) { t.focus(); t.selectionStart = t.selectionEnd = t.value.length; campoCambiato(t); }
  }
  function fuocoNuovo() {
    var t = document.querySelector('.hf-scheda-nuova textarea');
    if (t) t.focus();
  }

  function togliNuova() {
    K.nuovo = null;
    if (K.schedaNuova && K.schedaNuova.el.parentNode) K.schedaNuova.el.parentNode.removeChild(K.schedaNuova.el);
    K.schedaNuova = null;
  }

  /** La scheda del commento nuovo: «Commenta» e «Annulla». */
  function schedaNuova() {
    if (K.schedaNuova && K.schedaNuova.doc === !!(K.nuovo && K.nuovo.doc)) return K.schedaNuova.el;
    var a = { nome: mioNome(), colore: coloreDi(io() || mioNome()) };
    var u = prova(function () { return K.ctrl.userCollection.findOriginalUser(io()); });
    if (u && u.get && u.get('color')) a.colore = u.get('color');
    var s = el('div', { class: 'hf-scheda hf-scheda-nuova scelta', 'data-uid': 'nuovo' });
    s.innerHTML = '<div class="hf-cm-testa">' + tondo(a) + '<div class="hf-cm-chi"><div class="hf-cm-nome">' + esc(a.nome) + '</div>' +
      (K.nuovo && K.nuovo.doc ? '<div class="hf-cm-data">Sul documento</div>' : '') + '</div></div>' +
      '<div class="hf-cm-rispondi attivo"><textarea rows="2" placeholder="' + (K.mode.canRequestUsers ? 'Commenta o aggiungi altri utenti con @' : 'Commenta') + '"></textarea>' +
      '<div class="hf-cm-bottoni"><button type="button" class="hf-cm-pieno" disabled>Commenta</button><button type="button" class="hf-cm-testuale hf-cm-annulla">Annulla</button></div></div>';
    var t = s.querySelector('textarea');
    collegaCampo(t, s);
    s.addEventListener('mousedown', function (e) { if (!e.target.closest('textarea')) e.preventDefault(); });
    s.querySelector('.hf-cm-pieno').addEventListener('click', function () {
      var v = t.value.replace(/\s+$/, '');
      if (!v) return;
      var doc = K.nuovo && K.nuovo.doc;
      togliNuova();
      if (doc) prova(function () { K.ctrl.onCreateComment(null, v, false, false, true); K.ctrl.getView().showEditContainer(false); });
      else prova(function () { K.ctrl.onAddDummyComment(v); });
      pianifica(true);
      prova(function () { Common.NotificationCenter.trigger('edit:complete'); });
    });
    s.querySelector('.hf-cm-annulla').addEventListener('click', function () {
      var doc = K.nuovo && K.nuovo.doc;
      togliNuova();
      if (doc) prova(function () { K.ctrl.getView().showEditContainer(false); });
      else prova(function () { K.ctrl.clearDummyComment(true); });
      pianifica(true);
      prova(function () { Common.NotificationCenter.trigger('edit:complete'); });
    });
    K.schedaNuova = { el: s, doc: !!(K.nuovo && K.nuovo.doc) };
    return s;
  }

  /* ------------------------------------------------------------------ la disposizione */
  /** Documenti con la colonna: ogni scheda all'altezza del suo testo, una sotto l'altra
   *  senza sovrapporsi. La scheda scelta (o quella nuova) sta esattamente al suo posto;
   *  le altre si spostano sopra e sotto. */
  function disponiMargine() {
    var col = K.colonna;
    if (K.pannello && K.pannello.parentNode === col) col.removeChild(K.pannello);
    var off = scarto(col);
    var voci = [];
    visibili().forEach(function (m) {
      var u = m.get('uid'), p = K.pos[u], s = K.schede[u];
      if (!s) return;
      if (!p || m.get('resolved') || m.get('unattached')) { if (s.el.parentNode === col) col.removeChild(s.el); return; }
      voci.push({ uid: u, y: p.y + off.y, el: s.el });
    });
    if (K.nuovo && !K.nuovo.doc && K.nuovo.y != null) voci.push({ uid: 'nuovo', y: K.nuovo.y + off.y, el: schedaNuova(), nuova: true });
    else if (K.schedaNuova && K.schedaNuova.el.parentNode === col) col.removeChild(K.schedaNuova.el);
    voci.sort(function (a, b) { return a.y - b.y || (a.nuova ? 1 : 0) - (b.nuova ? 1 : 0); });
    voci.forEach(function (v) {
      if (v.el.parentNode !== col) col.appendChild(v.el);
      v.el.classList.toggle('scelta', v.nuova || v.uid === K.sel);
      v.h = v.el.offsetHeight;
    });
    var GAP = 8, i, cur, t;
    var iSel = voci.findIndex(function (v) { return v.nuova; });
    if (iSel < 0) iSel = voci.findIndex(function (v) { return v.uid === K.sel; });
    if (iSel < 0) {
      cur = -Infinity;
      for (i = 0; i < voci.length; i++) { t = Math.max(voci[i].y, cur); voci[i].top = t; cur = t + voci[i].h + GAP; }
    } else {
      // La scheda scelta resta all'altezza del suo testo; se così uscirebbe sotto, sale
      // quanto basta per vedere i bottoni (il testo è comunque sullo schermo).
      var alto = col.clientHeight - voci[iSel].h - 8;
      if (voci[iSel].y < col.clientHeight && voci[iSel].y > alto && alto > 8) voci[iSel].y = alto;
      voci[iSel].top = voci[iSel].y;
      cur = voci[iSel].y + voci[iSel].h + GAP;
      for (i = iSel + 1; i < voci.length; i++) { t = Math.max(voci[i].y, cur); voci[i].top = t; cur = t + voci[i].h + GAP; }
      cur = voci[iSel].y - GAP;
      for (i = iSel - 1; i >= 0; i--) { t = Math.min(voci[i].y, cur - voci[i].h); voci[i].top = t; cur = t - GAP; }
    }
    voci.forEach(function (v) { v.el.style.transform = 'translate(' + (v.el.classList.contains('scelta') ? -14 : 0) + 'px,' + Math.round(v.top) + 'px)'; });
  }

  /** Lo strato sopra il documento: i segni nel margine stretto, la scheda accanto al testo
   *  (fogli, presentazioni, documenti stretti) e il pannello quando non c'è posto. */
  function disponiStrato(modo) {
    var st = K.strato;
    var off = scarto(st);
    var w = st.clientWidth, hh = st.clientHeight;
    // I segni (documenti stretti): un fumetto accanto alla pagina per ogni discussione.
    var segni = st.querySelector('.hf-cm-segni');
    if (modo === 'stretto') {
      if (!segni) { segni = el('div', { class: 'hf-cm-segni' }); st.appendChild(segni); }
      // Le discussioni sulla stessa riga fanno un segno solo, col loro numero.
      var righe = [], perRiga = {};
      visibili().forEach(function (m) {
        var p = K.pos[m.get('uid')];
        if (!p || m.get('resolved') || m.get('unattached')) return;
        var y = Math.round(p.y + off.y), chiave = Math.round(y / 20);
        if (!perRiga[chiave]) { perRiga[chiave] = { y: y, x: Math.round(Math.min(p.x + off.x + 10, w - 56)), uids: [] }; righe.push(perRiga[chiave]); }
        perRiga[chiave].uids.push(m.get('uid'));
      });
      segni.innerHTML = righe.map(function (r) {
        var scelto = r.uids.indexOf(K.sel) >= 0;
        return '<button type="button" class="hf-cm-segno-b' + (scelto ? ' scelto' : '') + '" data-uid="' + esc(r.uids[0]) + '" style="left:' + r.x + 'px;top:' + r.y + 'px" title="' +
          (r.uids.length === 1 ? 'Apri il commento' : 'Apri i ' + r.uids.length + ' commenti') + '">' + svg('fumetto') + '<span>' + r.uids.length + '</span></button>';
      }).join('');
      Array.prototype.forEach.call(segni.children, function (b) {
        b.addEventListener('mousedown', function (e) { e.preventDefault(); });
        b.addEventListener('click', function () { scegli(b.getAttribute('data-uid'), true); });
      });
    } else if (segni) segni.remove();

    // La scheda accanto al testo.
    var cosa = null, x = 0, y = 0, lx;
    if (modo === 'flottante' || modo === 'stretto') {
      if (K.nuovo && !K.nuovo.doc) { cosa = schedaNuova(); x = K.nuovo.x; y = K.nuovo.y; lx = K.nuovo.lx; }
      else if (K.sel && K.schede[K.sel]) {
        cosa = K.schede[K.sel].el;
        var p = K.pos[K.sel];
        if (modo === 'stretto' && p) { x = p.x; y = p.y; }
        else if (K.flott) { x = K.flott.x; y = K.flott.y; lx = K.flott.lx; }
        else cosa = null;
      }
    }
    Array.prototype.forEach.call(st.querySelectorAll(':scope > .hf-scheda'), function (s) { if (s !== cosa) st.removeChild(s); });
    if (cosa && x != null && y != null) {
      if (cosa.parentNode !== st) st.appendChild(cosa);
      cosa.classList.add('scelta', 'sopra');
      var cw = Math.min(SCHEDA_FL, w - 16);
      cosa.style.width = cw + 'px';
      var left = x + off.x + 12;
      if (left + cw > w - 8) left = lx != null && lx + off.x - cw - 12 > 8 ? lx + off.x - cw - 12 : w - cw - 8;
      var top = Math.max(8, Math.min(y + off.y - 8, hh - cosa.offsetHeight - 8));
      cosa.style.transform = 'translate(' + Math.round(left) + 'px,' + Math.round(top) + 'px)';
    }
    // Il pannello sopra il documento (finestra stretta).
    if (modo === 'pannello' && K.pannelloSopra) {
      if (K.pannello && K.pannello.parentNode !== st) st.appendChild(K.pannello);
      if (K.pannello) {
        K.pannello.classList.add('sopra');
        // Lo scorrimento del documento resta libero, a destra del pannello.
        var sb = document.getElementById('id_panel_right');
        K.pannello.style.right = (sb && sb.offsetWidth || 0) + 'px';
      }
    } else if (K.pannello && K.pannello.parentNode === st) {
      st.removeChild(K.pannello);
      K.pannello.classList.remove('sopra');
    }
    Array.prototype.forEach.call(document.querySelectorAll('.hf-scheda'), function (s) {
      if (s.parentNode !== st) { s.classList.remove('sopra'); s.style.width = ''; }
    });
  }

  /* ------------------------------------------------------------------ il pannello */
  var FILTRI = [['tutti', 'Tutti'], ['perte', 'Per te'], ['aperti', 'Aperti'], ['risolti', 'Risolti']];
  function creaPannello() {
    var p = el('div', { class: 'hf-cm-pannello', role: 'complementary', 'aria-label': 'Tutti i commenti' });
    p.innerHTML = '<div class="hf-cm-ptesta"><span>Tutti i commenti</span>' + bottone('chiudi', 'Chiudi', 'hf-cm-pchiudi') + '</div>' +
      '<div class="hf-cm-filtri" role="tablist">' + FILTRI.map(function (f) {
        return '<button type="button" role="tab" data-f="' + f[0] + '">' + f[1] + '</button>';
      }).join('') + '</div><div class="hf-cm-lista"></div>';
    p.querySelector('.hf-cm-pchiudi').addEventListener('click', function () { apriPannello(false); });
    Array.prototype.forEach.call(p.querySelectorAll('.hf-cm-filtri button'), function (b) {
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () { K.filtro = b.getAttribute('data-f'); pianifica(); });
    });
    K.pannello = p;
    return p;
  }
  function disponiPannello() {
    var p = K.pannello || creaPannello();
    if (!K.pannelloSopra && p.parentNode !== K.colonna) K.colonna.appendChild(p);
    Array.prototype.forEach.call(K.colonna.querySelectorAll(':scope > .hf-scheda'), function (s) { K.colonna.removeChild(s); });
    Array.prototype.forEach.call(p.querySelectorAll('.hf-cm-filtri button'), function (b) {
      var on = b.getAttribute('data-f') === K.filtro;
      b.classList.toggle('acceso', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    var lista = p.querySelector('.hf-cm-lista');
    var tutte = visibili();
    var scelte = tutte.filter(function (m) {
      if (K.filtro === 'aperti') return !m.get('resolved');
      if (K.filtro === 'risolti') return !!m.get('resolved');
      if (K.filtro === 'perte') return perMe(m);
      return true;
    });
    scelte = K.TIPO === 'word' ? ordinePosizione(scelte) : scelte.slice().sort(function (a, b) { return (b.get('time') || 0) - (a.get('time') || 0); });
    var voluti = [];
    if (K.nuovo && K.nuovo.doc) voluti.push(schedaNuova());
    scelte.forEach(function (m) { var s = K.schede[m.get('uid')]; if (s) voluti.push(s.el); });
    // Si rimettono in ordine senza togliere quelle che ci sono già (un campo resta com'è).
    Array.prototype.forEach.call(lista.children, function (c) { if (voluti.indexOf(c) < 0 && c.classList.contains('hf-scheda')) lista.removeChild(c); });
    var vuoto = lista.querySelector('.hf-cm-vuoto');
    if (!voluti.length) {
      if (!vuoto) {
        vuoto = el('div', { class: 'hf-cm-vuoto' });
        lista.appendChild(vuoto);
      }
      vuoto.innerHTML = svg('fumetto') + '<p>' + ({
        tutti: 'Ancora nessun commento.',
        perte: 'Nessun commento per te.',
        aperti: 'Nessun commento aperto.',
        risolti: 'Nessun commento risolto.',
      }[K.filtro]) + '</p>' + (K.filtro === 'tutti' && scrive() ? '<p class="piccolo">Scegli del testo e premi Ctrl+Alt+M per commentarlo.</p>' : '');
    } else if (vuoto) vuoto.remove();
    voluti.forEach(function (s, i) {
      if (lista.children[i] !== s) lista.insertBefore(s, lista.children[i] || null);
      s.style.transform = '';
      s.classList.toggle('scelta', s.classList.contains('hf-scheda-nuova') || s.getAttribute('data-uid') === K.sel);
    });
  }
  function apriPannello(si) {
    if (si === K.aperto) { if (si) pianifica(); return; }
    K.aperto = si;
    if (!si && K.nuovo && K.nuovo.doc) { togliNuova(); prova(function () { K.ctrl.getView().showEditContainer(false); }); }
    pianifica(true);
    prova(function () { Common.NotificationCenter.trigger('pelle:commenti', si); });
  }

  /* ------------------------------------------------------------------ menu, conferma, avviso */
  function apriMenu(ancora, voci) {
    chiudiMenu();
    if (!voci.length) return;
    var m = el('div', { class: 'hf-cm-menu-pop', role: 'menu' });
    voci.forEach(function (v) {
      var b = el('button', { type: 'button', role: 'menuitem' }, svg(v.ico) + '<span>' + esc(v.t) + '</span>');
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () { chiudiMenu(); v.f(); });
      m.appendChild(b);
    });
    document.body.appendChild(m);
    var r = ancora.getBoundingClientRect();
    var left = Math.min(r.right - m.offsetWidth, window.innerWidth - m.offsetWidth - 8);
    var top = r.bottom + 4;
    if (top + m.offsetHeight > window.innerHeight - 8) top = r.top - m.offsetHeight - 4;
    m.style.left = Math.max(8, left) + 'px';
    m.style.top = Math.max(8, top) + 'px';
    K.menu = m;
  }
  function chiudiMenu() { if (K.menu) { K.menu.remove(); K.menu = null; } }

  function conferma(titolo, testo, si, fai) {
    var f = el('div', { class: 'hf-cm-velo', role: 'dialog', 'aria-modal': 'true' });
    f.innerHTML = '<div class="hf-cm-dialogo"><h2>' + esc(titolo) + '</h2><p>' + esc(testo) + '</p>' +
      '<div class="hf-cm-bottoni"><button type="button" class="hf-cm-testuale hf-cm-no">Annulla</button><button type="button" class="hf-cm-pieno hf-cm-si">' + esc(si) + '</button></div></div>';
    var chiudi = function () { f.remove(); document.removeEventListener('keydown', tasti, true); prova(function () { Common.NotificationCenter.trigger('edit:complete'); }); };
    var tasti = function (e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); chiudi(); } };
    f.addEventListener('click', function (e) {
      if (e.target === f || e.target.closest('.hf-cm-no')) chiudi();
      else if (e.target.closest('.hf-cm-si')) { chiudi(); fai(); }
    });
    document.addEventListener('keydown', tasti, true);
    document.body.appendChild(f);
    f.querySelector('.hf-cm-si').focus();
  }

  function avviso(testo, lungo) {
    var v = document.getElementById('hf-cm-avviso');
    if (v) v.remove();
    v = el('div', { id: 'hf-cm-avviso', role: 'status' });
    v.textContent = testo;
    document.body.appendChild(v);
    setTimeout(function () { v.classList.add('via'); setTimeout(function () { v.remove(); }, 300); }, lungo ? 9000 : 3200);
  }

  /* ------------------------------------------------------------------ la tendina «@» */
  // Scrivendo «@» (o «+») compare la tendina con le persone che HyFile dice menzionabili:
  // tondo, nome, email. La scelta mette «@email» nel testo: è la forma che ONLYOFFICE
  // riconosce per mandare l'avviso (onRequestSendNotify) a chi è menzionato, e che le
  // schede mostrano come «@Nome».
  var menzioni = {
    el: null, campo: null, inizio: 0, cerca: '', voci: [], i: 0, attesa: false,
    guarda: function (t) {
      if (!K.mode.canRequestUsers) return;
      var prima = t.value.slice(0, t.selectionStart);
      var m = /(?:^|\s)[@+]([^\s@+]*)$/.exec(prima);
      if (!m) { this.chiudi(); return; }
      this.campo = t;
      this.cerca = m[1];
      this.inizio = t.selectionStart - m[1].length - 1;
      if (K.utenti) this.mostra(K.utenti, true);
      else if (!this.attesa) {
        this.attesa = true;
        prova(function () { Common.UI.ExternalUsers.get('mention', undefined, 0, 100, m[1]); });
      }
    },
    risposta: function (utenti, paginato) {
      this.attesa = false;
      if (!this.campo) return;
      this.mostra(utenti, paginato === undefined);
    },
    mostra: function (utenti, filtra) {
      var q = this.cerca.toLowerCase();
      var lista = (utenti || []).filter(function (u) { return u && u.email; });
      if (filtra && q) {
        lista = lista.filter(function (u) {
          if (u.email.toLowerCase().indexOf(q) === 0) return true;
          return String(u.name || '').toLowerCase().split(/\s+/).some(function (p) { return p.indexOf(q) === 0; });
        });
      }
      lista = lista.slice(0, 50);
      if (!lista.length) { this.chiudi(true); return; }
      this.voci = lista;
      this.i = 0;
      if (!this.el) {
        this.el = el('div', { class: 'hf-cm-tendina', role: 'listbox' });
        document.body.appendChild(this.el);
      }
      var me = this;
      this.el.innerHTML = lista.map(function (u, i) {
        var a = { nome: u.name || u.email, colore: coloreDi(u.email) };
        return '<div class="hf-cm-persona' + (i === 0 ? ' acceso' : '') + '" role="option" data-i="' + i + '">' + tondo(a) +
          '<div class="hf-cm-chi"><div class="hf-cm-nome">' + esc(a.nome) + '</div><div class="hf-cm-email">' + esc(u.email) + '</div></div></div>';
      }).join('');
      Array.prototype.forEach.call(this.el.children, function (r) {
        r.addEventListener('mousedown', function (e) { e.preventDefault(); me.metti(Number(r.getAttribute('data-i'))); });
        r.addEventListener('mousemove', function () { me.accendi(Number(r.getAttribute('data-i'))); });
      });
      var rr = this.campo.getBoundingClientRect();
      var w = Math.max(260, Math.min(320, rr.width + 40));
      this.el.style.width = w + 'px';
      var left = Math.min(rr.left, window.innerWidth - w - 8);
      var top = rr.bottom + 4;
      var h = this.el.offsetHeight;
      if (top + h > window.innerHeight - 8) top = Math.max(8, rr.top - h - 4);
      this.el.style.left = Math.max(8, left) + 'px';
      this.el.style.top = top + 'px';
    },
    accendi: function (i) {
      if (!this.el) return;
      this.i = Math.max(0, Math.min(i, this.voci.length - 1));
      Array.prototype.forEach.call(this.el.children, function (r, j) { r.classList.toggle('acceso', j === this.i); }, this);
      var c = this.el.children[this.i];
      if (c && c.scrollIntoView) c.scrollIntoView({ block: 'nearest' });
    },
    metti: function (i) {
      var u = this.voci[i], t = this.campo;
      if (!u || !t) return;
      K.nomi[u.email.toLowerCase()] = u.name || u.email;
      var fine = t.selectionStart;
      var ins = '@' + u.email + ' ';
      t.value = t.value.slice(0, this.inizio) + ins + t.value.slice(fine);
      t.selectionStart = t.selectionEnd = this.inizio + ins.length;
      this.chiudi();
      t.focus();
      campoCambiato(t);
    },
    tasto: function (e, t) {
      if (!this.el || this.campo !== t) return false;
      if (e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); this.accendi(this.i + 1); return true; }
      if (e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); this.accendi(this.i - 1); return true; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); this.metti(this.i); return true; }
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); this.chiudi(); return true; }
      return false;
    },
    chiudi: function (tieni) {
      if (this.el) { this.el.remove(); this.el = null; }
      if (!tieni) this.campo = null;
    },
  };
})();
