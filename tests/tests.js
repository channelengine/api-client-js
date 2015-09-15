import ChannelEngine from '../src/ChannelEngine';

var ce = new ChannelEngine('myshop', '7cbcff44f6f8a7f3a708da97911465676fb4920f', '6fd4404bed3f49bccd1ce664beae4f2956d6b41b');
ce.getOrders([0], function(data){
	console.log(data);
});