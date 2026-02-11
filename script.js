/* ===================================
   Windows XP Portfolio - Complete JavaScript
   All Features Included & Working
   ================================== */

// State Management
const state = {
  activeWindow: null,
  zIndexCounter: 100,
  windowStates: {},
  isDragging: false,
  dragElement: null,
  dragOffset: { x: 0, y: 0 },
  achievements: {
    explorer: false,
    gamer: false,
    terminalUser: false,
    persistent: false,
  },
  openedWindows: new Set(),
  gameTimer: null,
  gameStartTime: null,
  gameActive: false,
};

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  showLoadingScreen();
  setTimeout(() => {
    initializeWindows();
    initializeDesktopIcons();
    initializeTaskbar();
    initializeStartMenu();
    initializeClock();
    initializeTerminal();
    initializeMinesweeper();
    initializeClippy();
    setupEventListeners();
    hideLoadingScreen();

    // Show welcome
    setTimeout(() => {
      openWindow("projects");
      setTimeout(() => showClippy(), 1000);
    }, 500);
  }, 2500);
});

/* ===================================
   Loading Screen
   ================================== */
function showLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  loadingScreen.style.display = "flex";
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  loadingScreen.classList.add("fade-out");
  setTimeout(() => {
    loadingScreen.style.display = "none";
  }, 500);
}

/* ===================================
   Window Initialization
   ================================== */
function initializeWindows() {
  const windows = document.querySelectorAll(".window");

  windows.forEach((window, index) => {
    const windowId = window.getAttribute("data-window");

    // Set initial positions (cascading effect)
    if (!window.classList.contains("maximized")) {
      window.style.top = `${50 + index * 30}px`;
      window.style.left = `${100 + index * 30}px`;
    }

    // Initialize window state
    state.windowStates[windowId] = {
      isMaximized: false,
      previousPosition: null,
      previousSize: null,
    };

    // Setup window controls
    setupWindowControls(window);

    // Setup dragging
    setupWindowDrag(window);
  });
}

/* ===================================
   Window Controls
   ================================== */
function setupWindowControls(window) {
  const closeBtn = window.querySelector(".close-btn");
  const minimizeBtn = window.querySelector(".minimize-btn");
  const maximizeBtn = window.querySelector(".maximize-btn");

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeWindow(window);
  });

  minimizeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    minimizeWindow(window);
  });

  maximizeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMaximize(window);
  });
}

function closeWindow(window) {
  window.classList.remove("active");
  removeTaskbarItem(window.getAttribute("data-window"));

  const allWindows = Array.from(document.querySelectorAll(".window.active"));
  if (allWindows.length > 0) {
    focusWindow(allWindows[allWindows.length - 1]);
  }
}

function minimizeWindow(window) {
  window.classList.remove("active");
  const windowId = window.getAttribute("data-window");
  const taskbarItem = document.querySelector(
    `.taskbar-item[data-window="${windowId}"]`,
  );
  if (taskbarItem) {
    taskbarItem.classList.remove("active");
  }
}

function toggleMaximize(window) {
  const windowId = window.getAttribute("data-window");
  const windowState = state.windowStates[windowId];

  if (windowState.isMaximized) {
    window.classList.remove("maximized");
    if (windowState.previousPosition) {
      window.style.top = windowState.previousPosition.top;
      window.style.left = windowState.previousPosition.left;
      window.style.width = windowState.previousSize.width;
      window.style.height = windowState.previousSize.height;
    }
    windowState.isMaximized = false;
  } else {
    windowState.previousPosition = {
      top: window.style.top,
      left: window.style.left,
    };
    windowState.previousSize = {
      width: window.style.width,
      height: window.style.height,
    };

    window.classList.add("maximized");
    windowState.isMaximized = true;
  }
}

/* ===================================
   Window Dragging
   ================================== */
function setupWindowDrag(window) {
  const titleBar = window.querySelector(".title-bar");

  titleBar.addEventListener("mousedown", startDrag);
  titleBar.addEventListener("touchstart", startDrag, { passive: false });

  function startDrag(e) {
    if (e.target.closest(".title-bar-controls")) return;
    if (window.classList.contains("maximized")) return;

    e.preventDefault();

    state.isDragging = true;
    state.dragElement = window;
    document.body.classList.add("dragging");

    focusWindow(window);

    const rect = window.getBoundingClientRect();
    const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;

    state.dragOffset = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };

    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchmove", drag, { passive: false });
    document.addEventListener("touchend", stopDrag);
  }
}

function drag(e) {
  if (!state.isDragging || !state.dragElement) return;

  e.preventDefault();

  const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;

  let newX = clientX - state.dragOffset.x;
  let newY = clientY - state.dragOffset.y;

  const maxX = window.innerWidth - state.dragElement.offsetWidth;
  const maxY = window.innerHeight - state.dragElement.offsetHeight - 30;

  newX = Math.max(0, Math.min(newX, maxX));
  newY = Math.max(0, Math.min(newY, maxY));

  state.dragElement.style.left = `${newX}px`;
  state.dragElement.style.top = `${newY}px`;
}

function stopDrag() {
  if (!state.isDragging) return;

  state.isDragging = false;
  state.dragElement = null;
  document.body.classList.remove("dragging");

  document.removeEventListener("mousemove", drag);
  document.removeEventListener("mouseup", stopDrag);
  document.removeEventListener("touchmove", drag);
  document.removeEventListener("touchend", stopDrag);
}

/* ===================================
   Window Focus Management
   ================================== */
function focusWindow(window) {
  document.querySelectorAll(".window").forEach((w) => {
    w.classList.remove("active");
  });

  window.classList.add("active");
  window.style.zIndex = ++state.zIndexCounter;

  state.activeWindow = window;

  const windowId = window.getAttribute("data-window");
  updateTaskbarActive(windowId);
}

function openWindow(windowId) {
  console.log("🪟 Opening window:", windowId);

  const windowElement = document.querySelector(
    `.window[data-window="${windowId}"]`,
  );
  if (!windowElement) {
    console.error("❌ Window not found:", windowId);
    return;
  }

  console.log("✅ Window found:", windowId);

  if (windowElement.classList.contains("active")) {
    focusWindow(windowElement);
    return;
  }

  windowElement.classList.add("active");
  focusWindow(windowElement);

  addTaskbarItem(windowId);

  // Track opened windows for achievements
  state.openedWindows.add(windowId);
  checkExplorerAchievement();

  // Special handling for terminal
  if (windowId === "terminal") {
    setTimeout(() => {
      document.getElementById("terminal-input").focus();
    }, 100);
  }
}

/* ===================================
   Desktop Icons
   ================================== */
function initializeDesktopIcons() {
  const icons = document.querySelectorAll(".desktop-icon");

  icons.forEach((icon) => {
    icon.addEventListener("dblclick", () => {
      const windowId = icon.getAttribute("data-window");
      if (windowId) {
        openWindow(windowId);
      }
    });

    icon.addEventListener("click", (e) => {
      if (e.detail === 1) {
        document.querySelectorAll(".desktop-icon").forEach((i) => {
          i.style.background = "";
          i.style.border = "1px solid transparent";
        });
        icon.style.background = "rgba(255, 255, 255, 0.2)";
        icon.style.border = "1px dotted #fff";
      }
    });
  });
}

