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
      openWindow("about");
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
  const window = document.querySelector(`.window[data-window="${windowId}"]`);
  if (!window) return;

  if (window.classList.contains("active")) {
    focusWindow(window);
    return;
  }

  window.classList.add("active");
  focusWindow(window);

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
  const window = document.querySelector(`.window[data-window="${windowId}"]`);
  const windowTitle = window.querySelector(".title-bar-text").textContent;

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
  const iconSrc = window.querySelector(".title-bar img")?.src;
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
  // Register pages
  browserState.pages = {
    home: renderProjectsHome,
    search: renderSearchResults,
    project: renderProjectDetail,
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
    // Old Facebook style for resume search
    container.innerHTML = `
      <div style="background: #3b5998; padding: 20px; color: white; font-family: Arial;">
        <h1 style="font-size: 24px; margin: 0;">facebook</h1>
      </div>
      <div style="padding: 40px; max-width: 600px; margin: 0 auto;">
        <div style="background: white; border: 1px solid #ddd; padding: 20px; border-radius: 3px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 100px; height: 100px; background: #4A90E2; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 40px; color: white;">
              J
            </div>
            <h2 style="margin: 0; color: #333;">Justine Tesara</h2>
            <p style="color: #666; margin: 5px 0;">Front-End Web Developer</p>
          </div>
          <div style="border-top: 1px solid #e5e5e5; padding-top: 15px;">
            <p><strong>About:</strong> Passionate developer specializing in modern web technologies</p>
            <p><strong>Skills:</strong> HTML, CSS, JavaScript, React, Node.js</p>
            <p><strong>Email:</strong> justine.tesara0907@gmail.com</p>
            <button onclick="downloadResume()" style="background: #4267b2; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 15px; width: 100%;">
              📄 Download Resume
            </button>
          </div>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <h2>Search Results for "${data.query}"</h2>
        <p style="color: #666;">Try searching for: "resume", "projects", or "facebook"</p>
        <button onclick="navigateTo('home')" style="margin-top: 20px; padding: 10px 20px; background: #065fd4; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Back to Projects
        </button>
      </div>
    `;
  }

  return container;
}

// Initialize browser when projects window opens
const originalOpenWindow = openWindow;
window.openWindow = function (windowId) {
  originalOpenWindow(windowId);
  if (windowId === "projects") {
    setTimeout(() => initializeBrowser(), 100);
  }
};
