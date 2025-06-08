// Calculadora de Aposentadoria
let retirementChart = null;

function calculateRetirement() {
    // Obter valores dos inputs
    const currentAge = parseInt(document.getElementById('currentAge').value);
    const retirementAge = parseInt(document.getElementById('retirementAge').value);
    const lifeExpectancy = parseInt(document.getElementById('lifeExpectancy').value);
    const currentSavings = parseFloat(document.getElementById('currentSavings').value);
    const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value);
    const annualReturn = parseFloat(document.getElementById('annualReturn').value) / 100;
    const desiredIncome = parseFloat(document.getElementById('desiredIncome').value);

    // Validações
    if (retirementAge <= currentAge) {
        alert('A idade de aposentadoria deve ser maior que a idade atual.');
        return;
    }

    if (lifeExpectancy <= retirementAge) {
        alert('A expectativa de vida deve ser maior que a idade de aposentadoria.');
        return;
    }

    // Cálculos
    const yearsToRetirement = retirementAge - currentAge;
    const monthsToRetirement = yearsToRetirement * 12;
    const monthlyReturn = annualReturn / 12;
    const yearsInRetirement = lifeExpectancy - retirementAge;

    // Valor futuro do montante atual
    const futureValueCurrentSavings = currentSavings * Math.pow(1 + annualReturn, yearsToRetirement);

    // Valor futuro das contribuições mensais (anuidade)
    const futureValueContributions = monthlyContribution * 
        ((Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn);

    // Valor total acumulado na aposentadoria
    const totalAccumulated = futureValueCurrentSavings + futureValueContributions;

    // Total investido
    const totalInvested = currentSavings + (monthlyContribution * monthsToRetirement);

    // Rendimentos gerados
    const totalReturns = totalAccumulated - totalInvested;

    // Renda mensal possível na aposentadoria (considerando que o dinheiro deve durar até a expectativa de vida)
    const monthsInRetirement = yearsInRetirement * 12;
    const monthlyIncome = totalAccumulated * monthlyReturn / 
        (1 - Math.pow(1 + monthlyReturn, -monthsInRetirement));

    // Exibir resultados
    document.getElementById('totalAccumulated').textContent = formatCurrency(totalAccumulated);
    document.getElementById('monthlyIncome').textContent = formatCurrency(monthlyIncome);
    document.getElementById('totalInvested').textContent = formatCurrency(totalInvested);
    document.getElementById('totalReturns').textContent = formatCurrency(totalReturns);

    // Análise de viabilidade
    displayViabilityAnalysis(monthlyIncome, desiredIncome, monthlyContribution, yearsToRetirement);

    // Mostrar seção de resultados
    document.getElementById('resultsSection').style.display = 'block';

    // Criar gráfico
    createRetirementChart(currentAge, retirementAge, currentSavings, monthlyContribution, annualReturn);

    // Scroll para os resultados
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function displayViabilityAnalysis(monthlyIncome, desiredIncome, monthlyContribution, yearsToRetirement) {
    const analysisDiv = document.getElementById('viabilityAnalysis');
    let analysisHTML = '<h4>Análise de Viabilidade</h4>';

    if (monthlyIncome >= desiredIncome) {
        const surplus = monthlyIncome - desiredIncome;
        analysisHTML += `
            <div class="analysis-success">
                <p><strong>✅ Parabéns!</strong> Sua estratégia atual é suficiente para atingir a renda mensal desejada.</p>
                <p>Você terá uma sobra de <strong>${formatCurrency(surplus)}</strong> por mês na aposentadoria.</p>
            </div>
        `;
    } else {
        const deficit = desiredIncome - monthlyIncome;
        const additionalMonthlyNeeded = calculateAdditionalContribution(deficit, yearsToRetirement, 0.08);
        
        analysisHTML += `
            <div class="analysis-warning">
                <p><strong>⚠️ Atenção!</strong> Sua estratégia atual não é suficiente para atingir a renda mensal desejada.</p>
                <p>Déficit mensal: <strong>${formatCurrency(deficit)}</strong></p>
                <p><strong>Sugestões:</strong></p>
                <ul>
                    <li>Aumentar a contribuição mensal em <strong>${formatCurrency(additionalMonthlyNeeded)}</strong></li>
                    <li>Buscar investimentos com maior rentabilidade</li>
                    <li>Considerar trabalhar alguns anos a mais</li>
                    <li>Reduzir a renda mensal desejada</li>
                </ul>
            </div>
        `;
    }

    analysisDiv.innerHTML = analysisHTML;
}

function calculateAdditionalContribution(deficit, yearsToRetirement, annualReturn) {
    const monthsToRetirement = yearsToRetirement * 12;
    const monthlyReturn = annualReturn / 12;
    const yearsInRetirement = 20; // Assumindo 20 anos de aposentadoria
    const monthsInRetirement = yearsInRetirement * 12;
    
    // Valor presente necessário para gerar o déficit mensal
    const presentValueNeeded = deficit * (1 - Math.pow(1 + monthlyReturn, -monthsInRetirement)) / monthlyReturn;
    
    // Contribuição mensal adicional necessária
    const additionalContribution = presentValueNeeded * monthlyReturn / 
        (Math.pow(1 + monthlyReturn, monthsToRetirement) - 1);
    
    return additionalContribution;
}

function createRetirementChart(currentAge, retirementAge, currentSavings, monthlyContribution, annualReturn) {
    const ctx = document.getElementById('retirementChart').getContext('2d');
    
    // Destruir gráfico anterior se existir
    if (retirementChart) {
        retirementChart.destroy();
    }

    // Gerar dados para o gráfico
    const years = [];
    const values = [];
    const contributions = [];
    
    let currentValue = currentSavings;
    let totalContributed = currentSavings;
    
    for (let age = currentAge; age <= retirementAge; age++) {
        years.push(age);
        values.push(currentValue);
        contributions.push(totalContributed);
        
        if (age < retirementAge) {
            // Aplicar rendimento anual
            currentValue *= (1 + annualReturn);
            // Adicionar contribuições do ano
            currentValue += monthlyContribution * 12;
            totalContributed += monthlyContribution * 12;
        }
    }

    retirementChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Valor Acumulado',
                data: values,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4
            }, {
                label: 'Total Contribuído',
                data: contributions,
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
                    text: 'Evolução do Patrimônio até a Aposentadoria'
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
                        text: 'Idade'
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

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Adicionar event listeners para cálculo automático
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // Opcional: calcular automaticamente após um delay
            // clearTimeout(this.timeout);
            // this.timeout = setTimeout(calculateRetirement, 1000);
        });
    });
});

