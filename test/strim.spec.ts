import Strim from '../src/index';

describe('Strim', () => {
  let strim;

  beforeEach(() => {
    strim = new Strim();
  });

  describe('basic flow', () => {
    it('should create a new count property', done => {
      let index = 0;
      const arr = [1, 2, 3, 4];
      new Strim()
        .pipe({
          module: 'observables',
          function: 'get',
          arguments: arr,
        })
        .subscribe({
          next: val => {
            expect(val).toBe(arr[index]);
            index++;
          },
          error: err => {
            throw new Error(err);
          },
          complete: () => {
            done();
          },
        });
    });
  });
});
