/**
 * MathPrep - Limmy AI & Firebase Authentication Integration
 * Implements Socratic AI Tutor, Markdown/KaTeX rendering, and full Firebase Auth
 * with strict Email Verification guards, 60s cooldowns, and Password Reset flow.
 */

// ============================================================================
// 1. FIREBASE CONFIGURATION & INITIALIZATION
// ============================================================================
window.firebaseConfig = window.firebaseConfig || {
  projectId: "resolute-dialect-ns7sz",
  appId: "1:867238495850:web:1e73ace9f74306bf9cec13",
  apiKey: "AIzaSyAY5HabqmUxnkUY3z4W9g7upzbWIZe_MzU",
  authDomain: "resolute-dialect-ns7sz.firebaseapp.com",
  storageBucket: "resolute-dialect-ns7sz.firebasestorage.app",
  messagingSenderId: "867238495850",
  firestoreDatabaseId: "ai-studio-mathprepapprecal-6d188591-6b33-4318-b288-3e07c81cc172",
};

const ADMIN_EMAIL = "Searsokvarkhim1@gmail.com";
window.ADMIN_EMAIL = ADMIN_EMAIL;

let authInstance = null;
let dbInstance = null;
let currentUser = null;
let isEmailVerified = false;
let isAdmin = false;
let resendCooldownSeconds = 0;
let resendTimerInterval = null;

// Initialize Firebase if compat SDK is loaded
function initFirebase() {
  if (typeof firebase !== 'undefined' && firebase.initializeApp) {
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(window.firebaseConfig);
    }
    authInstance = firebase.auth();
    if (typeof firebase.firestore === 'function') {
      try {
        if (typeof firebase.firestore.setLogLevel === 'function') {
          firebase.firestore.setLogLevel('silent');
        }
        dbInstance = firebase.app().firestore(window.firebaseConfig.firestoreDatabaseId);
      } catch (e) {
        dbInstance = firebase.firestore();
      }
    }
    setupAuthListeners();
  } else {
    // If scripts load with defer, listen for window load
    window.addEventListener('load', () => {
      if (typeof firebase !== 'undefined' && firebase.initializeApp) {
        if (!firebase.apps || !firebase.apps.length) {
          firebase.initializeApp(window.firebaseConfig);
        }
        authInstance = firebase.auth();
        if (typeof firebase.firestore === 'function') {
          try {
            if (typeof firebase.firestore.setLogLevel === 'function') {
              firebase.firestore.setLogLevel('silent');
            }
            dbInstance = firebase.app().firestore(window.firebaseConfig.firestoreDatabaseId);
          } catch (e) {
            dbInstance = firebase.firestore();
          }
        }
        setupAuthListeners();
      }
    });
  }
}

