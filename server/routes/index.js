let express = require('express');
let router = express.Router();
let HotClipsController = require('../lib/HotClipsController');

let hotClips = new HotClipsController();
hotClips.setupConnection()
hotClips.start();

router.get('/', async (req ,res ,next) => {
  
  return res.send(hotClips.getList());
});

module.exports = router;
