export default function capitalize(text) {
  return text.replace(/\b\w/g, function (l) {
    return l.toUpperCase();
  });
}
