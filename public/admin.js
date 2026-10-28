/**
 * MathPrep - Admin Content Studio
 * Admin controller for AI Curriculum Generation, Firestore curriculum sync, and sub-unit management
 */

// ============================================================================
// 1. AP PRECALCULUS CURRICULUM REGISTRY (ALL 4 UNITS, 58+ STANDARD TOPICS)
// ============================================================================
const AP_CURRICULUM_TOPICS = {
  1: [
    { id: '1.1', title: 'Change in Tandem' },
    { id: '1.2', title: 'Rates of Change' },
    { id: '1.3', title: 'Rates of Change in Linear & Quadratic Functions' },
    { id: '1.4', title: 'Polynomial Functions & Rates of Change' },
    { id: '1.5', title: 'Polynomial Functions & Complex Zeros' },
    { id: '1.6', title: 'Polynomial Functions & End Behavior' },
    { id: '1.7', title: 'Rational Functions & End Behavior' },
    { id: '1.8', title: 'Rational Functions & Zeros' },
    { id: '1.9', title: 'Rational Functions & Vertical Asymptotes' },
    { id: '1.10', title: 'Rational Functions & Holes' },
    { id: '1.11', title: 'Equivalent Representations of Polynomial & Rational Functions' },
    { id: '1.12', title: 'Transformations of Functions' },
    { id: '1.13', title: 'Function Model Selection & Assumption Articulation' },
    { id: '1.14', title: 'Function Model Construction & Application' },
  ],
  2: [
    { id: '2.1', title: 'Change in Arithmetic & Geometric Sequences' },
    { id: '2.2', title: 'Exponential Functions' },
    { id: '2.3', title: 'Exponential Function Manipulation' },
    { id: '2.4', title: 'Exponential Function Context & Data Modeling' },
    { id: '2.5', title: 'Competing Function Model Validation' },
    { id: '2.6', title: 'Logarithmic Expressions' },
    { id: '2.7', title: 'Inverse Functions' },
    { id: '2.8', title: 'Logarithmic Functions' },
    { id: '2.9', title: 'Logarithmic Function Manipulation' },
    { id: '2.10', title: 'Exponential & Logarithmic Equations & Inequalities' },
    { id: '2.11', title: 'Logarithmic Function Context & Data Modeling' },
    { id: '2.12', title: 'Semi-log Plots' },
    { id: '2.13', title: 'Function Transformations with Logarithms' },
    { id: '2.14', title: 'Compound Interest & Euler’s Constant e' },
    { id: '2.15', title: 'Logistic Growth Models' },
  ],
  3: [
    { id: '3.1', title: 'Periodic Phenomena' },
    { id: '3.2', title: 'Sine, Cosine, & Tangent in the Unit Circle' },
    { id: '3.3', title: 'Sine & Cosine Function Values' },
    { id: '3.4', title: 'Sine & Cosine Function Graphs' },
    { id: '3.5', title: 'Sinusoidal Functions' },
    { id: '3.6', title: 'Sinusoidal Function Context & Data Modeling' },
    { id: '3.7', title: 'Tangent Function Values & Graphs' },
    { id: '3.8', title: 'Inverse Trigonometric Functions' },
    { id: '3.9', title: 'Trigonometric Equations & Inequalities' },
    { id: '3.10', title: 'Secant, Cosecant, & Cotangent Functions' },
    { id: '3.11', title: 'Trigonometric Identities & Pythagorean Theorem' },
    { id: '3.12', title: 'Sum, Difference, & Double-Angle Identities' },
    { id: '3.13', title: 'Polar Coordinates' },
    { id: '3.14', title: 'Polar Function Graphs' },
    { id: '3.15', title: 'Rates of Change in Polar Functions' },
  ],
  4: [
    { id: '4.1', title: 'Parametric Functions' },
    { id: '4.2', title: 'Parametric Function Context & Data Modeling' },
    { id: '4.3', title: 'Parametric Functions & Velocity' },
    { id: '4.4', title: 'Planar Motion Modeling' },
    { id: '4.5', title: 'Implicitly Defined Functions' },
    { id: '4.6', title: 'Conic Sections & Eccentricity' },
    { id: '4.7', title: 'Vectors & Direction Angles' },
    { id: '4.8', title: 'Vector Components & Unit Vectors' },
    { id: '4.9', title: 'Vector Operations & Scalar Multiplication' },
    { id: '4.10', title: 'Vector Dot Products & Orthogonality' },
    { id: '4.11', title: 'Vector Context & Data Modeling' },
    { id: '4.12', title: 'Matrices & Systems of Equations' },
    { id: '4.13', title: 'Matrix Multiplication & Inverses' },
    { id: '4.14', title: 'Linear Transformations via 2x2 Matrices' },
  ],
};

