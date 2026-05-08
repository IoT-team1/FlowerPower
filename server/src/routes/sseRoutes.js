const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const SseManager = require('../sevises/sseManager');

router.get('/stream', async (req, res) => {
  const clientId = uuidv4();
  await SseManager.addClient(clientId, res);
});

module.exports = router;