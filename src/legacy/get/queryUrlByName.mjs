export default function queryUrlByName(name, url) {
  let newName = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + newName + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
