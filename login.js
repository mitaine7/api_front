const handleLogin = () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch("http://68.233.121.181/api/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: { "Content-type": "application/json" }
    })
    .then((res) => res.json())
    .then((res) => {
        if (res.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('username', username);
            window.location.href = 'index.html';
        } else {
            displayMessage('Connexion échouée. Veuillez vérifier vos identifiants.');
        }
    })
    .catch((error) => {
        console.error('Erreur de connexion:', error);
        displayMessage('Erreur de connexion. Veuillez vérifier la console.');
    });
};

const handleRegister = () => {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    const modal = document.getElementById('verifyCodeModal');
    modal.style.display = "block";

    const span = document.getElementsByClassName("close")[0];
    span.onclick = function() {
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    document.getElementById('verifyCodeBtn').onclick = function() {
        const code = document.getElementById('verificationCode').value;

        fetch('http://68.233.121.181/api/verifyCode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                fetch('http://68.233.121.181/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password, token: data.token })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.data) {
                        document.getElementById('registerMessage').textContent = 'Compte créé avec succès';
                        modal.style.display = "none";
                        document.getElementById('registerSection').classList.add('hidden');
                        document.getElementById('loginSection').classList.remove('hidden');
                    } else {
                        document.getElementById('verifyMessage').textContent = data.message;
                    }
                })
                .catch(error => {
                    document.getElementById('verifyMessage').textContent = 'Erreur lors de la création du compte';
                    console.error('Erreur:', error);
                });
            } else {
                document.getElementById('verifyMessage').textContent = 'Code de vérification incorrect';
            }
        })
        .catch(error => {
            document.getElementById('verifyMessage').textContent = 'Erreur lors de la vérification du code';
            console.error('Erreur:', error);
        });
    };
};


const displayMessage = (message) => {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.classList.remove('hidden');
    messageDiv.classList.add('transition', 'ease-in-out', 'duration-300');
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 3000);
};

document.getElementById('loginBtn').addEventListener('click', handleLogin);
document.getElementById('showRegisterFormBtn').addEventListener('click', () => {
    document.getElementById('registerSection').classList.remove('hidden');
    document.getElementById('loginSection').classList.add('hidden');
});
document.getElementById('registerBtn').addEventListener('click', handleRegister);
document.getElementById('backToLoginBtn').addEventListener('click', () => {
    document.getElementById('registerSection').classList.add('hidden');
    document.getElementById('loginSection').classList.remove('hidden');
});
