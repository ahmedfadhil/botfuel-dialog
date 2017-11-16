const logger = require('logtown')('PromptDialog');
const Dialog = require('./dialog');

/**
 * The prompt dialog prompts the user for a number of entities.
 * @extends Dialog
 */
class PromptDialog extends Dialog {
  /**
   * @constructor
   * @param {Object} config - the bot config
   * @param {class} brain - the bot brain
   * @param {Object} parameters - the dialog parameters,
   * parameters.entities is a map mapping entities to optional parameters
   */
  constructor(config, brain, parameters) {
    super(config, brain, Object.keys(parameters.entities).length + 1, parameters);
  }

  /**
   * Computes the missing entities.
   * @async
   * @param {String} userId - the user id
   * @param {Object[]} messageEntities - the message entities
   * @returns {Promise.<string[]>}
   */
  async computeMissingEntities(userId, messageEntities) {
    logger.debug('computeMissingEntities', userId, messageEntities);
    const { namespace, entities } = this.parameters;
    const dialogEntities = await this.brain.conversationGet(userId, namespace) || {};
    for (const messageEntity of messageEntities) {
      dialogEntities[messageEntity.dim] = messageEntity;
    }
    logger.debug('computeMissingEntities: dialogEntities', dialogEntities);
    await this.brain.conversationSet(userId, namespace, dialogEntities);
    return Object.keys(entities).filter(entityKey => dialogEntities[entityKey] === undefined);
  }

  /**
   * Executes the dialog when status is 'blocked'.
   * @async
   * @param {Adapter} adapter - the adapter
   * @param {String} userId - the user id
   * @param {Object[]} [messageEntities] - the message entities
   * @returns {Promise.<string>} the new dialog status
   */
  async executeWhenBlocked(adapter, userId, messageEntities) {
    logger.debug('executeWhenBlocked', userId, messageEntities);
    await this.display(adapter, userId, 'ask');
    return this.STATUS_WAITING;
  }

  /**
   * Executes the dialog when status is 'waiting'.
   * @async
   * @param {Adapter} adapter - the adapter
   * @param {String} userId - the user id
   * @param {Object[]} messageEntities - the message entities
   * @returns {Promise.<string>} the new dialog status
   */
  async executeWhenWaiting(adapter, userId, messageEntities) {
    logger.debug('executeWhenWaiting', userId, messageEntities);
    for (const messageEntity of messageEntities) {
      if (messageEntity.dim === 'system:boolean') {
        const booleanValue = messageEntity.values[0].value;
        logger.debug('execute: system:boolean', booleanValue);
        if (booleanValue) {
          // eslint-disable-next-line no-await-in-loop
          await this.display(adapter, userId, 'confirm');
          return this.executeWhenReady(adapter, userId, messageEntities);
        }
        // if not confirmed, then discard dialog
        // eslint-disable-next-line no-await-in-loop
        await this.display(adapter, userId, 'discard');
        return this.STATUS_DISCARDED;
      }
    }
    return this.STATUS_BLOCKED;
  }

  /**
   * Executes the dialog when status is 'ready'.
   * @async
   * @param {Adapter} adapter - the adapter
   * @param {String} userId - the user id
   * @param {Object[]} messageEntities - the message entities
   * @returns {Promise.<string>} the new dialog status
   */
  async executeWhenReady(adapter, userId, messageEntities) {
    logger.debug('executeWhenReady', userId, messageEntities, this.parameters.entities);
    // confirm entities
    messageEntities = messageEntities
      .filter(entity => this.parameters.entities[entity.dim] !== undefined);
    const missingEntities = await this.computeMissingEntities(userId, messageEntities);
    await this.display(adapter, userId, 'entities', { messageEntities, missingEntities });
    if (missingEntities.length === 0) {
      return this.executeWhenCompleted(adapter, userId, messageEntities);
    }
    return this.STATUS_READY;
  }

  /**
   * Executes the dialog when status is 'completed'.
   * @async
   * @returns {Promise.<string>} the new dialog status
   */
  async executeWhenCompleted() {
    return this.STATUS_COMPLETED;
  }

  /**
   * Executes the dialog.
   * @async
   * @param {Adapter} adapter - the adapter
   * @param {String} userId the user id
   * @param {Object[]} messageEntities - the message entities
   * @param {String} status - the dialog status
   * @returns {Promise.<string>} the new dialog status
   */
  async execute(adapter, userId, messageEntities, status) {
    logger.debug('execute', userId, messageEntities, status);
    switch (status) {
      case this.STATUS_BLOCKED:
        return this.executeWhenBlocked(adapter, userId, messageEntities);
      case this.STATUS_WAITING:
        return this.executeWhenWaiting(adapter, userId, messageEntities);
      case this.STATUS_READY:
      default:
        return this.executeWhenReady(adapter, userId, messageEntities);
    }
  }
}

module.exports = PromptDialog;
