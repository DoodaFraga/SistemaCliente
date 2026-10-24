// Memória local ultra rápida para guardar os clientes importados
let bancoClientes = [];

// Escutar o evento de seleção de arquivo
document.getElementById('arquivo-csv').addEventListener('change', lerArquivoCSV);

// Escutar o evento de digitação na barra de pesquisa
document.getElementById('campo-pesquisa').addEventListener('input', filtrarDados);

function lerArquivoCSV(evento) {
    const arquivo = evento.target.files[0]; // Correção para pegar o primeiro arquivo selecionado
    if (!arquivo) return;

    const leitor = new FileReader();
    
    leitor.onload = function(e) {
        processarCSV(e.target.result);
    };

    leitor.readAsText(arquivo, 'UTF-8');
}

function processarCSV(texto) {
    // Quebra por linhas de forma ultra rápida
    const linhas = texto.split(/\r?\n/);
    if (linhas.length === 0) return;

    const primeiraLinha = linhas[0];
    const separador = primeiraLinha.includes(';') ? ';' : ',';
    const cabecalhos = primeiraLinha.split(separador).map(c => c.trim().toUpperCase());

    const idxNome = cabecalhos.findIndex(c => c.includes('NOME') || c.includes('CLIENTE'));
    const idxCpf = cabecalhos.findIndex(c => c.includes('CPF') || c.includes('CNPJ'));
    const idxProdutos = cabecalhos.findIndex(c => c.includes('PRODUTO') || c.includes('COMPRAS'));
    const idxTotal = cabecalhos.findIndex(c => c.includes('TOTAL') || c.includes('VALOR') || c.includes('PRECO'));

    bancoClientes = []; 
    let listaTodosProdutos = new Set();

    // Loop otimizado para ler milhares de linhas rapidamente
    for (let i = 1; i < linhas.length; i++) {
        const linhaLimpa = linhas[i].trim();
        if (linhaLimpa === "") continue; 

        const colunas = linhaLimpa.split(separador);

        let nome = idxNome !== -1 ? colunas[idxNome]?.trim() : "Não Informado";
        let cpf = idxCpf !== -1 ? colunas[idxCpf]?.trim() : "Não Informado";
        let produtos = idxProdutos !== -1 ? colunas[idxProdutos]?.trim() : "Nenhum";
        let total = idxTotal !== -1 ? colunas[idxTotal]?.trim() : "0,00";

        bancoClientes.push({ nome, cpf, produtos, total });

        if (produtos && produtos !== "Nenhum") {
            produtos.split(',').forEach(p => listaTodosProdutos.add(p.trim().toUpperCase()));
        }
    }

    // Atualiza contadores na tela
    document.getElementById('stat-clientes').innerText = bancoClientes.length;
    document.getElementById('stat-produtos').innerText = listaTodosProdutos.size || '-';

    // Libera a barra de pesquisa imediata
    const inputPesquisa = document.getElementById('campo-pesquisa');
    inputPesquisa.disabled = false;
    inputPesquisa.placeholder = "🔍 Digite Nome, CPF ou Produto para buscar...";

    // Mostra a tabela inicial
    renderizarTabela(bancoClientes);
}

function renderizarTabela(dados) {
    const corpoTabela = document.getElementById('corpo-tabela');
    corpoTabela.innerHTML = ""; 

    if (dados.length === 0) {
        corpoTabela.innerHTML = `<tr><td colspan="4" class="tabela-vazia">Nenhum resultado encontrado para a busca.</td></tr>`;
        return;
    }

    // 🚀 SEGREDO DA VELOCIDADE: Cria um bloco de memória temporário
    const fragmento = document.createDocumentFragment();

    // Limita a exibição inicial dos primeiros 100 resultados para performance visual instantânea,
    // mas a busca continua varrendo a planilha inteira em segundo plano.
    const limiteExibicao = dados.slice(0, 100);

    limiteExibicao.forEach(item => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td><strong>${item.nome}</strong></td>
            <td>${item.cpf}</td>
            <td>${item.produtos}</td>
            <td><span class="compras-badge">R$ ${item.total}</span></td>
        `;
        fragmento.appendChild(linha); // Insere no bloco temporário
    });

    // Injeta tudo de uma vez só na tela (Velocidade máxima!)
    corpoTabela.appendChild(fragmento);
}

function filtrarDados() {
    const termoBusca = document.getElementById('campo-pesquisa').value.toLowerCase();

    // Se a barra estiver vazia, mostra a base padrão sem perder tempo processando
    if (termoBusca === "") {
        renderizarTabela(bancoClientes);
        return;
    }

    // Filtro em alta velocidade varrendo a memória interna
    const resultadoFiltrado = bancoClientes.filter(cliente => {
        return cliente.nome.toLowerCase().includes(termoBusca) || 
               cliente.cpf.toLowerCase().includes(termoBusca) || 
               cliente.produtos.toLowerCase().includes(termoBusca);
    });

    renderizarTabela(resultadoFiltrado);
}
