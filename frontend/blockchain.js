// blockchain.js - Integración con Monad

let provider = null;
let signer = null;
let contract = null;
let userAddress = null;

// Configuración de Monad Testnet
const MONAD_CONFIG = {
    chainId: '0x279F', // 10143 en hex
    chainName: 'Monad Testnet',
    nativeCurrency: {
        name: 'MON',
        symbol: 'MON',
        decimals: 18
    },
    rpcUrls: ['https://testnet-rpc.monad.xyz'],
    blockExplorerUrls: ['https://testnet.monadexplorer.com']
};

// Dirección del contrato (actualizaremos después de deployar)
const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Placeholder

// ABI del contrato
const CONTRACT_ABI = [
    "function requestRide(string memory destination) external payable",
    "function completeRide(address driver, address passenger) external",
    "function getDriverEarnings(address driver) external view returns (uint256)",
    "event RideRequested(address indexed passenger, string destination, uint256 fare)",
    "event RideCompleted(address indexed driver, address indexed passenger, uint256 fare)"
];

// Conectar wallet
async function connectWallet() {
    try {
        if (typeof window.ethereum === 'undefined') {
            alert('Por favor instala MetaMask para usar esta DApp');
            window.open('https://metamask.io/download/', '_blank');
            return;
        }

        // Solicitar acceso a la cuenta
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        userAddress = accounts[0];

        // Crear provider y signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();

        // Verificar red
        const network = await provider.getNetwork();
        
        if (network.chainId !== 10143) {
            // Intentar cambiar a Monad
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: MONAD_CONFIG.chainId }]
                });
            } catch (switchError) {
                // Si la red no está agregada, agregarla
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [MONAD_CONFIG]
                    });
                }
            }
        }

        // Obtener balance
        const balance = await provider.getBalance(userAddress);
        const balanceInMON = ethers.utils.formatEther(balance);

        // Actualizar UI
        document.getElementById('connectBtn').textContent = '✅ Conectado';
        document.getElementById('connectBtn').disabled = true;
        document.getElementById('walletInfo').style.display = 'block';
        document.getElementById('balance').textContent = parseFloat(balanceInMON).toFixed(4);
        document.getElementById('address').textContent = 
            userAddress.slice(0, 6) + '...' + userAddress.slice(-4);

        // Inicializar contrato (si está deployado)
        if (CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000') {
            contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        }

        notifications.success('Wallet conectada', `Conectado a Monad Testnet`);
        eventLogger.log(`🔗 Wallet conectada: ${userAddress.slice(0, 6)}...`, 'success');

        return true;

    } catch (error) {
        console.error('Error conectando wallet:', error);
        notifications.warning('Error', 'No se pudo conectar la wallet');
        return false;
    }
}

// Simular pago de viaje (sin contrato por ahora)
async function payForRide(fare, driverAddress = null) {
    if (!signer) {
        notifications.warning('Wallet no conectada', 'Conecta tu wallet primero');
        return false;
    }

    try {
        // Convertir fare a Wei
        const fareInWei = ethers.utils.parseEther((fare / 100).toString()); // Convertir "centavos" a MON

        notifications.info('💳 Procesando pago', `${fare / 100} MON`);

        // Por ahora, solo simulamos el pago
        // Cuando tengamos el contrato, descomentar esto:
        /*
        const tx = await contract.requestRide("destination", {
            value: fareInWei
        });
        await tx.wait();
        */

        // Simulación de espera
        await new Promise(resolve => setTimeout(resolve, 2000));

        notifications.success('✅ Pago completado', `${fare / 100} MON transferidos`);
        eventLogger.log(`💰 Pago procesado: ${fare / 100} MON`, 'success');

        return true;

    } catch (error) {
        console.error('Error procesando pago:', error);
        notifications.warning('Error en pago', 'Transacción fallida');
        return false;
    }
}

// Escuchar cambios de cuenta
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            // Usuario desconectó
            userAddress = null;
            document.getElementById('connectBtn').textContent = '🔗 Conectar Wallet';
            document.getElementById('connectBtn').disabled = false;
            document.getElementById('walletInfo').style.display = 'none';
            notifications.info('Wallet desconectada', 'Reconecta para continuar');
        } else {
            // Cuenta cambió
            window.location.reload();
        }
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}