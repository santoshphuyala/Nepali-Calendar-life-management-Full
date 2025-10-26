/**
 * ========================================
 * INSURANCE MANAGER MODULE
 * Developer: Santosh Phuyal
 * ========================================
 */

/**
 * Render insurance statistics
 */
async function renderInsuranceStats() {
    const allPolicies = await insuranceDB.getAll();
    const activePolicies = allPolicies.filter(p => p.status === 'active');
    
    const today = getCurrentNepaliDate();
    const todayStr = formatBsDate(today.year, today.month, today.day);
    const in30Days = addDaysToBsDate(todayStr, 30);
    
    const expiringSoon = activePolicies.filter(p => {
        return p.expiryDate >= todayStr && p.expiryDate <= in30Days;
    });

    const annualPremium = activePolicies.reduce((sum, p) => {
        const premium = parseFloat(p.premium);
        if (p.frequency === 'monthly') return sum + (premium * 12);
        if (p.frequency === 'quarterly') return sum + (premium * 4);
        if (p.frequency === 'half-yearly') return sum + (premium * 2);
        return sum + premium; // yearly
    }, 0);

    document.getElementById('totalPolicies').textContent = allPolicies.length;
    document.getElementById('activePolicies').textContent = activePolicies.length;
    document.getElementById('totalPremium').textContent = `Rs. ${annualPremium.toLocaleString()}`;
    document.getElementById('expiringSoon').textContent = expiringSoon.length;
}

/**
 * Show insurance form
 */
function showInsuranceForm(policy = null) {
    const today = getCurrentNepaliDate();
    const defaultExpiry = formatBsDate(today.year + 1, today.month, today.day);

    const html = `
        <h2>${policy ? 'Edit' : 'Add'} Insurance Policy</h2>
        <form id="insuranceForm">
            <div class="form-group">
                <label>Policy Type</label>
                <select id="insuranceType" required>
                    <option value="life" ${policy && policy.type === 'life' ? 'selected' : ''}>Life Insurance</option>
                    <option value="health" ${policy && policy.type === 'health' ? 'selected' : ''}>Health Insurance</option>
                    <option value="vehicle" ${policy && policy.type === 'vehicle' ? 'selected' : ''}>Vehicle Insurance</option>
                    <option value="property" ${policy && policy.type === 'property' ? 'selected' : ''}>Property Insurance</option>
                    <option value="travel" ${policy && policy.type === 'travel' ? 'selected' : ''}>Travel Insurance</option>
                    <option value="other" ${policy && policy.type === 'other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Policy Name</label>
                <input type="text" id="insuranceName" value="${policy ? policy.name : ''}" placeholder="e.g., Family Health Plus" required>
            </div>
            <div class="form-group">
                <label>Policy Number</label>
                <input type="text" id="insurancePolicyNumber" value="${policy ? policy.policyNumber : ''}" placeholder="e.g., POL-2025-12345" required>
            </div>
            <div class="form-group">
                <label>Insurance Provider</label>
                <input type="text" id="insuranceProvider" value="${policy ? policy.provider : ''}" placeholder="e.g., Nepal Life Insurance" required>
            </div>
            <div class="form-group">
                <label>Coverage Amount (NPR)</label>
                <input type="number" id="insuranceCoverage" value="${policy ? policy.coverage : ''}" step="1000" required>
            </div>
            <div class="form-group">
                <label>Premium Amount (NPR)</label>
                <input type="number" id="insurancePremium" value="${policy ? policy.premium : ''}" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Premium Frequency</label>
                <select id="insuranceFrequency" required>
                    <option value="monthly" ${policy && policy.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                    <option value="quarterly" ${policy && policy.frequency === 'quarterly' ? 'selected' : ''}>Quarterly</option>
                    <option value="half-yearly" ${policy && policy.frequency === 'half-yearly' ? 'selected' : ''}>Half-Yearly</option>
                    <option value="yearly" ${policy && policy.frequency === 'yearly' ? 'selected' : ''}>Yearly</option>
                </select>
            </div>
            <div class="form-group">
                <label>Start Date (BS)</label>
                <input type="text" id="insuranceStartDate" value="${policy ? policy.startDate : formatBsDate(today.year, today.month, today.day)}" required>
            </div>
            <div class="form-group">
                <label>Expiry Date (BS)</label>
                <input type="text" id="insuranceExpiryDate" value="${policy ? policy.expiryDate : defaultExpiry}" required>
            </div>
            <div class="form-group">
                <label>Beneficiary</label>
                <input type="text" id="insuranceBeneficiary" value="${policy ? policy.beneficiary : ''}" placeholder="e.g., Spouse, Parents">
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="insuranceStatus">
                    <option value="active" ${!policy || policy.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="expired" ${policy && policy.status === 'expired' ? 'selected' : ''}>Expired</option>
                    <option value="cancelled" ${policy && policy.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea id="insuranceNotes">${policy ? policy.notes || '' : ''}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save Policy</button>
            </div>
        </form>
    `;

    showModal(html);

    document.getElementById('insuranceForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            type: document.getElementById('insuranceType').value,
            name: document.getElementById('insuranceName').value,
            policyNumber: document.getElementById('insurancePolicyNumber').value,
            provider: document.getElementById('insuranceProvider').value,
            coverage: parseFloat(document.getElementById('insuranceCoverage').value),
            premium: parseFloat(document.getElementById('insurancePremium').value),
            frequency: document.getElementById('insuranceFrequency').value,
            startDate: document.getElementById('insuranceStartDate').value,
            expiryDate: document.getElementById('insuranceExpiryDate').value,
            beneficiary: document.getElementById('insuranceBeneficiary').value,
            status: document.getElementById('insuranceStatus').value,
            notes: document.getElementById('insuranceNotes').value,
            createdAt: policy ? policy.createdAt : new Date().toISOString()
        };

        try {
            if (policy) {
                data.id = policy.id;
                await insuranceDB.update(data);
            } else {
                await insuranceDB.add(data);
            }

            closeModal();
            if (currentView === 'insurance') {
                await renderInsuranceList();
                await renderInsuranceStats();
            }
            alert('Insurance policy saved successfully!');
        } catch (error) {
            console.error('Error saving insurance:', error);
            alert('Error saving policy. Please try again.');
        }
    });
}

