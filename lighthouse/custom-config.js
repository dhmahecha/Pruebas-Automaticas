'use strict';

module.exports = {

    extends: 'lighthouse:default',

    passes: [{
        passName: 'defaultPass',
        gatherers: [
        ]
    }],

    audits: [
    ],

    categories: {
        ratp_pwa: {
            name: 'Ratp pwa metrics',
            description: 'Metrics for the ratp timetable site',
            audits: [
            ]
        }
    }
};

/*
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
};*/