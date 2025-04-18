import queryUrlJSON from './queryUrlJSON.mjs';

export default function pagination(
  query,
  page,
  total,
  url = '',
  extraClass = '',
  extraClass2 = '',
) {
  // Fix URL
  if (url) {
    // Final URL Result
    const finalURLResult = function (sqT = '') {
      if (query) return sqT + query + '&page=';
      else return 'page=';
    };

    // Param Fixed
    const params = queryUrlJSON(url);
    if (Object.keys(params).length > 0) {
      if (params.page) {
        url = url
          .replace(finalURLResult('&') + params.page, '')
          .replace('?' + query + '=' + params.page, '?')
          .replace('?&', '?');

        if (Object.keys(params).length === 1) url += finalURLResult();
        else url += finalURLResult('&');
      } else url += finalURLResult('&');
    } else url += finalURLResult('?');
  }

  // Pagination

  const pagination = [];
  const data = {
    url: url,
    extraClass: extraClass,
    extraClass2: extraClass2,
  };

  data.next = false;
  data.previous = false;
  for (let i = page - 1; i > page - 5; i--) {
    if (i > 0) {
      pagination.push(i);
      data.previous = true;
    }
  }
  pagination.reverse();
  pagination.push(page);
  for (let i = page + 1; i < page + 5; i++) {
    if (i <= total) {
      pagination.push(i);
      data.next = true;
    }
  }

  // Build Data and send it
  data.page = page;
  data.pagination = pagination;

  if (pagination.indexOf(1) < 0) data.firstPagination = true;
  else data.firstPagination = false;
  if (pagination.indexOf(total) < 0) data.lastPagination = true;
  else data.lastPagination = false;

  data.pages = total;

  return data;
}
