/**
 * ========================================
 * BUDGET AND GOALS MANAGEMENT
 * Developer: Santosh Phuyal
 * ========================================
 */

/**
 * Update budget overview
 */
async function updateBudgetOverview(bsYear, bsMonth) {
    const budgets = await getMonthBudget(bsYear, bsMonth);
    const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);
    const spent = await getMonthlyExpense(bsYear, bsMonth);
    const remaining = totalBudget - spent;
    const percentage = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;

    document.getElementById('budgetTotal').textContent = `Rs. ${totalBudget.toLocaleString()}`;
    document.getElementById('budgetSpent').textContent = `Rs. ${spent.toLocaleString()}`;
    document.getElementById('budgetRemaining').textContent = `Rs. ${remaining.toLocaleString()}`;

    const progressFill = document.getElementById('budgetProgress');
    progressFill.style.width = `${Math.min(percentage, 100)}%`;

    // Change color based on percentage
    progressFill.classList.remove('warning', 'danger');
    if (percentage >= 100) {
        progressFill.classList.add('danger');
    } else if (percentage >= 80) {
        progressFill.classList.add('warning');
    }

    document.getElementById('budgetPercentage').textContent = `${percentage.toFixed(1)}%`;
}

/**
 * Render budget categories
 */
async function renderBudgetCategories(bsYear, bsMonth) {
    const container = document.getElementById('budgetCategories');
    const budgets = await getMonthBudget(bsYear, bsMonth);
    const { expenses } = await getMonthlyTransactions(bsYear, bsMonth);

    // Group expenses by category
    const categoryExpenses = {};
    expenses.forEach(expense => {
        const category = expense.category || 'Other';
        const amount = convertCurrency(parseFloat(expense.amount), expense.currency || 'NPR', 'NPR');
        categoryExpenses[category] = (categoryExpenses[category] || 0) + amount;
    });

    if (budgets.length === 0) {
        container.innerHTML = '<div class="loading">No budgets set for this month. Click "Set Budget" to add one.</div>';
        return;
    }

    container.innerHTML = budgets.map(budget => {
        const spent = categoryExpenses[budget.category] || 0;
        const remaining = budget.amount - spent;
        const percentage = (spent / budget.amount) * 100;

        let fillClass = '';
        if (percentage >= 100) fillClass = 'danger';
        else if (percentage >= 80) fillClass = 'warning';

        return `
            <div class="budget-category-item">
                <div class="budget-category-header">
                    <span class="budget-category-name">${budget.category}</span>
                    <span class="budget-category-amount ${remaining < 0 ? 'over' : ''}">
                        Rs. ${remaining.toLocaleString()}
                    </span>
                </div>
                <div class="budget-category-progress">
                    <div class="budget-category-fill ${fillClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div class="budget-category-stats">
                    <span>Spent: Rs. ${spent.toLocaleString()}</span>
                    <span>Budget: Rs. ${budget.amount.toLocaleString()}</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Show budget form
 */
function showBudgetForm(budget = null) {
    const today = getCurrentNepaliDate();
    const defaultMonth = formatBsDate(today.year, today.month, 1).substring(0, 7);

    const html = `
        <h2>${budget ? 'Edit' : 'Set'} Budget</h2>
        <form id="budgetForm">
            <div class="form-group">
                <label>Month (YYYY/MM)</label>
                <input type="text" id="budgetMonth" value="${budget ? budget.month : defaultMonth}" placeholder="2082/01" required>
            </div>
            <div class="form-group">
                <label>Category</label>
                <select id="budgetCategory" required>
                    <option value="Food" ${budget && budget.category === 'Food' ? 'selected' : ''}>Food</option>
                    <option value="Transport" ${budget && budget.category === 'Transport' ? 'selected' : ''}>Transport</option>
                    <option value="Shopping" ${budget && budget.category === 'Shopping' ? 'selected' : ''}>Shopping</option>
                    <option value="Bills" ${budget && budget.category === 'Bills' ? 'selected' : ''}>Bills</option>
                    <option value="Healthcare" ${budget && budget.category === 'Healthcare' ? 'selected' : ''}>Healthcare</option>
                    <option value="Entertainment" ${budget && budget.category === 'Entertainment' ? 'selected' : ''}>Entertainment</option>
                    <option value="Other" ${budget && budget.category === 'Other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Budget Amount (NPR)</label>
                <input type="number" id="budgetAmount" value="${budget ? budget.amount : ''}" step="0.01" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    `;

    showModal(html);

    document.getElementById('budgetForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            month: document.getElementById('budgetMonth').value,
            category: document.getElementById('budgetCategory').value,
            amount: parseFloat(document.getElementById('budgetAmount').value),
            createdAt: new Date().toISOString()
        };

        try {
            if (budget) {
                data.id = budget.id;
                await budgetDB.update(data);
            } else {
                await budgetDB.add(data);
            }

            closeModal();
            if (currentView === 'budget') {
                const [year, month] = data.month.split('/').map(Number);
                await updateBudgetOverview(year, month);
                await renderBudgetCategories(year, month);
                await renderBudgetChart(year, month);
            }
            alert('Budget saved!');
        } catch (error) {
            console.error('Error saving budget:', error);
            alert('Error saving budget.');
        }
    });
}

/**
 * Show bill form
 */
function showBillForm(bill = null) {
    const today = getCurrentNepaliDate();
    const defaultDate = formatBsDate(today.year, today.month, today.day);

    const html = `
        <h2>${bill ? 'Edit' : 'Add'} Bill</h2>
        <form id="billForm">
            <div class="form-group">
                <label>Bill Name</label>
                <input type="text" id="billName" value="${bill ? bill.name : ''}" placeholder="e.g., Electricity Bill" required>
            </div>
            <div class="form-group">
                <label>Amount (NPR)</label>
                <input type="number" id="billAmount" value="${bill ? bill.amount : ''}" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Due Date (BS)</label>
                <input type="text" id="billDueDate" value="${bill ? bill.dueDate : defaultDate}" required>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="billIsRecurring" ${bill && bill.isRecurring ? 'checked' : ''}>
                    <span>Recurring Bill</span>
                </label>
            </div>
            <div class="form-group" id="frequencyGroup" style="${bill && bill.isRecurring ? '' : 'display:none;'}">
                <label>Frequency</label>
                <select id="billFrequency">
                    <option value="monthly" ${bill && bill.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                    <option value="yearly" ${bill && bill.frequency === 'yearly' ? 'selected' : ''}>Yearly</option>
                </select>
            </div>
            <div class="form-group">
                <label>Category</label>
                <select id="billCategory">
                    <option value="Utilities" ${bill && bill.category === 'Utilities' ? 'selected' : ''}>Utilities</option>
                    <option value="Internet" ${bill && bill.category === 'Internet' ? 'selected' : ''}>Internet</option>
                    <option value="Rent" ${bill && bill.category === 'Rent' ? 'selected' : ''}>Rent</option>
                    <option value="Insurance" ${bill && bill.category === 'Insurance' ? 'selected' : ''}>Insurance</option>
                    <option value="Subscription" ${bill && bill.category === 'Subscription' ? 'selected' : ''}>Subscription</option>
                    <option value="Other" ${bill && bill.category === 'Other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    `;

    showModal(html);

    // Toggle frequency field
    document.getElementById('billIsRecurring').addEventListener('change', (e) => {
        document.getElementById('frequencyGroup').style.display = e.target.checked ? 'block' : 'none';
    });

    document.getElementById('billForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            name: document.getElementById('billName').value,
            amount: parseFloat(document.getElementById('billAmount').value),
            dueDate: document.getElementById('billDueDate').value,
            category: document.getElementById('billCategory').value,
            isRecurring: document.getElementById('billIsRecurring').checked,
            frequency: document.getElementById('billFrequency').value,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        try {
            if (bill) {
                data.id = bill.id;
                data.status = bill.status; // Preserve status
                await billDB.update(data);
            } else {
                await billDB.add(data);
            }

            closeModal();
            if (currentView === 'bills') {
                await renderBillsList();
                await renderUpcomingBillsList();
            }
            alert('Bill saved!');
        } catch (error) {
            console.error('Error saving bill:', error);
            alert('Error saving bill.');
        }
    });
}

/**
 * Render bills list
 */
async function renderBillsList() {
    const container = document.getElementById('billsList');
    const activeFilter = document.querySelector('#billsView .filter-btn.active').dataset.filter;
    
    let bills = await billDB.getAll();
    const today = getCurrentNepaliDate();
    const todayStr = formatBsDate(today.year, today.month, today.day);

    // Apply filter
    if (activeFilter !== 'all') {
        bills = bills.filter(bill => {
            if (activeFilter === 'overdue') {
                return bill.dueDate < todayStr && bill.status !== 'paid';
            }
            return bill.status === activeFilter;
        });
    }

    // Sort by due date
    bills.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    if (bills.length === 0) {
        container.innerHTML = '<div class="loading">No bills found</div>';
        return;
    }

    container.innerHTML = bills.map(bill => {
        const isOverdue = bill.dueDate < todayStr && bill.status !== 'paid';
        const isDueSoon = bill.dueDate >= todayStr && bill.dueDate <= addDaysToBsDate(todayStr, 3) && bill.status !== 'paid';
        
        let itemClass = 'bill-item';
        let dueDateClass = 'bill-due-date';
        
        if (bill.status === 'paid') {
            itemClass += ' paid';
        } else if (isOverdue) {
            itemClass += ' overdue';
            dueDateClass += ' overdue';
        } else if (isDueSoon) {
            itemClass += ' due-soon';
            dueDateClass += ' due-soon';
        }

        return `
            <div class="${itemClass}">
                <div class="bill-info">
                    <div class="bill-name">
                        ${bill.name}
                        ${bill.isRecurring ? '<span class="recurring-badge">🔄 ' + bill.frequency + '</span>' : ''}
                    </div>
                    <div class="${dueDateClass}">
                        Due: ${bill.dueDate}
                        ${isOverdue ? ' (Overdue!)' : ''}
                        ${isDueSoon ? ' (Due Soon)' : ''}
                    </div>
                </div>
                <div class="bill-amount">Rs. ${parseFloat(bill.amount).toLocaleString()}</div>
                <div class="bill-actions">
                    ${bill.status !== 'paid' ? `<button class="icon-btn" onclick="markBillPaid(${bill.id})">✓</button>` : ''}
                    <button class="icon-btn" onclick='showBillForm(${JSON.stringify(bill).replace(/'/g, "&apos;")})'>✏️</button>
                    <button class="icon-btn" onclick="deleteBill(${bill.id})">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Helper to add days to BS date
 */
function addDaysToBsDate(bsDateStr, days) {
    const [year, month, day] = bsDateStr.split('/').map(Number);
    const adDate = bsToAd(year, month, day);
    adDate.date.setDate(adDate.date.getDate() + days);
    const newBs = adToBs(adDate.date.getFullYear(), adDate.date.getMonth() + 1, adDate.date.getDate());
    return formatBsDate(newBs.year, newBs.month, newBs.day);
}

/**
 * Render upcoming bills
 */
async function renderUpcomingBillsList() {
    const container = document.getElementById('upcomingBillsList');
    const bills = await getUpcomingBills();

    if (bills.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No upcoming bills</p>';
        return;
    }

    const today = getCurrentNepaliDate();
    const todayStr = formatBsDate(today.year, today.month, today.day);

    container.innerHTML = bills.map(bill => {
        const isDueSoon = bill.dueDate <= addDaysToBsDate(todayStr, 3);
        return `
            <div class="bill-item ${isDueSoon ? 'due-soon' : ''}" style="margin-bottom: 0.75rem;">
                <div class="bill-info">
                    <div class="bill-name">${bill.name}</div>
                    <div class="bill-due-date ${isDueSoon ? 'due-soon' : ''}">Due: ${bill.dueDate}</div>
                </div>
                <div class="bill-amount">Rs. ${parseFloat(bill.amount).toLocaleString()}</div>
            </div>
        `;
    }).join('');
}

/**
 * Mark bill as paid
 */
async function markBillPaid(id) {
    const bill = await billDB.get(id);
    bill.status = 'paid';
    bill.paidAt = new Date().toISOString();

    // Add to expenses
    await expenseDB.add({
        date_bs: bill.dueDate,
        category: bill.category,
        amount: bill.amount,
        description: `Bill Payment: ${bill.name}`,
        currency: 'NPR',
        source: 'bill',
        createdAt: new Date().toISOString()
    });

    // If recurring, create next bill
    if (bill.isRecurring) {
        const [year, month, day] = bill.dueDate.split('/').map(Number);
        let nextYear = year;
        let nextMonth = month;

        if (bill.frequency === 'monthly') {
            nextMonth++;
            if (nextMonth > 12) {
                nextMonth = 1;
                nextYear++;
            }
        } else if (bill.frequency === 'yearly') {
            nextYear++;
        }

        // Adjust day if needed
        const daysInMonth = getDaysInBSMonth(nextYear, nextMonth);
        const nextDay = Math.min(day, daysInMonth);

        await billDB.add({
            ...bill,
            id: undefined,
            dueDate: formatBsDate(nextYear, nextMonth, nextDay),
            status: 'pending',
            createdAt: new Date().toISOString()
        });
    }

    await billDB.update(bill);
    await renderBillsList();
    await renderUpcomingBillsList();
    updateMonthlySummary();
}

/**
 * Delete bill
 */
async function deleteBill(id) {
    if (!confirm('Delete this bill?')) return;
    try {
        await billDB.delete(id);
        await renderBillsList();
        await renderUpcomingBillsList();
    } catch (error) {
        console.error('Error deleting bill:', error);
    }
}

/**
 * Show goal form
 */
function showGoalForm(goal = null) {
    const today = getCurrentNepaliDate();
    const defaultDate = formatBsDate(today.year + 1, today.month, today.day);

    const html = `
        <h2>${goal ? 'Edit' : 'Create'} Savings Goal</h2>
        <form id="goalForm">
            <div class="form-group">
                <label>Goal Name</label>
                <input type="text" id="goalName" value="${goal ? goal.name : ''}" placeholder="e.g., Dashain Shopping" required>
            </div>
            <div class="form-group">
                <label>Target Amount (NPR)</label>
                <input type="number" id="goalTarget" value="${goal ? goal.target : ''}" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Current Savings (NPR)</label>
                <input type="number" id="goalCurrent" value="${goal ? goal.current : 0}" step="0.01">
            </div>
            <div class="form-group">
                <label>Target Date (BS)</label>
                <input type="text" id="goalDate" value="${goal ? goal.targetDate : defaultDate}" required>
            </div>
            <div class="form-group">
                <label>Icon (Emoji)</label>
                <input type="text" id="goalIcon" value="${goal ? goal.icon : '🎯'}" maxlength="2">
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    `;

    showModal(html);

    document.getElementById('goalForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const target = parseFloat(document.getElementById('goalTarget').value);
        const current = parseFloat(document.getElementById('goalCurrent').value);

        const data = {
            name: document.getElementById('goalName').value,
            target: target,
            current: current,
            targetDate: document.getElementById('goalDate').value,
            icon: document.getElementById('goalIcon').value || '🎯',
            status: current >= target ? 'completed' : 'active',
            createdAt: goal ? goal.createdAt : new Date().toISOString()
        };

        try {
            if (goal) {
                data.id = goal.id;
                await goalDB.update(data);
            } else {
                await goalDB.add(data);
            }

            closeModal();
            if (currentView === 'goals') await renderGoalsGrid();
            alert('Goal saved!');
        } catch (error) {
            console.error('Error saving goal:', error);
            alert('Error saving goal.');
        }
    });
}

/**
 * Render goals grid
 */
async function renderGoalsGrid() {
    const container = document.getElementById('goalsGrid');
    const goals = await goalDB.getAll();

    if (goals.length === 0) {
        container.innerHTML = '<div class="loading">No goals yet. Create your first savings goal!</div>';
        return;
    }

    container.innerHTML = goals.map(goal => {
        const percentage = (goal.current / goal.target) * 100;
        const remaining = goal.target - goal.current;
        const isCompleted = goal.current >= goal.target;

        return `
            <div class="goal-card">
                <div class="goal-header">
                    <div class="goal-icon">${goal.icon}</div>
                    <div class="goal-menu">
                        <button class="icon-btn" onclick='showGoalForm(${JSON.stringify(goal).replace(/'/g, "&apos;")})'>✏️</button>
                        <button class="icon-btn" onclick="deleteGoal(${goal.id})">🗑️</button>
                    </div>
                </div>
                <div class="goal-title">${goal.name}</div>
                <div class="goal-target">Target: Rs. ${goal.target.toLocaleString()} by ${goal.targetDate}</div>
                
                ${isCompleted ? `
                    <div class="goal-completed">🎉 Goal Achieved!</div>
                ` : `
                    <div class="goal-progress-container">
                        <div class="goal-progress-bar">
                            <div class="goal-progress-fill" style="width: ${Math.min(percentage, 100)}%">
                                ${percentage.toFixed(0)}%
                            </div>
                        </div>
                    </div>
                    <div class="goal-stats">
                        <div class="goal-stat">
                            <div class="goal-stat-label">Saved</div>
                            <div class="goal-stat-value">Rs. ${goal.current.toLocaleString()}</div>
                        </div>
                        <div class="goal-stat">
                            <div class="goal-stat-label">Remaining</div>
                            <div class="goal-stat-value">Rs. ${remaining.toLocaleString()}</div>
                        </div>
                    </div>
                    <div class="goal-actions">
                        <button class="goal-btn primary" onclick="addToGoal(${goal.id})">💰 Add Money</button>
                    </div>
                `}
            </div>
        `;
    }).join('');
}

/**
 * Add money to goal
 */
async function addToGoal(id) {
    const amount = prompt('Enter amount to add (NPR):');
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return;

    const goal = await goalDB.get(id);
    goal.current += parseFloat(amount);
    
    if (goal.current >= goal.target) {
        goal.status = 'completed';
    }

    await goalDB.update(goal);
    await renderGoalsGrid();
}

/**
 * Delete goal
 */
async function deleteGoal(id) {
    if (!confirm('Delete this goal?')) return;
    try {
        await goalDB.delete(id);
        await renderGoalsGrid();
    } catch (error) {
        console.error('Error deleting goal:', error);
    }
}

/**
 * Nepal Tax Calculator (FY 2081/82 rates)
 */
function calculateNepalTax() {
    const income = parseFloat(document.getElementById('taxIncome').value);
    const maritalStatus = document.getElementById('taxMaritalStatus').value;

    if (!income || income <= 0) {
        alert('Please enter valid annual income');
        return;
    }

    // Tax brackets for individuals (FY 2081/82)
    const exemptionLimit = maritalStatus === 'married' ? 500000 : 400000;

    let tax = 0;
    const taxableIncome = Math.max(0, income - exemptionLimit);

    if (taxableIncome <= 0) {
        tax = 0;
    } else if (taxableIncome <= 100000) {
        tax = taxableIncome * 0.01;
    } else if (taxableIncome <= 200000) {
        tax = 1000 + (taxableIncome - 100000) * 0.10;
    } else if (taxableIncome <= 300000) {
        tax = 11000 + (taxableIncome - 200000) * 0.20;
    } else if (taxableIncome <= 2000000) {
        tax = 31000 + (taxableIncome - 300000) * 0.30;
    } else {
        tax = 541000 + (taxableIncome - 2000000) * 0.36;
    }

    // Social Security Tax (if applicable, capped)
    const sst = Math.min(income * 0.0031, 3100); // 0.31% capped at Rs. 3,100

    const totalTax = tax + sst;
    const netIncome = income - totalTax;

    const resultDiv = document.getElementById('taxResult');
    resultDiv.classList.add('show');
    resultDiv.innerHTML = `
        <h4>📋 Tax Calculation Result</h4>
        <div class="tax-breakdown">
            <div class="tax-row">
                <span>Gross Income:</span>
                <span>Rs. ${income.toLocaleString()}</span>
            </div>
            <div class="tax-row">
                <span>Tax-free Amount:</span>
                <span>Rs. ${exemptionLimit.toLocaleString()}</span>
            </div>
            <div class="tax-row">
                <span>Taxable Income:</span>
                <span>Rs. ${taxableIncome.toLocaleString()}</span>
            </div>
            <div class="tax-row">
                <span>Income Tax:</span>
                <span>Rs. ${tax.toLocaleString()}</span>
            </div>
            <div class="tax-row">
                <span>Social Security Tax:</span>
                <span>Rs. ${sst.toLocaleString()}</span>
            </div>
            <div class="tax-row">
                <span>Total Tax:</span>
                <span>Rs. ${totalTax.toLocaleString()}</span>
            </div>
            <div class="tax-row">
                <span>Net Income:</span>
                <span>Rs. ${netIncome.toLocaleString()}</span>
            </div>
        </div>
        <p style="margin-top: 1rem; font-size: 0.85rem; color: var(--text-secondary);">
            *Rates based on Nepal FY 2081/82. Consult a tax professional for accurate filing.
        </p>
    `;
}