import mongoose from "mongoose";

import { ENV } from "./env.js";

const DNS_FAILURE_CODES = new Set(["ESERVFAIL", "ENODATA", "ENOTFOUND"]);
const DEFAULT_OPTIONS = { serverSelectionTimeoutMS: 10_000 };

const extractErrorCode = (error) => {
  if (!error || typeof error !== "object") return undefined;
  if (error.code) return error.code;
  return extractErrorCode(error.cause || error.reason);
};

const buildDirectMongoUri = (srvUri) => {
  const srvUrl = new URL(srvUri);
  const params = srvUrl.searchParams;
  if (!params.has("tls")) params.set("tls", "true");
  if (!params.has("retryWrites")) params.set("retryWrites", "true");
  if (!params.has("w")) params.set("w", "majority");

  const hasUsername = Boolean(srvUrl.username);
  const username = hasUsername ? encodeURIComponent(srvUrl.username) : "";
  const password = srvUrl.password ? `:${encodeURIComponent(srvUrl.password)}` : "";
  const credentials = hasUsername ? `${username}${password}@` : "";
  const path = srvUrl.pathname === "/" ? "/" : srvUrl.pathname;
  const query = params.toString();
  const queryPart = query ? `?${query}` : "";
  return `mongodb://${credentials}${srvUrl.host}${path}${queryPart}`;
};

const shouldRetryWithDirectUri = (error, uri) =>
  typeof uri === "string" &&
  uri.startsWith("mongodb+srv://") &&
  DNS_FAILURE_CODES.has(extractErrorCode(error));

const connectWithUri = async (uri, options, label) => {
  const connection = await mongoose.connect(uri, options);
  console.log(`✅ Connected to MongoDB${label ? ` (${label})` : ""}:`, connection.connection.host);
};

export const connectDB = async () => {
  if (!ENV.DB_URL) {
    throw new Error("DB_URL is not defined in environment variables");
  }

  try {
    await connectWithUri(ENV.DB_URL, DEFAULT_OPTIONS);
  } catch (error) {
    if (shouldRetryWithDirectUri(error, ENV.DB_URL)) {
      const fallbackUri = buildDirectMongoUri(ENV.DB_URL);
      console.warn("⚠️ DNS SRV lookup failed, retrying MongoDB connection with a direct seed host URI.");
      try {
        await connectWithUri(fallbackUri, { ...DEFAULT_OPTIONS, tls: true, ssl: true }, "fallback");
        return;
      } catch (fallbackError) {
        console.error("❌ MongoDB fallback connection failed", fallbackError);
      }
    }

    console.error("❌ Error connecting to MongoDB", error);
    process.exit(1); // 0 means success, 1 means failure
  }
};
