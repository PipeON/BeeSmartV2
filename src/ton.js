const axios = require("axios");
const { ton } = require("./config");

// ✅ Verificar transacción en TON API
async function verifyTONTransaction(txid, expectedAmount, telegramId) {
    const apiUrl = `https://tonapi.io/v2/blockchain/accounts/${ton.publicAddress}/transactions?limit=50`;

    try {
        const response = await axios.get(apiUrl);
        const transactions = response.data.transactions;

        if (!transactions || transactions.length === 0) {
            console.log("❌ No se encontraron transacciones en TON API.");
            return false;
        }

        console.log("📌 Verificando transacción...");
        console.log("🔹 TXID ingresado:", txid);
        console.log("🔹 Últimas transacciones recibidas:", transactions.map(tx => tx.hash));

        // 🔍 Buscar la transacción correcta
        const validTransaction = transactions.find(tx => {
            const txHash = tx.hash; // ✅ TXID correcto
            const txAmount = parseFloat(tx.in_msg?.value || tx.value || 0) / 1e9; // ✅ Convertir nanoton a TON

            // Buscar dirección de destino correcta
            let txDestination = null;
            if (tx.in_msg?.destination?.account_address) {
                txDestination = tx.in_msg.destination.account_address;
            } else if (tx.account?.address) {
                txDestination = tx.account.address;
            }

            console.log("🔍 Comparando:", {
                txHash,
                txAmount,
                txDestination,
                expectedAmount,
                expectedAddress: ton.publicAddress
            });

            return (
                txHash === txid && // Comparar TXID
                txAmount.toFixed(2) === expectedAmount.toFixed(2) && // Comparar monto
                txDestination === ton.publicAddress // Comparar dirección de destino
            );
        });

        if (validTransaction) {
            console.log("✅ Transacción válida encontrada:", validTransaction);
            return true;
        } else {
            console.log("❌ No se encontró una transacción válida con este TXID.");
            return false;
        }
    } catch (error) {
        console.error("❌ Error verificando transacción TON API:", error.response?.data || error.message);
        return false;
    }
}

module.exports = { verifyTONTransaction };
