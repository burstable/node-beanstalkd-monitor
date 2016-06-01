import moment from 'moment';
import expect from 'unexpected';
import ms from 'ms';
import {Monitor} from 'index';
import {map} from 'lodash';
import sinon from 'sinon';
import Promise from 'bluebird';

describe('Monitor', function () {
  describe('start', function () {
    beforeEach(function () {
      this.sinon = sinon.sandbox.create();
      this.clock = this.sinon.useFakeTimers(Date.now());
    });

    afterEach(function () {
      this.sinon.restore();
    });

    it('should set _running', function () {
      let monitor = new Monitor();
      expect(monitor._running, 'to equal', false);

      monitor.start();
      expect(monitor._running, 'to equal', true);
    });

    it('should start polling', function () {
      let pollInterval = Math.ceil(Math.random() * 9999);

      let monitor = new Monitor(null, null, {
        pollInterval: pollInterval
      });
      this.sinon.stub(monitor, 'poll').resolves();

      monitor.start();
      expect(monitor.poll, 'was called once');

      this.clock.tick(pollInterval - 1);
      expect(monitor.poll, 'was called once');

      this.clock.tick(1);
      expect(monitor.poll, 'was called twice');
    });

    it('should emit error if poll fails', async function () {
      let pollInterval = Math.ceil(Math.random() * 9999);
      let monitor = new Monitor(null, null, {
        pollInterval: pollInterval
      });
      let spy = this.sinon.spy();

      this.sinon.stub(monitor, 'poll').rejects(new Error(Math.random().toString()));
      monitor.on('error', spy);

      let promise =  monitor.start();
      this.clock.tick(pollInterval + 1);
      await promise;

      expect(spy, 'was called twice');
    });

    it('should emit start', function () {
      let monitor = new Monitor();
      let spy = this.sinon.spy();

      monitor.on('start', spy);
      monitor.start();

      expect(spy, 'was called once');
    });
  });
});
