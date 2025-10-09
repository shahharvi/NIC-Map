// --- Remove sampleResults (we now use real API) ---
// const sampleResults = [ ... ]   ❌ DELETE THIS

const searchForm = document.getElementById('searchForm');
const searchButton = document.getElementById('searchButton');
const searchIcon = document.getElementById('searchIcon');
const spinner = document.getElementById('spinner');
const buttonText = document.getElementById('buttonText');
const processingText = document.getElementById('processingText');
const resultsSection = document.getElementById('resultsSection');
const resultsCount = document.getElementById('resultsCount');
const resultsGrid = document.getElementById('resultsGrid');
const businessDescription = document.getElementById('businessDescription');

searchForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const query = businessDescription.value.trim();
    if (!query) return;

    // Show loading state
    searchButton.disabled = true;
    searchButton.classList.add('processing');
    searchIcon.style.display = 'none';
    spinner.style.display = 'block';
    buttonText.textContent = 'Processing...';
    processingText.style.display = 'block';
    resultsSection.classList.remove('show');

    try {
        // 🔹 Call Flask API instead of simulateAPICall
        const res = await fetch("/api/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description: query })
        });

        const data = await res.json();

        if (data.success) {
            // Map API results to UI format
            const formattedResults = data.results.map(r => ({
                code: r.code,
                description: r.description,
                businessType: "Predicted from query",  // placeholder
                match: (r.confidence).toFixed(2) + "%" // backend should return 0–100
            }));

            displayResults(query, formattedResults);
        } else {
            console.error("Error:", data.error || "No results found");
            resultsCount.textContent = `No NIC codes found for "${query}"`;
            resultsGrid.innerHTML = "";
        }

    } catch (error) {
        console.error('Search failed:', error);
    } finally {
        // Reset button state
        searchButton.disabled = false;
        searchButton.classList.remove('processing');
        searchIcon.style.display = 'block';
        spinner.style.display = 'none';
        buttonText.textContent = 'Submit Search';
        processingText.style.display = 'none';
    }
});

function displayResults(query, results) {
    resultsCount.textContent = `Found ${results.length} matching NIC codes for "${query}"`;

    resultsGrid.innerHTML = results.map(result => `
    <div class="result-card">
        <div class="result-header">
            <div>
                <div class="nic-code">NIC Code: ${result.code}</div>
            </div>
            <div class="match-percentage">${result.match} match</div>
        </div>
        <div class="result-description">${result.description}</div>
        <div class="business-type">Business Type: ${result.businessType}</div>
        <div class="result-actions">
            <button class="action-button copy" onclick="copyCode('${result.code}')" title="Copy Code">
                <svg viewBox="0 0 24 24">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                </svg>
            </button>
            <button class="action-button like" onclick="giveFeedback('${result.code}', 'like')" title="Like">
                <svg viewBox="0 0 24 24">
                    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z" />
                </svg>
            </button>
            <button class="action-button dislike" onclick="giveFeedback('${result.code}', 'dislike')" title="Dislike">
                <svg viewBox="0 0 24 24">
                    <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
                </svg>
            </button>
        </div>
    </div>
    `).join('');

    resultsSection.classList.add('show');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function copyCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        console.log('Code copied:', code);
    });
}

function giveFeedback(code, type) {
    const buttons = document.querySelectorAll(`[onclick*="${code}"]`);
    const clickedButton = event.target.closest('.action-button');

    buttons.forEach(btn => {
        if (btn.classList.contains('like') || btn.classList.contains('dislike')) {
            btn.classList.remove('active');
        }
    });

    clickedButton.classList.add('active');

    console.log(`Feedback for ${code}: ${type}`);

    // 🔹 Optional: Send feedback to backend
    // fetch('/api/feedback', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ code, feedback: type })
    // });
}

// Feedback modal logic
const feedbackBtn = document.getElementById('feedbackBtn');
const feedbackModal = document.getElementById('feedbackModal');
const closeModal = document.getElementById('closeModal');
const feedbackForm = document.getElementById('feedbackForm');
const feedbackText = document.getElementById('feedbackText');
const feedbackSuccess = document.getElementById('feedbackSuccess');

if (feedbackBtn && feedbackModal && closeModal && feedbackForm) {
    feedbackBtn.addEventListener('click', function() {
        feedbackModal.style.display = 'block';
        feedbackSuccess.style.display = 'none';
        feedbackText.value = '';
    });
    closeModal.addEventListener('click', function() {
        feedbackModal.style.display = 'none';
    });
    feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const feedback = feedbackText.value.trim();
        if (!feedback) return;
        fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedback })
        }).then(() => {
            feedbackSuccess.style.display = 'block';
            feedbackText.value = '';
            setTimeout(() => {
                feedbackModal.style.display = 'none';
            }, 1500);
        });
    });
}