const information = require("../resources/config.json");

const express = require("express");
const Router = require("express");
const { logger } = require("../middlewares/userLogger.middleware");
const { client } = require("../configs/redis");
const mongoose = require("mongoose");
const os = require("os");

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
      platform: process.platform,
      system: {
        freeMemory: (os.freemem() / 1024 / 1024).toFixed(1) + " MB",
        totalMemory: (os.totalmem() / 1024 / 1024).toFixed(1) + " MB",
        cpuLoad: os.loadavg()
      },
      process: {
        memoryUsage: process.memoryUsage()
      },
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

defaultRoute.get("/metrics", async (req, res) => {
  try {
    let keysCount = 0;
    try {
      if (client.isOpen) {
        const keys = await client.keys("menuitems:*");
        keysCount = keys.length;
      }
    } catch (e) {
      // Redis offline or unreachable
    }

    const memory = process.memoryUsage();
    const loadAvg = os.loadavg();
    const uptime = process.uptime();

    // Generate Prometheus exposition format metrics text
    let prometheusMetrics = "";
    
    prometheusMetrics += `# HELP process_uptime_seconds Uptime of the Express.js API server in seconds.\n`;
    prometheusMetrics += `# TYPE process_uptime_seconds gauge\n`;
    prometheusMetrics += `process_uptime_seconds ${uptime}\n\n`;

    prometheusMetrics += `# HELP process_memory_rss_bytes Resident Set Size memory bytes utilized by the Node.js process.\n`;
    prometheusMetrics += `# TYPE process_memory_rss_bytes gauge\n`;
    prometheusMetrics += `process_memory_rss_bytes ${memory.rss}\n\n`;

    prometheusMetrics += `# HELP process_memory_heap_used_bytes Heap memory bytes currently in use by Node.js runtime.\n`;
    prometheusMetrics += `# TYPE process_memory_heap_used_bytes gauge\n`;
    prometheusMetrics += `process_memory_heap_used_bytes ${memory.heapUsed}\n\n`;

    prometheusMetrics += `# HELP system_cpu_load_ratio Standard 1-minute system CPU load average.\n`;
    prometheusMetrics += `# TYPE system_cpu_load_ratio gauge\n`;
    prometheusMetrics += `system_cpu_load_ratio ${loadAvg[0]}\n\n`;

    prometheusMetrics += `# HELP redis_active_cache_keys_total Total count of menu cache keys currently stored inside Redis.\n`;
    prometheusMetrics += `# TYPE redis_active_cache_keys_total gauge\n`;
    prometheusMetrics += `redis_active_cache_keys_total ${keysCount}\n`;

    res.set("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    res.status(200).send(prometheusMetrics);
  } catch (error) {
    logger.error(`Prometheus metrics generation error: ${error.message}`);
    res.status(500).send(`# ERROR: ${error.message}`);
  }
});

module.exports = { defaultRoute };



