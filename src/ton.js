// ✅ Función para limpiar la dirección (eliminar "0:" y convertir a minúsculas)
function cleanTONAddress(address) {
    if (!address) return "";
    return address.replace(/^0:/, "").toLowerCase(); // 🔹 Elimina el prefijo "0:" y convierte a minúsculas
}

// ✅ Función para convertir Base64 a dirección HEX (SIN caracteres extra)
function convertBase64ToTONAddress(base64Address) {
    try {
        const buffer = Buffer.from(base64Address, "base64");
        const hexAddress = buffer.toString("hex").toLowerCase();

        // 🔹 Extraer solo los 64 caracteres de la dirección (evita caracteres extra)
        return `0:${hexAddress.slice(-64)}`; // ✅ Agregar "0:" al inicio
    } catch (error) {
        console.error("❌ Error convirtiendo dirección Base64 a TON:", error.message);
        return "";
    }
}

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

        // ✅ Corregimos la dirección esperada (SIN caracteres extra)
        let expectedAddressTON = cleanTONAddress(ton.publicAddress);
        console.log("🔹 Dirección esperada (TON):", expectedAddressTON);

        // 🔍 Buscar la transacción correcta
        const validTransaction = transactions.find(tx => {
            const txHash = tx.hash;
            const txAmount = parseInt(tx.in_msg?.value || tx.value || 0, 10);

            // 🔹 Normalizar dirección destino
            let txDestinationRaw = tx.in_msg?.destination?.account_address || tx.account?.address || "";
            let txDestination = cleanTONAddress(txDestinationRaw); // ✅ Limpiar dirección

            console.log("🔍 Comparando:", {
                txHash,
                txAmount,
                txDestinationRaw,  // 🔹 Dirección antes de limpiar
                txDestination,      // 🔹 Dirección después de limpiar
                expectedAmount,     // 🔹 Monto esperado
                expectedAddressTON  // 🔹 Dirección esperada en formato correcto
            });

            return (
                txHash === txid &&             // ✅ TXID debe coincidir
                txAmount === expectedAmount && // ✅ Monto en nanoTON debe coincidir
                txDestination === expectedAddressTON // ✅ Dirección debe coincidir con el formato correcto
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
