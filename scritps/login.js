let cardEditando = null;
let modoEdicao = false;
let tituloCriado = false;

function verificarLogin(event) {
    event.preventDefault();
  
    const divLogin = document.getElementById('form-container');
    const divOrcamento = document.getElementById('orcamento-container');
    const barraPesquisa = document.getElementById('barPes');
    const user = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
  
    if (user === "teste" && senha === "teste") {
      divLogin.style.display = 'none';
      divOrcamento.style.display = 'flex';
      barraPesquisa.style.display = 'flex';
  
      // Carrega os orçamentos salvos só após o login
      carregarOrcamentosDoLocalStorage();
  
      // Espera um pequeno tempo até o DOM renderizar o container
      setTimeout(() => {
        if (!tituloCriado) {
          const lista = document.getElementById('lista-orcamentos');
  
          if (lista) {
            const titulo = document.createElement('h1');
            titulo.textContent = "Orçamentos";
            titulo.classList.add('titulo-orcamentos');
            lista.insertAdjacentElement('beforebegin', titulo);
            tituloCriado = true;
          } else {
            console.error("Elemento #lista-orcamentos não encontrado.");
          }
        }
      }, 100);
    } else {
      alert("Usuário ou senha incorretos!");
    }
  }


function mostrarFormulario() {
  document.getElementById('form-orcamento').style.display = 'block';
}

function criarOrcamento(event) {
  event.preventDefault();

  const nome = document.getElementById('nomeOrcamento').value;
  const cliente = document.getElementById('nomeCliente').value;
  const descricao = document.getElementById('descricao').value;
  const status = document.getElementById('status').value;
  const produtos = document.getElementById('produtos').value;

  if (!modoEdicao) {
    const dataInicioInput = document.getElementById('dataInicio').value;
    const dataFimInput = document.getElementById('dataFim').value;

    const dataInicio = new Date(dataInicioInput);
    const dataFim = new Date(dataFimInput);

    if (dataFim < dataInicio) {
      alert("A data de término não pode ser anterior à data de início!");
      return;
    }

    const inicio = formatarDataBR(dataInicioInput);
    const fim = formatarDataBR(dataFimInput);

    const lista = document.getElementById('lista-orcamentos');

    const card = document.createElement('div');
    card.className = 'orcamento-card';
    card.innerHTML = `
      <h3>${nome}</h3>
      <p><strong>Cliente:</strong> ${cliente}</p>
      <p><strong>Descrição:</strong> ${descricao}</p>
      <p><strong>Data Início:</strong> ${inicio}</p>
      <p><strong>Data Fim:</strong> ${fim}</p>
      <p><strong>Status:</strong> <span class="status-text ${status.toLowerCase().replace(" ", "-")}">${status}</span></p>
      <p><strong>Produtos:</strong> ${produtos}</p>
      <div class="acoes">
        <button onclick="alterarStatus(this, 'Em processo')">Começar</button>
        <button onclick="alterarStatus(this, 'Finalizado')">Finalizar</button>
        <button onclick="editarOrcamento(this)">Editar</button>
        <button onclick="this.parentElement.parentElement.remove()">Excluir</button>
      </div>
    `;
    lista.appendChild(card);

    salvarOrcamentosNoLocalStorage();

  } else {
    // Atualiza o card existente
    cardEditando.querySelector('h3').innerText = nome;
    cardEditando.querySelector('p:nth-of-type(1)').innerHTML = `<strong>Cliente:</strong> ${cliente}`;
    cardEditando.querySelector('p:nth-of-type(2)').innerHTML = `<strong>Descrição:</strong> ${descricao}`;
    cardEditando.querySelector('.status-text').innerText = status;
    cardEditando.querySelector('.status-text').className = `status-text ${status.toLowerCase().replace(" ", "-")}`;
    cardEditando.querySelector('p:nth-of-type(6)').innerHTML = `<strong>Produtos:</strong> ${produtos}`;

    modoEdicao = false;
    cardEditando = null;
    salvarOrcamentosNoLocalStorage();
  }

  event.target.reset();
  document.getElementById('form-orcamento').style.display = 'none';
}

