import {ThresholdAlertTrigger, ThresholdAlert} from 'index';
import expect from 'unexpected';

describe('ThresholdAlertTrigger', function () {
  it('should throw if missing state or threshold', function () {
    expect(() => new ThresholdAlertTrigger(), 'to throw', 'ThresholdAlertTrigger(state, threshold): state and threshold must be defined');
    expect(() => new ThresholdAlertTrigger(Math.random().toString()), 'to throw', 'ThresholdAlertTrigger(state, threshold): state and threshold must be defined');
    expect(() => new ThresholdAlertTrigger(null, Math.random() * 999), 'to throw', 'ThresholdAlertTrigger(state, threshold): state and threshold must be defined');
  });

  it('should return null if state is under threshold', function () {
    let state = Math.random().toString()
      , threshold = Math.ceil(Math.random() * 9999)
      , trigger = new ThresholdAlertTrigger(state, threshold);

    expect(trigger({[state]: threshold - 1}), 'to equal', null);
  });

  it('should return alert if state is equal to threshold', function () {
    let state = Math.random().toString()
      , threshold = Math.ceil(Math.random() * 9999)
      , trigger = new ThresholdAlertTrigger(state, threshold);

    expect(trigger({[state]: threshold}), 'to be a', ThresholdAlert);
  });

  it('should return alert if state is greater than threshold', function () {
    let state = Math.random().toString()
      , threshold = Math.ceil(Math.random() * 9999)
      , trigger = new ThresholdAlertTrigger(state, threshold);

    expect(trigger({[state]: threshold + Math.ceil(Math.random() * 10)}), 'to be a', ThresholdAlert);
  });
});
