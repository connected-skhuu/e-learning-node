const Slack = require( 'node-slack' );
const rp = require('request-promise');
const cheerio = require('cheerio');

const listing = 'https://www.packtpub.com/packt/offers/free-learning';
const titleSelector = '.dotd-title h2';
const descriptionSelector = '.dotd-main-book-summary';

let slackConfig = {
	webhook_url: process.env.WEBHOOK_URL
};

const options = {
	uri: listing,
	transform: function (body) {
			return cheerio.load(body);
	}
};

const send_to_slack = ($) => {
	const $title = $( titleSelector ); 
	const title = $title.text().trim();
	const description = $(descriptionSelector).find('div').eq(2).text().trim()
	const slack = new Slack( slackConfig.webhook_url );
	const date = Date.now();
	
	slack.send( {
		text: "Free Packt E-Book",
    attachments: [
        {
            "fallback": "If you see this message, oh nos!",
            "color": "#36a64f",
            "title": title,
            "title_link": "https://www.packtpub.com/packt/offers/free-learning",
            "text": description,
            "ts": date
        }
    ]
	}
	,( err ) => {
		if ( err ) {
			return console.error( err );
		}
	} );
}

rp(options)
	.then(($) => {
		send_to_slack($);
	})
	.catch((err) => {
		console.log(err);
	});
	