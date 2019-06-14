# aliyun-oss-assets-uploader

> 阿里云 OSS 网站静态资源上传工具

## 安装

```bash
npm i -D aliyun-oss-assets-uploader
```

## 使用

```js
const uploader = require('aliyun-oss-assets-uploader')

uploader.set({
  accessKeyId: '<accessKeyId>',
  accessKeySecret: '<accessKeySecret>',
  region: '<region>',
  bucket: '<bucket>',
  prefix: '<prefix>',
  assetsDir: '<assetsDir>',
  retry: 3
})

uploader.upload()
.then(() => {
  console.log('upload complete.')
})
.catch(err => {
  console.error(err)
})
```
