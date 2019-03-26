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
    grpcMetadata = convert(grpcMetadata, globalMetadata);
  }

  grpcMetadata = convert(grpcMetadata, requestMetadata);

  return grpcMetadata;
};

module.exports = mergeMetadata;

const convert = function (metadata, obj) {
  for (let key in obj) {
    if (!(obj[key] === null || obj[key] === undefined)) {
      if (Array.isArray(obj[key])) {
        obj[key].forEach(function (v) {
          metadata.add(key, v);
        });
      } else {
        metadata.set(key, obj[key]);
      }
    }
  }

  return metadata;
};
