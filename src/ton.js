const axios = require("axios");
const { ton } = require("./config"); // Asegúrate de tener tu configuración de TON (API Key, baseURL, etc.)
const Buffer = require('buffer').Buffer; // Importamos Buffer para la correcta comparación de la wallet

// ✅ Función para limpiar la dirección (elimina el prefijo "0:" de la dirección)
function cleanTONAddress(address) {
    if (!address) return "";
    return address.replace(/^0:/, "");  // Elimina el "0:" que podría aparecer en algunas wallets
}

// ✅ Función para convertir la wallet a un formato consistente para la comparación
function convertWalletToStandardFormat(wallet) {
    const cleanWallet = cleanTONAddress(wallet);  // Limpiamos la wallet
    return cleanWallet.toLowerCase();  // Aseguramos que esté en minúsculas para la comparación
}

// ✅ Función para obtener los detalles de la transacción desde la API de TON
async function getTONTransaction(txid) {
    try {
        const response = await axios.get(`https://tonapi.io/v2/blockchain/transactions/${txid}`); 
        return response.data; 
    } catch (error) {
        console.error("❌ Error al obtener la transacción de la API de TON:", error.response?.data || error.message);
        return null; // Si hay un error, devolvemos null
    }
}

// ✅ Función para verificar la transacción de TON
async function verifyTONTransaction(txid, totalCost, senderWallet, userId) {
    try {
        // 🔹 Obtener los detalles de la transacción desde la API de TON
        const transaction = await getTONTransaction(txid);
        if (!transaction || !transaction.success) {
            console.error("❌ Transacción no encontrada o fallida.");
            return false;  // Si no se encuentra la transacción o es fallida, retornamos falso
        }

        // ✅ Verificar que la transacción tiene los mensajes de salida
        if (!transaction.out_msgs || transaction.out_msgs.length === 0) {
            console.error("❌ La transacción no tiene salidas (out_msgs).");
            return false;
        }

        // ✅ Extraer el monto de la transacción en nanoTON
        const txAmountNano = parseInt(transaction.out_msgs[0].value, 10);  // Aseguramos que sea un número entero
        if (txAmountNano !== totalCost) {
            console.error(`❌ El monto de la transacción (${txAmountNano} nanoTON) no coincide con el costo esperado (${totalCost} nanoTON).`);
            return false;  // Verificamos si el monto enviado es el correcto
        }

        // ✅ Limpiar y convertir la wallet de destino de la transacción
        const receiverWallet = cleanTONAddress(transaction.out_msgs[0].destination?.address);
        const expectedReceiverWallet = convertWalletToStandardFormat(ton.publicAddress);  // Convertimos la wallet esperada

        // ✅ Verificamos si las wallets coinciden
        if (receiverWallet !== expectedReceiverWallet) {
            console.error(`❌ Wallet de destino incorrecta. Esperado: ${expectedReceiverWallet}, Recibido: ${receiverWallet}`);
            return false;  // Si las wallets no coinciden, retornamos falso
        }

        // ✅ Validar la wallet de origen
        const senderWalletClean = cleanTONAddress(senderWallet);  // Limpiamos la wallet de origen
        const transactionSenderWallet = cleanTONAddress(transaction.in_msg?.source?.address);  // Obtenemos la wallet de origen de la transacción

        if (transactionSenderWallet !== senderWalletClean) {
            console.error(`❌ Wallet de origen incorrecta. Esperado: ${senderWalletClean}, Recibido: ${transactionSenderWallet}`);
            return false;  // Si las wallets no coinciden, retornamos falso
        }

        console.log("✅ Transacción válida.");
        return true;  // Si todo está correcto, retornamos verdadero
    } catch (error) {
        console.error("❌ Error verificando la transacción:", error.message || error.response?.data);
        return false;  // Si ocurre un error, retornamos falso
    }
}

module.exports = { verifyTONTransaction };
