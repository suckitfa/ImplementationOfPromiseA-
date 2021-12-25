// 测试接口
MyPromise.deferred = function() {
    const result = {}
    result.promise = new MyPromise((resolve, reject) => {
        result.resolve = resolve;
        result.reject = reject;
    })
    return result;
}

module.exports = MyPromise;