const mysql = require('mysql2/promise');

let connection;

async function connectDB() {
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });

    console.log('📦 Conexión a MySQL exitosa');

    // Manejar desconexión y reconexión
    connection.on('error', async (err) => {
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('⚠️ Conexión perdida con MySQL, intentando reconectar...');
        await connectDB();
      } else {
        throw err;
      }
    });

    return connection;
  } catch (error) {
    console.error('❌ Error al conectar a MySQL:', error.message);
    throw error;
  }
}

async function query(sql, params = []) {
  try {
    // Verificar si la conexión está cerrada y volver a conectarse si es necesario
    if (!connection || connection.connection.state === 'disconnected') {
      console.warn('🔄 Reconectando a MySQL...');
      await connectDB();
    }
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    console.error('❌ Error en la consulta SQL:', error);
    throw error;
  }
}

// 📌 Crear tabla de transacciones si no existe
async function createTransactionsTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        txid VARCHAR(255) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        type ENUM('bee', 'colony') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabla 'transactions' verificada o creada.");
  } catch (error) {
    console.error("❌ Error al crear la tabla 'transactions':", error);
  }
}

// Llamar a la función al iniciar el servidor

createTransactionsTable();



module.exports = { connectDB, query  };
