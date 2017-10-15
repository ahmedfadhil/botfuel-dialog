const _ = require('underscore');
const nlp = require('botfuel-nlp-sdk');

/**
 * Class for extracting entities.
 */
class WsExtractor {
  /**
   * Constructor.
   */
  constructor(parameters) {
    this.client = new nlp.EntityExtraction({
      appId: process.env.BOTFUEL_APP_ID,
      appKey: process.env.BOTFUEL_APP_KEY,
    });
    this.parameters = parameters;
  }

  /**
   * @param {string} sentence the sentence
   */
  async compute(sentence) {
    // console.warn('WsExtractor.compute', sentence);
    const query = _.clone(this.parameters);
    _.extend(query, { sentence });
    return this.client.compute(query);
  }
}

module.exports = WsExtractor;
