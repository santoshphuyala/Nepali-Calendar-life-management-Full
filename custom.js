/**
 * ========================================
 * CUSTOM DATA MANAGER MODULE
 * Developer: Santosh Phuyal
 * ========================================
 */

let selectedCustomTypeId = null;

/**
 * Render custom types
 */
async function renderCustomTypes() {
    const container = document.getElementById('customTypes');
    const types = await customTypeDB.getAll();

    if (types.length === 0) {
        container.innerHTML = `
            <div class="custom-empty">
                <p>No custom data types created yet.</p>
                <p>Create custom types to track any kind of data (e.g., Books, Recipes, Contacts, etc.)</p>
            </div>
        `;
        document.getElementById('customItems').innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div class="custom-type-tabs">
            ${types.map(type => `
                <button class="custom-type-tab ${selectedCustomTypeId === type.id ? 'active' : ''}" 
                        onclick="selectCustomType(${type.id})">
                    ${type.icon || '📋'} ${type.name} 
                    <button class="type-delete-btn" onclick="event.stopPropagation(); deleteCustomType(${type.id})">×</button>
                </button>
            `).join('')}
        </div>
    `;

    if (selectedCustomTypeId) {
        await renderCustomItems(selectedCustomTypeId);
    } else if (types.length > 0) {
        selectCustomType(types[0].id);
    }
}

/**
 * Select custom type
 */
async function selectCustomType(typeId) {
    selectedCustomTypeId = typeId;
    await renderCustomTypes();
}

/**
 * Show custom type form
 */
function showCustomTypeForm(type = null) {
    const html = `
        <h2>${type ? 'Edit' : 'Create'} Custom Data Type</h2>
        <form id="customTypeForm">
            <div class="form-group">
                <label>Type Name</label>
                <input type="text" id="customTypeName" value="${type ? type.name : ''}" 
                       placeholder="e.g., Books, Recipes, Contacts" required>
            </div>
            <div class="form-group">
                <label>Icon (Emoji)</label>
                <input type="text" id="customTypeIcon" value="${type ? type.icon : '📋'}" maxlength="2">
            </div>
            <div class="form-group">
                <label>Fields (comma-separated)</label>
                <input type="text" id="customTypeFields" value="${type ? type.fields.join(', ') : ''}" 
                       placeholder="e.g., Title, Author, Year" required>
                <small>Enter field names separated by commas</small>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save Type</button>
            </div>
        </form>
    `;

    showModal(html);

    document.getElementById('customTypeForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const fieldsStr = document.getElementById('customTypeFields').value;
        const fields = fieldsStr.split(',').map(f => f.trim()).filter(f => f);

        if (fields.length === 0) {
            alert('Please enter at least one field');
            return;
        }

        const data = {
            name: document.getElementById('customTypeName').value,
            icon: document.getElementById('customTypeIcon').value || '📋',
            fields: fields,
            createdAt: type ? type.createdAt : new Date().toISOString()
        };

        try {
            if (type) {
                data.id = type.id;
                await customTypeDB.update(data);
            } else {
                const id = await customTypeDB.add(data);
                selectedCustomTypeId = id;
            }

            closeModal();
            await renderCustomTypes();
            alert('Custom type saved!');
        } catch (error) {
            console.error('Error saving custom type:', error);
            alert('Error: ' + error.message);
        }
    });
}

/**
 * Delete custom type
 */
async function deleteCustomType(id) {
    if (!confirm('Delete this custom type? All items will also be deleted.')) return;

    try {
        // Delete all items of this type
        const items = await customItemDB.getByIndex('typeId', id);
        for (const item of items) {
            await customItemDB.delete(item.id);
        }

        await customTypeDB.delete(id);
        
        if (selectedCustomTypeId === id) {
            selectedCustomTypeId = null;
        }

        await renderCustomTypes();
        alert('Custom type deleted!');
    } catch (error) {
        console.error('Error deleting type:', error);
        alert('Error deleting type.');
    }
}

/**
 * Render custom items
 */
async function renderCustomItems(typeId) {
    const container = document.getElementById('customItems');
    const type = await customTypeDB.get(typeId);
    const items = await customItemDB.getByIndex('typeId', typeId);

    let html = `
        <div class="custom-items-header">
            <h3>${type.icon} ${type.name}</h3>
            <div>
                <button class="btn-secondary" onclick='showCustomTypeForm(${JSON.stringify(type).replace(/'/g, "&apos;")})'>✏️ Edit Type</button>
                <button class="btn-primary" onclick="showCustomItemForm(${typeId})">+ Add ${type.name}</button>
            </div>
        </div>

        <div class="custom-items-grid">
    `;

    if (items.length === 0) {
        html += `<div class="loading">No ${type.name.toLowerCase()} added yet</div>`;
    } else {
        items.forEach(item => {
            html += `
                <div class="custom-item-card">
                    <div class="custom-item-content">
                        ${type.fields.map(field => `
                            <div class="custom-field">
                                <span class="field-label">${field}:</span>
                                <span class="field-value">${item.data[field] || 'N/A'}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="custom-item-actions">
                        <button class="btn-primary btn-sm" onclick='showCustomItemForm(${typeId}, ${JSON.stringify(item).replace(/'/g, "&apos;")})'>✏️</button>
                        <button class="btn-danger btn-sm" onclick="deleteCustomItem(${item.id})">🗑️</button>
                    </div>
                </div>
            `;
        });
    }

    html += `</div>`;

    container.innerHTML = html;
}

/**
 * Show custom item form
 */
async function showCustomItemForm(typeId, item = null) {
    const type = await customTypeDB.get(typeId);

    let html = `
        <h2>${item ? 'Edit' : 'Add'} ${type.name}</h2>
        <form id="customItemForm">
    `;

    type.fields.forEach(field => {
        const value = item && item.data[field] ? item.data[field] : '';
        html += `
            <div class="form-group">
                <label>${field}</label>
                <input type="text" class="custom-field-input" data-field="${field}" value="${value}" required>
            </div>
        `;
    });

    html += `
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    `;

    showModal(html);

    document.getElementById('customItemForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            typeId: typeId,
            data: {},
            createdAt: item ? item.createdAt : new Date().toISOString()
        };

        document.querySelectorAll('.custom-field-input').forEach(input => {
            const field = input.dataset.field;
            data.data[field] = input.value;
        });

        try {
            if (item) {
                data.id = item.id;
                await customItemDB.update(data);
            } else {
                await customItemDB.add(data);
            }

            closeModal();
            await renderCustomItems(typeId);
            alert(`${type.name} saved!`);
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Error saving item.');
        }
    });
}

/**
 * Delete custom item
 */
async function deleteCustomItem(id) {
    if (!confirm('Delete this item?')) return;

    try {
        await customItemDB.delete(id);
        await renderCustomItems(selectedCustomTypeId);
        alert('Item deleted!');
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item.');
    }
}