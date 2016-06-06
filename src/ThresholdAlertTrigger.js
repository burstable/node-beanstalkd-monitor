import assert from 'assert';
import ExtendableError from 'es6-error';

export default function ThresholdAlertTrigger(state, threshold) {
  assert(state && threshold, 'ThresholdAlertTrigger(state, threshold): state and threshold must be defined');

  return function(data) {
    if (data[state] >= threshold) {
      return new ThresholdAlert(`${data.tube}.${state} is greater than or equal to ${threshold}`);
    }
    return null;
  };
}

export class ThresholdAlert extends ExtendableError {
  
}
