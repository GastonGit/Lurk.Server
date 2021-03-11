let express = require('express');
let router = express.Router();

router.get('/', async (req ,res ,next) => {
  
  return res.send("home");
});

module.exports = router;
