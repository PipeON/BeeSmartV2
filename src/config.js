require('dotenv').config();

module.exports = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
ton: {
    apiUrl: process.env.TON_API_URL,
    privateKey: process.env.TON_WALLET_PRIVATE_KEY,
    publicAddress: process.env.TON_WALLET_PUBLIC_ADDRESS,
  },
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
 },
gameSettings: {
    dailyReward: {
      free: 2,
      standard: 4,
      gold: 6,
    },
    lifespan: {
      free: 50,
      standard: 100,
      gold: 120,
    },
    gotperli: 100,
    tonperli: 1,
    minwit: 1,
    maxBeesPerColony: {
      free: 1,
      basica: { standard: 10 },
      estandar: { standard: 15 },
      oro: { gold: 20 },
      diamante: { gold: 25 },
      rubi: { gold: 30 },
    },
    maxColonies: 6,
    colonyCost: {
      basica: 0.38,
      estandar: 8,
      oro: 15,
      diamante: 20,
      rubi: 25,
    },
    beeCosts: {
      standard: 0.38,
      gold: 5,
    },
  },
};
