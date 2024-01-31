document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const menu = document.querySelector('.menu');
    const connectWalletButton = document.getElementById('connect-wallet');

    menuToggle?.addEventListener('click', () => {
        menu?.classList.toggle('open');
    });

    connectWalletButton?.addEventListener('click', () => {
        // Adicione aqui a lógica para conectar à Wallet Compass
        alert('Conectando à Wallet Compass...');
    });
});

export {}
