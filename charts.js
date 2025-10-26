/**
 * ========================================
 * CHART RENDERING USING CHART.JS
 * Developer: Santosh Phuyal
 * ========================================
 */

let trendChart, categoryChart, budgetChart;

/**
 * Render Income vs Expense Trend Chart
 */
async function renderTrendChart(bsYear, bsMonth) {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;

    // Get last 6 months data
    const months = [];
    const incomeData = [];
    const expenseData = [];

    for (let i = 5; i >= 0; i--) {
        let year = bsYear;
        let month = bsMonth - i;

        while (month < 1) {
            month += 12;
            year--;
        }

        if (year < 2082) continue;

        months.push(`${getNepaliMonthName(month).substring(0, 3)} ${year}`);
        const income = await getMonthlyIncome(year, month);
        const expense = await getMonthlyExpense(year, month);
        incomeData.push(income);
        expenseData.push(expense);
    }

    // Destroy existing chart
    if (trendChart) {
        trendChart.destroy();
    }

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: '#50C878',
                    backgroundColor: 'rgba(80, 200, 120, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Expense',
                    data: expenseData,
                    borderColor: '#E74C3C',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': Rs. ' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Rs. ' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

/**
 * Render Category Pie Chart
 */
async function renderCategoryChart(bsYear, bsMonth) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    const { expenses } = await getMonthlyTransactions(bsYear, bsMonth);

    // Group by category
    const categoryTotals = {};
    expenses.forEach(expense => {
        const category = expense.category || 'Other';
        const amount = convertCurrency(parseFloat(expense.amount), expense.currency || 'NPR', 'NPR');
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ];

    // Destroy existing chart
    if (categoryChart) {
        categoryChart.destroy();
    }

    if (labels.length === 0) {
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': Rs. ' + context.parsed.toLocaleString() + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Render Budget Chart
 */
async function renderBudgetChart(bsYear, bsMonth) {
    const ctx = document.getElementById('budgetChart');
    if (!ctx) return;

    const budgets = await getMonthBudget(bsYear, bsMonth);
    const { expenses } = await getMonthlyTransactions(bsYear, bsMonth);

    // Group expenses by category
    const categoryExpenses = {};
    expenses.forEach(expense => {
        const category = expense.category || 'Other';
        const amount = convertCurrency(parseFloat(expense.amount), expense.currency || 'NPR', 'NPR');
        categoryExpenses[category] = (categoryExpenses[category] || 0) + amount;
    });

    const labels = [];
    const budgetData = [];
    const actualData = [];

    budgets.forEach(budget => {
        labels.push(budget.category);
        budgetData.push(budget.amount);
        actualData.push(categoryExpenses[budget.category] || 0);
    });

    // Destroy existing chart
    if (budgetChart) {
        budgetChart.destroy();
    }

    if (labels.length === 0) {
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }

    budgetChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Budget',
                    data: budgetData,
                    backgroundColor: 'rgba(74, 144, 226, 0.6)',
                    borderColor: '#4A90E2',
                    borderWidth: 2
                },
                {
                    label: 'Actual',
                    data: actualData,
                    backgroundColor: 'rgba(231, 76, 60, 0.6)',
                    borderColor: '#E74C3C',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': Rs. ' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Rs. ' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update all charts
 */
async function updateAllCharts(bsYear, bsMonth) {
    await renderTrendChart(bsYear, bsMonth);
    await renderCategoryChart(bsYear, bsMonth);
}