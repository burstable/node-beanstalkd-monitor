import moment from 'moment';
import expect from 'unexpected';
import ms from 'ms';
import {Monitor} from 'index';
import {map} from 'lodash';

describe('Monitor', function () {
  describe('prune', function () {
    it('should history older than last data interval to keep memory usage constant', function () {
      let monitor = new Monitor(null, null, {
        pollInterval: '1m',
        dataIntervals: [
          '1m',
          '15m',
          '30m',
          '1h'
        ]
      });

      let history = map(new Array(100), () => 1);
      monitor._history = history;

      monitor.prune();
      expect(monitor._history, 'to have length', 60);
      expect(monitor._history, 'to equal', history.slice(0, 60));
    });

    it('should continously prune history', function () {
      let monitor = new Monitor(null, null, {
        pollInterval: '15s',
        dataIntervals: [
          '15s',
          '30s',
          '45s',
          '1m'
        ]
      });

      let history = map(new Array(5), () => 1);
      monitor._history = history;

      monitor.prune();
      expect(monitor._history, 'to have length', 4);
      expect(monitor._history, 'to equal', history.slice(0, 4));
    });
  });
});
