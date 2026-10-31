let dadosClientes = [];

document.getElementById('arquivo-csv').addEventListener('change', function(e) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = function(e) {
        const linhas = e.target.result.split(/\r?\n/);
        if (linhas.length <= 1) return;

        const separador = linhas[0].includes(';') ? ';' : ',';
        
        // Mapeamento fixo direto e ultra leve do cabeçalho
        const cabecalho = linhas[0].split(separador).map(c => c.trim().toLowerCase());
        const idxNome = cabecalho.findIndex(c => c.includes('nome') || c.includes('cliente'));
        const idxCpf = cabecalho.findIndex(c => c.includes('cpf') || c.includes('cnpj'));
        const idxProduto = cabecalho.findIndex(c => c.includes('produto') || c.includes('item'));
        const idxValor = cabecalho.findIndex(c => c.includes('valor') || c.includes('total'));
        const idxData = cabecalho.findIndex(c => c.includes('data'));

        dadosClientes = [];
        const produtosSet = new Set();

        // Loop puro, limpo e direto sem travas
        for (let i = 1; i < linhas.length; i++) {
            const linha = linhas[i].trim();
            if (!linha) continue;

            const colunas = linha.split(separador);
            
            const cliente = {
                nome: idxNome !== -1 && colunas[idxNome] ? colunas[idxNome].trim() : '',
                cpf: idxCpf !== -1 && colunas[idxCpf] ? colunas[idxCpf].trim() : '',
                produto: idxProduto !== -1 && colunas[idxProduto] ? colunas[idxProduto].trim() : '',
                valor: idxValor !== -1 && colunas[idxValor] ? colunas[idxValor].trim() : '',
                data: idxData !== -1 && colunas[idxData] ? colunas[idxData].trim() : ''
            };

            dadosClientes.push(cliente);
            if (cliente.produto) produtosSet.add(cliente.produto);
        }

        // Atualiza contadores na tela na hora
        document.getElementById('stat-clientes').textContent = dadosClientes.length;
        document.getElementById('stat-produtos').textContent = produtosSet.size;

        const campo = document.getElementById('campo-pesquisa');
        campo.disabled = false;
        campo.value = '';

        exibirTabela(dadosClientes);
    };
    leitor.readAsText(arquivo, 'UTF-8');
});

// LIMITADOR DE LINHAS VISUAIS: É isso aqui que traz de volta a velocidade instantânea!
function exibirTabela(dados) {
    const tbody = document.getElementById('corpo-tabela');
    
    if (dados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="tabela-vazia">Nenhum resultado encontrado.</td></tr>`;
        return;
    }

    // Mostra apenas os primeiros 200 na tela para o navegador carregar na hora.
    // A pesquisa continua varrendo todos os milhares de registros normalmente!
    const limiteVisual = dados.slice(0, 200);

    let htmlApenas200 = '';
    for (let i = 0; i < limiteVisual.length; i++) {
        const item = limiteVisual[i];
        htmlApenas200 += `<tr>
            <td>${item.nome}</td>
            <td>${item.cpf}</td>
            <td>${item.produto}</td>
            <td>${item.valor}</td>
            <td>${item.data}</td>
        </tr>`;
    }
    
    tbody.innerHTML = htmlApenas200;
}

// Filtro de pesquisa dinâmica otimizado para alto desempenho
document.getElementById('campo-pesquisa').addEventListener('input', function(e) {
    const busca = e.target.value.toLowerCase();
    
    // Varre a memória na velocidade da luz
    const filtrados = dadosClientes.filter(item => 
        item.nome.toLowerCase().includes(busca) || 
        item.cpf.toLowerCase().includes(busca) || 
        item.produto.toLowerCase().includes(busca) ||
        item.data.toLowerCase().includes(busca)
    );

    exibirTabela(filtrados);
});
