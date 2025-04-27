// === Variáveis Principais ===
const ativos = JSON.parse(localStorage.getItem('ativos')) || [
    { ticker: 'BBAS3', precoMedio: 27.18, quantidade: 126 },
    { ticker: 'HCTR11', precoMedio: 58.85, quantidade: 35 },
    { ticker: 'HGLG11', precoMedio: 152.10, quantidade: 10 },
    { ticker: 'ITSA4', precoMedio: 9.74, quantidade: 85 },
    { ticker: 'IVVB11', precoMedio: 333.19, quantidade: 6 },
    { ticker: 'KNSC11', precoMedio: 100.40, quantidade: 100 },
    { ticker: 'MXRF11', precoMedio: 9.11, quantidade: 100 },
    { ticker: 'NDIV11', precoMedio: 109.49, quantidade: 5 },
    { ticker: 'PETR3', precoMedio: 38.61, quantidade: 25 },
    { ticker: 'TAEE11', precoMedio: 38.20, quantidade: 5 },
    { ticker: 'URPR11', precoMedio: 92.50, quantidade: 35 },
    { ticker: 'VALE3', precoMedio: 52.13, quantidade: 10 },
    { ticker: 'VVEO3', precoMedio: 2.15, quantidade: 200 },
    { ticker: 'WEGE3', precoMedio: 46.10, quantidade: 5 },
    { ticker: 'XPCA11', precoMedio: 8.73, quantidade: 120 }
  ];
  
  let ativoSelecionado = null;
  let linhaSelecionada = null;
  
  // === Funções Principais ===
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('data-atual').textContent = new Date().toLocaleDateString('pt-BR');
    carregarCarteira();
    gerarGraficos();
  });
  
  // === Carregar carteira ===
  function carregarCarteira() {
    let tabela = '<table class="table"><thead><tr><th>Ativo</th><th>Preço Médio</th><th>Preço Atual</th><th>Quantidade</th><th>Total Investido</th><th>Último Provento</th></tr></thead><tbody>';
    ativos.forEach((ativo, idx) => {
      tabela += `<tr onclick="selecionarLinha(${idx})" id="linha-${idx}">
        <td>${ativo.ticker}</td>
        <td>R$ ${ativo.precoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td id="preco-atual-${idx}">-</td>
        <td>${ativo.quantidade}</td>
        <td>R$ ${(ativo.precoMedio * ativo.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td id="ultimo-provento-${idx}">-</td>
      </tr>`;
    });
    tabela += '</tbody></table>';
    document.getElementById('tabela-container').innerHTML = tabela;
  }
  
  // === Selecionar linha ===
  function selecionarLinha(index) {
    if (linhaSelecionada === index) {
      document.getElementById(`linha-${index}`).classList.remove('linha-ativa');
      document.querySelector(`#linha-${index} .botoes-acao`)?.remove();
      linhaSelecionada = null;
      return;
    }
  
    document.querySelectorAll('tr').forEach(tr => {
      tr.classList.remove('linha-ativa');
      tr.querySelector('.botoes-acao')?.remove();
    });
  
    const linha = document.getElementById(`linha-${index}`);
    linha.classList.add('linha-ativa');
    const div = document.createElement('div');
    div.className = 'botoes-acao';
    div.innerHTML = `<button onclick="editarAtivo(${index})">✏️</button><button onclick="removerAtivo(${index})">❌</button>`;
    linha.children[0].appendChild(div);
  
    atualizarPrecoEDividendo(index);
  }
  
  // === Atualizar Preço e Provento ===
  function atualizarPrecoEDividendo(index) {
    const ativo = ativos[index];
    const precoAtualTd = document.getElementById(`preco-atual-${index}`);
    const proventoTd = document.getElementById(`ultimo-provento-${index}`);
  
    precoAtualTd.innerHTML = '⏳ Atualizando...';
    proventoTd.innerHTML = '⏳ Atualizando...';
  
    const token = 'eJGEyu8vVHctULdVdHYzQd'; // Usar variável segura depois!
    const url = `https://brapi.dev/api/quote/${ativo.ticker}?range=5d&interval=1d&fundamental=true&dividends=true&token=${token}`;
  
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const resultado = data.results?.[0];
  
        if (resultado) {
          const precoAtual = resultado.regularMarketPrice || 0;
          precoAtualTd.innerHTML = `R$ ${precoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  
          const dividendoInfo = resultado.dividends?.[0];
          if (dividendoInfo) {
            const valorUnitario = dividendoInfo.dividend;
            const totalRecebido = valorUnitario * ativo.quantidade;
            proventoTd.innerHTML = `R$ ${totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span title="R$ ${valorUnitario.toFixed(2)} x ${ativo.quantidade} ativos">💬</span>`;
          } else {
            proventoTd.innerHTML = '-';
          }
        } else {
          precoAtualTd.innerHTML = '-';
          proventoTd.innerHTML = '-';
        }
      })
      .catch(error => {
        console.error('Erro ao buscar dados:', error);
        precoAtualTd.innerHTML = '-';
        proventoTd.innerHTML = '-';
      });
  }
  
  // === Modais de Adicionar e Editar ===
  function abrirFormulario() {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('novo-ticker').value = '';
    document.getElementById('novo-preco').value = '';
    document.getElementById('novo-quantidade').value = '';
    ativoSelecionado = null;
  }
  
  function fecharFormulario() {
    document.getElementById('modal').classList.add('hidden');
  }
  
  function salvarNovoAtivo() {
    const ticker = document.getElementById('novo-ticker').value.toUpperCase();
    const preco = parseFloat(document.getElementById('novo-preco').value);
    const quantidade = parseInt(document.getElementById('novo-quantidade').value);
  
    if (ticker && preco && quantidade) {
      if (ativoSelecionado !== null) {
        ativos[ativoSelecionado] = { ticker, precoMedio: preco, quantidade };
      } else {
        ativos.push({ ticker, precoMedio: preco, quantidade });
      }
      localStorage.setItem('ativos', JSON.stringify(ativos));
      fecharFormulario();
      carregarCarteira();
    } else {
      alert('Preencha todos os campos corretamente!');
    }
  }
  
  function editarAtivo(index) {
    ativoSelecionado = index;
    const ativo = ativos[index];
    document.getElementById('novo-ticker').value = ativo.ticker;
    document.getElementById('novo-preco').value = ativo.precoMedio;
    document.getElementById('novo-quantidade').value = ativo.quantidade;
    abrirFormulario();
  }
  
  function removerAtivo(index) {
    if (confirm('Deseja remover este ativo?')) {
      ativos.splice(index, 1);
      localStorage.setItem('ativos', JSON.stringify(ativos));
      carregarCarteira();
    }
  }
  
  // === Gráficos ===
  function gerarGraficos() {
    gerarGraficoPizza();
    gerarGraficoLinha();
  }
  
  function gerarGraficoPizza() {
    const ctx = document.getElementById('grafico-pizza').getContext('2d');
    const labels = ativos.map(a => a.ticker);
    const data = ativos.map(a => a.precoMedio * a.quantidade);
  
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: gerarCores(labels.length)
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#f9fafb' } }
        }
      }
    });
  }
  
  function gerarGraficoLinha() {
    const ctx = document.getElementById('grafico-linha').getContext('2d');
    const meses = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
    const proventosSimulados = meses.map(() => {
      const total = ativos.reduce((acc, ativo) => acc + (Math.random() * 1.5), 0);
      return total.toFixed(2);
    });
  
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: meses,
        datasets: [{
          label: 'Proventos (R$)',
          data: proventosSimulados,
          fill: true,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#f9fafb' } } },
        scales: {
          x: { ticks: { color: '#f9fafb' } },
          y: { ticks: { color: '#f9fafb' } }
        }
      }
    });
  }
  
  function gerarCores(qtd) {
    const cores = [];
    for (let i = 0; i < qtd; i++) {
      cores.push(`hsl(${i * 360 / qtd}, 70%, 50%)`);
    }
    return cores;
  }
  