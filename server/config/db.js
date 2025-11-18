const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbURI =
      process.env.NODE_ENV === 'production'
        ? process.env.MONGO_URI_PROD // Use production URI
        : process.env.MONGO_URI_DEV; // Use development URI

    await mongoose.connect(dbURI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`MongoDB connected: ${process.env.NODE_ENV} mode`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
