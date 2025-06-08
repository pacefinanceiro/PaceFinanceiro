// Função principal para calcular juros compostos
function calcularJurosCompostos() {
    // Obter valores dos inputs
    const valorInicial = parseFloat(document.getElementById('valorInicial').value) || 0;
    const valorMensal = parseFloat(document.getElementById('valorMensal').value) || 0;
    const taxaJuros = parseFloat(document.getElementById('taxaJuros').value) || 0;
    const tempo = parseInt(document.getElementById('tempo').value) || 0;

    // Validar inputs
    if (valorInicial < 0 || valorMensal < 0 || taxaJuros < 0 || tempo <= 0) {
        alert('Por favor, insira valores válidos.');
        return;
    }

    // Converter taxa anual para mensal
    const taxaMensal = taxaJuros / 100 / 12;
    const meses = tempo * 12;

    // Calcular valor futuro com aportes mensais
    let valorFinal = valorInicial;
    let totalInvestido = valorInicial;
    const dadosGrafico = [];

    // Adicionar ponto inicial
    dadosGrafico.push({
        ano: 0,
        valorTotal: valorInicial,
        totalInvestido: valorInicial
    });

    // Calcular mês a mês
    for (let mes = 1; mes <= meses; mes++) {
        // Aplicar juros sobre o valor atual
        valorFinal = valorFinal * (1 + taxaMensal);
        
        // Adicionar aporte mensal
        valorFinal += valorMensal;
        totalInvestido += valorMensal;

        // Adicionar dados para o gráfico (apenas anos completos)
        if (mes % 12 === 0) {
            dadosGrafico.push({
                ano: mes / 12,
                valorTotal: valorFinal,
                totalInvestido: totalInvestido
            });
        }
    }

    const jurosGanhos = valorFinal - totalInvestido;
    const rentabilidade = totalInvestido > 0 ? ((jurosGanhos / totalInvestido) * 100) : 0;

    // Atualizar interface
    atualizarResultados(valorFinal, totalInvestido, jurosGanhos, rentabilidade);
    
    // Criar gráfico
    criarGrafico(dadosGrafico);
}

// Função para atualizar os resultados na interface
function atualizarResultados(valorFinal, totalInvestido, jurosGanhos, rentabilidade) {
    document.getElementById('valorFinal').textContent = formatarMoeda(valorFinal);
    document.getElementById('totalInvestido').textContent = formatarMoeda(totalInvestido);
    document.getElementById('jurosGanhos').textContent = formatarMoeda(jurosGanhos);
    document.getElementById('rentabilidade').textContent = rentabilidade.toFixed(1) + '%';
}

// Função para formatar valores em moeda brasileira
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Função para criar gráfico simples com Canvas
function criarGrafico(dados) {
    const canvas = document.getElementById('investmentChart');
    const ctx = canvas.getContext('2d');
    
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Configurações do gráfico
    const padding = 60;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    // Encontrar valores máximos para escala
    const maxValor = Math.max(...dados.map(d => d.valorTotal));
    const maxAno = Math.max(...dados.map(d => d.ano));
    
    // Função para converter dados para coordenadas do canvas
    function getX(ano) {
        return padding + (ano / maxAno) * chartWidth;
    }
    
    function getY(valor) {
        return canvas.height - padding - (valor / maxValor) * chartHeight;
    }
    
    // Desenhar eixos
    ctx.strokeStyle = '#7F8C8D';
    ctx.lineWidth = 2;
    
    // Eixo X
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Eixo Y
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();
    
    // Desenhar linha do total investido
    ctx.strokeStyle = '#3498DB';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    dados.forEach((ponto, index) => {
        const x = getX(ponto.ano);
        const y = getY(ponto.totalInvestido);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Desenhar linha do valor total
    ctx.strokeStyle = '#2ECC71';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    dados.forEach((ponto, index) => {
        const x = getX(ponto.ano);
        const y = getY(ponto.valorTotal);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Adicionar pontos
    dados.forEach(ponto => {
        const x = getX(ponto.ano);
        
        // Ponto do total investido
        ctx.fillStyle = '#3498DB';
        ctx.beginPath();
        ctx.arc(x, getY(ponto.totalInvestido), 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Ponto do valor total
        ctx.fillStyle = '#2ECC71';
        ctx.beginPath();
        ctx.arc(x, getY(ponto.valorTotal), 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Adicionar labels dos eixos
    ctx.fillStyle = '#2C3E50';
    ctx.font = '14px Open Sans';
    ctx.textAlign = 'center';
    
    // Labels do eixo X (anos)
    for (let i = 0; i <= maxAno; i += Math.ceil(maxAno / 10)) {
        const x = getX(i);
        ctx.fillText(i + ' anos', x, canvas.height - padding + 20);
    }
    
    // Labels do eixo Y (valores)
    ctx.textAlign = 'right';
    for (let i = 0; i <= maxValor; i += maxValor / 5) {
        const y = getY(i);
        ctx.fillText(formatarMoeda(i), padding - 10, y + 5);
    }
    
    // Legenda
    ctx.textAlign = 'left';
    ctx.fillStyle = '#3498DB';
    ctx.fillRect(padding, padding, 20, 3);
    ctx.fillStyle = '#2C3E50';
    ctx.fillText('Total Investido', padding + 30, padding + 5);
    
    ctx.fillStyle = '#2ECC71';
    ctx.fillRect(padding, padding + 25, 20, 3);
    ctx.fillStyle = '#2C3E50';
    ctx.fillText('Valor Final', padding + 30, padding + 30);
}

// Adicionar event listeners para recalcular automaticamente
document.addEventListener('DOMContentLoaded', function() {
    const inputs = ['valorInicial', 'valorMensal', 'taxaJuros', 'tempo'];
    
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', calcularJurosCompostos);
        }
    });
    
    // Calcular valores iniciais
    calcularJurosCompostos();
});

// Função para animar números (efeito contador)
function animarNumero(elemento, valorFinal, duracao = 1000) {
    const valorInicial = 0;
    const incremento = valorFinal / (duracao / 16);
    let valorAtual = valorInicial;
    
    const timer = setInterval(() => {
        valorAtual += incremento;
        if (valorAtual >= valorFinal) {
            valorAtual = valorFinal;
            clearInterval(timer);
        }
        elemento.textContent = formatarMoeda(valorAtual);
    }, 16);
}

