var assert = require('assert');
var utils = require('../lib/middleware/utils');
var Botkit = require('botkit');
var sinon = require('sinon');

describe('context', function() {
  var message = {
    "type": "message",
    "channel": "D2BQEJJ1X",
    "user": "Imaya",
    "text": "Hello there!",
    "ts": "1475776074.000004",
    "team": "T2BM5DPJ6"
  };

  var payload = {
    workspace_id: "bdb41273-8daa-4efe-ba47-0a4256b08014",
    input: {
      text: "Hi there!"
    }
  };

  var conversation_response = {
    "intents": [],
    "entities": [],
    "input": {
      "text": "Hello there!"
    },
    "output": {
      "log_messages": [],
      "text": [
        "Hi. It looks like a nice day to start farming. What would you like me to do? "
      ],
      "nodes_visited": [
        "node_1_1467221909631"
      ]
    },
    "context": {
      "conversation_id": "8a79f4db-382c-4d56-bb88-1b320edf9eae",
      "system": {
        "dialog_stack": [
          "root"
        ],
        "dialog_turn_counter": 1,
        "dialog_request_counter": 1
      },
      "default_counter": 0
    }
  };

  var controller = Botkit.slackbot();
  var bot = controller.spawn({
    token: "abc123"
  });
  var storage = bot.botkit.storage;

  describe('readContext()', function() {
    it('should read context correctly', function () {
      utils.readContext(message, storage, function (cb, context) {
        assert.deepEqual(context, null, 'Actual context: ' + context + '\ndoes not match expected context: ' + null);
      });
    });

    it('should suppress storage error', function () {
      var storageStub = sinon.stub(storage.users, 'get').yields('error message');

      utils.readContext(message, storage, function (err, context) {
        assert.equal(err, null, 'Error was not suppressed');
      });
      storageStub.restore();
    });
  });

  describe('updateContext()', function() {
    it('should store context of the first response', function () {
      var expectedStore = {
        "bdb41273-8daa-4efe-ba47-0a4256b08014": {
          "id": "bdb41273-8daa-4efe-ba47-0a4256b08014",
          "context": conversation_response.context
        }
      };
      utils.updateContext(message.user, storage, conversation_response, function (err, response) {
        storage.users.all(function (err, data) {
          assert.equal(err, null);
          assert.deepEqual(data, expectedStore, 'Updated store: ' + data + '\ndoes not match expected store: ' + expectedStore);
        });
      });
    });

    it('should ignore storage error on read when user is not saved yet', function () {
      var storageStub1 = sinon.stub(storage.users, 'get').yields(new Error('error message'));
      var storageStub2 = sinon.stub(storage.users, 'save').yields();

      var watsonResponse = {context: {a: 1}};
      utils.updateContext('NEWUSER3', storage, watsonResponse, function (err, response) {
        assert.ifError(err);
        assert.equal(response, watsonResponse);
        storageStub1.restore();
        storageStub2.restore();
        });
    });

    it('should return storage error on write', function () {
      var storageStub = sinon.stub(storage.users, 'save').yields('error message');

      utils.updateContext(message.user, storage, conversation_response, function (err, context) {
        assert.equal(err, 'error message', 'Error was not passed to callback');
        storageStub.restore();
      });
    });

    it('should update existing context', function () {
      var firstContext = {
        "a": 1,
        "b": 2
      };
      var secondContext = {
        "c": 3,
        "d": 4
      };
      var expectedStore = {
        "bdb41273-8daa-4efe-ba47-0a4256b08014": {
          "id": "bdb41273-8daa-4efe-ba47-0a4256b08014",
          "context": secondContext
        }
      };
     
      utils.updateContext(message.user, storage, {context: firstContext}, function (err, response) {
        assert.ifError(err);
       
        utils.updateContext(message.user, storage, {context: secondContext}, function (err, response) {
          assert.ifError(err);

          storage.users.all(function (err, data) {
            assert.equal(err, null);
            assert.deepEqual(data, expectedStore, 'Updated store: ' + data + '\ndoes not match expected store: ' + expectedStore);
          });
        });
      });
    });

    it('should preserve other data in storage', function () {

      var user = {
        "id": message.user,
        "profile": {
          "age": 23,
          "sex": "male"
        }
      };

      var newContext = {
        "a": 1,
        "b": 2
      };

      var expectedStore = {
        "U2BLZSKFG": {
          "id": "U2BLZSKFG",
          "profile": {
            "age": 23,
            "sex": "male",
          },
          "context": newContext
        }
      };

      storage.users.save(user, function(err) {
        assert.ifError(err);

        utils.updateContext(message.user, storage, {context: newContext}, function (err, response) {
          assert.ifError(err);

          storage.users.all(function (err, data) {
            assert.equal(err, null);
            assert.deepEqual(data, expectedStore, 'Updated store: ' + data + '\ndoes not match expected store: ' + expectedStore);
          });
        });
      });
    });
  });
});