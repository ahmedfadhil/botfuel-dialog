/**
 * Copyright (c) 2017 - present, Botfuel (https://www.botfuel.io).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const logger = require('logtown')('PromptView');
const { BotTextMessage } = require('../messages');
const View = require('./view');

/**
 * Prompt dialog's view.
 * @extends View
 */
class PromptView extends View {
  // eslint-disable-next-line require-jsdoc
  render(key, data) {
    logger.debug('render', key, data);
    switch (key) {
      case 'ask':
        return this.renderAsk();
      case 'confirm':
        return this.renderConfirm();
      case 'discard':
        return this.renderDiscard();
      case 'cancel':
        return this.renderCancel();
      case 'entities': {
        const { matchedEntities, missingEntities } = data;
        return this.renderEntities(matchedEntities, missingEntities);
      }
      default:
        return null;
    }
  }

  /**
   * Asks for confirmation.
   * @private
   * @returns {Object[]} the bot messages
   */
  renderAsk() {
    return [new BotTextMessage('continue dialog?')];
  }

  /**
   * Confirms the dialog.
   * @private
   * @returns {Object[]} the bot messages
   */
  renderConfirm() {
    return [new BotTextMessage('dialog confirmed.')];
  }

  /**
   * Discards the dialog.
   * @private
   * @returns {Object[]} the bot messages
   */
  renderDiscard() {
    return [new BotTextMessage('dialog discarded.')];
  }

  /**
   * Cancels the dialog.
   * @private
   * @returns {Object[]} the bot messages
   */
  renderCancel() {
    return [new BotTextMessage('dialog cancelled.')];
  }

  /**
   * Confirms the defined entities and asks for the needed ones.
   * @private
   * @param {Object[]} matchedEntities - the defined entities
   * @param {String[]} missingEntities - the needed entities
   * @returns {Object[]} the bot messages
   */
  renderEntities(matchedEntities, missingEntities) {
    const messages = [];
    if (Object.keys(matchedEntities).length !== 0) {
      messages.push(
        new BotTextMessage(
          `Entities defined: ${Object.keys(matchedEntities).filter(name => !!matchedEntities[name]).join(', ')}`,
        ),
      );
    }
    if (Object.keys(missingEntities).length !== 0) {
      messages.push(
        new BotTextMessage(`Entities needed: ${Object.keys(missingEntities).join(', ')}`),
      );
      messages.push(new BotTextMessage(`Which ${Object.keys(missingEntities)[0]}?`));
    }
    return messages;
  }
}

module.exports = PromptView;
