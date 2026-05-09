require("dotenv").config();

/**
 * Gateway configuration:
 * - SERVER_PORT: cổng api gateway, request user bắn vào đây
 * - JWT_SECRET: phải khớp với IdentifyService
 * - CDN_TARGET: optional static file proxy target (MMS style).
 * - Service map keys: must match /api/{KEY}/... in request path.
 */
module.exports = {
  SERVER_PORT: Number(process.env.GATEWAY_PORT || 8080),
  JWT_SECRET: process.env.JWT_SECRET || "smart_pos_super_secret_2026_very_secure_key_123456",
  CDN_TARGET: process.env.CDN_TARGET || "http://localhost:3901",

  // Cổng service C# theo launchSettings hiện tại trong project Smart-POS
  IDENTITY: process.env.IDENTITY_URL || "http://localhost:5189",
  CATALOG: process.env.CATALOG_URL || "http://localhost:5103",
  ORDER: process.env.ORDER_URL || "http://localhost:5167",
  NOTIFICATION: process.env.NOTIFICATION || "http://localhost:5104",
};
