// A promise must be in one of three states: pending, fulfilled, or rejected.
const REJECTED = "rejected";
const FULFILLED = "fulfilled";
const PENDING = "pending";

class MyPromise {
    constructor(executor) {
        try {
            executor(this.resolve, this.reject);
        } catch (e) {
            this.reject(e);
        }
    }
    status = PENDING;
    value = undefined;
    reason = undefined;
    onFulfilledCallBacks = [];
    onRejectedCallBacks = [];
    resolve = (value) => {
        if (this.status === PENDING) {
            this.value = value;
            this.status = FULFILLED;
            while (this.onFulfilledCallBacks.length) {
                this.onFulfilledCallBacks.shift()(value);
            }
        }
    }
    reject = (reason) => {
        if (this.status === PENDING) {
            this.status = REJECTED
            this.reason = reason;
            while (this.onRejectedCallBacks.length) {
                this.onRejectedCallBacks.shift()(reason);
            }
        }
    }

    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
        const promise2 = new MyPromise((resolve, reject) => {
            const onFulfilledMicroTask = () => {
                queueMicrotask(() => {
                    try {
                        const x = onFulfilled(this.value);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                })
            }
            const onRejectedMicroTask = () => {
                queueMicrotask(() => {
                    try {
                        const x = onRejected(this.reason);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                })
            }
            switch (this.status) {
                case FULFILLED:
                    onFulfilledMicroTask();
                    break;
                case REJECTED:
                    onRejectedMicroTask();
                    break;
                case PENDING:
                    this.onFulfilledCallBacks.push(onFulfilledMicroTask);
                    this.onRejectedCallBacks.push(onRejectedMicroTask);
                    break;
            }
        })
        return promise2;
    }

}

function resolvePromise(promise2, x, resolve, reject) {
    if (x === promise2) {
        return reject(new TypeError("Chaining cycle dected!"));
    }

    if (typeof x === 'object' || typeof x === 'function') {

        if (x == null) {
            return resolve(x);
        }

        let then;
        try {
            then = x.then;
        } catch (e) {
            return reject(e);
        }

        if (typeof then === 'function') {
            let called = false;
            try {
                then.call(
                    x, // 让this指向x,前面一个then的执行结果
                    y => {
                        if (called) return;
                        called = true;
                        // 递归解析
                        resolvePromsie(promise2, y, resolve, reject);
                    },
                    r => {
                        if (called) return;
                        called = true;
                        reject(r);
                    }
                )
            } catch (e) {
                if (called) return;
                called = true;
                reject(e);
            }
        } else {
            resolve(x);
        }
    } else {
        resolve(x);
    }
}
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