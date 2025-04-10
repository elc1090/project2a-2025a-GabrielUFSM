
const gitHubForm = document.getElementById('gitHubForm');
const loadingIndicator = document.getElementById('loadingIndicator');
const commitsList = document.getElementById('commitsList');

function clearResults() {
    commitsList.innerHTML = '';
}

function showLoading() {
    loadingIndicator.classList.remove('d-none');
}

function hideLoading() {
    loadingIndicator.classList.add('d-none');
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function showError(message) {
    commitsList.innerHTML = `
    <div class="alert alert-danger" role="alert">
        ${message}
    </div>`;
}

gitHubForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let username = document.getElementById('usernameInput').value.trim();
    let repository = document.getElementById('repoInput').value.trim();

    if (!username || !repository) {
        showError('Please enter both username and repository name.');
        return;
    }

    clearResults();
    showLoading();

    fetchCommits(username, repository)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.status);
            }
            return response.json();
        })
        .then(data => {
            hideLoading();
            displayCommits(data);
        })
        .catch(error => {
            hideLoading();
            
            if (error.message === '404') {
                showError(`Repository not found: ${username}/${repository}`);
            } else if (error.message === '403') {
                showError('API rate limit exceeded. Please try again later.');
            } else {
                showError(`Error fetching data: ${error.message}`);
            }
        });
});

function fetchCommits(username, repository) {
    const apiUrl = `https://api.github.com/repos/${username}/${repository}/commits`;
    return fetch(apiUrl);
}

function displayCommits(commits) {
    if (commits.length === 0) {
        showError('No commits found in this repository.');
        return;
    }

    let commitsHTML = '<h3 class="mb-3">Recent Commits</h3>';

    commits.forEach(commit => {
        const commitData = commit.commit;
        const author = commitData.author;
        const committer = commit.committer ? commit.committer.login : (commit.author ? commit.author.login : 'Unknown');
        const avatarUrl = commit.author ? commit.author.avatar_url : 'https://avatars.githubusercontent.com/u/0?v=4';
        const commitUrl = commit.html_url;

        commitsHTML += `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex align-items-center mb-2">
                    <img src="${avatarUrl}" alt="Author avatar" class="rounded-circle me-2" width="40" height="40">
                    <div>
                        <strong>${committer}</strong>
                        <div class="commit-date">
                            ${formatDate(author.date)}
                        </div>
                    </div>
                </div>
                <h5 class="card-title">${commitData.message}</h5>
                <a href="${commitUrl}" class="btn btn-sm btn-outline-secondary" target="_blank">
                    View on GitHub
                </a>
            </div>
        </div>`;
    });

    commitsList.innerHTML = commitsHTML;
}
