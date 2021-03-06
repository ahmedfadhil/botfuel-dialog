/* eslint-disable prefer-arrow-callback */

const expect = require('expect.js');
const { Bot, BotTextMessage, UserTextMessage } = require('botfuel-dialog');
const config = require('../test-config');

describe('Multiple intents', () => {
  it('should understand multiple one-turn intents in the same sentence', async function () {
    const bot = new Bot(config);
    const userId = bot.adapter.userId;
    await bot.play([new UserTextMessage('Hello bot. This is great.')]);
    expect(bot.adapter.log).to.eql(
      [
        new UserTextMessage('Hello bot. This is great.'),
        new BotTextMessage('Hello human!'),
        new BotTextMessage("You're welcome!"),
      ].map(msg => msg.toJson(userId)),
    );
    const user = await bot.brain.getUser(userId);
    const dialogs = await bot.brain.getDialogs(userId);
    expect(user.conversations.length).to.be(1);
    expect(dialogs.stack.length).to.be(0);
    expect(dialogs.previous.length).to.be(2);
  });

  it('should understand multiple intents in the same sentence', async function () {
    const bot = new Bot(config);
    const userId = bot.adapter.userId;
    await bot.play([new UserTextMessage('Hello bot. I leave from Paris.')]);
    expect(bot.adapter.log).to.eql(
      [
        new UserTextMessage('Hello bot. I leave from Paris.'),
        new BotTextMessage('Hello human!'),
        new BotTextMessage('Entities defined: city'),
        new BotTextMessage('Entities needed: time'),
        new BotTextMessage('Which time?'),
      ].map(msg => msg.toJson(userId)),
    );
    const user = await bot.brain.getUser(userId);
    const dialogs = await bot.brain.getDialogs(userId);
    expect(user.conversations.length).to.be(1);
    expect(dialogs.stack.length).to.be(1);
    expect(dialogs.previous.length).to.be(1);
  });

  it('should understand two prompts in the same sentence (1)', async function () {
    const bot = new Bot(config);
    const userId = bot.adapter.userId;
    await bot.play([
      new UserTextMessage('I leave tomorrow from Paris. I want to buy a car.'),
      new UserTextMessage('Yes'),
    ]);
    expect(bot.adapter.log).to.eql(
      [
        new UserTextMessage('I leave tomorrow from Paris. I want to buy a car.'),
        new BotTextMessage('Entities defined: time, city'),
        new BotTextMessage('Do you still want to purchase a car?'),
        new UserTextMessage('Yes'),
        new BotTextMessage('You still want to purchase a car.'),
        new BotTextMessage('Entities defined: '),
        new BotTextMessage('Entities needed: color, transmission'),
        new BotTextMessage('Which color?'),
      ].map(msg => msg.toJson(userId)),
    );
    const user = await bot.brain.getUser(userId);
    const dialogs = await bot.brain.getDialogs(userId);
    expect(user.conversations.length).to.be(1);
    expect(dialogs.stack.length).to.be(1);
    expect(dialogs.previous.length).to.be(2);
  });

  it('should understand two prompts in the same sentence (2)', async function () {
    const bot = new Bot(config);
    const userId = bot.adapter.userId;
    await bot.play([
      new UserTextMessage('I leave from Paris. I want to buy a car.'),
      new UserTextMessage('tomorrow'),
      new UserTextMessage('Yes'),
    ]);
    expect(bot.adapter.log).to.eql(
      [
        new UserTextMessage('I leave from Paris. I want to buy a car.'),
        new BotTextMessage('Entities defined: city'),
        new BotTextMessage('Entities needed: time'),
        new BotTextMessage('Which time?'),
        new UserTextMessage('tomorrow'),
        new BotTextMessage('Entities defined: time, city'),
        new BotTextMessage('Do you still want to purchase a car?'),
        new UserTextMessage('Yes'),
        new BotTextMessage('You still want to purchase a car.'),
        new BotTextMessage('Entities defined: '),
        new BotTextMessage('Entities needed: color, transmission'),
        new BotTextMessage('Which color?'),
      ].map(msg => msg.toJson(userId)),
    );
    const user = await bot.brain.getUser(userId);
    const dialogs = await bot.brain.getDialogs(userId);
    expect(user.conversations.length).to.be(1);
    expect(dialogs.stack.length).to.be(1);
    expect(dialogs.previous.length).to.be(2);
  });

  it('should forget about previous confirmation', async function () {
    const bot = new Bot(config);
    const userId = bot.adapter.userId;
    await bot.play(
      [
        new UserTextMessage('I leave from Paris. I want to buy a car.'),
        new UserTextMessage('tomorrow'),
        new UserTextMessage('No'),
        new UserTextMessage('I leave from Paris. I want to buy a car.'),
        new UserTextMessage('Yes'),
      ],
    );
    expect(bot.adapter.log).to.eql(
      [
        new UserTextMessage('I leave from Paris. I want to buy a car.'),
        new BotTextMessage('Entities defined: city'),
        new BotTextMessage('Entities needed: time'),
        new BotTextMessage('Which time?'),
        new UserTextMessage('tomorrow'),
        new BotTextMessage('Entities defined: time, city'),
        new BotTextMessage('Do you still want to purchase a car?'),
        new UserTextMessage('No'),
        new BotTextMessage('You don’t want to purchase a car anymore.'),
        new UserTextMessage('I leave from Paris. I want to buy a car.'),
        new BotTextMessage('Entities defined: time, city'),
        new BotTextMessage('Do you still want to purchase a car?'),
        new UserTextMessage('Yes'),
        new BotTextMessage('You still want to purchase a car.'),
        new BotTextMessage('Entities defined: '),
        new BotTextMessage('Entities needed: color, transmission'),
        new BotTextMessage('Which color?'),
      ].map(msg => msg.toJson(userId)),
    );
    const user = await bot.brain.getUser(userId);
    const dialogs = await bot.brain.getDialogs(userId);
    expect(user.conversations.length).to.be(1);
    expect(dialogs.stack.length).to.be(1);
    expect(dialogs.previous.length).to.be(4);
  });
});
