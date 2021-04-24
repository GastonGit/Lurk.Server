let express = require('express');
let router = express.Router();
let HotClipsController = require('../lib/HotClipsController');

let hotClips = new HotClipsController();
hotClips.setupConnection()
hotClips.start();

router.get('/', async (req ,res ,next) => {
  
  // return res.send(hotClips.getList());
  return res.send([
      'https://clips-media-assets2.twitch.tv/AT-cm%7C1140679825.mp4',
      'https://clips-media-assets2.twitch.tv/AT-cm%7C1147897618.mp4',
      'https://clips-media-assets2.twitch.tv/AT-cm%7C1147927108.mp4',
      'https://clips-media-assets2.twitch.tv/AT-cm%7C1148212903.mp4'
  ]);
});

module.exports = router;
