const threatService = require('../services/threatService');

const getAllThreats = async (req, res, next) => {
  try {
    const threats = await threatService.getAllThreats();
    res.json(threats);
  } catch (error) {
    next(error);
  }
};

const getThreatById = async (req, res, next) => {
  try {
    const threat = await threatService.getThreatById(req.params.id);
    if (!threat) {
      return res.status(404).json({ error: 'Threat not found' });
    }
    res.json(threat);
  } catch (error) {
    next(error);
  }
};

const createThreat = async (req, res, next) => {
  try {
    const threat = await threatService.createThreat(req.body);
    res.status(201).json(threat);
  } catch (error) {
    next(error);
  }
};

const updateThreat = async (req, res, next) => {
  try {
    const threat = await threatService.updateThreat(req.params.id, req.body);
    if (!threat) {
      return res.status(404).json({ error: 'Threat not found' });
    }
    res.json(threat);
  } catch (error) {
    next(error);
  }
};

const deleteThreat = async (req, res, next) => {
  try {
    await threatService.deleteThreat(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const analyzeThreat = async (req, res, next) => {
  try {
    const analysis = await threatService.analyzeThreat(req.params.id);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllThreats,
  getThreatById,
  createThreat,
  updateThreat,
  deleteThreat,
  analyzeThreat
};