// ============================================================================
// 2. TOAST ALERTS & NOTIFICATIONS
// ============================================================================
function showToast(message, type = 'success') {
  let container = document.getElementById('mathprep-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'mathprep-toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `mathprep-toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('toast-show'), 15);
  setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ============================================================================
// 3. EMAIL VERIFICATION & AUTH ACTIONS
// ============================================================================

/**
 * Universal wrapper for sendEmailVerification
 */
async function sendEmailVerification(user) {
  if (!user) throw new Error("No authenticated user found.");
  if (typeof user.sendEmailVerification === 'function') {
    return await user.sendEmailVerification();
  }
  return Promise.resolve();
}

/**
 * Universal wrapper for sendPasswordResetEmail
 */
async function sendPasswordResetEmail(auth, email) {
  const targetAuth = auth || authInstance || (typeof firebase !== 'undefined' ? firebase.auth() : null);
  if (!targetAuth) throw new Error("Firebase Auth is not initialized.");
  return await targetAuth.sendPasswordResetEmail(email);
}

/**
 * Sign up with Email and Password
 * Immediately triggers sendEmailVerification and displays notification modal
 */
async function signUpWithEmail(email, password) {
  try {
    const cred = await authInstance.createUserWithEmailAndPassword(email, password);
    const user = cred.user;

    // Call sendEmailVerification(auth.currentUser) immediately after account creation
    await sendEmailVerification(user);
    startResendCooldown(60);

    // Display modal notification
    showVerificationSentModal(email);

    // Keep restricted until verified
    isEmailVerified = false;
    renderVerificationBanner();

    return { success: true, user };
  } catch (error) {
    console.warn("Sign-up status:", error?.code, error?.message);
    let msg = error.message || "Failed to create account.";
    if (error.code === 'auth/operation-not-allowed') {
      msg = "Email/Password sign-up is not enabled in Firebase Console. Sign in with Google or enable 'Email/Password' in Firebase Console > Authentication > Sign-in method.";
    } else if (error.code === 'auth/email-already-in-use') {
      msg = "This email is already registered. Please sign in instead.";
    } else if (error.code === 'auth/weak-password') {
      msg = "Password should be at least 6 characters.";
    }
    showToast(msg, 'error');
    return { success: false, error, message: msg };
  }
}

/**
 * Sign in with Email and Password
 */
async function signInWithEmail(email, password) {
  try {
    const cred = await authInstance.signInWithEmailAndPassword(email, password);
    return { success: true, user: cred.user };
  } catch (error) {
    console.warn("Sign-in status:", error?.code, error?.message);
    let msg = error.message || "Invalid credentials.";
    if (error.code === 'auth/operation-not-allowed') {
      msg = "Email/Password sign-in is not enabled in Firebase Console. Please sign in with Google or enable 'Email/Password' in Firebase Console > Authentication > Sign-in method.";
    } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      msg = "Invalid email or password.";
    }
    showToast(msg, 'error');
    return { success: false, error, message: msg };
  }
}

/**
 * Sign in with Google OAuth
 */
async function signInWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const cred = await authInstance.signInWithPopup(provider);
    isEmailVerified = true;
    removeVerificationBanner();
    showToast("Signed in with Google successfully!");
    return { success: true, user: cred.user };
  } catch (error) {
    console.warn("Google sign-in status:", error?.code, error?.message);
    showToast(error.message || "Google sign-in failed.", 'error');
    throw error;
  }
}

/**
 * Trigger password reset flow
 */
async function handlePasswordReset(email) {
  if (!email || !email.includes('@')) {
    showToast("Please provide a valid email address.", 'warning');
    return;
  }
  try {
    await sendPasswordResetEmail(authInstance, email);
    showToast("Password reset link sent! Please check your inbox.");
  } catch (error) {
    console.warn("Password reset status:", error?.code, error?.message);
    showToast(error.message || "Failed to send password reset email.", 'error');
  }
}

/**
 * Resend verification email with 60-second cooldown timer
 */
async function resendVerificationEmail() {
  if (!currentUser) {
    showToast("Please sign in first.", 'warning');
    return;
  }
  if (resendCooldownSeconds > 0) {
    showToast(`Please wait ${resendCooldownSeconds}s before requesting another verification email.`, 'warning');
    return;
  }

  try {
    await sendEmailVerification(currentUser);
    startResendCooldown(60);
    showToast("Verification email sent successfully!");
  } catch (error) {
    console.warn("Resend verification status:", error?.code, error?.message);
    showToast(error.message || "Failed to resend verification email.", 'error');
  }
}

/**
 * Check if user verified their email by reloading the user object
 */
async function refreshVerificationStatus() {
  if (!currentUser) return;
  try {
    await currentUser.reload();
    const updatedUser = authInstance.currentUser;
    currentUser = updatedUser;

    if (updatedUser && updatedUser.emailVerified) {
      isEmailVerified = true;
      removeVerificationBanner();
      showToast("Email verified successfully! Full access unlocked.");
    } else {
      showToast("Your email is still unverified. Please check your inbox or spam folder.", 'warning');
    }
  } catch (error) {
    console.warn("Error refreshing status:", error);
  }
}

/**
 * Guard for protected actions (e.g. official practice exams or saving stats)
 */
function guardProtectedAction(actionName, callback) {
  if (!currentUser) {
    showToast(`Please sign in to ${actionName}.`, 'warning');
    openAuthModal('signin');
    return false;
  }

  if (!isEmailVerified) {
    showToast(`Email verification required to ${actionName}. Please check your inbox.`, 'warning');
    renderVerificationBanner();
    return false;
  }

  if (typeof callback === 'function') callback();
  return true;
}

// Cooldown timer management
function startResendCooldown(seconds = 60) {
  resendCooldownSeconds = seconds;
  updateResendButtonUI();
  if (resendTimerInterval) clearInterval(resendTimerInterval);

  resendTimerInterval = setInterval(() => {
    resendCooldownSeconds -= 1;
    updateResendButtonUI();
    if (resendCooldownSeconds <= 0) {
      clearInterval(resendTimerInterval);
      resendTimerInterval = null;
    }
  }, 1000);
}

function updateResendButtonUI() {
  const btn = document.getElementById('limmy-resend-verification-btn');
  if (!btn) return;
  if (resendCooldownSeconds > 0) {
    btn.disabled = true;
    btn.textContent = `Resend in ${resendCooldownSeconds}s`;
  } else {
    btn.disabled = false;
    btn.textContent = 'Resend Verification Email';
  }
}

// ============================================================================
// 4. VERIFICATION GUARD, ADMIN IDENTIFICATION & ROUTING (onAuthStateChanged)
// ============================================================================
function setupAuthListeners() {
  if (!authInstance) return;

  authInstance.onAuthStateChanged((user) => {
    currentUser = user;

    // Platform temporarily 100% free & unlocked for all users
    window.mathprepIsPremium = true;
    window.mathprepLimmyCredits = 9999;

    if (user) {
      // 1. Admin Identification Check (Requirement 1)
      const userEmail = (user.email || '').trim().toLowerCase();
      isAdmin = userEmail === ADMIN_EMAIL.toLowerCase();

      // Reveal or hide Admin Studio Link
      updateAdminNavigationUI(isAdmin);

      // Check if signed in via Google OAuth
      const isGoogle = user.providerData && user.providerData.some(p => p.providerId === 'google.com');

      if (isGoogle) {
        // OAuth provider handles verification automatically
        isEmailVerified = true;
        removeVerificationBanner();
      } else {
        // Email/Password sign in: check user.emailVerified
        isEmailVerified = Boolean(user.emailVerified);

        if (!isEmailVerified) {
          renderVerificationBanner();
        } else {
          removeVerificationBanner();
        }
      }
    } else {
      currentUser = null;
      isEmailVerified = false;
      isAdmin = false;
      updateAdminNavigationUI(false);
      removeVerificationBanner();
    }

    // Broadcast admin status for React TopBar and components
    window.dispatchEvent(new CustomEvent('mathprep:admin-status', {
      detail: { isAdmin, user: currentUser }
    }));

    // Verify routing permission if user is currently on #admin-studio
    handleAdminRouting();
  });
}

function updateAdminNavigationUI(showAdmin) {
  // Update static nav links if present
  const adminLinks = document.querySelectorAll('.admin-studio-nav-link');
  adminLinks.forEach((el) => {
    if (showAdmin) {
      el.classList.remove('hidden');
      el.style.display = 'inline-flex';
    } else {
      el.classList.add('hidden');
      el.style.display = 'none';
    }
  });
}

function handleAdminRouting() {
  const hash = window.location.hash.toLowerCase();
  const adminSection = document.getElementById('admin-studio');
  const mainContent = document.querySelector('main');

  if (hash === '#admin-studio' || hash === '#/admin-studio') {
    if (isAdmin) {
      const adminMount = document.getElementById('admin-mount-point');
      if (adminSection && adminMount && adminSection.parentElement !== adminMount) {
        adminMount.appendChild(adminSection);
      }
      if (adminSection) adminSection.classList.remove('hidden');
      if (mainContent) mainContent.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.initTeacherLimmyStudio) {
        window.initTeacherLimmyStudio();
      }
      if (window.fetchCurriculumList) {
        window.fetchCurriculumList();
      }
    } else {
      // If false or logged out: redirect to main landing page
      if (window.location.hash.includes('admin-studio')) {
        window.location.hash = '';
        showToast("Access restricted: Administrator privileges required (Searsokvarkhim1@gmail.com).", "warning");
      }
      if (adminSection) adminSection.classList.add('hidden');
      if (mainContent) mainContent.classList.remove('hidden');
    }
  } else {
    // Normal student navigation
    if (adminSection) adminSection.classList.add('hidden');
    if (mainContent) mainContent.classList.remove('hidden');
  }
}

window.addEventListener('hashchange', handleAdminRouting);

function renderVerificationBanner() {
  if (!currentUser || isEmailVerified) return;

  let banner = document.getElementById('mathprep-verification-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'mathprep-verification-banner';
    banner.className = 'verification-warning-banner sticky top-16 z-30 w-full px-4 py-2.5 shadow-xs';
    
    // Insert after header or at top of body
    const header = document.querySelector('header');
    if (header && header.nextSibling) {
      header.parentNode.insertBefore(banner, header.nextSibling);
    } else {
      document.body.prepend(banner);
    }
  }

  banner.innerHTML = `
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
      <div class="flex items-center gap-2 text-amber-900 font-medium">
        <span class="banner-badge">Notice</span>
        <span>Your email address (${currentUser.email || 'account'}) is not verified. Check your inbox or click <strong>Resend Verification Email</strong>.</span>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button id="limmy-resend-verification-btn" class="resend-btn" ${resendCooldownSeconds > 0 ? 'disabled' : ''}>
          ${resendCooldownSeconds > 0 ? `Resend in ${resendCooldownSeconds}s` : 'Resend Verification Email'}
        </button>
        <button id="limmy-refresh-verification-btn" class="refresh-btn">
          I've Verified My Email / Refresh Status
        </button>
        <button id="limmy-close-banner-btn" class="close-btn" title="Dismiss temporary banner">
          ✕
        </button>
      </div>
    </div>
  `;

  // Attach button events
  const resendBtn = document.getElementById('limmy-resend-verification-btn');
  if (resendBtn) resendBtn.onclick = () => resendVerificationEmail();

  const refreshBtn = document.getElementById('limmy-refresh-verification-btn');
  if (refreshBtn) refreshBtn.onclick = () => refreshVerificationStatus();

  const closeBtn = document.getElementById('limmy-close-banner-btn');
  if (closeBtn) closeBtn.onclick = () => removeVerificationBanner();
}

function removeVerificationBanner() {
  const banner = document.getElementById('mathprep-verification-banner');
  if (banner) banner.remove();
}

/**
 * Modal notification for sign-up: "Verification link sent to [email]! Please check your inbox/spam folder before signing in."
 */
function showVerificationSentModal(email) {
  const overlay = document.createElement('div');
  overlay.className = 'mathprep-auth-modal-overlay';
  overlay.id = 'verification-sent-modal';
  overlay.innerHTML = `
    <div class="mathprep-auth-modal-content p-6 text-center space-y-4">
      <div style="font-size: 2.5rem; line-height: 1;">✉️</div>
      <h3 style="font-size: 1.15rem; font-weight: 700; color: #0f172a;">Verify Your Email</h3>
      <p style="font-size: 0.875rem; color: #475569; line-height: 1.5;">
        Verification link sent to <strong>${email}</strong>! Please check your inbox/spam folder before signing in.
      </p>
      <div style="padding: 0.75rem; background-color: #fffbeb; border: 1px solid #fcd34d; border-radius: 0.5rem; font-size: 0.75rem; color: #92400e; text-align: left;">
        Protected platform actions (such as starting official exams or recording progress) are locked until your email is verified.
      </div>
      <button id="close-verification-sent-btn" style="width: 100%; padding: 0.6rem 1rem; background-color: #2563eb; color: #fff; font-weight: 600; border-radius: 0.5rem; border: none; cursor: pointer;">
        Proceed to Sign In
      </button>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('close-verification-sent-btn').onclick = () => {
    overlay.remove();
    openAuthModal('signin');
  };
}

function openAuthModal(initialTab = 'signin') {
  // If React AuthModal is active, trigger it via global event or custom dispatch
  window.dispatchEvent(new CustomEvent('mathprep:open-auth', { detail: { tab: initialTab } }));
}

// ============================================================================
// 5. LIMMY AI SOCRATIC TUTOR & MARKDOWN / KATEX RENDERING
// ============================================================================
const KATEX_MATH_DELIMITERS = [
  { left: '$$', right: '$$', display: true },
  { left: '$', right: '$', display: false },
  { left: '\\[', right: '\\]', display: true },
  { left: '\\(', right: '\\)', display: false }
];

if (typeof marked !== 'undefined' && marked.setOptions) {
  marked.setOptions({ gfm: true, breaks: true });
}

function renderLimmyMessage(text, containerElement, role = 'assistant') {
  const isUser = role === 'user' || role === true;
  const rowElement = document.createElement('div');
  rowElement.className = `flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 w-full`;

  const messageBubble = document.createElement('div');
  if (isUser) {
    messageBubble.className = 'limmy-user-message bg-blue-600 text-white rounded-2xl rounded-br-xs px-4 py-2.5 max-w-[85%] text-sm shadow-xs';
  } else {
    messageBubble.className = 'limmy-message bg-white text-slate-800 rounded-2xl rounded-bl-xs px-4 py-3 max-w-[90%] text-sm leading-relaxed border border-slate-200/80 shadow-2xs';
  }

  let htmlContent = '';
  try {
    htmlContent = parseMarkdownPreservingMath(text || '');
  } catch (err) {
    console.error('Error parsing markdown:', err);
    htmlContent = (text || '').replace(/\*\*/g, '').replace(/#{2,}/g, '');
  }

  messageBubble.innerHTML = htmlContent;
  rowElement.appendChild(messageBubble);

  if (containerElement && typeof containerElement.appendChild === 'function') {
    containerElement.appendChild(rowElement);
    containerElement.scrollTop = containerElement.scrollHeight;
  }

  const applyMath = () => {
    if (typeof renderMathInElement === 'function') {
      try {
        renderMathInElement(messageBubble, {
          delimiters: KATEX_MATH_DELIMITERS,
          throwOnError: false,
        });
      } catch (err) {
        console.error('KaTeX auto-render error:', err);
      }
    }
  };

  applyMath();
  if (typeof renderMathInElement !== 'function') {
    window.addEventListener('load', applyMath, { once: true });
  }

  return rowElement;
}

class LimmyTutorClient {
  constructor(options = {}) {
    this.endpoint = options.endpoint || '/api/limmy/explain';
    this.history = [];
    this.currentContext = options.context || '';
  }

  setContext(context) {
    this.currentContext = context;
  }

  async ask(question, context = this.currentContext) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context, history: this.history }),
      });

      if (!response.ok) throw new Error(`Server returned status ${response.status}`);
      const data = await response.json();

      this.history.push({ role: 'user', content: question });
      this.history.push({ role: 'assistant', content: data.reply });
      return data;
    } catch (err) {
      console.error('LimmyTutorClient error:', err);
      return {
        reply: "Limmy is having trouble connecting to the math server. Please check your network and try again!",
        error: true,
      };
    }
  }

  clearHistory() {
    this.history = [];
  }
}

