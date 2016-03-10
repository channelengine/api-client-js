import xhr from 'superagent';
import crypto from 'crypto';
import moment from 'moment';

export default class ChannelEngine {
	constructor(tenant, apiKey, apiSecret, environment){
		this.tenant = tenant;
		this.apiKey = apiKey;
		this.apiSecret = apiSecret;
		
		this.domain = '.channelengine.net';

		if(environment == 'dev') {
			this.domain = '.channelengine.local';
		}else if(environment == 'acc') {
			this.domain = '.channelengine-acc.nl';
		}

		this.baseUri = (environment == 'dev' ? 'http://' : 'https://') + tenant + this.domain;
		this.apiUri = '/api/v1/';
	}

	getOrders(statuses, callback) {
		statuses = statuses || [0]; // IN_PROGRESS by default
		this.makeRequest(this.apiUri + 'orders/', 'GET', {orderStatus: statuses}, '', callback);
	}

	getOrder(id, callback) {
		this.makeRequest(this.apiUri + 'orders/' + id, 'GET', {}, '', callback);
	}

	getStatisticsDashboard(period, callback) {
		this.makeRequest(this.apiUri + 'statistics/dashboard/', 'GET', {period: period}, '', callback);
	}

	getStatisticsClickConversion(dateFrom, dateTo, callback) {
		dateFrom = dateFrom || moment().subtract(2, 'week');
		dateTo = dateTo || moment().add(1, 'day');
		this.makeRequest(this.apiUri + 'statistics/clickconversion/', 'GET', {fromDate: dateFrom.toISOString(), toDate: dateTo.toISOString()}, '', callback);
	}

	getStatisticsOrders(dateFrom, dateTo, callback) {
		dateFrom = dateFrom || moment().subtract(2, 'week');
		dateTo = dateTo || moment().add(1, 'day');
		this.makeRequest(this.apiUri + 'statistics/orders/', 'GET', {fromDate: dateFrom.toISOString(), toDate: dateTo.toISOString()}, '', callback);
	}

	makeRequest(uri, method, parameters, body, callback) {
		var md5 = crypto.createHash('md5');
		var headers = {};

		headers['Accept'] = 'application/json';
		headers['X-Date'] = new Date().toUTCString();
		headers['Content-MD5'] = body ? md5.update(body).digest('base64') : '';
		headers['Authorization'] = 'HMAC ' + this.apiKey + ':' + this.calculateSignature(uri, method, headers, body);

		var uri = this.baseUri + uri;

		xhr.get(uri)
		.query(parameters)
		.set(headers)
		.end((err, res) => {
			if(res.ok) {
				callback(res.body)
			}else{
				console.log('Request to ' + uri + ' failed: ' + err);
				console.log(parameters);
				console.log(body);
				callback(null);
			}
		});
	}

	calculateSignature(uri, method, headers, content) {
		var sha = crypto.createHmac('sha256', this.apiSecret);

		var representation = [
			moment().utc().format('MM/DD/YYYY HH:mm:ss'),
			method,
			uri,
			headers['Content-MD5'],
			this.apiKey
		].join('\n');

		return sha.update(representation).digest('base64');
	}
}