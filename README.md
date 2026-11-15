# Documenti di HyFile

È la pelle che HyFile mette sopra ONLYOFFICE Docs Community Edition. Nell'editor di
documenti, fogli e presentazioni aggiunge:

- in alto, l'icona, il titolo e i menu: File, Modifica, Visualizza, Inserisci, Formato,
  Strumenti, Guida;
- una sola barra con i comandi di tutti i giorni.

È il codice sorgente della modifica, pubblicato come chiede la licenza di ONLYOFFICE.
Nell'editor ci si arriva da **Guida > Informazioni legali**.

## Cosa c'è

| File | A cosa serve |
| --- | --- |
| `innesta.sh` | Fa partire il contenitore. A ogni avvio aggiunge ai tre editor una riga che carica la pelle, con una nota che dice che la pagina è modificata. Poi avvia ONLYOFFICE come sempre. |
| `web/pelle.css` | I colori, la testata, la barra, i menu. |
| `web/pelle.js` | Costruisce la testata e la barra. Sposta lì i bottoni veri di ONLYOFFICE, così tengono stato e menu. Collega le voci dei menu ai comandi di ONLYOFFICE. |
| `LICENSE` | La GNU Affero General Public License v3. |

ONLYOFFICE non è ricompilato e i suoi file restano com'erano: cambia solo la riga aggiunta
agli `index.html` dei tre editor. La pelle sta in una cartella montata in sola lettura in
`web-apps/apps/common/main/resources/pelle-hyfile/`. Se una versione nuova di ONLYOFFICE
cambia il nome di un comando, la voce del menu che lo usava sparisce. L'editor continua a
funzionare.

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
