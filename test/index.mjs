import * as TinyEssentials from '../dist/v1/index.mjs';

console.log(TinyEssentials.objType({}));
console.log(TinyEssentials.objType([]));
console.log(TinyEssentials.objType(new Map()));
console.log(TinyEssentials.objType(new Set()));
console.log(TinyEssentials.objType(new Date()));
console.log(TinyEssentials.objType(null));
console.log(TinyEssentials.objType(undefined));

const crypto = new TinyEssentials.CryptoHelper();

const encryptedPudding = crypto.encrypt('pudding');
console.log(encryptedPudding);
console.log(crypto.decrypt(encryptedPudding));

const encryptedPudding2 = crypto.encrypt({ pudding: true });
console.log(encryptedPudding2);
console.log(crypto.decrypt(encryptedPudding2));

const encryptedPudding3 = crypto.encrypt(['pudding']);
console.log(encryptedPudding3);
console.log(crypto.decrypt(encryptedPudding3));

console.log(TinyEssentials);
