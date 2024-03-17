const respone = (code, message, data = []) => {
  return {
    code,
    message,
    ...(data?.data ? data : { data: data }),
  };
};

module.exports = respone;