/* ===================================
   Taskbar Management
   ================================== */
function initializeTaskbar() {
  document.querySelector(".desktop").addEventListener("click", (e) => {
    if (e.target.classList.contains("desktop")) {
      document.querySelectorAll(".desktop-icon").forEach((icon) => {
        icon.style.background = "";
        icon.style.border = "1px solid transparent";
      });
    }
  });
}

function addTaskbarItem(windowId) {
  if (document.querySelector(`.taskbar-item[data-window="${windowId}"]`)) {
    return;
  }

  const taskbarItems = document.querySelector(".taskbar-items");
  const windowElement = document.querySelector(
    `.window[data-window="${windowId}"]`,
  );
  const windowTitle =
    windowElement.querySelector(".title-bar-text").textContent;

  const taskbarItem = document.createElement("div");
  taskbarItem.className = "taskbar-item active";
  taskbarItem.setAttribute("data-window", windowId);
  taskbarItem.textContent = windowTitle;

  taskbarItem.addEventListener("click", () => {
    const win = document.querySelector(`.window[data-window="${windowId}"]`);
    if (win.classList.contains("active")) {
      minimizeWindow(win);
    } else {
      win.classList.add("active");
      focusWindow(win);
    }
  });

  // Inside addTaskbarItem
  const iconSrc = windowElement.querySelector(".title-bar img")?.src;
  if (iconSrc) {
    const img = document.createElement("img");
    img.src = iconSrc;
    img.style.width = "16px";
    img.style.marginRight = "5px";
    taskbarItem.prepend(img);
  }

  taskbarItems.appendChild(taskbarItem);
}

function removeTaskbarItem(windowId) {
  const taskbarItem = document.querySelector(
    `.taskbar-item[data-window="${windowId}"]`,
  );
  if (taskbarItem) {
    taskbarItem.remove();
  }
}

function updateTaskbarActive(windowId) {
  document.querySelectorAll(".taskbar-item").forEach((item) => {
    item.classList.remove("active");
  });

  const activeItem = document.querySelector(
    `.taskbar-item[data-window="${windowId}"]`,
  );
  if (activeItem) {
    activeItem.classList.add("active");
  }
}

/* ===================================
   Start Menu
   ================================== */
function initializeStartMenu() {
  const startButton = document.querySelector(".start-button");
  const startMenu = document.getElementById("start-menu");
  const menuItems = document.querySelectorAll(".start-menu-item[data-window]");

  startButton.addEventListener("click", (e) => {
    e.stopPropagation();
    startMenu.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
      startMenu.classList.remove("active");
    }
  });

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      const windowId = item.getAttribute("data-window");
      openWindow(windowId);
      startMenu.classList.remove("active");
    });
  });

  const reloadButton = startMenu.querySelector(
    ".start-menu-footer .start-menu-item",
  );
  if (reloadButton) {
    reloadButton.addEventListener("click", () => {
      location.reload();
    });
  }
}

/* ===================================
   System Clock
   ================================== */
function initializeClock() {
  updateClock();
  setInterval(updateClock, 1000);
}

function updateClock() {
  const trayTime = document.getElementById("tray-time");
  const now = new Date();

  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  trayTime.textContent = `${hours}:${minutes} ${ampm}`;
}

/* ===================================
   Terminal / Command Prompt
   ================================== */
function initializeTerminal() {
  const terminalInput = document.getElementById("terminal-input");
  const terminalOutput = document.getElementById("terminal-output");

  const commands = {
    help: () => {
      return `Available commands:
  help      - Show this help message
  about     - Open About Me window
  skills    - Open Skills window
  projects  - Open Projects window
  contact   - Open Contact window
  clear     - Clear terminal screen
  whoami    - Display information about Justine
  date      - Show current date and time
  fun       - Open Minesweeper game
  resume    - Download resume
  social    - Show social media links
  easteregg - Find the secret!`;
    },
    about: () => {
      openWindow("about");
      return "Opening About Me window...";
    },
    skills: () => {
      openWindow("skills");
      return "Opening Skills window...";
    },
    projects: () => {
      openWindow("projects");
      return "Opening Projects window...";
    },
    contact: () => {
      openWindow("contact");
      return "Opening Contact window...";
    },
    clear: () => {
      terminalOutput.innerHTML = "";
      return null;
    },
    whoami: () => {
      return `Justine - Front-End Web Developer
A passionate developer who loves creating beautiful and functional web experiences.
Specializes in HTML, CSS, JavaScript, and modern web technologies.`;
    },
    date: () => {
      return new Date().toString();
    },
    fun: () => {
      openWindow("minesweeper");
      return "Launching Minesweeper... Have fun!";
    },
    resume: () => {
      downloadResume();
      return "Downloading resume...";
    },
    social: () => {
      return `Social Media Links:
  GitHub:   https://github.com/JustineTesara
  LinkedIn: https://www.linkedin.com/in/justine-tesara-a59674318/
  Facebook:  https://www.facebook.com/justine.riosa.tesara`;
    },
    easteregg: () => {
      unlockAchievement("Secret Found!", "You found the hidden easter egg! 🎉");
      return `
  ⭐ CONGRATULATIONS! ⭐
  You found the secret easter egg!
  
  Here's a fun fact about me:
  I built this entire portfolio in Windows XP theme
  because I believe in making web experiences memorable!
  
  Keep exploring - there might be more secrets... 👀`;
    },
  };

  terminalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const command = terminalInput.value.trim().toLowerCase();
      terminalInput.value = "";

      // Display command
      const commandLine = document.createElement("div");
      commandLine.className = "terminal-line command";
      commandLine.textContent = `C:\\Portfolio> ${command}`;
      terminalOutput.appendChild(commandLine);

      // Execute command
      let output = "";
      if (command === "") {
        // Do nothing for empty command
      } else if (commands[command]) {
        output = commands[command]();
        if (!state.achievements.terminalUser) {
          state.achievements.terminalUser = true;
          unlockAchievement("Terminal Master", "Used the command prompt!");
        }
      } else {
        output = `'${command}' is not recognized as an internal or external command.
Type 'help' for available commands.`;
      }

      if (output !== null && output !== "") {
        const outputLine = document.createElement("div");
        outputLine.className = "terminal-line";
        outputLine.textContent = output;
        outputLine.style.whiteSpace = "pre-line";
        terminalOutput.appendChild(outputLine);
      }

      // Add blank line
      const blankLine = document.createElement("div");
      blankLine.className = "terminal-line";
      blankLine.innerHTML = "&nbsp;";
      terminalOutput.appendChild(blankLine);

      // Scroll to bottom
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
  });

  crash: () => {
    const bsod = document.createElement("div");
    bsod.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;background:#0000aa;color:#ffffff;font-family:monospace;padding:50px;z-index:999999;font-size:1.2rem;";
    bsod.innerHTML = `
    <p>A problem has been detected and Windows has been shut down to prevent damage to your computer.</p>
    <p>UNEXPECTED_KERNEL_MODE_TRAP</p>
    <p>If this is the first time you've seen this Stop error screen, restart your computer.</p>
    <p>Press any key to restart...</p>
  `;
    document.body.appendChild(bsod);
    document.addEventListener("keydown", () => location.reload(), {
      once: true,
    });
    return "Initiating system crash...";
  };
}

