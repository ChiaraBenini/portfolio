// sync-projects.js
const fs = require('fs');
const path = require('path');

// Your GitHub username
const GITHUB_USERNAME = 'ChiaraBenini';
// Your existing JSON file
const DATA_FILE = './data/project_data.json';

// Repos you want to exclude (by name)
const EXCLUDED_REPOS = [
    'ChiaraBenini',  // profile README repo
    'your-private-repo-name'
];

// Repos you want to manually hide (optional override)
const HIDDEN_REPOS = [
    // 'repo-name-to-hide'
];

// Custom descriptions for specific repos (override GitHub's)
const CUSTOM_DESCRIPTIONS = {
    // 'repo-name': 'Your much better description here'
};

// Custom tags for specific repos
const CUSTOM_TAGS = {
    // 'repo-name': ['Python', 'PyTorch', 'Custom Tag']
};

async function fetchGitHubRepos() {
    console.log('📡 Fetching repos from GitHub...');

    let allRepos = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const response = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&page=${page}&sort=updated&direction=desc`
        );

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const repos = await response.json();
        allRepos = [...allRepos, ...repos];

        hasMore = repos.length === 100;
        page++;
    }

    console.log(` Found ${allRepos.length} repos`);
    return allRepos;
}

function getRepoTopics(repo) {
    // GitHub topics come as an array in the API response
    return repo.topics || [];
}

function generateProjectFromRepo(repo) {
    // Get topics/tags
    let tags = getRepoTopics(repo);

    // Add primary language as a tag if not already present
    if (repo.language && !tags.includes(repo.language)) {
        tags.unshift(repo.language);
    }

    // Remove excluded tags (optional)
    tags = tags.filter(tag => !['archived', 'deprecated'].includes(tag));

    // Override with custom tags if they exist
    if (CUSTOM_TAGS[repo.name]) {
        tags = CUSTOM_TAGS[repo.name];
    }

    // Map GitHub languages to icons (add more as needed)
    const icons = {
        'Python': 'fab fa-python',
        'JavaScript': 'fab fa-js',
        'TypeScript': 'fab fa-js',
        'HTML': 'fab fa-html5',
        'CSS': 'fab fa-css3-alt',
        'Java': 'fab fa-java',
        'React': 'fab fa-react',
        'PyTorch': 'fas fa-brain',
        'TensorFlow': 'fas fa-chart-line',
        default: 'fas fa-code'
    };

    const projectIcons = {};
    tags.forEach(tag => {
        projectIcons[tag] = icons[tag] || icons.default;
    });

    // Use custom description if available
    let description = repo.description || 'No description available';
    if (CUSTOM_DESCRIPTIONS[repo.name]) {
        description = CUSTOM_DESCRIPTIONS[repo.name];
    }

    return {
        id: repo.id,
        title: repo.name.replace(/-/g, ' ').replace(/_/g, ' '),
        description: description,
        github: repo.html_url,
        tags: tags.slice(0, 6), // Max 6 tags
        icons: projectIcons,
        updated_at: repo.updated_at,
        // Auto-fields
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        // Manual control fields
        hidden: HIDDEN_REPOS.includes(repo.name) || EXCLUDED_REPOS.includes(repo.name)
    };
}

async function loadExistingProjects() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            const existing = JSON.parse(data);
            console.log(`📖 Loaded ${existing.length} existing projects`);
            return existing;
        }
    } catch (error) {
        console.log('No existing projects file found, creating new one');
    }
    return [];
}

function mergeProjects(githubProjects, existingProjects) {
    // Create map of existing projects by title
    const existingMap = new Map();
    existingProjects.forEach(proj => {
        existingMap.set(proj.title, proj);
    });

    // Merge: GitHub data + manual overrides
    const merged = githubProjects.map(githubProj => {
        const existing = existingMap.get(githubProj.title);

        if (existing) {
            // Keep manual overrides but update GitHub data
            return {
                ...githubProj,
                // Keep manual description if it was customized
                description: existing.manual_description || githubProj.description,
                // Keep manual hidden status if set
                hidden: existing.hidden !== undefined ? existing.hidden : githubProj.hidden,
                // Preserve custom order if you add one
                order: existing.order || 999,
                // Flag to indicate it was synced
                synced_at: new Date().toISOString()
            };
        }

        return {
            ...githubProj,
            order: 999,
            synced_at: new Date().toISOString()
        };
    });

    // Keep projects that are only in existing (manually added, not on GitHub)
    const manualOnly = existingProjects.filter(existing =>
        !githubProjects.some(github => github.title === existing.title)
    );

    return [...merged, ...manualOnly].sort((a, b) => a.order - b.order);
}

async function main() {
    try {
        console.log('🚀 Starting project sync...\n');

        // Fetch repos from GitHub
        const githubRepos = await fetchGitHubRepos();

        // Filter out excluded repos
        const filteredRepos = githubRepos.filter(repo => !EXCLUDED_REPOS.includes(repo.name));

        // Convert to project format
        const githubProjects = filteredRepos.map(generateProjectFromRepo);

        // Load existing projects if any
        const existingProjects = await loadExistingProjects();

        // Merge data
        const finalProjects = mergeProjects(githubProjects, existingProjects);

        // Filter out hidden projects
        const visibleProjects = finalProjects.filter(proj => !proj.hidden);

        // Ensure data directory exists
        const dataDir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Write to file
        fs.writeFileSync(DATA_FILE, JSON.stringify(visibleProjects, null, 2));

        console.log(`\n✅ Sync complete!`);
        console.log(`📊 Total projects: ${finalProjects.length}`);
        console.log(`👁️  Visible: ${visibleProjects.length}`);
        console.log(`🙈 Hidden: ${finalProjects.length - visibleProjects.length}`);
        console.log(`\n💾 Saved to: ${DATA_FILE}`);

    } catch (error) {
        console.error('❌ Error syncing projects:', error.message);
        process.exit(1);
    }
}

// Run it
main();