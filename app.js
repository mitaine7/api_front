// Fonctions principales

// Fonction pour afficher un message dans la section dédiée
const displayMessage = (message) => {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = message;
};

const addMittensToList = (response) => {
  const mittenList = document.getElementById('mittenList');
  mittenList.innerHTML = ''; // Efface la liste avant d'ajouter de nouveaux éléments
  
  if (Array.isArray(response)) {
    response.forEach(mitten => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${mitten.name}</h5>
          <p class="card-text">HP: ${mitten.hp} | CP: ${mitten.cp}</p>
          <p class="card-text">Types: ${mitten.types.join(', ')}</p>
          <img src="${mitten.picture}" alt="${mitten.name}" class="card-img-bottom" />
        </div>
      `;
      mittenList.appendChild(card);

      card.addEventListener('click', () => {
        document.getElementById('editName').value = mitten.name;
        document.getElementById('editHp').value = mitten.hp;
        document.getElementById('editCp').value = mitten.cp;
        document.getElementById('editPicture').value = mitten.picture;
        Array.from(document.getElementById('editTypes').options).forEach(option => {
            option.selected = mitten.types.includes(option.value);
        });
    
        // Attacher l'ID de la mitaine au bouton de sauvegarde
        document.getElementById('saveEdit').setAttribute('data-mitten-id', mitten.id);
    
        document.getElementById('editModal').style.display = "block";
    });
    
    });
  } else {
    console.error('La réponse attendue doit être un tableau.', response);
    displayMessage('Erreur lors de la récupération des mitaines. Veuillez vérifier la console.');
  }
};


// Fonction pour récupérer la liste des mitaines
const fetchMittensList = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    displayMessage('Token non trouvé. Veuillez vous connecter.');
    redirectToLogin();
    return;
  }

  fetch("http://68.233.121.181/api/mittens", {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => {
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Token invalide ou expiré. Veuillez vous reconnecter.');
      }
      throw new Error('Une erreur s\'est produite lors de la récupération des mitaines.');
    }
    return res.json();
  })
  .then(response => {
    console.log(response);
    addMittensToList(response.data);
  })
  .catch(error => {
    console.error('Erreur:', error);
    if (error.message === 'Token invalide ou expiré. Veuillez vous reconnecter.') {
      displayMessage(error.message);
      redirectToLogin();
    } else {
      displayMessage('Erreur lors de la récupération des mitaines. Veuillez vérifier la console.');
    }
  });
};

// Fonction pour créer une nouvelle mitaine basée sur les valeurs saisies dans le formulaire de création
function createMitten() {
  const name = document.getElementById('createName').value;
  const hp = parseInt(document.getElementById('createHp').value, 10);
  const cp = parseInt(document.getElementById('createCp').value, 10);
  const picture = document.getElementById('createPicture').value;
  const selectedTypes = Array.from(document.getElementById('createTypes').selectedOptions).map(option => option.value);

  fetch(`http://68.233.121.181/api/mittens`, {
      method: 'POST',
      headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
          name,
          hp,
          cp,
          picture,
          types: selectedTypes
      })
  })
  .then(response => {
      if (!response.ok) {
          return response.json().then(errorData => {
              let errorMessage = 'Problème lors de la création de la mitaine.';
              if (errorData.errors) {
                  errorMessage = errorData.errors.map(error => error.message).join(', ');
              } else if (errorData.message) {
                  errorMessage = errorData.message;
              }
              throw new Error(errorMessage);
          });
      }
      return response.json();
  })
  .then(data => {
      console.log(data.message);
      alert(data.message);
      document.getElementById('createModal').style.display = "none";
      fetchMittensList(); // Si vous avez une fonction pour rafraîchir la liste des mitaines
  })
  .catch(error => {
      console.error('Erreur lors de la création:', error);
      alert(error.message); // Afficher l'erreur à l'utilisateur
  });
}