/**
 * Render insurance list
 */
async function renderInsuranceList() {
    const container = document.getElementById('insuranceList');
    const activeFilter = document.querySelector('#insuranceView .filter-btn.active');
    const filter = activeFilter ? activeFilter.dataset.filter : 'all';

    let policies = await insuranceDB.getAll();

    // Apply filter
    if (filter !== 'all') {
        policies = policies.filter(p => p.type === filter);
    }

    // Sort by expiry date
    policies.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));

    if (policies.length === 0) {
        container.innerHTML = '<div class="loading">No insurance policies found</div>';
        return;
    }

    const today = getCurrentNepaliDate();
    const todayStr = formatBsDate(today.year, today.month, today.day);

    container.innerHTML = policies.map(policy => {
        const isExpiringSoon = policy.expiryDate >= todayStr && policy.expiryDate <= addDaysToBsDate(todayStr, 30);
        const isExpired = policy.expiryDate < todayStr;

        let statusClass = 'insurance-active';
        let statusBadge = '✓ Active';
        
        if (isExpired || policy.status === 'expired') {
            statusClass = 'insurance-expired';
            statusBadge = '✗ Expired';
        } else if (policy.status === 'cancelled') {
            statusClass = 'insurance-cancelled';
            statusBadge = '⊗ Cancelled';
        } else if (isExpiringSoon) {
            statusClass = 'insurance-expiring';
            statusBadge = '⚠ Expiring Soon';
        }

        const typeIcons = {
            life: '👤',
            health: '🏥',
            vehicle: '🚗',
            property: '🏠',
            travel: '✈️',
            other: '📋'
        };

        return `
            <div class="insurance-card ${statusClass}">
                <div class="insurance-header">
                    <div class="insurance-icon">${typeIcons[policy.type]}</div>
                    <div class="insurance-title-section">
                        <h3 class="insurance-title">${policy.name}</h3>
                        <p class="insurance-provider">${policy.provider}</p>
                    </div>
                    <span class="insurance-status-badge ${statusClass}">${statusBadge}</span>
                </div>
                
                <div class="insurance-details">
                    <div class="detail-row">
                        <span class="detail-label">Policy Number:</span>
                        <span class="detail-value">${policy.policyNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Coverage:</span>
                        <span class="detail-value">Rs. ${parseFloat(policy.coverage).toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Premium:</span>
                        <span class="detail-value">Rs. ${parseFloat(policy.premium).toLocaleString()} / ${policy.frequency}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Valid Period:</span>
                        <span class="detail-value">${policy.startDate} to ${policy.expiryDate}</span>
                    </div>
                    ${policy.beneficiary ? `
                    <div class="detail-row">
                        <span class="detail-label">Beneficiary:</span>
                        <span class="detail-value">${policy.beneficiary}</span>
                    </div>
                    ` : ''}
                </div>

                <div class="insurance-actions">
                    <button class="btn-secondary" onclick="viewInsuranceDetails(${policy.id})">📄 View</button>
                    <button class="btn-primary" onclick='showInsuranceForm(${JSON.stringify(policy).replace(/'/g, "&apos;")})'>✏️ Edit</button>
                    <button class="btn-danger" onclick="deleteInsurance(${policy.id})">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * View insurance details
 */
async function viewInsuranceDetails(id) {
    const policy = await insuranceDB.get(id);
    
    const typeIcons = {
        life: '👤',
        health: '🏥',
        vehicle: '🚗',
        property: '🏠',
        travel: '✈️',
        other: '📋'
    };

    const html = `
        <div class="insurance-detail-view">
            <div class="detail-header">
                <span class="detail-icon">${typeIcons[policy.type]}</span>
                <h2>${policy.name}</h2>
            </div>
            
            <div class="detail-section">
                <h3>Policy Information</h3>
                <table class="detail-table">
                    <tr><td>Policy Number:</td><td><strong>${policy.policyNumber}</strong></td></tr>
                    <tr><td>Provider:</td><td>${policy.provider}</td></tr>
                    <tr><td>Type:</td><td>${policy.type.charAt(0).toUpperCase() + policy.type.slice(1)}</td></tr>
                    <tr><td>Status:</td><td>${policy.status}</td></tr>
                </table>
            </div>

            <div class="detail-section">
                <h3>Coverage & Premium</h3>
                <table class="detail-table">
                    <tr><td>Coverage Amount:</td><td><strong>Rs. ${parseFloat(policy.coverage).toLocaleString()}</strong></td></tr>
                    <tr><td>Premium:</td><td>Rs. ${parseFloat(policy.premium).toLocaleString()}</td></tr>
                    <tr><td>Frequency:</td><td>${policy.frequency}</td></tr>
                </table>
            </div>

            <div class="detail-section">
                <h3>Validity</h3>
                <table class="detail-table">
                    <tr><td>Start Date:</td><td>${policy.startDate}</td></tr>
                    <tr><td>Expiry Date:</td><td>${policy.expiryDate}</td></tr>
                    <tr><td>Beneficiary:</td><td>${policy.beneficiary || 'Not specified'}</td></tr>
                </table>
            </div>

            ${policy.notes ? `
            <div class="detail-section">
                <h3>Notes</h3>
                <p>${policy.notes}</p>
            </div>
            ` : ''}

            <div class="form-actions">
                <button class="btn-secondary" onclick="closeModal()">Close</button>
                <button class="btn-primary" onclick='closeModal(); showInsuranceForm(${JSON.stringify(policy).replace(/'/g, "&apos;")})'>Edit Policy</button>
            </div>
        </div>
    `;

    showModal(html);
}

/**
 * Delete insurance
 */
async function deleteInsurance(id) {
    if (!confirm('Are you sure you want to delete this insurance policy?')) return;

    try {
        await insuranceDB.delete(id);
        await renderInsuranceList();
        await renderInsuranceStats();
        alert('Insurance policy deleted successfully!');
    } catch (error) {
        console.error('Error deleting insurance:', error);
        alert('Error deleting policy.');
    }
}

/**
 * Helper: Add days to BS date (simple version)
 */
function addDaysToBsDate(bsDateStr, days) {
    const [year, month, day] = bsDateStr.split('/').map(Number);
    const adDate = bsToAd(year, month, day);
    adDate.date.setDate(adDate.date.getDate() + days);
    const newBs = adToBs(adDate.date.getFullYear(), adDate.date.getMonth() + 1, adDate.date.getDate());
    return formatBsDate(newBs.year, newBs.month, newBs.day);
}