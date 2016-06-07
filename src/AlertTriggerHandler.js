import {EventEmitter} from 'events';
import {each} from 'lodash'
import assert from 'assert';

export default class AlertTriggerHandler extends EventEmitter {
  constructor() {
    super();

    this._triggers = [];
  }

  push(tube, trigger) {
    this._triggers.push([tube, trigger]);
  }

  evaluate(input) {
    each(input, data => {
      each(this._triggers, ([alertTube, alertTrigger]) => {
        if (!alertTube || data.tube === alertTube) {
          let evaluator = alertTrigger.evaluate || alertTrigger;
          let alert = evaluator(data);

          if (alert) {
            this.emit('alert', alert);
          }
        }
      });
    });
  }
}
