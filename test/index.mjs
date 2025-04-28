import * as TinyEssentials from '../dist/v1/index.mjs';

console.log(TinyEssentials.objType({}));
console.log(TinyEssentials.objType([]));
console.log(TinyEssentials.objType(new Map()));
console.log(TinyEssentials.objType(new Set()));
console.log(TinyEssentials.objType(new Date()));
console.log(TinyEssentials.objType(null));
console.log(TinyEssentials.objType(undefined));

console.log(TinyEssentials.checkObj({}));
console.log(TinyEssentials.checkObj([]));
console.log(TinyEssentials.checkObj(new Map()));
console.log(TinyEssentials.checkObj(new Set()));
console.log(TinyEssentials.checkObj(new Date()));
console.log(TinyEssentials.checkObj(null));
console.log(TinyEssentials.checkObj(undefined));

console.log(TinyEssentials);
