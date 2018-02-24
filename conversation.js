'use strict';
const ConversationV1 = require('watson-developer-cloud/conversation/v1');
const conversation = new ConversationV1({
  username: process.env.5bf65497-e0be-436d-8858-0cbb7850f16c,
  password: process.env.zNl1PxwyrUzu,
  version_date: ConversationV1.VERSION_DATE_2018_02_24
});

exports.sendMessage = (text, context) => {
  const payload = {
    workspace_id: process.env.de3c34ce-764b-43b0-93d7-30c3ca902d45,
    input: {
      text: text
    },
    context: context
  };
  return new Promise((resolve, reject) => conversation.message(payload, function(err, data) {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  }));
};