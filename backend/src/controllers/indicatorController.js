const indicatorService = require('../services/indicatorService');

const getAllIndicators = async (req, res, next) => {
  try {
    const indicators = await indicatorService.getAllIndicators();
    res.json(indicators);
  } catch (error) {
    next(error);
  }
};

const getIndicatorById = async (req, res, next) => {
  try {
    const indicator = await indicatorService.getIndicatorById(req.params.id);
    if (!indicator) {
      return res.status(404).json({ error: 'Indicator not found' });
    }
    res.json(indicator);
  } catch (error) {
    next(error);
  }
};

const createIndicator = async (req, res, next) => {
  try {
    const indicator = await indicatorService.createIndicator(req.body);
    res.status(201).json(indicator);
  } catch (error) {
    next(error);
  }
};

const deleteIndicator = async (req, res, next) => {
  try {
    await indicatorService.deleteIndicator(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllIndicators,
  getIndicatorById,
  createIndicator,
  deleteIndicator
};