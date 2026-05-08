document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks?.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            hamburger?.classList.remove('active');
            navLinks?.classList.remove('active');
        });
    });

    // Education tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            tabBtns.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(tabId)?.classList.add('active');
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Scroll reveal animation using IntersectionObserver
    const animateOnScroll = function() {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.about-content, .education-tabs, .project-card, .section-title').forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            revealObserver.observe(element);
        });
    };

    animateOnScroll();

    // Update copyright year
    const copyrightElement = document.querySelector('.copyright');
    if (copyrightElement) {
        copyrightElement.textContent = `Designed & Built by Chiara © ${new Date().getFullYear()}`;
    }

    // Email functionality
    const emailButton = document.getElementById('email-button');
    const emailDisplay = document.getElementById('email-display');
    const email = 'chiara.benini98@gmail.com';

    if (emailButton) {
        emailButton.addEventListener('click', async function() {
            try {
                await navigator.clipboard.writeText(email);
                const originalText = emailButton.innerHTML;
                emailButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    emailButton.innerHTML = originalText;
                }, 2000);
            } catch (err) {
                window.location.href = `mailto:${email}?subject=Contact%20from%20Portfolio`;
            }
        });
    }

    if (emailDisplay) {
        emailDisplay.addEventListener('click', async function() {
            try {
                await navigator.clipboard.writeText(email);
                const originalText = emailDisplay.textContent;
                emailDisplay.textContent = 'Copied!';
                setTimeout(() => {
                    emailDisplay.textContent = originalText;
                }, 2000);
            } catch (err) {
                window.location.href = `mailto:${email}?subject=Contact%20from%20Portfolio`;
            }
        });
    }

    // FIX: Use event delegation on the grid so expand buttons work
    // even after the grid is re-rendered by filter changes.
    const projectsGrid = document.getElementById('projects-grid');
    if (projectsGrid) {
        projectsGrid.addEventListener('click', function(e) {
            const button = e.target.closest('.tech-expand-btn');
            if (!button) return;

            const projectId = button.getAttribute('data-project');
            const hiddenTagsDiv = document.getElementById(`${projectId}-hidden`);
            if (!hiddenTagsDiv) return;

            const isExpanded = hiddenTagsDiv.classList.contains('show');
            if (isExpanded) {
                hiddenTagsDiv.classList.remove('show');
                const count = hiddenTagsDiv.querySelectorAll('.tech-tag').length;
                button.innerHTML = `<i class="fas fa-chevron-down"></i> Show ${count} more`;
            } else {
                hiddenTagsDiv.classList.add('show');
                button.innerHTML = `<i class="fas fa-chevron-up"></i> Show less`;
            }
        });
    }

    // Load and render projects
    loadProjects();
});

// Initialize modal system
function initProjectModals() {
    // Create overlay only if it doesn't exist
    if (document.querySelector('.modal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-card">
            <button class="modal-close" aria-label="Close">&times;</button>
            <h2 class="modal-title"></h2>
            <a class="modal-github" href="#" target="_blank" rel="noopener noreferrer">
                <i class="fab fa-github"></i>
                <span></span>
            </a>
            <p class="modal-description"></p>
            <div class="modal-tags"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    const modalTitle = overlay.querySelector('.modal-title');
    const modalGithub = overlay.querySelector('.modal-github');
    const modalGithubSpan = overlay.querySelector('.modal-github span');
    const modalDesc = overlay.querySelector('.modal-description');
    const modalTags = overlay.querySelector('.modal-tags');

    // Open on card click - using event delegation on the grid
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;

    projectsGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.project-card');
        if (!card || card.classList.contains('skeleton') || card.classList.contains('error')) return;

        // Get data from dataset
        modalTitle.textContent = card.dataset.title || 'Untitled Project';
        modalGithub.href = card.dataset.github || '#';
        modalGithubSpan.textContent = card.dataset.github ? card.dataset.github.replace('https://github.com/', '') : 'No GitHub link';
        modalDesc.textContent = card.dataset.description || 'No description available';

        // Build tags
        modalTags.innerHTML = '';
        let tags = [];
        try {
            tags = JSON.parse(card.dataset.tags || '[]');
        } catch (e) {
            tags = [];
        }

        if (tags.length === 0) {
            const noTag = document.createElement('span');
            noTag.className = 'tech-tag';
            noTag.textContent = 'No tags';
            modalTags.appendChild(noTag);
        } else {
            tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'tech-tag';
                // Add icon if available
                const icon = getTechIcon(tag);
                span.innerHTML = `<i class="${icon}"></i>${tag}`;
                modalTags.appendChild(span);
            });
        }

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.closest('.modal-close')) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

