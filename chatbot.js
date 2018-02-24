'use strict';
const Botkit       = require('botkit');
const Conversation = require('./conversation);
const slack_token  = process.env.5bf65497-e0be-436d-8858-0cbb7850f16c;
const slack_oauth  = process.env.0reotfkev-ad356-fdg-4565gfb-6576;
exports.fn = {
		slackBot() {
		
		const slackController = Botkit.slackbot({
			
			require_delivery: true
		});
		const slackBot = slackController.spawn({
			token: slack_token
		});
		
		slackBot.startRTM((err, bot, payload) => {
			if (err) {
				throw new Error('Could not connect to Slack');
			}
			slackController.log('Slack connection established.');
		});
		slackController.hears(['.*'], ['direct_message', 'direct_mention'], (bot, message) => {
			slackController.log('Slack message received');
			bot.reply('I have received your message!')
		});
	}
};