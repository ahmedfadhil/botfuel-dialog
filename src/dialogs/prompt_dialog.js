const Dialog = require('./dialog');

/**
 * PromptDialog class.
 */
class PromptDialog extends Dialog {
  constructor(config, brain, parameters) {
    super(config, brain, parameters);
    this.maxComplexity = Object.keys(parameters.entities).length + 1;
  }

  /**
   * Executes.
   * @param {string} id the user id
   * @param {Object[]} responses
   * @param {Object[]} messageEntities - entities array from user message
   */
  async execute(id, responses, messageEntities, confirmDialog) {
    console.warn('PromptDialog.execute', id, responses, messageEntities, confirmDialog);
    messageEntities = messageEntities
      .filter(entity => this.parameters.entities[entity.dim] !== undefined);
    const dialogEntities = await this.brain.conversationGet(id, this.parameters.namespace) || {};
    for (const messageEntity of messageEntities) {
      dialogEntities[messageEntity.dim] = messageEntity;
    }
    console.warn('PromptDialog.execute: dialogEntities', dialogEntities);
    await this.brain.conversationSet(id, this.parameters.namespace, dialogEntities);
    this.confirm(id, responses, messageEntities, confirmDialog);
    const missingEntities = Object
          .keys(this.parameters.entities)
          .filter(entityKey => dialogEntities[entityKey] === undefined);
    this.ask(id, responses, missingEntities);
    return missingEntities.length === 0;
  }

  ask(id, responses, entities) {
    console.warn('PromptDialog.ask', id, responses, entities);
    // TODO: put all this in a single template
    for (const entityKey of entities) {
      this.pushMessages(responses, this.textMessages(id,
                                                     `${this.parameters.namespace}_${entityKey}_ask`,
                                                     { entity: entityKey }));
    }
  }

  confirm(id, responses, entities, confirmDialog) {
    console.warn('PromptDialog.confirm', id, responses, entities, confirmDialog);
    // TODO: put all this in a single template
    if (confirmDialog) {
      this.pushMessages(responses, this.textMessages(id,
                                                     `${this.parameters.namespace}_confirm`));
    }
    for (const entity of entities) {
      this.pushMessages(responses, this.textMessages(id,
                                                     `${this.parameters.namespace}_${entity.dim}_confirm`,
                                                     { entity }));
    }
  }
}

module.exports = PromptDialog;
