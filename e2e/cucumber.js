module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: ['support/**/*.js', 'features/step_definitions/**/*.js'],
    format: ['progress'],
    parallel: 1,
    worldParameters: {},
  },
};
