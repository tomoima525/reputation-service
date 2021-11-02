import { connect, disconnect, getState } from "@interrep/db"
import config from "src/config"
import logger from "./logger"

export async function dbConnect() {
    if (getState() !== 0) {
        return
    }

    const { MONGO_URL } = config

    if (!MONGO_URL) {
        throw new Error("Please define the MONGO_URL environment variable inside .env")
    }

    await connect(MONGO_URL, (error) => {
        logger.error("Database connection error:", error)
    }).catch((error) => logger.error(error))

    logger.info("🗄️ Connected to database")
}

export async function dbDisconnect() {
    if (getState() !== 1) {
        return
    }

    await disconnect()
}
