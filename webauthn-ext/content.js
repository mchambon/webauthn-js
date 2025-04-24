// content.js

const injectBootstrap = () => {
  console.log('======================Bootstrap');
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('bootstrap.js');
  script.onload = () => {
    console.log('bootstrap.js loaded successfully.');
    //injectScript('utils.js', true); // Charger utils.js en tant que module
    injectScript('icon.js');
    injectScript('register.js', true); // Charger register.js en tant que module
  };
  (document.head || document.documentElement).appendChild(script);
};

const injectScript = (filePath, isModule = false) => {
  console.log('======================Script');
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL(filePath);
  if (isModule) {
    script.type = 'module'; // Déclarer le script comme un module ES6
  }
  script.onload = () => {
    console.log(`Script ${filePath} injected successfully.`);
    script.remove();
  };
  (document.head || document.documentElement).appendChild(script);
};



injectBootstrap();