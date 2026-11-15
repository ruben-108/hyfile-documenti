# Documenti di HyFile

È la pelle che HyFile mette sopra ONLYOFFICE Docs Community Edition. Nell'editor di
documenti, fogli e presentazioni aggiunge:

- in alto, l'icona, il titolo e i menu: File, Modifica, Visualizza, Inserisci, Formato,
  Strumenti, Guida; a destra le facce di chi c'è, cronologia, commenti, Condividi e un
  posto vuoto che riempie la pagina che ospita l'editor;
- una sola barra con i comandi di tutti i giorni, che il «⌃» in fondo può ridurre;
- uno scheletro di caricamento con le stesse misure, così mentre l'editor si apre non si
  vede mai la sua interfaccia di prima;
- la cronologia delle versioni in un pannello a destra, il conteggio delle parole, e menu,
  dialoghi e colori ridisegnati nello stesso stile.
- i commenti come schede accanto al foglio, con il pannello «Tutti i commenti».

È il codice sorgente della modifica, pubblicato come chiede la licenza di ONLYOFFICE.
Nell'editor ci si arriva da **Guida > Informazioni legali**.

## Cosa c'è

| File | A cosa serve |
| --- | --- |
| `innesta.sh` | Fa partire il contenitore. A ogni avvio aggiunge ai tre editor una riga che carica la pelle, con una nota che dice che la pagina è modificata. Poi avvia ONLYOFFICE come sempre. |
| `web/pelle.css` | I colori, la testata, la barra, i menu. |
| `web/pelle.js` | Tiene lo scheletro finché la pelle non è pronta. Costruisce la testata e la barra. Sposta lì i bottoni veri di ONLYOFFICE, così tengono stato e menu. Collega le voci dei menu ai comandi di ONLYOFFICE. Parla con la pagina che ospita l'editor (vedi sotto). |
| `web/commenti.css`, `web/commenti.js` | I commenti: nei documenti ogni discussione è una scheda accanto al foglio, all'altezza del testo; nei fogli e nelle presentazioni la scheda si apre sulla cella o sull'oggetto. Il pannello «Tutti i commenti» coi filtri e la tendina delle persone con «@». Usano il controllore dei commenti di ONLYOFFICE: i dati e i gesti sono i suoi. |
| `LICENSE` | La GNU Affero General Public License v3. |

ONLYOFFICE non è ricompilato e i suoi file restano com'erano: cambia solo la riga aggiunta
agli `index.html` dei tre editor. La pelle sta in una cartella montata in sola lettura in
`web-apps/apps/common/main/resources/pelle-hyfile/`. Se una versione nuova di ONLYOFFICE
cambia il nome di un comando, la voce del menu che lo usava sparisce. L'editor continua a
funzionare.

## Con la pagina che ospita l'editor

L'editor gira in un iframe. La pelle e la pagina si parlano con `postMessage`; la pelle
accetta solo i messaggi della finestra che la contiene.

| Da | Messaggio | Cosa vuol dire |
| --- | --- | --- |
| pelle | `{hyfile: 'pelle', tipo: 'pronta'}` | La testata vera è disegnata. |
| pelle | `{hyfile: 'pelle', tipo: 'posto', x, y, larghezza, altezza}` | Il rettangolo vuoto in alto a destra, in px della finestra dell'editor. Arriva a ogni cambio di misura. Con i menu nascosti è tutto a zero. |
| pelle | `{hyfile: 'pelle', tipo: 'copia-link'}` | «Copia link» dalla freccina di Condividi: il link lo copia la pagina. |
| pagina | `{hyfile: 'pagina', tipo: 'posto', larghezza}` | Quanto spazio serve alla pagina (di serie 124). |
| pagina | `{hyfile: 'pagina', tipo: 'chiedi-posto'}` | La pelle rimanda il rettangolo. |
| pagina | `{hyfile: 'pagina', tipo: 'luogo', testo}` | Dove si salva: «Salvato sul LaCie» invece di «Salvato in HyFile». |

## Come si monta

```sh
docker run -d --name editor \
  -v "$PWD/web:/var/www/onlyoffice/documentserver/web-apps/apps/common/main/resources/pelle-hyfile:ro" \
  -v "$PWD/innesta.sh:/usr/local/bin/pelle-hyfile-innesta.sh:ro" \
  --entrypoint /usr/local/bin/pelle-hyfile-innesta.sh \
  onlyoffice/documentserver:10.0.0.1
```

Provata con ONLYOFFICE Docs 10.0.0.1.

## Licenza e marchi

- **ONLYOFFICE Docs** è © Ascensio System SIA, software libero con licenza GNU AGPL v3 e
  termini aggiuntivi. Codice sorgente: https://github.com/ONLYOFFICE/DocumentServer.
  Questa è una versione modificata, dal 15 novembre 2026. Il nome e il marchio ONLYOFFICE
  restano dei loro proprietari: qui non si usano come marchio.
- **La pelle** (questa cartella) è © 2026 Ruben Leo, con la stessa licenza: GNU AGPL v3.
  Viene distribuita senza alcuna garanzia.
- Le icone della pelle sono disegnate per HyFile, o prese da Material Symbols (Apache 2.0).
