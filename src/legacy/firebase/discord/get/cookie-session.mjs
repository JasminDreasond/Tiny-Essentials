import objType from '../../../get/objType.mjs';

export default function cookieSession(req, where) {
  // Get Token
  if (objType(req.session, 'object') && typeof req.session[where] === 'string')
    return req.session[where];
  // Nope
  else return null;
}
