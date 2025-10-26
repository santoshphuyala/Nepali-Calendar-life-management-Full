/**
 * ========================================
 * SUBSCRIPTION MANAGER MODULE
 * Developer: Santosh Phuyal
 * ========================================
 */

/**
 * Render subscription summary
 */
async function renderSubscriptionSummary() {
    const allSubs = await subscriptionDB.getAll();
    const activeSubs = allSubs.filter(s => s.status === 'active');

    const monthlyTotal = activeSubs.reduce((sum, sub) => {
        const cost = parseFloat(sub.cost);
        if (sub.billingCycle === 'monthly') return sum + cost;
        if (sub.billingCycle === 'yearly') return sum + (cost / 12);
        if (sub.billingCycle === 'quarterly') return sum + (cost / 3);
        return sum;
    }, 0);

    const annualTotal = monthlyTotal * 12;

    document.getElementById('monthlySubCost').textContent = `Rs. ${monthlyTotal.toLocaleString()}`;
    document.getElementById('annualSubCost').textContent = `Rs. ${annualTotal.toLocaleString()}`;
    document.getElementById('activeSubCount').textContent = activeSubs.length;
}

/**
 * Show subscription form
 */
function showSubscriptionForm(subscription = null) {
    const today = getCurrentNepaliDate();
    const nextMonth = formatBsDate(today.year, today.month + 1 > 12 ? 1 : today.month + 1, today.day);

    const html = `
        <h2>${subscription ? 'Edit' : 'Add'} Subscription</h2>
        <form id="subscriptionForm">
            <div class="form-group">
                <label>Service Name</label>
                <input type="text" id="subName" value="${subscription ? subscription.name : ''}" placeholder="e.g., Netflix, Spotify" required>
            </div>
            <div class="form-group">
                <label>Category</label>
                <select id="subCategory" required>
                    <option value="streaming" ${subscription && subscription.category === 'streaming' ? 'selected' : ''}>📺 Streaming</option>
                    <option value="music" ${subscription && subscription.category === 'music' ? 'selected' : ''}>🎵 Music</option>
                    <option value="software" ${subscription && subscription.category === 'software' ? 'selected' : ''}>💻 Software</option>
                    <option value="cloud" ${subscription && subscription.category === 'cloud' ? 'selected' : ''}>☁️ Cloud Storage</option>
                    <option value="news" ${subscription && subscription.category === 'news' ? 'selected' : ''}>📰 News</option>
                    <option value="fitness" ${subscription && subscription.category === 'fitness' ? 'selected' : ''}>💪 Fitness</option>
                    <option value="gaming" ${subscription && subscription.category === 'gaming' ? 'selected' : ''}>🎮 Gaming</option>
                    <option value="other" ${subscription && subscription.category === 'other' ? 'selected' : ''}>📋 Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Cost</label>
                <input type="number" id="subCost" value="${subscription ? subscription.cost : ''}" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Currency</label>
                <select id="subCurrency">
                    <option value="NPR" ${!subscription || subscription.currency === 'NPR' ? 'selected' : ''}>NPR (रू)</option>
                    <option value="USD" ${subscription && subscription.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                    <option value="EUR" ${subscription && subscription.currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                    <option value="INR" ${subscription && subscription.currency === 'INR' ? 'selected' : ''}>INR (₹)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Billing Cycle</label>
                <select id="subBillingCycle" required>
                    <option value="monthly" ${!subscription || subscription.billingCycle === 'monthly' ? 'selected' : ''}>Monthly</option>
                    <option value="quarterly" ${subscription && subscription.billingCycle === 'quarterly' ? 'selected' : ''}>Quarterly</option>
                    <option value="yearly" ${subscription && subscription.billingCycle === 'yearly' ? 'selected' : ''}>Yearly</option>
                </select>
            </div>
            <div class="form-group">
                <label>Next Renewal Date (BS)</label>
                <input type="text" id="subRenewalDate" value="${subscription ? subscription.renewalDate : nextMonth}" required>
            </div>
            <div class="form-group">
                <label>Payment Method</label>
                <input type="text" id="subPaymentMethod" value="${subscription ? subscription.paymentMethod : ''}" placeholder="e.g., Credit Card, eSewa">
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="subStatus">
                    <option value="active" ${!subscription || subscription.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="paused" ${subscription && subscription.status === 'paused' ? 'selected' : ''}>Paused</option>
                    <option value="cancelled" ${subscription && subscription.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="subAutoRenew" ${!subscription || subscription.autoRenew ? 'checked' : ''}>
                    <span>Auto-renew</span>
                </label>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea id="subNotes">${subscription ? subscription.notes || '' : ''}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save Subscription</button>
            </div>
        </form>
    `;

    showModal(html);

    document.getElementById('subscriptionForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            name: document.getElementById('subName').value,
            category: document.getElementById('subCategory').value,
            cost: parseFloat(document.getElementById('subCost').value),
            currency: document.getElementById('subCurrency').value,
            billingCycle: document.getElementById('subBillingCycle').value,
            renewalDate: document.getElementById('subRenewalDate').value,
            paymentMethod: document.getElementById('subPaymentMethod').value,
            status: document.getElementById('subStatus').value,
            autoRenew: document.getElementById('subAutoRenew').checked,
            notes: document.getElementById('subNotes').value,
            createdAt: subscription ? subscription.createdAt : new Date().toISOString()
        };

        try {
            if (subscription) {
                data.id = subscription.id;
                await subscriptionDB.update(data);
            } else {
                await subscriptionDB.add(data);
            }

            closeModal();
            if (currentView === 'subscription') {
                await renderSubscriptionList();
                await renderSubscriptionSummary();
            }
            alert('Subscription saved!');
        } catch (error) {
            console.error('Error saving subscription:', error);
            alert('Error saving subscription.');
        }
    });
}

