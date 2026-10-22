import { Logger } from 'example:counter/logging';

const log = new Logger('[js]');
log.log('app initialized');

const tmp = new Logger('[tmp]');
tmp.log('disposed right after this');
tmp[Symbol.dispose]();

class Counter {
  constructor(name, start) {
    this.name = name;
    this.value = start;
  }

  inc(by) {
    this.value += by;
    return this.value;
  }

  stats() {
    return { name: this.name, value: this.value };
  }

  static merge(a, b) {
    return new Counter(a.name + '+' + b.name, a.value + b.value);
  }
}

export const types = {
  Counter,

  describe(c) {
    return `${c.name} = ${c.value} ✓`;
  },

  logTo(c, l) {
    l.log(`${c.name} is at ${c.value}`);
  },

  makeLogger(prefix) {
    return new Logger(prefix);
  }
};
