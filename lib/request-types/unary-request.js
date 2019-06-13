const mergeMetadata = require('../metadata');

class UnaryRequest {

  constructor (client, original_function, options = {}, requestMiddleware = null, responseMiddleware = null) {
    if (options == null) options = {};
    this.client = client;
    this.metadata = options.metadata;
    this.timeout = options.timeout || undefined;
    this.original_function = original_function;
    this.requestMiddleware = requestMiddleware || function (client, content, meta, next) {
      return next(client, content, meta);
    };
    this.responseMiddleware = responseMiddleware;
  }

  sendMessage (content = {}, metadata = {}) {
    return new Promise((resolve, reject) => {
      // Deadline is advisable to be set
      // It should be a timestamp value in milliseconds
      let deadline = undefined;
      if (this.timeout !== undefined) {
        deadline = Date.now() + this.timeout;
      }

      const globalMeta = this.metadata;
      const originalFunction = this.original_function;
      const responseMiddleware = this.responseMiddleware;

      const next = function (client, content, meta) {
        const mergedMeta = mergeMetadata(globalMeta, meta);

        originalFunction.call(client, content, mergedMeta, {deadline: deadline},
          function (error, response) {
            if (typeof responseMiddleware === 'function') {
              responseMiddleware(originalFunction.originalName, error, response, mergedMeta);
            }

            if (error) {
              reject(error);
            } else {
              resolve(response);
            }
          }
        );
      };

      this.requestMiddleware(this.client, this.original_function.originalName, content, metadata, next);
    });
  }

}

const makeUnaryRequest = function (client, originalFunction, options, requestMiddleware, responseMiddleware) {
  // console.log(options);
  return function () {
    return new UnaryRequest(client, originalFunction, options, requestMiddleware, responseMiddleware);
  };
};

module.exports = makeUnaryRequest;