/**
 * Render subscription list
 */
async function renderSubscriptionList() {
    const container = document.getElementById('subscriptionList');
    const activeFilter = document.querySelector('#subscriptionView .filter-btn.active');
    const filter = activeFilter ? activeFilter.dataset.filter : 'all';

    let subscriptions = await subscriptionDB.getAll();

    if (filter !== 'all') {
        subscriptions = subscriptions.filter(s => s.status === filter);
    }

    subscriptions.sort((a, b) => a.renewalDate.localeCompare(b.renewalDate));

    if (subscriptions.length === 0) {
        container.innerHTML = '<div class="loading">No subscriptions found</div>';
        return;
    }

    const categoryIcons = {
        streaming: '📺',
        music: '🎵',
        software: '💻',
        cloud: '☁️',
        news: '📰',
        fitness: '💪',
        gaming: '🎮',
        other: '📋'
    };

    const today = getCurrentNepaliDate();
    const todayStr = formatBsDate(today.year, today.month, today.day);

    container.innerHTML = subscriptions.map(sub => {
        const costInNPR = convertCurrency(sub.cost, sub.currency, 'NPR');
        const isDueSoon = sub.renewalDate <= addDaysToBsDate(todayStr, 7) && sub.status === 'active';

        let statusClass = '';
        if (sub.status === 'active') statusClass = 'sub-active';
        if (sub.status === 'paused') statusClass = 'sub-paused';
        if (sub.status === 'cancelled') statusClass = 'sub-cancelled';
        if (isDueSoon) statusClass += ' sub-due-soon';

        return `
            <div class="subscription-item ${statusClass}">
                <div class="sub-header">
                    <span class="sub-icon">${categoryIcons[sub.category]}</span>
                    <div class="sub-info">
                        <h4 class="sub-name">${sub.name}</h4>
                        <p class="sub-category">${sub.category.charAt(0).toUpperCase() + sub.category.slice(1)}</p>
                    </div>
                    <span class="sub-status-badge">${sub.status}</span>
                </div>

                <div class="sub-details">
                    <div class="sub-cost">
                        <span class="cost-amount">${getCurrencySymbol(sub.currency)} ${parseFloat(sub.cost).toLocaleString()}</span>
                        <span class="cost-cycle">/ ${sub.billingCycle}</span>
                        ${sub.currency !== 'NPR' ? `<br><small style="color: var(--text-secondary);">≈ रू ${costInNPR.toLocaleString()} / ${sub.billingCycle}</small>` : ''}
                    </div>
                    <div class="sub-renewal">
                        <span class="label">Next Renewal:</span>
                        <span class="value ${isDueSoon ? 'text-warning' : ''}">${sub.renewalDate}</span>
                        ${isDueSoon ? '<br><span class="badge-warning">⚠ Due Soon</span>' : ''}
                    </div>
                    ${sub.paymentMethod ? `
                    <div class="sub-payment">
                        <span class="label">Payment:</span>
                        <span class="value">${sub.paymentMethod}</span>
                    </div>
                    ` : ''}
                </div>

                <div class="sub-actions">
                    ${sub.status === 'active' ? `<button class="btn-secondary btn-sm" onclick="renewSubscription(${sub.id})">🔄 Renew</button>` : ''}
                    <button class="btn-primary btn-sm" onclick='showSubscriptionForm(${JSON.stringify(sub).replace(/'/g, "&apos;")})'>✏️ Edit</button>
                    <button class="btn-danger btn-sm" onclick="deleteSubscription(${sub.id})">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Renew subscription
 */
async function renewSubscription(id) {
    const sub = await subscriptionDB.get(id);
    
    // Add expense
    const today = getCurrentNepaliDate();
    await expenseDB.add({
        date_bs: formatBsDate(today.year, today.month, today.day),
        category: 'Subscription',
        amount: sub.cost,
        currency: sub.currency,
        description: `${sub.name} - ${sub.billingCycle} subscription`,
        source: 'subscription',
        createdAt: new Date().toISOString()
    });

    // Update renewal date
    const [year, month, day] = sub.renewalDate.split('/').map(Number);
    let newYear = year;
    let newMonth = month;

    if (sub.billingCycle === 'monthly') {
        newMonth += 1;
        if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
        }
    } else if (sub.billingCycle === 'quarterly') {
        newMonth += 3;
        while (newMonth > 12) {
            newMonth -= 12;
            newYear += 1;
        }
    } else if (sub.billingCycle === 'yearly') {
        newYear += 1;
    }

    sub.renewalDate = formatBsDate(newYear, newMonth, day);
    await subscriptionDB.update(sub);

    await renderSubscriptionList();
    await renderSubscriptionSummary();
    alert('Subscription renewed and expense added!');
}

/**
 * Delete subscription
 */
async function deleteSubscription(id) {
    if (!confirm('Delete this subscription?')) return;

    try {
        await subscriptionDB.delete(id);
        await renderSubscriptionList();
        await renderSubscriptionSummary();
        alert('Subscription deleted!');
    } catch (error) {
        console.error('Error deleting subscription:', error);
        alert('Error deleting subscription.');
    }
}

/**
 * Get currency symbol helper
 */
function getCurrencySymbol(currency) {
    const symbols = {
        NPR: 'रू',
        USD: '$',
        EUR: '€',
        INR: '₹'
    };
    return symbols[currency] || currency;
}