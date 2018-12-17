const Slack = require( 'node-slack' );
const request = require('request'); //op2

const offersEndpoint = "https://services.packtpub.com/free-learning-v1/offers?";
const summaryEndpoint = "https://static.packt-cdn.com/products/"; //+id
const summaryEndpointSuffix = "/summary";

let slackConfig = {
	webhook_url: process.env.WEBHOOK_URL
};

const send_to_slack = (title, description) => {
	const slack = new Slack( slackConfig.webhook_url );

	slack.send( {
		text: "Free Packt E-Book",
    attachments: [
        {
            "fallback": "If you see this message, oh nos!",
            "color": "#36a64f",
            "title": title,
            "title_link": "https://www.packtpub.com/packt/offers/free-learning",
            "text": description
        }
    ]
	}
	,( err ) => {
		if ( err ) {
			return console.error( err );
		}
	} );
}

const fetch_new_book = (callback) => {
	const timeString = "00:00:00.000Z";
	let currentDate = new Date();
	let tomorrowDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), (currentDate.getDate() + 1)); //addition will automatically carry over to next month if > 31
	let todaysDateString = currentDate.toISOString().substring(0, 11); //Only want YYYY-MM-DDT
	let tomorrowsDateString = tomorrowDate.toISOString().substring(0, 11); //Only want YYYY-MM-DDT
	let dateQueryString = "dateFrom=" + todaysDateString + timeString + "&dateTo=" + tomorrowsDateString + timeString;

	const finalURL = offersEndpoint + dateQueryString;

	request(finalURL, { json: true }, (err, res, body) => {
		if (err) { return console.log(err); }

		if(body && body.data && body.data.length > 0) {
			let productId = body.data[0]['productId'];
			callback(productId);
		}
	});
}

const fetch_book_details = (productId) => {

	const finalURL = summaryEndpoint + productId + summaryEndpointSuffix;
	
	request(finalURL, { json: true }, (err, res, body) => {
		if (err) { return console.log(err); }

		if(body) {
			send_to_slack(body['title'], body['oneLiner']);
		}
	});
}

fetch_new_book(fetch_book_details);
	