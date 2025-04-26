// @ts-nocheck

/**
 * Executes a paginated query on the database, returning the result set along with pagination metadata.
 *
 * @async
 * @param {Record<string, any>} db - Database instance with a `.query(sql, params)` method.
 * @param {Object} data - Query configuration options.
 * @param {string} data.from - The table or view name to query from.
 * @param {string} [data.where] - Optional WHERE clause without the keyword (e.g., `"status = 'active'"`).
 * @param {Array<*>} [data.params] - Optional parameters for the SQL query placeholders.
 * @param {string} [data.select="*"] - Fields to select in the query.
 * @param {string} data.order - SQL ORDER BY clause (e.g., `"created_at DESC"`).
 * @param {number} [data.limit] - Number of rows per page.
 * @param {number|string} [data.page] - Current page number or `'last'` to get the last page.
 * @param {number} [data.count] - Optional total count override (skip count query if provided).
 * @param {boolean} [data.count_rows=false] - Whether to include a row number for each result.
 * @returns {Promise<Record<string, any>>} Resolves with pagination metadata and result set.
 * @returns {number} return.count - Total number of matched rows.
 * @returns {Array<*>} return.data - The paginated data from the query.
 * @returns {number} return.pages - Total number of pages.
 * @returns {number} return.page - Current page number after validation.
 * @returns {number} return.start - Row offset used in the query.
 */
export default async function pagination(db, data) {
  // Create Where
  if (data.where) data.where = ' WHERE ' + data.where;
  else data.where = '';

  // Values
  let start = 0;
  let page;
  let pages;
  let edit_count;

  if (typeof data.page === 'number') {
    // Get Count
    if (!data.count) {
      edit_count = await db.query(`SELECT COUNT(*) FROM ${data.from}${data.where}`, data.params);
      edit_count = edit_count[0]['COUNT(*)'];
    } else edit_count = data.count;

    // Prepare Numbers
    pages = Math.ceil(edit_count / data.limit);

    // Default
    page = data.page;

    // Is Last
    if (page === 'last') page = pages;
    // is NaN
    else if (isNaN(page)) page = 1;
    // Bigger
    else if (page > pages) page = pages;
    // Smaller
    else if (page < 1) page = 1;

    // Offset
    if (page) start = Number(page - 1) * data.limit;
    else {
      start = 0;
      page = 1;
    }
  }

  if (!data.select) data.select = '*';

  // Count Rows
  let count_rows = {
    select: '',
    from: '',
  };

  if (data.count_rows)
    count_rows = {
      select: `(@row_number:=@row_number + 1) AS row_num, `,
      from: `(SELECT @row_number:=${start}) AS row_number, `,
    };

  // Edits
  let tiny_query = `SELECT ${count_rows.select}${data.select} FROM ${count_rows.from}${data.from}${data.where} ORDER BY ${data.order}`;
  if (typeof data.limit === 'number') tiny_query += ` LIMIT ${data.limit}`;
  if (typeof data.page === 'number') tiny_query += ` OFFSET ${start}`;

  let edits = await db.query(tiny_query, data.params);

  // Complete
  return { count: edit_count, data: edits, pages: pages, page: page, start: start };
}
