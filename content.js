chrome.runtime.onMessage.addListener((message) => {
    if (message.word) {
        const word = message.word;
        const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data[0]) {
                    const definition = data[0].meanings[0].definitions[0].definition;
                    const synonyms = data[0].meanings[0].synonyms ? data[0].meanings[0].synonyms.join(", ") : "No synonyms found";
                    const audio = data[0].phonetics[0]?.audio;

                    showPopup(word, definition, synonyms, audio);
                } else {
                    showPopup(word, "No results found.", "", null);
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                showPopup(word, "Error fetching data. Please try again.", "", null);
            });
    }
});

function showPopup(word, definition, synonyms, audio) {
    let overlay = document.getElementById('dict-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    overlay = document.createElement('div');
    overlay.id = 'dict-overlay';
    overlay.style.position = 'fixed';
    overlay.style.bottom = '20px';
    overlay.style.right = '20px';
    overlay.style.padding = '15px';
    overlay.style.backgroundColor = '#ffffff';
    overlay.style.border = '1px solid #ccc';
    overlay.style.borderRadius = '10px';
    overlay.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    overlay.style.zIndex = 10000;
    overlay.style.width = '300px';
    overlay.style.fontFamily = 'Arial, sans-serif';
    overlay.style.color = '#333';
    
    const closeButton = `<button id="close-btn" style="
        background-color: #f44336;
        color: white;
        border: none;
        padding: 5px 10px;
        cursor: pointer;
        border-radius: 5px;
        float: right;
        font-size: 14px;
    ">X</button>`;
    
    const audioButton = audio ? `<button style="
        background-color: #2196F3;
        color: white;
        border: none;
        padding: 5px 10px;
        cursor: pointer;
        border-radius: 5px;
        margin-top: 10px;
        font-size: 14px;
    " onclick="new Audio('${audio}').play()">🔊 Pronunciation</button>` : '';
    
    overlay.innerHTML = `
        <div style="font-weight: bold; font-size: 18px; margin-bottom: 10px;">${word}</div>
        <div style="font-size: 14px;">Definition: ${definition}</div>
        <div style="margin-top: 10px; color: #555; font-size: 14px;">Synonyms: ${synonyms}</div>
        ${audioButton}
        ${closeButton}
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('close-btn').addEventListener('click', () => {
        overlay.remove();
    });
}