// ============================================================================
// 6. STUDENT PRACTICE VIEW ADAPTATION (Firestore `question_bank` Queries)
// ============================================================================

/**
 * Query `question_bank` filtered by `sub_topic_id == activeSubTopicId` AND `is_published == true`
 * (or by `topic_id` when activeSubTopicId is 'all').
 */
async function fetchStudentPracticeQuestions(activeSubTopicId, activeTopicId = null) {
  // 1. Prefer the unified bank helper if loaded (combines Firestore query + live admin curation overrides)
  if (typeof window.getPublishedQuestionsFromBank === 'function') {
    try {
      const results = await window.getPublishedQuestionsFromBank({
        subTopicId: activeSubTopicId,
        topicId: activeTopicId,
      });
      return results;
    } catch (e) {
      console.warn('getPublishedQuestionsFromBank fallback:', e);
    }
  }

  // 2. Direct Firestore query on `question_bank` collection
  if (dbInstance && sessionStorage.getItem('mathprep_firestore_read_quota_exhausted') !== '1') {
    try {
      if (typeof firebase !== 'undefined' && typeof firebase.firestore?.setLogLevel === 'function') {
        firebase.firestore.setLogLevel('silent');
      }
      let queryRef = dbInstance.collection('question_bank').where('is_published', '==', true);
      if (activeSubTopicId && activeSubTopicId !== 'all') {
        queryRef = queryRef.where('sub_topic_id', '==', String(activeSubTopicId));
      } else if (activeTopicId && activeTopicId !== 'all') {
        queryRef = queryRef.where('topic_id', '==', String(activeTopicId));
      }

      const snap = await queryRef.get();
      if (!snap.empty) {
        const items = [];
        snap.forEach((doc) => items.push(doc.data()));
        return items;
      }
    } catch (err) {
      const msg = String(err?.message || err?.code || err || '').toLowerCase();
      if (msg.includes('quota') || msg.includes('resource-exhausted') || msg.includes('resource_exhausted')) {
        sessionStorage.setItem('mathprep_firestore_read_quota_exhausted', '1');
      }
    }
  }

  // 3. Fallback to pre-generated bank JSON filtered by `is_published === true`
  try {
    const res = await fetch('/data/massive_question_bank.json');
    if (res.ok) {
      const bundle = await res.json();
      const rawOverrides = localStorage.getItem('mathprep_qb_overrides_v2');
      const overrides = rawOverrides ? JSON.parse(rawOverrides) : { updated: {}, deleted: [], added: [] };
      const deletedSet = new Set(overrides.deleted || []);

      const merged = [...(bundle.questions || []).map((q) => ({ ...q, is_published: true })), ...(overrides.added || [])]
        .filter((q) => q && q.id && !deletedSet.has(q.id))
        .map((q) => (overrides.updated?.[q.id] ? { ...q, ...overrides.updated[q.id] } : q));

      return merged.filter((q) => {
        if (!q.is_published) return false;
        if (activeSubTopicId && activeSubTopicId !== 'all' && String(q.sub_topic_id) !== String(activeSubTopicId)) {
          return false;
        }
        if (activeTopicId && activeTopicId !== 'all' && String(q.topic_id) !== String(activeTopicId)) {
          return false;
        }
        return true;
      });
    }
  } catch (e) {
    console.warn('Static question bank fallback error:', e);
  }

  return [];
}

