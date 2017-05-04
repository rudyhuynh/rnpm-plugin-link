module.exports = [{
  func: require('./src/link'),
  description: 'Links images',
  name: 'link-images [packageName]',
}, {
  func: require('./src/unlink'),
  description: 'Unlink images',
  name: 'unlink-images <packageName>',
}];

// abc def
