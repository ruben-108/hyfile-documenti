#!/bin/bash
# La pelle di HyFile sopra ONLYOFFICE Docs (SPEC §19.5). Gira come punto d'ingresso del
# contenitore: aggiunge ai tre editor (documenti, fogli, presentazioni) una riga che
# carica pelle.css e pelle.js (e dopo di loro commenti.css e commenti.js, le schede dei
# commenti, SPEC §19.7, e telefono.css e telefono.js, la pelle per il telefono, SPEC
# §19.11), poi passa la mano all'avvio di sempre di ONLYOFFICE.
#
# Perché così e non con una copia degli index.html: a ogni immagine nuova di ONLYOFFICE
# gli index.html cambiano, la riga si rimette da sola. Rilanciarlo non raddoppia niente
# (il segno «pelle-hyfile» dice che c'è già). Il «?v=» cambia quando cambia la pelle,
# così i browser non tengono quella vecchia.
set -u
WEB=/var/www/onlyoffice/documentserver/web-apps/apps
PELLE=$WEB/common/main/resources/pelle-hyfile
if [ -f "$PELLE/pelle.js" ]; then
  # L'impronta conta tutti i file della pelle: cambia uno, cambia il «?v=».
  V=$(cat "$PELLE"/pelle.css "$PELLE"/pelle.js "$PELLE"/commenti.css "$PELLE"/commenti.js "$PELLE"/telefono.css "$PELLE"/telefono.js 2>/dev/null | md5sum | cut -c1-10)
  R=../../common/main/resources/pelle-hyfile
  for ED in documenteditor spreadsheeteditor presentationeditor; do
    F=$WEB/$ED/main/index.html
    [ -f "$F" ] || continue
    sed -i '/pelle-hyfile/d' "$F"
    # La nota della modifica (licenza di ONLYOFFICE, termini aggiuntivi 1-3): chi apre la
    # pagina vede che è stata cambiata, quando, e che il programma è di Ascensio System SIA.
    NOTA="<!-- pelle-hyfile: pagina modificata da HyFile (dal 15/11/2026, avvio $(date +%d/%m/%Y)) - basata su ONLYOFFICE Docs di Ascensio System SIA, AGPL v3. Codice della modifica: https://github.com/ruben-108/hyfile-documenti -->"
    RIGA="$NOTA<link rel=\"stylesheet\" href=\"$R/pelle.css?v=$V\" data-pelle-hyfile><script src=\"$R/pelle.js?v=$V\" data-pelle-hyfile defer></script>"
    # I commenti dopo la pelle (stesso ordine per i fogli di stile e per i programmi).
    if [ -f "$PELLE/commenti.js" ]; then
      RIGA="$RIGA<link rel=\"stylesheet\" href=\"$R/commenti.css?v=$V\" data-pelle-hyfile><script src=\"$R/commenti.js?v=$V\" data-pelle-hyfile defer></script>"
    fi
    # Il telefono (1.36.0) dopo tutti: usa gli attrezzi di pelle.js e sta sopra ai commenti.
    if [ -f "$PELLE/telefono.js" ]; then
      RIGA="$RIGA<link rel=\"stylesheet\" href=\"$R/telefono.css?v=$V\" data-pelle-hyfile><script src=\"$R/telefono.js?v=$V\" data-pelle-hyfile defer></script>"
    fi
    sed -i "s#</head>#$RIGA\n</head>#" "$F"
    # ONLYOFFICE comprime le pagine (index.html.gz) solo al primo avvio, e nginx serve
    # quella compressa: dopo un riavvio con la pelle cambiata il browser avrebbe ancora la
    # riga vecchia (il «?v=» di prima, senza i file nuovi). Si rifà accanto alla pagina.
    if [ -f "$F.gz" ]; then gzip -9 -c "$F" > "$F.gz"; fi
  done
  echo "pelle-hyfile: innestata ($V)"
else
  echo "pelle-hyfile: manca, parto senza"
fi
exec /app/ds/run-document-server.sh "$@"
