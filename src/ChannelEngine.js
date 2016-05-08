import fetch from 'isomorphic-fetch';
import querystring from 'querystring';
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

	getOrders(statuses, dateFrom, dateTo) {
		statuses = statuses || [0]; // IN_PROGRESS by default
		dateFrom = dateFrom || moment().subtract(2, 'week');
		dateTo = dateTo || moment().add(1, 'day');

		return this.getRequest('orders', 'GET', {
			orderStatus: statuses,
			acknowledge: false,
			fromDate: dateFrom.toISOString(),
			toDate: dateTo.toISOString()
		}).then(this.handleError);
	}

	getOrder(id) {
		return this.getRequest('orders/' + id, 'GET').then(this.handleError);
	}

	getChannels() {
		return this.getRequest('channels/', 'GET').then(this.handleError);
	}

	getStatisticsDashboard(period, channelId) {
		var qs = { period: period };
		if(channelId) qs.channelId = channelId;

		return this.getRequest('statistics/dashboard/', 'GET', qs).then(this.handleError);
	}

	getStatisticsClickConversion(dateFrom, dateTo) {
		dateFrom = dateFrom || moment().subtract(2, 'week');
		dateTo = dateTo || moment().add(1, 'day');

		return this.getRequest('statistics/clickconversion/', 'GET', {
			fromDate: dateFrom.toISOString(),
			toDate: dateTo.toISOString()
		}).then(this.handleError);
	}

	getStatisticsOrders(period, channelId) {
		var qs = { period: period };
		if(channelId) qs.channelId = channelId;

		return this.getRequest('statistics/orders/', 'GET', qs).then(this.handleError);
	}

	getRequest(uri, method, parameters, body) {
		uri = this.apiUri + uri;
		var md5 = crypto.createHash('md5');
		var date = moment().utc();
		var headers = {};
		
		parameters = parameters || {};
		parameters['_noCache'] = date.unix();
		body = body || null;

		var qs = '?' + querystring.stringify(parameters);
		var contentHash = body ? md5.update(body).digest('base64') : '';
		

		headers['Accept'] = 'application/json';
		headers['Content-Type'] = 'application/json';
		headers['Content-MD5'] = contentHash;
		headers['Authorization'] = 'HMAC ' + this.apiKey + ':' + this.calculateSignature(uri, method, contentHash, body, date);
		headers['X-Date'] = date.format('ddd, DD MMM YYYY HH:mm:ss') + ' GMT';

		return fetch(this.baseUri + uri + qs, {
			method: method,
			body: body,
			mode: 'cors',
			headers: headers
		});
	}

	handleError(response) {
		if(!response.ok) throw Error(response.statusText);
		return response;
	}

	calculateSignature(uri, method, contentHash, content, date) {
		var sha = crypto.createHmac('sha256', this.apiSecret);

		var representation = [
			date.utc().format('MM/DD/YYYY HH:mm:ss'),
			method,
			uri,
			contentHash,
			this.apiKey
		].join('\n');

		return sha.update(representation).digest('base64');
	}
}