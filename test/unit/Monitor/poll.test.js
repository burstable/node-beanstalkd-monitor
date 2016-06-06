import moment from 'moment';
import expect from 'unexpected';
import ms from 'ms';
import {Monitor} from 'index';
import {map} from 'lodash';
import sinon from 'sinon';
import Promise from 'bluebird';

describe('Monitor', function () {
  describe('poll', function () {
    beforeEach(function () {
      this.sinon = sinon.sandbox.create();
      this.monitor = new Monitor();
      this.monitor._running = true;

      this.sinon.stub(this.monitor, 'fetch').resolves();
      this.sinon.stub(this.monitor, 'prune');
    });

    afterEach(function () {
      this.sinon.restore();
    });

    it('should no-op if not running', async function () {
      this.monitor._running = false;

      await this.monitor.poll();

      expect(this.monitor.fetch, 'was not called');
    });

    it('should build history', async function () {
      let tube = Math.random().toString();
      let result = {
        [tube]: {
          name: tube
        }
      }

      this.monitor.fetch.resolves(result);

      await this.monitor.poll();
      await this.monitor.poll();
      await this.monitor.poll();

      expect(this.monitor._history, 'to have length', 3);
      expect(this.monitor._history[0], 'to equal', result);
    });

    it('should call prune', async function () {
      this.monitor.fetch.resolves([{tube: Math.random().toString()}]);

      await this.monitor.poll();

      expect(this.monitor.prune, 'was called once');
    });

    it('should emit update event with current parsed data', async function () {
      let spy = this.sinon.spy();
      this.monitor.on('update', spy);

      let tubeA = Math.random().toString()
        , tubeB = Math.random().toString();

      let result = {
        [tubeA]: {
          tube: tubeA,
          ready: Math.floor(Math.random() * 100),
          total: Math.floor(Math.random() * 100),
        },
        [tubeB]: {
          tube: tubeB,
          destroyed: Math.floor(Math.random() * 100),
          total: Math.floor(Math.random() * 100),
        }
      };
      this.monitor.fetch.resolves(result);

      await this.monitor.poll();

      expect(spy, 'was called with', [
        {
          tube: tubeA,
          ready: {
            now: result[tubeA].ready
          },
          total: {
            now: result[tubeA].total
          }
        },
        {
          tube: tubeB,
          destroyed: {
            now: result[tubeB].destroyed
          },
          total: {
            now: result[tubeB].total
          }
        }
      ]);
    });

    it('should emite update event with historic data', async function () {
      let spy = this.sinon.spy();
      this.monitor.on('update', spy);

      let tubeA = Math.random().toString()
        , tubeB = Math.random().toString();

      function generateResult() {
        return {
          [tubeA]: {
            tube: tubeA,
            ready: Math.floor(Math.random() * 100),
            total: Math.floor(Math.random() * 100),
          },
          [tubeB]: {
            tube: tubeB,
            destroyed: Math.floor(Math.random() * 100),
            total: Math.floor(Math.random() * 100),
          }
        };
      }

      let results = [
        generateResult(),
        generateResult(),
        generateResult(),
        generateResult(),
        generateResult(),
        generateResult()
      ];

      this.monitor.fetch.onCall(0).resolves(results[0]);
      this.monitor.fetch.onCall(1).resolves(results[1]);
      this.monitor.fetch.onCall(2).resolves(results[2]);
      this.monitor.fetch.onCall(3).resolves(results[3]);
      this.monitor.fetch.onCall(4).resolves(results[4]);
      this.monitor.fetch.onCall(5).resolves(results[5]);

      await this.monitor.poll();
      await this.monitor.poll();
      await this.monitor.poll();
      await this.monitor.poll();
      await this.monitor.poll();
      await this.monitor.poll();

      expect(spy, 'was called with', [
        {
          tube: tubeA,
          ready: {
            now: results[5][tubeA].ready,
            '5m': results[0][tubeA].ready
          },
          total: {
            now: results[5][tubeA].total,
            '5m': results[0][tubeA].total
          }
        },
        {
          tube: tubeB,
          destroyed: {
            now: results[5][tubeB].destroyed,
            '5m': results[0][tubeB].destroyed
          },
          total: {
            now: results[5][tubeB].total,
            '5m': results[0][tubeB].total
          }
        }
      ]);
    });
  });
});
