import {EventEmitter} from 'events';
import Promise from 'bluebird';
import Beanstalkd from 'beanstalkd';
import {JOB_STATES, DEFAULT_DATA_INTERVALS, DEFAULT_POLL_INTERVAL} from './misc';
import ms from 'ms';
import {map} from 'lodash';
import AlertTriggerHandler from './AlertTriggerHandler';

export default class Monitor extends EventEmitter {
  constructor(host, port, options = {}) {
    super();

    this.host = host;
    this.port = port;

    this.options = options;

    this.alertTriggerHandler = new AlertTriggerHandler();
    this._history = [];
    this._running = false;

    this._pollInterval = typeof this.options.pollInterval === 'number' && this.options.pollInterval || ms(this.options.pollInterval || DEFAULT_POLL_INTERVAL);
    this._dataIntervals = this.options.dataIntervals || DEFAULT_DATA_INTERVALS;

    this.on('update', data => this.alertTriggerHandler.evaluate(data));
    this.alertTriggerHandler.on('alert', alert => this.emit('alert', alert));
  }

  async connection() {
    if (!this._connection) {
      this._connection = (new Beanstalkd(this.host, this.port)).connect();
    }
    await this._connection;

    if (this._connection.closed) {
      this._connection = this.connection();
      await this._connection;
    }

    return this._connection;
  }

  async tubes() {
    return await this.connection().call('listTubes');
  }

  async start() {
    this._running = true;
    this._poller = setInterval(() => {
      this.poll().catch(err => {
        this.emit('error', err);
      });
    }, this._pollInterval);

    this.emit('start');
    await this.poll().catch(err => {
      this.emit('error', err);
    });
  }

  stop() {
    this._running = false;
    if (this._poller) clearInterval(this._poller);
    this._poller = null;
    this.emit('stop');
  }

  async fetch() {
    let tubes = await this.tubes();
    tubes = await Promise.all(tubes.map(async (tube) => {
      return this.connection().then(async (connection) => {
        return connection.statsTube(tube);
      });
    }));

    return tubes.reduce((result, stats) => {
      result[stats.name] = JOB_STATES.reduce((values, key) => {
        values[key] = stats[`current-jobs-${key}`];
        return values;
      }, {
        tube: stats.name,
        timestamp: new Date(),
        total: stats['total-jobs']
      });
      return result;
    }, {});
  }

  async poll() {
    if (!this._running) return;

    let start = new Date();
    let current = await this.fetch().timeout(5000, 'Timed out fetching tube stats');
    let history = [];

    if (this._history.length) {
      history = this._dataIntervals.map(time => {
        let naivePosition = ms(time) / this._pollInterval - 1;

        if (this._history.length - 1 < naivePosition) return null;
        if (!this._history[naivePosition]) return null;

        return {
          time: time,
          data: this._history[naivePosition]
        };
      }).filter(item => item);
    }

    let data = map(current, item => {
      let tube = item.tube;

      return {
        tube: item.tube,
        ...Object.keys(item).reduce((result, state) => {
          if (~['tube', 'timestamp'].indexOf(state)) return result;

          result[state] = {
            now: item[state]
          };

          history.forEach(item => {
            if (item.data[tube] && item.data[tube][state] !== undefined) {
              result[state][item.time] = item.data[tube][state];
            }
          });
          return result;
        }, {})
      };
    });

    this.emit('update', data);

    if (this._dataIntervals && this._dataIntervals.length) {
      this._history.unshift(current);
    }
    this.prune();
  }

  prune() {
    let naiveLastPosition = ms(this._dataIntervals[this._dataIntervals.length - 1]) / this._pollInterval - 1;

    if (this._history.length > naiveLastPosition) {
      this._history = this._history.slice(0, naiveLastPosition + 1);
    }
  }

  addAlertTrigger(tube, trigger) {
    if (trigger === undefined) {
      trigger = tube;
      tube = undefined;
    }

    this.alertTriggerHandler.push(tube, trigger);
  }
}
