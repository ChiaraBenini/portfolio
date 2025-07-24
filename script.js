document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger?.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks?.classList.toggle('active');
    });

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
            
            // Remove active class from all buttons and contents
            tabBtns.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
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

    // Initialize animations
    animateOnScroll();

    // Update copyright year
    document.querySelector('.copyright').textContent = `Designed & Built by Shin © ${new Date().getFullYear()}`;

    // Load and render projects
    loadProjects();
});

async function loadProjects() {
    try {
        const projectsGrid = document.getElementById('projects-grid');
        projectsGrid.innerHTML = ''; // Clear skeleton loader
        
        const response = await fetch('./data/project_data.json');
        if (!response.ok) throw new Error('Failed to load projects');
        
        const projectsData = await response.json();
        renderProjects(projectsData);
        renderTagFilters(projectsData);
        setupFilterHandlers(projectsData);
        
    } catch (error) {
        console.error('Error loading projects:', error);
        const projectsGrid = document.getElementById('projects-grid');
        projectsGrid.innerHTML = `
            <div class="project-card error">
                <p>Failed to load projects. Please try again later.</p>
            </div>
        `;
    }
}

function renderProjects(projects, filter = 'all') {
    const projectsGrid = document.getElementById('projects-grid');
    projectsGrid.innerHTML = '';
    
    const filteredProjects = filter === 'all' 
        ? projects 
        : projects.filter(project => project.tags.includes(filter));
    
    if (filteredProjects.length === 0) {
        projectsGrid.innerHTML = '<div class="project-card"><p>No projects found with this filter.</p></div>';
        return;
    }
    
    filteredProjects.forEach(project => {
        projectsGrid.innerHTML += createProjectCard(project);
    });
}

function createProjectCard(project) {
    const tagsHTML = project.tags.slice(0, 4).map(tag => `
        <div class="tech-tag">
            <i class="${project.icons?.[tag] || 'fas fa-code'}"></i>${tag}
        </div>
    `).join('');
    
    const moreTags = project.tags.length > 4 ? 
        `<div class="tech-more">+${project.tags.length - 4}</div>` : '';
    
    return `
        <div class="project-card" data-tags="${project.tags.join(',')}">
            <div class="project-header">
                <div class="folder-icon">
                    <i class="fas fa-folder"></i>
                </div>
                <div class="project-links">
                    ${project.github ? `<a href="${project.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i class="fab fa-github"></i></a>` : ''}
                </div>
            </div>
            <h3 class="project-title">${project.title || 'Untitled Project'}</h3>
            <p class="project-description">${project.description || 'No description available'}</p>
            <div class="project-tech">
                ${tagsHTML}
                ${moreTags}
            </div>
        </div>
    `;
}

function renderTagFilters(projects) {
    const filterTagsContainer = document.getElementById('filter-tags');
    if (!filterTagsContainer) return;
    
    const allTags = [...new Set(projects.flatMap(project => project.tags))];
    
    allTags.forEach(tag => {
        filterTagsContainer.innerHTML += `
            <button class="filter-tag" data-filter="${tag}" aria-label="Filter by ${tag}">${tag}</button>
        `;
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
