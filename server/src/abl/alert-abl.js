const AlertDao = require("../dao/alert-dao");
const SseManager = require("../sevices/sseManager");

const AlertAbl = {
  async list(req, res) {
    try {
      const { resolved } = req.query;
      const filter = {};
      
      if (resolved !== undefined) {
        filter.isResolved = resolved === 'true';
      }
      if (req.query.plantId !== undefined) {
        filter.plantId = req.query.plantId;
      }

      const alerts = await AlertDao.list(filter);
      res.status(200).json(alerts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params; // ID from URL
      const { isResolved } = req.body;

      const alert = await AlertDao.get(id);
      if (!alert) return res.status(404).json({ error: "alertDoesNotExist" });

      let updateData = {};
      if (isResolved !== undefined) {
        updateData.isResolved = isResolved;
      }
      
      const updatedAlert = await AlertDao.update(id, updateData);

      // Broadcast the update to connected clients
      if (updateData.isResolved === true) {
        SseManager.broadcast('alertResolved', {
          alertId: id,
          plantId: alert.plantId,
        });
      }
      res.status(200).json(updatedAlert);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = AlertAbl;