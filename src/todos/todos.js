const uuid = require('uuid');
const AWS = require('aws-sdk');
const config = require('../../config/config.js');

if (config.isDev) {
  AWS.config.update(config.aws_local_config);
} else {
  AWS.config.update(config.aws_remote_config);
}

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.create = (req, res, callback) => {
    res.callbackWaitsForEmptyEventLoop = false;
    const timestamp = new Date().getTime();
    const reqData = JSON.parse(req.body);
    const todoId = uuid.v1();
    const params = {
        TableName: "todos",
        Item: {
          id:todoId,
          title: reqData.text,
          done: false,
          createdAt: timestamp,
          updatedAt: timestamp
        },
      };

    dynamoDb.put(params, (error, result) => {
        if (error) {
          console.log(error);
          callback(new Error('Could\'t not create Do To Item.'));
          return;
        }

        const response = {
            statusCode: 200,
            body: JSON.stringify({
              message: 'Item Created',
              params : params
            }),
            headers: {
              "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
              "Access-Control-Allow-Methods": "*"
            }
        }
        callback(null, response);
    });
}

module.exports.list = (req, res, callback) => {
    const params = {
      TableName: "todos"
    };
    
    dynamoDb.scan(params, function(error, data) {
      console.log(data);
      if (error) {
          console.log(error);
          callback(new Error('Could\'t not fetch Do To Items.'));
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

module.exports.get = (req, res, callback) => {
    const params = {
      TableName: "todos",
      Key: {
        id: req.pathParameters.id
      }
    };
    
    dynamoDb.get(params, function(error, data) {
      if (error) {
          console.log(error);
          callback(new Error('Could\'t not fetch the to do Item.'));
          return;
      } else {
        const response = {
            statusCode: 200,
            body: JSON.stringify(data.Item)
        }
        callback(null, response);
      }
    });
}

module.exports.update = (req, res, callback) => {
    const timestamp = new Date().getTime();
    const reqData = JSON.parse(req.body);
    const params = {
      TableName: "todos",
      Item: {
          id: req.pathParameters.id,
          title: reqData.text,
          done: reqData.checked,
          updatedAt: timestamp
        },
    };
    
    dynamoDb.put(params, function(error, data) {
      if (error) {
          console.log(error);
          callback(new Error('Could\'t not update item.'));
          return;
      } else {
        const response = {
            statusCode: 200,
            body: JSON.stringify(data.Item)
        }
        callback(null, response);
      }
    });
}

module.exports.query = (req, res, callback) => {
    var uniqueId = "M2NhYmVlYjgzY2QxYWViOGU4MDhmYmQwZTllZWMxNWY6ODlhN2IwNjMyYTVjMmNlNWIxMjJiZTlmMDQ5NmM3NGQxMWIxYmU4NzUxMzMxZTU5N2RmNTMzMTUyZGNhZTQ3NzUxNThmMWM3NWI2NmQ5NjEyMDRlYjgzNTRjYzc3YzlmMjhlMjg3MjEwZGRlMThkZmRjNmE5ZDEyYTA3MjRmZGVhZGExNTAyZjFlZTZlNGZjNDAxOTRhM2UwMzA3NWU3MzViZGU1NGY2MTEyN2MzOWI1NzIzZmYxODhmNTk3YTA0YTkyYjVkZjE=";
    const params = {
      TableName: "submissions",
      // ProjectionExpression: "title",
      // FilterExpression: "contains(#title,:val) AND #done = :val1",
      KeyConditionExpression: "id = :uniqueId",
      FilterExpression : "leaddata.email = :p_email",
      ExpressionAttributeValues: {
        ":uniqueId": uniqueId,
        ":p_email": {"S": "charless.aamodt@gmail.com"}
      }
    };
    dynamoDb.scan(params, function(error, data) {
      if (error) {
          console.log(error);
          callback(new Error('Could\'t not fetch item.'));
          return;
      } else {
        console.log(data);
        const response = {
            statusCode: 200,
            body: JSON.stringify(data.Items)
        }
        callback(null, response);
      }
    });
}