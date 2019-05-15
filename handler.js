'use strict';
module.exports.hello = async (event) => {
  var now = new Date();
  now.setMilliseconds(0.0);
  var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  utc = utc.toISOString().replace("T"," ").replace(".000Z","");
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
      datetime: utc
    }),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
