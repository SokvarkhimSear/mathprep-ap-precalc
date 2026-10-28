/**
 * MathPrep — Online TI-84 Plus CE Floating & Resizable Simulator Controller (public/calculator.js)
 *
 * Key Capabilities:
 * 1. Strict floating popup window (`position: fixed; z-index: 99999;`) mounted directly under `<body>`.
 * 2. Hidden off-screen by default via `.ti84-modal-hidden` while preserving non-zero `400×600` layout
 *    dimensions (`display: flex`) so Texas Instruments' `TI84PCE` script inside `#ti84-frame`
 *    (`https://ti84calc.com/ti84calc`) always receives non-zero `getBoundingClientRect()` dimensions!
 * 3. Default dimensions (~400px wide × ~600px tall) anchored to the top-right / center-right of the viewport.
 * 4. Draggable header bar (`#ti84-header`) supporting mouse and touch dragging with viewport clamping.
 * 5. Full shrink & stretch resizing via 8 directional resize handles (N, S, E, W, NW, NE, SW, SE),
 *    bottom-right resize grip, and quick zoom/scale buttons (`−`, `+`, `1:1`) in the header.
 * 6. Built-in dual mode:
 *    - 🧮 TI-84 Plus CE Keypad (`https://ti84calc.com/ti84calc`)
 *    - 📈 Instant Grapher & Sci Calc (built-in multi-curve function plotter & radian expression evaluator)
 */

