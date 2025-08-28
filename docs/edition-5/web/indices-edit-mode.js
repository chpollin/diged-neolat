// Edit Mode functionality for indices.html
let isEditMode = false;
let hasChanges = false;
let teiDoc = null; // Store original TEI document for saving
let editHistory = [];

// Toggle edit mode
function toggleEditMode() {
    isEditMode = !isEditMode;
    const editBtn = document.getElementById('editToggleBtn');
    
    if (isEditMode) {
        editBtn.innerHTML = '💾 Save Changes';
        editBtn.style.backgroundColor = '#dc3545';
        enableEditMode();
    } else {
        if (hasChanges) {
            if (confirm('Do you want to save your changes to the TEI header?')) {
                saveTEIChanges();
            } else {
                hasChanges = false;
                editHistory = [];
            }
        }
        editBtn.innerHTML = '✏️ Edit Mode';
        editBtn.style.backgroundColor = '#28a745';
        disableEditMode();
    }
}

// Enable edit mode for all data
function enableEditMode() {
    // Add edit buttons to person cards
    document.querySelectorAll('.content-card').forEach(card => {
        addEditButtons(card);
    });
    
    // Add "Add New" buttons
    addNewItemButtons();
    
    console.log('Edit mode enabled');
}

// Disable edit mode
function disableEditMode() {
    // Remove all edit UI elements
    document.querySelectorAll('.edit-controls').forEach(el => el.remove());
    document.querySelectorAll('.add-new-btn').forEach(el => el.remove());
    
    // Make fields non-editable
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
        el.contentEditable = false;
        el.style.backgroundColor = '';
    });
    
    console.log('Edit mode disabled');
}

// Add edit buttons to cards
function addEditButtons(card) {
    const cardHeader = card.querySelector('.card-header');
    const cardBody = card.querySelector('.card-body');
    
    if (!cardHeader || cardBody.querySelector('.edit-controls')) return;
    
    const editControls = document.createElement('div');
    editControls.className = 'edit-controls';
    editControls.style.cssText = `
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #ddd;
        display: flex;
        gap: 0.5rem;
    `;
    
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️ Edit';
    editBtn.style.cssText = `
        padding: 0.5rem 1rem;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    editBtn.onclick = () => makeCardEditable(card);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️ Delete';
    deleteBtn.style.cssText = `
        padding: 0.5rem 1rem;
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    deleteBtn.onclick = () => deleteItem(card);
    
    editControls.appendChild(editBtn);
    editControls.appendChild(deleteBtn);
    cardBody.appendChild(editControls);
}

// Make card fields editable
function makeCardEditable(card) {
    const cardId = card.id;
    const type = cardId.split('-')[0]; // 'person', 'place', or 'relation'
    
    // Expand card if not already expanded
    card.classList.add('expanded');
    
    // Find editable fields based on type
    if (type === 'person') {
        makePersonEditable(card);
    } else if (type === 'place') {
        makePlaceEditable(card);
    } else if (type === 'relation') {
        makeRelationEditable(card);
    }
}

// Make person fields editable
function makePersonEditable(card) {
    const personId = card.id.replace('person-', '');
    const person = personsData.find(p => p.id === personId);
    if (!person) return;
    
    const cardBody = card.querySelector('.card-body');
    
    // Create edit form
    const editForm = document.createElement('div');
    editForm.className = 'edit-form';
    editForm.style.cssText = `
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 4px;
        margin-top: 1rem;
    `;
    
    editForm.innerHTML = `
        <h4>Edit Person</h4>
        <div style="margin-bottom: 0.5rem;">
            <label>Name:</label>
            <input type="text" id="edit-name-${personId}" value="${person.names.primary}" 
                   style="width: 100%; padding: 0.5rem; margin-top: 0.25rem;">
        </div>
        <div style="margin-bottom: 0.5rem;">
            <label>Role:</label>
            <input type="text" id="edit-role-${personId}" value="${person.role || ''}" 
                   style="width: 100%; padding: 0.5rem; margin-top: 0.25rem;">
        </div>
        <div style="margin-bottom: 0.5rem;">
            <label>Occupation:</label>
            <input type="text" id="edit-occupation-${personId}" value="${person.occupation || ''}" 
                   style="width: 100%; padding: 0.5rem; margin-top: 0.25rem;">
        </div>
        <div style="margin-bottom: 0.5rem;">
            <label>Birth Year:</label>
            <input type="text" id="edit-birth-${personId}" value="${person.birth?.when || ''}" 
                   style="width: 100%; padding: 0.5rem; margin-top: 0.25rem;">
        </div>
        <div style="margin-bottom: 0.5rem;">
            <label>Death Year:</label>
            <input type="text" id="edit-death-${personId}" value="${person.death?.when || ''}" 
                   style="width: 100%; padding: 0.5rem; margin-top: 0.25rem;">
        </div>
        <div style="margin-bottom: 0.5rem;">
            <label>Notes:</label>
            <textarea id="edit-notes-${personId}" style="width: 100%; padding: 0.5rem; margin-top: 0.25rem; min-height: 100px;">
${person.notes.map(n => n.content).join('\n')}
            </textarea>
        </div>
        <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
            <button onclick="savePersonEdits('${personId}')" 
                    style="padding: 0.5rem 1rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Save
            </button>
            <button onclick="cancelEdits('person-${personId}')" 
                    style="padding: 0.5rem 1rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Cancel
            </button>
        </div>
    `;
    
    // Replace or add edit form
    const existingForm = cardBody.querySelector('.edit-form');
    if (existingForm) {
        existingForm.remove();
    }
    cardBody.appendChild(editForm);
}

