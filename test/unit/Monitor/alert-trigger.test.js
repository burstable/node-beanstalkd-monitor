
import expect from 'unexpected';
import {Monitor} from 'index';
import sinon from 'sinon';
import Promise from 'bluebird';

describe('Monitor', function () {
  describe('alert-trigger', function () {
    beforeEach(function () {
      this.sinon = sinon.sandbox.create();
      this.monitor = new Monitor();

      this.sinon.stub(this.monitor.alertTriggerHandler, 'push');
      this.sinon.stub(this.monitor.alertTriggerHandler, 'evaluate');
    });

    afterEach(function () {
      this.sinon.restore();
    });

    describe('addAlertTrigger', function () {
      it('should proxy tube/trigger', function () {
        let tube = Math.random().toString()
          , trigger = function() {};

        this.monitor.addAlertTrigger(tube, trigger);

        expect(this.monitor.alertTriggerHandler.push, 'was called with', tube, trigger);
      });

      it('should support a single trigger arg', function () {
        let trigger = function() {};

        this.monitor.addAlertTrigger(trigger);

        expect(this.monitor.alertTriggerHandler.push, 'was called with', undefined, trigger);
      });
    });

    describe('on update', function () {
      it('should call alertTriggerHandler.evaluate', function () {
        let data = [];

        this.monitor.emit('update', data);

        expect(this.monitor.alertTriggerHandler.evaluate, 'was called with', data);
      });
    });

    describe('on alert', function () {
      it('should proxy from alertTriggerHandler', function () {
        let alert = {}
          , spy = this.sinon.spy();

        this.monitor.on('alert', spy);

        this.monitor.alertTriggerHandler.emit('alert', alert);

        expect(spy, 'was called once');
      });
    });
  });
});
