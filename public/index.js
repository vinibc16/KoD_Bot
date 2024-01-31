document.addEventListener('DOMContentLoaded', function () {
    var menuToggle = document.getElementById('menu-toggle');
    var menu = document.querySelector('.menu');
    var connectWalletButton = document.getElementById('connect-wallet');
    menuToggle === null || menuToggle === void 0 ? void 0 : menuToggle.addEventListener('click', function () {
        menu === null || menu === void 0 ? void 0 : menu.classList.toggle('open');
    });
    connectWalletButton === null || connectWalletButton === void 0 ? void 0 : connectWalletButton.addEventListener('click', function () {
        // Adicione aqui a lógica para conectar à Wallet Compass
        alert('Conectando à Wallet Compass...');
    });
});