// Save person edits
function savePersonEdits(personId) {
    const person = personsData.find(p => p.id === personId);
    if (!person) return;
    
    // Get edited values
    const newName = document.getElementById(`edit-name-${personId}`).value;
    const newRole = document.getElementById(`edit-role-${personId}`).value;
    const newOccupation = document.getElementById(`edit-occupation-${personId}`).value;
    const newBirth = document.getElementById(`edit-birth-${personId}`).value;
    const newDeath = document.getElementById(`edit-death-${personId}`).value;
    const newNotes = document.getElementById(`edit-notes-${personId}`).value;
    
    // Store changes
    editHistory.push({
        type: 'person',
        id: personId,
        oldData: JSON.parse(JSON.stringify(person)),
        newData: {
            name: newName,
            role: newRole,
            occupation: newOccupation,
            birth: newBirth,
            death: newDeath,
            notes: newNotes
        }
    });
    
    // Update local data
    person.names.primary = newName;
    person.role = newRole;
    person.occupation = newOccupation;
    if (newBirth) {
        person.birth = { when: newBirth };
    }
    if (newDeath) {
        person.death = { when: newDeath };
    }
    person.notes = [{
        type: 'general',
        content: newNotes,
        appearances: []
    }];
    
    hasChanges = true;
    
    // Refresh display
    displayPersons(document.getElementById('person-search').value);
    
    alert('Person updated successfully. Click "Save Changes" button to save to TEI file.');
}

// Make place fields editable
function makePlaceEditable(card) {
    const placeId = card.id.replace('place-', '');
    const place = placesData.find(p => p.id === placeId);
    if (!place) return;
    
    const cardBody = card.querySelector('.card-body');
    
    // Create edit form
    const editForm = document.createElement('div');
    editForm.className = 'edit-form';
    editForm.style.cssText = `
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 4px;
        margin-top: 1rem;
    `;
    
    const primaryName = place.names[0]?.value || '';
    
    editForm.innerHTML = `
        <h4>Edit Place</h4>
        <div style="margin-bottom: 0.5rem;">
            <label>Name:</label>
            <input type="text" id="edit-place-name-${placeId}" value="${primaryName}" 
                   style="width: 100%; padding: 0.5rem; margin-top: 0.25rem;">
        </div>
        <div style="margin-bottom: 0.5rem;">
            <label>Type:</label>
            <select id="edit-place-type-${placeId}" style="width: 100%; padding: 0.5rem; margin-top: 0.25rem;">
                <option value="region" ${place.type === 'region' ? 'selected' : ''}>Region</option>
                <option value="city" ${place.type === 'city' ? 'selected' : ''}>City</option>
                <option value="town" ${place.type === 'town' ? 'selected' : ''}>Town</option>
                <option value="country" ${place.type === 'country' ? 'selected' : ''}>Country</option>
            </select>
        </div>
        <div style="margin-bottom: 0.5rem;">
            <label>Modern Name:</label>
            <input type="text" id="edit-place-modern-${placeId}" 
                   value="${place.names.find(n => n.type === 'modern')?.value || ''}" 
                   style="width: 100%; padding: 0.5rem; margin-top: 0.25rem;">
        </div>
        <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
            <button onclick="savePlaceEdits('${placeId}')" 
                    style="padding: 0.5rem 1rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Save
            </button>
            <button onclick="cancelEdits('place-${placeId}')" 
                    style="padding: 0.5rem 1rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Cancel
            </button>
        </div>
    `;
    
    // Replace or add edit form
    const existingForm = cardBody.querySelector('.edit-form');
    if (existingForm) {
        existingForm.remove();
    }
    cardBody.appendChild(editForm);
}

