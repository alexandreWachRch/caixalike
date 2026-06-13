#!/usr/bin/env bash
# =============================================================
# CaixaLike — Atualizar Repositório Existente no GitHub
# Repositório: alexandreWachRch/caixalike
#
# USO:
#   1. Baixe e extraia o caixalike.zip
#   2. Coloque este script DENTRO da pasta caixalike/
#   3. Execute: bash atualizar_repo.sh
# =============================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

success() { echo -e "${GREEN}✅ $*${RESET}"; }
info()    { echo -e "${CYAN}ℹ  $*${RESET}"; }
warn()    { echo -e "${YELLOW}⚠  $*${RESET}"; }
error()   { echo -e "${RED}❌ $*${RESET}"; exit 1; }

clear
echo -e "${BOLD}"
cat << 'EOF'
  ____      _          _     _ _
 / ___|__ _(_)_  ____ | |   (_) | ___
| |   / _` | \ \/ / _` | |   | | |/ _ \
| |__| (_| | |>  < (_| | |___| | |  __/
 \____\__,_|_/_/\_\__,_|_____|_|_|\___|

  Atualizando repositório existente...
EOF
echo -e "${RESET}"

REPO_URL="https://github.com/alexandreWachRch/caixalike.git"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ——— Verificações ———
command -v git    &>/dev/null || error "git não instalado."
command -v python3 &>/dev/null || error "python3 não instalado."

# ——— Confirmar que estamos na pasta certa ———
[[ -f "$SCRIPT_DIR/index.html" ]] || error "Execute este script de DENTRO da pasta caixalike/"
[[ -f "$SCRIPT_DIR/js/pagamentos.js" ]] || error "Arquivo js/pagamentos.js não encontrado."

echo -e "${BOLD}━━━ Passo 1 — Clonar repositório atual ━━━${RESET}\n"

TEMP_DIR=$(mktemp -d)
info "Clonando $REPO_URL …"
git clone "$REPO_URL" "$TEMP_DIR/repo" || error "Falha ao clonar. Verifique sua conexão e permissões."
success "Repositório clonado em $TEMP_DIR/repo"

echo -e "\n${BOLD}━━━ Passo 2 — Copiar novos arquivos ━━━${RESET}\n"

# Copia tudo do novo projeto para o repo clonado, preservando o .git
rsync -av --exclude='.git' --exclude='atualizar_repo.sh' \
  "$SCRIPT_DIR/" "$TEMP_DIR/repo/" \
  | grep -v "^sending\|^sent\|^total" || true

success "Arquivos copiados"

echo -e "\n${BOLD}━━━ Passo 3 — Regenerar páginas de categoria ━━━${RESET}\n"
cd "$TEMP_DIR/repo"
python3 scripts/gerar_categorias.py

echo -e "\n${BOLD}━━━ Passo 4 — Commit e Push ━━━${RESET}\n"

git add -A
git status --short

echo ""
read -rp "$(echo -e ${CYAN}Mensagem do commit [feat: novo design + PIX dinâmico + CI/CD]: ${RESET})" COMMIT_MSG
COMMIT_MSG="${COMMIT_MSG:-feat: novo design + PIX dinâmico + CI/CD}"

git commit -m "$COMMIT_MSG"
success "Commit criado"

info "Fazendo push para $REPO_URL …"
git push origin main
success "Push realizado! ✨"

echo -e "\n${BOLD}━━━ Próximos Passos (uma única vez) ━━━${RESET}\n"
echo -e "  Se ainda não ativou o GitHub Pages:"
echo -e "  1. Acesse ${CYAN}https://github.com/alexandreWachRch/caixalike/settings/pages${RESET}"
echo -e "  2. Em 'Source' → selecione ${BOLD}GitHub Actions${RESET}"
echo -e "  3. Salve — o deploy roda automaticamente\n"
echo -e "  🌐 Seu site: ${GREEN}https://alexandreWachRch.github.io/caixalike/${RESET}"
echo -e "  📊 Actions:  ${CYAN}https://github.com/alexandreWachRch/caixalike/actions${RESET}\n"
success "Concluído! CaixaLike atualizado no GitHub. 🚀"

# Limpeza
rm -rf "$TEMP_DIR"
