export default function getDBValue(data) {
  let new_data = null;
  if (data && typeof data.val === 'function') new_data = data.val();
  return new_data;
}
