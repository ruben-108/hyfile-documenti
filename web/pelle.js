/*
 * La pelle di HyFile sopra ONLYOFFICE Docs (HyFile, SPEC §19.5).
 * Copyright (C) 2026 Ruben Leo.
 *
 * Questo programma è software libero: puoi ridistribuirlo e/o modificarlo secondo i
 * termini della GNU Affero General Public License versione 3, come pubblicata dalla
 * Free Software Foundation. È distribuito senza alcuna garanzia. Il testo della licenza
 * sta nel file LICENSE accanto a questo, e su https://www.gnu.org/licenses/agpl-3.0.html.
 * Poggia su ONLYOFFICE Docs (Ascensio System SIA, AGPL v3), che non è stato modificato:
 * la pelle si aggiunge alle sue pagine (vedi innesta.sh) e ne usa i comandi.
 *
 * Cosa fa. Ridisegna i tre editor (documenti, fogli, presentazioni) come gli editor
 * d'ufficio sul web che le persone conoscono già:
 *   - in alto una testata: icona, titolo che si rinomina con un clic, «Salvato», i menu
 *     File / Modifica / Visualizza / Inserisci / Formato / Strumenti / Guida, a destra
 *     cronologia, commenti, Condividi e chi c'è;
 *   - sotto, una sola barra arrotondata con i comandi di tutti i giorni;
 *   - niente schede, niente barra di stato dove non serve.
 * Come. I bottoni della barra sono quelli veri di ONLYOFFICE, spostati: tengono il loro
 * stato (grassetto acceso, carattere del testo selezionato) e i loro menu. La barra a
 * schede di ONLYOFFICE resta viva fuori dallo schermo (il «parcheggio»): le voci dei
 * menu della pelle premono i suoi bottoni o aprono i suoi menu accanto alla voce.
 * Se qualcosa manca (una versione nuova di ONLYOFFICE che ha cambiato un nome), la voce
 * sparisce invece di rompersi: la pelle non deve mai impedire di scrivere.
 */
