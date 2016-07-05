'use strict';

let expect = require('chai').expect;
let should = require('chai').should();

// require testing target and set up necessary information
let aws = require('aws-sdk');
let user = require('../api/user/user.js');
let dynadblib = require('./dynadb');
let dynadb = new dynadblib();

before('Initial local DynamoDB', function(done) {
  // set up necessary information
  process.env['SERVERLESS_USERTABLE'] = 'usertable';
  let dynalitePort = 4567;
  /////////////////////////////////////////////////////////////////////

  // Returns a standard Node.js HTTP server
  dynadb.listen(dynalitePort, function(err) {
    if (err) throw err;

    // create user table
    aws.config.update({
      accessKeyId: "accessKeyId",
      secretAccessKey: "secretAccessKey",
      region: 'us-east-1',
      endpoint: 'http://localhost:' + dynalitePort
    });

    user.initAWS(aws);

    let dynamodb = new aws.DynamoDB({
      apiVersion: '2012-08-10'
    });

    let params = {
      TableName: process.env.SERVERLESS_USERTABLE,
      AttributeDefinitions: [{
        AttributeName: "accountid",
        AttributeType: "S"
      }],
      KeySchema: [{
        AttributeName: "accountid",
        KeyType: "HASH"
      }],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };
    dynamodb.createTable(params, function(err, data) {
      if (err) throw err;
      done();
    });
  });
  /////////////////////////////////////////////////////////////////////
});

after('Uninitial local DynamoDB', function(done) {
  dynadb.close(done);
});

describe("Interface to add one new user model into data store successfully", function() {
  describe("#addOneUser", function() {
    describe("When adding one new user model with complete and normal parameters", function() {
      it("should response successfully", function(done) {
        let event = {
          accountid: "this is fake account",
          username: "this is fake user name",
          email: "this is fake email",
          role: "this is fake User",
        };
        user.addOneUser(event, function(error, response) {
          expect(error).to.be.null;
          expect(response).to.not.be.null;
          done();
        });
      });
    });
  });
});

describe("Interface to add one new user model into data store with error", function() {
  describe("#addOneUser", function() {

    // missing parameter(s)
    let missingParams = [
      // one parameter
      {
        desc: "with missing event.email",
        event: {
          accountid: "this is fake account",
          username: "this is fake user name",
          role: "this is fake User"
        },
        expect: /Error: 400 Bad Request/
      }, {
        desc: "with missing event.username",
        event: {
          accountid: "this is fake account",
          email: "this is fake email",
          role: "this is fake User"
        },
        expect: /Error: 400 Bad Request/
      }, {
        desc: "with missing event.accountid",
        event: {
          username: "this is fake user name",
          email: "this is fake email",
          role: "this is fake User"
        },
        expect: /Error: 400 Bad Request/
      }, {
        desc: "with missing event.role",
        event: {
          accountid: "this is fake account",
          username: "this is fake user name",
          email: "this is fake email"
        },
        expect: /Error: 400 Bad Request/
      },
      // two parameters
      {
        desc: "with missing event.username and event.email",
        event: {
          accountid: "this is fake account",
          role: "this is fake role"
        },
        expect: /Error: 400 Bad Request/
      }, {
        desc: "with missing event.username and event.role",
        event: {
          accountid: "this is fake account",
          email: "this is fake email",
        },
        expect: /Error: 400 Bad Request/
      }, {
        desc: "with missing event.accountid and event.username",
        event: {
          email: "this is fake email",
          role: "this is fake role"
        },
        expect: /Error: 400 Bad Request/
      }, {
        desc: "with missing event.accountid and event.email",
        event: {
          username: "this is fake user name",
          role: "this is fake role"
        },
        expect: /Error: 400 Bad Request/
      },{
        desc: "with missing event.accountid and event.role",
        event: {
          username: "this is fake user name",
          email: "this is fake email"
        },
        expect: /Error: 400 Bad Request/
      }, {
        desc: "with missing event.role and event.email",
        event: {
          accountid: "this is fake account",
          username: "this is fake user name",
        },
        expect: /Error: 400 Bad Request/
      },
      // all parameters
      {
        desc: "with missing all parameters",
        event: {},
        expect: /Error: 400 Bad Request/
      }
    ];

    missingParams.forEach(function(test) {
      describe("When adding one new user model " + test.desc, function() {
        it("should response error", function(done) {
          user.addOneUser(test.event, function(error, response) {
            expect(error).to.not.be.null;
            expect(response).to.be.null;
            error.should.match(RegExp(test.expect));
            done();
          });
        });
      });
    });
  });
});

