import ChannelEngine from '../src/ChannelEngine';

var ce = new ChannelEngine('myshop', '7cbcff44f6f8a7f3a708da97911465676fb4920f', '6fd4404bed3f49bccd1ce664beae4f2956d6b41b');
console.log('test');
ce.getOrder(21)
	.then(response => {
		console.log(response);
		return response.json();
	}).then(json => {
		console.log(json);
	}).catch(function(err) {
		console.log(err);
	});