/* ===================================
   Minesweeper Game
   ================================== */
function initializeMinesweeper() {
  const gameBoard = document.getElementById("game-board");
  const resetBtn = document.getElementById("reset-game");
  const mineCounter = document.getElementById("mine-counter");
  const timeCounter = document.getElementById("time-counter");

  let board = [];
  let revealed = [];
  let flagged = [];
  const rows = 9;
  const cols = 9;
  const totalMines = 10;

  function createBoard() {
    board = Array(rows)
      .fill()
      .map(() => Array(cols).fill(0));
    revealed = Array(rows)
      .fill()
      .map(() => Array(cols).fill(false));
    flagged = Array(rows)
      .fill()
      .map(() => Array(cols).fill(false));

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < totalMines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      if (board[row][col] !== -1) {
        board[row][col] = -1;
        minesPlaced++;
      }
    }

    // Calculate numbers
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c] === -1) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (
              nr >= 0 &&
              nr < rows &&
              nc >= 0 &&
              nc < cols &&
              board[nr][nc] === -1
            ) {
              count++;
            }
          }
        }
        board[r][c] = count;
      }
    }
  }

  function renderBoard() {
    gameBoard.innerHTML = "";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.row = r;
        cell.dataset.col = c;

        if (revealed[r][c]) {
          cell.classList.add("revealed");
          if (board[r][c] === -1) {
            cell.classList.add("mine");
          } else if (board[r][c] > 0) {
            cell.textContent = board[r][c];
            cell.classList.add(`num-${board[r][c]}`);
          }
        } else if (flagged[r][c]) {
          cell.classList.add("flagged");
        }

        cell.addEventListener("click", () => handleCellClick(r, c));
        cell.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          handleRightClick(r, c);
        });

        gameBoard.appendChild(cell);
      }
    }

    // Update mine counter
    const flagCount = flagged.flat().filter((f) => f).length;
    mineCounter.textContent = String(totalMines - flagCount).padStart(3, "0");
  }

  function handleCellClick(r, c) {
    if (flagged[r][c] || revealed[r][c]) return;

    if (!state.gameActive) {
      state.gameActive = true;
      state.gameStartTime = Date.now();
      startGameTimer();
    }

    if (board[r][c] === -1) {
      // Game over
      revealAllMines();
      resetBtn.textContent = "😵";
      state.gameActive = false;
      stopGameTimer();
      setTimeout(() => {
        alert("Game Over! You hit a mine!");
      }, 100);
      return;
    }

    revealCell(r, c);
    checkWin();
  }

  function handleRightClick(r, c) {
    if (revealed[r][c]) return;
    flagged[r][c] = !flagged[r][c];
    renderBoard();
  }

  function revealCell(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || revealed[r][c]) return;

    revealed[r][c] = true;

    if (board[r][c] === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          revealCell(r + dr, c + dc);
        }
      }
    }

    renderBoard();
  }

  function revealAllMines() {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c] === -1) {
          revealed[r][c] = true;
        }
      }
    }
    renderBoard();
  }

  function checkWin() {
    let allRevealed = true;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c] !== -1 && !revealed[r][c]) {
          allRevealed = false;
          break;
        }
      }
    }

    if (allRevealed) {
      resetBtn.textContent = "😎";
      state.gameActive = false;
      stopGameTimer();
      if (!state.achievements.gamer) {
        state.achievements.gamer = true;
        unlockAchievement("Minesweeper Pro!", "Won a game of Minesweeper!");
      }
      setTimeout(() => {
        alert("Congratulations! You won!");
      }, 100);
    }
  }

  function startGameTimer() {
    state.gameTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - state.gameStartTime) / 1000);
      timeCounter.textContent = String(Math.min(elapsed, 999)).padStart(3, "0");
    }, 1000);
  }

  function stopGameTimer() {
    if (state.gameTimer) {
      clearInterval(state.gameTimer);
      state.gameTimer = null;
    }
  }

  function resetGame() {
    createBoard();
    renderBoard();
    resetBtn.textContent = "😊";
    timeCounter.textContent = "000";
    state.gameActive = false;
    stopGameTimer();
  }

  resetBtn.addEventListener("click", resetGame);

  // Initialize game
  resetGame();
}

/* ===================================
   Clippy Assistant
   ================================== */
function initializeClippy() {
  const clippy = document.getElementById("clippy");
  const clippyClose = document.getElementById("clippy-close");
  const clippyText = document.getElementById("clippy-text");
  const clippyTips = document.querySelectorAll(".clippy-tip-btn");

  const tips = {
    navigation:
      "Try double-clicking the desktop icons to open different sections of my portfolio! You can also use the Start menu at the bottom left.",
    contact:
      "Click on the Contact icon to find my email and social media links. You can also download my resume from there!",
    fun: "Did you know there's a working Minesweeper game? Try the Command Prompt too - type 'help' to see what it can do!",
  };

  clippyTips.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tip = btn.dataset.tip;
      clippyText.textContent = tips[tip];
    });
  });

  clippyClose.addEventListener("click", () => {
    clippy.classList.add("hidden");
  });
}

function showClippy() {
  const clippy = document.getElementById("clippy");
  clippy.classList.remove("hidden");
}

/* ===================================
   Achievements System
   ================================== */
function unlockAchievement(title, description) {
  const achievement = document.getElementById("achievement");
  const titleEl = achievement.querySelector(".achievement-title");
  const descEl = document.getElementById("achievement-text");

  titleEl.textContent = title;
  descEl.textContent = description;

  achievement.classList.add("show");

  setTimeout(() => {
    achievement.classList.remove("show");
  }, 4000);
}

function checkExplorerAchievement() {
  const requiredWindows = ["about", "skills", "projects", "contact"];
  const hasOpened = requiredWindows.every((w) => state.openedWindows.has(w));

  if (hasOpened && !state.achievements.explorer) {
    state.achievements.explorer = true;
    unlockAchievement("Explorer!", "Opened all main windows");
  }
}

/* ===================================
   Resume Download Function
   ================================== */
function downloadResume() {
  const link = document.createElement("a");
  link.href = "Justine_Tesara_RESUME.pdf";
  link.download = "Justine_Tesara_RESUME.pdf";
  link.click();

  // Option 2: External link (Google Drive example)
  // Replace with your actual resume URL
  // window.open("https://drive.google.com/file/d/YOUR_FILE_ID/view", "_blank");
}

/* ===================================
   Additional Event Listeners
   ================================== */
function setupEventListeners() {
  // Bring window to front on click
  document.querySelectorAll(".window").forEach((window) => {
    window.addEventListener("mousedown", () => {
      if (!window.classList.contains("active")) {
        focusWindow(window);
      }
    });
  });

  // Resume icon double-click
  const resumeIcon = document.getElementById("resume-icon");
  if (resumeIcon) {
    resumeIcon.addEventListener("dblclick", () => {
      downloadResume();
    });
  }

  // Resume download button
  const downloadBtn = document.getElementById("download-resume");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      downloadResume();
    });
  }

  // Prevent context menu on desktop
  document.querySelector(".desktop").addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.getElementById("start-menu").classList.remove("active");
    }
  });
}

