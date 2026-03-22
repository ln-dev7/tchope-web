#!/bin/bash

# =============================================================================
# sync-mobile.sh
# Synchronise les constantes, données et types depuis l'app mobile (tchope)
# vers le projet web (tchope-web).
# L'app mobile est la source de vérité.
# =============================================================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Répertoires
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEB_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MOBILE_DIR="$(cd "$WEB_DIR/../tchope" 2>/dev/null && pwd)" || true

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Tchopé — Sync depuis l'app mobile          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""

# --------------------------------------------------
# Vérification : les deux projets sont dans le même dossier
# --------------------------------------------------
if [ -z "$MOBILE_DIR" ] || [ ! -d "$MOBILE_DIR" ]; then
  echo -e "${RED}❌ Erreur : le projet mobile 'tchope' est introuvable.${NC}"
  echo -e "${RED}   Les projets 'tchope' et 'tchope-web' doivent être dans le même dossier parent.${NC}"
  echo -e "${RED}   Chemin attendu : $(dirname "$WEB_DIR")/tchope${NC}"
  exit 1
fi

if [ ! -f "$MOBILE_DIR/package.json" ]; then
  echo -e "${RED}❌ Erreur : le dossier '$(dirname "$WEB_DIR")/tchope' ne contient pas de package.json.${NC}"
  echo -e "${RED}   Vérifiez que c'est bien le projet de l'app mobile Tchopé.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Projet mobile trouvé :${NC} $MOBILE_DIR"
echo -e "${GREEN}✓ Projet web :${NC} $WEB_DIR"
echo ""

# Compteur de fichiers synchronisés
COUNT=0

# --------------------------------------------------
# Fonction utilitaire : copier un fichier avec log
# --------------------------------------------------
sync_file() {
  local src="$1"
  local dest="$2"
  local label="$3"

  if [ ! -f "$src" ]; then
    echo -e "  ${YELLOW}⚠ Ignoré (introuvable) :${NC} $label"
    return
  fi

  mkdir -p "$(dirname "$dest")"
  cp "$src" "$dest"
  COUNT=$((COUNT + 1))
  echo -e "  ${GREEN}✓${NC} $label"
}

# --------------------------------------------------
# 1. Types
# --------------------------------------------------
echo -e "${CYAN}▸ Synchronisation des types...${NC}"
sync_file "$MOBILE_DIR/types/index.ts" "$WEB_DIR/types/recipe.ts" "types/index.ts → types/recipe.ts"

# Corriger les imports : le web utilise @/types/recipe au lieu de @/types
# Le fichier types n'a pas d'imports à corriger.
echo ""

# --------------------------------------------------
# 2. Constantes
# --------------------------------------------------
echo -e "${CYAN}▸ Synchronisation des constantes...${NC}"

for FILE in "$MOBILE_DIR"/constants/*.ts; do
  BASENAME="$(basename "$FILE")"
  sync_file "$FILE" "$WEB_DIR/constants/$BASENAME" "constants/$BASENAME"
done

# Corriger l'import dans images.ts : @/types → @/types/recipe
if [ -f "$WEB_DIR/constants/images.ts" ]; then
  sed -i '' "s|from '@/types'|from '@/types/recipe'|g" "$WEB_DIR/constants/images.ts" 2>/dev/null || \
  sed -i "s|from '@/types'|from '@/types/recipe'|g" "$WEB_DIR/constants/images.ts" 2>/dev/null || true
fi

echo ""

# --------------------------------------------------
# 3. Données (recipes)
# --------------------------------------------------
echo -e "${CYAN}▸ Synchronisation des données...${NC}"

for FILE in "$MOBILE_DIR"/data/*.ts; do
  BASENAME="$(basename "$FILE")"
  sync_file "$FILE" "$WEB_DIR/data/$BASENAME" "data/$BASENAME"
done

# Corriger l'import dans recipes.ts : ../types → @/types/recipe
if [ -f "$WEB_DIR/data/recipes.ts" ]; then
  sed -i '' "s|from '../types'|from '@/types/recipe'|g" "$WEB_DIR/data/recipes.ts" 2>/dev/null || \
  sed -i "s|from '../types'|from '@/types/recipe'|g" "$WEB_DIR/data/recipes.ts" 2>/dev/null || true
fi

echo ""

# --------------------------------------------------
# 4. Traductions app (constants/translations.ts)
#    → copiées dans constants/translations.ts (pour /[lang]/app/**)
#    Les traductions de la landing page (lib/i18n.ts) ne sont PAS touchées.
# --------------------------------------------------
echo -e "${CYAN}▸ Traductions...${NC}"
echo -e "  ${GREEN}✓${NC} constants/translations.ts (app mobile → app web, déjà copié ci-dessus)"
echo -e "  ${YELLOW}ℹ${NC} lib/i18n.ts (landing page) n'est PAS modifié — ce fichier est propre au web."
echo ""

# --------------------------------------------------
# 5. Vérification TypeScript
# --------------------------------------------------
echo -e "${CYAN}▸ Vérification des types...${NC}"
cd "$WEB_DIR"
if npx tsc --noEmit 2>/dev/null; then
  echo -e "  ${GREEN}✓ Aucune erreur TypeScript${NC}"
else
  echo -e "  ${YELLOW}⚠ Des erreurs TypeScript ont été détectées. Lancez 'pnpm typecheck' pour les détails.${NC}"
fi

echo ""
echo -e "${GREEN}══════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Synchronisation terminée — $COUNT fichier(s) copié(s).${NC}"
echo -e "${GREEN}══════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${CYAN}Rappel :${NC}"
echo -e "  • ${CYAN}constants/translations.ts${NC} → traductions de l'app (/[lang]/app/**)"
echo -e "  • ${CYAN}lib/i18n.ts${NC} → traductions de la landing page (non touchées)"
echo ""
