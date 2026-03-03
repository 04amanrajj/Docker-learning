const mongoose = require("mongoose");
const { MenuModel } = require("./models/menu.model");
const menuData = require("./resources/menu.json");
require("dotenv").config();

async function seedDatabase() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/restaurent";
  
  console.log(`🌱 [Database Seeding] Connecting to MongoDB: ${mongoUri}`);
  try {
    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB for seeding.");

    const count = await MenuModel.countDocuments();
    if (count > 0) {
      console.log(`ℹ [Database Seeding] Collection already contains ${count} items. Skipping seed.`);
      await mongoose.disconnect();
      return;
    }

    console.log("🌱 [Database Seeding] Collection empty. Seeding menu data...");

    // Flatten all category arrays from menu.json
    const allItems = [];
    for (const category in menuData) {
      const items = menuData[category];
      for (const item of items) {
        // Ensure all required fields are set correctly
        allItems.push({
          name: item.name,
          description: item.description || "Fresh and healthy restaurant item.",
          price: item.price,
          available: item.available !== undefined ? item.available : true,
          rating: item.rating || 4.5,
          category: item.category || category,
          image: item.image || "https://i.pinimg.com/736x/1d/f6/36/1df6362c66dd293cc90ef0ede65b3818.jpg"
        });
      }
    }

    const inserted = await MenuModel.insertMany(allItems);
    console.log(`✓ [Database Seeding] Successfully seeded ${inserted.length} menu items into database!`);

  } catch (error) {
    console.error(`❌ [Database Seeding] Seeding Failed: ${error.message}`);
  } finally {
    await mongoose.disconnect();
    console.log("🌱 [Database Seeding] Disconnected from MongoDB.");
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
