'use strict';

module.exports = {
  passes: [{
    recordTrace: true,
    pauseAfterLoadMs: 5000,
    useThrottling: true,
    gatherers: [],
  }],

  audits: [
    'first-meaningful-paint',
    'speed-index-metric',
    'estimated-input-latency',
    'first-interactive',
    'consistently-interactive',
  ]
};