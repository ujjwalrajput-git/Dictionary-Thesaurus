chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "findMeaning",
        title: "Find meaning",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "findMeaning" && tab.url.startsWith("http")) {
        const selectedText = info.selectionText.trim();
        if (selectedText) {
            console.log(`Selected text: ${selectedText}`);

            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: fetchWordMeaning,
                args: [selectedText]
            });
        }
    }
});

function fetchWordMeaning(selectedText) {
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${selectedText}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data[0]) {
                const definition = data[0].meanings[0].definitions[0].definition;
                const synonyms = data[0].meanings[0].synonyms ? data[0].meanings[0].synonyms.join(", ") : "No synonyms found";
                const audio = data[0].phonetics[0]?.audio;

                showPopup(selectedText, definition, synonyms, audio);
            } else {
                showPopup(selectedText, "No results found.", "", null);
            }
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            showPopup(selectedText, "Error fetching data. Please try again.", "", null);
        });

    function showPopup(word, definition, synonyms, audio) {
        let overlay = document.getElementById('dict-overlay');
        if (overlay) {
            overlay.remove();
        }

        overlay = document.createElement('div');
        overlay.id = 'dict-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '20px';
        overlay.style.right = '20px';
        overlay.style.padding = '15px';
        overlay.style.backgroundColor = '#ffffff';
        overlay.style.border = '1px solid #ccc';
        overlay.style.borderRadius = '10px';
        overlay.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        overlay.style.zIndex = 10000;
        overlay.style.width = '320px';
        overlay.style.fontFamily = 'Arial, sans-serif';
        overlay.style.color = '#333';
        overlay.style.opacity = 0;
        overlay.style.transform = 'translateY(20px)';
        overlay.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

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

        const audioButton = audio ? `<button id="play-audio-btn" style="
            background-color: #00796b;
            color: white;
            border: none;
            padding: 8px 12px;
            cursor: pointer;
            border-radius: 5px;
            margin-top: 10px;
            font-size: 14px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: background-color 0.3s ease, box-shadow 0.3s ease;
        ">🔊 Pronunciation</button>` : '';

        overlay.innerHTML = `
            <div style="font-weight: bold; font-size: 22px; margin-bottom: 10px; color: #00796b; text-transform: capitalize;">${word}</div>
            <div style="font-size: 14px;">Definition: ${definition}</div>
            <div style="margin-top: 10px; color: #666; font-size: 14px;">Synonyms: ${synonyms}</div>
            ${audioButton}
            ${closeButton}
        `;

        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.style.opacity = 1;
            overlay.style.transform = 'translateY(0)';
        }, 10);

        function closePopup() {
            overlay.style.opacity = 0;
            overlay.style.transform = 'translateY(20px)';
            setTimeout(() => {
                overlay.remove();
                document.removeEventListener('click', onClickOutside);
            }, 400);
        }

        function onClickOutside(event) {
            if (!overlay.contains(event.target)) {
                closePopup();
            }
        }

        document.getElementById('close-btn').addEventListener('click', closePopup);
        document.addEventListener('click', onClickOutside);

        if (audio) {
            fetch(audio)
                .then(response => response.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    document.getElementById('play-audio-btn').addEventListener('click', () => {
                        new Audio(url).play();
                    });
                })
                .catch(error => console.error("Failed to load audio:", error));
        }
    }
}