async function loadProjects() {
    try {
        const projectsGrid = document.getElementById('projects-grid');
        if (!projectsGrid) return;

        projectsGrid.innerHTML = '';

        const response = await fetch('./data/project_data.json');
        if (!response.ok) throw new Error('Failed to load projects');

        const projectsData = await response.json();

        // ✅ NEW: Sort projects by pinned order before rendering
        const sortedProjects = sortProjectsByPinned(projectsData);

        renderProjects(sortedProjects);
        renderTagFilters(projectsData);
        setupFilterHandlers(projectsData);

        // Initialize modals after projects are rendered
        initProjectModals();

        // Initialize project overlay for iframes
        initProjectOverlay();

    } catch (error) {
        console.error('Error loading projects:', error);
        const projectsGrid = document.getElementById('projects-grid');
        if (projectsGrid) {
            projectsGrid.innerHTML = `
                <div class="project-card error">
                    <p>Failed to load projects. Please try again later.</p>
                </div>
            `;
        }
    }
}

// ✅ NEW: Sort projects by pinned order
function sortProjectsByPinned(projects) {
    const pinned = (typeof PROJECT_META !== 'undefined' && PROJECT_META.pinned) ? PROJECT_META.pinned : [];

    return [...projects].sort((a, b) => {
        const ai = pinned.indexOf(a.title);
        const bi = pinned.indexOf(b.title);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
    });
}

function renderProjects(projects, filter = 'all') {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;

    projectsGrid.innerHTML = '';

    const visibleProjects = projects.filter(project => !project.hidden);

    const filteredProjects = filter === 'all'
        ? visibleProjects
        : visibleProjects.filter(project => project.tags.includes(filter));

    if (filteredProjects.length === 0) {
        projectsGrid.innerHTML = '<div class="project-card"><p>No projects found with this filter.</p></div>';
        return;
    }

    filteredProjects.forEach(project => {
        const card = createProjectCardElement(project);
        projectsGrid.appendChild(card);
    });

    // Re-trigger scroll animations for newly rendered cards
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    projectsGrid.querySelectorAll('.project-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        revealObserver.observe(card);
    });
}

function getTechIcon(tag) {
    const iconMap = {
        'Python': 'fab fa-python',
        'JavaScript': 'fab fa-js',
        'TypeScript': 'fab fa-js',
        'HTML': 'fab fa-html5',
        'CSS': 'fab fa-css3-alt',
        'Jupyter Notebook': 'fas fa-book',
        'Julia': 'fas fa-chart-line',
        'PyTorch': 'fas fa-brain',
        'TensorFlow': 'fas fa-chart-line',
        'React': 'fab fa-react',
        'reinforcement-learning': 'fas fa-gamepad',
        'deep-learning': 'fas fa-microchip',
        'machine-learning': 'fas fa-robot',
        'neural-network': 'fas fa-network-wired',
        'computational-neuroscience': 'fas fa-microscope',
        'robotics': 'fas fa-robot',
        'gymnasium': 'fas fa-gamepad',
        'dynamic-programming': 'fas fa-code-branch',
        'monte-carlo': 'fas fa-dice',
        'kalman-filter': 'fas fa-filter',
    };

    return iconMap[tag] || 'fas fa-code';
}