/* ===================================
   Responsive Adjustments
   ================================== */
function handleResize() {
  document.querySelectorAll(".window").forEach((window) => {
    if (window.classList.contains("maximized")) return;

    const rect = window.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - 30;

    if (rect.left + rect.width > viewportWidth) {
      window.style.left = `${viewportWidth - rect.width - 10}px`;
    }

    if (rect.top + rect.height > viewportHeight) {
      window.style.top = `${viewportHeight - rect.height - 10}px`;
    }

    if (rect.left < 0) {
      window.style.left = "10px";
    }

    if (rect.top < 0) {
      window.style.top = "10px";
    }
  });
}

window.addEventListener("resize", handleResize);

/* ===================================
   Console Easter Egg
   ================================== */
console.log(
  "%c Welcome to Windows XP Portfolio! ",
  "background: #0055d4; color: white; font-size: 16px; padding: 10px; font-family: Tahoma;",
);
console.log(
  "%c Created by Justine ",
  "background: #3ac23a; color: white; font-size: 14px; padding: 8px; font-family: Tahoma;",
);
console.log("%c Features: ", "font-weight: bold; font-size: 12px;");
console.log("✓ Draggable windows");
console.log('✓ Working Command Prompt (type "help")');
console.log("✓ Playable Minesweeper");
console.log("✓ Clippy assistant");
console.log("✓ Achievement system");
console.log("✓ And more!");
console.log("\nTry double-clicking the desktop icons!");

function shareProject() {
  const url = window.location.href;
  const title = document.getElementById("project-view-heading").textContent;
  navigator.clipboard.writeText(url);
  alert("Link copied to clipboard!");
}

/* ===================================
   Shutdown Animation
   ================================== */
function shutdownPortfolio() {
  // Close all windows
  document.querySelectorAll(".window.active").forEach((window) => {
    window.classList.remove("active");
  });

  // Close start menu
  document.getElementById("start-menu").classList.remove("active");

  // Show shutdown screen
  const shutdownScreen = document.createElement("div");
  shutdownScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #0055d4;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        z-index: 99999;
        color: white;
        font-family: Tahoma, sans-serif;
    `;

  shutdownScreen.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 20px;">Windows is shutting down...</div>
        <div style="font-size: 14px;">It's now safe to close this window</div>
    `;

  document.body.appendChild(shutdownScreen);

  // Optional: Reload after 3 seconds
  setTimeout(() => {
    location.reload();
  }, 3000);
}

/* ===================================
   Share Project Function
   ================================== */
function shareProject() {
  const projectTitle = document.getElementById(
    "project-view-heading",
  ).textContent;
  const url = window.location.href;

  // Create share text
  const shareText = `Check out my project: ${projectTitle}`;

  // Try to use Web Share API (works on mobile and some browsers)
  if (navigator.share) {
    navigator
      .share({
        title: projectTitle,
        text: shareText,
        url: url,
      })
      .then(() => {
        console.log("Thanks for sharing!");
      })
      .catch((err) => {
        console.log("Error sharing:", err);
      });
  } else {
    // Fallback: Copy to clipboard
    const tempInput = document.createElement("input");
    tempInput.value = `${shareText} - ${url}`;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);

    // Show Windows XP-style alert
    alert("✅ Link copied to clipboard!\n\nShare this project with others!");
  }
}
/* ===================================
   Image Error Handling
   ================================== */
document.addEventListener("DOMContentLoaded", function () {
  // Handle image loading errors
  const images = document.querySelectorAll("img");
  images.forEach((img) => {
    img.addEventListener("error", function () {
      console.error("Failed to load image:", this.src);
      // Replace with placeholder
      this.style.display = "none";

      // Create placeholder
      const placeholder = document.createElement("div");
      placeholder.style.cssText = `
                width: 100%;
                height: 300px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 48px;
            `;
      placeholder.textContent = "📊";

      if (this.parentElement) {
        this.parentElement.appendChild(placeholder);
      }
    });
  });
});
/* ===================================
   BROWSER NAVIGATION SYSTEM
   ================================== */

// Browser state management
const browserState = {
  history: [],
  currentIndex: -1,
  pages: {},
};

// Initialize browser on load
function initializeBrowser() {
  console.log("🔧 initializeBrowser called");

  const browserContent = document.getElementById("browser-content");
  console.log("📦 browser-content exists:", !!browserContent);

  if (!browserContent) {
    console.error("❌ Browser content div not found! Retrying...");
    setTimeout(() => initializeBrowser(), 500);
    return;
  }

  console.log("✅ Browser content found, initializing...");

  // Register pages
  browserState.pages = {
    home: renderProjectsHome,
    search: renderSearchResults,
    project: renderProjectDetail,
    contact: renderContactPage, // Add this line
  };

  // Load home page
  navigateTo("home");

  // Setup event listeners
  setupBrowserControls();
}

// Navigation function
function navigateTo(page, data = {}) {
  // Add to history
  if (browserState.currentIndex < browserState.history.length - 1) {
    browserState.history = browserState.history.slice(
      0,
      browserState.currentIndex + 1,
    );
  }

  browserState.history.push({ page, data });
  browserState.currentIndex++;

  // Render page
  renderPage(page, data);

  // Update controls
  updateBrowserControls();
}

// Render page
function renderPage(page, data) {
  const content = document.getElementById("browser-content");
  const loading = document.getElementById("browser-loading");

  // Show loading
  loading.style.display = "block";

  setTimeout(() => {
    // Render content
    if (browserState.pages[page]) {
      content.innerHTML = "";
      content.appendChild(browserState.pages[page](data));
    }

    // Update URL bar
    updateURLBar(page, data);

    // Hide loading
    loading.style.display = "none";
  }, 300);
}

// Update URL bar
function updateURLBar(page, data) {
  const urlInput = document.getElementById("url-input");

  const urls = {
    home: "https://justine-dev-projects.com",
    search: `https://justine-dev-projects.com/search?q=${data.query || ""}`,
    project: `https://justine-dev-projects.com/project/${data.id || ""}`,
  };

  urlInput.value = urls[page] || "https://justine-dev-projects.com";
}

// Browser controls
function setupBrowserControls() {
  const backBtn = document.getElementById("browser-back");
  const forwardBtn = document.getElementById("browser-forward");
  const refreshBtn = document.getElementById("browser-refresh");
  const goBtn = document.getElementById("url-go-btn");
  const urlInput = document.getElementById("url-input");

  backBtn.addEventListener("click", () => {
    if (browserState.currentIndex > 0) {
      browserState.currentIndex--;
      const { page, data } = browserState.history[browserState.currentIndex];
      renderPage(page, data);
      updateBrowserControls();
    }
  });

  forwardBtn.addEventListener("click", () => {
    if (browserState.currentIndex < browserState.history.length - 1) {
      browserState.currentIndex++;
      const { page, data } = browserState.history[browserState.currentIndex];
      renderPage(page, data);
      updateBrowserControls();
    }
  });

  refreshBtn.addEventListener("click", () => {
    const { page, data } = browserState.history[browserState.currentIndex];
    renderPage(page, data);
  });

  // Search functionality
  goBtn.addEventListener("click", handleSearch);
  urlInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
  });

  // Make URL bar editable on click
  urlInput.addEventListener("click", function () {
    this.readOnly = false;
    this.select();
  });

  urlInput.addEventListener("blur", function () {
    this.readOnly = true;
  });
}

