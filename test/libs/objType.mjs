import { objType, checkObj, cloneObjTypeOrder, ColorSafeStringify, isJsonObject } from '../../dist/v1/index.mjs';

const colorizer = new ColorSafeStringify();
const color = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  red: '\x1b[91m',
  green: '\x1b[92m',
  yellow: '\x1b[93m',
  blue: '\x1b[94m',
  magenta: '\x1b[95m',
  cyan: '\x1b[96m',
  white: '\x1b[97m',
};

const stringifyJson = (json, space = 0) => colorizer.colorize(JSON.stringify(json, null, space));

const typeTests = [
  ['undefined', undefined, '🌀'],
  ['null', null, '🕳️'],
  ['boolean', true, '✅'],
  ['number', 123, '🔢'],
  ['bigint', 123n, '🏛️'],
  ['string', 'hello', '📝'],
  ['symbol', Symbol('sym'), '⚙️'],
  ['function', () => {}, '🛠️'],
  ['array', [], '📦'],
  ['buffer', Buffer.from('hello'), '📄'],
  ['date', new Date(), '📅'],
  ['regexp', /abc/, '🔍'],
  ['map', new Map(), '🗺️'],
  ['set', new Set(), '🧺'],
  ['weakmap', new WeakMap(), '💼'],
  ['weakset', new WeakSet(), '📚'],
  ['promise', Promise.resolve(), '⏳'],
  ['object', {}, '🧱'],
  ['object', new Object(), '🧱'],
  ['object', Object.create({}), '🧱'],
  ['object', Object.create(Object.prototype), '🧱'],
  ['object', Object.assign({}, { a: 1 }), '🧱'],
];

const mark = (condition) =>
  condition ? `${color.green}✅${color.reset}` : `${color.red}❌${color.reset}`;

const executeObjType = async () => {
  await new Promise((resolve) => {
    console.log(`${color.cyan}📘 Type Order (cloneObjTypeOrder):${color.reset}`);
    console.log(stringifyJson(cloneObjTypeOrder(), 1));
    console.log('');

    console.log(`${color.magenta}🔎 Testing objType()${color.reset}`);
    for (const [label, value, emoji] of typeTests) {
      const result = objType(value);
      const expected = label;
      const isValid = result === expected;
      console.log(
        `${emoji} ${color.yellow}${label.padEnd(10)}${color.reset} => ${color.green}${result}${color.reset} ${mark(isValid)}`,
      );
    }

    console.log('');
    console.log(`${color.blue}🧪 Testing checkObj()${color.reset}`);
    for (const [label, value, emoji] of typeTests) {
      const result = checkObj(value);
      const isValid =
        typeof result === 'object' &&
        result !== null &&
        result.valid === true &&
        result.type === label;

      const formattedResult = stringifyJson(result);
      console.log(
        `${emoji} ${color.yellow}${label.padEnd(10)}${color.reset} => ${formattedResult} ${mark(isValid)}`,
      );
    }

    console.log('\n');
    console.log(`${color.white}🧼 Testing isJsonObject()${color.reset}`);
    for (const [label, value, emoji] of typeTests) {
      const result = isJsonObject(value);
      const expected = label === 'object';
      console.log(
        `${emoji} ${color.yellow}${label.padEnd(10)}${color.reset} => ${color.cyan}${result}${color.reset} ${mark(result === expected)}`,
      );
    }

    console.log('\n');
    console.log(`${color.gray}✔️ Test completed.${color.reset}`);
    resolve();
  });
};

export default executeObjType;
