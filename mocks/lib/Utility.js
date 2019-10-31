const {Utility} = require('../../build/lib/Utility');
const mockStdin = require('mock-stdin').stdin();

module.exports = {
  async withAllStdIn(data) {
    return new Promise((resolve) => {
      // 启动了等待输入输出
      Utility.withAllStdIn((input) => {
        resolve(input);
      });
  
      mockStdin.emit('data');
      mockStdin.send(data);
      mockStdin.end();
    })
  }
};