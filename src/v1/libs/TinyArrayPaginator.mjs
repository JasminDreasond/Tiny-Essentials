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
   * Retrieves a paginated slice of the data along with pagination metadata.
   * @param {number} [page=1] - The page number (1-based index). Must be a positive integer.
   * @param {number} [perPage=10] - The number of items per page. Must be a positive integer.
   * @returns {{
   *   items: any[],            // The subset of items for the requested page.
   *   page: number,            // The current (validated) page number.
   *   perPage: number,         // Number of items per page used in the calculation.
   *   totalItems: number,      // Total number of items in the data array.
   *   totalPages: number,      // Total number of pages available.
   *   hasPrev: boolean,        // Whether a previous page exists.
   *   hasNext: boolean         // Whether a next page exists.
   * }}
   * @throws {RangeError} If `page` or `perPage` are not positive integers.
   */
  get(page = 1, perPage = 10) {
    if (!Number.isInteger(page) || page < 1) {
      throw new RangeError('Page number must be a positive integer.');
    }
    if (!Number.isInteger(perPage) || perPage < 1) {
      throw new RangeError('Items per page must be a positive integer.');
    }

    const totalItems = this.#data.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

    // Ensure page is within valid range
    const safePage = Math.min(page, totalPages);

    const start = (safePage - 1) * perPage;
    const end = start + perPage;

    return {
      items: this.#data.slice(start, end),
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
