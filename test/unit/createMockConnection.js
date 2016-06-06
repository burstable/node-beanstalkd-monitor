import sinon from 'sinon';

export default function createMockConnection() {
  return {
    listTubes: sinon.stub().resolves(),
    statsTube: sinon.stub().resolves()
  }
};
