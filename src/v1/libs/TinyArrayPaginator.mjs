/**
 * A predicate function used to determine whether an item should be included in the filtered results.
 * Works similarly to the callback function of `Array.prototype.filter`.
 *
 * @callback GetFilter
 * @param {any} value - The current element being processed in the array.
 * @param {number} index - The index of the current element within the array.
 * @param {any[]} array - The full array being processed.
 * @returns {boolean} Returns `true` to include the element in the results, or `false` to exclude it.
 */

/**
 * A encapsulated wrapper for array pagination.
 * Provides methods to retrieve paginated results with metadata,
 * while keeping the source array safe from direct modifications.
 */
class TinyArrayPaginator {
  /**
   * Internal storage for the paginated data source.
   * @type {any[]|Set<any>}
   */
  #data;

  /**
   * Gets current stored array.
   * @returns {any[]|Set<any>}
   */
  get data() {
    return this.#data;
  }

  /**
   * Replaces the current data array.
   * @param {any[]|Set<any>} value - The new array to be used as the data source.
   * @throws {TypeError} If the provided value is not an array.
   */
  set data(value) {
    if (!Array.isArray(value) && !(value instanceof Set))
      throw new TypeError('Paginator expects an array or Set as data source.');
    this.#data = value;
  }

  /**
   * Gets the total number of items in the current data array.
   * @returns {number} Total number of stored items.
   */
  get size() {
    return Array.isArray(this.#data) ? this.#data.length : this.#data.size;
  }

  /**
   * Creates a new paginator instance for the given data array.
   * @param {any[]|Set<any>} data - The array to be paginated.
   * @throws {TypeError} If the provided data is not an array.
   */
  constructor(data) {
    if (!Array.isArray(data) && !(data instanceof Set))
      throw new TypeError('Paginator expects an array or Set as data source.');
    this.#data = data;
  }

  /**
   * Filters data according to a search query and returns paginated results.
   * @param {Object} settings
   * @param {number} settings.page - The page number (1-based index).
   * @param {number} settings.perPage - Items per page.
   * @param {Record<string, any> | GetFilter} [settings.filter=null] - Filtering criteria:
   *   - Object: key-value pairs for exact match, substring match, or RegExp
   *   - Function: custom filter function returning true for items to include
   * @returns {{
   *   items: any[],            // The subset of items for the requested page.
   *   page: number,            // The current (validated) page number.
   *   perPage: number,         // Number of items per page used in the calculation.
   *   totalItems: number,      // Total number of items in the filtered data.
   *   totalPages: number,      // Total number of pages available.
   *   hasPrev: boolean,        // Whether a previous page exists.
   *   hasNext: boolean         // Whether a next page exists.
   * }}
   */
  get({ page, perPage, filter }) {
    if (!Number.isInteger(page) || page < 1)
      throw new RangeError('Page number must be a positive integer.');
    if (!Number.isInteger(perPage) || perPage < 1)
      throw new RangeError('Items per page must be a positive integer.');

    const data = Array.isArray(this.#data) ? this.#data : Array.from(this.#data);
    let dataToUse = data;

    if (filter) {
      if (typeof filter === 'function') {
        dataToUse = data.filter((item, idx, arr) => filter(item, idx, arr));
      } else if (typeof filter === 'object') {
        dataToUse = data.filter((item) =>
          Object.entries(filter).every(([key, value]) => {
            const v = item[key];
            if (value instanceof RegExp) return value.test(v);
            return v === value;
          }),
        );
      } else {
        throw new TypeError('Filter must be an object or a function');
      }
    } else {
      dataToUse = data;
    }

    const totalItems = dataToUse.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

    // Ensure page is within valid range
    const safePage = Math.min(page, totalPages);

    const start = (safePage - 1) * perPage;
    const end = start + perPage;
    const hasPrev = safePage > 1;
    const hasNext = safePage < totalPages;

    return {
      items: dataToUse.slice(start, end),
      page: safePage,
      perPage,
      totalItems,
      totalPages,
      hasPrev,
      hasNext,
    };
  }
}

export default TinyArrayPaginator;