function formatarDataBR(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function filtrarOrcamentos() {
  const termo = document.getElementById('input-pesquisa').value.toLowerCase();
  const orcamentos = document.querySelectorAll('.orcamento-card');

  orcamentos.forEach(card => {
    const texto = card.innerText.toLowerCase();
    card.style.display = texto.includes(termo) ? 'block' : 'none';
  });
}

function alterarStatus(botao, novoStatus) {
    const card = botao.closest('.orcamento-card');
    const statusSpan = card.querySelector('.status-text');
    statusSpan.textContent = novoStatus;
    statusSpan.className = `status-text ${novoStatus.toLowerCase().replace(" ", "-")}`;
    salvarOrcamentosNoLocalStorage(); // 👈 aqui também
  }
  

function editarOrcamento(botao) {
  const card = botao.closest('.orcamento-card');
  const nome = card.querySelector('h3').innerText;
  const cliente = card.querySelector('p:nth-of-type(1)').innerText.replace("Cliente: ", "");
  const descricao = card.querySelector('p:nth-of-type(2)').innerText.replace("Descrição: ", "");
  const status = card.querySelector('.status-text').innerText;
  const produtos = card.querySelector('p:nth-of-type(6)').innerText.replace("Produtos: ", "");

  document.getElementById('nomeOrcamento').value = nome;
  document.getElementById('nomeCliente').value = cliente;
  document.getElementById('descricao').value = descricao;
  document.getElementById('status').value = status;
  document.getElementById('produtos').value = produtos;

  document.getElementById('form-orcamento').style.display = 'block';

  cardEditando = card;
  modoEdicao = true;
}

function salvarOrcamentosNoLocalStorage() {
    const cards = document.querySelectorAll('.orcamento-card');
    const orcamentos = [];
  
    cards.forEach(card => {
      const nome = card.querySelector('h3').innerText;
      const cliente = card.querySelector('p:nth-of-type(1)').innerText.replace("Cliente: ", "");
      const descricao = card.querySelector('p:nth-of-type(2)').innerText.replace("Descrição: ", "");
      const dataInicio = card.querySelector('p:nth-of-type(3)').innerText.replace("Data Início: ", "");
      const dataFim = card.querySelector('p:nth-of-type(4)').innerText.replace("Data Fim: ", "");
      const status = card.querySelector('.status-text').innerText;
      const produtos = card.querySelector('p:nth-of-type(6)').innerText.replace("Produtos: ", "");
  
      orcamentos.push({ nome, cliente, descricao, dataInicio, dataFim, status, produtos });
    });
  
    localStorage.setItem('orcamentos', JSON.stringify(orcamentos));
  }
  
  function carregarOrcamentosDoLocalStorage() {
    const orcamentosSalvos = JSON.parse(localStorage.getItem('orcamentos')) || [];
  
    orcamentosSalvos.forEach(orc => {
      const lista = document.getElementById('lista-orcamentos');
      const card = document.createElement('div');
      card.className = 'orcamento-card';
      card.innerHTML = `
        <h3>${orc.nome}</h3>
        <p><strong>Cliente:</strong> ${orc.cliente}</p>
        <p><strong>Descrição:</strong> ${orc.descricao}</p>
        <p><strong>Data Início:</strong> ${orc.dataInicio}</p>
        <p><strong>Data Fim:</strong> ${orc.dataFim}</p>
        <p><strong>Status:</strong> <span class="status-text ${orc.status.toLowerCase().replace(" ", "-")}">${orc.status}</span></p>
        <p><strong>Produtos:</strong> ${orc.produtos}</p>
        <div class="acoes">
          <button onclick="alterarStatus(this, 'Em processo')">Começar</button>
          <button onclick="alterarStatus(this, 'Finalizado')">Finalizar</button>
          <button onclick="editarOrcamento(this)">Editar</button>
          <button onclick="this.parentElement.parentElement.remove(); salvarOrcamentosNoLocalStorage();">Excluir</button>
        </div>
      `;
      lista.appendChild(card);
    });
  
    console.log("Orçamentos carregados:", orcamentosSalvos);
  }
  