function submitMittenEdit(mittenId) {
  const token = localStorage.getItem('token');
  const editedName = document.getElementById('editName').value;
  const editedHp = document.getElementById('editHp').value;
  const editedCp = document.getElementById('editCp').value;
  const editedPicture = document.getElementById('editPicture').value;
  const selectedTypes = Array.from(document.getElementById('editTypes').selectedOptions).map(option => option.value);

  fetch(`http://68.233.121.181/api/mittens/${mittenId}`, {
      method: "PUT",
      headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
          name: editedName,
          hp: parseInt(editedHp, 10),
          cp: parseInt(editedCp, 10),
          picture: editedPicture,
          types: selectedTypes
      })
  })
  .then(response => {
      if (!response.ok) {
          return response.json().then(errorData => {
              const errorMessage = errorData.message || 'Problème lors de la modification de la mitaine.';
              throw new Error(errorMessage);
          });
      }
      return response.json();
  })
  .then(data => {
      alert('Mitaine modifiée avec succès.'); // Utilisation d'une alerte pour afficher le succès
      document.getElementById('editModal').style.display = "none"; // Ferme le modal de modification
      fetchMittensList(); // Rafraîchit la liste des mitaines
  })
  .catch(error => {
      console.error('Erreur lors de la modification:', error);
      alert(`Erreur lors de la modification : ${error.message}`); // Utilisation d'une alerte pour les erreurs
  });
}



// Fonction pour rediriger vers la page de login
function redirectToLogin() {
  window.location.href = 'login.html';
}

// Charger initialement la liste des mitaines
window.onload = () => {
  const username = localStorage.getItem('username'); // Récupère le nom d'utilisateur stocké
  const usernameDisplay = document.getElementById('usernameDisplay');
  if (username) {
    usernameDisplay.textContent = `Sadit ${username} !`; // Met à jour le texte avec le nom de l'utilisateur
  }

  fetchMittensList(); // Fonction existante pour charger la liste des mitaines
};


// Gestion de la déconnexion
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = 'login.html';
});

// Ouvrir le modal de création
document.getElementById('createMittenBtn').addEventListener('click', () => {
  document.getElementById('createModal').style.display = "block";
});

// Fermer le modal de création
document.getElementsByClassName('closeCreate')[0].addEventListener('click', () => {
  document.getElementById('createModal').style.display = "none";
});

// Fermer le modal si l'utilisateur clique en dehors de celui-ci
window.addEventListener('click', (event) => {
  if (event.target === document.getElementById('createModal')) {
    document.getElementById('createModal').style.display = "none";
  }
});

// Fermer le modal de modification avec la croix
document.getElementsByClassName('closeEdit')[0].addEventListener('click', () => {
  document.getElementById('editModal').style.display = "none";
});

// Fermer le modal de modification en cliquant en dehors de celui-ci
window.addEventListener('click', (event) => {
  if (event.target === document.getElementById('editModal')) {
    document.getElementById('editModal').style.display = "none";
  }
});


// Attacher la fonction de création de mitaine à l'événement de clic
document.getElementById('saveCreate').addEventListener('click', createMitten);

document.getElementById('saveEdit').addEventListener('click', () => {
  const mittenId = document.getElementById('saveEdit').getAttribute('data-mitten-id'); // Assure-toi que l'ID est bien stocké quelque part
  submitMittenEdit(mittenId);
});

document.addEventListener('DOMContentLoaded', function() {
  const deleteButton = document.getElementById('deleteMittenBtn');
  if (deleteButton) {
      deleteButton.addEventListener('click', function() {
          const mittenId = document.getElementById('saveEdit').getAttribute('data-mitten-id');
          if (confirm('Êtes-vous sûr de vouloir supprimer cette mitaine ? Cette action est irréversible.')) {
              deleteMitten(mittenId);
          }
      });
  }
});

function deleteMitten(mittenId) {
  const token = localStorage.getItem('token');
  fetch(`http://68.233.121.181/api/mittens/${mittenId}`, {
      method: 'DELETE',
      headers: {
          "Authorization": `Bearer ${token}`
      }
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Problème lors de la suppression de la mitaine');
      }
      return response.json();
  })
  .then(data => {
      alert(data.message); // Affichage d'une alerte pour l'utilisateur
      document.getElementById('editModal').style.display = "none"; // Ferme le modal de modification
      fetchMittensList(); // Rafraîchit la liste des mitaines
  })
  .catch(error => {
      console.error('Erreur lors de la suppression:', error);
      alert(`Erreur lors de la suppression : ${error.message}`); // Affiche une alerte en cas d'erreur
  });
}

