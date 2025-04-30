import { objType, checkObj } from '../../dist/v1/index.mjs';

const executeObjType = async () => {
  await new Promise((resolve) => {
    console.log(objType({}));
    console.log(objType([]));
    console.log(objType(new Map()));
    console.log(objType(new Set()));
    console.log(objType(new Date()));
    console.log(objType(null));
    console.log(objType(undefined));
  
    console.log(checkObj({}));
    console.log(checkObj([]));
    console.log(checkObj(new Map()));
    console.log(checkObj(new Set()));
    console.log(checkObj(new Date()));
    console.log(checkObj(null));
    console.log(checkObj(undefined));
    resolve();
  });
};

export default executeObjType;
