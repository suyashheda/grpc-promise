const grpc = require('grpc');

const mergeMetadata = (globalMetadata = {}, requestMetadata = {}) => {
  // If we already get gRPC Metadata class with the request we bypass the global config
  if (requestMetadata instanceof grpc.Metadata) {
    return requestMetadata;
  }

  let grpcMetadata;

  // Use the global metadata as a base
  if (globalMetadata instanceof grpc.Metadata) {
    grpcMetadata = globalMetadata;
  } else {
    grpcMetadata = new grpc.Metadata();

    for (let key in globalMetadata) {
      if (!(globalMetadata[key] === null || globalMetadata[key] === undefined)) {
        grpcMetadata.set(key, globalMetadata[key]);
      }
    }
  }

  for (let key in requestMetadata) {
    if (!(requestMetadata[key] === null || requestMetadata[key] === undefined)) {
      grpcMetadata.set(key, requestMetadata[key]);
    }
  }

  return grpcMetadata;
};

module.exports = mergeMetadata;