let currentGeneratedJSON = null;

// ============================================================================
// 2. FIRESTORE DATABASE INSTANCE ACCESSOR
// ============================================================================
function getFirestoreInstance() {
  if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
    try {
      const dbId = window.firebaseConfig?.firestoreDatabaseId;
      if (dbId) {
        return firebase.app().firestore(dbId);
      }
      return firebase.firestore();
    } catch (e) {
      return firebase.firestore();
    }
  }
  return null;
}

// ============================================================================
// 3. FIRESTORE WRITE LOGIC (Requirement 3)
// ============================================================================

/**
 * Saves or overwrites a topic document inside Firestore collection 'curriculum'
 * Document path: curriculum/{topicId}
 */
async function saveToFirestore(topicId, jsonPayload) {
  if (!topicId) {
    window.showToast?.('Please specify a valid topic ID before saving.', 'warning');
    return false;
  }

  const db = getFirestoreInstance();
  if (!db) {
    window.showToast?.('Firebase Firestore is not initialized.', 'error');
    return false;
  }

  // Ensure topicId formatted as topic_1_1 style
  const normalizedId = topicId.startsWith('topic_')
    ? topicId
    : `topic_${topicId.replace(/[^0-9]/g, '_')}`;

  const documentData = {
    ...jsonPayload,
    topicId: normalizedId,
    updatedAt: new Date().toISOString(),
    updatedBy: window.ADMIN_EMAIL || 'Searsokvarkhim1@gmail.com',
  };

  try {
    await db.collection('curriculum').doc(normalizedId).set(documentData, { merge: true });
    window.showToast?.(`Topic ${normalizedId} successfully saved to Firestore database!`, 'success');
    
    // Refresh manager list if manager view is active
    fetchCurriculumList();
    return true;
  } catch (error) {
    console.error('Firestore saveToFirestore error:', error);
    window.showToast?.(`Error saving to Firestore: ${error.message || 'Permission denied'}`, 'error');
    return false;
  }
}

/**
 * Deletes a topic document from collection 'curriculum'
 */
async function deleteFromFirestore(topicId) {
  if (!confirm(`Are you sure you want to permanently delete "${topicId}" from the Firestore curriculum collection?`)) {
    return;
  }

  const db = getFirestoreInstance();
  if (!db) {
    window.showToast?.('Firebase Firestore not ready.', 'error');
    return;
  }

  try {
    await db.collection('curriculum').doc(topicId).delete();
    window.showToast?.(`Topic ${topicId} deleted from Firestore.`, 'success');
    fetchCurriculumList();
  } catch (error) {
    console.error('Delete topic error:', error);
    window.showToast?.(`Failed to delete: ${error.message}`, 'error');
  }
}

/**
 * Fetches all curriculum items from Firestore collection 'curriculum'
 */