(function () {
  'use strict';
  if (window.__pelleHyfile) return;
  window.__pelleHyfile = true;

  var SORGENTE = 'https://github.com/ruben-108/hyfile-documenti';
  var ONLYOFFICE_SORGENTE = 'https://github.com/ONLYOFFICE/DocumentServer';

  /* ------------------------------------------------------------------ attesa */
  function quandoPronto(fai) {
    var giri = 0;
    (function prova() {
      var APP = window.DE || window.SSE || window.PE;
      if (APP && window.Common && Common.NotificationCenter && window.$) {
        var pronto = false;
        Common.NotificationCenter.on('app:ready', function () {
          if (pronto) return;
          pronto = true;
          setTimeout(function () { avvia(APP); }, 0);
        });
        return;
      }
      if (giri++ < 400) setTimeout(prova, 25);
    })();
    void fai;
  }

  /* ------------------------------------------------------------------ icone */
  // Disegnate per la pelle (Material Symbols, Apache 2.0, dove è indicato).
  var ICONE = {
    giu: 'M7 10l5 5 5-5z',
    destra: 'M10 17l5-5-5-5v10z',
    spunta: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
    cerca: 'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
    storia: 'M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.95 8.95 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z',
    commenti: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z',
    lucchetto: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
    nuvola: 'M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17 15.18 9l1.41 1.41L10 17z',
    gira: 'M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z',
    link: 'M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z',
    commento: 'M22 4c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4zm-2 13.17L18.83 16H4V4h16v13.17zM13 5h-2v4H7v2h4v4h2v-4h4V9h-4z',
    immagine: 'M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z',
    sinistra: 'M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z',
    centro: 'M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z',
    adestra: 'M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z',
    giustifica: 'M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z',
    altro: 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    matita: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
    occhio: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
    revisione: 'M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83zM14 19h7v2h-7z',
    annulla: 'M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z',
    ripeti: 'M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16a8.002 8.002 0 0 1 7.6-5.5c1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z',
    stampa: 'M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z',
    scarica: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
    info: 'M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
    nuovo: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zm-7-7H8v2h3v3h2v-3h3v-2h-3v-3h-2v3z',
    cartella: 'M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z',
    condividi: 'M15 8c0-1.42-.5-2.73-1.33-3.76.42-.14.86-.24 1.33-.24 2.21 0 4 1.79 4 4s-1.79 4-4 4c-.43 0-.84-.09-1.23-.21-.03-.01-.06-.02-.1-.03A5.98 5.98 0 0 0 15 8zm1.66 5.13C18.03 14.06 19 15.32 19 17v3h4v-3c0-2.18-3.58-3.47-6.34-3.87zM9 4c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z',
    matita2: 'M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83a1 1 0 0 0 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z',
    cestino: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
    tabella: 'M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zm-10 14H4v-9h6v9zm2 0v-9h8v9h-8z',
    grafico: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z',
    forma: 'M11.15 3.4L7.43 9.48c-.41.66.07 1.52.85 1.52h7.43c.78 0 1.26-.86.85-1.52L12.85 3.4a.993.993 0 0 0-1.7 0zM17.5 13a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zM4 21.5h6c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1z',
    omega: 'M12 4C7.86 4 4.5 7.36 4.5 11.5c0 2.5 1.23 4.72 3.1 6.08H5V20h6v-3.5a5.5 5.5 0 1 1 2 0V20h6v-2.42h-2.6a7.48 7.48 0 0 0 3.1-6.08C19.5 7.36 16.14 4 12 4z',
    testo: 'M5 4v3h5.5v12h3V7H19V4z',
    paragrafo: 'M9 10v5h2V4h2v11h2V4h2V2H9C6.79 2 5 3.79 5 6s1.79 4 4 4z',
    elenco: 'M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z',
    gomma: 'M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z',
    pagina: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
    lingua: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.99 7.99 0 0 1 5.08 16zm2.95-8H5.08a7.99 7.99 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z',
    ingranaggio: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
    tastiera: 'M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z',
    legge: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z',
    presenta: 'M10 8.64L15.27 12 10 15.36V8.64M8 5v14l11-7L8 5z',
    piu: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
    verticale: 'M8 19h3v4h2v-4h3l-4-4-4 4zm8-14h-3V1h-2v4H8l4 4 4-4zM4 11v2h16v-2H4z',
  };
  function svg(nome, classe) {
    var d = ICONE[nome] || '';
    return '<svg viewBox="0 0 24 24" aria-hidden="true"' + (classe ? ' class="' + classe + '"' : '') + '><path d="' + d + '"/></svg>';
  }
  // Il segno dei tre editor: un foglio tondo col colore del tipo (non il logo di nessuno).
  var COLORI = { word: '#2f6fe4', cell: '#1e8e3e', slide: '#e8a000' };
  function logo(tipo) {
    var c = COLORI[tipo];
    var dentro = tipo === 'cell'
      ? '<rect x="6" y="10" width="14" height="13" rx="1.2" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M6 14.5h14M6 18.8h14M11 10v13" stroke="#fff" stroke-width="1.8"/>'
      : tipo === 'slide'
        ? '<rect x="6" y="11" width="14" height="10" rx="1.5" fill="none" stroke="#fff" stroke-width="1.9"/>'
        : '<path d="M7 11h12M7 15h12M7 19h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/>';
    return '<svg viewBox="0 0 26 32" aria-hidden="true"><rect x="0" y="0" width="26" height="32" rx="5" fill="' + c + '"/>' + dentro + '</svg>';
  }

  function el(tag, attr, html) {
    var e = document.createElement(tag);
    if (attr) for (var k in attr) {
      if (k === 'class') e.className = attr[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attr[k]);
      else e.setAttribute(k, attr[k]);
    }
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function prova(f, dopo) { try { return f(); } catch (e) { if (window.console) console.warn('pelle-hyfile', e); return dopo; } }

  /* ------------------------------------------------------------------ i ganci in ONLYOFFICE */
  var G = {}; // riempito in avvia()

  function bottone(b) { return Array.isArray(b) ? b[0] : b; }
  function c(nome) { return prova(function () { return G.APP.getController(nome); }); }

  /** Preme un bottone di ONLYOFFICE come farebbe il mouse (la parte principale se è diviso). */
  function premi(b) {
    b = bottone(b);
    if (!b || !b.$el) return false;
    if (b.isDisabled && b.isDisabled()) return false;
    var btn = b.$el.is('button') ? b.$el : b.$el.find('button').first();
    btn.trigger('click');
    return true;
  }
  function voceDi(b, valore) {
    b = bottone(b);
    if (!b || !b.menu || !b.menu.items) return null;
    for (var i = 0; i < b.menu.items.length; i++) {
      var it = b.menu.items[i];
      if (it.value === valore || it.options && it.options.value === valore) return it;
    }
    return null;
  }
  /** Sceglie una voce del menu di un bottone, come il clic su quella voce. */
  function scegli(b, valore) {
    b = bottone(b);
    var it = voceDi(b, valore);
    if (!it) return false;
    if (it.checkable && !it.checked) it.setChecked(true, true);
    b.menu.trigger('item:click', b.menu, it, {});
    return true;
  }
  /** Apre il menu di un bottone di ONLYOFFICE accanto a un elemento della pelle. */
  var apertoOO = null;
  function apriMenuDi(b, ancora, verso) {
    b = bottone(b);
    if (!b || !b.menu || typeof b.menu.show !== 'function') return false;
    if (b.isDisabled && b.isDisabled()) return false;
    chiudiMenuOO();
    var m = b.menu;
    var prima = { el: m.menuAlignEl, al: m.menuAlign };
    m.menuAlignEl = $(ancora);
    m.menuAlign = verso || 'tl-tr';
    apertoOO = { m: m, prima: prima };
    m.once('hide:after', function () {
      m.menuAlignEl = prima.el;
      m.menuAlign = prima.al;
      if (apertoOO && apertoOO.m === m) apertoOO = null;
    });
    prova(function () { m.show(); });
    return true;
  }
  function chiudiMenuOO() {
    if (apertoOO) { var m = apertoOO.m; apertoOO = null; prova(function () { m.hide(); }); }
  }

  /* ------------------------------------------------------------------ i menu della pelle */
  // Una voce: { t: testo, k: tasti, ico, f: azione, sub: [voci] | function, oo: bottone di cui
  // aprire il menu, on: () => spuntata, ok: () => attiva, se: () => visibile }. '-' è una linea.
  var pila = [];
  function chiudiMenu(da) {
    da = da || 0;
    while (pila.length > da) {
      var p = pila.pop();
      p.pop.remove();
      p.ancora && p.ancora.classList.remove('aperto');
    }
    if (da === 0) chiudiMenuOO();
  }
  function vale(x, dopo) { return typeof x === 'function' ? prova(x, dopo) : (x === undefined ? dopo : x); }
  function visibili(voci) {
    var r = [];
    (vale(voci, []) || []).forEach(function (v) {
      if (v === '-') { if (r.length && r[r.length - 1] !== '-') r.push('-'); return; }
      if (!v || vale(v.se, true) === false) return;
      if (v.oo !== undefined && !bottone(vale(v.oo))) return;
      if (v.sub && !visibili(v.sub).length) return;
      r.push(v);
    });
    while (r.length && r[r.length - 1] === '-') r.pop();
    return r;
  }
  function posiziona(pop, ancora, verso) {
    var a = ancora.getBoundingClientRect();
    var w = pop.offsetWidth, h = pop.offsetHeight;
    var W = window.innerWidth, H = window.innerHeight;
    var x, y;
    if (verso === 'lato') { x = a.right - 4; y = a.top - 6; if (x + w > W - 4) x = a.left - w + 4; }
    else { x = a.left; y = a.bottom + 2; }
    if (x + w > W - 4) x = W - w - 4;
    if (y + h > H - 4) y = Math.max(4, H - h - 4);
    pop.style.left = Math.max(4, x) + 'px';
    pop.style.top = Math.max(4, y) + 'px';
  }
  function apriMenu(voci, ancora, livello, verso) {
    chiudiMenu(livello);
    var lista = visibili(voci);
    if (!lista.length) return null;
    var pop = el('div', { class: 'hf-pop', role: 'menu' });
    var conIcone = lista.some(function (v) { return v !== '-' && (v.ico || v.on); });
    lista.forEach(function (v) {
      if (v === '-') { pop.appendChild(el('div', { class: 'hf-linea' })); return; }
      var ok = vale(v.ok, true) !== false;
      var spunta = v.on ? vale(v.on, false) : false;
      var r = el('div', { class: 'hf-voce' + (ok ? '' : ' spenta'), role: 'menuitem' });
      r.innerHTML = (conIcone ? '<span class="hf-ico">' + (spunta ? svg('spunta') : v.ico ? svg(v.ico) : '') + '</span>' : '') +
        '<span class="hf-testo">' + esc(vale(v.t, '')) + '</span>' +
        (v.k ? '<span class="hf-tasti">' + esc(v.k) + '</span>' : '') +
        (v.sub || v.oo ? svg('destra', 'hf-freccia') : '');
      var timer = null;
      r.addEventListener('mouseenter', function () {
        Array.prototype.forEach.call(pop.children, function (x) { x.classList.remove('attiva'); });
        r.classList.add('attiva');
        clearTimeout(timer);
        timer = setTimeout(function () {
          if (!ok) return chiudiMenu(livello + 1);
          if (v.sub) apriMenu(v.sub, r, livello + 1, 'lato');
          else if (v.oo) { chiudiMenu(livello + 1); apriMenuDi(vale(v.oo), r, 'tl-tr'); }
          else { chiudiMenu(livello + 1); chiudiMenuOO(); }
        }, 120);
      });
      r.addEventListener('mouseleave', function () { clearTimeout(timer); });
      r.addEventListener('mousedown', function (e) { e.preventDefault(); });
      r.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!ok) return;
        if (v.sub) { apriMenu(v.sub, r, livello + 1, 'lato'); return; }
        if (v.oo) { chiudiMenu(livello + 1); apriMenuDi(vale(v.oo), r, 'tl-tr'); return; }
        chiudiMenu(0);
        setTimeout(function () { prova(v.f); rimettiFuoco(); }, 0);
      });
      pop.appendChild(r);
    });
    document.body.appendChild(pop);
    posiziona(pop, ancora, verso);
    if (livello === 0 && ancora) ancora.classList.add('aperto');
    pila.push({ pop: pop, ancora: livello === 0 ? ancora : null });
    return pop;
  }
  function rimettiFuoco() {
    prova(function () { Common.NotificationCenter.trigger('edit:complete'); });
  }
  document.addEventListener('mousedown', function (e) {
    if (!pila.length) return;
    for (var i = 0; i < pila.length; i++) if (pila[i].pop.contains(e.target)) return;
    if (e.target.closest && e.target.closest('#hf-menu > button, .hf-tendina, .hf-bottone')) return;
    if (e.target.closest && e.target.closest('.dropdown-menu')) { chiudiMenu(0 + 0 || 0); return; }
    chiudiMenu(0);
  }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && pila.length) { chiudiMenu(0); rimettiFuoco(); e.stopPropagation(); }
    if (e.altKey && (e.key === '/' || e.code === 'Slash')) { e.preventDefault(); cercaNeiMenu(); }
  }, true);

  /* ------------------------------------------------------------------ cerca nei menu */
  var MENU = [];
  function tutteLeVoci() {
    var out = [];
    (function giro(voci, via) {
      visibili(voci).forEach(function (v) {
        if (v === '-') return;
        var t = vale(v.t, '');
        if (v.sub) giro(v.sub, via.concat(t));
        else if (v.f && vale(v.ok, true) !== false) out.push({ t: t, via: via.join(' › '), f: v.f, k: v.k });
      });
    })(MENU.map(function (m) { return { t: m.t, sub: m.voci }; }), []);
    return out;
  }
  function cercaNeiMenu() {
    var ancora = document.getElementById('hf-cerca-menu-bottone') || document.getElementById('hf-menu');
    if (!ancora) return;
    chiudiMenu(0);
    var pop = el('div', { class: 'hf-pop', role: 'dialog' });
    pop.style.width = '320px';
    var campo = el('input', { type: 'text', placeholder: 'Cerca nei menu (Alt+/)', 'aria-label': 'Cerca nei menu' });
    var box = el('div', { class: 'hf-cerca-menu' }); box.appendChild(campo); pop.appendChild(box);
    var lista = el('div'); pop.appendChild(lista);
    var tutte = tutteLeVoci(), trovate = [];
    function disegna() {
      var q = campo.value.trim().toLowerCase();
      trovate = q ? tutte.filter(function (v) { return (v.t + ' ' + v.via).toLowerCase().indexOf(q) >= 0; }).slice(0, 12) : [];
      lista.innerHTML = '';
      if (q && !trovate.length) lista.appendChild(el('div', { class: 'hf-cerca-nulla' }, 'Nessun comando trovato'));
      trovate.forEach(function (v, i) {
        var r = el('div', { class: 'hf-voce' + (i === 0 ? ' attiva' : '') },
          '<span class="hf-testo">' + esc(v.t) + ' <span style="color:#5f6368;font-size:12px">' + esc(v.via) + '</span></span>' +
          (v.k ? '<span class="hf-tasti">' + esc(v.k) + '</span>' : ''));
        r.addEventListener('mousedown', function (e) { e.preventDefault(); });
        r.addEventListener('click', function () { chiudiMenu(0); setTimeout(function () { prova(v.f); rimettiFuoco(); }, 0); });
        lista.appendChild(r);
      });
    }
    campo.addEventListener('input', disegna);
    campo.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && trovate[0]) { e.preventDefault(); chiudiMenu(0); var f = trovate[0].f; setTimeout(function () { prova(f); rimettiFuoco(); }, 0); }
      e.stopPropagation();
    });
    document.body.appendChild(pop);
    posiziona(pop, ancora, 'sotto');
    pila.push({ pop: pop, ancora: null });
    setTimeout(function () { campo.focus(); }, 0);
  }

  /* ------------------------------------------------------------------ la testata */
  var PALETTE = ['#1a73e8', '#d93025', '#188038', '#e37400', '#9334e6', '#c5221f', '#007b83', '#b06000', '#3949ab', '#ad1457'];
  function coloreDi(s) { var h = 0; s = String(s || ''); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return PALETTE[Math.abs(h) % PALETTE.length]; }
  function iniziali(nome) {
    var p = String(nome || '?').trim().split(/\s+/);
    return ((p[0] || '?')[0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
  }
  function senzaEstensione(t) { var i = t.lastIndexOf('.'); return i > 0 ? t.slice(0, i) : t; }

  function testata(o) {
    var t = el('div', { id: 'hf-testa' });
    var lg = el('div', { class: 'hf-logo', title: 'Torna a HyFile', role: 'button' }, logo(G.TIPO));
    lg.addEventListener('click', function () { prova(function () { Common.NotificationCenter.trigger('goback'); }); });
    t.appendChild(lg);
    var centro = el('div', { class: 'hf-centro' });
    var riga = el('div', { class: 'hf-riga-titolo' });
    // Un <input> e non un testo modificabile: l'editor si riprende il fuoco da tutto
    // quello che non è un campo (vuole i tasti per il documento), ma lascia stare i campi.
    var titolo = el('input', { id: 'hf-titolo', type: 'text', spellcheck: 'false', autocomplete: 'off',
      'aria-label': 'Nome del documento', title: o.rinomina ? 'Rinomina' : '' });
    var misura = el('span', { class: 'hf-misura', 'aria-hidden': 'true' });
    function allarga() {
      misura.textContent = titolo.value || ' ';
      titolo.style.width = Math.min(misura.offsetWidth + 16, Math.max(120, window.innerWidth - 560)) + 'px';
    }
    titolo.value = senzaEstensione(o.titolo);
    titolo.allarga = allarga;
    if (!o.rinomina) titolo.readOnly = true;
    else {
      var prima = '';
      titolo.addEventListener('focus', function () { prima = titolo.value; setTimeout(function () { titolo.select(); }, 0); });
      titolo.addEventListener('input', allarga);
      titolo.addEventListener('keydown', function (e) {
        e.stopPropagation();
        if (e.key === 'Enter') { e.preventDefault(); titolo.blur(); }
        if (e.key === 'Escape') { e.preventDefault(); titolo.value = prima; allarga(); titolo.blur(); }
      });
      titolo.addEventListener('keyup', function (e) { e.stopPropagation(); });
      titolo.addEventListener('keypress', function (e) { e.stopPropagation(); });
      titolo.addEventListener('blur', function () {
        var nuovo = titolo.value.replace(/\s+/g, ' ').trim();
        if (!nuovo) nuovo = prima;
        titolo.value = nuovo;
        allarga();
        if (nuovo !== prima) prova(function () { Common.Gateway.requestRename(nuovo); });
        rimettiFuoco();
      });
    }
    riga.appendChild(misura);
    riga.appendChild(titolo);
    var stato = el('span', { class: 'hf-stato', id: 'hf-stato', title: 'Le modifiche si salvano da sole in HyFile' });
    riga.appendChild(stato);
    centro.appendChild(riga);
    var menu = el('div', { id: 'hf-menu', role: 'menubar' });
    MENU.forEach(function (m) {
      // Un menu che qui non avrebbe voci (Inserisci, per chi guarda soltanto) non si mostra.
      if (!visibili(m.voci).length) return;
      var b = el('button', { type: 'button', role: 'menuitem' });
      b.textContent = m.t;
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () {
        if (b.classList.contains('aperto')) { chiudiMenu(0); return; }
        apriMenu(m.voci, b, 0, 'sotto');
      });
      b.addEventListener('mouseenter', function () {
        if (pila.length && pila[0].ancora && pila[0].ancora !== b && pila[0].ancora.parentNode === menu) apriMenu(m.voci, b, 0, 'sotto');
      });
      menu.appendChild(b);
    });
    centro.appendChild(menu);
    t.appendChild(centro);

    var destra = el('div', { class: 'hf-destra' });
    destra.appendChild(el('div', { id: 'hf-gente' }));
    if (o.storia) {
      var bs = el('button', { type: 'button', class: 'hf-tondo', title: 'Cronologia delle versioni' }, svg('storia'));
      bs.addEventListener('click', o.storia);
      destra.appendChild(bs);
    }
    if (o.commenti) {
      var bc = el('button', { type: 'button', class: 'hf-tondo', title: 'Commenti' }, svg('commenti'));
      bc.addEventListener('click', o.commenti);
      destra.appendChild(bc);
    }
    if (o.extra) { var ex = o.extra(); if (ex) destra.appendChild(ex); }
    if (o.condividi) {
      var cd = el('button', { type: 'button', id: 'hf-condividi' }, svg('lucchetto') + '<span>Condividi</span>');
      cd.addEventListener('click', o.condividi);
      destra.appendChild(cd);
    }
    var av = el('div', { class: 'hf-avatar', title: o.utente || '' });
    av.textContent = iniziali(o.utente);
    av.style.background = coloreDi(o.utenteId || o.utente);
    destra.appendChild(av);
    t.appendChild(destra);
    return t;
  }

  function mettiStato(s) {
    var e = document.getElementById('hf-stato');
    if (!e) return;
    if (s === 'salva') e.innerHTML = svg('gira') + '<span>Salvataggio…</span>';
    else if (s === 'salvato') e.innerHTML = svg('nuvola') + '<span>Salvato in HyFile</span>';
    else if (s === 'sola') e.innerHTML = svg('occhio') + '<span>Solo visualizzazione</span>';
    else if (s === 'offline') e.innerHTML = '<span>Senza connessione: le modifiche partono appena torna</span>';
    else e.innerHTML = '';
  }

  function mettiGente(utenti) {
    var box = document.getElementById('hf-gente');
    if (!box) return;
    box.innerHTML = '';
    var io = G.utenteId, visti = {};
    var lista = Array.isArray(utenti) ? utenti : (utenti && typeof utenti === 'object' ? Object.keys(utenti).map(function (k) { return utenti[k]; }) : []);
    lista.forEach(function (u) {
      var id = prova(function () { return u.asc_getIdOriginal(); }, '') || '';
      var nome = prova(function () { return u.asc_getUserName(); }, '') || '';
      var vivo = prova(function () { return !u.asc_getView(); }, true);
      if (!id || id === io || visti[id] || !vivo) return;
      visti[id] = true;
      var a = el('div', { class: 'hf-avatar', title: nome + ' sta modificando' });
      a.textContent = iniziali(nome);
      a.style.background = prova(function () { return u.asc_getColor(); }, '') || coloreDi(id);
      box.appendChild(a);
    });
  }

  /* ------------------------------------------------------------------ la barra */
  function stampa() {
    return sposta('slot-btn-print') || (G.opz.canPrint !== false
      ? bottonePelle('stampa', 'Stampa (Ctrl+P)', function () { prova(function () { Common.NotificationCenter.trigger('file:print'); }); })
      : null);
  }
  function sposta(id) {
    var s = typeof id === 'string' ? document.getElementById(id) : id;
    if (!s) return null;
    s.classList.remove('hidden');
    return s;
  }
  function gruppo(cose, nome) {
    var g = el('div', { class: 'hf-gruppo', 'data-gruppo': nome || '' });
    cose.forEach(function (x) { if (x) g.appendChild(x); });
    return g.children.length ? g : null;
  }
  function sep() { return el('div', { class: 'hf-sep' }); }
  function bottonePelle(ico, titolo, f, classe) {
    var b = el('button', { type: 'button', class: 'hf-bottone' + (classe ? ' ' + classe : ''), title: titolo, 'aria-label': titolo }, svg(ico));
    b.addEventListener('mousedown', function (e) { e.preventDefault(); });
    b.addEventListener('click', function (e) { e.stopPropagation(); f(b); });
    return b;
  }
  function tendina(etichetta, larghezza, voci, titolo) {
    var b = el('button', { type: 'button', class: 'hf-tendina', title: titolo || '' },
      '<span class="hf-etichetta"></span>' + svg('giu'));
    if (larghezza) b.querySelector('.hf-etichetta').style.width = larghezza;
    b.querySelector('.hf-etichetta').textContent = etichetta;
    b.addEventListener('mousedown', function (e) { e.preventDefault(); });
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      if (b.classList.contains('aperto')) { chiudiMenu(0); return; }
      apriMenu(voci, b, 0, 'sotto');
    });
    b.metti = function (t) { b.querySelector('.hf-etichetta').textContent = t; };
    return b;
  }
  /** Un bottone della pelle che apre una piccola barra con dentro bottoni veri di ONLYOFFICE. */
  function cassetto(ico, titolo, ids) {
    var pop = el('div', { class: 'hf-pop hf-pop-barra' });
    ids.forEach(function (id) { var s = sposta(id); if (s) pop.appendChild(s); });
    if (!pop.children.length) return null;
    pop.style.display = 'none';
    document.body.appendChild(pop);
    var b = bottonePelle(ico, titolo, function () {
      if (pop.style.display !== 'none') { pop.style.display = 'none'; b.classList.remove('aperto'); return; }
      chiudiMenu(0);
      pop.style.display = 'flex';
      posiziona(pop, b, 'sotto');
      b.classList.add('aperto');
    });
    document.addEventListener('mousedown', function (e) {
      if (pop.style.display === 'none' || pop.contains(e.target) || b.contains(e.target)) return;
      if (e.target.closest && e.target.closest('.dropdown-menu')) return;
      pop.style.display = 'none'; b.classList.remove('aperto');
    }, true);
    pop.addEventListener('click', function (e) {
      if (e.target.closest('.dropdown-toggle')) return;
      setTimeout(function () { pop.style.display = 'none'; b.classList.remove('aperto'); }, 0);
    });
    b.pop = pop;
    return b;
  }

  /** Quando la barra non ci sta, gli ultimi gruppi vanno nel «⋮». */
  function adatta() {
    var barra = document.getElementById('hf-barra');
    var altro = document.getElementById('hf-altro');
    if (!barra || !altro) return;
    var pop = altro.pop;
    // Tutto torna nella barra, poi si tolgono gruppi dalla fine finché non ci sta.
    Array.prototype.slice.call(pop.querySelectorAll('.hf-gruppo')).forEach(function (g) {
      barra.insertBefore(g, altro.parentNode);
    });
    Array.prototype.slice.call(barra.querySelectorAll('.hf-sep.hf-nascosto')).forEach(function (s) { s.classList.remove('hf-nascosto'); });
    var gruppi = Array.prototype.slice.call(barra.querySelectorAll(':scope > .hf-gruppo:not(.hf-fisso)'));
    altro.parentNode.style.display = 'none';
    var spazio = function () { return barra.scrollWidth <= barra.clientWidth + 1; };
    pulisciLinee(barra);
    if (spazio()) return;
    altro.parentNode.style.display = '';
    for (var i = gruppi.length - 1; i >= 0 && !spazio(); i--) {
      pop.insertBefore(gruppi[i], pop.firstChild);
      pulisciLinee(barra);
    }
  }
  /** Una linea fra due gruppi si vede solo se ha un gruppo vero da tutte e due le parti. */
  function pulisciLinee(barra) {
    var figli = Array.prototype.slice.call(barra.children);
    figli.forEach(function (x, i) {
      if (!x.classList.contains('hf-sep')) return;
      var dopo = figli.slice(i + 1).find(function (y) { return !y.classList.contains('hf-nascosto') || !y.classList.contains('hf-sep'); });
      var prima = figli.slice(0, i).reverse().find(function (y) { return !(y.classList.contains('hf-sep') && y.classList.contains('hf-nascosto')); });
      var vuota = !dopo || dopo.classList.contains('hf-sep') || dopo.classList.contains('hf-fisso') ||
        !prima || prima.classList.contains('hf-sep');
      x.classList.toggle('hf-nascosto', vuota);
    });
  }

  /* ------------------------------------------------------------------ avvio */
  function avvia(APP) {
    var main = APP.getController('Main');
    var opz = main.appOptions || {};
    G.APP = APP;
    G.TIPO = window.DE ? 'word' : window.SSE ? 'cell' : 'slide';
    G.api = main.api;
    G.opz = opz;
    G.modifica = !!opz.isEdit;
    G.utenteId = opz.user && opz.user.id;
    G.tb = prova(function () { return APP.getController('Toolbar').toolbar; });
    var editor = EDITOR[G.TIPO];
    if (!editor || !G.tb) return;

    document.body.classList.add('hf-pelle', 'hf-pelle-' + G.TIPO);
    prova(function () { Common.UI.Themes.setTheme('theme-white'); });

    MENU = editor.menu();
    var doc = main.document || {};
    var cima = document.getElementById('toolbar');
    var vecchia = cima.querySelector(':scope > .toolbar') || cima.firstElementChild;
    var testa = testata({
      titolo: doc.title || prova(function () { return G.api.asc_getDocumentName(); }, '') || '',
      rinomina: !!opz.canRename && G.modifica,
      utente: opz.user && (opz.user.fullname || opz.user.name),
      utenteId: G.utenteId,
      condividi: opz.canRequestSharingSettings ? function () { Common.Gateway.requestSharingSettings(); } : null,
      storia: opz.canUseHistory ? function () { Common.NotificationCenter.trigger('collaboration:history'); } : null,
      commenti: opz.canViewComments || opz.canComments ? function () { pannello('comments'); } : null,
      extra: editor.testa || null,
    });
    var barra = el('div', { id: 'hf-barra', role: 'toolbar' });
    cima.insertBefore(testa, cima.firstChild);
    cima.insertBefore(barra, testa.nextSibling);
    if (vecchia) vecchia.classList.add('hf-parcheggio');

    prova(function () { editor.barra(barra); });
    // Il «⋮» per quello che non ci sta.
    var altroPop = el('div', { class: 'hf-pop hf-pop-barra', style: 'display:none;flex-wrap:wrap;max-width:420px' });
    document.body.appendChild(altroPop);
    var altro = bottonePelle('altro', 'Altre opzioni', function () {
      if (altroPop.style.display !== 'none') { altroPop.style.display = 'none'; altro.classList.remove('aperto'); return; }
      chiudiMenu(0);
      altroPop.style.display = 'flex';
      var r = altro.getBoundingClientRect();
      altroPop.style.left = Math.max(4, r.right - altroPop.offsetWidth) + 'px';
      altroPop.style.top = (r.bottom + 4) + 'px';
      altro.classList.add('aperto');
    });
    altro.id = 'hf-altro';
    altro.pop = altroPop;
    document.addEventListener('mousedown', function (e) {
      if (altroPop.style.display === 'none' || altroPop.contains(e.target) || altro.contains(e.target)) return;
      if (e.target.closest && e.target.closest('.dropdown-menu, .hf-pop')) return;
      altroPop.style.display = 'none'; altro.classList.remove('aperto');
    }, true);
    var gAltro = gruppo([altro], 'altro'); gAltro.classList.add('hf-fisso');
    barra.appendChild(gAltro);
    if (editor.coda) { var cd = editor.coda(); if (cd) { cd.classList.add('hf-fisso'); barra.appendChild(cd); } }

    altezza(64 + 40 + 8);
    prova(function () { document.getElementById('hf-titolo').allarga(); });
    prova(function () { editor.dopo && editor.dopo(); });

    // Salvataggio, persone, titolo.
    mettiStato(G.modifica ? 'salvato' : 'sola');
    prova(function () {
      G.api.asc_registerCallback('asc_onStartAction', function (tipo, id) {
        if (id === Asc.c_oAscAsyncAction.Save || id === Asc.c_oAscAsyncAction.ForceSaveButton) mettiStato('salva');
      });
      G.api.asc_registerCallback('asc_onEndAction', function (tipo, id) {
        if (id === Asc.c_oAscAsyncAction.Save || id === Asc.c_oAscAsyncAction.ForceSaveButton) setTimeout(function () { mettiStato(G.modifica ? 'salvato' : 'sola'); }, 400);
      });
      G.api.asc_registerCallback('asc_onCoAuthoringDisconnect', function () { mettiStato('offline'); });
      G.api.asc_registerCallback('asc_onMeta', function (meta) {
        var t = document.getElementById('hf-titolo');
        if (t && meta && meta.title && document.activeElement !== t) { t.value = senzaEstensione(meta.title); t.allarga && t.allarga(); }
      });
      var aggiorna = function () { mettiGente(prova(function () { return Object.values(G.api.asc_getAuthors ? G.api.asc_getAuthors() : {}); }, [])); };
      G.api.asc_registerCallback('asc_onAuthParticipantsChanged', function (u) { mettiGente(u); });
      G.api.asc_registerCallback('asc_onParticipantsChanged', function (u) { mettiGente(u); });
      void aggiorna;
    });
    var tAdatta = null;
    window.addEventListener('resize', function () { clearTimeout(tAdatta); tAdatta = setTimeout(function () { adatta(); prova(function () { document.getElementById('hf-titolo').allarga(); }); }, 60); });
    setTimeout(adatta, 50);
    Common.NotificationCenter.on('document:ready', function () { setTimeout(adatta, 50); prova(function () { editor.pronto && editor.pronto(); }); });
  }

  /** L'altezza della parte in alto (testata + barra), che ONLYOFFICE rispetta nel suo layout. */
  function altezza(h) {
    prova(function () {
      var vp = G.APP.getController('Viewport');
      var v = vp.viewport || vp.getView('Viewport');
      var vl = v.vlayout;
      vl.panels.forEach(function (p) {
        if (p.alias === 'toolbar') Object.defineProperty(p, 'height', { get: function () { return h; }, set: function () {}, configurable: true });
        if (p.alias === 'title') { p.el.hide(); }
      });
      vl.doLayout();
      Common.NotificationCenter.trigger('layout:changed', 'toolbar');
    });
  }

  /** Apre o chiude un pannello di sinistra (commenti, struttura, ricerca). */
  function pannello(nome) {
    prova(function () {
      var lm = G.APP.getController('LeftMenu').leftMenu;
      var b = { comments: lm.btnComments, navigation: lm.btnNavigation, search: lm.btnSearchBar, chat: lm.btnChat, thumbnails: lm.btnThumbnails, about: lm.btnAbout }[nome];
      if (!b) return;
      if (b.pressed) { lm.close ? lm.close() : (b.toggle(false), lm.onBtnMenuClick(b)); return; }
      if (nome === 'about') { b.toggle(true); lm.onBtnMenuClick(b); return; }
      lm.showMenu(nome);
    });
  }

  function legale() {
    var vecchio = document.getElementById('hf-legale');
    if (vecchio) vecchio.remove();
    var f = el('div', { id: 'hf-legale', role: 'dialog', 'aria-modal': 'true' });
    f.innerHTML = '<div><h2>Informazioni legali</h2>' +
      '<p>Questo editor è <b>Documenti di HyFile</b>: una <b>versione modificata</b> di ONLYOFFICE Docs Community Edition, ' +
      'sviluppato in origine da Ascensio System SIA. La modifica (dal 15 novembre 2026) aggiunge una pelle disegnata per HyFile: ' +
      'la testata, i menu e la barra; il resto è ONLYOFFICE com\u2019è.</p>' +
      '<p>ONLYOFFICE Docs è © Ascensio System SIA, software libero con licenza GNU AGPL v3: ' +
      '<a href="' + ONLYOFFICE_SORGENTE + '" target="_blank" rel="noopener">codice sorgente</a>. Il nome e il marchio ONLYOFFICE sono dei loro proprietari.</p>' +
      '<p>La pelle (questa testata, i menu e la barra) è © 2026 Ruben Leo, con la stessa licenza AGPL v3: ' +
      '<a href="' + SORGENTE + '" target="_blank" rel="noopener">codice sorgente della pelle</a>.</p>' +
      '<p>Il programma è distribuito senza alcuna garanzia. Testo della licenza: ' +
      '<a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener">gnu.org/licenses/agpl-3.0</a>.</p>' +
      '<div class="hf-fine"><button type="button">Chiudi</button></div></div>';
    f.addEventListener('click', function (e) { if (e.target === f || e.target.tagName === 'BUTTON') { f.remove(); rimettiFuoco(); } });
    document.body.appendChild(f);
    f.querySelector('button').focus();
  }

  /* ------------------------------------------------------------------ pezzi comuni ai tre editor */
  function aggiungiCommento() {
    if (premi(prova(function () { return c('Toolbar').btnsComment; }))) return;
    prova(function () { Common.NotificationCenter.trigger('app:comment:add', null, true); });
  }
  function senzaBarraDiStato() {
    prova(function () {
      c('Statusbar').statusbar.setVisible(false);
      Common.NotificationCenter.trigger('layout:changed', 'status');
    });
  }
  function voceSi(v) { return function () { return G.modifica && (v === undefined || !!vale(v)); }; }
  function lm() { return c('LeftMenu'); }
  function scarica(formato) {
    return function () { lm().clickSaveAsFormat(undefined, Asc.c_oAscFileType[formato]); };
  }
  function zoomVoci() {
    var z = [50, 75, 90, 100, 125, 150, 200];
    var voci = [];
    if (G.TIPO !== 'cell') {
      voci.push({ t: 'Adatta alla pagina', f: function () { G.api.zoomFitToPage(); } });
      voci.push({ t: 'Adatta alla larghezza', f: function () { G.api.zoomFitToWidth(); } });
      voci.push('-');
    }
    z.forEach(function (v) {
      voci.push({ t: v + '%', on: function () { return Math.round(zoomAdesso()) === v; }, f: function () { zoomA(v); } });
    });
    return voci;
  }
  function zoomAdesso() { return prova(function () { return G.TIPO === 'cell' ? G.api.asc_getZoom() * 100 : G.api.get_Zoom(); }, 100); }
  function zoomA(v) { prova(function () { if (G.TIPO === 'cell') G.api.asc_setZoom(v / 100); else G.api.zoom(v); }); }

  function vociGuida() {
    return [
      { t: 'Guida', ico: 'info', f: function () { prova(function () { Common.NotificationCenter.trigger('file:help'); }); } },
      { t: 'Scorciatoie da tastiera', ico: 'tastiera', f: function () { prova(function () { Common.NotificationCenter.trigger('file:help', 'UsageInstructions/KeyboardShortcuts.htm'); }); } },
      '-',
      { t: 'Cerca nei menu', ico: 'cerca', k: 'Alt+/', f: cercaNeiMenu },
      '-',
      { t: 'Informazioni legali', ico: 'legge', f: legale },
      { t: 'Informazioni su ONLYOFFICE', f: function () { pannello('about'); } },
    ];
  }
  function vociFile(extra) {
    var o = G.opz;
    return [
      { t: 'Nuovo', ico: 'nuovo', se: function () { return !!o.canRequestCreateNew; }, f: function () { Common.Gateway.requestCreateNew(); } },
      { t: 'Apri la cartella', ico: 'cartella', se: function () { return !!(o.customization && o.customization.goback); }, f: function () { Common.NotificationCenter.trigger('goback'); } },
      '-',
      { t: 'Condividi', ico: 'condividi', se: function () { return !!o.canRequestSharingSettings; }, f: function () { Common.Gateway.requestSharingSettings(); } },
      { t: 'Scarica', ico: 'scarica', se: function () { return o.canDownload !== false; }, sub: extra.scarica },
      '-',
      { t: 'Rinomina', ico: 'matita2', se: function () { return !!o.canRename && G.modifica; }, f: function () { var t = document.getElementById('hf-titolo'); setTimeout(function () { t && t.focus(); }, 50); } },
      '-',
      { t: 'Cronologia delle versioni', ico: 'storia', se: function () { return !!o.canUseHistory; }, f: function () { Common.NotificationCenter.trigger('collaboration:history'); } },
      { t: 'Dettagli', ico: 'info', f: function () { lm().leftMenu.showMenu('file:info'); } },
      '-',
    ].concat(extra.dopo || []).concat([
      '-',
      { t: 'Stampa', ico: 'stampa', k: 'Ctrl+P', se: function () { return o.canPrint !== false; }, f: function () { Common.NotificationCenter.trigger('file:print'); } },
    ]);
  }
  function vociModifica(extra) {
    var tb = G.tb;
    return [
      { t: 'Annulla', ico: 'annulla', k: 'Ctrl+Z', ok: function () { return G.api.asc_getCanUndo ? G.api.asc_getCanUndo() : true; }, f: function () { premi(tb.btnUndo); } },
      { t: 'Ripeti', ico: 'ripeti', k: 'Ctrl+Y', ok: function () { return G.api.asc_getCanRedo ? G.api.asc_getCanRedo() : true; }, f: function () { premi(tb.btnRedo); } },
      '-',
      { t: 'Taglia', k: 'Ctrl+X', se: function () { return !!tb.btnCut; }, f: function () { premi(tb.btnCut); } },
      { t: 'Copia', k: 'Ctrl+C', se: function () { return !!tb.btnCopy; }, f: function () { premi(tb.btnCopy); } },
      { t: 'Incolla', k: 'Ctrl+V', se: function () { return !!tb.btnPaste; }, f: function () { premi(tb.btnPaste); } },
      '-',
      { t: 'Seleziona tutto', k: 'Ctrl+A', se: function () { return !!tb.btnSelectAll; }, f: function () { premi(tb.btnSelectAll); } },
      '-',
      { t: 'Trova e sostituisci', ico: 'cerca', k: 'Ctrl+H', f: function () { if (!premi(tb.btnReplace)) pannello('search'); } },
    ].concat(extra || []);
  }

  /* ================================================================== DOCUMENTI */
  var EDITOR = {};
  EDITOR.word = (function () {
    var STILI = [
      ['Normal', 'Testo normale', 'font-size:14px'],
      ['Title', 'Titolo', 'font-size:22px'],
      ['Subtitle', 'Sottotitolo', 'font-size:16px;color:#5f6368'],
      ['Heading 1', 'Titolo 1', 'font-size:20px'],
      ['Heading 2', 'Titolo 2', 'font-size:17px;font-weight:700'],
      ['Heading 3', 'Titolo 3', 'font-size:15px;font-weight:700;color:#434343'],
      ['Heading 4', 'Titolo 4', 'font-size:14px;font-style:italic;color:#666'],
    ];
    var NOMI_STILI = {};
    STILI.forEach(function (s) { NOMI_STILI[s[0]] = s[1]; });
    var tStile = null, tZoom = null, bAllinea = null;
    function tb() { return G.tb; }
    function links() { return prova(function () { return c('Links').view; }); }
    function hf() { return prova(function () { return c('HeaderFooterTab').view || c('HeaderFooterTab').getView('HeaderFooterTab'); }); }
    function rev() { return prova(function () { return c('Common.Controllers.ReviewChanges').view; }); }
    function viewTab() { return prova(function () { return c('ViewTab').view; }); }
    function stile(nome) { prova(function () { G.api.put_Style(nome); }); }
    function inserisciLink() {
      var l = links();
      if (l && l.btnsHyperlink && premi(l.btnsHyperlink)) return;
      prova(function () { tb().fireEvent('insert:hyperlink'); });
    }
    function commento() { aggiungiCommento(); }
    function immagine(da) { return function () { scegli(hf() && hf().btnsInsImage || tb().btnsInsertImage, da); }; }

    function menu() {
      return [
        { t: 'File', voci: vociFile({
          scarica: [
            { t: 'Documento di Word (.docx)', f: scarica('DOCX') },
            { t: 'Documento OpenDocument (.odt)', f: scarica('ODT') },
            { t: 'Documento PDF (.pdf)', f: scarica('PDF') },
            { t: 'Formato RTF (.rtf)', f: scarica('RTF') },
            { t: 'Testo normale (.txt)', f: scarica('TXT') },
            { t: 'Pagina web (.html)', f: scarica('HTML') },
            { t: 'Libro EPUB (.epub)', f: scarica('EPUB') },
          ],
          dopo: [
            { t: 'Impostazione pagina', ico: 'pagina', sub: [
              { t: 'Orientamento', sub: [
                { t: 'Verticale', on: function () { return voceDi(tb().btnPageOrient, true) && voceDi(tb().btnPageOrient, true).checked; }, f: function () { scegli(tb().btnPageOrient, true); } },
                { t: 'Orizzontale', on: function () { return voceDi(tb().btnPageOrient, false) && voceDi(tb().btnPageOrient, false).checked; }, f: function () { scegli(tb().btnPageOrient, false); } },
              ] },
              { t: 'Dimensioni pagina', oo: function () { return tb().btnPageSize; } },
              { t: 'Margini', oo: function () { return tb().btnPageMargins; } },
              { t: 'Colore pagina', oo: function () { return tb().btnPageColor; } },
            ] },
            { t: 'Lingua del documento', ico: 'lingua', f: function () { prova(function () { c('Statusbar').statusbar.btnDocLang.trigger('click'); }) || prova(function () { c('Statusbar').onBtnLanguage(); }); } },
          ],
        }) },
        { t: 'Modifica', voci: vociModifica() },
        { t: 'Visualizza', voci: [
          { t: 'Modalità', sub: [
            { t: 'Modifica', ico: 'matita', se: function () { return G.modifica; }, on: function () { return !G.revisione(); }, f: function () { G.revisione(false); } },
            { t: 'Suggerimento (revisioni)', ico: 'revisione', se: function () { return G.modifica && G.opz.canReview; }, on: function () { return G.revisione(); }, f: function () { G.revisione(true); } },
          ] },
          '-',
          { t: 'Mostra righello', on: function () { return !G.api.asc_IsRulersHidden || !prova(function () { return Common.Utils.InternalSettings.get('de-hidden-rulers'); }, false); }, f: function () { var v = viewTab(); v && v.chRulers && v.chRulers.setValue(!v.chRulers.getValue()); } },
          { t: 'Mostra struttura del documento', ico: 'elenco', f: function () { pannello('navigation'); } },
          { t: 'Mostra caratteri non stampabili', k: 'Ctrl+Shift+8', ico: 'paragrafo', f: function () { premi(tb().btnShowHidenChars); } },
          '-',
          { t: 'Zoom', sub: zoomVoci },
        ] },
        { t: 'Inserisci', voci: [
          { t: 'Immagine', ico: 'immagine', se: function () { return G.modifica; }, sub: [
            { t: 'Carica dal computer', f: immagine('file') },
            { t: 'Da un indirizzo web', f: immagine('url') },
          ] },
          { t: 'Tabella', ico: 'tabella', se: function () { return G.modifica; }, oo: function () { return tb().btnInsertTable; } },
          { t: 'Disegno e forme', ico: 'forma', se: function () { return G.modifica; }, oo: function () { return tb().btnInsertShape; } },
          { t: 'Grafico', ico: 'grafico', se: function () { return G.modifica; }, oo: function () { return tb().btnInsertChart; } },
          { t: 'Linea orizzontale', se: function () { return G.modifica && !!voceDi(tb().btnBorders, 'horizontal-line'); }, f: function () { scegli(tb().btnBorders, 'horizontal-line'); } },
          { t: 'Caratteri speciali', ico: 'omega', se: function () { return G.modifica; }, oo: function () { return tb().btnInsertSymbol; } },
          { t: 'Equazione', se: function () { return G.modifica; }, f: function () { premi(tb().btnInsertEquation); } },
          '-',
          { t: 'Casella di testo', ico: 'testo', se: function () { return G.modifica; }, f: function () { scegli(tb().btnInsertText, 'textRect'); } },
          { t: 'Text Art', se: function () { return G.modifica; }, oo: function () { return tb().btnInsertTextArt; } },
          '-',
          { t: 'Link', ico: 'link', k: 'Ctrl+K', se: function () { return G.modifica; }, f: inserisciLink },
          { t: 'Commento', ico: 'commento', k: 'Ctrl+Alt+M', se: function () { return G.opz.canComments; }, f: commento },
          '-',
          { t: 'Interruzione', se: function () { return G.modifica; }, oo: function () { return tb().btnsPageBreak; } },
          { t: 'Pagina vuota', se: function () { return G.modifica; }, f: function () { premi(tb().btnBlankPage); } },
          { t: 'Intestazioni e piè di pagina', se: function () { return G.modifica; }, oo: function () { return hf() && hf().btnsHeaderFooter; } },
          { t: 'Numeri di pagina', se: function () { return G.modifica; }, oo: function () { return hf() && hf().btnsPageNumber; } },
          { t: 'Data e ora', se: function () { return G.modifica; }, f: function () { premi(hf() && hf().btnsInsDateTime); } },
          '-',
          { t: 'Segnalibro', se: function () { return G.modifica; }, f: function () { premi(links() && links().btnBookmarks); } },
          { t: 'Indice', se: function () { return G.modifica; }, oo: function () { return links() && links().btnsContents; } },
          { t: 'Nota a piè di pagina', se: function () { return G.modifica; }, oo: function () { return links() && links().btnsNotes; } },
          { t: 'Capolettera', se: function () { return G.modifica; }, oo: function () { return tb().btnDropCap; } },
          { t: 'Filigrana', se: function () { return G.modifica; }, oo: function () { return tb().btnWatermark; } },
        ] },
        { t: 'Formato', se: function () { return G.modifica; }, voci: [
          { t: 'Testo', ico: 'testo', sub: [
            { t: 'Grassetto', k: 'Ctrl+B', f: function () { premi(tb().btnBold); } },
            { t: 'Corsivo', k: 'Ctrl+I', f: function () { premi(tb().btnItalic); } },
            { t: 'Sottolineato', k: 'Ctrl+U', f: function () { premi(tb().btnUnderline); } },
            { t: 'Barrato', k: 'Ctrl+5', f: function () { premi(tb().btnStrikeout); } },
            { t: 'Apice', k: 'Ctrl+,', f: function () { premi(tb().btnSuperscript); } },
            { t: 'Pedice', k: 'Ctrl+.', f: function () { premi(tb().btnSubscript); } },
            '-',
            { t: 'Aumenta dimensione', k: 'Ctrl+]', f: function () { premi(tb().btnIncFontSize); } },
            { t: 'Riduci dimensione', k: 'Ctrl+[', f: function () { premi(tb().btnDecFontSize); } },
            '-',
            { t: 'Maiuscole e minuscole', oo: function () { return tb().btnChangeCase; } },
          ] },
          { t: 'Stili di paragrafo', ico: 'paragrafo', sub: STILI.map(function (s) { return { t: s[1], f: function () { stile(s[0]); } }; }) },
          { t: 'Allinea e rientra', ico: 'sinistra', sub: [
            { t: 'A sinistra', ico: 'sinistra', k: 'Ctrl+L', f: function () { premi(tb().btnAlignLeft); } },
            { t: 'Al centro', ico: 'centro', k: 'Ctrl+E', f: function () { premi(tb().btnAlignCenter); } },
            { t: 'A destra', ico: 'adestra', k: 'Ctrl+R', f: function () { premi(tb().btnAlignRight); } },
            { t: 'Giustificato', ico: 'giustifica', k: 'Ctrl+J', f: function () { premi(tb().btnAlignJust); } },
            '-',
            { t: 'Aumenta rientro', k: 'Ctrl+M', f: function () { premi(tb().btnIncLeftOffset); } },
            { t: 'Riduci rientro', k: 'Ctrl+Shift+M', f: function () { premi(tb().btnDecLeftOffset); } },
          ] },
          { t: 'Interlinea e spaziatura', oo: function () { return tb().btnLineSpace; } },
          { t: 'Colonne', oo: function () { return tb().btnColumns; } },
          { t: 'Elenchi puntati e numerati', ico: 'elenco', sub: [
            { t: 'Elenco puntato', oo: function () { return tb().btnMarkers; } },
            { t: 'Elenco numerato', oo: function () { return tb().btnNumbers; } },
            { t: 'Elenco a più livelli', oo: function () { return tb().btnMultilevels; } },
          ] },
          '-',
          { t: 'Intestazioni e piè di pagina', oo: function () { return hf() && hf().btnsHeaderFooter; } },
          { t: 'Numeri di pagina', oo: function () { return hf() && hf().btnsPageNumber; } },
          { t: 'Orientamento pagina', sub: [
            { t: 'Verticale', f: function () { scegli(tb().btnPageOrient, true); } },
            { t: 'Orizzontale', f: function () { scegli(tb().btnPageOrient, false); } },
          ] },
          '-',
          { t: 'Bordi e ombreggiatura', oo: function () { return tb().btnBorders; } },
          { t: 'Colore di sfondo del paragrafo', oo: function () { return tb().btnParagraphColor; } },
          '-',
          { t: 'Cancella formattazione', ico: 'gomma', k: 'Ctrl+\\', f: function () { premi(tb().btnClearStyle); } },
        ] },
        { t: 'Strumenti', voci: [
          { t: 'Controllo ortografico', on: function () { return prova(function () { return Common.Utils.InternalSettings.get('de-settings-spellcheck'); }, true) !== false; },
            f: function () { prova(function () { var s = Common.Utils.InternalSettings.get('de-settings-spellcheck') !== false; Common.Utils.InternalSettings.set('de-settings-spellcheck', !s); Common.localStorage.setBool('de-settings-spellcheck', !s); G.api.asc_setSpellCheck(!s); }); } },
          { t: 'Conteggio parole', f: function () { prova(function () { c('Statusbar').statusbar.btnWordCount.trigger('click'); }) ; prova(function () { var b = c('Statusbar').statusbar.btnWordCount; premi(b); }); } },
          '-',
          { t: 'Revisioni', se: function () { return G.modifica && G.opz.canReview; }, sub: [
            { t: 'Rileva le modifiche', on: function () { return G.revisione(); }, f: function () { G.revisione(!G.revisione()); } },
            { t: 'Accetta la modifica', f: function () { premi(rev() && rev().btnAccept); } },
            { t: 'Rifiuta la modifica', f: function () { premi(rev() && rev().btnReject); } },
            { t: 'Modifica precedente', f: function () { premi(rev() && rev().btnPrev); } },
            { t: 'Modifica successiva', f: function () { premi(rev() && rev().btnNext); } },
          ] },
          { t: 'Confronta documenti', se: function () { return G.modifica; }, oo: function () { return rev() && rev().btnCompare; } },
          '-',
          { t: 'Sillabazione', se: function () { return G.modifica; }, oo: function () { return tb().btnHyphenation; } },
          { t: 'Numeri di riga', se: function () { return G.modifica; }, oo: function () { return tb().btnLineNumbers; } },
          '-',
          { t: 'Preferenze', ico: 'ingranaggio', f: function () { lm().leftMenu.showMenu('file:opts'); } },
        ] },
        { t: 'Guida', voci: vociGuida() },
      ].filter(function (m) { return vale(m.se, true) !== false; });
    }

    function barra(b) {
      var t = tb();
      var cerca = bottonePelle('cerca', 'Cerca nei menu (Alt+/)', cercaNeiMenu);
      cerca.id = 'hf-cerca-menu-bottone';
      b.appendChild(gruppo([cerca, sposta('slot-btn-undo'), sposta('slot-btn-redo'), stampa(), sposta('slot-btn-copystyle')], 'base'));
      tZoom = tendina('100%', '40px', zoomVoci, 'Zoom');
      b.appendChild(gruppo([tZoom], 'zoom'));
      if (!G.modifica) return;
      b.appendChild(sep());
      tStile = tendina('Testo normale', '96px', function () {
        return STILI.map(function (s) {
          return { t: s[1], f: function () { stile(s[0]); } };
        });
      }, 'Stili');
      b.appendChild(gruppo([tStile], 'stile'));
      b.appendChild(sep());
      b.appendChild(gruppo([sposta('slot-field-fontname')], 'font'));
      b.appendChild(sep());
      b.appendChild(gruppo([sposta('slot-btn-decfont'), sposta('slot-field-fontsize'), sposta('slot-btn-incfont')], 'dimensione'));
      b.appendChild(sep());
      b.appendChild(gruppo([sposta('slot-btn-bold'), sposta('slot-btn-italic'), sposta('slot-btn-underline'), sposta('slot-btn-fontcolor'), sposta('slot-btn-highlight')], 'carattere'));
      b.appendChild(sep());
      var lk = bottonePelle('link', 'Inserisci link (Ctrl+K)', inserisciLink);
      var cm = G.opz.canComments ? bottonePelle('commento', 'Aggiungi commento (Ctrl+Alt+M)', commento) : null;
      var im = bottonePelle('immagine', 'Inserisci immagine', function (x) { apriMenu([
        { t: 'Carica dal computer', f: immagine('file') },
        { t: 'Da un indirizzo web', f: immagine('url') },
      ], x, 0, 'sotto'); });
      b.appendChild(gruppo([lk, cm, im], 'inserisci'));
      b.appendChild(sep());
      bAllinea = cassetto('sinistra', 'Allinea', ['slot-btn-align-left', 'slot-btn-align-center', 'slot-btn-align-right', 'slot-btn-align-just']);
      b.appendChild(gruppo([bAllinea, sposta('slot-btn-linespace')], 'allinea'));
      b.appendChild(gruppo([sposta('slot-btn-markers'), sposta('slot-btn-numbering'), sposta('slot-btn-multilevels')], 'elenchi'));
      b.appendChild(gruppo([sposta('slot-btn-decoffset'), sposta('slot-btn-incoffset')], 'rientri'));
      b.appendChild(sep());
      b.appendChild(gruppo([sposta('slot-btn-clearstyle')], 'pulisci'));
      void t;
    }

    function coda() {
      if (!G.modifica || !G.opz.canReview) return null;
      var m = tendina('', '', function () {
        return [
          { t: 'Modifica', ico: 'matita', on: function () { return !G.revisione(); }, f: function () { G.revisione(false); } },
          { t: 'Suggerimento', ico: 'revisione', on: function () { return G.revisione(); }, f: function () { G.revisione(true); } },
        ];
      }, 'Modalità');
      m.id = 'hf-modalita';
      m.querySelector('.hf-etichetta').remove();
      m.insertAdjacentHTML('afterbegin', svg('matita'));
      var g = gruppo([el('div', { class: 'hf-spinta' }), m], 'modalita');
      g.style.marginLeft = 'auto';
      return g;
    }

    function dopo() {
      // Lo stile del paragrafo e lo zoom nella barra seguono il cursore.
      prova(function () {
        G.api.asc_registerCallback('asc_onParaStyleName', function (nome) {
          tStile && tStile.metti(NOMI_STILI[nome] || nome || 'Testo normale');
        });
        G.api.asc_registerCallback('asc_onZoomChange', function (z) { tZoom && tZoom.metti(Math.round(z) + '%'); });
        G.api.asc_registerCallback('asc_onPrAlign', function (a) {
          if (!bAllinea) return;
          var ico = { 0: 'adestra', 1: 'sinistra', 2: 'centro', 3: 'giustifica' }[a] || 'sinistra';
          bAllinea.innerHTML = svg(ico);
        });
      });
      // Niente barra di stato: zoom, parole e lingua stanno nei menu.
      senzaBarraDiStato();
      G.revisione = function (acceso) {
        if (acceso === undefined) return !!prova(function () { return G.api.asc_IsTrackRevisions(); }, false);
        prova(function () { G.api.asc_SetTrackRevisions(!!acceso); });
        var m = document.getElementById('hf-modalita');
        if (m) m.querySelector('svg').outerHTML = svg(acceso ? 'revisione' : 'matita');
      };
    }
    return { menu: menu, barra: barra, coda: coda, dopo: dopo };
  })();

  /* ================================================================== FOGLI */
  EDITOR.cell = (function () {
    var tZoom = null;
    function tb() { return G.tb; }
    function vt() { return prova(function () { return c('ViewTab').view; }); }
    function sb() { return prova(function () { return c('Statusbar').statusbar; }); }
    function spunta(nome) {
      return {
        on: function () { var v = vt(); return !!(v && v[nome] && v[nome].getValue()); },
        f: function () { var v = vt(); v && v[nome] && v[nome].setValue(!v[nome].getValue()); },
      };
    }
    function immagine(da) { return function () { scegli(tb().btnInsertImage, da); }; }
    function x(o, extra) { for (var k in extra) o[k] = extra[k]; return o; }

    function menu() {
      return [
        { t: 'File', voci: vociFile({
          scarica: [
            { t: 'Microsoft Excel (.xlsx)', f: scarica('XLSX') },
            { t: 'Foglio OpenDocument (.ods)', f: scarica('ODS') },
            { t: 'Documento PDF (.pdf)', f: scarica('PDF') },
            { t: 'Valori separati da virgola (.csv)', f: scarica('CSV') },
          ],
          dopo: [
            { t: 'Impostazione pagina', ico: 'pagina', se: voceSi(), sub: [
              { t: 'Orientamento', oo: function () { return tb().btnPageOrient; } },
              { t: 'Dimensioni pagina', oo: function () { return tb().btnPageSize; } },
              { t: 'Margini', oo: function () { return tb().btnPageMargins; } },
              { t: 'Adatta alla pagina', oo: function () { return tb().btnScale; } },
              { t: 'Area di stampa', oo: function () { return tb().btnPrintArea; } },
            ] },
          ],
        }) },
        { t: 'Modifica', voci: vociModifica([
          '-',
          { t: 'Elimina', se: voceSi(), sub: [
            { t: 'Righe selezionate', f: function () { scegli(tb().btnDeleteCell, 4); } },
            { t: 'Colonne selezionate', f: function () { scegli(tb().btnDeleteCell, 3); } },
            { t: 'Celle, spostando a sinistra', f: function () { scegli(tb().btnDeleteCell, 1); } },
            { t: 'Celle, spostando in alto', f: function () { scegli(tb().btnDeleteCell, 2); } },
          ] },
          { t: 'Cancella', se: voceSi(), oo: function () { return tb().btnClearStyle; } },
          { t: 'Riempi', se: voceSi(), oo: function () { return tb().btnFillNumbers; } },
        ]) },
        { t: 'Visualizza', voci: [
          x({ t: 'Barra della formula' }, spunta('chFormula')),
          x({ t: 'Griglia' }, spunta('chGridlines')),
          x({ t: 'Intestazioni di righe e colonne' }, spunta('chHeadings')),
          x({ t: 'Mostra gli zeri' }, spunta('chZeros')),
          '-',
          { t: 'Blocca', oo: function () { return vt() && vt().btnFreezePanes; } },
          '-',
          { t: 'Zoom', sub: zoomVoci },
        ] },
        { t: 'Inserisci', se: function () { return G.modifica; }, voci: [
          { t: 'Righe', sub: [
            { t: 'Inserisci righe sopra', f: function () { scegli(tb().btnAddCell, 4); } },
            { t: 'Inserisci celle, spostando in basso', f: function () { scegli(tb().btnAddCell, 2); } },
          ] },
          { t: 'Colonne', sub: [
            { t: 'Inserisci colonne a sinistra', f: function () { scegli(tb().btnAddCell, 3); } },
            { t: 'Inserisci celle, spostando a destra', f: function () { scegli(tb().btnAddCell, 1); } },
          ] },
          { t: 'Foglio', f: function () { premi(sb() && sb().btnAddWorksheet); } },
          '-',
          { t: 'Grafico', ico: 'grafico', oo: function () { return tb().btnInsertChart; } },
          { t: 'Tabella', ico: 'tabella', f: function () { premi(tb().btnInsertTable); } },
          { t: 'Immagine', ico: 'immagine', sub: [
            { t: 'Carica dal computer', f: immagine('file') },
            { t: 'Da un indirizzo web', f: immagine('url') },
          ] },
          { t: 'Disegno e forme', ico: 'forma', oo: function () { return tb().btnInsertShape; } },
          { t: 'Casella di testo', ico: 'testo', f: function () { scegli(tb().btnInsertText, 'textRect'); } },
          { t: 'Caratteri speciali', ico: 'omega', oo: function () { return tb().btnInsertSymbol; } },
          '-',
          { t: 'Funzione', oo: function () { return tb().btnInsertFormula; } },
          '-',
          { t: 'Link', ico: 'link', k: 'Ctrl+K', f: function () { premi(tb().btnInsertHyperlink); } },
          { t: 'Commento', ico: 'commento', se: function () { return G.opz.canComments; }, f: aggiungiCommento },
        ] },
        { t: 'Formato', se: function () { return G.modifica; }, voci: [
          { t: 'Numero', sub: [
            { t: 'Euro', f: function () { scegli(tb().btnCurrencyStyle, 1031) || premi(tb().btnCurrencyStyle); } },
            { t: 'Percentuale', f: function () { premi(tb().btnPercentStyle); } },
            { t: 'Separatore delle migliaia', f: function () { premi(tb().btnCommaStyle); } },
            '-',
            { t: 'Aumenta i decimali', f: function () { premi(tb().btnIncDecimal); } },
            { t: 'Riduci i decimali', f: function () { premi(tb().btnDecDecimal); } },
            '-',
            { t: 'Altri formati', f: function () { prova(function () { tb().cmbNumberFormat.openMenu(0); }); } },
          ] },
          { t: 'Testo', ico: 'testo', sub: [
            { t: 'Grassetto', k: 'Ctrl+B', f: function () { premi(tb().btnBold); } },
            { t: 'Corsivo', k: 'Ctrl+I', f: function () { premi(tb().btnItalic); } },
            { t: 'Sottolineato', k: 'Ctrl+U', f: function () { premi(tb().btnUnderline); } },
            { t: 'Barrato', k: 'Ctrl+5', f: function () { premi(tb().btnStrikeout); } },
            { t: 'Apice e pedice', oo: function () { return tb().btnSubscript; } },
          ] },
          { t: 'Allineamento', ico: 'sinistra', sub: [
            { t: 'A sinistra', ico: 'sinistra', f: function () { premi(tb().btnAlignLeft); } },
            { t: 'Al centro', ico: 'centro', f: function () { premi(tb().btnAlignCenter); } },
            { t: 'A destra', ico: 'adestra', f: function () { premi(tb().btnAlignRight); } },
            '-',
            { t: 'In alto', f: function () { premi(tb().btnAlignTop); } },
            { t: 'Al centro (verticale)', f: function () { premi(tb().btnAlignMiddle); } },
            { t: 'In basso', f: function () { premi(tb().btnAlignBottom); } },
          ] },
          { t: 'A capo automatico', f: function () { premi(tb().btnWrap); } },
          { t: 'Rotazione', oo: function () { return tb().btnTextOrient; } },
          '-',
          { t: 'Unisci celle', oo: function () { return tb().btnMerge; } },
          { t: 'Bordi', oo: function () { return tb().btnBorders; } },
          { t: 'Colore di riempimento', oo: function () { return tb().btnBackColor; } },
          { t: 'Formattazione condizionale', oo: function () { return tb().btnCondFormat; } },
          { t: 'Formatta come tabella', f: function () { premi(tb().btnTableTemplate); } },
          { t: 'Righe, colonne e fogli', oo: function () { return tb().btnFormatCell; } },
          '-',
          { t: 'Cancella formattazione', ico: 'gomma', f: function () { scegli(tb().btnClearStyle, 2); } },
        ] },
        { t: 'Dati', voci: [
          { t: 'Ordina dalla A alla Z', se: voceSi(), f: function () { premi(tb().btnsSortDown); } },
          { t: 'Ordina dalla Z alla A', se: voceSi(), f: function () { premi(tb().btnsSortUp); } },
          { t: 'Ordinamento personalizzato', se: voceSi(), f: function () { premi(tb().btnCustomSort); } },
          '-',
          { t: 'Crea un filtro', f: function () { premi(tb().btnsSetAutofilter); } },
          { t: 'Togli i filtri', f: function () { premi(tb().btnsClearAutofilter); } },
          '-',
          { t: 'Rimuovi duplicati', se: voceSi(), f: function () { premi(tb().btnsRemoveDuplicates); } },
          { t: 'Convalida dei dati', se: voceSi(), f: function () { premi(tb().btnDataValidation); } },
          { t: 'Intervalli denominati', se: voceSi(), oo: function () { return tb().btnNamedRange; } },
        ] },
        { t: 'Strumenti', voci: [
          { t: 'Preferenze', ico: 'ingranaggio', f: function () { lm().leftMenu.showMenu('file:opts'); } },
        ] },
        { t: 'Guida', voci: vociGuida() },
      ].filter(function (m) { return vale(m.se, true) !== false; });
    }

    function barra(b) {
      var cerca = bottonePelle('cerca', 'Cerca nei menu (Alt+/)', cercaNeiMenu);
      cerca.id = 'hf-cerca-menu-bottone';
      b.appendChild(gruppo([cerca, sposta('slot-btn-undo'), sposta('slot-btn-redo'), stampa(), sposta('slot-btn-copystyle')], 'base'));
      tZoom = tendina('100%', '40px', zoomVoci, 'Zoom');
      b.appendChild(gruppo([tZoom], 'zoom'));
      if (!G.modifica) return;
      b.appendChild(sep());
      b.appendChild(gruppo([sposta('slot-btn-currency'), sposta('slot-btn-percents'), sposta('slot-btn-digit-dec'), sposta('slot-btn-digit-inc'), sposta('slot-btn-format')], 'numeri'));
      b.appendChild(sep());
      b.appendChild(gruppo([sposta('slot-field-fontname')], 'font'));
      b.appendChild(sep());
      b.appendChild(gruppo([sposta('slot-btn-decfont'), sposta('slot-field-fontsize'), sposta('slot-btn-incfont')], 'dimensione'));
      b.appendChild(sep());
      b.appendChild(gruppo([sposta('slot-btn-bold'), sposta('slot-btn-italic'), sposta('slot-btn-strikeout'), sposta('slot-btn-fontcolor')], 'carattere'));
      b.appendChild(sep());
      b.appendChild(gruppo([sposta('slot-btn-fillparag'), sposta('slot-btn-borders'), sposta('slot-btn-merge')], 'celle'));
      b.appendChild(sep());
      var oriz = cassetto('sinistra', 'Allineamento orizzontale', ['slot-btn-align-left', 'slot-btn-align-center', 'slot-btn-align-right', 'slot-btn-align-just']);
      var vert = cassetto('verticale', 'Allineamento verticale', ['slot-btn-top', 'slot-btn-middle', 'slot-btn-bottom']);
      b.appendChild(gruppo([oriz, vert, sposta('slot-btn-wrap'), sposta('slot-btn-text-orient')], 'allinea'));
      b.appendChild(sep());
      var lk = bottonePelle('link', 'Inserisci link (Ctrl+K)', function () { premi(tb().btnInsertHyperlink); });
      var cm = G.opz.canComments ? bottonePelle('commento', 'Aggiungi commento', aggiungiCommento) : null;
      var gr = bottonePelle('grafico', 'Inserisci grafico', function (x) { apriMenuDi(tb().btnInsertChart, x, 'tl-bl'); });
      var filtro = prova(function () { return tb().btnsSetAutofilter[0].$el.closest('[id^=slot-],.btn-slot')[0]; });
      b.appendChild(gruppo([lk, cm, gr, filtro ? sposta(filtro) : null, sposta('slot-btn-formula')], 'inserisci'));
    }

    function dopo() {
      prova(function () {
        G.api.asc_registerCallback('asc_onZoomChanged', function (z) { tZoom && tZoom.metti(Math.round(z * 100) + '%'); });
        tZoom && tZoom.metti(Math.round(G.api.asc_getZoom() * 100) + '%');
      });
    }
    return { menu: menu, barra: barra, dopo: dopo };
  })();

  /* ================================================================== PRESENTAZIONI */
  EDITOR.slide = (function () {
    var tZoom = null;
    function tb() { return G.tb; }
    function vt() { return prova(function () { return c('ViewTab').view; }); }
    function immagine(da) { return function () { scegli(tb().btnsInsertImage, da); }; }
    function forma() { return prova(function () { var x = tb().cmbsInsertShape; return Array.isArray(x) ? x[0] : x; }); }
    function avvia(da) { return function () { scegli(tb().btnPreview, da) || premi(tb().btnPreview); }; }
    function api() { return G.api; }
    function nuovaDiapositiva() { premi(tb().btnAddSlide); }

    function menu() {
      return [
        { t: 'File', voci: vociFile({
          scarica: [
            { t: 'Microsoft PowerPoint (.pptx)', f: scarica('PPTX') },
            { t: 'Presentazione OpenDocument (.odp)', f: scarica('ODP') },
            { t: 'Documento PDF (.pdf)', f: scarica('PDF') },
            { t: 'Immagine PNG (.png)', f: scarica('PNG') },
            { t: 'Immagine JPEG (.jpg)', f: scarica('JPG') },
          ],
          dopo: [
            { t: 'Dimensioni della diapositiva', ico: 'pagina', se: voceSi(), oo: function () { return tb().btnSlideSize; } },
          ],
        }) },
        { t: 'Modifica', voci: vociModifica() },
        { t: 'Visualizza', voci: [
          { t: 'Presentazione', sub: [
            { t: 'Dall’inizio', k: 'Ctrl+F5', f: avvia(0) },
            { t: 'Da questa diapositiva', f: avvia(1) },
            { t: 'Con la vista del relatore', f: avvia(2) },
          ] },
          '-',
          { t: 'Note del relatore', on: function () { var v = vt(); return !!(v && v.chNotes && v.chNotes.getValue()); },
            se: function () { var v = vt(); return !!(v && v.chNotes); },
            f: function () { var v = vt(); v.chNotes.setValue(!v.chNotes.getValue()); } },
          { t: 'Righelli', on: function () { var v = vt(); return !!(v && v.chRulers && v.chRulers.getValue()); },
            se: function () { var v = vt(); return !!(v && v.chRulers); },
            f: function () { var v = vt(); v.chRulers.setValue(!v.chRulers.getValue()); } },
          '-',
          { t: 'Zoom', sub: zoomVoci },
        ] },
        { t: 'Inserisci', se: function () { return G.modifica; }, voci: [
          { t: 'Immagine', ico: 'immagine', sub: [
            { t: 'Carica dal computer', f: immagine('file') },
            { t: 'Da un indirizzo web', f: immagine('url') },
          ] },
          { t: 'Casella di testo', ico: 'testo', f: function () { premi(tb().btnsInsertText); } },
          { t: 'Forma', ico: 'forma', oo: forma },
          { t: 'Tabella', ico: 'tabella', oo: function () { return tb().btnInsertTable; } },
          { t: 'Grafico', ico: 'grafico', oo: function () { return tb().btnInsertChart; } },
          { t: 'Text Art', oo: function () { return tb().btnInsertTextArt; } },
          { t: 'Caratteri speciali', ico: 'omega', oo: function () { return tb().btnInsertSymbol; } },
          { t: 'Equazione', f: function () { premi(tb().btnInsertEquation); } },
          '-',
          { t: 'Link', ico: 'link', k: 'Ctrl+K', f: function () { premi(tb().btnInsertHyperlink); } },
          { t: 'Commento', ico: 'commento', se: function () { return G.opz.canComments; }, f: aggiungiCommento },
          '-',
          { t: 'Nuova diapositiva', k: 'Ctrl+M', f: nuovaDiapositiva },
          { t: 'Numeri delle diapositive', f: function () { premi(tb().btnInsSlideNum); } },
          { t: 'Data e ora', f: function () { premi(tb().btnInsDateTime); } },
          { t: 'Intestazione e piè di pagina', f: function () { premi(tb().btnEditHeader); } },
        ] },
        { t: 'Formato', se: function () { return G.modifica; }, voci: [
          { t: 'Testo', ico: 'testo', sub: [
            { t: 'Grassetto', k: 'Ctrl+B', f: function () { premi(tb().btnBold); } },
            { t: 'Corsivo', k: 'Ctrl+I', f: function () { premi(tb().btnItalic); } },
            { t: 'Sottolineato', k: 'Ctrl+U', f: function () { premi(tb().btnUnderline); } },
            { t: 'Barrato', f: function () { premi(tb().btnStrikeout); } },
            '-',
            { t: 'Aumenta dimensione', k: 'Ctrl+]', f: function () { premi(tb().btnIncFontSize); } },
            { t: 'Riduci dimensione', k: 'Ctrl+[', f: function () { premi(tb().btnDecFontSize); } },
          ] },
          { t: 'Allinea e rientra', ico: 'sinistra', sub: [
            { t: 'Allineamento orizzontale', oo: function () { return tb().btnHorizontalAlign; } },
            { t: 'Allineamento verticale', oo: function () { return tb().btnVerticalAlign; } },
            '-',
            { t: 'Aumenta rientro', f: function () { premi(tb().btnIncLeftOffset); } },
            { t: 'Riduci rientro', f: function () { premi(tb().btnDecLeftOffset); } },
          ] },
          { t: 'Interlinea', oo: function () { return tb().btnLineSpace; } },
          { t: 'Colonne', oo: function () { return tb().btnColumns; } },
          { t: 'Elenchi puntati e numerati', ico: 'elenco', sub: [
            { t: 'Elenco puntato', oo: function () { return tb().btnMarkers; } },
            { t: 'Elenco numerato', oo: function () { return tb().btnNumbers; } },
          ] },
          '-',
          { t: 'Cancella formattazione', ico: 'gomma', f: function () { premi(tb().btnClearStyle); } },
        ] },
        { t: 'Diapositiva', se: function () { return G.modifica; }, voci: [
          { t: 'Nuova diapositiva', k: 'Ctrl+M', f: nuovaDiapositiva },
          { t: 'Duplica diapositiva', f: function () { scegli(tb().btnAddSlide, 'duplicate') || prova(function () { api().DublicateSlide(); }); } },
          { t: 'Elimina diapositiva', f: function () { prova(function () { api().DeleteSlide(); }); } },
          '-',
          { t: 'Cambia layout', oo: function () { return tb().btnChangeSlide; } },
          { t: 'Dimensioni', oo: function () { return tb().btnSlideSize; } },
        ] },
        { t: 'Disponi', se: function () { return G.modifica; }, voci: [
          { t: 'Ordina', oo: function () { return tb().btnShapeArrange; } },
          { t: 'Allinea', oo: function () { return tb().btnShapeAlign; } },
        ] },
        { t: 'Strumenti', voci: [
          { t: 'Preferenze', ico: 'ingranaggio', f: function () { lm().leftMenu.showMenu('file:opts'); } },
        ] },
        { t: 'Guida', voci: vociGuida() },
      ].filter(function (m) { return vale(m.se, true) !== false; });
    }

    function barra(b) {
      var cerca = bottonePelle('cerca', 'Cerca nei menu (Alt+/)', cercaNeiMenu);
      cerca.id = 'hf-cerca-menu-bottone';
      // «Nuova diapositiva» come nella barra degli editor web: il «+» la aggiunge, la
      // freccina accanto apre i layout di ONLYOFFICE.
      var piu = G.modifica ? bottonePelle('piu', 'Nuova diapositiva (Ctrl+M)', nuovaDiapositiva) : null;
      var layout = G.modifica ? bottonePelle('giu', 'Nuova diapositiva con un layout', function (x) { apriMenuDi(tb().btnAddSlide, x, 'tl-bl'); }, 'hf-freccina') : null;
      b.appendChild(gruppo([cerca, piu, layout, sposta('slot-btn-undo'), sposta('slot-btn-redo'), stampa(), sposta('slot-btn-copystyle')], 'base'));
      tZoom = tendina('Adatta', '48px', zoomVoci, 'Zoom');
      b.appendChild(gruppo([tZoom], 'zoom'));
      if (!G.modifica) return;
      b.appendChild(sep());
      var im = bottonePelle('immagine', 'Inserisci immagine', function (x) { apriMenu([
        { t: 'Carica dal computer', f: immagine('file') },
        { t: 'Da un indirizzo web', f: immagine('url') },
      ], x, 0, 'sotto'); });
      var fo = bottonePelle('forma', 'Forma', function (x) { apriMenuDi(forma(), x, 'tl-bl'); });
      var tx = bottonePelle('testo', 'Casella di testo', function () { premi(tb().btnsInsertText); });
      b.appendChild(gruppo([tx, im, fo], 'inserisci'));
      b.appendChild(sep());
      var cm = G.opz.canComments ? bottonePelle('commento', 'Aggiungi commento', aggiungiCommento) : null;
      b.appendChild(gruppo([cm, sposta('slot-changeslide')], 'diapositiva'));
      b.appendChild(sep());
      b.appendChild(gruppo([sposta('slot-field-fontname')], 'font'));
      b.appendChild(sep());
      b.appendChild(gruppo([sposta('slot-btn-decfont'), sposta('slot-field-fontsize'), sposta('slot-btn-incfont')], 'dimensione'));
      b.appendChild(sep());
      b.appendChild(gruppo([sposta('slot-btn-bold'), sposta('slot-btn-italic'), sposta('slot-btn-underline'), sposta('slot-btn-fontcolor'), sposta('slot-btn-highlight')], 'carattere'));
      b.appendChild(sep());
      b.appendChild(gruppo([sposta('slot-btn-halign'), sposta('slot-btn-valign'), sposta('slot-btn-linespace')], 'allinea'));
      b.appendChild(gruppo([sposta('slot-btn-markers'), sposta('slot-btn-numbering'), sposta('slot-btn-decoffset'), sposta('slot-btn-incoffset')], 'elenchi'));
      b.appendChild(sep());
      b.appendChild(gruppo([sposta('slot-btn-clearstyle')], 'pulisci'));
    }

    function testa() {
      var b = el('button', { type: 'button', class: 'hf-presenta', title: 'Avvia la presentazione' },
        svg('presenta') + '<span>Presentazione</span>');
      b.addEventListener('click', avvia(0));
      return b;
    }

    function dopo() {
      senzaBarraDiStato();
      prova(function () {
        G.api.asc_registerCallback('asc_onZoomChange', function (z, tipo) {
          tZoom && tZoom.metti(tipo === 2 ? 'Adatta' : Math.round(z) + '%');
        });
      });
    }
    return { menu: menu, barra: barra, dopo: dopo, testa: testa };
  })();

  quandoPronto();
})();
