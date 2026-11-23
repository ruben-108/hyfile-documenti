/*
 * La pelle di HyFile sul telefono (HyFile 1.36.0, SPEC §19.11): una parte della pelle di
 * HyFile sopra ONLYOFFICE Docs.
 * Copyright (C) 2026 Ruben Leo.
 *
 * Questo programma è software libero: puoi ridistribuirlo e/o modificarlo secondo i
 * termini della GNU Affero General Public License versione 3, come pubblicata dalla
 * Free Software Foundation. È distribuito senza alcuna garanzia. Il testo della licenza
 * sta nel file LICENSE accanto a questo, e su https://www.gnu.org/licenses/agpl-3.0.html.
 * Poggia su ONLYOFFICE Docs (Ascensio System SIA, AGPL v3), che non è stato modificato.
 *
 * Perché c'è. Ruben, 17/11/2026: «per mobile riusciresti a fare anche lì stile google così
 * è comunque utilizzabile». Fino alla 1.35 dal telefono si apriva l'editor per il telefono
 * di ONLYOFFICE: suo, con la sua faccia, e nella Community Edition solo da guardare (per
 * scrivere serviva «Versione per computer», illeggibile a quella misura). Provato su
 * aurora: l'editor per computer col dito funziona da solo (tocco, scorrimento, pizzico,
 * scrittura dalla tastiera del telefono). Manca solo una faccia da telefono, ed è questa.
 *
 * Cosa si vede, come le app per il telefono di Documenti, Fogli e Presentazioni:
 *   - si apre **da leggere**: in alto la freccia per tornare, il nome, commenti, Condividi
 *     e «⋮»; in basso a destra la matita. Il tocco sposta il cursore ma non apre la
 *     tastiera (`inputmode="none"` sul campo nascosto in cui ONLYOFFICE riceve i tasti);
 *   - la matita (o il doppio tocco sul testo) **scrive**: la tastiera si apre, in alto
 *     «✓» per finire, annulla, ripeti, «A» (formato), «+» (inserisci), «⋮»;
 *   - formato, inserisci e «⋮» sono fogli che salgono dal basso, con le voci grandi;
 *   - Cerca prende il posto della barra in alto, coi risultati «3 di 12» e le frecce;
 *   - nei fogli resta la barra della formula (toccata, si scrive nella cella) e le schede
 *     dei fogli in basso; nelle presentazioni in basso «‹ 3 di 12 ›».
 * I comandi sono quelli di ONLYOFFICE: i bottoni veri della sua barra (parcheggiata fuori
 * dallo schermo, come nella pelle per computer) o le funzioni del suo motore. Una voce il
 * cui comando manca non si mostra.
 */