async function fetchCurriculumList() {
  const db = getFirestoreInstance();
  const listContainer = document.getElementById('curriculum-list-container');
  const countBadge = document.getElementById('curriculum-count-badge');
  if (!listContainer) return;

  if (!db) {
    listContainer.innerHTML = `
      <div class="text-center py-8 text-slate-500 text-sm">
        Connecting to Firestore database...
      </div>`;
    return;
  }

  try {
    listContainer.innerHTML = `
      <div class="text-center py-8 text-slate-500 text-sm flex items-center justify-center gap-2">
        <span class="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></span>
        <span>Fetching live curriculum documents from Firestore...</span>
      </div>`;

    const snapshot = await db.collection('curriculum').get();
    const docs = [];
    snapshot.forEach(docSnap => {
      docs.push({ id: docSnap.id, data: docSnap.data() });
    });

    if (countBadge) {
      countBadge.textContent = `${docs.length} Synchronized`;
    }

    if (docs.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 p-6">
          <div class="text-3xl mb-2">📚</div>
          <h4 class="text-sm font-bold text-slate-800">No Custom Sub-Units in Firestore Yet</h4>
          <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Use the "Lesson & Practice Generator" tab above to generate rich AP lessons with DeepSeek AI and save them directly to your cloud collection.
          </p>
          <button onclick="switchAdminTab('generator')" class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer">
            Go to AI Generator
          </button>
        </div>`;
      return;
    }

    // Sort by unit number and topic ID
    docs.sort((a, b) => {
      const uA = a.data.unitNumber || 0;
      const uB = b.data.unitNumber || 0;
      if (uA !== uB) return uA - uB;
      return a.id.localeCompare(b.id, undefined, { numeric: true });
    });

    // Render cards
    let html = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">`;
    docs.forEach(({ id, data }) => {
      const title = data.title || id;
      const unit = data.unitNumber || 1;
      const scope = data.scope || 'complete';
      const updated = data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : 'Just now';

      html += `
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span class="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Unit ${unit}</span>
              <span class="text-[11px] font-mono uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">${scope}</span>
            </div>
            <h4 class="text-sm font-bold text-slate-900 leading-snug line-clamp-1 mb-1" title="${title}">${title}</h4>
            <div class="text-[11px] font-mono text-slate-400 mb-3">${id}</div>
            <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
              ${data.lesson?.summary || data.summary || (data.questions ? `${data.questions.length} Practice Questions` : 'Curriculum content')}
            </p>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="text-[11px] text-slate-400">${updated}</span>
            <div class="flex items-center gap-1.5">
              <button onclick="viewCurriculumDoc('${id}')" class="px-2 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer" title="View formatted JSON">
                👁️ View
              </button>
              <button onclick="editCurriculumDoc('${id}')" class="px-2 py-1 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors cursor-pointer" title="Load into editor">
                ✏️ Edit
              </button>
              <button onclick="deleteFromFirestore('${id}')" class="px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer" title="Delete from database">
                🗑️
              </button>
            </div>
          </div>
        </div>`;
    });
    html += `</div>`;

    listContainer.innerHTML = html;
  } catch (error) {
    console.error('Error fetching curriculum documents:', error);
    listContainer.innerHTML = `
      <div class="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
        Failed to fetch curriculum from Firestore: ${error.message}
      </div>`;
  }
}

// ============================================================================
// 4. LESSON & PRACTICE GENERATOR ACTIONS (Requirement 2A)
// ============================================================================

function updateTopicDropdown(selectedUnit = 1) {
  const topicSelect = document.getElementById('admin-topic-select');
  if (!topicSelect) return;

  const topics = AP_CURRICULUM_TOPICS[selectedUnit] || AP_CURRICULUM_TOPICS[1];
  topicSelect.innerHTML = topics
    .map(t => `<option value="${t.id}">${t.id}: ${t.title}</option>`)
    .join('');
}

async function triggerAIGeneration() {
  const unitSelect = document.getElementById('admin-unit-select');
  const topicSelect = document.getElementById('admin-topic-select');
  const promptInput = document.getElementById('admin-prompt-input');
  const generateBtn = document.getElementById('admin-generate-btn');
  const previewBox = document.getElementById('admin-json-preview');
  const saveBtn = document.getElementById('admin-save-firestore-btn');

  if (!unitSelect || !topicSelect || !previewBox) return;

  const unit = unitSelect.value;
  const topicId = topicSelect.value;
  const topicTitle = topicSelect.options[topicSelect.selectedIndex]?.text?.split(': ')[1] || 'Sub-Unit';
  const selectedScopeEl = document.querySelector('input[name="admin-scope"]:checked');
  const scope = selectedScopeEl ? selectedScopeEl.value : 'complete';
  const instructions = promptInput ? promptInput.value.trim() : '';

  // UI loading state
  if (generateBtn) {
    generateBtn.disabled = true;
    generateBtn.innerHTML = `
      <span class="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin inline-block mr-1"></span>
      Generating with DeepSeek AI...`;
  }

  previewBox.textContent = '// Synthesizing AP Precalculus lesson & practice questions via DeepSeek API...\n// Please wait 3-5 seconds...';

  try {
    const res = await fetch('/api/admin/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unit, topicId, topicTitle, scope, instructions }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.success && data.payload) {
      currentGeneratedJSON = data.payload;
      renderSyntaxHighlightedJSON(data.payload, previewBox);
      if (saveBtn) saveBtn.disabled = false;
      window.showToast?.(`AI successfully generated Topic ${topicId}!`, 'success');
    } else {
      throw new Error(data.error || 'Failed to generate curriculum');
    }
  } catch (err) {
    console.error('AI generation error:', err);
    previewBox.textContent = `// Error during AI generation: ${err.message}\n// Check your network or server logs.`;
    window.showToast?.('AI Generation failed. Check console.', 'error');
  } finally {
    if (generateBtn) {
      generateBtn.disabled = false;
      generateBtn.innerHTML = `🚀 Generate with AI`;
    }
  }
}

function renderSyntaxHighlightedJSON(obj, container) {
  if (!container) return;
  const jsonString = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
  container.innerHTML = highlightJSON(jsonString);
}

function highlightJSON(json) {
  if (!json) return '';
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key text-blue-600 font-semibold';
        } else {
          cls = 'json-string text-emerald-600';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean text-amber-600 font-semibold';
      } else if (/null/.test(match)) {
        cls = 'json-null text-rose-500';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

function copyPreviewJSON() {
  if (!currentGeneratedJSON) {
    window.showToast?.('No JSON content to copy yet. Click "Generate with AI" first.', 'warning');
    return;
  }
  const text = JSON.stringify(currentGeneratedJSON, null, 2);
  navigator.clipboard?.writeText(text);
  window.showToast?.('Curriculum JSON copied to clipboard!', 'success');
}

async function handleSaveCurrentToFirestore() {
  if (!currentGeneratedJSON) {
    window.showToast?.('No JSON to save! Please generate content first.', 'warning');
    return;
  }

  const topicId = currentGeneratedJSON.topicId ||
    `topic_${document.getElementById('admin-topic-select')?.value.replace(/[^0-9]/g, '_')}`;

  await saveToFirestore(topicId, currentGeneratedJSON);
}

// ============================================================================
// 5. MODAL & DOCUMENT INSPECTOR
// ============================================================================
async function viewCurriculumDoc(topicId) {
  const db = getFirestoreInstance();
  if (!db) return;

  try {
    const snap = await db.collection('curriculum').doc(topicId).get();
    if (!snap.exists) {
      window.showToast?.(`Document ${topicId} not found in Firestore.`, 'error');
      return;
    }

    const data = snap.data();
    showAdminModal(`Sub-Unit: ${data.title || topicId}`, highlightJSON(JSON.stringify(data, null, 2)));
  } catch (err) {
    console.error('Error fetching doc:', err);
    window.showToast?.(err.message, 'error');
  }
}

async function editCurriculumDoc(topicId) {
  const db = getFirestoreInstance();
  if (!db) return;

  try {
    const snap = await db.collection('curriculum').doc(topicId).get();
    if (!snap.exists) return;

    const data = snap.data();
    currentGeneratedJSON = data;

    // Switch to generator tab
    switchAdminTab('generator');

    // Populate preview
    const previewBox = document.getElementById('admin-json-preview');
    if (previewBox) {
      renderSyntaxHighlightedJSON(data, previewBox);
    }
    const saveBtn = document.getElementById('admin-save-firestore-btn');
    if (saveBtn) saveBtn.disabled = false;

    window.showToast?.(`Loaded ${topicId} into editor. Modify or click Save Directly to Firestore.`, 'success');
  } catch (err) {
    console.error('Error loading doc for edit:', err);
  }
}

function showAdminModal(title, formattedHtml) {
  let modal = document.getElementById('admin-doc-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-doc-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <h3 class="text-base font-bold text-slate-900">${title}</h3>
        <button onclick="closeAdminModal()" class="text-slate-400 hover:text-slate-700 text-lg p-1 cursor-pointer">✕</button>
      </div>
      <div class="p-6 overflow-y-auto flex-1 font-mono text-xs leading-relaxed bg-slate-50/70">
        <pre class="whitespace-pre-wrap">${formattedHtml}</pre>
      </div>
      <div class="px-6 py-3 border-t border-slate-200 flex justify-end gap-2 bg-white rounded-b-2xl">
        <button onclick="closeAdminModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg cursor-pointer">Close</button>
      </div>
    </div>`;

  modal.classList.remove('hidden');
}

function closeAdminModal() {
  const modal = document.getElementById('admin-doc-modal');
  if (modal) modal.classList.add('hidden');
}

// ============================================================================
// 6. TAB SWITCHING & INITIALIZATION
// ============================================================================
function switchAdminTab(tabId) {
  const genTab = document.getElementById('admin-tab-generator');
  const mgrTab = document.getElementById('admin-tab-manager');
  const genBtn = document.getElementById('btn-admin-tab-gen');
  const mgrBtn = document.getElementById('btn-admin-tab-mgr');

  if (tabId === 'generator') {
    if (genTab) genTab.classList.remove('hidden');
    if (mgrTab) mgrTab.classList.add('hidden');
    if (genBtn) {
      genBtn.className = 'px-4 py-2.5 text-xs font-bold text-blue-700 border-b-2 border-blue-600 transition-colors cursor-pointer';
    }
    if (mgrBtn) {
      mgrBtn.className = 'px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer';
    }
  } else {
    if (genTab) genTab.classList.add('hidden');
    if (mgrTab) mgrTab.classList.remove('hidden');
    if (mgrBtn) {
      mgrBtn.className = 'px-4 py-2.5 text-xs font-bold text-blue-700 border-b-2 border-blue-600 transition-colors cursor-pointer';
    }
    if (genBtn) {
      genBtn.className = 'px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer';
    }
    fetchCurriculumList();
  }
}

function initAdminStudio() {
  const unitSelect = document.getElementById('admin-unit-select');
  if (unitSelect) {
    unitSelect.onchange = (e) => updateTopicDropdown(Number(e.target.value));
    updateTopicDropdown(1);
  }

  const generateBtn = document.getElementById('admin-generate-btn');
  if (generateBtn) generateBtn.onclick = triggerAIGeneration;

  const copyBtn = document.getElementById('admin-copy-json-btn');
  if (copyBtn) copyBtn.onclick = copyPreviewJSON;

  const saveBtn = document.getElementById('admin-save-firestore-btn');
  if (saveBtn) saveBtn.onclick = handleSaveCurrentToFirestore;

  const refreshListBtn = document.getElementById('admin-refresh-list-btn');
  if (refreshListBtn) refreshListBtn.onclick = fetchCurriculumList;

  // Initial load of manager list in background
  fetchCurriculumList();
}

// Global Exports
window.saveToFirestore = saveToFirestore;
window.deleteFromFirestore = deleteFromFirestore;
window.fetchCurriculumList = fetchCurriculumList;
window.switchAdminTab = switchAdminTab;
window.initAdminStudio = initAdminStudio;
window.viewCurriculumDoc = viewCurriculumDoc;
window.editCurriculumDoc = editCurriculumDoc;
window.closeAdminModal = closeAdminModal;
window.triggerAIGeneration = triggerAIGeneration;
window.copyPreviewJSON = copyPreviewJSON;
window.handleSaveCurrentToFirestore = handleSaveCurrentToFirestore;

document.addEventListener('DOMContentLoaded', () => {
  initAdminStudio();
});
