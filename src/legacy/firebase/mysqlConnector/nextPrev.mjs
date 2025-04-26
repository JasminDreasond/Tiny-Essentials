// @ts-nocheck

/**
 * Executes a directional query (next or previous) based on a position value and timestamp, returning a single row.
 *
 * @async
 * @param {Record<string, any>} db - The database instance with a `.query(sql, params)` method.
 * @param {Object} tiny_search - Configuration object for the query.
 * @param {string} tiny_search.select - SQL SELECT fields.
 * @param {string} tiny_search.from - SQL FROM clause.
 * @param {string} [tiny_search.where] - Optional WHERE clause (without 'WHERE') to filter results.
 * @param {Array<*>} tiny_search.params - Parameters for the query placeholders.
 * @param {*} tiny_search.position - Value to compare in the directional filter (typically an ID or timestamp).
 * @param {boolean} [tiny_search.direction_r=false] - If `true`, selects previous record (uses `<`), otherwise selects next (`>`).
 * @param {Object} tiny_search.database - Object with database structure details.
 * @param {string} tiny_search.database.name - The table name or alias used in the query.
 * @param {string} tiny_search.database.timeVar - Column name used for ordering chronologically (e.g., `"created_at"`).
 * @param {string} tiny_search.database.positionVar - Column name used for the directional condition (e.g., `"id"`).
 * @returns {Promise<Object|null>} Resolves with the selected row or `null` if none is found.
 */
export default async function nextPrev(db, tiny_search) {
  // Validate Database
  if (
    tiny_search.database &&
    typeof tiny_search.database.name === 'string' &&
    typeof tiny_search.database.timeVar === 'string' &&
    typeof tiny_search.database.positionVar === 'string'
  ) {
    // Prepare Tiny Search
    if (tiny_search.where) tiny_search.where += ' AND ';
    tiny_search.params.push(tiny_search.position);

    // Select Direction
    let tiny_direction = '';
    let tiny_order = '';
    if (tiny_search.direction_r) {
      tiny_direction = '<';
      tiny_order = `${tiny_search.database.name}.${tiny_search.database.timeVar} DESC`;
    } else {
      tiny_direction = '>';
      tiny_order = `${tiny_search.database.name}.${tiny_search.database.timeVar}`;
    }

    // Select Config
    const existData = await db.query(
      `SELECT ${tiny_search.select} FROM ${tiny_search.from}
                WHERE ${tiny_search.where}${tiny_search.database.name}.${tiny_search.database.positionVar} ${tiny_direction} ? ORDER BY ${tiny_order} LIMIT 1`,
      tiny_search.params,
    );

    // Exist Data
    if (existData.length > 0) return existData[0];
    else {
      // Fix Where
      if (tiny_search.where)
        tiny_search.where = 'WHERE ' + tiny_search.where.substring(0, tiny_search.where.length - 5);

      // Select Config
      const existData2 = await db.query(
        `SELECT ${tiny_search.select} FROM ${tiny_search.from}
                    ${tiny_search.where} ORDER BY ${tiny_order} LIMIT 1`,
        tiny_search.params,
      );

      // Exist Data
      if (existData2.length > 0) return existData2[0];
      else return null;
    }
  }

  // Nope
  else return null;
}
