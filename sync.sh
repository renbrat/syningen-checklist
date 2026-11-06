#!/bin/bash
# Sender alt nytt i denne mappen til GitHub, og henter det andre har lagt inn.
# Bruk:  ./sync.sh                  (automatisk melding med dato)
#        ./sync.sh "Ny vaskeliste"  (egen melding)
set -e
cd "$(dirname "$0")"

echo "Henter siste fra GitHub ..."
git pull --rebase --autostash

git add -A
if git diff --cached --quiet; then
  echo "Ingenting nytt å sende."
else
  git status --short
  git commit -q -m "${1:-Oppdatert $(date '+%Y-%m-%d %H:%M')}"
  echo "Sender til GitHub ..."
  git push
  echo "Ferdig."
fi
