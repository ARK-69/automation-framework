module.exports = {
  default: `--require-module ts-node/register --require ./steps/**/*.ts --format json:reports/cucumber-report.json`
};
