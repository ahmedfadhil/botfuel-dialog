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

const { checkCredentials } = require('../../src/utils/environment');
const { defaultConfig } = require('../../src/config');
const MissingCredentialsError = require('../../src/errors/missing-credentials-error');

const buildConfig = configPart => Object.assign({}, defaultConfig, configPart);

describe('Environment utils', () => {
  describe('When BOTFUEL_APP_TOKEN is not defined', () => {
    beforeAll(() => {
      delete process.env.BOTFUEL_APP_TOKEN;
    });

    test('should throw an error when using botfuel adapter', async () => {
      const config = buildConfig({ adapter: 'botfuel' });
      const f = () => checkCredentials(config);
      expect(f).toThrowError(MissingCredentialsError);
    });

    test('should throw an error when using mongo brain', async () => {
      const config = buildConfig({ brain: 'mongo' });
      const f = () => checkCredentials(config);
      expect(f).toThrowError(MissingCredentialsError);
    });
  });

  describe('When BOTFUEL_APP_ID is not defined', () => {
    beforeAll(() => {
      delete process.env.BOTFUEL_APP_ID;
    });

    test('should throw an error when using botfuel QnA', async () => {
      const config = buildConfig({ qna: true });
      const f = () => checkCredentials(config);
      expect(f).toThrowError(MissingCredentialsError);
    });

    test('should throw an error when using spellchecking service', async () => {
      const config = buildConfig({ spellchecking: true });
      const f = () => checkCredentials(config);
      expect(f).toThrowError(MissingCredentialsError);
    });
  });

  describe('When BOTFUEL_APP_KEY is not defined', () => {
    beforeAll(() => {
      delete process.env.BOTFUEL_APP_KEY;
    });

    test('should throw an error when using botfuel QnA', async () => {
      const config = buildConfig({ qna: true });
      const f = () => checkCredentials(config);
      expect(f).toThrowError(MissingCredentialsError);
    });

    test('should throw an error when using spellchecking service', async () => {
      const config = buildConfig({ spellchecking: true });
      const f = () => checkCredentials(config);
      expect(f).toThrowError(MissingCredentialsError);
    });
  });
});
