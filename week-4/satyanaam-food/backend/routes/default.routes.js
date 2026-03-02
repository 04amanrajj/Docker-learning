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

module.exports = { defaultRoute };