(function () {
  'use strict';
  if (window.pelleTelefono) return;

  var I = null; // gli attrezzi di pelle.js (`interno()`)
  var G = null; // lo stato della pelle (chi scrive, l'editor, i bottoni di ONLYOFFICE)
  var T = { modo: 'lettura', foglio: null, cerca: null, tocco: null, ultimo: null, stile: '' };

  /* ------------------------------------------------------------------ icone in più */
  // Material Icons (Apache 2.0), come quelle di pelle.js.
  var ICONE = {
    grassetto: 'M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z',
    corsivo: 'M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z',
    sottolineato: 'M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z',
    barrato: 'M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z',
    numerato: 'M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z',
    rientraMeno: 'M11 17h10v-2H11v2zm-8-5l4 4V8l-4 4zm0 9h18v-2H3v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z',
    rientraPiu: 'M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z',
    formato: 'M5 17v2h14v-2H5zm4.5-4.2h5l.9 2.2h2.1L12.75 4h-1.5L6.5 15h2.1l.9-2.2zM12 5.98L13.87 11h-3.74L12 5.98z',
    personaPiu: 'M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
    chiudi: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    copia: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z',
    interruzione: 'M18 20H6v-3H4v3c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3h-2v3zM6 4h7v5h5v3h2V8l-6-6H6c-1.1 0-2 .9-2 2v8h2V4zm3 9h6v2H9zm8 0h6v2h-6zM1 13h6v2H1z',
    linea: 'M4 11h16v2H4z',
    computer: 'M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z',
    adatta: 'M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3zm6 12l-2.3-2.3 2.89-2.87-1.42-1.42L5.3 17.3 3 15v6zm12-6l-2.3 2.3-2.87-2.89-1.42 1.42 2.89 2.87L15 21h6z',
    acapo: 'M4 19h6v-2H4v2zM20 5H4v2h16V5zm-3 6H4v2h13.25c1.1 0 2 .9 2 2s-.9 2-2 2H15v-2l-3 3 3 3v-2h2c2.21 0 4-1.79 4-4s-1.79-4-4-4z',
    unisci: 'M17 20.41L18.41 19 15 15.59 13.59 17 17 20.41zM7.5 8H11v5.59L5.59 19 7 20.41l6-6V8h3.5L12 3.5 7.5 8z',
    inAlto: 'M8 11h3v10h2V11h3l-4-4-4 4zM4 3v2h16V3H4z',
    inBasso: 'M16 13h-3V3h-2v10H8l4 4 4-4zM4 19v2h16v-2H4z',
    percento: 'M7.5 11C9.43 11 11 9.43 11 7.5S9.43 4 7.5 4 4 5.57 4 7.5 5.57 11 7.5 11zm0-5C8.33 6 9 6.67 9 7.5S8.33 9 7.5 9 6 8.33 6 7.5 6.67 6 7.5 6zM4.0025 18.5831 18.59 3.9955 20.0042 5.4097 5.4167 19.9972zM16.5 13c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zm0 5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
    euro: 'M15 18.5c-2.51 0-4.68-1.42-5.76-3.5H15l1-2H8.58c-.05-.33-.08-.66-.08-1s.03-.67.08-1H15l1-2H9.24C10.32 6.92 12.5 5.5 15 5.5c1.61 0 3.09.59 4.23 1.57L21 5.3C19.41 3.87 17.3 3 15 3c-3.92 0-7.24 2.51-8.48 6H3l-1 2h4.06c-.04.33-.06.66-.06 1s.02.67.06 1H3l-1 2h4.52c1.24 3.49 4.56 6 8.48 6 2.31 0 4.41-.87 6-2.3l-1.78-1.77c-1.13.98-2.6 1.57-4.22 1.57z',
    somma: 'M18 4H6v2l6.5 6L6 18v2h12v-3h-7l5-5-5-5h7z',
    riga: 'M19 12h-2v3h-3v2h3v3h2v-3h3v-2h-3zM3 5h14v2H3zm0 4h14v2H3zm0 4h9v2H3z',
    foglio: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V7h2v2zm8 8h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V7h6v2z',
    diapositiva: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2v-4h4v-2h-4V7h-2v4H8v2h4z',
    prima: 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z',
    dopo: 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
  };
  function svg(n, cls) { return I.svg(n, cls); }
  function el(tag, attr, html) { return I.el(tag, attr, html); }
  function esc(s) { return I.esc(s); }
  function prova(f, dopo) { return I.prova(f, dopo); }
  function c(nome) { return I.c(nome); }
  function tb() { return G.tb; }
  function premuto(b) { b = I.bottone(b); return !!(b && b.pressed); }
  function senzaFuoco(e) { e.preventDefault(); }
  function corpo() { return document.body; }

  /* ------------------------------------------------------------------ avvio */
  function avvia(interno) {
    I = interno;
    G = I.G;
    for (var k in ICONE) I.ICONE[k] = ICONE[k];
    corpo().classList.add('hf-tel', 'hf-tel-' + G.TIPO, 'hf-tel-lettura');
    if (G.modifica) corpo().classList.add('hf-tel-puo');

    // La testata al posto della barra di ONLYOFFICE, che resta viva fuori dallo schermo.
    var cima = document.getElementById('toolbar');
    var vecchia = cima.querySelector(':scope > .toolbar') || cima.firstElementChild;
    cima.insertBefore(testa(), cima.firstChild);
    if (vecchia) vecchia.classList.add('hf-parcheggio');
    I.altezza(56);

    // Quello che a questa misura ruba spazio al documento: la colonna dei pannelli a
    // destra (immagine, tabella, paragrafo: col dito si usano i fogli dal basso), la barra
    // di stato, nelle presentazioni miniature e note. I righelli col documento.
    prova(function () { var v = c('ViewTab').view; if (v && v.chRightMenu && I.spuntata(v.chRightMenu)) v.chRightMenu.setValue(false); });
    if (G.TIPO !== 'cell') I.senzaBarraDiStato();
    if (G.TIPO === 'cell') prova(barraDellaFormula);

    // La matita, come nelle app: da leggere a scrivere.
    if (G.modifica) {
      var m = el('button', { type: 'button', id: 'hf-tel-matita', 'aria-label': 'Modifica' }, svg('matita'));
      m.addEventListener('mousedown', senzaFuoco);
      m.addEventListener('click', function () { scrivi(); });
      corpo().appendChild(m);
    }
    if (G.TIPO === 'slide') corpo().appendChild(barraDiapositive());

    tastiera(false);
    ascolta();
  }

  /** Quello che nasce col documento: lo zoom alla larghezza, i conti delle diapositive. */
  function documento() {
    prova(function () { G.api.asc_SetViewRulers && G.api.asc_SetViewRulers(false); });
    prova(function () { var v = c('ViewTab').view; if (v && v.chRightMenu && I.spuntata(v.chRightMenu)) v.chRightMenu.setValue(false); });
    if (G.TIPO === 'word') prova(function () { G.api.zoomFitToWidth(); });
    if (G.TIPO === 'slide') { prova(senzaMiniature); prova(function () { G.api.zoomFitToPage(); aggiornaDiapositive(); }); }
    tastiera(T.modo === 'modifica');
    prova(aggiornaAnnulla);
  }

  function titolo(t) {
    G.titolo = t;
    var n = document.querySelector('#hf-tel-nome .hf-tel-titolo');
    if (n) n.textContent = I.senzaEstensione(t);
  }

  /* ------------------------------------------------------------------ la testata */
  function tondo(ico, titoloB, f, id, cls) {
    var b = el('button', { type: 'button', class: 'hf-tel-tondo' + (cls ? ' ' + cls : ''), 'aria-label': titoloB }, svg(ico));
    if (id) b.id = id;
    b.addEventListener('mousedown', senzaFuoco);
    b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); if (!b.disabled) f(b); });
    return b;
  }
  function testa() {
    var o = G.opz;
    var t = el('div', { id: 'hf-tel-testa', role: 'toolbar' });
    t.appendChild(tondo('indietro', 'Torna a HyFile', indietro, 'hf-tel-indietro', 'solo-lettura'));
    t.appendChild(tondo('spunta', 'Fine', function () { leggi(); }, 'hf-tel-fine', 'solo-modifica'));
    var nome = el('button', { type: 'button', id: 'hf-tel-nome', class: 'solo-lettura' },
      '<span class="hf-tel-titolo"></span><span class="hf-stato" id="hf-stato"></span>');
    nome.querySelector('.hf-tel-titolo').textContent = I.senzaEstensione(G.titolo);
    nome.addEventListener('mousedown', senzaFuoco);
    nome.addEventListener('click', function () { if (puoRinominare()) rinomina(); });
    t.appendChild(nome);
    t.appendChild(el('div', { class: 'hf-tel-spinta solo-modifica' }));
    if (o.canViewComments || o.canComments) {
      t.appendChild(tondo('commenti', 'Commenti', function () { I.apriCommenti(); }, 'hf-bottone-commenti', 'solo-lettura'));
    }
    if (o.canRequestSharingSettings) {
      t.appendChild(tondo('personaPiu', 'Condividi', function () { Common.Gateway.requestSharingSettings(); }, 'hf-tel-condividi', 'solo-lettura'));
    }
    if (G.modifica) {
      t.appendChild(tondo('annulla', 'Annulla', function () { I.premi(tb().btnUndo); setTimeout(aggiornaAnnulla, 80); }, 'hf-tel-annulla', 'solo-modifica'));
      t.appendChild(tondo('ripeti', 'Ripeti', function () { I.premi(tb().btnRedo); setTimeout(aggiornaAnnulla, 80); }, 'hf-tel-ripeti', 'solo-modifica'));
      t.appendChild(tondo('formato', 'Formato', apriFormato, 'hf-tel-formato', 'solo-modifica'));
      t.appendChild(tondo('piu', 'Inserisci', apriInserisci, 'hf-tel-inserisci', 'solo-modifica'));
    }
    t.appendChild(tondo('altro', 'Altre opzioni', apriAltro, 'hf-tel-altro'));
    return t;
  }
  function puoRinominare() { return !!G.opz.canRename && G.modifica; }
  function indietro() { prova(function () { Common.NotificationCenter.trigger('goback'); }); }

  /** Annulla e ripeti accesi come quelli di ONLYOFFICE (parcheggiati, ma tenuti aggiornati
   *  da lui): nei fogli, per esempio, dentro una cella che si sta scrivendo si annulla anche
   *  se il documento non ha ancora niente da annullare. */
  function spento(b) { b = I.bottone(b); return !!(b && b.isDisabled && b.isDisabled()); }
  function aggiornaAnnulla() {
    var a = document.getElementById('hf-tel-annulla'), r = document.getElementById('hf-tel-ripeti');
    if (a) a.disabled = spento(tb().btnUndo);
    if (r) r.disabled = spento(tb().btnRedo);
  }

  /* ------------------------------------------------------------------ leggere e scrivere */
  // ONLYOFFICE riceve i tasti in un campo nascosto (#area_id) e gli dà il fuoco a ogni
  // tocco: sul telefono vorrebbe dire la tastiera a ogni tocco, anche solo per scorrere.
  // Da leggere il campo ha `inputmode="none"` (il fuoco sì, la tastiera no); per scrivere
  // lo si toglie e gli si ridà il fuoco, dentro il gesto, così la tastiera si apre.
  function campo() { return document.getElementById('area_id'); }
  function tastiera(si) {
    var a = campo();
    if (!a) return;
    if (si) a.removeAttribute('inputmode');
    else a.setAttribute('inputmode', 'none');
  }
  function scrivi() {
    if (!G.modifica) return;
    chiudiCerca();
    T.modo = 'modifica';
    corpo().classList.remove('hf-tel-lettura');
    corpo().classList.add('hf-tel-modifica');
    tastiera(true);
    var a = campo();
    if (a) { try { a.blur(); a.focus({ preventScroll: true }); } catch (e) { /* senza tastiera: si scrive col tocco dopo */ } }
    aggiornaAnnulla();
  }
  function leggi() {
    chiudiFoglio(true);
    T.modo = 'lettura';
    corpo().classList.remove('hf-tel-modifica');
    corpo().classList.add('hf-tel-lettura');
    // Nei fogli una cella a metà si chiude tenendo quello che si è scritto, come Invio.
    if (G.TIPO === 'cell') prova(function () { if (G.api.isCellEdited || document.querySelector('#ce-cell-content:focus-within')) G.api.asc_closeCellEditor(); });
    tastiera(false);
    var a = document.activeElement;
    if (a && a !== document.body && a.blur) a.blur();
  }
  /** La tastiera giù mentre è aperto un foglio (ONLYOFFICE riprende il fuoco dopo ogni
   *  comando: con `inputmode="none"` la tastiera non risale). */
  function giuTastiera() {
    tastiera(false);
    var a = document.activeElement;
    if (a && a !== document.body && a.blur) a.blur();
  }
  function suTastiera() {
    if (T.modo !== 'modifica') return;
    tastiera(true);
    var a = campo();
    if (a) { try { a.blur(); a.focus({ preventScroll: true }); } catch (e) { /* niente */ } }
  }

  function ascolta() {
    // Il doppio tocco sul documento, da leggere: si scrive lì (come nelle app).
    document.addEventListener('touchstart', function (e) {
      T.tocco = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY, mosso: false } : null;
    }, { capture: true, passive: true });
    document.addEventListener('touchmove', function (e) {
      if (!T.tocco || !e.touches.length) return;
      if (Math.abs(e.touches[0].clientX - T.tocco.x) + Math.abs(e.touches[0].clientY - T.tocco.y) > 12) T.tocco.mosso = true;
    }, { capture: true, passive: true });
    document.addEventListener('touchend', function (e) {
      var t = T.tocco;
      T.tocco = null;
      if (!t || t.mosso || !nelDocumento(e.target)) { if (t && t.mosso) T.ultimo = null; return; }
      var ora = Date.now(), u = T.ultimo;
      if (u && ora - u.t < 380 && Math.abs(u.x - t.x) + Math.abs(u.y - t.y) < 36) {
        T.ultimo = null;
        if (T.modo === 'lettura' && G.modifica && !T.foglio) scrivi();
      } else T.ultimo = { x: t.x, y: t.y, t: ora };
    }, { capture: true, passive: true });
    // Nei fogli la barra della formula è un campo vero: toccarla è già scrivere.
    document.addEventListener('focusin', function (e) {
      var x = e.target;
      if (x && x.closest && x.closest('#ce-cell-content') && T.modo === 'lettura' && G.modifica) {
        T.modo = 'modifica';
        corpo().classList.remove('hf-tel-lettura');
        corpo().classList.add('hf-tel-modifica');
        tastiera(true);
      }
      // Da leggere il campo nascosto non deve mai aprire la tastiera, anche se ONLYOFFICE
      // l'avesse rifatto.
      if (x && x.id === 'area_id' && (T.modo !== 'modifica' || T.foglio)) x.setAttribute('inputmode', 'none');
    }, true);
    // ONLYOFFICE accende e spegne i suoi bottoni quando vuole (anche entrando in una cella):
    // scrivendo, si guarda ogni poco.
    setInterval(function () { if (T.modo === 'modifica') prova(aggiornaAnnulla); }, 500);
    prova(function () {
      G.api.asc_registerCallback('asc_onCanUndo', function () { setTimeout(aggiornaAnnulla, 0); });
      G.api.asc_registerCallback('asc_onCanRedo', function () { setTimeout(aggiornaAnnulla, 0); });
      if (G.TIPO === 'word') G.api.asc_registerCallback('asc_onParaStyleName', function (n) { T.stile = n || ''; });
      if (G.TIPO === 'slide') {
        G.api.asc_registerCallback('asc_onCurrentPage', function () { aggiornaDiapositive(); });
        G.api.asc_registerCallback('asc_onCountPages', function () { aggiornaDiapositive(); });
      }
    });
    // Il tasto «indietro» della tastiera del telefono (Esc su una tastiera vera) chiude
    // prima il foglio aperto, poi la ricerca.
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (T.foglio) { e.preventDefault(); e.stopPropagation(); chiudiFoglio(); }
      else if (T.cerca) { e.preventDefault(); e.stopPropagation(); chiudiCerca(); }
    }, true);
  }
  function nelDocumento(x) {
    return !!(x && x.closest && x.closest('#editor_sdk, #id_main, #ws-canvas-outer, #id_main_view') && !x.closest('#hf-tel-testa, .hf-tel-foglio'));
  }

  /* ------------------------------------------------------------------ i fogli dal basso */
  // Un foglio: maniglia, titolo (o schede: Testo · Paragrafo), voci grandi. Le voci che
  // portano altrove aprono una pagina dentro lo stesso foglio, con la freccia per tornare.
  function apriFoglio(o) {
    chiudiFoglio(true);
    giuTastiera();
    var velo = el('div', { class: 'hf-tel-velo' });
    var f = el('div', { class: 'hf-tel-foglio', role: 'dialog', 'aria-modal': 'true', 'aria-label': o.titolo || '' });
    var maniglia = el('div', { class: 'hf-tel-maniglia', 'aria-hidden': 'true' });
    var testaF = el('div', { class: 'hf-tel-foglio-testa' });
    var dentro = el('div', { class: 'hf-tel-corpo' });
    f.appendChild(maniglia);
    f.appendChild(testaF);
    f.appendChild(dentro);
    velo.addEventListener('mousedown', senzaFuoco);
    velo.addEventListener('click', function () { chiudiFoglio(); });
    f.addEventListener('mousedown', function (e) { if (!e.target.closest('input, textarea')) e.preventDefault(); });
    tiraGiu(f, maniglia, testaF);
    corpo().appendChild(velo);
    corpo().appendChild(f);
    T.foglio = { velo: velo, f: f, testa: testaF, corpo: dentro, o: o, scheda: 0, pila: [] };
    corpo().classList.add('hf-tel-con-foglio');
    disegna();
    requestAnimationFrame(function () { velo.classList.add('su'); f.classList.add('su'); });
  }
  function chiudiFoglio(senzaTastiera) {
    var x = T.foglio;
    if (!x) return;
    T.foglio = null;
    corpo().classList.remove('hf-tel-con-foglio');
    x.velo.remove();
    x.f.remove();
    I.chiudiMenuOO && I.chiudiMenuOO();
    if (!senzaTastiera) suTastiera();
  }
  /** Il foglio si chiude anche tirandolo giù dalla maniglia (come nelle app). */
  function tiraGiu(f, maniglia, testaF) {
    var y0 = null, dy = 0;
    function giu(e) { if (e.touches.length === 1) { y0 = e.touches[0].clientY; dy = 0; f.style.transition = 'none'; } }
    function muovi(e) {
      if (y0 === null) return;
      dy = Math.max(0, e.touches[0].clientY - y0);
      f.style.transform = 'translateY(' + dy + 'px)';
    }
    function su() {
      if (y0 === null) return;
      y0 = null;
      f.style.transition = '';
      f.style.transform = '';
      if (dy > 70) chiudiFoglio();
    }
    [maniglia, testaF].forEach(function (x) {
      x.addEventListener('touchstart', giu, { passive: true });
      x.addEventListener('touchmove', muovi, { passive: true });
      x.addEventListener('touchend', su, { passive: true });
    });
  }
  /** Ridisegna il foglio aperto: dopo un comando i tasti accesi seguono ONLYOFFICE. */
  function disegna() {
    var x = T.foglio;
    if (!x) return;
    var o = x.o, pag = x.pila[x.pila.length - 1];
    var scroll = x.corpo.scrollTop;
    x.testa.innerHTML = '';
    x.corpo.innerHTML = '';
    if (pag) {
      var torna = tondo('indietro', 'Indietro', function () { x.pila.pop(); disegna(); });
      x.testa.appendChild(torna);
      x.testa.appendChild(el('div', { class: 'hf-tel-foglio-titolo' }, esc(pag.titolo)));
      prova(function () { pag.disegna(x.corpo); });
      return;
    }
    if (o.schede && o.schede.length > 1) {
      var schede = el('div', { class: 'hf-tel-schede', role: 'tablist' });
      o.schede.forEach(function (s, i) {
        var b = el('button', { type: 'button', role: 'tab', class: 'hf-tel-scheda' + (i === x.scheda ? ' scelta' : ''), 'aria-selected': i === x.scheda ? 'true' : 'false' });
        b.textContent = s.t;
        b.addEventListener('click', function () { x.scheda = i; disegna(); });
        schede.appendChild(b);
      });
      x.testa.appendChild(schede);
    } else {
      x.testa.appendChild(el('div', { class: 'hf-tel-foglio-titolo' }, esc(o.titolo || '')));
    }
    var s = o.schede ? o.schede[x.scheda] : o;
    prova(function () { s.disegna(x.corpo); });
    x.corpo.scrollTop = scroll;
  }
  function rifai() { setTimeout(disegna, 60); }
  function pagina(titoloP, disegnaP) {
    if (!T.foglio) return;
    T.foglio.pila.push({ titolo: titoloP, disegna: disegnaP });
    T.foglio.corpo.scrollTop = 0;
    disegna();
  }

  /** Una voce del foglio: icona, testo, a destra il valore o la freccia o la spunta. */
  function riga(box, o) {
    if (o.se === false) return null;
    var r = el('button', { type: 'button', class: 'hf-tel-riga' + (o.spenta ? ' spenta' : '') });
    r.innerHTML = '<span class="hf-tel-ico">' + (o.colore !== undefined ? '<span class="hf-tel-pallino" style="background:' + esc(o.colore || 'transparent') + '"></span>' : o.ico ? svg(o.ico) : '') + '</span>' +
      '<span class="hf-tel-testo"></span>' +
      (o.valore ? '<span class="hf-tel-valore"></span>' : '') +
      (o.on ? svg('spunta', 'hf-tel-spunta') : '') +
      (o.sub ? svg('destra', 'hf-tel-freccia') : '');
    r.querySelector('.hf-tel-testo').textContent = o.t;
    if (o.valore) r.querySelector('.hf-tel-valore').textContent = o.valore;
    if (o.stile) r.querySelector('.hf-tel-testo').setAttribute('style', o.stile);
    r.addEventListener('mousedown', senzaFuoco);
    r.addEventListener('click', function () { if (!o.spenta) prova(o.f); });
    box.appendChild(r);
    return r;
  }
  /** Una fila di tasti (B I U S, gli allineamenti): accesi come in ONLYOFFICE. */
  function tasti(box, voci) {
    var g = el('div', { class: 'hf-tel-tasti', role: 'group' });
    voci.forEach(function (v) {
      if (!v || v.se === false) return;
      var b = el('button', { type: 'button', class: 'hf-tel-tasto' + (v.on ? ' acceso' : ''), 'aria-label': v.t, 'aria-pressed': v.on ? 'true' : 'false' }, svg(v.ico));
      b.addEventListener('mousedown', senzaFuoco);
      b.addEventListener('click', function () { prova(v.f); rifai(); });
      g.appendChild(b);
    });
    if (g.children.length) box.appendChild(g);
  }
  /** «Dimensione − 11 +». */
  function passo(box, t, valore, meno, piu) {
    var r = el('div', { class: 'hf-tel-riga hf-tel-passo' });
    r.innerHTML = '<span class="hf-tel-ico"></span><span class="hf-tel-testo"></span>';
    r.querySelector('.hf-tel-testo').textContent = t;
    var m = el('button', { type: 'button', class: 'hf-tel-tasto', 'aria-label': 'Riduci' }, '<span>−</span>');
    var v = el('span', { class: 'hf-tel-valore' });
    v.textContent = valore;
    var p = el('button', { type: 'button', class: 'hf-tel-tasto', 'aria-label': 'Aumenta' }, '<span>+</span>');
    [m, p].forEach(function (b) { b.addEventListener('mousedown', senzaFuoco); });
    m.addEventListener('click', function () { prova(meno); rifai(); });
    p.addEventListener('click', function () { prova(piu); rifai(); });
    r.appendChild(m); r.appendChild(v); r.appendChild(p);
    box.appendChild(r);
  }
  // I colori della griglia degli editor web: grigi, poi i colori pieni.
  var COLORI = ['#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
    '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0'];
  function colori(box, scegliColore, nessuno) {
    if (nessuno) riga(box, { t: nessuno, ico: 'gomma', f: function () { scegliColore(null); chiudiFoglio(); } });
    var g = el('div', { class: 'hf-tel-colori' });
    COLORI.forEach(function (col) {
      var b = el('button', { type: 'button', class: 'hf-tel-colore', 'aria-label': col, style: 'background:' + col });
      b.addEventListener('mousedown', senzaFuoco);
      b.addEventListener('click', function () { scegliColore(col); chiudiFoglio(); });
      g.appendChild(b);
    });
    box.appendChild(g);
  }
  function rgb(col) { return prova(function () { return Common.Utils.ThemeColor.getRgbColor(col.replace('#', '').toUpperCase()); }); }

  /* ------------------------------------------------------------------ formato (A) */
  var STILI = [
    ['Normal', 'Testo normale', 'font-size:15px'],
    ['Title', 'Titolo', 'font-size:24px'],
    ['Subtitle', 'Sottotitolo', 'font-size:17px;color:#5f6368'],
    ['Heading 1', 'Titolo 1', 'font-size:21px'],
    ['Heading 2', 'Titolo 2', 'font-size:18px;font-weight:700'],
    ['Heading 3', 'Titolo 3', 'font-size:16px;font-weight:700;color:#434343'],
  ];
  var FREQUENTI = ['Arial', 'Calibri', 'Cambria', 'Georgia', 'Times New Roman', 'Verdana', 'Courier New', 'Carlito', 'Comic Sans MS'];
  function caratteri() {
    return prova(function () { return tb().cmbFontName.store.models.map(function (m) { return m.get('name'); }); }, []) || [];
  }
  function carattereAdesso() { return prova(function () { return tb().cmbFontName.getValue(); }, '') || ''; }
  function dimensioneAdesso() { return prova(function () { return tb().cmbFontSize.getValue(); }, '') || ''; }
  function metticarattere(nome) {
    if (G.TIPO === 'cell') G.api.asc_setCellFontName(nome);
    else G.api.put_TextPrFontName(nome);
  }
  function pezziTesto(box) {
    tasti(box, [
      { t: 'Grassetto', ico: 'grassetto', on: premuto(tb().btnBold), f: function () { I.premi(tb().btnBold); } },
      { t: 'Corsivo', ico: 'corsivo', on: premuto(tb().btnItalic), f: function () { I.premi(tb().btnItalic); } },
      { t: 'Sottolineato', ico: 'sottolineato', on: premuto(tb().btnUnderline), f: function () { I.premi(tb().btnUnderline); } },
      { t: 'Barrato', ico: 'barrato', on: premuto(tb().btnStrikeout), f: function () { I.premi(tb().btnStrikeout); } },
    ]);
    if (G.TIPO === 'word') {
      var nomeStile = (STILI.filter(function (s) { return s[0] === T.stile; })[0] || [])[1] || T.stile || 'Testo normale';
      riga(box, { t: 'Stile', valore: nomeStile, sub: true, f: function () {
        pagina('Stile', function (b) {
          STILI.forEach(function (s) {
            riga(b, { t: s[1], stile: s[2], on: s[0] === (T.stile || 'Normal'), f: function () { G.api.put_Style(s[0]); T.stile = s[0]; chiudiFoglio(); } });
          });
        });
      } });
    }
    riga(box, { t: 'Carattere', valore: carattereAdesso(), sub: true, f: function () {
      pagina('Carattere', function (b) {
        var tutti = caratteri(), adesso = carattereAdesso();
        var primi = FREQUENTI.filter(function (n) { return tutti.indexOf(n) >= 0; });
        primi.concat(['-']).concat(tutti.filter(function (n) { return primi.indexOf(n) < 0; })).forEach(function (n) {
          if (n === '-') { b.appendChild(el('div', { class: 'hf-tel-linea' })); return; }
          riga(b, { t: n, on: n === adesso, stile: 'font-family:"' + n.replace(/"/g, '') + '",sans-serif', f: function () { metticarattere(n); chiudiFoglio(); } });
        });
      });
    } });
    passo(box, 'Dimensione', String(dimensioneAdesso() || '-'),
      function () { I.premi(tb().btnDecFontSize); }, function () { I.premi(tb().btnIncFontSize); });
    riga(box, { t: 'Colore del testo', ico: 'formato', sub: true, f: function () {
      pagina('Colore del testo', function (b) {
        colori(b, function (col) {
          var x = rgb(col || '#000000');
          if (G.TIPO === 'cell') G.api.asc_setCellTextColor(x); else G.api.put_TextColor(x);
        });
      });
    } });
    if (G.TIPO !== 'cell' && G.api.SetMarkerFormat) {
      riga(box, { t: 'Evidenziazione', ico: 'matita', sub: true, f: function () {
        pagina('Evidenziazione', function (b) {
          colori(b, function (col) {
            if (!col) { G.api.SetMarkerFormat(true, false); return; }
            var n = parseInt(col.slice(1), 16);
            G.api.SetMarkerFormat(true, true, (n >> 16) & 255, (n >> 8) & 255, n & 255);
          }, 'Nessuna evidenziazione');
        });
      } });
    }
  }
  function allineamenti(box) {
    if (G.TIPO === 'slide') {
      var h = tb().btnHorizontalAlign;
      var on = function (v) { return !!prova(function () { var x = I.voceDi(h, v); return x && x.checked; }); };
      tasti(box, [
        { t: 'A sinistra', ico: 'sinistra', on: on(1), f: function () { I.scegli(h, 1); } },
        { t: 'Al centro', ico: 'centro', on: on(2), f: function () { I.scegli(h, 2); } },
        { t: 'A destra', ico: 'adestra', on: on(0), f: function () { I.scegli(h, 0); } },
        { t: 'Giustificato', ico: 'giustifica', on: on(3), f: function () { I.scegli(h, 3); } },
      ]);
      return;
    }
    tasti(box, [
      { t: 'A sinistra', ico: 'sinistra', on: premuto(tb().btnAlignLeft), f: function () { I.premi(tb().btnAlignLeft); } },
      { t: 'Al centro', ico: 'centro', on: premuto(tb().btnAlignCenter), f: function () { I.premi(tb().btnAlignCenter); } },
      { t: 'A destra', ico: 'adestra', on: premuto(tb().btnAlignRight), f: function () { I.premi(tb().btnAlignRight); } },
      { t: 'Giustificato', ico: 'giustifica', on: premuto(tb().btnAlignJust), f: function () { I.premi(tb().btnAlignJust); } },
    ]);
  }
  function pezziParagrafo(box) {
    allineamenti(box);
    tasti(box, [
      { t: 'Riduci rientro', ico: 'rientraMeno', f: function () { I.premi(tb().btnDecLeftOffset); } },
      { t: 'Aumenta rientro', ico: 'rientraPiu', f: function () { I.premi(tb().btnIncLeftOffset); } },
      { t: 'Elenco puntato', ico: 'elenco', on: premuto(tb().btnMarkers), f: function () { I.premi(tb().btnMarkers); } },
      { t: 'Elenco numerato', ico: 'numerato', on: premuto(tb().btnNumbers), f: function () { I.premi(tb().btnNumbers); } },
    ]);
    var ls = tb().btnLineSpace;
    if (I.bottone(ls) && I.bottone(ls).menu) {
      var scelta = prova(function () { return I.bottone(ls).menu.items.filter(function (i) { return i.checked && typeof i.value === 'number'; })[0]; });
      riga(box, { t: 'Interlinea', valore: scelta ? String(scelta.value).replace('.', ',') : '', sub: true, f: function () {
        pagina('Interlinea', function (b) {
          [1, 1.15, 1.5, 2].forEach(function (v) {
            riga(b, { t: String(v).replace('.', ','), on: !!(scelta && scelta.value === v), f: function () { I.scegli(ls, v); chiudiFoglio(); } });
          });
        });
      } });
    }
    riga(box, { t: 'Cancella formattazione', ico: 'gomma', f: function () { I.premi(tb().btnClearStyle); rifai(); } });
  }
  function pezziCella(box) {
    tasti(box, [
      { t: 'A sinistra', ico: 'sinistra', on: premuto(tb().btnAlignLeft), f: function () { I.premi(tb().btnAlignLeft); } },
      { t: 'Al centro', ico: 'centro', on: premuto(tb().btnAlignCenter), f: function () { I.premi(tb().btnAlignCenter); } },
      { t: 'A destra', ico: 'adestra', on: premuto(tb().btnAlignRight), f: function () { I.premi(tb().btnAlignRight); } },
    ]);
    tasti(box, [
      { t: 'In alto', ico: 'inAlto', on: premuto(tb().btnAlignTop), f: function () { I.premi(tb().btnAlignTop); } },
      { t: 'Al centro (verticale)', ico: 'verticale', on: premuto(tb().btnAlignMiddle), f: function () { I.premi(tb().btnAlignMiddle); } },
      { t: 'In basso', ico: 'inBasso', on: premuto(tb().btnAlignBottom), f: function () { I.premi(tb().btnAlignBottom); } },
    ]);
    riga(box, { t: 'A capo automatico', ico: 'acapo', on: premuto(tb().btnWrap), f: function () { I.premi(tb().btnWrap); rifai(); } });
    riga(box, { t: 'Unisci celle', ico: 'unisci', on: premuto(tb().btnMerge), f: function () { I.premi(tb().btnMerge); rifai(); } });
    riga(box, { t: 'Colore di riempimento', ico: 'tabella', sub: true, f: function () {
      pagina('Colore di riempimento', function (b) {
        colori(b, function (col) { G.api.asc_setCellBackgroundColor(col ? rgb(col) : null); }, 'Nessun colore');
      });
    } });
    riga(box, { t: 'Cancella formattazione', ico: 'gomma', f: function () { I.scegli(tb().btnClearStyle, 2); rifai(); } });
  }
  function pezziNumero(box) {
    var formati = prova(function () { return tb().cmbNumberFormat.store.models; }, []) || [];
    var adesso = prova(function () { return tb().cmbNumberFormat.getValue(); });
    var voluti = { 0: 'Automatico', 1: 'Numero', 4: 'Valuta', 5: 'Data', 7: 'Ora', 8: 'Percentuale', 10: 'Testo' };
    var visti = {};
    formati.forEach(function (m) {
      var v = m.get('value'), fmt = m.get('format');
      if (!(v in voluti) || visti[v] || !fmt) return;
      visti[v] = true;
      riga(box, { t: voluti[v], valore: m.get('exampleval') || '', on: adesso === v, f: function () { G.api.asc_setCellFormat(fmt); rifai(); } });
    });
    box.appendChild(el('div', { class: 'hf-tel-linea' }));
    tasti(box, [
      { t: 'Euro', ico: 'euro', f: function () { if (!I.scegli(tb().btnCurrencyStyle, 1031)) I.premi(tb().btnCurrencyStyle); } },
      { t: 'Percentuale', ico: 'percento', f: function () { I.premi(tb().btnPercentStyle); } },
    ]);
    riga(box, { t: 'Aumenta i decimali', f: function () { I.premi(tb().btnIncDecimal); } });
    riga(box, { t: 'Riduci i decimali', f: function () { I.premi(tb().btnDecDecimal); } });
    riga(box, { t: 'Separatore delle migliaia', f: function () { I.premi(tb().btnCommaStyle); } });
  }
  function apriFormato() {
    var schede = G.TIPO === 'cell'
      ? [{ t: 'Testo', disegna: pezziTesto }, { t: 'Cella', disegna: pezziCella }, { t: 'Numero', disegna: pezziNumero }]
      : [{ t: 'Testo', disegna: pezziTesto }, { t: 'Paragrafo', disegna: pezziParagrafo }];
    apriFoglio({ titolo: 'Formato', schede: schede });
  }

  /* ------------------------------------------------------------------ inserisci (+) */
  function immagine() {
    var hf = prova(function () { return c('HeaderFooterTab').view || c('HeaderFooterTab').getView('HeaderFooterTab'); });
    var b = (hf && hf.btnsInsImage) || tb().btnsInsertImage || tb().btnInsertImage;
    chiudiFoglio(true);
    // La scelta del file (galleria o fotocamera sul telefono) dentro il gesto del tocco.
    I.scegli(b, 'file');
  }
  function link() {
    chiudiFoglio(true);
    if (G.TIPO === 'word') {
      var l = prova(function () { return c('Links').view; });
      if (l && l.btnsHyperlink && I.premi(l.btnsHyperlink)) return;
      prova(function () { tb().fireEvent('insert:hyperlink'); });
      return;
    }
    I.premi(tb().btnInsertHyperlink);
  }
  function commento() { chiudiFoglio(true); I.aggiungiCommento(); }
  function apriInserisci() {
    apriFoglio({ titolo: 'Inserisci', disegna: function (box) {
      var o = G.opz;
      if (G.TIPO === 'word') {
        riga(box, { t: 'Immagine', ico: 'immagine', f: immagine });
        riga(box, { t: 'Tabella', ico: 'tabella', f: function () { G.api.put_Table(3, 3); chiudiFoglio(); } });
        riga(box, { t: 'Link', ico: 'link', f: link });
        riga(box, { t: 'Commento', ico: 'commento', se: !!o.canComments, f: commento });
        riga(box, { t: 'Interruzione di pagina', ico: 'interruzione', f: function () { G.api.put_AddPageBreak(); chiudiFoglio(); } });
        riga(box, { t: 'Linea orizzontale', ico: 'linea', se: !!I.voceDi(tb().btnBorders, 'horizontal-line'), f: function () { I.scegli(tb().btnBorders, 'horizontal-line'); chiudiFoglio(); } });
      } else if (G.TIPO === 'cell') {
        riga(box, { t: 'Riga sopra', ico: 'riga', f: function () { I.scegli(tb().btnAddCell, 4); chiudiFoglio(); } });
        riga(box, { t: 'Colonna a sinistra', ico: 'riga', f: function () { I.scegli(tb().btnAddCell, 3); chiudiFoglio(); } });
        riga(box, { t: 'Foglio', ico: 'foglio', f: function () { I.premi(c('Statusbar').statusbar.btnAddWorksheet); chiudiFoglio(); } });
        riga(box, { t: 'Somma', ico: 'somma', se: !!tb().btnsFormula, f: function () { I.premi(tb().btnsFormula); chiudiFoglio(); } });
        riga(box, { t: 'Immagine', ico: 'immagine', f: immagine });
        riga(box, { t: 'Link', ico: 'link', f: link });
        riga(box, { t: 'Commento', ico: 'commento', se: !!o.canComments, f: commento });
        box.appendChild(el('div', { class: 'hf-tel-linea' }));
        riga(box, { t: 'Elimina la riga', ico: 'cestino', f: function () { I.scegli(tb().btnDeleteCell, 4); chiudiFoglio(); } });
        riga(box, { t: 'Elimina la colonna', ico: 'cestino', f: function () { I.scegli(tb().btnDeleteCell, 3); chiudiFoglio(); } });
      } else {
        riga(box, { t: 'Nuova diapositiva', ico: 'diapositiva', f: function () { I.premi(tb().btnAddSlide); chiudiFoglio(); } });
        riga(box, { t: 'Duplica la diapositiva', ico: 'copia', f: function () { if (!I.scegli(tb().btnAddSlide, 'duplicate')) G.api.DublicateSlide(); chiudiFoglio(); } });
        riga(box, { t: 'Casella di testo', ico: 'testo', f: function () { I.premi(tb().btnsInsertText); chiudiFoglio(); } });
        riga(box, { t: 'Immagine', ico: 'immagine', f: immagine });
        riga(box, { t: 'Link', ico: 'link', f: link });
        riga(box, { t: 'Commento', ico: 'commento', se: !!o.canComments, f: commento });
        box.appendChild(el('div', { class: 'hf-tel-linea' }));
        riga(box, { t: 'Elimina la diapositiva', ico: 'cestino', f: function () { G.api.DeleteSlide(); chiudiFoglio(); } });
      }
    } });
  }

  /* ------------------------------------------------------------------ altro (⋮) */
  var SCARICA = {
    word: [['Documento di Word (.docx)', 'DOCX'], ['PDF (.pdf)', 'PDF'], ['OpenDocument (.odt)', 'ODT'], ['Testo normale (.txt)', 'TXT']],
    cell: [['Excel (.xlsx)', 'XLSX'], ['PDF (.pdf)', 'PDF'], ['Valori separati da virgola (.csv)', 'CSV'], ['OpenDocument (.ods)', 'ODS']],
    slide: [['PowerPoint (.pptx)', 'PPTX'], ['PDF (.pdf)', 'PDF'], ['OpenDocument (.odp)', 'ODP']],
  };
  function apriAltro() {
    var o = G.opz;
    apriFoglio({ titolo: '', disegna: function (box) {
      riga(box, { t: G.TIPO === 'cell' ? 'Cerca nel foglio' : G.TIPO === 'slide' ? 'Cerca nella presentazione' : 'Cerca nel documento', ico: 'cerca', f: apriCerca });
      if (G.modifica && T.modo === 'lettura') riga(box, { t: 'Modifica', ico: 'matita', f: function () { chiudiFoglio(true); scrivi(); } });
      if (T.modo === 'modifica' && (o.canViewComments || o.canComments)) riga(box, { t: 'Commenti', ico: 'commenti', f: function () { chiudiFoglio(true); leggi(); I.apriCommenti(); } });
      riga(box, { t: 'Aggiungi un commento', ico: 'commento', se: !!o.canComments && T.modo === 'lettura', f: commento });
      if (G.TIPO === 'slide') riga(box, { t: 'Avvia la presentazione', ico: 'presenta', f: function () { chiudiFoglio(true); if (!I.scegli(tb().btnPreview, 0)) I.premi(tb().btnPreview); } });
      box.appendChild(el('div', { class: 'hf-tel-linea' }));
      riga(box, { t: 'Condividi', ico: 'personaPiu', se: !!o.canRequestSharingSettings, f: function () { chiudiFoglio(true); Common.Gateway.requestSharingSettings(); } });
      riga(box, { t: 'Copia il link', ico: 'link', se: !!o.canRequestSharingSettings, f: function () { chiudiFoglio(true); I.manda({ tipo: 'copia-link' }); } });
      riga(box, { t: 'Scarica', ico: 'scarica', sub: true, se: o.canDownload !== false, f: function () {
        pagina('Scarica', function (b) {
          (SCARICA[G.TIPO] || []).forEach(function (s) {
            riga(b, { t: s[0], f: function () { chiudiFoglio(true); I.scarica(s[1])(); } });
          });
        });
      } });
      // «Salva una copia in HyFile» (1.56.0, SPEC §19.12): tutti i formati del computer, il
      // PDF in cima. La finestra per scegliere dove la apre HyFile, sopra l'editor.
      riga(box, { t: 'Salva una copia in HyFile', ico: 'copiaInHyfile', sub: true, se: !!o.canRequestSaveAs && o.canDownload !== false, f: function () {
        pagina('Salva una copia in HyFile', function (b) {
          I.formatiDellaCopia(G.TIPO).forEach(function (s) {
            riga(b, { t: s[0], f: function () { chiudiFoglio(true); I.salvaCopia(s[1])(); } });
          });
        });
      } });
      riga(box, { t: 'Rinomina', ico: 'matita2', se: puoRinominare(), f: rinomina });
      if (G.TIPO === 'word') riga(box, { t: 'Conteggio parole', ico: 'testo', f: function () { chiudiFoglio(true); I.conteggioParole(); } });
      box.appendChild(el('div', { class: 'hf-tel-linea' }));
      if (G.TIPO !== 'cell') riga(box, { t: G.TIPO === 'word' ? 'Adatta alla larghezza' : 'Adatta la diapositiva', ico: 'adatta', f: function () {
        chiudiFoglio(true);
        if (G.TIPO === 'word') G.api.zoomFitToWidth(); else G.api.zoomFitToPage();
      } });
      riga(box, { t: 'Versione per computer', ico: 'computer', f: function () {
        try { localStorage.setItem('hf-pelle-computer', '1'); } catch (e) { return; }
        chiudiFoglio(true);
        I.riprova();
      } });
      riga(box, { t: 'Informazioni legali', ico: 'legge', f: function () { chiudiFoglio(true); I.legale(); } });
      riga(box, { t: 'Torna a HyFile', ico: 'cartella', f: function () { chiudiFoglio(true); indietro(); } });
    } });
  }

  /** Il nome, in un foglio con la tastiera (il campo prende il fuoco dentro il tocco). */
  function rinomina() {
    apriFoglio({ titolo: 'Rinomina', disegna: function (box) {
      var campoN = el('input', { type: 'text', class: 'hf-tel-campo', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Nome del documento', enterkeyhint: 'done' });
      campoN.value = I.senzaEstensione(G.titolo);
      var fai = function () {
        var nuovo = campoN.value.replace(/\s+/g, ' ').trim();
        chiudiFoglio(true);
        if (nuovo && nuovo !== I.senzaEstensione(G.titolo)) prova(function () { Common.Gateway.requestRename(nuovo); });
      };
      ['keydown', 'keyup', 'keypress'].forEach(function (k) { campoN.addEventListener(k, function (e) { e.stopPropagation(); if (k === 'keydown' && e.key === 'Enter') { e.preventDefault(); fai(); } }); });
      box.appendChild(campoN);
      var fine = el('div', { class: 'hf-tel-fine' });
      var no = el('button', { type: 'button', class: 'hf-tel-testuale' }, 'Annulla');
      var si = el('button', { type: 'button', class: 'hf-tel-pieno' }, 'Rinomina');
      no.addEventListener('click', function () { chiudiFoglio(); });
      si.addEventListener('click', fai);
      fine.appendChild(no); fine.appendChild(si);
      box.appendChild(fine);
    } });
    var x = T.foglio && T.foglio.corpo.querySelector('input');
    if (x) { x.focus(); x.select(); }
  }

  /* ------------------------------------------------------------------ cerca */
  // La barra in alto diventa la ricerca, come nelle app. Cerca il controllore di
  // ONLYOFFICE (`Search`), lo stesso del pannello per computer: per i tre editor.
  function cercatore() { return c('Search'); }
  function apriCerca() {
    chiudiFoglio(true);
    if (T.cerca) { T.cerca.campo.focus(); return; }
    var b = el('div', { id: 'hf-tel-cerca', role: 'search' });
    var chiudi = tondo('indietro', 'Chiudi la ricerca', function () { chiudiCerca(); });
    var campoC = el('input', { type: 'search', class: 'hf-tel-cerca-campo', placeholder: 'Cerca', 'aria-label': 'Cerca', enterkeyhint: 'search', autocomplete: 'off', spellcheck: 'false' });
    var conto = el('span', { class: 'hf-tel-conto', 'aria-live': 'polite' });
    var su = tondo('su', 'Risultato precedente', function () { vai('back'); });
    var giu = tondo('giu2', 'Risultato successivo', function () { vai('next'); });
    function vai(verso) { var t = campoC.value.trim(); if (t) prova(function () { cercatore().onSearchNext(verso, t); }); }
    campoC.addEventListener('input', function () {
      var t = campoC.value;
      if (!t.trim()) conto.textContent = '';
      prova(function () { cercatore().onInputSearchChange(t); });
    });
    ['keydown', 'keyup', 'keypress'].forEach(function (k) {
      campoC.addEventListener(k, function (e) {
        e.stopPropagation();
        if (k === 'keydown' && e.key === 'Enter') { e.preventDefault(); vai('next'); }
        if (k === 'keydown' && e.key === 'Escape') { e.preventDefault(); chiudiCerca(); }
      });
    });
    [chiudi, campoC, conto, su, giu].forEach(function (x) { b.appendChild(x); });
    document.getElementById('hf-tel-testa').appendChild(b);
    corpo().classList.add('hf-tel-cercando');
    T.cerca = { b: b, campo: campoC, conto: conto };
    evidenzia(true);
    campoC.focus();
  }
  function aggiornaConto(attuale, tutti) {
    if (!T.cerca) return;
    var t = T.cerca.campo.value.trim();
    T.cerca.conto.textContent = !t ? '' : tutti ? (attuale + 1) + ' di ' + tutti : 'Nessuno';
  }
  function chiudiCerca() {
    if (!T.cerca) return;
    var x = T.cerca;
    T.cerca = null;
    x.b.remove();
    corpo().classList.remove('hf-tel-cercando');
    prova(function () { cercatore().onInputSearchChange(''); });
    evidenzia(false);
    // Nei fogli la ricerca finisce col controllore (lì `asc_endFindText` si rompe).
    if (G.TIPO !== 'cell') prova(function () { G.api.asc_endFindText(); });
  }
  /** Tutti i risultati evidenziati mentre si cerca (documenti e fogli: il controllore delle
   *  presentazioni non lo fa, lì resta il risultato scelto). */
  function evidenzia(si) {
    var S = cercatore();
    if (S && typeof S.onSelectSearchingResults === 'function') prova(function () { S.onSelectSearchingResults(si); });
  }

  /* ------------------------------------------------------------------ fogli e diapositive */
  /** Presentazioni: la diapositiva da sola, a tutta larghezza. Le miniature e le note le
   *  rimette ONLYOFFICE quando il documento è pronto: si tolgono anche lì (`documento`).
   *  Niente si scrive nelle preferenze: col computer restano com'erano. */
  function senzaMiniature() {
    var lm = prova(function () { return c('LeftMenu').leftMenu; });
    if (lm && lm.btnThumbs && lm.btnThumbs.pressed) lm.btnThumbs.toggle(false);
    prova(function () { G.api.ShowThumbnails(false); });
    prova(function () { G.api.asc_ShowNotes(false); });
  }
  /** Nei fogli la barra della formula, più alta per il dito: la sua altezza la prende
   *  ONLYOFFICE dal campo stesso (telefono.css, 40 px); qui gli si dice di rifare i conti. */
  function barraDellaFormula() {
    var vp = G.APP.getController('Viewport');
    var v = vp.viewport || vp.getView('Viewport');
    if (v.celayout) v.celayout.doLayout();
    Common.NotificationCenter.trigger('layout:changed', 'celleditor');
  }
  function barraDiapositive() {
    var b = el('div', { id: 'hf-tel-diapo', role: 'group', 'aria-label': 'Diapositive' });
    var prima = tondo('prima', 'Diapositiva precedente', function () { vaiA(-1); });
    var conto = el('span', { class: 'hf-tel-diapo-conto' });
    var dopo = tondo('dopo', 'Diapositiva successiva', function () { vaiA(1); });
    var nuova = tondo('piu', 'Nuova diapositiva', function () { I.premi(tb().btnAddSlide); }, 'hf-tel-nuova-diapo', 'solo-modifica');
    [prima, conto, dopo].forEach(function (x) { b.appendChild(x); });
    if (G.modifica) b.appendChild(nuova);
    return b;
  }
  function vaiA(d) {
    prova(function () {
      var n = G.api.getCurrentPage() + d, tot = G.api.getCountPages();
      if (n >= 0 && n < tot) G.api.goToPage(n);
    });
  }
  function aggiornaDiapositive() {
    var conto = document.querySelector('#hf-tel-diapo .hf-tel-diapo-conto');
    if (!conto) return;
    var n = prova(function () { return G.api.getCurrentPage(); }, 0), tot = prova(function () { return G.api.getCountPages(); }, 0);
    conto.textContent = tot ? (n + 1) + ' di ' + tot : '';
  }

  window.pelleTelefono = {
    avvia: avvia,
    documento: documento,
    titolo: titolo,
    aggiornaConto: aggiornaConto,
    // Per la prova su aurora: in che modo è, e i comandi che i fogli userebbero.
    get modo() { return T.modo; },
    scrivi: function () { scrivi(); },
    leggi: function () { leggi(); },
    formato: function () { apriFormato(); },
    inserisci: function () { apriInserisci(); },
    altro: function () { apriAltro(); },
    cerca: function () { apriCerca(); },
    chiudi: function () { chiudiFoglio(true); chiudiCerca(); },
  };
  // I risultati della ricerca, per la barra in alto.
  var giri = 0;
  (function aggancia() {
    if (window.Common && Common.NotificationCenter) {
      Common.NotificationCenter.on('search:updateresults', function (a, t) { aggiornaConto(a, t); });
      return;
    }
    if (giri++ < 400) setTimeout(aggancia, 50);
  })();
})();