function handleSearch() {
  const urlInput = document.getElementById("url-input");
  const query = urlInput.value.toLowerCase();

  // Check for keywords
  if (query.includes("resume") || query.includes("cv")) {
    navigateTo("search", { query: "resume", type: "resume" });
  } else if (query.includes("project")) {
    navigateTo("home");
  } else if (query.includes("facebook") || query.includes("fb")) {
    navigateTo("search", { query: "facebook", type: "social" });
  } else {
    navigateTo("search", { query: query });
  }
}

function updateBrowserControls() {
  const backBtn = document.getElementById("browser-back");
  const forwardBtn = document.getElementById("browser-forward");

  backBtn.disabled = browserState.currentIndex <= 0;
  forwardBtn.disabled =
    browserState.currentIndex >= browserState.history.length - 1;
}

// Page Renderers
function renderProjectsHome() {
  const container = document.createElement("div");
  container.className = "browser-content";

  container.innerHTML = `
    <div class="content-header">
      <h2 class="youtube-style-title">My Projects Channel</h2>
      <p class="channel-info">Showcasing my development work</p>
    </div>
    
    <div class="youtube-grid" id="projects-grid">
      <!-- Projects will be inserted here -->
    </div>
  `;

  // Add projects
  const grid = container.querySelector("#projects-grid");

  // Project 1: Journal Blog Site
  grid.appendChild(
    createProjectCard({
      id: "journal",
      title: "Journal Blog Site",
      description:
        "A simple Journal Blog Site where users can create and publish their own journal entries.",
      image: "Pictures/JournalSite.jpg",
      tech: ["HTML", "CSS", "JavaScript", "PHP", "MySQL"],
      features: [
        "User authentication and authorization",
        "Create, read, update, delete journal entries",
        "Rich text editor for writing",
        "Categories and tags for organization",
        "Responsive design for all devices",
      ],
      github: "https://github.com/JustineTesara/Journal-Blog-Site",
    }),
  );

  // Project 2: PipWise V2
  grid.appendChild(
    createProjectCard({
      id: "pipwise-v2",
      title: "PipWise V2 – Forex Trader Companion",
      description:
        "A lightweight forex trader companion app designed for risk management and strategy analysis.",
      image: "Pictures/pipwise-v2.jpg",
      tech: [
        "HTML",
        "CSS",
        "JavaScript",
        "Node.js",
        "Express.js",
        "Alpha Vantage API",
      ],
      features: [
        "Position size calculator for optimal trade sizing",
        "Trading cost calculator (spread, commission, swap)",
        "Portfolio risk manager with real-time P&L tracking",
        "Strategy expectancy analyzer",
        "Dark mode and Light mode theme switcher",
        "Real-time forex data integration",
      ],
      github: "https://github.com/JustineTesara/PipWise-V2",
    }),
  );

  return container;
}

function createProjectCard(project) {
  const card = document.createElement("div");
  card.className = "youtube-card";

  card.innerHTML = `
    <div class="video-thumbnail">
      <img src="${project.image}" alt="${project.title}" class="thumbnail-image" />
      <div class="video-duration">Featured</div>
    </div>
    <div class="video-info">
      <h3 class="video-title">${project.title}</h3>
      <div class="video-meta">
        <span class="channel-name">Justine Dev</span>
        <span class="meta-separator">•</span>
        <span class="view-count">Full Stack Project</span>
      </div>
      <p class="video-description">${project.description}</p>
      <div class="tech-stack">
        ${project.tech.map((tech) => `<span class="tech-tag">${tech}</span>`).join("")}
      </div>
    </div>
  `;

  card.addEventListener("click", () => {
    navigateTo("project", project);
  });

  return card;
}

function renderProjectDetail(project) {
  const container = document.createElement("div");
  container.className = "project-view-container";

  container.innerHTML = `
    <div class="project-preview-column">
      <div class="project-preview-wrapper">
        <img src="${project.image}" alt="${project.title}" class="project-preview-img" />
      </div>
      
      <h2 class="project-view-heading">${project.title}</h2>
      
      <div class="project-view-actions">
        ${
          project.demo
            ? `<a href="${project.demo}" target="_blank" class="project-action-btn demo-btn">
          <span class="action-icon">🚀</span><span>Live Demo</span>
        </a>`
            : ""
        }
        ${
          project.github
            ? `<a href="${project.github}" target="_blank" class="project-action-btn github-btn">
          <span class="action-icon">💻</span><span>View Code</span>
        </a>`
            : ""
        }
        <button onclick="navigateTo('home')" class="project-action-btn back-btn">
          <span class="action-icon">←</span><span>Back to Projects</span>
        </button>
      </div>
      
      <div class="project-description-section">
        <h3 class="section-title">About This Project</h3>
        <p class="project-description-text">${project.description}</p>
      </div>
      
      <div class="project-features-section">
        <h3 class="section-title">Key Features</h3>
        <ul class="features-list">
          ${project.features.map((f) => `<li>${f}</li>`).join("")}
        </ul>
      </div>
    </div>
    
    <div class="project-sidebar-column">
      <h3 class="sidebar-title">Technologies Used</h3>
      <div class="tech-badges-list">
        ${project.tech.map((t) => `<span class="tech-badge">${t}</span>`).join("")}
      </div>
      
      <div class="project-stats">
        <h3 class="sidebar-title">Project Info</h3>
        <div class="stat-item">
          <span class="stat-label">Status:</span>
          <span class="stat-value">✅ Completed</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Type:</span>
          <span class="stat-value">Full Stack</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Year:</span>
          <span class="stat-value">2025</span>
        </div>
      </div>
    </div>
  `;

  return container;
}

