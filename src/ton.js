const axios = require("axios");
const { ton } = require("./config");

async function verifyTONTransaction(txid, expectedAmountTON, telegramId) {
    try {
        console.log(`📌 Verificando transacción en TON API...`);
        console.log(`🔹 TXID ingresado: ${txid}`);

        // URL de consulta a TON API
        const url = `https://tonapi.io/v2/blockchain/transactions/${txid}`;
        console.log(`🔹 URL de consulta: ${url}`);

        // Petición HTTP a la API
        const response = await axios.get(url);
        const transaction = response.data;

        // Validar si la respuesta contiene datos
        if (!transaction || !transaction.in_msg || !transaction.in_msg.destination) {
            console.log("❌ No se encontró información válida en TON API.");
            return false;
        }

        // ✅ Extraer datos correctos
        let txAmountNano = parseInt(transaction.in_msg.value) || 0; // Monto en NanoTON
        let txAmountTON = txAmountNano / 1e9; // Convertir a TON
        const txDestination = transaction.in_msg.destination.address || "No encontrado";

        // ✅ Corrección: expectedAmount en NanoTON sin errores
        const expectedAmountNano = expectedAmountTON * 1e9; // Ahora correcto

        // ✅ Corrección: Convertir expectedAddress a formato correcto (RAW HEX)
        const expectedAddressHex = ton.publicAddress.startsWith("0:")
            ? ton.publicAddress
            : `0:${Buffer.from(ton.publicAddress, "base64").toString("hex").slice(0, 64)}`; // Solo los primeros 64 caracteres HEX

        console.log("🔍 Datos de la transacción obtenidos:", {
            txHash: txid,
            txAmountNano,
            txAmountTON,
            txDestination,
            expectedAmountNano,
            expectedAmountTON,
            expectedAddress: expectedAddressHex
        });

        // ✅ Comparación correcta
        if (txDestination === expectedAddressHex && txAmountNano === expectedAmountNano) {
            console.log("✅ ¡Transacción válida!");
            return true;
        } else {
            console.log("❌ La transacción no coincide con los datos esperados.");
            return false;
        }
    } catch (error) {
        console.error("❌ Error verificando transacción en TON API:", error.message);
        return false;
    }
}

module.exports = { verifyTONTransaction };
