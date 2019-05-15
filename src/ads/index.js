'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');
const config = require('../../config/config.js');
var currentCounter = "";

if (config.isDev) {
    AWS.config.update(config.aws_local_config);
} else {
    AWS.config.update(config.aws_remote_config);
}

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.impression = (req, res, callback) => {
    var now = new Date();
    var timestamp = Math.round(new Date().getTime()/1000);
    now.setMilliseconds(0.0);
    var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    utc = utc.toISOString().replace("T"," ").replace(".000Z","");
    const reqData = JSON.parse(req.body);
    const uniqueId = uuid.v1();
    const params = {
        TableName: 'impressions',
        Item: {
          id: uniqueId,
          unixtimestamp: timestamp,
          agencycode: reqData.agencycode,
          clientcode: reqData.clientcode,
          advertisercode: reqData.advertisercode,
          pagecode: reqData.pagecode,
          leaddata: {
            'firstname': reqData.lead.firstname,
            'lastname': reqData.lead.lastname,
            'email': reqData.lead.email,
            'address': reqData.lead.address,
            'city': reqData.lead.city,
            'state': reqData.lead.state,
            'zip': reqData.lead.zip,
            'country': reqData.lead.country
          },
          meta: {
            'ip': reqData.meta.ip,
            'os': reqData.meta.os,
            'browser': reqData.meta.browser,
            'url': reqData.meta.url
          },
          createdate: utc
        },
      };

    dynamoDb.put(params, (error, result) => {
        if (error) {
          var errorStr = 'Could\'t not create impression.' + error;
          const response = {
              statusCode: 400,
              body: JSON.stringify({
                  message: errorStr
              }),
              headers: {
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Methods": "*"
              }
          };
          callback(null, response);
          return;
        }
        const response = {
            statusCode: 200,
            body: JSON.stringify({
              message: 'Impression Created',
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

module.exports.submission = async (req, res, callback) => {
    var now = new Date();
    var timestamp = Math.round(new Date().getTime()/1000);
    now.setMilliseconds(0.0);
    var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    utc = utc.toISOString().replace("T"," ").replace(".000Z","");
    const reqData = JSON.parse(req.body);
    var uniqueId;
    if(reqData.id != "") {
        uniqueId = reqData.id;
    } else {
        uniqueId = uuid.v1();
    }
    var exists = await checkSubmissionByKey(uniqueId);
    if(exists.success == true && exists.dataLength > 0) {
        var errorStr = 'Submission already exist.';
        var response = {
            statusCode: 200,
            body: JSON.stringify({
                message: errorStr,
                exists: 1
            }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*"
            }
        };
        callback(null, response);
        return;
    } else {
        if(exists.dataLength == 0) {
            var currentCounter = await getCounter();
            if(currentCounter.success == true && currentCounter.counterVal > 0) {
                var params = {
                    uniqueId: uniqueId, 
                    timestamp:timestamp, 
                    counterVal: currentCounter.counterVal,
                    utc: utc
                };
                var resSubmission = await insertSubmission(reqData,params);
                if(resSubmission.success == true) {
                    var response = {
                        statusCode: 200,
                        body: JSON.stringify({
                            message: 'Submission Created'
                        }),
                        headers: {
                            "Access-Control-Allow-Origin" : "*",
                            "Access-Control-Allow-Methods": "*"
                        }
                    }
                    var currentvalue = currentCounter.counterVal;
                    var newvalue = currentvalue + 1;
                    updateCounter(currentvalue,newvalue);
                    callback(null, response);
                } else {
                    if(resSubmission.success == false) {
                        var error = resSubmission.error;
                        var errorStr = 'Could\'t not create submission.' + error;
                        var response = {
                            statusCode: 400,
                            body: JSON.stringify({
                                message: errorStr
                            }),
                            headers: {
                                "Access-Control-Allow-Origin": "*",
                                "Access-Control-Allow-Methods": "*"
                            }
                        };
                        callback(null, response);
                        return;
                    }
                }
            }
        }
    }
}

async function checkSubmissionByKey(KeyId) {
    var response = {
        success: false,
        dataLength: 0
    };
    var params = {
        TableName : "submissions",
        ProjectionExpression: "id",
        KeyConditionExpression: "#id = :uniqueId",
        ExpressionAttributeNames:{
            "#id": "id"
        },
        ExpressionAttributeValues: {
            ":uniqueId": KeyId
        }
    };

    try {
        const data = await dynamoDb.query(params).promise();
        response = {
            success: true,
            dataLength: data.Items.length
        };
        return response;
    } catch (error) {
        response = {
            success: false,
            error: error,
            dataLength: 0
        };
        return response;
    }
}

async function getCounter() {
    var response = {
        success: false,
        counterVal: 0
    };

    var params = {
        "TableName": "counters",
        "Key": {
            "countername": "recordid"
        }
    };
    try {
        const data = await dynamoDb.get(params).promise();
        response = {
            success: true,
            counterVal: data.Item.currentvalue
        };
        return response;
    } catch (error) {
        response = {
            success: false,
            error: error,
            counterVal: 0
        };
        return response;
    }
}

async function insertSubmission(reqData, extra) {
    var response = {
        success: false
    };

    var leaddataObj = {};
    if(reqData.lead.firstname != "") {
        leaddataObj['firstname'] = reqData.lead.firstname;
    }
    if(reqData.lead.lastname != "") {
        leaddataObj['lastname'] = reqData.lead.lastname;
    }
    if(reqData.lead.email != "") {
        leaddataObj['email'] = reqData.lead.email;
    }
    if(reqData.lead.address != "") {
        leaddataObj['address'] = reqData.lead.address;
    }
    if(reqData.lead.city != "") {
        leaddataObj['city'] = reqData.lead.city;
    }
    if(reqData.lead.state != "") {
        leaddataObj['state'] = reqData.lead.state;
    }
    if(reqData.lead.zip != "") {
        leaddataObj['zip'] = reqData.lead.zip;
    }
    if(reqData.lead.country != "") {
        leaddataObj['country'] = reqData.lead.country;
    }
    var params = {
        TableName: 'submissions',
        Item: {
            id: extra.uniqueId,
            record_id: extra.counterVal,
            unixtimestamp: extra.timestamp,
            agencycode: reqData.agencycode,
            clientcode: reqData.clientcode,
            advertisercode: reqData.advertisercode,
            pagecode: reqData.pagecode,
            leaddata: leaddataObj,
            meta: {
                'ip': reqData.meta.ip,
                'os': reqData.meta.os,
                'browser': reqData.meta.browser,
                'url': reqData.meta.url
            },
            suceess: true,
            createdate: extra.utc
        },
    };
    try {
        const data = await dynamoDb.put(params).promise();
        response = {
            success: true,
            params: params
        };
        return response;
    } catch (error) {
        response = {
            success: false,
            error: error
        };
        return response;
    }
}

function updateCounter(currentvalue,newvalue) {
    var counterParams = {
        "TableName": "counters",
        "ReturnValues": "UPDATED_NEW",
        "ExpressionAttributeValues": {
            ":a": currentvalue,
            ":bb": newvalue
        },
        "ExpressionAttributeNames": {
            "#currentvalue": "currentvalue"
        },
        "ConditionExpression": "(#currentvalue = :a)",
        "UpdateExpression": "SET #currentvalue = :bb",
        "Key": {
            "countername": "recordid"
        }
    };

    dynamoDb.update(counterParams, function (err, data) {
        if (err) console.log(err);
        else console.log(data);
    });
}