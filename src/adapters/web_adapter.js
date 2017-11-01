const express = require('express');
const rp = require('request-promise');
const bodyParser = require('body-parser');
const logger = require('logtown')('WebAdapter');
const Adapter = require('./adapter');

/**
 * Adapter that connect bot to a web platform
 * @extends Adapter
 */
class WebAdapter extends Adapter {
  /**
   * Run the adapter
   * @async
   * @returns {Promise.<void>}
   */
  async run() {
    logger.debug('run');
    const app = express();
    app.use(bodyParser.json());
    this.createRoutes(app);
    const port = process.env.PORT || process.env.BOTFUEL_ADAPTER_PORT || 5000;
    app.listen(port, () => logger.debug('run: listening on port', port));
  }

  /**
   * Create adapter routes
   * @param {Object} app - the express app
   * @returns {void}
   */
  createRoutes(app) {
    app.post('/webhook', (req, res) => this.handleMessage(req, res));
  }

  /**
   * Request web platform to send response
   * @async
   * @param {Object} requestOptions - the request options
   * @returns {Promise.<void>}
   */
  async postResponse(requestOptions) {
    logger.debug('sendResponse', requestOptions);
    const options = Object.assign({ method: 'POST', json: true }, requestOptions);
    try {
      const response = await rp(options);
      if (response.statusCode !== 200) { // not handled on messenger
        logger.error('sendResponse: KO', response);
      } else {
        logger.debug('sendResponse: OK');
      }
    } catch (error) {
      logger.error('sendResponse: catch KO', error.message || error.error || error);
    }
  }
}

module.exports = WebAdapter;
