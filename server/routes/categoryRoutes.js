const express = require('express');
const router = express.Router();

const categories = [
  { id: 'construction-&-building', name: 'Construction & Building' },
  { id: 'professional-services', name: 'Professional Services' },
  { id: 'home-improvement', name: 'Home Improvement' },
  // ... add all your categories here
];

router.get('/', (req, res) => {
  res.json(categories);
});

module.exports = router; 