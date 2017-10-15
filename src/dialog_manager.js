const fs = require('fs');

/**
 * Turns NLU output into a dialog stack.
 */
class DialogManager {
  /**
   * Constructor.
   */
  constructor(brain, config) {
    // console.warn('DialogManager.constructor');
    this.brain = brain;
    this.config = config;
    this.intentThreshold = this.config.intentThreshold || 0.8;
  }

  getDialogPath(label) {
    // console.warn('DialogManager.getDialogPath', label);
    const paths = [
      `${this.config.path}/src/controllers/dialogs/${label}.${this.config.adapter}`,
      `${this.config.path}/src/controllers/dialogs/${label}`,
      `${__dirname}/dialogs/${label}.${this.config.adapter}`,
      `${__dirname}/dialogs/${label}`,
    ];
    return paths.map(p => `${p}.js`).find(fs.existsSync) || null;
  }

  getDialog(dialog) {
    // console.warn('DialogManager.getDialog', dialog);
    const path = this.getDialogPath(dialog.label);
    if (path === null) {
      return null;
    }
    const DialogConstructor = require(path);
    return new DialogConstructor(this.config, this.brain, DialogConstructor.params);
  }

  /**
   * Executes the dialogs.
   * @param {string} userId the user id
   * @param {Object[]} dialogs - the dialogs
   * @param {Object[]} intents - the intents
   * @param {Object[]} entities - the entities
   */
  async updateDialogs(userId, dialogs, intents, entities) {
    console.warn('DialogManager.updateDialogs', userId, dialogs, intents, entities);
    intents = intents
      .filter(intent => intent.value > this.intentThreshold)
      .slice(0, 2)
      .sort((intent1, intent2) => {
        const dialog1 = this.getDialog(intent1);
        const dialog2 = this.getDialog(intent2);
        if (dialog1.maxComplexity !== dialog2.maxComplexity) {
          return dialog2.maxComplexity - dialog1.maxComplexity;
        }
        return intent1.value - intent2.value;
      });
    console.warn('DialogManager.updateDialogs: intents', intents);
    for (let i = 0; i < intents.length; i++) {
      const label = intents[i].label;
      if (dialogs.length === 0 || dialogs[dialogs.length - 1].label !== label) {
        dialogs.push({
          label,
          entities,
          order: intents.length - 1 - i,
        });
      }
    }
    if (dialogs.length === 0) { // no intent detected
      const dialog = await this.brain.userGet(userId, 'lastDialog');
      if (dialog !== undefined) {
        dialog.order = 0;
        dialogs.push(dialog);
      } else {
        dialogs.push({
          label: 'default_dialog',
          order: 0,
        });
      }
    }
  }

  /**
   * Executes the dialogs.
   * @param {string} userId the user id
   * @param {Object[]} dialogs - the dialogs
   * @param {Object[]} entities - the entities
   */
  async executeDialogs(userId, dialogs, entities) {
    console.warn('DialogManager.executeDialogs', userId, dialogs, entities);
    const responses = [];
    const user = await this.brain.getUser(userId);
    console.warn('DialogManager.executeDialogs: user', user);
    let done = true;
    let back = false;
    while (done && dialogs.length > 0) {
      const dialog = dialogs.pop();
      if (back) {
        this.getDialog(dialog).getBack(userId, responses);
      }
      console.warn('DialogManager.executeDialogs: dialog', dialog);
      // eslint-disable-next-line no-await-in-loop
      await this.brain.userSet(userId, 'lastDialog', dialog);
      // eslint-disable-next-line no-await-in-loop
      done = await this
        .getDialog(dialog)
        .execute(userId, responses, entities, dialog.order !== 0);
      console.warn('DialogManager.executeDialogs entities:', entities);
      console.warn('DialogManager.executeDialogs: done', done);
      if (!done) {
        dialogs.push(dialog);
      } else {
        back = true;
      }
    }
    await this.brain.userSet(userId, 'dialogs', dialogs);
    return responses;
  }

  /**
   * Populates and executes the stack.
   * @param {string} userId the user id
   * @param {string[]} intents the intents
   * @param {Object[]} entities the transient entities
   */
  async execute(userId, intents, entities) {
    console.warn('DialogManager.execute', userId, intents, entities);
    const dialogs = await this.brain.userGet(userId, 'dialogs');
    await this.updateDialogs(userId, dialogs, intents, entities);
    return this.executeDialogs(userId, dialogs, entities);
  }
}

module.exports = DialogManager;