/**
 * Render a sub-topic practice set into a target DOM container.
 * Displays the required placeholder if no questions are flagged `is_published == true`.
 */
async function renderStudentPracticeSet(activeSubTopicId, containerElementOrId) {
  const container =
    typeof containerElementOrId === 'string'
      ? document.getElementById(containerElementOrId)
      : containerElementOrId;
  if (!container) return;

  const publishedQuestions = await fetchStudentPracticeQuestions(activeSubTopicId);

  if (!publishedQuestions || publishedQuestions.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
        <div class="text-2xl">🧪</div>
        <p class="text-sm font-bold text-slate-800">
          Practice set currently in staging by Teacher Limmy. Check back soon!
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = publishedQuestions
    .map(
      (q, idx) => `
      <div class="p-5 bg-white rounded-xl border border-slate-200 space-y-3 mb-4">
        <div class="flex items-center justify-between text-xs font-bold text-blue-700">
          <span>${q.type} #${idx + 1} (${q.sub_topic_id})</span>
          <span>${q.difficulty} · ${q.calculator_active ? 'Calculator Active' : 'No Calculator'}</span>
        </div>
        <div class="text-sm text-slate-900">${q.content?.prompt_latex || q.content?.scenario_latex || ''}</div>
      </div>
    `
    )
    .join('');

  if (typeof renderMathInElement === 'function') {
    renderMathInElement(container, { delimiters: KATEX_MATH_DELIMITERS, throwOnError: false });
  }
}

/**
 * Helper to render Markdown + LaTeX safely in DOM elements without leaving stray ** or ## signs
 */
function parseMarkdownPreservingMath(markdownText) {
  if (!markdownText) return '';
  const mathTokens = [];
  const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;

  const placeholder = String(markdownText).replace(mathRegex, (match) => {
    const idx = mathTokens.length;
    mathTokens.push(match);
    return `%%MATH_TOKEN_${idx}%%`;
  });

  let html = placeholder;
  if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
    try {
      html = marked.parse(placeholder);
    } catch (e) {
      html = placeholder.replace(/\n/g, '<br/>');
    }
  } else {
    html = placeholder
      .replace(/^[ \t]*#{1,6}[ \t]+(.+)$/gm, '<strong>$1</strong>')
      .replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  }

  // Strip any leftover raw ** or ## outside math tokens
  html = html.replace(/\*\*/g, '').replace(/#{2,}/g, '');

  return html.replace(/%%MATH_TOKEN_(\d+)%%/g, (_m, idxStr) => {
    return mathTokens[Number(idxStr)] || '';
  });
}

/**
 * Render an Exhaustive AP Precalculus Textbook Chapter (`curriculum/{topicId}`)
 * with a sticky Table of Contents sidebar, Rule of Four conceptual sections,
 * Formula & Theorem Vault, Model MCQ Spotlights with Distractor Breakdowns,
 * and 4-Part Model FRQ Walkthrough with Official Scoring Rubrics & Chief Reader Commentary.
 */
function renderExhaustiveTextbookChapter(topicData, containerElementOrId) {
  const container =
    typeof containerElementOrId === 'string'
      ? document.getElementById(containerElementOrId)
      : containerElementOrId;
  if (!container || !topicData) return;

  const lesson = topicData.lesson || {};
  const readingMins = lesson.reading_time_minutes || 5;
  const rawSections = lesson.conceptual_sections || [];
  const hasLeanThree =
    rawSections.length === 3 &&
    rawSections[0]?.title === 'Concept Description' &&
    rawSections[1]?.title === 'Core Formula' &&
    rawSections[2]?.title === 'Simple Explanation';
  const conceptualSections = hasLeanThree
    ? rawSections
    : [
        {
          section_id: 'sec-concept-description',
          title: 'Concept Description',
          body_markdown:
            lesson.concept_description ||
            topicData.master_lesson?.concept_description ||
            rawSections[0]?.body_markdown ||
            topicData.summary ||
            '',
        },
        {
          section_id: 'sec-core-formula',
          title: 'Core Formula',
          body_markdown:
            lesson.core_formula ||
            topicData.master_lesson?.core_formula ||
            rawSections[1]?.body_markdown ||
            '',
        },
        {
          section_id: 'sec-simple-explanation',
          title: 'Simple Explanation',
          body_markdown:
            lesson.simple_explanation ||
            topicData.master_lesson?.simple_explanation ||
            rawSections[2]?.body_markdown ||
            lesson.synthesis_summary ||
            '',
        },
      ];
  const theoremVault = lesson.formula_theorem_vault || [];
  const modelMcqs = lesson.model_mcqs || [];
  const modelFrqs = lesson.model_frqs || [];
  const synthesisSummary = lesson.synthesis_summary || '';

  const tocAnchors = [
    ...conceptualSections.map((sec, idx) => ({
      id: `dom-toc-sec-${idx}`,
      label: String(sec.title || `Section ${idx + 1}`).replace(/^[IVX]+\.\s*/, ''),
      badge: `Sec ${idx + 1}`,
    })),
    ...(theoremVault.length > 0
      ? [{ id: 'dom-toc-vault', label: 'Formula & Theorem Vault', badge: `${theoremVault.length}` }]
      : []),
    ...modelMcqs.map((m, idx) => ({
      id: `dom-toc-mcq-${idx}`,
      label: `Model AP Exam MCQ #${idx + 1}`,
      badge: m.calculator_active ? 'Calc' : 'No-Calc',
    })),
    ...modelFrqs.map((_f, idx) => ({
      id: `dom-toc-frq-${idx}`,
      label: `Model FRQ Walkthrough (a–d)`,
      badge: '4 Parts',
    })),
    ...(synthesisSummary
      ? [{ id: 'dom-toc-synthesis', label: 'Synthesis & Exam Traps', badge: 'Rules' }]
      : []),
  ];

  container.innerHTML = `
    <div class="textbook-chapter-layout animate-fade-in">
      <!-- Sticky Left Table of Contents Sidebar -->
      <aside class="textbook-toc-sidebar">
        <div class="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-700">📑 Guide TOC</span>
          <span class="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">${readingMins}m read</span>
        </div>
        <nav class="space-y-1">
          ${tocAnchors
            .map(
              (item, i) => `
            <button
              type="button"
              onclick="window.scrollToTextbookSection('${item.id}', this)"
              class="textbook-toc-btn ${i === 0 ? 'active' : ''}"
            >
              <span class="truncate">${item.label}</span>
              <span class="text-[10px] font-mono bg-white text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded shrink-0">${item.badge}</span>
            </button>
          `
            )
            .join('')}
        </nav>
      </aside>

      <!-- Main Chapter Content -->
      <div class="space-y-6 min-w-0">
        <!-- Chapter Header Banner -->
        <div class="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span class="font-mono font-bold text-blue-300 uppercase tracking-wider">
              AP Precalculus Study Guide · Topic ${topicData.topic_id || topicData.topicCode}
            </span>
            <div class="flex items-center gap-2">
              <a
                href="/lesson.html?topic=${topicData.topic_id || topicData.topicCode}"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                title="Open interactive lesson page with Teacher Limmy AI guidance"
              >
                <span>🧑‍🏫 Ask Teacher Limmy</span>
              </a>
              <span class="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                ⏱️ ${readingMins} Min Study Guide
              </span>
            </div>
          </div>
          <h2 class="text-lg sm:text-xl font-bold text-white">
            Topic ${topicData.topic_id || topicData.topicCode}: ${topicData.topic_title || topicData.title}
          </h2>
        </div>

        <!-- A) 3-Part Lean Study Guide Sections -->
        ${conceptualSections
          .map(
            (sec, idx) => `
          <section id="dom-toc-sec-${idx}" class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div class="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-md bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center">${idx + 1}</span>
                <h3 class="text-sm sm:text-base font-bold text-slate-900">${sec.title}</h3>
              </div>
              <span class="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">Core Mechanics</span>
            </div>
            <div class="p-5 limmy-message math-content text-slate-800">
              ${parseMarkdownPreservingMath(sec.body_markdown)}
            </div>
          </section>
        `
          )
          .join('')}

        <!-- B) Formula & Theorem Vault -->
        ${
          theoremVault.length > 0
            ? `
          <section id="dom-toc-vault" class="space-y-3">
            <div class="bg-white p-4 rounded-xl border border-slate-200">
              <h3 class="text-sm sm:text-base font-bold text-slate-900">🏛️ Formula & Theorem Vault (Prerequisites & Failure Cases)</h3>
              <p class="text-xs text-slate-500">Formal theorems, exact conditions when each formula applies, and boundary cases where it fails</p>
            </div>
            ${theoremVault
              .map(
                (thm) => `
              <div class="bg-white rounded-xl border border-indigo-200 p-5 space-y-3 shadow-2xs">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono text-xs font-bold">${thm.sub_topic_id}</span>
                    <h4 class="text-sm font-bold text-slate-900 math-content">${thm.title}</h4>
                  </div>
                  <span class="text-[11px] text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">${thm.sub_topic_title || ''}</span>
                </div>
                <div class="p-3 bg-slate-50 rounded-lg border border-blue-100 text-center math-content overflow-x-auto">
                  $$${thm.latex}$$
                </div>
                <div class="text-xs text-slate-700 math-content">
                  <strong>Formal Definition:</strong> ${thm.formal_definition}
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                  <div class="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 math-content">
                    <strong>✓ When It Works:</strong> ${thm.conditions_when_it_works}
                  </div>
                  <div class="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-950 math-content">
                    <strong>✗ When It Fails:</strong> ${thm.when_it_fails}
                  </div>
                </div>
              </div>
            `
              )
              .join('')}
          </section>
        `
            : ''
        }

        <!-- C) Embedded Model AP Exam Questions — MCQ Spotlight -->
        ${modelMcqs
          .map((mcq, mIdx) => {
            const correctLetter = String.fromCharCode(65 + (mcq.correct_index || 0));
            const derivId = `dom-model-mcq-deriv-${mIdx}`;
            return `
            <section id="dom-toc-mcq-${mIdx}" class="model-mcq-spotlight space-y-3.5">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2.5">
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 font-mono text-xs font-bold">
                    ★ Model AP Exam MCQ #${mIdx + 1}
                  </span>
                  <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    ${mcq.difficulty}
                  </span>
                </div>
                <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  mcq.calculator_active
                    ? 'bg-blue-50 text-blue-900 border-blue-300'
                    : 'bg-slate-100 text-slate-800 border-slate-300'
                }">
                  ${mcq.calculator_active ? '🧮 Part B: Graphing Calculator Active' : '🚫 Part A: No Calculator Allowed'}
                </span>
              </div>

              <div class="p-3.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium math-content limmy-message">
                ${parseMarkdownPreservingMath(mcq.prompt_latex)}
              </div>

              <div class="grid grid-cols-1 gap-2">
                ${(mcq.options || [])
                  .map((opt, optIdx) => {
                    const cleanOpt = String(opt).replace(/^\([A-D]\)\s*/i, '');
                    return `
                    <button
                      type="button"
                      onclick="window.checkModelMcqOption(${mIdx}, ${optIdx}, ${mcq.correct_index})"
                      id="dom-model-mcq-opt-${mIdx}-${optIdx}"
                      class="dom-model-mcq-btn-${mIdx} text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-400 text-xs sm:text-sm text-slate-800 transition-all flex items-start gap-2.5 cursor-pointer"
                    >
                      <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-300">
                        ${String.fromCharCode(65 + optIdx)}
                      </span>
                      <span class="math-content leading-relaxed">${cleanOpt}</span>
                    </button>
                  `;
                  })
                  .join('')}
              </div>

              <div>
                <button
                  type="button"
                  onclick="window.toggleModelMcqDerivation('${derivId}')"
                  class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  🔬 Show Complete Derivation & Distractor Breakdown
                </button>
              </div>

              <div id="${derivId}" class="hidden space-y-3 pt-2 border-t border-amber-200">
                <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs">
                  <div class="font-bold text-emerald-950">✓ Worked Solution (Correct Answer: ${correctLetter})</div>
                  <div class="limmy-message math-content text-slate-800">${parseMarkdownPreservingMath(mcq.worked_solution_latex)}</div>
                </div>

                <div class="space-y-2">
                  <div class="text-[11px] font-bold uppercase tracking-wider text-slate-700">Anatomy of Distractors</div>
                  ${Object.entries(mcq.distractor_breakdown || {})
                    .map(
                      ([letter, reason]) => `
                    <div class="distractor-anatomy-card math-content">
                      <strong>Why (${letter}) is wrong:</strong> ${reason}
                    </div>
                  `
                    )
                    .join('')}
                </div>

                ${
                  mcq.ap_exam_trap
                    ? `
                  <div class="ap-exam-trap-box math-content">
                    <strong>⚠️ AP Exam Trap Alert:</strong> ${mcq.ap_exam_trap}
                  </div>
                `
                    : ''
                }
              </div>
            </section>
          `;
          })
          .join('')}

        <!-- D) Embedded Model AP Exam FRQ Walkthrough (Parts a–d) -->
        ${modelFrqs
          .map(
            (frq, fIdx) => `
          <section id="dom-toc-frq-${fIdx}" class="model-frq-walkthrough space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-purple-200 pb-2.5">
              <span class="px-3 py-1 rounded-lg bg-purple-900 text-purple-100 font-mono text-xs font-bold">
                🏆 ${frq.frq_type || 'Model AP Exam 4-Part FRQ Walkthrough'}
              </span>
              <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                frq.calculator_active
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-slate-100 text-slate-800 border-slate-300'
              }">
                ${frq.calculator_active ? '🧮 Part A: Graphing Calculator Required' : '🚫 Part B: No Calculator Allowed'}
              </span>
            </div>

            <div class="p-4 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium math-content limmy-message">
              ${parseMarkdownPreservingMath(frq.scenario_latex)}
            </div>

            <div class="space-y-3.5">
              ${(frq.parts || [])
                .map((pt, pIdx) => {
                  const partBoxId = `dom-model-frq-part-${fIdx}-${pIdx}`;
                  return `
                  <div class="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                    <div class="flex items-start justify-between gap-2.5">
                      <div class="flex items-start gap-2.5">
                        <span class="px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-xs shrink-0 mt-0.5">
                          Part ${pt.part_label}
                        </span>
                        <div class="text-xs sm:text-sm text-slate-900 font-medium math-content">
                          ${pt.prompt_latex}
                        </div>
                      </div>
                      <span class="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                        ${pt.point_value || 2} Pts
                      </span>
                    </div>

                    <div>
                      <button
                        type="button"
                        onclick="window.toggleModelFrqPart('${partBoxId}')"
                        class="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs cursor-pointer transition-colors"
                      >
                        📋 Show Official College Board Scoring Rubric & Chief Reader Notes
                      </button>
                    </div>

                    <div id="${partBoxId}" class="hidden space-y-3 pt-2 border-t border-slate-100">
                      <div class="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                        <div class="px-3 py-1.5 bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-700 flex items-center justify-between">
                          <span>Official College Board Scoring Guidelines</span>
                          <span>Points</span>
                        </div>
                        <div class="divide-y divide-slate-200/70">
                          ${(pt.rubric || [])
                            .map(
                              (r) => `
                            <div class="px-3 py-2 flex items-center justify-between gap-2 text-xs">
                              <span class="text-slate-800 math-content">${r.description}</span>
                              <span class="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">+${r.point} pt</span>
                            </div>
                          `
                            )
                            .join('')}
                        </div>
                      </div>

                      <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1 text-xs">
                        <div class="font-bold text-emerald-950 uppercase tracking-wider">Model Solution</div>
                        <div class="math-content limmy-message text-slate-800">${parseMarkdownPreservingMath(pt.model_solution_latex)}</div>
                      </div>

                      ${
                        pt.common_errors
                          ? `
                        <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 math-content">
                          <strong>🎓 ${pt.common_errors}</strong>
                        </div>
                      `
                          : ''
                      }
                    </div>
                  </div>
                `;
                })
                .join('')}
            </div>
          </section>
        `
          )
          .join('')}

        <!-- E) Synthesis & Common Misconceptions -->
        ${
          synthesisSummary
            ? `
          <section id="dom-toc-synthesis" class="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
            <h3 class="text-sm sm:text-base font-bold text-blue-950">🧭 Common Misconceptions & Unit Synthesis Summary</h3>
            <div class="limmy-message math-content text-slate-800">
              ${parseMarkdownPreservingMath(synthesisSummary)}
            </div>
          </section>
        `
            : ''
        }
      </div>
    </div>
  `;

  if (typeof renderMathInElement === 'function') {
    renderMathInElement(container, { delimiters: KATEX_MATH_DELIMITERS, throwOnError: false });
  }
}

