/**
 * CaixaLike — Motor de Pagamentos v4.3
 * PIX EMV + Valor automático por plano/serviço + RLUSD (XRPL)
 */

const CONFIG = {
  pix: {
    chave:     "77e8169e-8a5f-4d6b-92b1-c26b1a9aa910",
    nome:      "AQUILES LABOR",
    cidade:    "JOINVILLE",
    descricao: "CAIXALIKE"
  },
  crypto: {
    rlusd: {
      address: "rH5yzozYmmHZdAfHJQwAZyUAJt1uek6gYQ"
    }
  }
};

const PRECOS = {
  "Plano Comercial": 299,
  "Plano Corporativo": 499,
  "Plano Empresarial": 899,
  "Plano E-commerce": 1499,
  "Plano VIP Básico": 29,
  "Plano VIP Pro": 59,
  "Plano VIP Anual": 497,
  "Plano Básico": 29,
  "Plano Profissional": 49,
  "Plano Empresarial Mensal": 79,
  "Plano E-commerce Mensal": 99,
  "Atualização do site": 20,
  "Atualização de plugins": 29,
  "Monitoramento 24/7": 19,
  "Correção de erros": 29,
  "Otimização de imagens": 29,
  "Troca de textos": 10,
  "Troca de fotos": 10,
  "Nova seção": 49,
  "Nova página": 99,
  "Atualização de portfólio": 29,
  "Backup semanal": 19,
  "Backup diário": 29,
  "Proteção contra ataques": 29,
  "Recuperação de site hackeado": 99,
  "Otimização de velocidade": 49,
  "Compressão de imagens": 29,
  "Limpeza de cache": 10,
  "Revisão completa de performance": 99,
  "SEO básico": 49,
  "SEO avançado": 99,
  "Instalação de Pixel Meta": 29,
  "Instalação Google Analytics": 29,
  "Criação de landing page": 149,
  "Criação de logo": 49,
  "Banner para site": 29,
  "Configuração de domínio": 29,
  "Configuração de e-mail profissional": 29,
  "Instalação de chatbot": 49,
  "Integração WhatsApp API": 99,
  "Integração Mercado Pago": 49,
  "Integração Infitipay": 49
};

function tlv(id, val) {
  return String(id).padStart(2, "0") + String(val.length).padStart(2, "0") + val;
}

function crc16(p) {
  let c = 0xFFFF;
  for (let i = 0; i < p.length; i++) {
    c ^= p.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      c = (c & 0x8000) ? (c << 1) ^ 0x1021 : c << 1;
      c &= 0xFFFF;
    }
  }
  return c.toString(16).toUpperCase().padStart(4, "0");
}

// PIX EMV exige ASCII sem acentos, em maiúsculas
function limparTexto(txt, max) {
  return String(txt)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .substring(0, max)
    .trim();
}

function gerarPayload(valor) {
  const { chave, nome, cidade, descricao } = CONFIG.pix;
  let p = tlv(0, "01");
  p += tlv(26, tlv(0, "br.gov.bcb.pix") + tlv(1, chave));
  p += tlv(52, "0000");
  p += tlv(53, "986");
  if (valor && valor !== "0.00") p += tlv(54, valor);
  p += tlv(58, "BR");
  p += tlv(59, limparTexto(nome, 25));
  p += tlv(60, limparTexto(cidade, 15));
  p += tlv(62, tlv(5, limparTexto(descricao, 25).replace(/ /g, "") || "***"));
  p += "6304";
  p += crc16(p);
  return p;
}

function gerarQR(elementId, texto, tentativa = 0) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (!window.QRCode) {
    if (tentativa < 25) setTimeout(() => gerarQR(elementId, texto, tentativa + 1), 200);
    else el.textContent = "QR Code indisponível — use o código copia e cola.";
    return;
  }
  el.innerHTML = "";
  new QRCode(el, {
    text: texto, width: 150, height: 150,
    colorDark: "#000000", colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });
}

