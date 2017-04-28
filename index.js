module.exports = [{
  func: require('./src/link'),
  description: 'Links all native dependencies',
  name: 'link-image [packageName]',
}, {
  func: require('./src/unlink'),
  description: 'Unlink native dependency',
  name: 'unlink-image <packageName>',
}];