window.scrollToTextbookSection = function (anchorId, btnEl) {
  const target = document.getElementById(anchorId);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (btnEl && btnEl.parentElement) {
    btnEl.parentElement.querySelectorAll('.textbook-toc-btn').forEach((b) => b.classList.remove('active'));
    btnEl.classList.add('active');
  }
};

window.toggleModelMcqDerivation = function (derivId) {
  const el = document.getElementById(derivId);
  if (el) {
    el.classList.toggle('hidden');
    if (typeof renderMathInElement === 'function') {
      renderMathInElement(el, { delimiters: KATEX_MATH_DELIMITERS, throwOnError: false });
    }
  }
};

window.checkModelMcqOption = function (mIdx, chosenIdx, correctIdx) {
  const btns = document.querySelectorAll(`.dom-model-mcq-btn-${mIdx}`);
  btns.forEach((btn, idx) => {
    btn.classList.remove('bg-emerald-50', 'border-emerald-500', 'bg-rose-50', 'border-rose-400');
    if (idx === correctIdx) {
      btn.classList.add('bg-emerald-50', 'border-emerald-500');
    } else if (idx === chosenIdx && chosenIdx !== correctIdx) {
      btn.classList.add('bg-rose-50', 'border-rose-400');
    }
  });
  const derivEl = document.getElementById(`dom-model-mcq-deriv-${mIdx}`);
  if (derivEl) {
    derivEl.classList.remove('hidden');
    if (typeof renderMathInElement === 'function') {
      renderMathInElement(derivEl, { delimiters: KATEX_MATH_DELIMITERS, throwOnError: false });
    }
  }
};

