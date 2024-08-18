document.getElementById('searchBtn').addEventListener('click', function () {
    searchWord();
});

document.getElementById('searchInput').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchWord();
    }
});

function searchWord() {
    const word = document.getElementById('searchInput').value.trim();
    const resultDiv = document.getElementById('result');
    
    // Initially hide the result box and remove the show class
    resultDiv.style.display = 'none';
    resultDiv.classList.remove('show');

    if (word) {
        const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data[0]) {
                    const definition = data[0].meanings[0].definitions[0].definition;
                    const synonyms = data[0].meanings[0].synonyms ? data[0].meanings[0].synonyms.join(", ") : "No synonyms found";
                    const audio = data[0].phonetics[0]?.audio;

                    resultDiv.innerHTML = `
                      <div class="word">${word}</div>
                      <div class="definition">Definition: ${definition}</div>
                      <div class="synonyms">Synonyms: ${synonyms}</div>
                      ${audio ? `<button id="audioBtn" class="audio-button">🔊 Pronunciation</button>` : ''}
                    `;
                    
                    if (audio) {
                        document.getElementById('audioBtn').addEventListener('click', () => {
                            new Audio(audio).play().catch(error => console.error('Error playing audio:', error));
                        });
                    }
                } else {
                    resultDiv.innerHTML = `<div class="word">No results found for "${word}".</div>`;
                }

                // Show the result box with animation
                resultDiv.style.display = 'block';
                setTimeout(() => resultDiv.classList.add('show'), 10);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                resultDiv.innerHTML = `<div class="word">Error fetching data. Please try again.</div>`;
                
                // Show the result box even in case of an error
                resultDiv.style.display = 'block';
                setTimeout(() => resultDiv.classList.add('show'), 10);
            });
    }
}
