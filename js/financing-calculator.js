// Calculadora de Financiamento
let financingChart = null;

function calculateFinancing() {
    // Obter valores dos inputs
    const propertyValue = parseFloat(document.getElementById('propertyValue').value);
    const downPayment = parseFloat(document.getElementById('downPayment').value);
    const annualRate = parseFloat(document.getElementById('interestRate').value) / 100;
    const termMonths = parseInt(document.getElementById('loanTerm').value);
    const systemType = document.querySelector('input[name="amortizationSystem"]:checked').value;

    // Validações
    if (downPayment >= propertyValue) {
        alert('O valor da entrada deve ser menor que o valor do bem.');
        return;
    }

    // Cálculos básicos
    const financedAmount = propertyValue - downPayment;
    const monthlyRate = annualRate / 12;
    const downPaymentPercentage = (downPayment / propertyValue) * 100;

    // Calcular baseado no sistema escolhido
    let results;
    if (systemType === 'price') {
        results = calculatePrice(financedAmount, monthlyRate, termMonths);
    } else {
        results = calculateSAC(financedAmount, monthlyRate, termMonths);
    }

    // Exibir resultados
    document.getElementById('financedAmount').textContent = formatCurrency(financedAmount);
    document.getElementById('firstInstallment').textContent = formatCurrency(results.firstInstallment);
    document.getElementById('lastInstallment').textContent = formatCurrency(results.lastInstallment);
    document.getElementById('totalPaid').textContent = formatCurrency(results.totalPaid);
    document.getElementById('totalInterest').textContent = formatCurrency(results.totalInterest);
    document.getElementById('downPaymentPercentage').textContent = downPaymentPercentage.toFixed(1) + '%';

    // Mostrar seção de resultados
    document.getElementById('resultsSection').style.display = 'block';

    // Criar gráfico
    createFinancingChart(results.installments, systemType);

    // Criar comparação
    createComparison(financedAmount, monthlyRate, termMonths);

    // Scroll para os resultados
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function calculatePrice(principal, monthlyRate, termMonths) {
    // Fórmula da Tabela Price: PMT = PV * [i * (1+i)^n] / [(1+i)^n - 1]
    const installment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                       (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    const installments = [];
    let balance = principal;
    let totalInterest = 0;

    for (let month = 1; month <= termMonths; month++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = installment - interestPayment;
        balance -= principalPayment;
        totalInterest += interestPayment;

        installments.push({
            month: month,
            installment: installment,
            principal: principalPayment,
            interest: interestPayment,
            balance: Math.max(0, balance)
        });
    }

    return {
        firstInstallment: installment,
        lastInstallment: installment,
        totalPaid: installment * termMonths,
        totalInterest: totalInterest,
        installments: installments
    };
}

function calculateSAC(principal, monthlyRate, termMonths) {
    const principalPayment = principal / termMonths;
    const installments = [];
    let balance = principal;
    let totalPaid = 0;
    let totalInterest = 0;

    for (let month = 1; month <= termMonths; month++) {
        const interestPayment = balance * monthlyRate;
        const installment = principalPayment + interestPayment;
        balance -= principalPayment;
        totalPaid += installment;
        totalInterest += interestPayment;

        installments.push({
            month: month,
            installment: installment,
            principal: principalPayment,
            interest: interestPayment,
            balance: Math.max(0, balance)
        });
    }

    return {
        firstInstallment: installments[0].installment,
        lastInstallment: installments[termMonths - 1].installment,
        totalPaid: totalPaid,
        totalInterest: totalInterest,
        installments: installments
    };
}

function createFinancingChart(installments, systemType) {
    const ctx = document.getElementById('financingChart').getContext('2d');
    
    // Destruir gráfico anterior se existir
    if (financingChart) {
        financingChart.destroy();
    }

    // Preparar dados (mostrar apenas alguns pontos para melhor visualização)
    const step = Math.max(1, Math.floor(installments.length / 50));
    const months = [];
    const installmentValues = [];
    const principalValues = [];
    const interestValues = [];

    for (let i = 0; i < installments.length; i += step) {
        const data = installments[i];
        months.push(data.month);
        installmentValues.push(data.installment);
        principalValues.push(data.principal);
        interestValues.push(data.interest);
    }

    financingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Valor da Parcela',
                data: installmentValues,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: false,
                tension: 0.4
            }, {
                label: 'Amortização',
                data: principalValues,
                borderColor: '#16a34a',
                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                fill: false,
                tension: 0.4
            }, {
                label: 'Juros',
                data: interestValues,
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `Evolução das Parcelas - Sistema ${systemType.toUpperCase()}`
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Mês'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Valor (R$)'
                    },
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function createComparison(principal, monthlyRate, termMonths) {
    const priceResults = calculatePrice(principal, monthlyRate, termMonths);
    const sacResults = calculateSAC(principal, monthlyRate, termMonths);

    const comparisonHTML = `
        <table class="comparison-table-style">
            <thead>
                <tr>
                    <th>Critério</th>
                    <th>Tabela Price</th>
                    <th>SAC</th>
                    <th>Diferença</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Primeira Parcela</td>
                    <td>${formatCurrency(priceResults.firstInstallment)}</td>
                    <td>${formatCurrency(sacResults.firstInstallment)}</td>
                    <td class="${sacResults.firstInstallment > priceResults.firstInstallment ? 'negative' : 'positive'}">
                        ${formatCurrency(Math.abs(sacResults.firstInstallment - priceResults.firstInstallment))}
                    </td>
                </tr>
                <tr>
                    <td>Última Parcela</td>
                    <td>${formatCurrency(priceResults.lastInstallment)}</td>
                    <td>${formatCurrency(sacResults.lastInstallment)}</td>
                    <td class="${sacResults.lastInstallment > priceResults.lastInstallment ? 'negative' : 'positive'}">
                        ${formatCurrency(Math.abs(sacResults.lastInstallment - priceResults.lastInstallment))}
                    </td>
                </tr>
                <tr>
                    <td>Total Pago</td>
                    <td>${formatCurrency(priceResults.totalPaid)}</td>
                    <td>${formatCurrency(sacResults.totalPaid)}</td>
                    <td class="${sacResults.totalPaid > priceResults.totalPaid ? 'negative' : 'positive'}">
                        ${formatCurrency(Math.abs(sacResults.totalPaid - priceResults.totalPaid))}
                    </td>
                </tr>
                <tr>
                    <td>Total de Juros</td>
                    <td>${formatCurrency(priceResults.totalInterest)}</td>
                    <td>${formatCurrency(sacResults.totalInterest)}</td>
                    <td class="${sacResults.totalInterest > priceResults.totalInterest ? 'negative' : 'positive'}">
                        ${formatCurrency(Math.abs(sacResults.totalInterest - priceResults.totalInterest))}
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="comparison-summary">
            <p><strong>Resumo:</strong> O sistema SAC resulta em uma economia de 
            <strong>${formatCurrency(priceResults.totalPaid - sacResults.totalPaid)}</strong> 
            em relação à Tabela Price, mas com parcelas iniciais maiores.</p>
        </div>
    `;

    document.getElementById('comparisonTable').innerHTML = comparisonHTML;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Adicionar event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Calcular automaticamente quando mudar o sistema de amortização
    const radioButtons = document.querySelectorAll('input[name="amortizationSystem"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            if (document.getElementById('resultsSection').style.display !== 'none') {
                calculateFinancing();
            }
        });
    });

    // Atualizar entrada automaticamente baseada na porcentagem
    const propertyValueInput = document.getElementById('propertyValue');
    const downPaymentInput = document.getElementById('downPayment');
    
    propertyValueInput.addEventListener('input', function() {
        // Manter a mesma porcentagem de entrada
        const currentPercentage = parseFloat(downPaymentInput.value) / parseFloat(this.value) * 100;
        if (!isNaN(currentPercentage) && currentPercentage <= 100) {
            // Não atualizar automaticamente para dar liberdade ao usuário
        }
    });
});

