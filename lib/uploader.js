const path = require('path')
const fs = require('fs')
const OSS = require('ali-oss')

const requiredOptions = [
  'accessKeyId',
  'accessKeySecret',
  'region',
  'bucket',
  'assetsDir'
]

const uploader = {

  _options: {},
  _client: null,

  set (options) {
    Object.assign(this._options, options, {
      prefix: options.prefix || '',
      retry: options.retry || 0
    })
    this._client = new OSS({
      accessKeyId: this._options.accessKeyId,
      accessKeySecret: this._options.accessKeySecret,
      region: this._options.region,
      bucket: this._options.bucket
    })
    return this
  },

  upload () {
    const client = this._client
    const options = this._options
    checkOptions(options)
    return retry(() => upload(client, options), options.retry)
  }

}

function checkOptions (options) {
  requiredOptions.forEach(name => {
    if (!options[name]) {
      throw new Error('option "' + name + '" required')
    }
  })
}

function retry (action, time) {
  return action()
  .catch(err => {
    if (time > 0) {
      console.log('retrying... (%d)', time)
      return retry(action, time - 1)
    } else {
      return Promise.reject(err)
    }
  })
}

function upload (client, options) {
  const fileList = getFileList(options.assetsDir)
  const list = fileList.map(file => ({
    key: getKey(options.assetsDir, file, options.prefix),
    file
  }))
  return doUpload(client, list, 0)
}

function doUpload (client, list, index) {
  const item = list[index]
  if (!item) { return Promise.resolve() }
  console.log('uploading: %s', item.file)
  return client.put(item.key, item.file)
  .then(() => doUpload(client, list, index + 1))
}

function getFileList (root) {
  const fileList = []
  const list = fs.readdirSync(root)
  list.forEach(file => {
    const pathName = path.join(root, file)
    const stats = fs.statSync(pathName)
    fileList.push(stats.isDirectory() ? getFileList(pathName) : pathName)
  })
  return fileList.join().split(',').filter(function (file) { return file })
}

function getKey (root, file, prefix) {
  return prefix + path.relative(root, file).replace(/\\/g, '/')
}

module.exports = uploader