// Save place edits
function savePlaceEdits(placeId) {
    const place = placesData.find(p => p.id === placeId);
    if (!place) return;
    
    // Get edited values
    const newName = document.getElementById(`edit-place-name-${placeId}`).value;
    const newType = document.getElementById(`edit-place-type-${placeId}`).value;
    const newModernName = document.getElementById(`edit-place-modern-${placeId}`).value;
    
    // Store changes
    editHistory.push({
        type: 'place',
        id: placeId,
        oldData: JSON.parse(JSON.stringify(place)),
        newData: {
            name: newName,
            type: newType,
            modernName: newModernName
        }
    });
    
    // Update local data
    place.names = [{ value: newName }];
    if (newModernName) {
        place.names.push({ type: 'modern', value: newModernName });
    }
    place.type = newType;
    
    hasChanges = true;
    
    // Refresh display
    displayPlaces(document.getElementById('place-search').value);
    
    alert('Place updated successfully. Click "Save Changes" button to save to TEI file.');
}

// Make relation editable
function makeRelationEditable(card) {
    // Similar implementation for relations
    alert('Relation editing coming soon');
}

// Cancel edits
function cancelEdits(cardId) {
    const card = document.getElementById(cardId);
    if (card) {
        const editForm = card.querySelector('.edit-form');
        if (editForm) {
            editForm.remove();
        }
    }
}

// Delete item
function deleteItem(card) {
    const cardId = card.id;
    const type = cardId.split('-')[0];
    const itemId = cardId.replace(`${type}-`, '');
    
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
        editHistory.push({
            type: 'delete',
            itemType: type,
            id: itemId
        });
        
        // Remove from local data
        if (type === 'person') {
            const index = personsData.findIndex(p => p.id === itemId);
            if (index > -1) personsData.splice(index, 1);
            displayPersons();
        } else if (type === 'place') {
            const index = placesData.findIndex(p => p.id === itemId);
            if (index > -1) placesData.splice(index, 1);
            displayPlaces();
        }
        
        hasChanges = true;
        updateDashboard();
    }
}

// Add buttons to create new items
function addNewItemButtons() {
    // Add to persons tab
    const personsContent = document.getElementById('persons-content');
    if (personsContent && !personsContent.querySelector('.add-new-btn')) {
        const addBtn = document.createElement('button');
        addBtn.className = 'add-new-btn';
        addBtn.textContent = '➕ Add New Person';
        addBtn.style.cssText = `
            padding: 1rem 2rem;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-bottom: 1rem;
            font-size: 1rem;
        `;
        addBtn.onclick = () => createNewPerson();
        personsContent.parentNode.insertBefore(addBtn, personsContent);
    }
    
    // Add to places tab
    const placesContent = document.getElementById('places-content');
    if (placesContent && !placesContent.querySelector('.add-new-btn')) {
        const addBtn = document.createElement('button');
        addBtn.className = 'add-new-btn';
        addBtn.textContent = '➕ Add New Place';
        addBtn.style.cssText = `
            padding: 1rem 2rem;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-bottom: 1rem;
            font-size: 1rem;
        `;
        addBtn.onclick = () => createNewPlace();
        placesContent.parentNode.insertBefore(addBtn, placesContent);
    }
}

// Create new person
function createNewPerson() {
    const newId = `person-new-${Date.now()}`;
    const newPerson = {
        id: newId,
        names: { primary: 'New Person', alternate: [] },
        role: '',
        category: 'Other',
        birth: null,
        death: null,
        occupation: '',
        notes: [],
        occurrences: []
    };
    
    personsData.push(newPerson);
    displayPersons();
    
    // Auto-open edit form for new person
    setTimeout(() => {
        const card = document.getElementById(`person-${newId}`);
        if (card) {
            card.classList.add('expanded');
            makePersonEditable(card);
        }
    }, 100);
}

