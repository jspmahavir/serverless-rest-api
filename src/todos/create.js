const uuid = require('uuid');
const AWS = require('aws-sdk');
const config = require('../config/config.js');
const isDev = false; //process.env.NODE_ENV !== 'production';

if (isDev) {
  AWS.config.update(config.aws_local_config);
} else {
  AWS.config.update(config.aws_remote_config);
}

const dynamoDb = new AWS.DynamoDB.DocumentClient();


module.exports.create = (event, context, callback) => {
    const timestamp = new Date().getTime();
    console.log(event);
    const { text, color } = event;
    // return;
    //const postData = '{"text":"Lerning 123"}';
    //console.log(postData);
    //return;
    //var data = JSON.parse(event);
    console.log(text);
    //console.log(data);
    // if(typeof data.text !== 'string') {
    //     console.error('Validation Failed');
    //     callback(new Error('Could\'t not create Do To Item.'));
    //     return;
    // }
    const todoId = uuid.v1();
    const params = {
        TableName: 'todos',
        Item: {
          id:todoId,
          title: text,
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
            body: JSON.stringify(result.Item)
        }

        callback(null, response);
    })
}
 
// router.post('/create', (req, res) => {
//   const { title, done = false} = req.body;
//   const todoId = uuid.v4();
//   const params = {
//     TableName: config.aws_table_name,
//     Item: {
//       todoId,
//       title,
//       done,
//     },
//   };
//   dynamoDb.put(params, (error) => {
//     if (error) {
//       console.log('Error creating Todo: ', error);
//       res.status(400).json({ error: 'Could not create Todo' });
//     }
//     res.json({ todoId, title, done });
//   });
// });

// module.exports = router; 