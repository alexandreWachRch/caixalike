#!/usr/bin/env bash
# =============================================================
# CaixaLike — Script de Deploy Completo
# Uso: bash deploy.sh <SEU_USUARIO_GITHUB> [nome-do-repo]
#
# O que este script faz:
#   1. Verifica dependências (git, python3)
#   2. Solicita configuração das chaves (PIX + Cripto)
#   3. Regenera as páginas de categoria
#   4. Inicializa o repositório Git local
#   5. Faz o push para o GitHub
#   6. Exibe instruções para ativar o GitHub Pages
# =============================================================

set -euo pipefail  # Aborta em qualquer erro

# ——— Cores ———
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}ℹ  $*${RESET}"; }
success() { echo -e "${GREEN}✅ $*${RESET}"; }
warn()    { echo -e "${YELLOW}⚠  $*${RESET}"; }
error()   { echo -e "${RED}❌ $*${RESET}"; exit 1; }
section() { echo -e "\n${BOLD}━━━ $* ━━━${RESET}\n"; }

# ——— Banner ———
clear
echo -e "${BOLD}"
cat << 'EOF'
   ____      _          _     _ _        
  / ___|__ _(_)_  ____ | |   (_) | ___  
 | |   / _` | \ \/ / _` | |   | | |/ _ \ 
 | |__| (_| | |>  < (_| | |___| | |  __/ 
  \____\__,_|_/_/\_\__,_|_____|_|_|\___| 
                                          
  Deploy Script v2.0
EOF
echo -e "${RESET}"

# ——— 0. Argumentos ———
GITHUB_USER="${1:-}"
REPO_NAME="${2:-caixalike}"

if [[ -z "$GITHUB_USER" ]]; then
  read -rp "$(echo -e ${CYAN}Seu usuário GitHub: ${RESET})" GITHUB_USER
fi
[[ -z "$GITHUB_USER" ]] && error "Usuário GitHub é obrigatório."

REPO_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

# ——— 1. Verificar dependências ———
section "Verificando dependências"

command -v git      &>/dev/null && success "git encontrado"     || error "git não instalado. Instale em https://git-scm.com"
command -v python3  &>/dev/null && success "python3 encontrado" || error "python3 não instalado."

# ——— 2. Configuração das chaves ———
section "Configuração das Chaves de Pagamento"

warn "Você pode pular esta etapa pressionando ENTER para manter os valores atuais."
echo ""

JS_FILE="js/pagamentos.js"

# Lê valor atual
current_pix_key=$(grep -oP '(?<=chave:\s{4}")([^"]+)' "$JS_FILE" 2>/dev/null || echo "")
current_pix_nome=$(grep -oP '(?<=nome:\s{5}")([^"]+)' "$JS_FILE" 2>/dev/null || echo "")
current_pix_cidade=$(grep -oP '(?<=cidade:\s{3}")([^"]+)' "$JS_FILE" 2>/dev/null || echo "")
current_polygon=$(grep -oP '(?<=polygon: ")([^"]+)' "$JS_FILE" 2>/dev/null || echo "")
current_solana=$(grep -oP '(?<=solana:  ")([^"]+)' "$JS_FILE" 2>/dev/null || echo "")

echo -e "${BOLD}PIX${RESET}"
read -rp "  Chave PIX      [${current_pix_key}]: " NEW_PIX_KEY
read -rp "  Nome (máx 25)  [${current_pix_nome}]: " NEW_PIX_NOME
read -rp "  Cidade (máx 15)[${current_pix_cidade}]: " NEW_PIX_CIDADE
echo ""
echo -e "${BOLD}Criptoativos${RESET}"
read -rp "  Endereço Polygon [${current_polygon:0:20}...]: " NEW_POLYGON
read -rp "  Endereço Solana  [${current_solana:0:20}...]: " NEW_SOLANA

# Aplica substituições se fornecidas
if [[ -n "$NEW_PIX_KEY" ]]; then
  sed -i "s|chave:    \".*\"|chave:    \"${NEW_PIX_KEY}\"|" "$JS_FILE"
  success "Chave PIX atualizada"
fi
if [[ -n "$NEW_PIX_NOME" ]]; then
  sed -i "s|nome:     \".*\"|nome:     \"${NEW_PIX_NOME}\"|" "$JS_FILE"
  success "Nome PIX atualizado"
fi
if [[ -n "$NEW_PIX_CIDADE" ]]; then
  sed -i "s|cidade:   \".*\"|cidade:   \"${NEW_PIX_CIDADE}\"|" "$JS_FILE"
  success "Cidade PIX atualizada"
fi
if [[ -n "$NEW_POLYGON" ]]; then
  sed -i "s|polygon: \".*\"|polygon: \"${NEW_POLYGON}\"|" "$JS_FILE"
  success "Endereço Polygon atualizado"
fi
if [[ -n "$NEW_SOLANA" ]]; then
  sed -i "s|solana:  \".*\"|solana:  \"${NEW_SOLANA}\"|" "$JS_FILE"
  success "Endereço Solana atualizado"
fi

# ——— 3. Regenerar páginas ———
section "Gerando Páginas de Categoria"
python3 scripts/gerar_categorias.py

# ——— 4. Git init / commit ———
section "Inicializando Repositório Git"

if [[ ! -d ".git" ]]; then
  git init
  git branch -M main
  success "Repositório Git inicializado"
else
  info "Repositório Git existente detectado"
fi

git add -A
git status --short

echo ""
read -rp "$(echo -e ${CYAN}Mensagem do commit [feat: CaixaLike v1.0]: ${RESET})" COMMIT_MSG
COMMIT_MSG="${COMMIT_MSG:-feat: CaixaLike v1.0}"

git commit -m "$COMMIT_MSG"
success "Commit criado: $COMMIT_MSG"

# ——— 5. Remote e push ———
section "Enviando para GitHub"

if git remote get-url origin &>/dev/null; then
  warn "Remote 'origin' já existe: $(git remote get-url origin)"
  read -rp "  Sobrescrever? [s/N]: " OVERWRITE
  if [[ "${OVERWRITE,,}" == "s" ]]; then
    git remote set-url origin "$REPO_URL"
    success "Remote atualizado para $REPO_URL"
  fi
else
  git remote add origin "$REPO_URL"
  success "Remote adicionado: $REPO_URL"
fi

info "Fazendo push para $REPO_URL …"
info "(Se solicitado, insira suas credenciais GitHub)"
echo ""

if git push -u origin main; then
  success "Push realizado com sucesso!"
else
  warn "Push falhou. Verifique se o repositório existe no GitHub:"
  echo ""
  echo -e "  👉 Crie em: ${CYAN}https://github.com/new${RESET}"
  echo "     Nome:    ${REPO_NAME}"
  echo "     Visib:   Public"
  echo "     Sem README, sem .gitignore, sem licença (já temos)"
  echo ""
  error "Corrija o problema acima e execute: git push -u origin main"
fi

# ——— 6. Instruções finais ———
section "Ativar GitHub Pages (etapa manual)"

echo -e "O CI/CD já está configurado em ${BOLD}.github/workflows/deploy.yml${RESET}"
echo "Siga os passos abaixo para ativar o GitHub Pages:"
echo ""
echo -e "  1. Acesse ${CYAN}https://github.com/${GITHUB_USER}/${REPO_NAME}/settings/pages${RESET}"
echo "  2. Em 'Source', selecione: ${BOLD}GitHub Actions${RESET}"
echo "  3. Salve — o deploy será acionado automaticamente"
echo ""
echo -e "  🌐 Seu site ficará em: ${GREEN}https://${GITHUB_USER}.github.io/${REPO_NAME}/${RESET}"
echo ""
echo -e "  📊 Acompanhe o deploy em:"
echo -e "     ${CYAN}https://github.com/${GITHUB_USER}/${REPO_NAME}/actions${RESET}"
echo ""
success "Deploy concluído! CaixaLike está no ar. 🚀"
