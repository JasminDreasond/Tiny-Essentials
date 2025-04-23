import * as TinyEssentials from '../dist/v1';

console.log(TinyEssentials.objType({}));
console.log(TinyEssentials.objType([]));
console.log(TinyEssentials.objType(new Map()));
console.log(TinyEssentials.objType(new Set()));
console.log(TinyEssentials.objType(new Date()));
console.log(TinyEssentials.objType(null));
console.log(TinyEssentials.objType(undefined));

console.log(TinyEssentials);
