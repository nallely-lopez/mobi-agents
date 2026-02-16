// blockchain.js - Integración con Monad

let provider = null;
let signer = null;
let userAddress = null;

// Configuración de Monad Testnet
const MONAD_CONFIG = {
    chainId: '0x279F',
    chainName: 'Monad Testnet',
    nativeCurrency: {
        name: 'MON',
        symbol: 'MON',
        decimals: 18
    },
    rpcUrls: ['https://testnet-rpc.monad.xyz'],
    blockExplorerUrls: ['https://testnet.monadexplorer.com']
};

// Conectar wallet
async function connectWallet() {
    try {
        // Verificar que existe MetaMask
        if (typeof window.ethereum === 'undefined') {
            alert('⚠️ Por favor instala MetaMask para conectar tu wallet\n\nVe a: https://metamask.io/download/');
            window.open('https://metamask.io/download/', '_blank');
            return false;
        }

        console.log('Conectando wallet...');
        
        // Solicitar acceso a las cuentas
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        userAddress = accounts[0];
        console.log('Cuenta conectada:', userAddress);

        // Crear provider con ethers.js
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();

        // Verificar la red actual
        const network = await provider.getNetwork();
        console.log('Red actual:', network.chainId);

        // Si no es Monad Testnet, intentar cambiar
        if (network.chainId !== 10143) {
            console.log('Cambiando a Monad Testnet...');
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: MONAD_CONFIG.chainId }]
                });
            } catch (switchError) {
                // Si la red no existe, agregarla
                if (switchError.code === 4902) {
                    console.log('Agregando Monad Testnet...');
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [MONAD_CONFIG]
                    });
                } else {
                    throw switchError;
                }
            }
        }

        // Obtener balance después de cambiar de red
        const balance = await provider.getBalance(userAddress);
        const balanceInMON = ethers.utils.formatEther(balance);
        console.log('Balance:', balanceInMON, 'MON');

        // Actualizar UI
        const connectBtn = document.getElementById('connectBtn');
        const walletInfo = document.getElementById('walletInfo');
        const balanceSpan = document.getElementById('balance');
        const addressSpan = document.getElementById('address');

        if (connectBtn) {
            connectBtn.textContent = '✅ Conectado';
            connectBtn.disabled = true;
            connectBtn.style.opacity = '0.7';
        }

        if (walletInfo) walletInfo.style.display = 'block';
        if (balanceSpan) balanceSpan.textContent = parseFloat(balanceInMON).toFixed(4);
        if (addressSpan) addressSpan.textContent = userAddress.slice(0, 6) + '...' + userAddress.slice(-4);

        // Notificaciones
        if (typeof notifications !== 'undefined') {
            notifications.success('🔗 Wallet conectada', `Balance: ${parseFloat(balanceInMON).toFixed(4)} MON`);
        }

        if (typeof eventLogger !== 'undefined') {
            eventLogger.log(`🔗 Wallet conectada: ${userAddress.slice(0, 8)}...`, 'success');
        }

        return true;

    } catch (error) {
        console.error('Error conectando wallet:', error);
        
        let errorMsg = 'No se pudo conectar la wallet';
        
        if (error.code === 4001) {
            errorMsg = 'Conexión rechazada por el usuario';
        } else if (error.code === -32002) {
            errorMsg = 'Ya hay una solicitud pendiente en MetaMask';
        }

        alert('❌ ' + errorMsg + '\n\nIntenta de nuevo.');

        if (typeof notifications !== 'undefined') {
            notifications.warning('Error', errorMsg);
        }

        return false;
    }
}

// Escuchar cambios de cuenta
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            console.log('Wallet desconectada');
            userAddress = null;
            
            const connectBtn = document.getElementById('connectBtn');
            const walletInfo = document.getElementById('walletInfo');
            
            if (connectBtn) {
                connectBtn.textContent = '🔗 Conectar Wallet';
                connectBtn.disabled = false;
                connectBtn.style.opacity = '1';
            }
            
            if (walletInfo) walletInfo.style.display = 'none';
            
            if (typeof notifications !== 'undefined') {
                notifications.info('Wallet desconectada', 'Reconecta para continuar');
            }
        } else {
            // Cuenta cambió, recargar
            console.log('Cuenta cambió, recargando...');
            window.location.reload();
        }
    });

    window.ethereum.on('chainChanged', () => {
        console.log('Red cambió, recargando...');
        window.location.reload();
    });
}

// Función para procesar pagos (simulada por ahora)
async function processPayment(amount) {
    if (!signer) {
        alert('⚠️ Conecta tu wallet primero');
        return false;
    }

    try {
        console.log(`Procesando pago de ${amount} MON...`);
        
        // Por ahora solo simular
        // Cuando tengamos smart contract, aquí iría la transacción real
        
        if (typeof notifications !== 'undefined') {
            notifications.info('💳 Pago procesado', `${amount} MON transferidos`);
        }

        return true;
    } catch (error) {
        console.error('Error procesando pago:', error);
        return false;
    }
}

console.log('✅ Blockchain.js cargado correctamente');