var pkg = require('./package.json')

export default {
  entry: 'src/y-xml.js',
  moduleName: 'yXml',
  format: 'umd',
  dest: 'y-xml.node.js',
  sourceMap: true,
  banner: `
/**
 * ${pkg.name} - ${pkg.description}
 * @version v${pkg.version}
 * @license ${pkg.license}
 */
`
}
