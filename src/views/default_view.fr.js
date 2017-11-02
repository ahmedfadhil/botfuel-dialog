const logger = require('logtown')('DefaultView.fr');
const TextView = require('./text_view');

/**
 * Default FR text view
 * @extends TextView
 */
class DefaultView extends TextView {
  /**
   * Get views texts
   * @override
   * @param {object} [parameters={}] - the dialog parameters
   * @return {string[]}
   */
  getTexts(parameters = {}) {
    logger.debug('getTexts', parameters);
    return ['Je n\'ai pas compris.'];
  }
}

module.exports = DefaultView;