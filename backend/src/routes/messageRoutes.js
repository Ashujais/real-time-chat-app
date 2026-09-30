'use strict';

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { validateMessage } = require('../middleware/validation');

router.post('/', validateMessage, messageController.createMessage);
router.get('/', messageController.getMessages);

module.exports = router;