describe("Interface to get one user model from data store successfully", function() {
  let accountid = "this is dummy account",
    username = "this is dummy user name",
    email = "this is dummy email",
    role = "this is dummy User";

  before("Insert one dummy record", function(done) {
    let event = {
      accountid: accountid,
      username: username,
      email: email,
      role: role
    };
    user.addOneUser(event, function(err, data) {
      if (err) throw err;
      done();
    });
  });

  describe("#getOneUser", function() {
    describe("When getting exist user model with complete and normal parameters", function() {
      let event = {
        accountid: accountid,
      };
      it("should response successfully", (done) => {
        user.getOneUser(event, (error, response) => {
          expect(error).to.be.null;
          expect(response).to.not.be.null;
          response.should.have.all.keys(['accountid', 'username', 'email', 'role']);
          response.accountid.should.have.string(accountid);
          response.username.should.have.string(username);
          response.email.should.have.string(email);
          response.role.should.have.string(role);
          done();
        });
      });
    });
  });
});

describe("Interface to get one user model from data store with error", function() {
  describe("#getOneUser", function() {
    // missing parameter(s)
    let missingParams = [
      // one parameter
     {
        desc: "with missing event.accountid",
        event: {},
        expect: /Error: 400 Bad Request/
      },
    ];

    missingParams.forEach(function(test) {
      describe("When getting one user model " + test.desc, function() {
        it("should response error", (done) => {
          user.getOneUser(test.event, (error, response) => {
            expect(error).to.not.be.null;
            expect(response).to.be.null;
            error.should.match(RegExp(test.expect));
            done();
          });
        });
      });
    });
  });
});

describe("Interface to get list users model from data store successfully", () => {
  describe("#listUsers", () => {
    describe("When getting exist users model with complete and normal parameters", () => {
      let event = {};
      it("should response successfully", (done) => {
        user.listUsers(event, (error, response) => {
          expect(error).to.be.null;
          expect(response).to.not.be.null;
          response.should.have.keys('users');
          response.users.length.should.equal(2); // There are two users data in above test case
          response.users.map((obj) => {
            obj.should.have.keys(['accountid', 'username', 'email', 'role']);
            obj.accountid.should.exist;
            obj.username.should.exist;
            obj.email.should.exist;
            obj.role.should.exist;
          });
          done();
        });
      });
    });

    describe("When getting exist users model with startKey parameters", () => {
      let event = {
        limitTesting: true,
      };
      it("should response successfully", (done) => {
        const limitTestCase = (event) => {
          user.listUsers(event, (error, response) => {
            if (typeof response.LastEvaluatedKey != "undefined") {
              expect(error).to.be.null;
              expect(response).to.not.be.null;
              response.should.have.keys(['users', 'LastEvaluatedKey']);
              response.users.length.should.equal(1); // There is one user data because setting limit is 1.
              response.users.map((obj) => {
                obj.should.have.keys(['accountid', 'username', 'email', 'role']);
                obj.accountid.should.exist;
                obj.username.should.exist;
                obj.email.should.exist;
                obj.role.should.exist;
              });
              // recursive
              event.startKey = response.LastEvaluatedKey;
              limitTestCase(event);
            } else {
              done();
            }
          });
        };
        limitTestCase(event);
      });
    });
  });
});

// TODO ask how to missingParams in #listUsers return 400 Bad request.
describe("Interface to get list users model from data store with error" , () => {
  describe("#listUsers", () => {
    let params =
      {
        desc: "with wrong setting",
        event: {},
        expect: /Error: 400 Bad Request/
      };

    before("For 400, set SERVERLESS_USERTABLE null", (done) => {
      process.env['SERVERLESS_USERTABLE'] = null;
      done();
    });

    describe("When getting list users mode " + params.desc, () => {
      it("should response error", () => {
        user.listUsers(params.event, (error, response) => {
          expect(error).to.not.be.null;
          expect(response).to.be.null;
          error.should.match(RegExp(test.expect));
          done();
        });
      });
    });

    after("Set SERVERLESS_USERTABLE usertable", (done) => {
      process.env['SERVERLESS_USERTABLE'] = 'usertable';
      done();
    });
  });
});