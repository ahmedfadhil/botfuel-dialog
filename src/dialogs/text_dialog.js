const Dialog = require('./dialog');

/**
 * TextDialog class.
 */
class TextDialog extends Dialog {
  /**
   * Constructor.
   */
  constructor(config, brain, parameters) {
    super(config, brain, parameters);
    this.maxComplexity = 1;
  }

  /**
   * Executes.
   * @param {string} id the user id
   */
  async execute(id, responses, messageEntities) {
    console.warn('TextDialog.execute', id, responses, messageEntities);
    this.pushMessages(responses, this.textMessages(id, this.parameters.template, messageEntities));
    return true;
  }
}

module.exports = TextDialog;
