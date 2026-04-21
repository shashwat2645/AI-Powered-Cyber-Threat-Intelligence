const analysisService = require('../services/analysisService');

const getAllAnalyses = async (req, res, next) => {
  try {
    const analyses = await analysisService.getAllAnalyses();
    res.json(analyses);
  } catch (error) {
    next(error);
  }
};

const analyzeIndicator = async (req, res, next) => {
  try {
    const result = await analysisService.analyzeIndicator(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAnalyses,
  analyzeIndicator
};