const AWS = require('aws-sdk');
const config = require('../../config/config.js');

if (config.isDev) {
  AWS.config.update(config.aws_local_config);
} else {
  AWS.config.update(config.aws_remote_config);
}

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.activepages = (req, res, callback) => {
    const params = {
      TableName: "pages",
      ProjectionExpression: "pagecode",
      FilterExpression: "#key = :val",
      ExpressionAttributeNames: {
          "#key": "active",
      },
      ExpressionAttributeValues: {
           ":val": true,
      }
    };

    dynamoDb.scan(params, function(error, data) {
      console.log(data);
      if (error) {
          console.log(error);
          callback(new Error('Could\'t not fetch Items.'));
          return;
      } else {
        const response = {
            statusCode: 200,
            body: JSON.stringify(data.Items),
            headers: {
              "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
              "Access-Control-Allow-Methods": "*"
            }
        }
        callback(null, response);
      }
    });
}

module.exports.getpage = (req, res, callback) => {
    console.log("## Request Parameters");
    console.log(JSON.stringify(req, null, 2));
    console.log("## Callback");
    console.log(JSON.stringify(callback, null, 2));
    var pagecode = req.pathParameters.pagecode;
    var clientcode = req.queryStringParameters.clientcode;
    var advertisercode = req.queryStringParameters.advertisercode;
    var params = {
      TableName: "pages",
      KeyConditionExpression: "#pagecode = :pagecode",
      FilterExpression: "clientcode = :clientcode and advertisercode = :advertisercode",
      ExpressionAttributeNames: {
          "#pagecode": "pagecode"
      },
      ExpressionAttributeValues: {
           ":pagecode": pagecode,
           ":clientcode": clientcode,
           ":advertisercode": advertisercode
      },
    };
    dynamoDb.query(params, function(error, data) {
      console.log(data);
      if (error) {
          console.log(error);
          callback(new Error('Could\'t not fetch Items.'));
          return;
      } else {
        const response = {
            statusCode: 200,
            body: JSON.stringify({
              resultCount: data.Count,
              result: data.Items
            }),
            headers: {
              "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
              "Access-Control-Allow-Methods": "*"
            }
        }
        callback(null, response);
      }
    });
}