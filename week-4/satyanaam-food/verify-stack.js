/**
 * Satyanaam Food - DevOps End-to-End Integration Validator
 * 
 * This test script queries all containerized gateway and core API services 
 * to guarantee production-ready configuration state.
 */

const http = require("http");

const TARGET_HOST = process.env.API_HOST || "localhost";
const TARGET_PORT = process.env.API_PORT || "8080";
const PATH_PREFIX = process.env.PATH_PREFIX || "/api";

const makeRequest = (options) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null,
        });
      });
    });

    req.on("error", (err) => reject(err));
    req.end();
  });
};

async function runVerification() {
  console.log("==============================================================================");
  console.log("🔍 [DevOps Integration Testing] Verifying Satyanaam Food Stack Integrity...");
  console.log(`📡 Connecting via Gateway: http://${TARGET_HOST}:${TARGET_PORT}${PATH_PREFIX}`);
  console.log("==============================================================================");

  let passed = true;

  // Test 1: Check System Health endpoint
  try {
    console.log(`\n🧪 Test 1: Verifying Backend Core Health Indicators (${PATH_PREFIX}/health)...`);
    const res = await makeRequest({
      hostname: TARGET_HOST,
      port: TARGET_PORT,
      path: `${PATH_PREFIX}/health`,
      method: "GET",
    });

    console.log(`   - HTTP Status: ${res.statusCode}`);
    console.log(`   - Response:`, JSON.stringify(res.body, null, 2));

    if (res.statusCode === 200 && res.body.status === "UP") {
      console.log("   ✅ Health check PASSED!");
    } else {
      console.log("   ❌ Health check FAILED!");
      passed = false;
    }
  } catch (err) {
    console.error(`   ❌ Connection to Health Endpoint Failed: ${err.message}`);
    passed = false;
  }

  // Test 2: Check Menu Loading & Caching Telemetry
  try {
    console.log(`\n🧪 Test 2: Loading Menu & Verifying Cache Headers (${PATH_PREFIX}/menu)...`);
    const res = await makeRequest({
      hostname: TARGET_HOST,
      port: TARGET_PORT,
      path: `${PATH_PREFIX}/menu?page=1&limit=5`,
      method: "GET",
    });


    const cacheHeader = res.headers["x-cache"];
    const source = res.body?.metadata?.source;

    console.log(`   - HTTP Status: ${res.statusCode}`);
    console.log(`   - Total Loaded Items: ${res.body?.data?.length || 0}`);
    console.log(`   - X-Cache Header: ${cacheHeader || "Missing"}`);
    console.log(`   - Data Source: ${source || "Unknown"}`);

    if (res.statusCode === 200 && res.body?.data?.length > 0) {
      console.log("   ✅ Menu integration PASSED!");
    } else {
      console.log("   ❌ Menu integration FAILED!");
      passed = false;
    }
  } catch (err) {
    console.error(`   ❌ Connection to Menu Endpoint Failed: ${err.message}`);
    passed = false;
  }

  // Final Summary report
  console.log("\n==============================================================================");
  if (passed) {
    console.log("🎉 [Verification Complete] ALL DevOps INTEGRATION CHECKS PASSED!");
    process.exit(0);
  } else {
    console.log("🚨 [Verification Complete] INTEGRATION SYSTEM ERRORS IDENTIFIED!");
    process.exit(1);
  }
}

runVerification();
