document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Experience tabs
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
            document.getElementById(tabId).classList.add('active');
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

    // Scroll reveal animation
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.about-content, .experience-tabs, .project-card');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Set initial state for animation
    document.querySelectorAll('.about-content, .experience-tabs, .project-card').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    // Run animation check on load and scroll
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);

    // Update copyright year
    document.querySelector('.copyright').innerHTML = `Designed & Built by Shin &copy; ${new Date().getFullYear()}`;
});


// Add this script if you want to hide extra tags
document.addEventListener('DOMContentLoaded', function() {
    const techContainers = document.querySelectorAll('.project-tech');
    
    techContainers.forEach(container => {
        if (container.children.length > 4) {
            const hiddenCount = container.children.length - 4;
            const moreIndicator = document.createElement('div');
            moreIndicator.className = 'tech-more';
            moreIndicator.textContent = `+${hiddenCount}`;
            
            // Hide extra tags
            Array.from(container.children)
                .slice(4)
                .forEach(tag => tag.style.display = 'none');
            
            container.appendChild(moreIndicator);
        }
    });
});

// Scroll reveal logic
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target);
    }
  });
});
reveals.forEach(reveal => {
  revealObserver.observe(reveal);
});


document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Fetch projects data
    const response = await fetch('./data/project_data.json');
    const projectsData = await response.json();
    
    // Initialize the page
    renderProjects(projectsData);
    renderTagFilters(projectsData);
    
    // Set up filter functionality
    setupFilterHandlers(projectsData);
    
  } catch (error) {
    console.error('Error loading projects:', error);
    // Fallback: You could render static content here
  }
});

function renderProjects(projects, filter = 'all') {
  const projectsGrid = document.getElementById('projects-grid');
  projectsGrid.innerHTML = '';
  
  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.tags.includes(filter));
  
  filteredProjects.forEach(project => {
    projectsGrid.innerHTML += createProjectCard(project);
  });
}

function createProjectCard(project) {
  const tagsHTML = project.tags.map(tag => `
    <div class="tech-tag">
      <i class="${project.icons[tag]}"></i>${tag}
    </div>
  `).join('');
  
  return `
    <div class="project-card" data-tags="${project.tags.join(',')}">
      <div class="project-header">
        <div class="folder-icon">
          <i class="fas fa-folder"></i>
        </div>
        <div class="project-links">
          <a href="${project.github}" target="_blank"><i class="fab fa-github"></i></a>
        </div>
      </div>
      <h3 class="project-title">${project.title}</h3>
      <p class="project-description">${project.description}</p>
      <div class="project-tech">
        ${tagsHTML}
      </div>
    </div>
  `;
}

function renderTagFilters(projects) {
  const filterTagsContainer = document.getElementById('filter-tags');
  const allTags = [...new Set(projects.flatMap(project => project.tags))];
  
  allTags.forEach(tag => {
    filterTagsContainer.innerHTML += `
      <button class="filter-tag" data-filter="${tag}">${tag}</button>
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
