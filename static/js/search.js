
// Sample NIC codes data (replace with actual API call)
const sampleResults = [
    {
        code: "13924",
        description: "Manufacture of bedding, quilts, pillows, sleeping bags etc.",
        businessType: "Cotton bedsheet manufacturing",
        match: "72.06%"
    },
    {
        code: "13929",
        description: "Manufacture of other made-up textile articles n.e.c.",
        businessType: "Textile manufacturing",
        match: "68.45%"
    },
    {
        code: "13921",
        description: "Manufacture of soft furnishings",
        businessType: "Home textile products",
        match: "65.32%"
    },
    {
        code: "13912",
        description: "Manufacture of canvas goods, sails etc.",
        businessType: "Canvas and textile goods",
        match: "62.18%"
    },
    {
        code: "13911",
        description: "Manufacture of carpets and rugs",
        businessType: "Floor covering manufacturing",
        match: "58.94%"
    }
];

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
        // Simulate API call (replace with actual API endpoint)
        await simulateAPICall(query);

        // Show results
        displayResults(query, sampleResults);

    } catch (error) {
        console.error('Search failed:', error);
        // Handle error (show error message)
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

async function simulateAPICall(query) {
    // Simulate network delay
    return new Promise(resolve => {
        setTimeout(resolve, 2000 + Math.random() * 1000);
    });
}

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
        // Show toast or feedback
        console.log('Code copied:', code);
    });
}

function giveFeedback(code, type) {
    // Toggle active state
    const buttons = document.querySelectorAll(`[onclick*="${code}"]`);
    const clickedButton = event.target.closest('.action-button');

    // Remove active from other feedback buttons for this result
    buttons.forEach(btn => {
        if (btn.classList.contains('like') || btn.classList.contains('dislike')) {
            btn.classList.remove('active');
        }
    });

    // Add active to clicked button
    clickedButton.classList.add('active');

    // Send feedback to server
    console.log(`Feedback for ${code}: ${type}`);

    // Here you would typically send the feedback to your Flask backend
    // fetch('/api/feedback', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ code, feedback: type })
    // });
}