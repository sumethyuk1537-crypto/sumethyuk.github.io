document.addEventListener("DOMContentLoaded", () => {
    // DOM Element Selections
    const sidebarNav = document.getElementById("sidebar-nav");
    const welcomeView = document.getElementById("welcome-view");
    const unitView = document.getElementById("unit-view");
    const searchInput = document.getElementById("search-input");
    const mainTitle = document.getElementById("main-view-title");
    const headerPhaseBadge = document.getElementById("header-phase-badge");
    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
    const sidebar = document.getElementById("sidebar");
    
    // Unit Detail DOM Elements
    const activeWeekBadge = document.getElementById("active-week-badge");
    const activePhaseBadge = document.getElementById("active-phase-badge");
    const activeUnitDescription = document.getElementById("active-unit-description");
    const lectureContentSlot = document.getElementById("lecture-content-slot");
    const exampleTitleSlot = document.getElementById("example-title-slot");
    const exampleWiringSlot = document.getElementById("example-wiring-slot");
    const exampleCodeSlot = document.getElementById("example-code-slot");
    const quizGridSlot = document.getElementById("quiz-grid-slot");
    const codeCopyBtn = document.getElementById("code-copy-btn");

    // Level groupings for mapping
    const phases = {
        "ระดับที่ 1": "ระดับที่ 1: พื้นฐานบอร์ด Arduino",
        "ระดับที่ 2": "ระดับที่ 2: การสื่อสารผ่าน Serial Port",
        "ระดับที่ 3": "ระดับที่ 3: โครงสร้างควบคุมการทำงาน",
        "ระดับที่ 4": "ระดับที่ 4: การใช้งานฟังก์ชัน",
        "ระดับที่ 5": "ระดับที่ 5: การประยุกต์ใช้เซนเซอร์",
        "ระดับที่ 6": "ระดับที่ 6: การควบคุมอุปกรณ์แสดงผล",
        "ระดับที่ 7": "ระดับที่ 7: โครงงานกล่องสมองกล"
    };

    // 1. Initialize Sidebar Week Links
    function renderSidebar() {
        sidebarNav.innerHTML = "";
        
        // Group weeks by Level
        const grouped = {};
        CURRICULUM_DATA.forEach((item, index) => {
            item.id = index; // assign ID
            if (!grouped[item.level]) {
                grouped[item.level] = [];
            }
            grouped[item.level].push(item);
        });

        // Loop through grouped levels and render titles + units
        for (const [levelKey, items] of Object.entries(grouped)) {
            const sectionTitle = document.createElement("div");
            sectionTitle.className = "nav-section-title";
            sectionTitle.textContent = phases[levelKey] || levelKey;
            sidebarNav.appendChild(sectionTitle);

            items.forEach(unit => {
                const navItem = document.createElement("div");
                navItem.className = "nav-item";
                navItem.dataset.id = unit.id;
                
                // Add badge and title text
                navItem.innerHTML = `
                    <span class="nav-week-badge" style="font-size: 0.7em;">${unit.timeframe || `Unit ${unit.id + 1}`}</span>
                    <span style="flex: 1; font-size: 0.9em; line-height: 1.2;">${unit.title}</span>
                `;

                // Add Click Event Listener
                navItem.addEventListener("click", () => {
                    document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
                    navItem.classList.add("active");
                    loadUnit(unit.id);
                    
                    // Close sidebar on mobile after clicking
                    if (window.innerWidth <= 768) {
                        sidebar.classList.remove("open");
                    }
                });

                sidebarNav.appendChild(navItem);
            });
        }
    }

    // 2. Load and Render Unit Details
    function loadUnit(unitId) {
        const unit = CURRICULUM_DATA.find(item => item.id === parseInt(unitId));
        if (!unit) return;

        // Transition views
        welcomeView.style.display = "none";
        unitView.style.display = "block";

        // Scroll to top of content viewport area
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Update Headers & Meta
        mainTitle.textContent = unit.title;
        headerPhaseBadge.textContent = phases[unit.level] || unit.level;
        
        activeWeekBadge.textContent = unit.timeframe || "N/A";
        activePhaseBadge.textContent = unit.level;
        activeUnitDescription.textContent = unit.description;

        // Render Lecture Tab
        lectureContentSlot.innerHTML = `<p style="font-size: 1.1em; line-height: 1.8;">${unit.content}</p>`;

        // Render Example Tab
        if (unit.example) {
            exampleTitleSlot.textContent = `ตัวอย่างวิศวกรรม: ${unit.example.title}`;
            exampleWiringSlot.innerHTML = unit.example.wiring;
            exampleCodeSlot.textContent = unit.example.code.trim();
        } else {
            exampleTitleSlot.textContent = "ตัวอย่างโค้ด (รอกำหนดในห้องเรียน)";
            exampleWiringSlot.innerHTML = "<p><i>จะมีการสาธิตการต่อวงจรและการเขียนโค้ดในคาบเรียน</i></p>";
            exampleCodeSlot.textContent = "// เตรียมเพิ่มตัวอย่างโค้ด\nvoid setup() {\n  // โค้ดเริ่มต้นทำงานครั้งเดียว\n}\n\nvoid loop() {\n  // โค้ดทำงานวนซ้ำ\n}";
        }

        // Render Quiz Tab - Bloom's Flashcards
        quizGridSlot.innerHTML = "";
        if (unit.quiz) {
            unit.quiz.forEach((quizItem, index) => {
                const cardContainer = document.createElement("div");
                cardContainer.className = "quiz-card-container";
                
                let answerText = quizItem.options[quizItem.a];

                cardContainer.innerHTML = `
                    <div class="quiz-card" id="quiz-card-${index}">
                        <!-- Front of card (Question) -->
                        <div class="card-face front">
                            <div class="card-face-header">
                                <span class="quiz-level-badge">คำถามทดสอบ</span>
                                <span class="quiz-action-indicator">คลิกเพื่อดูคำตอบ</span>
                            </div>
                            <div class="quiz-question-text">
                                ${quizItem.q}
                            </div>
                            <div style="margin-top: 15px; font-size: 0.9em; opacity: 0.8;">
                                <ul style="list-style-type: none; padding-left: 0;">
                                    ${quizItem.options.map((opt, i) => `<li style="padding: 4px 0;">${String.fromCharCode(65 + i)}. ${opt}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                        <!-- Back of card (Answer) -->
                        <div class="card-face back">
                            <div class="card-face-header">
                                <span class="quiz-level-badge" style="background: var(--accent-secondary);">เฉลย</span>
                                <span class="quiz-action-indicator" style="color: var(--accent-secondary);">คลิกเพื่อหมุนกลับ</span>
                            </div>
                            <div class="quiz-answer-text" style="font-size: 1.2em; color: var(--accent-primary); text-align: center;">
                                ข้อ ${String.fromCharCode(65 + quizItem.a)}<br>
                                <span style="font-size: 0.8em; color: var(--text-color);">${answerText}</span>
                            </div>
                        </div>
                    </div>
                `;

                // Toggle flipping class on card click
                cardContainer.addEventListener("click", () => {
                    const card = cardContainer.querySelector(".quiz-card");
                    card.classList.toggle("flipped");
                });

                quizGridSlot.appendChild(cardContainer);
            });
        }

        // Set active tab default back to "lecture"
        switchTab("lecture");
    }

    // 3. Tab Navigation Switcher Logic
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetTab = button.getAttribute("data-tab");
            switchTab(targetTab);
        });
    });

    function switchTab(tabName) {
        // Remove active class from buttons
        tabButtons.forEach(btn => {
            btn.classList.remove("active");
            if (btn.getAttribute("data-tab") === tabName) {
                btn.classList.add("active");
            }
        });

        // Hide all panes
        document.querySelectorAll(".tab-pane").forEach(pane => {
            pane.classList.remove("active");
        });

        // Show target pane
        const activePane = document.getElementById(`pane-${tabName}`);
        if (activePane) {
            activePane.classList.add("active");
        }
    }

    // 4. Code Copy Button Clipboard Logic
    codeCopyBtn.addEventListener("click", () => {
        const codeText = exampleCodeSlot.textContent;
        navigator.clipboard.writeText(codeText).then(() => {
            const originalText = codeCopyBtn.textContent;
            codeCopyBtn.textContent = "คัดลอกแล้ว!";
            codeCopyBtn.style.color = "var(--accent-primary)";
            codeCopyBtn.style.borderColor = "var(--accent-primary)";
            
            setTimeout(() => {
                codeCopyBtn.textContent = originalText;
                codeCopyBtn.style.color = "";
                codeCopyBtn.style.borderColor = "";
            }, 2000);
        }).catch(err => {
            console.error("Failed to copy code: ", err);
        });
    });

    // 5. Search Filtering Features
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const navItems = document.querySelectorAll(".nav-item");
        
        navItems.forEach(item => {
            const unitId = item.dataset.id;
            const unit = CURRICULUM_DATA.find(u => u.id === parseInt(unitId));
            
            if (unit) {
                const matchesTitle = unit.title.toLowerCase().includes(query);
                const matchesDesc = unit.description.toLowerCase().includes(query);
                const matchesContent = unit.content.toLowerCase().includes(query);
                
                if (matchesTitle || matchesDesc || matchesContent) {
                    item.style.display = "flex";
                } else {
                    item.style.display = "none";
                }
            }
        });
    });

    // 6. Theme Management (Light vs Dark mode)
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === "dark") {
            // Display Moon path
            themeIcon.innerHTML = `<path d="M12 3c.132 0 .263 0 .393.007a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.999z"/>`;
            themeToggle.style.color = "#00f2fe";
        } else {
            // Display Sun path
            themeIcon.innerHTML = `<path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM2 12h2m16 0h2M12 2v2m0 16v2m-6.364-16.364l1.414 1.414m10.608 10.608l1.414 1.414M7.05 16.95l-1.414 1.414m11.314-11.314l-1.414 1.414"/>`;
            themeToggle.style.color = "#ffb300";
        }
    }

    // 7. Brand / Logo click goes Home
    const sidebarBrand = document.querySelector(".sidebar-brand");
    sidebarBrand.addEventListener("click", () => {
        welcomeView.style.display = "block";
        unitView.style.display = "none";
        mainTitle.textContent = "การออกแบบระบบและเขียนโปรแกรม Arduino";
        headerPhaseBadge.textContent = "ระดับชั้นมัธยมศึกษาปีที่ 4";
        document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
    });

    // 8. Mobile Sidebar drawer toggle behavior
    if (window.innerWidth <= 768) {
        mobileMenuToggle.style.display = "flex";
    }
    
    window.addEventListener("resize", () => {
        if (window.innerWidth <= 768) {
            mobileMenuToggle.style.display = "flex";
        } else {
            mobileMenuToggle.style.display = "none";
            sidebar.classList.remove("open");
        }
    });

    mobileMenuToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        sidebar.classList.toggle("open");
    });

    // Close mobile menu if clicked outside sidebar
    document.addEventListener("click", (e) => {
        if (window.innerWidth <= 768 && sidebar.classList.contains("open")) {
            if (!sidebar.contains(e.target) && e.target !== mobileMenuToggle) {
                sidebar.classList.remove("open");
            }
        }
    });

    // Run Initial Setup
    renderSidebar();
});
