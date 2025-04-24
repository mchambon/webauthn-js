// icon.js

// Crée un bouton ou icône pour déclencher l'authentification
const passkeyIcon = document.createElement('button');
passkeyIcon.textContent = '🔐';  // Utilise une icône simple ou une image
passkeyIcon.style.fontSize = '20px';
passkeyIcon.style.position = 'absolute';
passkeyIcon.style.right = '10px';  // Positionne l'icône à droite de l'input
passkeyIcon.style.top = '50%';
passkeyIcon.style.transform = 'translateY(-50%)';
passkeyIcon.style.backgroundColor = 'transparent';
passkeyIcon.style.border = 'none';
passkeyIcon.style.cursor = 'pointer';

// Fonction pour insérer l'icône dans le champ
function insertPasskeyIcon() {
  const inputField = document.querySelector('input[autocomplete="username webauthn"], input[placeholder="Username or email"]');

  if (inputField && !inputField.parentNode.querySelector('button[data-passkey-icon]')) {
    inputField.style.position = 'relative'; // Nécessaire pour positionner l'icône correctement
    passkeyIcon.setAttribute('data-passkey-icon', 'true'); // Marquer l'icône comme ajoutée
    inputField.parentNode.appendChild(passkeyIcon);

    // Lorsque l'utilisateur clique sur l'icône, effectuer l'authentification
    passkeyIcon.addEventListener('click', () => {
      console.log("Selecting passkey for authentication...");
      navigator.credentials.get({ publicKey: { challenge: new Uint8Array(16) } })
        .then(credential => {
          console.log('Authenticated with passkey:', credential);
        })
        .catch(error => {
          console.error('Authentication failed:', error);
        });
    });
  }
}

// Attendre que la page soit complètement chargée ou utiliser un MutationObserver
window.addEventListener('load', insertPasskeyIcon); // Au cas où le contenu est chargé au moment du "load"

// Si la page change dynamiquement, utiliser MutationObserver pour écouter les ajouts dans le DOM
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      insertPasskeyIcon();
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });