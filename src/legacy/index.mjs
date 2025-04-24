// @ts-nocheck

import countObj from './get/countObj.mjs';
import objType from './get/objType.mjs';
import super_string_filter from './get/super_string_filter.mjs';
import auth from './http/auth.mjs';
import check_domain from './http/check_domain.mjs';
import domainValidator from './http/domainValidator.mjs';
import errorsCallback from './http/errorsCallback.mjs';
import http_base from './http/HTTP-1.0.mjs';
import userIp from './http/userIP.mjs';
import convertBytes from './libs/convertBytes.mjs';
import custom_module_manager from './libs/custom_module_loader.mjs';
import replaceAsync from './libs/replaceAsync.mjs';
import * as momentjs from './momentjs/index.mjs';
import * as crypto from './crypto/index.mjs';
import pagination from './get/pagination.mjs';
import getDomainURL from './http/getDomainURL.mjs';
import tinyDice from './libs/dice.mjs';
import LevelUp from './libs/userLevel.mjs';
import queryUrlByName from './get/queryUrlByName.mjs';
import queryUrlJSON from './get/queryUrlJSON.mjs';
import decimalColor from './get/decimalColor.mjs';
import percentageBase from './libs/percentage.mjs';
import rule3 from './libs/rule3.mjs';
import versionCheck from './get/versionCheck.mjs';
import socketIo from './socket.io/index.mjs';
import arraySortPositions from './libs/arraySortPositions.mjs';
import capitalize from './libs/capitalize.mjs';
import getJsonFetch from './http/fetch/json.mjs';
import getTextFetch from './http/fetch/text.mjs';
import csrfTokenAnalyze from './http/csrfTokenAnalyze.mjs';

const legacyModules = {
  // Convert Bytes
  convertBytes,

  // HTTP/1.0 Render
  'HTTP/1.0': http_base,

  // Moment JS
  momentjs,

  // Check Domain
  checkDomain: check_domain,

  // Get Obj Type
  getObjType: objType,

  // Count Obj
  countObj: countObj,

  // HTTP Auth Generator
  httpAuth: auth,

  // Replace Async
  replaceAsync,

  // User IP
  getUserIP: userIp,

  // Super string Filter
  superStringFilter: super_string_filter,

  // Custom Module Loader
  customModuleManager: custom_module_manager,

  // Errors Callback
  errorsCallback,

  // Domain Validator
  domainValidator,

  // Crypto
  crypto,

  // Pagination
  pagination,

  // Get Domain URL
  getDomainURL,

  // Dice
  dice: tinyDice,

  // User Level
  LevelUp: LevelUp,

  // Get URL Parameter
  getQueryUrlByName: queryUrlByName,
  getQueryUrlJSON: queryUrlJSON,

  // Get Decimal Color
  getDecimalColor: decimalColor,

  // Percentage
  percentage: percentageBase,

  // Rule 3
  rule3,

  // Version Check
  versionCheck,

  // Socket IO
  socketIO: socketIo,

  // Array Sort Positions
  arraySortPositions,

  // Capitalize
  capitalize,

  // Fetch
  fetchJSON: getJsonFetch,
  fetchText: getTextFetch,

  // csrfToken Analyze
  csrfTokenAnalyze,
};

// Modules
export default legacyModules;
