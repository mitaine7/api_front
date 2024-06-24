document.addEventListener('DOMContentLoaded', () => {
    const character = document.getElementById('character');
    const container = document.getElementById('game-container');
    const music = document.getElementById('background-music');
    const muteButton = document.getElementById('mute-button');
    const inventoryList = document.getElementById('items-list'); // Assurez-vous que cet élément existe dans votre HTML

    let inventory = [];

    // Affiche le message au début de la page
    alert('Sadit! Faut trouver les 5 mitaines cachées sur cette carte. Bonne chance, moncon!');

    // Position initiale centrée sur la base de la taille du personnage
    let position = {
        top: container.offsetHeight / 2 - character.offsetHeight / 2,
        left: container.offsetWidth / 2 - character.offsetWidth / 2
    };

    // Génère des points aléatoires sur la carte
    const generateRandomPoints = (numPoints) => {
        const points = [];
        for (let i = 0; i < numPoints; i++) {
            points.push({
                top: Math.random() * (container.offsetHeight - 10),
                left: Math.random() * (container.offsetWidth - 10)
            });
        }
        return points;
    };

    // Points aléatoires générés
    const randomPoints = generateRandomPoints(5);

    const checkForRandomPoints = () => {
        randomPoints.forEach((point, index) => {
            // Coordonnées et dimensions du personnage
            const characterLeft = position.left;
            const characterRight = position.left + character.offsetWidth;
            const characterTop = position.top;
            const characterBottom = position.top + character.offsetHeight;
    
            // Coordonnées du point (centre plus tolérance pour toucher)
            const pointLeft = point.left;
            const pointRight = point.left + 10; // La largeur du point
            const pointTop = point.top;
            const pointBottom = point.top + 10; // La hauteur du point
    
            // Vérification de la collision
            if (characterRight >= pointLeft && characterLeft <= pointRight && 
                characterBottom >= pointTop && characterTop <= pointBottom) {
                // La logique pour gérer la capture du point reste la même
                fetch('http://68.233.121.181:3000/api/mittens/random')
                    .then(response => response.json())
                    .then(data => {
                        const mittenName = data.data.name;
                        alert(`Nom des diouss! T'as trouvé des mitaines en ${mittenName} !`);
                        const listItem = document.createElement('li');
                        listItem.textContent = mittenName;
                        inventoryList.appendChild(listItem);
                        inventory.push(mittenName);
                        if (inventory.length === 5) {
                            showCongratulationsMessage();
                        }
                    })
                    .catch(error => console.error('Erreur lors de la récupération de la mitaine:', error));
                randomPoints.splice(index, 1);  // Retire le point atteint
            }
        });
    };
    

    // Affiche un message de félicitations avec un résumé des mitaines trouvées
    const showCongratulationsMessage = () => {
        let inventorySummary = inventory.join('\n');
        alert(`Moudit crack, t'as trouvé toutes les mitaines! Voici ton diplôme mitaineint:
        -----------------------------------------
        |||||||||||||||||||||||||||||||||||||||||||
        |||||||||||||||||||||||||||||||||||||||||||
        ||  Diplôme de Maître Mitaines!          ||
        ||                                       ||
        ||  T'as trouvé les mitaines suivantes:  ||
        ||                                       ||
        ||  ${inventorySummary}                  ||
        ||                                       ||
        |||||||||||||||||||||||||||||||||||||||||||
        |||||||||||||||||||||||||||||||||||||||||||
        -----------------------------------------
        Félicitations, maître des mitaines!`);
    };

    const updateCharacterPosition = () => {
        character.style.top = `${position.top}px`;
        character.style.left = `${position.left}px`;
        checkForRandomPoints();
    };

    const moveCharacter = (e) => {
        switch(e.key) {
            case 'ArrowUp':
                position.top = Math.max(0, position.top - 10);
                break;
            case 'ArrowDown':
                position.top = Math.min(container.offsetHeight - character.offsetHeight, position.top + 10);
                break;
            case 'ArrowLeft':
                position.left = Math.max(0, position.left - 10);
                break;
            case 'ArrowRight':
                position.left = Math.min(container.offsetWidth - character.offsetWidth, position.left + 10);
                break;
        }
        updateCharacterPosition();
        e.preventDefault(); // Empêche le défilement de la page
    };

    muteButton.addEventListener('click', () => {
        music.muted = !music.muted;
        muteButton.textContent = music.muted ? "Unmute" : "Mute";
        if (!music.muted) {
            music.play().catch(error => console.error('Music play was prevented:', error));
        }
    });

    document.addEventListener('click', () => music.play());
    document.addEventListener('keydown', () => music.play());
    document.addEventListener('keydown', moveCharacter);

    // Position initiale du personnage
    updateCharacterPosition();
});
