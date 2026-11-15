#!/bin/bash
# La pelle di HyFile sopra ONLYOFFICE Docs (SPEC §19.5). Gira come punto d'ingresso del
# contenitore: aggiunge ai tre editor (documenti, fogli, presentazioni) una riga che
# carica pelle.css e pelle.js, poi passa la mano all'avvio di sempre di ONLYOFFICE.
#
# Perché così e non con una copia degli index.html: a ogni immagine nuova di ONLYOFFICE
# gli index.html cambiano, la riga si rimette da sola. Rilanciarlo non raddoppia niente
# (il segno «pelle-hyfile» dice che c'è già). Il «?v=» cambia quando cambia la pelle,
# così i browser non tengono quella vecchia.
set -u
WEB=/var/www/onlyoffice/documentserver/web-apps/apps
PELLE=$WEB/common/main/resources/pelle-hyfile
if [ -f "$PELLE/pelle.js" ]; then
  V=$(cat "$PELLE"/pelle.css "$PELLE"/pelle.js | md5sum | cut -c1-10)
  for ED in documenteditor spreadsheeteditor presentationeditor; do
    F=$WEB/$ED/main/index.html
    [ -f "$F" ] || continue
    sed -i '/pelle-hyfile/d' "$F"
    # La nota della modifica (licenza di ONLYOFFICE, termini aggiuntivi 1-3): chi apre la
    # pagina vede che è stata cambiata, quando, e che il programma è di Ascensio System SIA.
    NOTA="<!-- pelle-hyfile: pagina modificata da HyFile (dal 15/11/2026, avvio $(date +%d/%m/%Y)) - basata su ONLYOFFICE Docs di Ascensio System SIA, AGPL v3. Codice della modifica: https://github.com/ruben-108/hyfile-documenti -->"
    RIGA="$NOTA<link rel=\"stylesheet\" href=\"../../common/main/resources/pelle-hyfile/pelle.css?v=$V\" data-pelle-hyfile><script src=\"../../common/main/resources/pelle-hyfile/pelle.js?v=$V\" data-pelle-hyfile defer></script>"
    sed -i "s#</head>#$RIGA\n</head>#" "$F"
  done
  echo "pelle-hyfile: innestata ($V)"
else
  echo "pelle-hyfile: manca, parto senza"
fi
exec /app/ds/run-document-server.sh "$@"
