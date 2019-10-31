const {Utility} = require('../../build/lib/Utility');
const mockStdin = require('mock-stdin').stdin();

module.exports = {
  withAllStdIn(data) {
    // 启动了等待输入输出
    Utility.withAllStdIn((input) => {
      // do nothing
    });

    mockStdin.emit('data');
    mockStdin.send(data);
    mockStdin.end();
  }
};