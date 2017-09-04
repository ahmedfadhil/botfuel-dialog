const Fs = require('fs');
const Natural = require('natural');
const FeatureExtraction = require('./feature_extraction');

const intentSuffix = '.intent';

class Train {
  constructor(config, path) {
    console.log('Train.constructor', config, path);
    this.config = config;
    this.path = path;
    this.classifier = new Natural.LogisticRegressionClassifier(Natural.PorterStemmerFr);
    this.modelFilename = `${path}/models/${config.modelName}`;
    this.intentDirname = `${path}/src/data/intents`;
    this.featureExtraction = new FeatureExtraction(config.locale);
  }

  run() {
    console.log('Train.run');
    Fs
      .readdirSync(this.intentDirname, 'utf8')
      .filter(fileName => fileName.substr(-intentSuffix.length) === intentSuffix)
      .map((fileName) => {
        console.log('train:', fileName);
        const intent = fileName.substring(0, fileName.length - intentSuffix.length);
        console.log('train:', intent);
        return Fs
          .readFileSync(`${this.intentDirname}/${fileName}`, 'utf8')
          .toString()
          .split('\n')
          .map((line) => {
            console.log('train:', line);
            const features = this.featureExtraction.computeSync(line, null);
            console.log('train:', features, intent);
            return this.classifier.addDocument(features, intent);
          });
      });
    this.classifier.train();
    this.classifier.save(this.modelFilename);
  }
}

module.exports = Train;
