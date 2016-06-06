import expect from 'unexpected';
import AlertTriggerHandler from 'AlertTriggerHandler';
import sinon from 'sinon';
import Promise from 'bluebird';

describe('AlertTriggerHandler', function () {
  describe('evaluate', function () {
    beforeEach(function () {
      this.sinon = sinon.sandbox.create();
      this.handler = new AlertTriggerHandler();
    });

    it('should trigger callback for any non-tube specific triggers', function () {
      let tubeA = Math.random().toString()
        , tubeB = Math.random().toString();

      let data = {
        [tubeA]: {
          tube: tubeA
        },
        [tubeB]: {
          tube: tubeB
        }
      };

      let triggerA = this.sinon.spy()
        , triggerB = {evaluate: this.sinon.spy()};

      this.handler.push(undefined, triggerA);
      this.handler.push(undefined, triggerB);

      this.handler.evaluate(data);

      expect(triggerA, 'was called twice');
      expect(triggerB.evaluate, 'was called twice');
      expect(triggerA, 'was called with', data[tubeA]);
      expect(triggerA, 'was called with', data[tubeB]);
      expect(triggerB.evaluate, 'was called with', data[tubeA]);
      expect(triggerB.evaluate, 'was called with', data[tubeB]);
    });

    it('should trigger tube specific callbacks', function () {
      let tubeA = Math.random().toString()
        , tubeB = Math.random().toString();

      let data = {
        [tubeA]: {
          tube: tubeA
        },
        [tubeB]: {
          tube: tubeB
        }
      };

      let triggerA = this.sinon.spy()
        , triggerB = {evaluate: this.sinon.spy()};

      this.handler.push(tubeA, triggerA);
      this.handler.push(tubeB, triggerB);

      this.handler.evaluate(data);

      expect(triggerA, 'was called once');
      expect(triggerB.evaluate, 'was called once');
      expect(triggerA, 'was called with', data[tubeA]);
      expect(triggerB.evaluate, 'was called with', data[tubeB]);
    });

    it('should emit alert event if trigger returns non-null', function () {
      let tubeA = Math.random().toString();

      let data = {
        [tubeA]: {
          tube: tubeA
        }
      };

      let alertB = Math.random().toString()
        , alertC = new Error(Math.random().toString());

      let triggerA = this.sinon.stub().returns(null)
        , triggerB = {evaluate: this.sinon.stub().returns(alertB)}
        , triggerC = this.sinon.stub().returns(alertC);

      let onAlertSpy = this.sinon.spy();

      this.handler.push(undefined, triggerA);
      this.handler.push(undefined, triggerB);
      this.handler.push(undefined, triggerC);
      this.handler.on('alert', onAlertSpy);

      this.handler.evaluate(data);

      expect(onAlertSpy, 'was called twice');
      expect(onAlertSpy, 'was called with', alertB);
      expect(onAlertSpy, 'was called with', alertC);
    });
  });
});