(function () {
  "use strict";

  const DEFAULT_WIDTH = 400;
  const DEFAULT_HEIGHT = 600;
  const MIN_WIDTH = 280;
  const MIN_HEIGHT = 380;
  const MIN_MARGIN = 8;

  const ti84State = {
    isOpen: false,
    isMinimized: false,
    isSplitScreen: false,
    activeMode: "handheld", // 'handheld' | 'grapher'
    hasOpenedOnce: false,
    isDragging: false,
    isResizing: false,
    resizeDir: "",
    hasCustomPosition: false,
    left: null,
    top: null,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0,
    initialWidth: DEFAULT_WIDTH,
    initialHeight: DEFAULT_HEIGHT
  };

  function getElements() {
    return {
      modal: document.getElementById("ti84-calculator-modal"),
      header: document.getElementById("ti84-header"),
      frame: document.getElementById("ti84-frame"),
      desmosFrame: document.getElementById("desmos-frame"),
      builtinPanel: document.getElementById("ti84-builtin-panel"),
      tabHandheld: document.getElementById("ti84-tab-handheld"),
      tabGrapher: document.getElementById("ti84-tab-grapher"),
      fab: document.getElementById("ti84-fab"),
      expandBtn: document.getElementById("ti84-expand-btn"),
      sizeBadge: document.getElementById("ti84-size-badge")
    };
  }

  /**
   * Ensures `#ti84-calculator-modal` and `#ti84-fab` are direct children of `document.body`
   * so they never sit inside normal document flow or inherit local stacking contexts.
   */
  function ensureDirectChildOfBody() {
    const { modal, fab } = getElements();
    if (modal && modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }
    if (fab && fab.parentElement !== document.body) {
      document.body.appendChild(fab);
    }
  }

  /**
   * Injects 8 directional resize handles (edges + corners) and bottom-right grip
   * if they are not already present in `#ti84-calculator-modal`.
   */
  function ensureResizeHandlesAndControls() {
    const { modal } = getElements();
    if (!modal || modal.dataset.resizeReady === "true") return;
    modal.dataset.resizeReady = "true";

    const directions = ["n", "s", "e", "w", "nw", "ne", "sw", "se"];
    directions.forEach((dir) => {
      const handle = document.createElement("div");
      handle.className = `ti84-resize-handle ti84-resize-${dir}`;
      handle.setAttribute("data-resize-dir", dir);
      modal.appendChild(handle);
    });

    const grip = document.createElement("div");
    grip.id = "ti84-resize-grip";
    grip.className = "ti84-resize-grip";
    grip.setAttribute("data-resize-dir", "se");
    grip.title = "Drag to shrink or stretch calculator window";
    grip.innerHTML = "⋱";
    modal.appendChild(grip);
  }

  function clampDimensions(width, height) {
    const maxW = Math.max(MIN_WIDTH, window.innerWidth - MIN_MARGIN * 2);
    const maxH = Math.max(MIN_HEIGHT, window.innerHeight - MIN_MARGIN * 2);
    return {
      width: Math.round(Math.min(Math.max(width || DEFAULT_WIDTH, MIN_WIDTH), maxW)),
      height: Math.round(Math.min(Math.max(height || DEFAULT_HEIGHT, MIN_HEIGHT), maxH))
    };
  }

  function clampToViewport(left, top, width, height) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const dims = clampDimensions(width, height);

    const minLeft = MIN_MARGIN;
    const maxLeft = Math.max(MIN_MARGIN, vw - dims.width - MIN_MARGIN);
    const minTop = MIN_MARGIN;
    const maxTop = Math.max(MIN_MARGIN, vh - dims.height - MIN_MARGIN);

    return {
      left: Math.round(Math.min(Math.max(left, minLeft), maxLeft)),
      top: Math.round(Math.min(Math.max(top, minTop), maxTop)),
      width: dims.width,
      height: dims.height
    };
  }

  function ensureInitialPosition() {
    if (ti84State.hasCustomPosition && ti84State.left !== null && ti84State.top !== null) {
      const clamped = clampToViewport(
        ti84State.left,
        ti84State.top,
        ti84State.width,
        ti84State.height
      );
      ti84State.left = clamped.left;
      ti84State.top = clamped.top;
      ti84State.width = clamped.width;
      ti84State.height = clamped.height;
      return;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const dims = clampDimensions(DEFAULT_WIDTH, DEFAULT_HEIGHT);

    const defaultLeft = Math.max(MIN_MARGIN, vw - dims.width - 24);
    const defaultTop = Math.max(MIN_MARGIN, Math.min(72, Math.round((vh - dims.height) / 2)));

    const clamped = clampToViewport(defaultLeft, defaultTop, dims.width, dims.height);
    ti84State.left = clamped.left;
    ti84State.top = clamped.top;
    ti84State.width = clamped.width;
    ti84State.height = clamped.height;
  }

  function updateSizeBadge() {
    const { sizeBadge } = getElements();
    if (sizeBadge) {
      sizeBadge.textContent = `${Math.round(ti84State.width)}×${Math.round(ti84State.height)}`;
    }
  }

  function setIframePointerEvents(enabled) {
    const { frame, desmosFrame } = getElements();
    if (frame) {
      frame.style.pointerEvents = enabled ? "auto" : "none";
    }
    if (desmosFrame) {
      desmosFrame.style.pointerEvents = enabled ? "auto" : "none";
    }
  }

  function syncModalGeometryAndVisibility() {
    ensureDirectChildOfBody();
    ensureResizeHandlesAndControls();

    const { modal, fab, expandBtn } = getElements();
    if (!modal) return;

    // Update minimized corner bubble (#ti84-fab)
    if (fab) {
      if (ti84State.isMinimized) {
        fab.classList.remove("hidden");
        fab.style.display = "inline-flex";
      } else {
        fab.classList.add("hidden");
        fab.style.display = "none";
      }
    }

    // Keep display: flex ALWAYS so the iframe never collapses to 0x0 dimensions!
    modal.style.display = "flex";

    if (!ti84State.isOpen || ti84State.isMinimized) {
      modal.classList.add("ti84-modal-hidden");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("ti84-split-active");
      return;
    }

    modal.classList.remove("ti84-modal-hidden");
    modal.setAttribute("aria-hidden", "false");

    if (ti84State.isSplitScreen && window.innerWidth >= 640) {
      modal.classList.add("ti84-split-screen");
      modal.style.left = "";
      modal.style.top = "";
      modal.style.width = "50vw";
      modal.style.height = "100vh";
      document.body.classList.add("ti84-split-active");
      if (expandBtn) {
        expandBtn.textContent = "❐";
        expandBtn.title = "Restore Floating Resizable Window (~400×600)";
      }
      updateSizeBadge();
      return;
    }

    modal.classList.remove("ti84-split-screen");
    document.body.classList.remove("ti84-split-active");
    if (expandBtn) {
      expandBtn.textContent = "⤢";
      expandBtn.title = "Toggle 50vw Side-by-Side View";
    }

    ensureInitialPosition();
    modal.style.width = `${ti84State.width}px`;
    modal.style.height = `${ti84State.height}px`;
    modal.style.left = `${ti84State.left}px`;
    modal.style.top = `${ti84State.top}px`;
    updateSizeBadge();
  }

  function reloadTi84Handheld() {
    const { frame } = getElements();
    if (!frame) return;
    frame.src = "https://ti84calc.com/ti84calc";
  }

  /**
   * Switches between the "TI-84 Plus CE" tab and the "Desmos" tab
   * strictly by toggling CSS `display` properties (`display: none` vs `block`/`flex`).
   * Never destroys, reloads, or re-renders either iframe so student equations and graphs remain intact.
   */
  function switchTi84Mode(mode) {
    const isDesmos = mode === "grapher" || mode === "desmos";
    ti84State.activeMode = isDesmos ? "grapher" : "handheld";
    const { frame, builtinPanel, tabHandheld, tabGrapher } = getElements();

    if (isDesmos) {
      if (frame) {
        frame.style.display = "none";
      }
      if (builtinPanel) {
        builtinPanel.classList.remove("hidden");
        builtinPanel.style.display = "block";
      }
      if (tabGrapher) {
        tabGrapher.className =
          "px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-600 text-white cursor-pointer transition-colors";
      }
      if (tabHandheld) {
        tabHandheld.className =
          "px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer transition-colors";
      }
    } else {
      if (frame) {
        frame.classList.remove("hidden");
        frame.style.display = "block";
      }
      if (builtinPanel) {
        builtinPanel.style.display = "none";
      }
      if (tabHandheld) {
        tabHandheld.className =
          "px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-600 text-white cursor-pointer transition-colors";
      }
      if (tabGrapher) {
        tabGrapher.className =
          "px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer transition-colors";
      }
    }
  }

  function openTi84Calculator() {
    ti84State.isOpen = true;
    ti84State.isMinimized = false;
    syncModalGeometryAndVisibility();

    if (!ti84State.hasOpenedOnce) {
      ti84State.hasOpenedOnce = true;
      // Ensure the iframe is fresh once visible on screen
      const { frame } = getElements();
      if (frame && !frame.getAttribute("src")) {
        frame.setAttribute("src", "https://ti84calc.com/ti84calc");
      }
    }
  }

  function closeTi84Calculator() {
    ti84State.isOpen = false;
    ti84State.isMinimized = false;
    syncModalGeometryAndVisibility();
  }

  function minimizeTi84Calculator() {
    const { modal } = getElements();
    if (modal && !ti84State.isSplitScreen && !modal.classList.contains("ti84-modal-hidden")) {
      const rect = modal.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && rect.left > -1000) {
        ti84State.left = rect.left;
        ti84State.top = rect.top;
        ti84State.width = rect.width;
        ti84State.height = rect.height;
        ti84State.hasCustomPosition = true;
      }
    }
    ti84State.isOpen = true;
    ti84State.isMinimized = true;
    syncModalGeometryAndVisibility();
  }

  function restoreTi84Calculator() {
    ti84State.isOpen = true;
    ti84State.isMinimized = false;
    syncModalGeometryAndVisibility();
  }

  function toggleTi84SplitScreen() {
    const { modal } = getElements();
    if (!ti84State.isSplitScreen && modal && !modal.classList.contains("ti84-modal-hidden")) {
      const rect = modal.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && rect.left > -1000) {
        ti84State.left = rect.left;
        ti84State.top = rect.top;
        ti84State.width = rect.width;
        ti84State.height = rect.height;
        ti84State.hasCustomPosition = true;
      }
    }
    ti84State.isSplitScreen = !ti84State.isSplitScreen;
    ti84State.isOpen = true;
    ti84State.isMinimized = false;
    syncModalGeometryAndVisibility();
  }

  function resizeTi84CalculatorByStep(deltaFactor) {
    ti84State.isSplitScreen = false;
    ti84State.isOpen = true;
    ti84State.isMinimized = false;
    ti84State.hasCustomPosition = true;

    if (deltaFactor === 0) {
      ti84State.width = DEFAULT_WIDTH;
      ti84State.height = DEFAULT_HEIGHT;
    } else {
      const nextW = Math.round(ti84State.width * (1 + deltaFactor));
      const nextH = Math.round(ti84State.height * (1 + deltaFactor));
      const clamped = clampDimensions(nextW, nextH);
      ti84State.width = clamped.width;
      ti84State.height = clamped.height;
    }

    const pos = clampToViewport(
      ti84State.left ?? window.innerWidth - ti84State.width - 24,
      ti84State.top ?? 72,
      ti84State.width,
      ti84State.height
    );
    ti84State.left = pos.left;
    ti84State.top = pos.top;
    syncModalGeometryAndVisibility();
  }

  function toggleTi84Calculator() {
    if (!ti84State.isOpen || ti84State.isMinimized) {
      openTi84Calculator();
    } else {
      closeTi84Calculator();
    }
  }

  // ============================================================================
  // DRAGGING & 8-WAY SHRINK/STRETCH RESIZING ENGINE (Mouse + Touch)
  // ============================================================================
  function bindDragAndResizeEvents() {
    const { modal, header } = getElements();
    if (!modal || !header) return;
    if (modal.dataset.listenersBound === "true") return;
    modal.dataset.listenersBound = "true";

    function isInteractiveControl(target) {
      if (!target || typeof target.closest !== "function") return false;
      return Boolean(target.closest("button, a, input, select, textarea"));
    }

    function startDrag(clientX, clientY) {
      if (ti84State.isSplitScreen) {
        ti84State.isSplitScreen = false;
        modal.classList.remove("ti84-split-screen");
      }

      const rect = modal.getBoundingClientRect();
      ti84State.isDragging = true;
      ti84State.isResizing = false;
      ti84State.hasCustomPosition = true;
      ti84State.startX = clientX;
      ti84State.startY = clientY;
      ti84State.initialLeft = rect.left;
      ti84State.initialTop = rect.top;
      ti84State.width = rect.width || DEFAULT_WIDTH;
      ti84State.height = rect.height || DEFAULT_HEIGHT;

      modal.classList.add("is-dragging");
      header.classList.add("is-grabbing");
      setIframePointerEvents(false);
    }

    function startResize(dir, clientX, clientY) {
      if (ti84State.isSplitScreen) {
        ti84State.isSplitScreen = false;
        modal.classList.remove("ti84-split-screen");
      }

      const rect = modal.getBoundingClientRect();
      ti84State.isResizing = true;
      ti84State.isDragging = false;
      ti84State.resizeDir = dir || "se";
      ti84State.hasCustomPosition = true;
      ti84State.startX = clientX;
      ti84State.startY = clientY;
      ti84State.initialLeft = rect.left;
      ti84State.initialTop = rect.top;
      ti84State.initialWidth = rect.width || DEFAULT_WIDTH;
      ti84State.initialHeight = rect.height || DEFAULT_HEIGHT;

      modal.classList.add("is-dragging");
      setIframePointerEvents(false);
    }

    function onMove(clientX, clientY) {
      if (ti84State.isDragging) {
        const dx = clientX - ti84State.startX;
        const dy = clientY - ti84State.startY;
        const clamped = clampToViewport(
          ti84State.initialLeft + dx,
          ti84State.initialTop + dy,
          ti84State.width,
          ti84State.height
        );
        ti84State.left = clamped.left;
        ti84State.top = clamped.top;
        modal.style.left = `${clamped.left}px`;
        modal.style.top = `${clamped.top}px`;
        return;
      }

      if (ti84State.isResizing) {
        const dx = clientX - ti84State.startX;
        const dy = clientY - ti84State.startY;
        const dir = ti84State.resizeDir;

        let newLeft = ti84State.initialLeft;
        let newTop = ti84State.initialTop;
        let newWidth = ti84State.initialWidth;
        let newHeight = ti84State.initialHeight;

        const maxW = window.innerWidth - MIN_MARGIN * 2;
        const maxH = window.innerHeight - MIN_MARGIN * 2;

        if (dir.includes("e")) {
          newWidth = Math.min(
            Math.max(ti84State.initialWidth + dx, MIN_WIDTH),
            window.innerWidth - newLeft - MIN_MARGIN
          );
        }
        if (dir.includes("s")) {
          newHeight = Math.min(
            Math.max(ti84State.initialHeight + dy, MIN_HEIGHT),
            window.innerHeight - newTop - MIN_MARGIN
          );
        }
        if (dir.includes("w")) {
          const proposedW = ti84State.initialWidth - dx;
          const clampedW = Math.min(Math.max(proposedW, MIN_WIDTH), maxW);
          newLeft = ti84State.initialLeft + (ti84State.initialWidth - clampedW);
          if (newLeft < MIN_MARGIN) {
            newLeft = MIN_MARGIN;
            newWidth = ti84State.initialLeft + ti84State.initialWidth - MIN_MARGIN;
          } else {
            newWidth = clampedW;
          }
        }
        if (dir.includes("n")) {
          const proposedH = ti84State.initialHeight - dy;
          const clampedH = Math.min(Math.max(proposedH, MIN_HEIGHT), maxH);
          newTop = ti84State.initialTop + (ti84State.initialHeight - clampedH);
          if (newTop < MIN_MARGIN) {
            newTop = MIN_MARGIN;
            newHeight = ti84State.initialTop + ti84State.initialHeight - MIN_MARGIN;
          } else {
            newHeight = clampedH;
          }
        }

        ti84State.left = Math.round(newLeft);
        ti84State.top = Math.round(newTop);
        ti84State.width = Math.round(newWidth);
        ti84State.height = Math.round(newHeight);

        modal.style.left = `${ti84State.left}px`;
        modal.style.top = `${ti84State.top}px`;
        modal.style.width = `${ti84State.width}px`;
        modal.style.height = `${ti84State.height}px`;
        updateSizeBadge();
      }
    }

    function endInteraction() {
      if (!ti84State.isDragging && !ti84State.isResizing) return;
      ti84State.isDragging = false;
      ti84State.isResizing = false;
      ti84State.resizeDir = "";
      modal.classList.remove("is-dragging");
      header.classList.remove("is-grabbing");
      setIframePointerEvents(true);
    }

    header.addEventListener("mousedown", (e) => {
      if (e.button !== 0 || isInteractiveControl(e.target)) return;
      e.preventDefault();
      startDrag(e.clientX, e.clientY);
    });

    header.addEventListener(
      "touchstart",
      (e) => {
        if (isInteractiveControl(e.target)) return;
        const touch = e.touches[0];
        if (!touch) return;
        startDrag(touch.clientX, touch.clientY);
      },
      { passive: true }
    );

    modal.addEventListener("mousedown", (e) => {
      const handle =
        e.target && typeof e.target.closest === "function"
          ? e.target.closest("[data-resize-dir]")
          : null;
      if (!handle || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      startResize(handle.getAttribute("data-resize-dir"), e.clientX, e.clientY);
    });

    modal.addEventListener(
      "touchstart",
      (e) => {
        const handle =
          e.target && typeof e.target.closest === "function"
            ? e.target.closest("[data-resize-dir]")
            : null;
        if (!handle) return;
        const touch = e.touches[0];
        if (!touch) return;
        e.stopPropagation();
        startResize(handle.getAttribute("data-resize-dir"), touch.clientX, touch.clientY);
      },
      { passive: true }
    );

    window.addEventListener("mousemove", (e) => {
      if (!ti84State.isDragging && !ti84State.isResizing) return;
      e.preventDefault();
      onMove(e.clientX, e.clientY);
    });

    window.addEventListener("mouseup", () => {
      endInteraction();
    });

    window.addEventListener(
      "touchmove",
      (e) => {
        if (!ti84State.isDragging && !ti84State.isResizing) return;
        const touch = e.touches[0];
        if (!touch) return;
        e.preventDefault();
        onMove(touch.clientX, touch.clientY);
      },
      { passive: false }
    );

    window.addEventListener("touchend", () => {
      endInteraction();
    });

    window.addEventListener("resize", () => {
      if (!ti84State.isOpen || ti84State.isMinimized) return;
      syncModalGeometryAndVisibility();
    });
  }

  function initTi84Calculator() {
    ensureDirectChildOfBody();
    ensureResizeHandlesAndControls();
    bindDragAndResizeEvents();
    syncModalGeometryAndVisibility();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTi84Calculator);
  } else {
    initTi84Calculator();
  }

  // Expose Global API
  window.openTi84Calculator = openTi84Calculator;
  window.closeTi84Calculator = closeTi84Calculator;
  window.minimizeTi84Calculator = minimizeTi84Calculator;
  window.restoreTi84Calculator = restoreTi84Calculator;
  window.toggleTi84SplitScreen = toggleTi84SplitScreen;
  window.resizeTi84CalculatorByStep = resizeTi84CalculatorByStep;
  window.toggleTi84Calculator = toggleTi84Calculator;
  window.toggleArenaTi84Modal = toggleTi84Calculator;
  window.reloadTi84Handheld = reloadTi84Handheld;
  window.switchTi84Mode = switchTi84Mode;
})();
