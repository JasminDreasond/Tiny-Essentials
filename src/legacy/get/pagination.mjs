import queryUrlJSON from './queryUrlJSON.mjs';

/**
 *  @typedef {{
 *  url: string; // The updated URL prefix to use for each page link.
 *   extraClass: string; // Additional class name passed through.
 *   extraClass2: string; // Additional class name passed through.
 *   page: number; // The current page.
 *   pagination: number[]; // An array of page numbers to be displayed.
 *   previous: boolean; // Whether there are previous pages.
 *   next: boolean; // Whether there are next pages.
 *   firstPagination: boolean; // `true` if page 1 is not in the visible pagination and should be shown separately.
 *   lastPagination: boolean; // `true` if the last page is not in the visible pagination and should be shown separately.
 *   pages: number; // Total number of pages.
 * }} PaginationData
 */

/**
 * Generates pagination metadata for a given query and current page.
 * It builds a list of pages to display and determines whether "next" and "previous" buttons should be shown.
 * The resulting object can be used to render a pagination UI.
 *
 * @param {string} query - The base query string to be appended to URLs (without `?` or `&`).
 * @param {number} page - The current page number.
 * @param {number} total - The total number of pages.
 * @param {string} [url=''] - The base URL to which pagination parameters will be added.
 * @param {string} [extraClass=''] - Additional class name for styling the pagination container.
 * @param {string} [extraClass2=''] - Additional class name for individual page links.
 *
 * @returns {PaginationData} Pagination metadata
 * @deprecated

 */
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

  /** @type {PaginationData} */
  const data = {
    url: url,
    extraClass: extraClass,
    extraClass2: extraClass2,
    next: false,
    previous: false,
    page: -1,
    pages: -1,
    pagination: [],
    firstPagination: true,
    lastPagination: true,
  };

  for (let i = page - 1; i > page - 5; i--) {
    if (i > 0) {
      data.pagination.push(i);
      data.previous = true;
    }
  }
  data.pagination.reverse();
  data.pagination.push(page);
  for (let i = page + 1; i < page + 5; i++) {
    if (i <= total) {
      data.pagination.push(i);
      data.next = true;
    }
  }

  // Build Data and send it
  data.page = page;

  if (data.pagination.indexOf(1) < 0) data.firstPagination = true;
  else data.firstPagination = false;
  if (data.pagination.indexOf(total) < 0) data.lastPagination = true;
  else data.lastPagination = false;

  data.pages = total;

  return data;
}