window.toggleModelFrqPart = function (partBoxId) {
  const el = document.getElementById(partBoxId);
  if (el) {
    el.classList.toggle('hidden');
    if (typeof renderMathInElement === 'function') {
      renderMathInElement(el, { delimiters: KATEX_MATH_DELIMITERS, throwOnError: false });
    }
  }
};

// Global API Exposure
window.LimmyAI = new LimmyTutorClient();
window.renderLimmyMessage = renderLimmyMessage;
window.sendEmailVerification = sendEmailVerification;
window.sendPasswordResetEmail = sendPasswordResetEmail;
window.signUpWithEmail = signUpWithEmail;
window.signInWithEmail = signInWithEmail;
window.signInWithGoogle = signInWithGoogle;
window.handlePasswordReset = handlePasswordReset;
window.resendVerificationEmail = resendVerificationEmail;
window.refreshVerificationStatus = refreshVerificationStatus;
window.guardProtectedAction = guardProtectedAction;
window.showToast = showToast;
window.fetchStudentPracticeQuestions = fetchStudentPracticeQuestions;
window.renderStudentPracticeSet = renderStudentPracticeSet;
window.renderExhaustiveTextbookChapter = renderExhaustiveTextbookChapter;

// Bootstrapping
initFirebase();

// DOM Listeners for standalone drawer / forms
document.addEventListener('DOMContentLoaded', () => {
  const openButtons = document.querySelectorAll('[data-limmy-open]');
  const closeButtons = document.querySelectorAll('[data-limmy-close]');
  const drawer = document.getElementById('limmy-drawer');
  const chatForm = document.getElementById('limmy-form');
  const chatInput = document.getElementById('limmy-input');
  const chatMessages = document.getElementById('limmy-messages');

  if (openButtons.length && drawer) {
    openButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        drawer.classList.remove('translate-x-full');
        if (chatInput) chatInput.focus();
      });
    });
  }

  if (closeButtons.length && drawer) {
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        drawer.classList.add('translate-x-full');
      });
    });
  }

  if (chatForm && chatInput && chatMessages) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const question = chatInput.value.trim();
      if (!question) return;

      renderLimmyMessage(question, chatMessages, 'user');
      chatInput.value = '';

      const typing = document.createElement('div');
      typing.className = 'flex justify-start mb-3';
      typing.id = 'limmy-typing-indicator';
      typing.innerHTML = `<div class="bg-white border border-slate-200/80 text-slate-500 rounded-2xl rounded-bl-xs px-4 py-2 text-xs italic shadow-2xs flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span><span>Limmy is crafting your Socratic hint...</span></div>`;
      chatMessages.appendChild(typing);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      const result = await window.LimmyAI.ask(question);
      const activeTyping = document.getElementById('limmy-typing-indicator');
      if (activeTyping) activeTyping.remove();

      renderLimmyMessage(result.reply, chatMessages, 'assistant');
    });
  }
});
