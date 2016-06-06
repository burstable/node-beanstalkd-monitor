import moment from 'moment';
import expect from 'unexpected';
import ms from 'ms';
import {Monitor} from 'index';
import sinon from 'sinon';
import createMockConnection from '../createMockConnection';

describe('Monitor', function () {
  describe('fetch', function () {
    beforeEach(function () {
      this.sinon = sinon.sandbox.create();
      this.monitor = new Monitor();

      this.connection = createMockConnection();
      this.sinon.stub(this.monitor, 'connection').resolves(this.connection);
      this.sinon.stub(this.monitor, 'tubes').resolves([]);
    });

    afterEach(function () {
      this.sinon.restore();
    });

    it('should fetch stats for each tube', async function () {
      let tubes = [Math.random().toString(), Math.random().toString(), Math.random().toString(), Math.random().toString()];

      this.monitor.tubes.resolves(tubes);
      this.connection.statsTube.resolves({});

      await this.monitor.fetch();

      expect(this.connection.statsTube, 'was called with', tubes[0]);
      expect(this.connection.statsTube, 'was called with', tubes[1]);
      expect(this.connection.statsTube, 'was called with', tubes[2]);
      expect(this.connection.statsTube, 'was called with', tubes[3]);
    });

    it('should return a map for each tube', async function () {
      let tubes = [Math.random().toString(), Math.random().toString()];
      this.monitor.tubes.resolves(tubes);

      this.connection.statsTube.withArgs(tubes[0]).resolves({
        name: tubes[0],
        'total-jobs': 3000,
        'current-jobs-reserved': 3,
        'current-jobs-ready': 30,
        'current-jobs-urgent': 0,
        'current-jobs-delayed': 0,
        'current-jobs-buried': 0
      });
      this.connection.statsTube.withArgs(tubes[1]).resolves({
        name: tubes[1],
        'total-jobs': 500,
        'current-jobs-reserved': 0,
        'current-jobs-ready': 0,
        'current-jobs-urgent': 0,
        'current-jobs-delayed': 0,
        'current-jobs-buried': 0
      });

      let actual = await this.monitor.fetch();

      expect(actual, 'to satisfy', {
        [tubes[0]]: {
          tube: tubes[0],
          timestamp: expect.it('to be defined'),
          total: 3000,
          reserved: 3,
          ready: 30,
          urgent: 0,
          delayed: 0,
          buried: 0
        },
        [tubes[1]]: {
          tube: tubes[1],
          timestamp: expect.it('to be defined'),
          total: 500,
          reserved: 0,
          ready: 0,
          urgent: 0,
          delayed: 0,
          buried: 0
        }
      });
    });
  });
});
