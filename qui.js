document.addEventListener('DOMContentLoaded', () => {
  const questionDiv = document.querySelector('.question');
  const guessInput = document.getElementById('guessInput');
  const submitGuessButton = document.getElementById('submitGuess');
  const resultDiv = document.querySelector('.result');
  let currentPerson;
  let questionIndex = 0;
  let chances = 4;

  const questions = [
    person => `Indice 1 : Cette personne est née à ${person.birth_place}. Qui c'est ?`,
    person => `Indice 2 : Cette personne est née le ${new Date(person.birth_date).toLocaleDateString()}. Qui c'est ?`,
    person => `Indice 3 : Cette personne habite à ${person.address}. Qui c'est ?`,
    async person => {
      const foyerData = await fetchFoyerById(person.foyerId);
      const otherPeople = foyerData.persons.filter(p => p.id !== person.id);
      const otherPeopleNames = otherPeople.map(p => `${p.first_name} ${p.last_name}`).join(', ');
      return `Indice 4 : Les autres personnes dans le foyer sont : ${otherPeopleNames}. Qui c'est ?`;
    }
  ];

  const displayMessage = (message) => {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
  };

  const fetchRandomPerson = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      displayMessage('Token non trouvé. Veuillez vous connecter.');
      redirectToLogin();
      return;
    }

    fetch('http://68.233.121.181/api/people', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Token invalide ou expiré. Veuillez vous reconnecter.');
          }
          throw new Error('Une erreur s\'est produite lors de la récupération des données.');
        }
        return response.json();
      })
      .then(data => {
        const randomIndex = Math.floor(Math.random() * data.data.length);
        currentPerson = data.data[randomIndex];
        questionIndex = 0;
        chances = 4;
        displayQuestion();
      })
      .catch(error => {
        console.error('Erreur:', error);
        if (error.message === 'Token invalide ou expiré. Veuillez vous reconnecter.') {
          displayMessage(error.message);
          redirectToLogin();
        } else {
          displayMessage('Erreur lors de la récupération des données. Veuillez vérifier la console.');
        }
      });
  };

  const displayQuestion = async () => {
    const question = await questions[questionIndex](currentPerson);
    questionDiv.textContent = question;
    resultDiv.textContent = '';
  };

  const fetchFoyerById = (foyerId) => {
    const token = localStorage.getItem('token');
    return fetch(`http://68.233.121.181/api/foyers/${foyerId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => data.data)
      .catch(error => {
        console.error('Erreur lors de la récupération des données du foyer:', error);
        return { persons: [] };
      });
  };

  const checkGuess = () => {
    const userGuess = guessInput.value.trim().toLowerCase();
    const correctAnswer = `${currentPerson.first_name.toLowerCase()} ${currentPerson.last_name.toLowerCase()}`;
    if (userGuess === correctAnswer) {
      resultDiv.textContent = 'Bravo ! Vous avez trouvé la bonne réponse.';
      setTimeout(fetchRandomPerson, 3000);
    } else {
      chances--;
      if (chances > 0) {
        resultDiv.textContent = `Non, ce n'est pas ça. Il vous reste ${chances} chance(s).`;
        questionIndex = (questionIndex + 1) % questions.length;
        setTimeout(displayQuestion, 3000);
      } else {
        resultDiv.textContent = `Non, ce n'est pas ça. La bonne réponse était ${currentPerson.first_name} ${currentPerson.last_name}.`;
        setTimeout(fetchRandomPerson, 3000);
      }
    }
  };

  submitGuessButton.addEventListener('click', checkGuess);
  fetchRandomPerson();
});

// Fonction pour rediriger vers la page de login
function redirectToLogin() {
  window.location.href = 'login.html';
}
