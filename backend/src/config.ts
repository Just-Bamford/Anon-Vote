import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: "8h",
  stellarSecretKey: process.env.STELLAR_SECRET_KEY || "",
  stellarNetwork: process.env.STELLAR_NETWORK || "testnet",
  ballotEncryptionKey: process.env.BALLOT_ENCRYPTION_KEY || "",
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
};
