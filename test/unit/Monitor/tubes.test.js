import moment from 'moment';
import expect from 'unexpected';
import ms from 'ms';
import {Monitor} from 'index';
import sinon from 'sinon';
import createMockConnection from '../createMockConnection';

describe('Monitor', function () {
  describe('tubes', function () {
    beforeEach(function () {
      this.sinon = sinon.sandbox.create();
      this.monitor = new Monitor();

      this.connection = createMockConnection();
      this.sinon.stub(this.monitor, 'connection').resolves(this.connection);
    });

    afterEach(function () {
      this.sinon.restore();
    });

    it('should return tubes', async function () {
      let tubes = [Math.random().toString(), Math.random().toString(), Math.random().toString(), Math.random().toString()];
      this.connection.listTubes.resolves(tubes);

      let actual = await this.monitor.tubes();
      expect(actual, 'to equal', tubes);
    });
  });
});
