const information = require("../resources/config.json");

const express = require("express");
const Router = require("express");
const { logger } = require("../middlewares/userLogger.middleware");
const { client } = require("../configs/redis");
const mongoose = require("mongoose");

const defaultRoute = Router();
defaultRoute.use(express.json());

defaultRoute.get("/", async (req, res) => {
  try {
    res.send({ data: information });
  } catch (error) {
    logger.error(`Error showing info: ${error.message}`);
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
});

defaultRoute.get("/health", async (req, res) => {
  try {
    const mongoStatus = mongoose.connection.readyState === 1 ? "healthy" : "unhealthy";
    let redisStatus = "unhealthy";
    try {
      const pingRes = await client.ping();
      if (pingRes === "PONG") {
        redisStatus = "healthy";
      }
    } catch (e) {
      // Redis offline or connecting
    }

    const isHealthy = mongoStatus === "healthy" && redisStatus === "healthy";
    res.status(isHealthy ? 200 : 500).send({
      status: isHealthy ? "UP" : "DOWN",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoStatus,
        redis: redisStatus
      }
    });
  } catch (error) {
    logger.error(`Healthcheck failed: ${error.message}`);
    res.status(500).send({ status: "ERROR", message: error.message });
  }
});

defaultRoute.get("/cache-metrics", async (req, res) => {
  try {
    const isConnected = client.isOpen;
    if (!isConnected) {
      return res.status(503).send({ success: false, message: "Redis client disconnected" });
    }

    const keys = await client.keys("menuitems:*");
    const rawInfo = await client.info();
    
    // Parse Redis memory info
    const lines = rawInfo.split("\r\n");
    const memorySection = {};
    lines.forEach(line => {
      if (line.includes("used_memory") || line.includes("instantaneous_ops") || line.includes("connected_clients")) {
        const parts = line.split(":");
        memorySection[parts[0]] = parts[1];
      }
    });

    res.status(200).send({
      success: true,
      timestamp: new Date().toISOString(),
      cachingEngine: "Redis Cache Gateway",
      metrics: {
        activeKeysCount: keys.length,
        activeCachedKeys: keys,
        redisStats: memorySection
      }
    });
  } catch (error) {
    logger.error(`Cache metrics error: ${error.message}`);
    res.status(500).send({ success: false, message: error.message });
  }
});

module.exports = { defaultRoute };