function atualizarPIX(valor, veioDoInput = false) {
  const num = parseFloat(String(valor).replace(",", "."));
  if (isNaN(num) || num <= 0) return;

  const payload = gerarPayload(num.toFixed(2));
  const valorFmt = num.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

  const codeEl  = document.getElementById("pixCodigo");
  const tagEl   = document.getElementById("pixValueTag");
  const resEl   = document.getElementById("pixResult");
  const inputEl = document.getElementById("valorPix");
  const okEl    = document.getElementById("pixConfirm");
  const btnEl   = document.getElementById("btnCopyPix");

  // Só preenche o campo quando o valor vem de um clique (plano/serviço);
  // senão o texto "pularia" enquanto o usuário digita. Sem separador de milhar.
  if (inputEl && !veioDoInput) inputEl.value = num.toFixed(2).replace(".", ",");
  if (codeEl)  codeEl.value = payload;
  if (tagEl)   tagEl.textContent = "R$ " + valorFmt;
  if (resEl)   resEl.classList.add("visible");
  if (okEl)    okEl.classList.remove("visible");
  if (btnEl)   { btnEl.textContent = "Copiar"; btnEl.classList.remove("copied"); }

  setTimeout(() => gerarQR("qrcode-pix", payload), 50);
}

function iniciarPIX() {
  const input = document.getElementById("valorPix");
  if (!input || input._pixIniciado) return;
  input._pixIniciado = true;

  input.addEventListener("input", function() {
    let v = this.value.replace(/[^\d,]/g, "");
    const pts = v.split(",");
    if (pts.length > 2) v = pts[0] + "," + pts.slice(1).join("").substring(0, 2);
    else if (pts.length === 2) v = pts[0] + "," + pts[1].substring(0, 2);
    this.value = v;

    const num = parseFloat(v.replace(",", "."));
    if (!isNaN(num) && num > 0) {
      atualizarPIX(num, true);
    } else {
      const resEl = document.getElementById("pixResult");
      const qrEl  = document.getElementById("qrcode-pix");
      if (resEl) resEl.classList.remove("visible");
      if (qrEl)  qrEl.innerHTML = "";
    }
  });
}

function copiarPix() {
  const code = document.getElementById("pixCodigo");
  const btn  = document.getElementById("btnCopyPix");
  const ok   = document.getElementById("pixConfirm");
  if (!code || !code.value) return;

  navigator.clipboard.writeText(code.value).then(() => {
    if (btn) { btn.textContent = "✓ Copiado"; btn.classList.add("copied"); }
    if (ok)  { ok.textContent = "✓ Código copiado! Cole no app do banco."; ok.classList.add("visible"); }
    setTimeout(() => {
      if (btn) { btn.textContent = "Copiar"; btn.classList.remove("copied"); }
      if (ok)  ok.classList.remove("visible");
    }, 3500);
  }).catch(() => {
    code.select();
    try { document.execCommand("copy"); } catch (e) {}
    if (ok) { ok.textContent = "Código selecionado — copie manualmente (Ctrl+C)."; ok.classList.add("visible"); }
  });
}

function copiarEndereco(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input || !input.value) return;

  navigator.clipboard.writeText(input.value).then(() => {
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = "✓ Copiado";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove("copied");
      }, 3000);
    }
  }).catch(() => {
    input.select();
    try { document.execCommand("copy"); } catch (e) {}
  });
}

function preencherEnderecos() {
  const el = document.getElementById("endereco-rlusd");
  if (el) el.value = CONFIG.crypto.rlusd.address;
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarPIX();
  preencherEnderecos();
});

window.copiarPix = copiarPix;
window.copiarEndereco = copiarEndereco;

window.CaixaLike = {
  iniciarPIX,
  atualizarPIX,
  preencherEnderecos,
  CONFIG,
  PRECOS
};
