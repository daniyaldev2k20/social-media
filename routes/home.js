const express = require('express');

const homeController = require('../controllers/home-controller');

const router = express.Router();

router.get('/', homeController.getHomePage);

router.get('/:id', homeController.getUserProfile);

module.exports = router;
