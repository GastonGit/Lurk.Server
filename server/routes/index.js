let express = require('express');
let router = express.Router();
let HotClipsController = require('../lib/HotClipsController');

let hotClips = new HotClipsController();
hotClips.setupConnection()
hotClips.start();

router.get('/', async (req ,res ,next) => {
  
  return res.send([
      'https://clips.twitch.tv/AgileStylishOilStinkyCheese',
      'https://clips.twitch.tv/SparklySavageSnailBCWarrior',
      'https://clips.twitch.tv/BitterCleverGoldfishEleGiggle--PW-MYiDBUXwTQw1',
      'https://clips.twitch.tv/PerfectTawdrySproutFloof',
      'https://clips.twitch.tv/PeacefulBlatantNewt4Head-gac5plWZtJ7LUNfz',
      'https://clips.twitch.tv/QuaintAthleticVelociraptorPrimeMe-lX8gUVbZ7wvZFlCQ'
  ]);
});

module.exports = router;
