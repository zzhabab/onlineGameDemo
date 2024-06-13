/**
 * 如其名, 用来消费sourcemap
 */
const SourceMapConsumer = require('source-map')
const fs = require('fs')
const sourceMapConsumer = SourceMapConsumer.SourceMapConsumer
/**
 * 解析Source Map文件
 * 通过文件读取的方式, 将sourcemap文件传入
 */
sourceMapConsumer.with(fs.readFileSync('../sourcemaps/Login-CxMpvwRm.js.map', 'utf-8'), null, consumer => {
  /**
   * originalPositionFor
   * 传入编译后文件的位置信息
   * 得到对应的源码位置信息
   */
  const originalPosition = consumer.originalPositionFor({
    source: fs.readFileSync('../dist/assets/Login-CxMpvwRm.js', 'utf-8'),
    // 举例: 报错堆栈信息为, test.js:40:57515
    line: 1,
    column: 13984
  });

  /**
   * originalPosition是一个对象, 包含定位到的
   * 源代码文件位置
   * 和具体定位的行列信息等
   */
  console.log(originalPosition);

  /**
   * sourceContentFor 通过解析出的路径
   * 得到源代码的文本信息
   */
  const content = consumer.sourceContentFor(consumer.sources.find(source => source === originalPosition
  .source));

  /**
   * content就是对应的源代码的原始文本了
   */
  console.log(content)

  /**
   * 根据上述信息, 我们可以扩展出一个功能更完善的工具
   * 比如在团队内部部署一个微型服务, 自助上传souremap, 输入报错信息, 然后打印出具体的错误
   * 还可以做报错代码的高亮展示等优化
   * 
   * 更进一步地, 可以跟git直接关联起来, 导航到具体的报错文件, 更加直观
   */
});