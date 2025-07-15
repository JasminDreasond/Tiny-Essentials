import checkDomain from './check_domain.mjs';
import objType from '../get/objType.mjs';
import isEmulator from '../firebase/isEmulator.mjs';

/**
 * @typedef {{
 *  verified: boolean; // Whether the domain is verified.
 *  domain: string|null|true|string[]; // The detected domain from the request.
 *  isStaticPath: boolean // Whether the request matches a static path.
 * }} DomainResult
 */

/**
 * @function domainValidator
 *
 * Validates the request's domain and optionally checks if the request is for a static path.
 * This is useful for filtering requests by origin or allowing access from specific domains only.
 * Also detects if Firebase is running in emulator mode, which bypasses domain validation.
 *
 * @param {import('express').Request} req - The Express request object.
 *   - `req.url`: Full URL path.
 *   - `req.headers`: Expected to contain 'host', 'x-forwarded-host', etc.
 * @param {Record<string, any>} cfg - Configuration object.
 *   @property {string|string[]} cfg.domain - The allowed domain(s) to validate against.
 *   @property {string[]} [cfg.staticPath] - Optional list of static paths to validate.
 *
 * @returns {DomainResult}
 * @deprecated
 *
 * @example
 * const result = domainValidator(req, {
 *   domain: ['example.com', 'sub.example.com'],
 *   staticPath: ['/assets/', '/static/']
 * });
 *
 * if (result.verified) {
 *   console.log('Domain OK:', result.domain);
 * }
 */

export default function domainValidator(req, cfg) {
  // Start Domain Verification
  let domainStatus = { verified: false, domain: checkDomain.get(req), isStaticPath: false };

  // Path
  var prepareUrlPath = req.url.split('/');
  // @ts-ignore
  req.url_path = [];
  for (const item in prepareUrlPath) {
    if (Number(item) > 0) {
      // Insert URL Path
      // @ts-ignore
      req.url_path.push(prepareUrlPath[item].split(/[?#]/)[0]);
    }
  }

  // Is Obj
  if (objType(cfg, 'object')) {
    // Firebase Is Emulator
    let firebaseIsEmulator = false;
    if (isEmulator) {
      firebaseIsEmulator = isEmulator();
    }

    // Verify String
    if (
      (typeof cfg.domain === 'string' && cfg.domain === domainStatus.domain) ||
      firebaseIsEmulator
    ) {
      domainStatus.verified = true;
    }

    // Array Domains
    else if (Array.isArray(cfg.domain)) {
      for (const item in cfg.domain) {
        if (typeof cfg.domain[item] === 'string' && cfg.domain[item] === domainStatus.domain) {
          domainStatus.verified = true;
          break;
        }
      }
    }

    // is Valid
    if (domainStatus.verified) {
      // Validate Static Path
      if (Array.isArray(cfg.staticPath)) {
        for (const item in cfg.staticPath) {
          if (
            typeof cfg.staticPath[item] === 'string' &&
            req.url.startsWith(cfg.staticPath[item])
          ) {
            domainStatus.isStaticPath = true;
            break;
          }
        }
      }
    }
  }

  // Result
  return domainStatus;
}