// Create new place
function createNewPlace() {
    const newId = `place-new-${Date.now()}`;
    const newPlace = {
        id: newId,
        type: 'city',
        names: [{ value: 'New Place' }],
        notes: [],
        occurrences: []
    };
    
    placesData.push(newPlace);
    displayPlaces();
    
    // Auto-open edit form for new place
    setTimeout(() => {
        const card = document.getElementById(`place-${newId}`);
        if (card) {
            card.classList.add('expanded');
            makePlaceEditable(card);
        }
    }, 100);
}

// Save TEI changes
async function saveTEIChanges() {
    if (!hasChanges) {
        alert('No changes to save');
        return;
    }
    
    try {
        // Reconstruct TEI with changes
        const updatedTEI = reconstructTEI();
        
        // Send to server
        const response = await fetch('http://localhost:3001/save-tei', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            body: updatedTEI
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(`Changes saved successfully to: ${result.filename}`);
            hasChanges = false;
            editHistory = [];
        } else {
            alert('Failed to save changes');
        }
    } catch (error) {
        console.error('Save error:', error);
        alert('Error saving changes: ' + error.message);
    }
}

// Reconstruct TEI with edits
function reconstructTEI() {
    if (!teiDoc) {
        console.error('No TEI document loaded');
        return null;
    }
    
    const teiClone = teiDoc.cloneNode(true);
    
    // Update persons in standOff
    const listPerson = teiClone.querySelector('standOff listPerson');
    if (listPerson) {
        // Clear existing persons
        listPerson.innerHTML = '';
        
        // Add updated persons
        personsData.forEach(person => {
            const personElem = teiClone.createElement('person');
            personElem.setAttribute('xml:id', person.id);
            if (person.role) {
                personElem.setAttribute('role', person.role);
            }
            
            // Add persName
            const persName = teiClone.createElement('persName');
            const forename = teiClone.createElement('forename');
            forename.textContent = person.names.primary;
            persName.appendChild(forename);
            personElem.appendChild(persName);
            
            // Add occupation if exists
            if (person.occupation) {
                const occupation = teiClone.createElement('occupation');
                occupation.textContent = person.occupation;
                personElem.appendChild(occupation);
            }
            
            // Add birth if exists
            if (person.birth?.when) {
                const birth = teiClone.createElement('birth');
                birth.setAttribute('when', person.birth.when);
                personElem.appendChild(birth);
            }
            
            // Add death if exists
            if (person.death?.when) {
                const death = teiClone.createElement('death');
                death.setAttribute('when', person.death.when);
                personElem.appendChild(death);
            }
            
            // Add notes
            person.notes.forEach(note => {
                const noteElem = teiClone.createElement('note');
                if (note.type) {
                    noteElem.setAttribute('type', note.type);
                }
                noteElem.textContent = note.content;
                personElem.appendChild(noteElem);
            });
            
            listPerson.appendChild(personElem);
        });
    }
    
    // Update places in standOff
    const listPlace = teiClone.querySelector('standOff listPlace');
    if (listPlace) {
        // Clear existing places
        listPlace.innerHTML = '';
        
        // Add updated places
        placesData.forEach(place => {
            const placeElem = teiClone.createElement('place');
            placeElem.setAttribute('xml:id', place.id);
            if (place.type) {
                placeElem.setAttribute('type', place.type);
            }
            
            // Add place names
            place.names.forEach(name => {
                const placeName = teiClone.createElement('placeName');
                if (name.type) {
                    placeName.setAttribute('type', name.type);
                }
                if (name.lang) {
                    placeName.setAttribute('xml:lang', name.lang);
                }
                placeName.textContent = name.value;
                placeElem.appendChild(placeName);
            });
            
            // Add notes
            place.notes.forEach(note => {
                const noteElem = teiClone.createElement('note');
                if (note.type) {
                    noteElem.setAttribute('type', note.type);
                }
                noteElem.textContent = note.content;
                placeElem.appendChild(noteElem);
            });
            
            listPlace.appendChild(placeElem);
        });
    }
    
    // Serialize back to XML
    const serializer = new XMLSerializer();
    return serializer.serializeToString(teiClone);
}

// Make functions globally accessible
window.toggleEditMode = toggleEditMode;
window.savePersonEdits = savePersonEdits;
window.savePlaceEdits = savePlaceEdits;
window.cancelEdits = cancelEdits;
window.createNewPerson = createNewPerson;
window.createNewPlace = createNewPlace;