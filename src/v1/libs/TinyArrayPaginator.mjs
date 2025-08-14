/**
 * A encapsulated wrapper for array pagination.
 * Provides methods to retrieve paginated results with metadata,
 * while keeping the source array safe from direct modifications.
 */
class TinyArrayPaginator {
  /**
   * Internal storage for the paginated data source.
   * @type {any[]}
   */
  #data;

  /**
   * Gets current stored array.
   * @returns {any[]}
   */
  get data() {
    return this.#data;
  }

  /**
   * Replaces the current data array.
   * @param {any[]} value - The new array to be used as the data source.
   * @throws {TypeError} If the provided value is not an array.
   */
  set data(value) {
    if (!Array.isArray(value)) throw new TypeError('Paginator expects an array as data source.');
    this.#data = value;
  }

  /**
   * Gets the total number of items in the current data array.
   * @returns {number} Total number of stored items.
   */
  get size() {
    return this.#data.length;
  }

  /**
   * Creates a new paginator instance for the given data array.
   * @param {any[]} [data=[]] - The array to be paginated.
   * @throws {TypeError} If the provided data is not an array.
   */
  constructor(data = []) {
    if (!Array.isArray(data)) throw new TypeError('Paginator expects an array as data source.');
    this.#data = data;
  }

  /**
   * Filters data according to a search query and returns paginated results.
   * @param {Object} settings
   * @param {number} settings.page - The page number (1-based index).
   * @param {number} settings.perPage - Items per page.
   * @param {Record<string, any> | ((value: any, index: number, array: any[]) => boolean) | null} [settings.filter=null] - Filtering criteria:
   *   - Object: key-value pairs for exact match or regex string
   *   - Function: custom filter function returning true for items to include
   * @returns {{
   *   items: any[],            // The subset of items for the requested page.
   *   page: number,            // The current (validated) page number.
   *   perPage: number,         // Number of items per page used in the calculation.
   *   totalItems: number,      // Total number of items in the data array.
   *   totalPages: number,      // Total number of pages available.
   *   hasPrev: boolean,        // Whether a previous page exists.
   *   hasNext: boolean         // Whether a next page exists.
   * }}
   */
  get({ page, perPage, filter = null }) {
    if (!Number.isInteger(page) || page < 1)
      throw new RangeError('Page number must be a positive integer.');
    if (!Number.isInteger(perPage) || perPage < 1)
      throw new RangeError('Items per page must be a positive integer.');

    let dataToUse;

    if (filter) {
      // use cached filtered data if filter function is same
      if (typeof filter === 'function') {
        dataToUse = this.#data.filter(filter);
      } else if (typeof filter === 'object') {
        dataToUse = this.#data.filter((item) =>
          Object.entries(filter).every(([key, value]) => {
            const v = item[key];
            if (value instanceof RegExp) return value.test(v);
            if (typeof value === 'string' && typeof v === 'string') return v.includes(value);
            return v === value;
          }),
        );
      } else {
        throw new TypeError('Filter must be an object or a function');
      }
    } else {
      dataToUse = this.#data;
    }

    const totalItems = dataToUse.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

    // Ensure page is within valid range
    const safePage = Math.min(page, totalPages);

    const start = (safePage - 1) * perPage;
    const end = start + perPage;

    return {
      items: dataToUse.slice(start, end),
      page: safePage,
      perPage,
      totalItems,
      totalPages,
      hasPrev: safePage > 1,
      hasNext: safePage < totalPages,
    };
  }
}

export default TinyArrayPaginator;
