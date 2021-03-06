'use strict';

module.exports = (() => {
  let aws = null;

  const initAWS = (AWS) => {
    aws = AWS;
  };

  const getUUID = () => {
    let uuid = require('node-uuid');
    return uuid.v1();
  };


  // Convert DynamoDB error code into Error object
  const getDynamoDBError = (err) => {
    if (err.statusCode === 400) {
      switch (err.code) {
        case "AccessDeniedException":
        case "UnrecognizedClientException":
          return new Error("401 Unauthorized: Unable to access an item with error: " + JSON.stringify(err));
          break;
        default:
          return new Error("400 Bad Request: Unable to access an item with error: " + JSON.stringify(err));
      }
    } else { // 500, 503
      return new Error("500 Internal Server Error: Unable to access an item with error: " + JSON.stringify(err));
    }
  };

  /*
   * Parameters:
   * Key        Description
   * accountid  Who created the survey
   * surveyid   The uuid of the survey
   *
   * Response:
   * Key        Description
   * accountid  Who created the survey
   * surveyid   The uuid of the survey
   * subject    The subject of the survey
   * datetime   The latest modified date time of the survey
   * survey     The details of the survey model in JSON format
   */
  const getOneSurvey = (event, callback) =>{
    let response = null;

    // validate parameters
    if (event.accountid && event.surveyid &&
      process.env.SERVERLESS_SURVEYTABLE) {
      let docClient = new aws.DynamoDB.DocumentClient();
      let params = {
        TableName: process.env.SERVERLESS_SURVEYTABLE,
        Key: {
          accountid: event.accountid,
          surveyid: event.surveyid
        }
      };

      docClient.get(params, function(err, data) {
        if (err) {
          console.error("Unable to get an item with the request: ", JSON.stringify(params), " along with error: ", JSON.stringify(err));
          return callback(getDynamoDBError(err), null);
        } else {
          if (data.Item) { // got response
            // compose response
            response = {
              accountid: data.Item.accountid,
              surveyid: data.Item.surveyid,
              subject: data.Item.subject,
              datetime: data.Item.datetime,
              survey: data.Item.survey
            };
            return callback(null, response);
          } else {
            console.error("Unable to get an item with the request: ", JSON.stringify(params));
            return callback(new Error("404 Not Found: Unable to get an item with the request: " + JSON.stringify(params)), null);
          }
        }
      });
    }
    // incomplete parameters
    else {
      return callback(new Error("400 Bad Request: Missing parameters: " + JSON.stringify(event)), null);
    }
  };


  /*
   * Parameters:
   * Key        Description
   * startKey   If your query amount to more than 1 MB of data, you'll need to perform another query request for the next 1 MB of data.
   *            To do this, take the lastEvaluatedKey value from the previous request, and use that value as the startKey in the next request.
   *            This approach will let you progressively query for new data in 1 MB increments.
   *
   * Response:
   * Key        Description
   * surveys    An array of surveys objects (see below)
   *
   * Each object in the user array contains:
   * accountid  Who created the survey
   * surveyid   The uuid of the survey
   * subject    The subject of the survey
   * datetime   The latest modified date time of the survey
   */
  const listSurveys = (event, callback) => {
    let response = null;
    // validate parameters
    if (event.accountid  && process.env.SERVERLESS_SURVEYTABLE) {
      let docClient = new aws.DynamoDB.DocumentClient();
      let params = {
        TableName: process.env.SERVERLESS_SURVEYTABLE,
        ProjectionExpression: "accountid, #dt, subject, surveyid",
        KeyConditionExpression: "accountid = :accountId",
        ExpressionAttributeNames: {
          "#dt": "datetime",
        },
        ExpressionAttributeValues: {
          ":accountId": event.accountid,
        },
      };

      // continue querying if we have more data
      if (event.startKey){
        params.ExclusiveStartKey = event.startKey;
      }
      // turn on the limit in testing mode
      if (event.limitTesting){
        params.Limit = 1;
      }

      docClient.query(params, function(err, data) {
        if (err) {
          console.error("Unable to get an item with the request: ", JSON.stringify(params), " along with error: ", JSON.stringify(err));
          return callback(getDynamoDBError(err), null);
        } else {
          // got response
          // compose response
          response = {};
          response['surveys'] = data.Items;

          // LastEvaluatedKey
          if(typeof data.LastEvaluatedKey != "undefined"){
            response['LastEvaluatedKey'] = data.LastEvaluatedKey;
          }
          return callback(null, response);
        }
      });
    }
    else {
      return callback(new Error("400 Bad Request: Missing parameters: " + JSON.stringify(event)), null);
    }
  };

  /*
   * Parameters:
   * Key          Description
   * accountid    Who created the survey
   * subject      The subject of the survey
   * survey       The details of the survey model in JSON format
   *
   * Response:
   * Key          Description
   * accountid    Who created the survey
   * surveyid     The uuid of the survey
   * datetime     The creation date time of the survey
   */
  const addOneSurvey = (event, callback) => {
    let response = null;
    // validate parameters
    if (event.accountid && event.subject && event.survey &&
      process.env.SERVERLESS_SURVEYTABLE) {
      let docClient = new aws.DynamoDB.DocumentClient();
      let surveyid = getUUID();
      let datetime = Date.now();
      let params = {
        TableName: process.env.SERVERLESS_SURVEYTABLE,
        Item: {
          accountid: event.accountid,
          surveyid: surveyid,
          subject: event.subject,
          datetime: datetime,
          survey: event.survey
        }
      };
      docClient.put(params, function(err, data) {
        if (err) {
          console.error("Unable to add a new item with the request: ", JSON.stringify(params), " along with error: ", JSON.stringify(err));
          return callback(getDynamoDBError(err), null);
        } else {
          // compose response
          response = {
            accountid: event.accountid,
            datetime: datetime,
            surveyid: surveyid
          };
          return callback(null, response);
        }
      });
    }
    // incomplete parameters
    else {
      return callback(new Error("400 Bad Request: Missing parameters: " + JSON.stringify(event)), null);
    }
  };

  /*
   * Parameters:
   * Key          Description
   * accountid    Who created the survey
   * surveyid     The uuid of the survey
   * subject      The subject of the survey
   * survey       The details of the survey model in JSON format
   *
   * Response:
   * Key          Description
   * accountid    Who created the survey
   * surveyid     The uuid of the survey
   * datetime     The creation date time of the survey
   */
  const updateOneSurvey = (event, callback) => {
    let response = null;
    // validate parameters
    if (event.accountid  && event.surveyid && event.subject && event.survey &&
      process.env.SERVERLESS_SURVEYTABLE) {
      let docClient = new aws.DynamoDB.DocumentClient();
      let datetime = Date.now();
      let params = {
        TableName: process.env.SERVERLESS_SURVEYTABLE,
        Key:{
          accountid: event.accountid,
          surveyid: event.surveyid
        },
        UpdateExpression: "set subject = :subject, survey=:survey, #dt=:datetime",
        ExpressionAttributeValues:{
          ":subject": event.subject,
          ":survey": event.survey,
          ":datetime": datetime,
        },
        ExpressionAttributeNames: {
          "#dt": "datetime",
        },
        "ConditionExpression": "(attribute_exists(surveyid)) AND (attribute_exists(accountid)) ",
        ReturnValues:"UPDATED_NEW"
      };
      docClient.update(params, function(err, data) {
        if (err) {
          if(err.code === "ConditionalCheckFailedException"){
            console.error("Unable to update an item with the request: ", JSON.stringify(params));
            return callback(new Error("404 Not Found: Unable to update an not exist item with the request: " + JSON.stringify(params)), null);
          }else{
            console.error("Unable to update an item with the request: ", JSON.stringify(params), " along with error: ", JSON.stringify(err));
            return callback(getDynamoDBError(err), null);
          }
        } else {
          // compose response
          response = {
            datetime: data.Attributes.datetime,
          };
          return callback(null, response);
        }
      });
    }
    // incomplete parameters
    else {
      return callback(new Error("400 Bad Request: Missing parameters: " + JSON.stringify(event)), null);
    }
  };


  /*
   * Parameters:
   * Key          Description
   * accountid    Who created the survey
   * surveyid     The uuid of the survey
   *
   * Response:
   * None
   */
  const deleteOneSurvey = (event, callback) => {
    let response = {};
    // validate parameters
    if (event.accountid  && event.surveyid && process.env.SERVERLESS_SURVEYTABLE) {
      let docClient = new aws.DynamoDB.DocumentClient();
      let params = {
        TableName: process.env.SERVERLESS_SURVEYTABLE,
        Key:{
          accountid: event.accountid,
          surveyid: event.surveyid
        },
      };
      docClient.delete(params, function(err, data) {
        if (err) {
          console.error("Unable to delete an item with the request: ", JSON.stringify(params), " along with error: ", JSON.stringify(err));
          return callback(getDynamoDBError(err), null);
        } else {
          return callback(null, response); // Response will be an HTTP 200 with no content.
        }
      });
    }
    // incomplete parameters
    else {
      return callback(new Error("400 Bad Request: Missing parameters: " + JSON.stringify(event)), null);
    }
  };

  return {
    initAWS : initAWS,

    getOneSurvey : getOneSurvey,
    listSurveys: listSurveys,

    addOneSurvey : addOneSurvey,
    updateOneSurvey : updateOneSurvey,
    deleteOneSurvey : deleteOneSurvey,
  }
})();