function createProjectCardElement(project) {
    const INITIAL_TAGS = 6;
    const allTags = project.tags.slice(0, 10);
    const visibleTags = allTags.slice(0, INITIAL_TAGS);
    const hiddenTags = allTags.slice(INITIAL_TAGS);
    const hasMoreTags = hiddenTags.length > 0;

    const projectId = 'project-' + (project.id || project.title.replace(/\s/g, '-'));

    const visibleTagsHTML = visibleTags.map(tag => `
        <div class="tech-tag">
            <i class="${getTechIcon(tag)}"></i>${tag}
        </div>
    `).join('');

    const hiddenTagsHTML = hiddenTags.map(tag => `
        <div class="tech-tag">
            <i class="${getTechIcon(tag)}"></i>${tag}
        </div>
    `).join('');

    // Create card as DOM element so we can set data attributes
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-tags', project.tags.join(','));

    // ✅ NEW: Add pinned class if project is pinned
    const pinned = (typeof PROJECT_META !== 'undefined' && PROJECT_META.pinned) ? PROJECT_META.pinned : [];
    if (pinned.includes(project.title)) {
        card.classList.add('pinned');
    }

    // Add dataset properties for modal
    card.dataset.title = project.title || 'Untitled Project';
    card.dataset.github = project.github || '';
    card.dataset.description = project.description || 'No description available';
    card.dataset.tags = JSON.stringify(project.tags || []);

    // Add page mapping for iframe overlay (if PROJECT_META exists)
    if (typeof PROJECT_META !== 'undefined') {
        // Extract repo name from github URL or use project title as fallback
        let repoName = null;
        if (project.github) {
            // Get repo name from URL: https://github.com/ChiaraBenini/repo-name
            const match = project.github.match(/github\.com\/[^\/]+\/([^\/]+)/);
            if (match) repoName = match[1];
        }

        // Fallback: convert title to repo-name format
        if (!repoName) {
            repoName = project.title.toLowerCase().replace(/\s+/g, '-');
        }

        const meta = PROJECT_META[repoName] || {};
        if (meta.page) {
            card.dataset.page = meta.page;
        }
    }

    card.innerHTML = `
        <div class="project-header">
            <div class="folder-icon">
                <i class="fas fa-folder"></i>
            </div>
            <div class="project-links">
                ${project.github ? `<a href="${project.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub" onclick="event.stopPropagation()"><i class="fab fa-github"></i></a>` : ''}
            </div>
        </div>
        <h3 class="project-title">${escapeHtml(project.title) || 'Untitled Project'}</h3>
        <p class="project-description">${escapeHtml(project.description) || 'No description available'}</p>
        <div class="project-tech">
            <div class="tech-tags-visible">
                ${visibleTagsHTML}
            </div>
            ${hasMoreTags ? `
                <div class="tech-tags-hidden" id="${projectId}-hidden">
                    ${hiddenTagsHTML}
                </div>
                <button class="tech-expand-btn" data-project="${projectId}" aria-label="Show more tags" onclick="event.stopPropagation()">
                    <i class="fas fa-chevron-down"></i> Show ${hiddenTags.length} more
                </button>
            ` : ''}
        </div>
    `;

    return card;
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderTagFilters(projects) {
    const filterTagsContainer = document.getElementById('filter-tags');
    if (!filterTagsContainer) return;

    // Clear existing buttons except the "All" button
    const allButton = filterTagsContainer.querySelector('[data-filter="all"]');
    filterTagsContainer.innerHTML = '';
    if (allButton) {
        filterTagsContainer.appendChild(allButton);
    } else {
        const allBtn = document.createElement('button');
        allBtn.className = 'filter-tag active';
        allBtn.setAttribute('data-filter', 'all');
        allBtn.textContent = 'All';
        filterTagsContainer.appendChild(allBtn);
    }

    const VISIBLE_TAGS = 9;
    const allTags = [...new Set(projects.filter(p => !p.hidden).flatMap(project => project.tags))];

    // ✅ NEW: Sort tags by custom order from PROJECT_META
    const sortedTags = sortTagsByOrder(allTags);

    sortedTags.forEach((tag, index) => {
        const button = document.createElement('button');
        button.className = 'filter-tag';
        button.setAttribute('data-filter', tag);
        button.setAttribute('aria-label', `Filter by ${tag}`);
        button.textContent = tag;

        if (index >= VISIBLE_TAGS) {
            button.classList.add('filter-tag-hidden');
            button.style.display = 'none';
        }

        filterTagsContainer.appendChild(button);
    });

    if (allTags.length > VISIBLE_TAGS) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'filter-toggle-btn';
        toggleBtn.textContent = `Show all (${allTags.length})`;
        toggleBtn.setAttribute('aria-expanded', 'false');

        let expanded = false;
        toggleBtn.addEventListener('click', () => {
            expanded = !expanded;
            document.querySelectorAll('.filter-tag-hidden').forEach(btn => {
                btn.style.display = expanded ? '' : 'none';
            });
            toggleBtn.textContent = expanded ? 'Show less' : `Show all (${allTags.length})`;
            toggleBtn.setAttribute('aria-expanded', String(expanded));
        });

        filterTagsContainer.appendChild(toggleBtn);
    }
}

// ✅ NEW: Sort tags by custom order
function sortTagsByOrder(tags) {
    const order = (typeof PROJECT_META !== 'undefined' && PROJECT_META.filterOrder) ? PROJECT_META.filterOrder : [];

    return [...tags].sort((a, b) => {
        const ai = order.indexOf(a);
        const bi = order.indexOf(b);
        if (ai === -1 && bi === -1) return a.localeCompare(b);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
    });
}

function setupFilterHandlers(projects) {
    document.querySelectorAll('.filter-tag').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.filter-tag').forEach(btn =>
                btn.classList.remove('active')
            );
            button.classList.add('active');
            renderProjects(projects, button.dataset.filter);
        });
    });
}

// ─── Project Overlay ───────────────────────────────────────────
function initProjectOverlay() {
    // Build overlay HTML once
    const overlay = document.createElement('div');
    overlay.className = 'project-overlay';
    overlay.innerHTML = `
        <div class="project-overlay-inner">
            <button class="project-overlay-close" aria-label="Close project">&#x2715;</button>
            <iframe id="project-iframe" title="Project detail"></iframe>
        </div>
    `;
    document.body.appendChild(overlay);

    const iframe = overlay.querySelector('#project-iframe');

    function openProject(url) {
        iframe.src = url;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeProject() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        // small delay so animation finishes before clearing src
        setTimeout(() => { iframe.src = ''; }, 350);
    }

    // expose so iframe's own close button can call it
    window.closeProject = closeProject;

    // close button
    overlay.querySelector('.project-overlay-close').addEventListener('click', closeProject);

    // click outside inner panel
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeProject();
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeProject();
    });

    // Card clicks — reads data-page set when card is built
    document.getElementById('projects-grid').addEventListener('click', (e) => {
        const card = e.target.closest('.project-card');
        if (!card || card.classList.contains('skeleton')) return;
        const page = card.dataset.page;
        if (page) {
            openProject(page);
        }
    });
}