// Search functionality
function searchNIC() {
    const description = document.getElementById('businessDescription').value;
    if (!description.trim()) {
        alert('Please enter a business description');
        return;
    }

    // Here you would make an API call to your Flask backend
    fetch('/api/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: description })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displaySearchResults(data.results);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function fillExample(text) {
    document.getElementById('businessDescription').value = text;
}

function displaySearchResults(results) {
    // This would display results in a modal or redirect to results page
    console.log('Search results:', results);
    alert(`Found ${results.length} matching NIC codes. Check console for details.`);
}


// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
