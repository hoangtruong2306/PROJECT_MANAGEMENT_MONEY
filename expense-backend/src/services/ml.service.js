const axios = require("axios");

exports.predictNextMonth = async (userId) => {
  const response = await axios.post("http://localhost:8000/predict", {
    userId: userId,
  });

  return response.data;
};
