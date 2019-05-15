const express = require("express");
const router = express.Router();
const uuid = require('uuid');
const AWS = require('aws-sdk');
const config = require('../config/config.js');
const isDev = true; //process.env.NODE_ENV !== 'production';

if (isDev) {
  AWS.config.update(config.aws_local_config);
} else {
  AWS.config.update(config.aws_remote_config);
}

const dynamoDb = new AWS.DynamoDB.DocumentClient();
// console.log(dynamoDb);
// return;
/*
router.post('/create', (req, res) => {
  const timestamp = new Date().getTime();
  const { text, color } = req.body;
  console.log(text);
  const Id = uuid.v1();
  console.log(Id);
  // const postData = '{"text":"Lerning 123"}';
  // console.log(postData);
  //return;
  // var data = JSON.parse(postData);
  // console.log(data);

  const params = {
      TableName: 'todos',
      Item: {
        id:Id,
        title: text,
        done: false,
        createdAt: timestamp,
        updatedAt: timestamp
      },
    };   

  dynamoDb.put(params, function(err, data) {
      if (err) {
        res.send({
          success: false,
          message: 'Error: Server error'
        });
      } else {
        const { Items } = data;
        res.send({
          success: true,
          message: 'Item Added',
          id: Id
        });
      }
    });
});

router.get('/list', (req, res, next) => {
    if (isDev) {
      AWS.config.update(config.aws_local_config);
    } else {
      AWS.config.update(config.aws_remote_config);
    }
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
      TableName: config.aws_table_name
    };
    
    docClient.scan(params, function(err, data) {
      if (err) {
        res.send({
          success: false,
          message: 'Error: Server error',
          err: err
        });
      } else {
        const { Items } = data;
        res.send({
          success: true,
          message: 'Loaded Todos',
          todos: Items
        });
      }
    });
  });

module.exports = router; 
*/

module.exports.list = (req, res, callback) => {
    if (isDev) {
      AWS.config.update(config.aws_local_config);
    } else {
      AWS.config.update(config.aws_remote_config);
    }
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
      TableName: config.aws_table_name
    };
    
    docClient.scan(params, function(err, data) {
      if (err) {
        res.send({
          success: false,
          message: 'Error: Server error',
          err: err
        });
      } else {
        const { Items } = data;
        res.send({
          success: true,
          message: 'Loaded Todos',
          todos: Items
        });
      }
    });
}