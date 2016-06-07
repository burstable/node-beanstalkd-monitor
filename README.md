# node-beanstalkd-monitor

Monitor beanstalkd tube health and trigger alerts

## Basic usage

```js
import {Monitor} from 'beanstalkd-monitor';
const monitor = new Monitor(host, port);

monitor.on('update', function (data) {
  /*
  [
    {
      tube: 'tube',
      ready: { // absolute numbers
        now: 123,
        '5m': 60,
        '30m': 30,
        '1h': 200
      }
    }
  ]
  */
});

monitor.start();
```

## Alert triggers

You can apply your own custom alert logic on each 'update' event but you can also add callbacks to beanstalkd-monitor for evaluation.

```js
monitor.on('alert', function (alert) {
  // Trigger Slack, PagerDuty, Winston
});

// Called for all tubes with individual tube data
monitor.addAlertTrigger(function (data) {
  /*
  {
    tube: 'tube',
    ready: { // absolute numbers
      now: 123,
      '5m': 60,
      '30m': 30,
      '1h': 200
    }
  }
  */
});

import {ThresholdAlertTrigger} from 'beanstalkd-monitor';
// Will trigger an alert if amount of jobs in ready state for tube exceeds 500
monitor.addAlertTrigger('tube', new ThresholdAlertTrigger('ready', 500));
```