function renderSearchResults(data) {
  const container = document.createElement("div");

  if (data.type === "resume") {
    // Old Facebook Blue Header
    container.innerHTML = `
      <div style="background: #3b5998; padding: 12px 20px; color: white; font-family: Arial, sans-serif; border-bottom: 1px solid #29447e;">
        <div style="max-width: 980px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between;">
          <h1 style="font-size: 28px; margin: 0; font-weight: normal; letter-spacing: -1px;">facebook</h1>
        </div>
      </div>
      
      <!-- Main Content -->
      <div style="background: #e9ebee; min-height: 500px; padding: 20px 0;">
        <div style="max-width: 980px; margin: 0 auto; display: grid; grid-template-columns: 320px 1fr; gap: 15px;">
          
          <!-- Left Sidebar -->
          <div style="display: flex; flex-direction: column; gap: 15px;">
            
            <!-- Profile Card -->
            <div style="background: white; border: 1px solid #dddfe2; border-radius: 3px; overflow: hidden;">
              <!-- Cover Photo Area -->
              <div style="height: 120px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
              
              <!-- Profile Photo -->
              <div style="text-align: center; margin-top: -50px; padding: 0 20px 15px;">
                <div style="width: 100px; height: 100px; background: white; border: 3px solid white; border-radius: 3px; margin: 0 auto; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; font-size: 40px; color: #3b5998; font-weight: bold; overflow: hidden;">
                  <img src="profile.jpg" alt="Justine Tesara" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.parentElement.textContent='JT';" />
                </div>
                <h2 style="margin: 12px 0 4px; font-size: 20px; color: #1d2129; font-weight: 600;">Justine Tesara</h2>
                <p style="margin: 0; color: #606770; font-size: 13px;">Aspiring Web Developer</p>
              </div>
              
              <!-- Quick Stats -->
              <div style="border-top: 1px solid #e5e5e5; padding: 12px 15px; display: flex; justify-content: space-around; font-size: 12px;">
                <div style="text-align: center;">
                  <div style="font-weight: bold; color: #3b5998; font-size: 16px;">50+</div>
                  <div style="color: #606770;">Projects</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-weight: bold; color: #3b5998; font-size: 16px;">2</div>
                  <div style="color: #606770;">Years Exp</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-weight: bold; color: #3b5998; font-size: 16px;">15+</div>
                  <div style="color: #606770;">Skills</div>
                </div>
              </div>
            </div>
            
            <!-- About Section -->
            <div style="background: white; border: 1px solid #dddfe2; border-radius: 3px; padding: 15px;">
              <h3 style="margin: 0 0 12px; font-size: 14px; color: #1d2129; font-weight: 600;">About</h3>
              <p style="margin: 0; font-size: 13px; color: #1d2129; line-height: 1.6;">Passionate Web developer with creativity and love for creating beautiful interfaces</p>
            </div>
            
            <!-- Info Section -->
            <div style="background: white; border: 1px solid #dddfe2; border-radius: 3px; padding: 15px;">
              <h3 style="margin: 0 0 12px; font-size: 14px; color: #1d2129; font-weight: 600;">Info</h3>
              <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
                <div style="display: flex; gap: 10px;">
                  <span style="color: #606770;">💼</span>
                  <div>
                    <div style="color: #1d2129;">IT Intern at <strong>Sutherland Global Services</strong></div>
                    <div style="color: #606770; font-size: 12px;">3 months</div>
                  </div>
                </div>
                <div style="display: flex; gap: 10px;">
                  <span style="color: #606770;">🎓</span>
                  <div style="color: #1d2129;">Studied at <strong>Bicol University Polangui</strong></div>
                </div>
                <div style="display: flex; gap: 10px;">
                  <span style="color: #606770;">🏠</span>
                  <div style="color: #1d2129;">Lives in <strong>Polangui, Albay, Philippines</strong></div>
                </div>
                <div style="display: flex; gap: 10px;">
                  <span style="color: #606770;">📍</span>
                  <div style="color: #1d2129;">From <strong>Polangui, Albay, Philippines</strong></div>
                </div>
                <div style="display: flex; gap: 10px;">
                  <span style="color: #606770;">💑</span>
                  <div style="color: #1d2129;"><strong>In a relationship</strong></div>
                </div>
              </div>
            </div>
            
            <!-- Hobbies -->
            <div style="background: white; border: 1px solid #dddfe2; border-radius: 3px; padding: 15px;">
              <h3 style="margin: 0 0 12px; font-size: 14px; color: #1d2129; font-weight: 600;">Hobbies & Interests</h3>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                <span style="background: #e4e6eb; padding: 5px 10px; border-radius: 12px; font-size: 12px; color: #1d2129;">💪 GYM</span>
                <span style="background: #e4e6eb; padding: 5px 10px; border-radius: 12px; font-size: 12px; color: #1d2129;">🏃 Running</span>
                <span style="background: #e4e6eb; padding: 5px 10px; border-radius: 12px; font-size: 12px; color: #1d2129;">🎵 Music</span>
                <span style="background: #e4e6eb; padding: 5px 10px; border-radius: 12px; font-size: 12px; color: #1d2129;">💻 Coding</span>
              </div>
            </div>
          </div>
          
          <!-- Right Content Area -->
          <div style="display: flex; flex-direction: column; gap: 15px;">
            
            <!-- Quote / Status -->
            <div style="background: white; border: 1px solid #dddfe2; border-radius: 3px; padding: 20px; text-align: center;">
              <div style="font-size: 24px; color: #3b5998; margin-bottom: 10px;">"</div>
              <p style="font-size: 16px; font-style: italic; color: #1d2129; margin: 0; line-height: 1.5;">Talk less, Do more</p>
              <div style="font-size: 24px; color: #3b5998; margin-top: 10px; transform: rotate(180deg);">"</div>
            </div>
            
            <!-- Education -->
            <div style="background: white; border: 1px solid #dddfe2; border-radius: 3px; padding: 15px;">
              <h3 style="margin: 0 0 15px; font-size: 16px; color: #1d2129; font-weight: 600; border-bottom: 1px solid #e5e5e5; padding-bottom: 10px;">🎓 Education</h3>
              <div style="display: flex; gap: 15px;">
                <div style="width: 50px; height: 50px; background: #3b5998; border-radius: 3px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">🎓</div>
                <div style="flex: 1;">
                  <h4 style="margin: 0 0 5px; font-size: 15px; color: #1d2129; font-weight: 600;">Bicol University Polangui</h4>
                  <p style="margin: 0 0 4px; font-size: 13px; color: #606770;">BS Information Technology</p>
                  <p style="margin: 0; font-size: 12px; color: #90949c;">2021 - 2025</p>
                </div>
              </div>
            </div>
            
            <!-- Work Experience -->
            <div style="background: white; border: 1px solid #dddfe2; border-radius: 3px; padding: 15px;">
              <h3 style="margin: 0 0 15px; font-size: 16px; color: #1d2129; font-weight: 600; border-bottom: 1px solid #e5e5e5; padding-bottom: 10px;">💼 Work Experience</h3>
              <div style="display: flex; gap: 15px;">
                <div style="width: 50px; height: 50px; background: #3b5998; border-radius: 3px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">💼</div>
                <div style="flex: 1;">
                  <h4 style="margin: 0 0 5px; font-size: 15px; color: #1d2129; font-weight: 600;">IT Intern</h4>
                  <p style="margin: 0 0 8px; font-size: 13px; color: #606770;">Sutherland Global Services, Pili · 3 months</p>
                  <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #1d2129; line-height: 1.8;">
                    <li>Diagnosed and resolved hardware and software issues</li>
                    <li>Supported monitoring of network ports and device connectivity</li>
                    <li>Set up computers and peripherals for everyday use</li>
                    <li>Organized and managed computer accessories and components</li>
                    <li>Performed cable management to keep workstations neat and efficient</li>
                    <li>Reimaged systems to restore or prepare devices for deployment</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <!-- Skills -->
            <div style="background: white; border: 1px solid #dddfe2; border-radius: 3px; padding: 15px;">
              <h3 style="margin: 0 0 15px; font-size: 16px; color: #1d2129; font-weight: 600; border-bottom: 1px solid #e5e5e5; padding-bottom: 10px;">🛠️ Technical Skills</h3>
              
              <div style="margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px; font-size: 13px; color: #606770; font-weight: 600;">Front-End Development</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  <span style="background: #3b5998; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">HTML</span>
                  <span style="background: #3b5998; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">CSS</span>
                  <span style="background: #3b5998; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">JavaScript</span>
                  <span style="background: #3b5998; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">Bootstrap</span>
                  <span style="background: #3b5998; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">Tailwind</span>
                </div>
              </div>
              
              <div style="margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px; font-size: 13px; color: #606770; font-weight: 600;">Back-End Development</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  <span style="background: #3b5998; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">PHP</span>
                  <span style="background: #3b5998; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">Node.js</span>
                  <span style="background: #3b5998; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">Express.js</span>
                  <span style="background: #3b5998; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">MySQL</span>
                  <span style="background: #3b5998; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">Python</span>
                  <span style="background: #3b5998; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">REST APIs</span>
                </div>
              </div>
              
              <div style="margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px; font-size: 13px; color: #606770; font-weight: 600;">Tools & AI</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  <span style="background: #3b5998; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">Git</span>
                  <span style="background: #3b5998; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">GitHub</span>
                  <span style="background: #3b5998; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">VS Code</span>
                  <span style="background: #3b5998; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">Postman</span>
                  <span style="background: #3b5998; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">Claude</span>
                  <span style="background: #3b5998; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">ChatGPT</span>
                </div>
              </div>
              
              <div>
                <h4 style="margin: 0 0 10px; font-size: 13px; color: #606770; font-weight: 600;">Soft Skills</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  <span style="background: #e4e6eb; color: #1d2129; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">Willingness to Learn</span>
                  <span style="background: #e4e6eb; color: #1d2129; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">Adaptability</span>
                  <span style="background: #e4e6eb; color: #1d2129; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">Teamwork</span>
                  <span style="background: #e4e6eb; color: #1d2129; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">Problem Solving</span>
                  <span style="background: #e4e6eb; color: #1d2129; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500;">Communication</span>
                </div>
              </div>
            </div>
            
            <!-- Social Links -->
            <div style="background: white; border: 1px solid #dddfe2; border-radius: 3px; padding: 15px;">
              <h3 style="margin: 0 0 15px; font-size: 16px; color: #1d2129; font-weight: 600; border-bottom: 1px solid #e5e5e5; padding-bottom: 10px;">🔗 Connect With Me</h3>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                <a href="https://github.com/JustineTesara" target="_blank" style="background: #24292e; color: white; padding: 10px; border-radius: 4px; text-decoration: none; text-align: center; font-size: 13px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  💻 GitHub
                </a>
                <a href="https://www.linkedin.com/in/justine-tesara-a59674318/" target="_blank" style="background: #0077b5; color: white; padding: 10px; border-radius: 4px; text-decoration: none; text-align: center; font-size: 13px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  💼 LinkedIn
                </a>
                <a href="https://www.facebook.com/justine.riosa.tesara" target="_blank" style="background: #1877f2; color: white; padding: 10px; border-radius: 4px; text-decoration: none; text-align: center; font-size: 13px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  📘 Facebook
                </a>
                <a href="mailto:justine.tesara0907@gmail.com" style="background: #ea4335; color: white; padding: 10px; border-radius: 4px; text-decoration: none; text-align: center; font-size: 13px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  📧 Email
                </a>
              </div>
              <button onclick="downloadResume()" style="width: 100%; margin-top: 15px; background: #42b72a; color: white; border: none; padding: 12px; border-radius: 4px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                📄 Download Resume (PDF)
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mobile Responsive Styles -->
      <style>
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 320px 1fr"] {
            grid-template-columns: 1fr !important;
          }
          
          div[style*="grid-template-columns: repeat(2, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      </style>
    `;
  } else {
    // Default search results
    container.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <h2>Search Results for "${data.query}"</h2>
        <p style="color: #666;">Try searching for: "resume", "projects", or "contact"</p>
        <button onclick="navigateTo('home')" style="margin-top: 20px; padding: 10px 20px; background: #065fd4; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Back to Projects
        </button>
      </div>
    `;
  }

  return container;
}

function renderContactPage() {
  const container = document.createElement("div");

  container.innerHTML = `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 20px; text-align: center;">
      <h1 style="color: white; font-size: 36px; margin: 0 0 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">Get In Touch</h1>
      <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">I'd love to hear from you! Send me a message.</p>
    </div>
    
    <div style="max-width: 1000px; margin: -40px auto 40px; padding: 0 20px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
        
        <!-- Contact Form -->
        <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <h2 style="margin: 0 0 20px; color: #333; font-size: 24px;">Send a Message</h2>
          
          <form id="contact-form" style="display: flex; flex-direction: column; gap: 15px;">
            <div>
              <label style="display: block; margin-bottom: 5px; color: #555; font-size: 13px; font-weight: 600;">Your Name</label>
              <input 
                type="text" 
                name="name" 
                required 
                placeholder="John Doe"
                style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: 'Tahoma', sans-serif;"
              />
            </div>
            
            <div>
              <label style="display: block; margin-bottom: 5px; color: #555; font-size: 13px; font-weight: 600;">Email Address</label>
              <input 
                type="email" 
                name="email" 
                required 
                placeholder="john@example.com"
                style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: 'Tahoma', sans-serif;"
              />
            </div>
            
            <div>
              <label style="display: block; margin-bottom: 5px; color: #555; font-size: 13px; font-weight: 600;">Message</label>
              <textarea 
                name="message" 
                required 
                rows="5" 
                placeholder="Your message here..."
                style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: 'Tahoma', sans-serif; resize: vertical;"
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 14px; border-radius: 4px; font-size: 15px; font-weight: 600; cursor: pointer; transition: transform 0.2s;"
              onmouseover="this.style.transform='translateY(-2px)'"
              onmouseout="this.style.transform='translateY(0)'"
            >
              📧 Send Message
            </button>
          </form>
        </div>
        
        <!-- Contact Info & Social Links -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Contact Cards -->
          <div style="background: white; border-radius: 8px; padding: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 20px; color: #333; font-size: 20px;">Contact Information</h3>
            
            <div style="display: flex; flex-direction: column; gap: 15px;">
              <div style="display: flex; gap: 15px; align-items: start;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <span style="font-size: 20px;">📧</span>
                </div>
                <div>
                  <h4 style="margin: 0 0 5px; font-size: 14px; color: #333;">Email</h4>
                  <a href="mailto:justine.tesara0907@gmail.com" style="color: #667eea; text-decoration: none; font-size: 13px;">justine.tesara0907@gmail.com</a>
                </div>
              </div>
              
              <div style="display: flex; gap: 15px; align-items: start;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <span style="font-size: 20px;">📍</span>
                </div>
                <div>
                  <h4 style="margin: 0 0 5px; font-size: 14px; color: #333;">Location</h4>
                  <p style="margin: 0; color: #666; font-size: 13px;">Polangui, Albay, Philippines</p>
                </div>
              </div>
              
              <div style="display: flex; gap: 15px; align-items: start;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <span style="font-size: 20px;">⏰</span>
                </div>
                <div>
                  <h4 style="margin: 0 0 5px; font-size: 14px; color: #333;">Availability</h4>
                  <p style="margin: 0; color: #666; font-size: 13px;">Open to opportunities</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Social Links Card -->
          <div style="background: white; border-radius: 8px; padding: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 15px; color: #333; font-size: 20px;">Connect on Social Media</h3>
            
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <a href="https://github.com/JustineTesara" target="_blank" style="background: #24292e; color: white; padding: 12px 15px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 10px; transition: transform 0.2s;" onmouseover="this.style.transform='translateX(5px)'" onmouseout="this.style.transform='translateX(0)'">
                <span style="font-size: 18px;">💻</span>
                <span>GitHub - @JustineTesara</span>
              </a>
              
              <a href="https://www.linkedin.com/in/justine-tesara-a59674318/" target="_blank" style="background: #0077b5; color: white; padding: 12px 15px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 10px; transition: transform 0.2s;" onmouseover="this.style.transform='translateX(5px)'" onmouseout="this.style.transform='translateX(0)'">
                <span style="font-size: 18px;">💼</span>
                <span>LinkedIn - Justine Tesara</span>
              </a>
              
              <a href="https://www.facebook.com/justine.riosa.tesara" target="_blank" style="background: #1877f2; color: white; padding: 12px 15px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 10px; transition: transform 0.2s;" onmouseover="this.style.transform='translateX(5px)'" onmouseout="this.style.transform='translateX(0)'">
                <span style="font-size: 18px;">📘</span>
                <span>Facebook - Justine Tesara</span>
              </a>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center;">
            <h3 style="margin: 0 0 15px; color: white; font-size: 18px;">Quick Actions</h3>
            <button onclick="downloadResume()" style="width: 100%; background: white; color: #667eea; border: none; padding: 12px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 10px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
              📄 Download Resume
            </button>
            <button onclick="navigateTo('search', { query: 'resume', type: 'resume' })" style="width: 100%; background: rgba(255,255,255,0.2); color: white; border: 1px solid white; padding: 12px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
              👤 View Full Profile
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Mobile Responsive -->
    <style>
      @media (max-width: 768px) {
        div[style*="grid-template-columns: 1fr 1fr"] {
          grid-template-columns: 1fr !important;
        }
      }
    </style>
  `;

  // Handle form submission with EmailJS
  setTimeout(() => {
    const form = document.getElementById("contact-form");
    if (form) {
      // Remove any existing listener first to prevent duplicates
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);

      newForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(newForm);
        const name = formData.get("name");
        const email = formData.get("email");
        const message = formData.get("message");

        // Basic validation
        if (!name || name.trim().length < 2) {
          showContactAlert(
            "❌ Please enter your name (at least 2 characters)",
            "error",
          );
          return;
        }

        if (!email || !isValidEmail(email)) {
          showContactAlert("❌ Please enter a valid email address", "error");
          return;
        }

        if (!message || message.trim().length < 10) {
          showContactAlert(
            "❌ Please enter a message (at least 10 characters)",
            "error",
          );
          return;
        }

        // Get submit button and disable it
        const submitBtn = newForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = "⏳ Sending...";
        submitBtn.style.opacity = "0.6";
        submitBtn.style.cursor = "not-allowed";

        // Prepare template parameters
        const templateParams = {
          from_name: name,
          from_email: email,
          message: message,
          sent_date: new Date().toLocaleString(),
        };

        // Send email via EmailJS
        emailjs
          .send(
            "service_ptchhrk", // Replace with your Service ID
            "template_vkh8c4b", // Replace with your Template ID
            templateParams,
          )
          .then((response) => {
            console.log("SUCCESS!", response.status, response.text);

            // Show success message
            showContactAlert(
              `✅ Thank you ${name}! Your message has been sent successfully.\n\nI'll get back to you at ${email} soon!`,
              "success",
            );

            // Reset form
            newForm.reset();

            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            submitBtn.style.opacity = "1";
            submitBtn.style.cursor = "pointer";
          })
          .catch((error) => {
            console.error("FAILED...", error);

            // Show error message
            showContactAlert(
              "❌ Oops! Something went wrong. Please try again or email me directly at justine.tesara0907@gmail.com",
              "error",
            );

            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            submitBtn.style.opacity = "1";
            submitBtn.style.cursor = "pointer";
          });
      });
    }
  }, 100);

  // Email validation helper function
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Custom alert function for contact form
  function showContactAlert(message, type) {
    // Create custom alert
    const alertDiv = document.createElement("div");
    alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "success" ? "#42b72a" : "#ea4335"};
    color: white;
    padding: 20px 30px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 999999;
    max-width: 400px;
    font-family: 'Tahoma', sans-serif;
    font-size: 14px;
    line-height: 1.5;
    animation: slideIn 0.3s ease;
  `;
    alertDiv.textContent = message;

    document.body.appendChild(alertDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
      alertDiv.style.animation = "slideOut 0.3s ease";
      setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
  }

  // Add animation styles
  const style = document.createElement("style");
  style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
  document.head.appendChild(style);

  return container;
}

// Initialize browser when projects window opens
const originalOpenWindow = openWindow;
window.openWindow = function (windowId) {
  originalOpenWindow(windowId);
  if (windowId === "projects") {
    setTimeout(() => initializeBrowser(), 500);
  }
};
// Internet Explorer Loading Effect
function showIELoading() {
  const statusText = document.getElementById("ie-status-text");
  if (!statusText) return;

  const loadingStates = [
    "⏳ Opening page...",
    "⏳ Connecting...",
    "⏳ Downloading...",
    "⏳ Processing...",
    "✅ Done",
  ];

  let index = 0;
  statusText.textContent = loadingStates[0];

  const interval = setInterval(() => {
    index++;
    if (index < loadingStates.length) {
      statusText.textContent = loadingStates[index];
    } else {
      clearInterval(interval);
    }
  }, 300);
}

// Call this when navigating pages
const originalNavigateTo = navigateTo;
window.navigateTo = function (page, data) {
  showIELoading();
  originalNavigateTo(page, data);
};
function show404Error() {
  const container = document.createElement("div");
  container.innerHTML = `
    <div style="padding: 40px; font-family: Arial;">
      <h1 style="font-size: 18px; margin-bottom: 20px;">
        <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><circle cx='16' cy='16' r='15' fill='%23ff0000'/><text x='16' y='22' text-anchor='middle' fill='white' font-size='20' font-weight='bold'>!</text></svg>" style="vertical-align: middle; margin-right: 10px;" />
        The page cannot be displayed
      </h1>
      <p style="margin: 0 0 15px;">The page you are looking for is currently unavailable. The Web site might be experiencing technical difficulties, or you may need to adjust your browser settings.</p>
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #ccc;">
      
      <p style="font-weight: bold; margin: 15px 0;">Please try the following:</p>
      <ul style="line-height: 1.8;">
        <li>Click the <button onclick="window.history.back()" style="padding: 2px 8px;">Back</button> button to try another link.</li>
        <li>Click <button onclick="navigateTo('home')" style="padding: 2px 8px;">Home</button> to return to the main page.</li>
      </ul>
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #ccc;">
      
      <p style="font-size: 11px; color: #666;">
        HTTP 404 - File not found<br>
        Internet Explorer
      </p>
    </div>
  `;
  return container;
}
