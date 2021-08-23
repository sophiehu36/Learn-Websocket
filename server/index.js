const Ws = require("ws");

((Ws) => {
	// ws:localhost:8000
	const server = new Ws.Server({ port: 8000 });

	const init = () => {
		bindEvent();
	};

	function bindEvent() {
		server.on("open", handleOpen);
		server.on("close", handleClose);
		server.on("error", handleError);
		server.on("connection", handleConnection);
	}

	function handleOpen() {
		console.log("BE: Websocket open");
	}
	function handleClose() {
		console.log("BE: Websocket close");
	}
	function handleError() {
		console.log("BE: Websocket error");
	}
	// message事件是在connection内绑定的
	function handleConnection(ws) {
		console.log("BE: Websocket connected");

		ws.on("message", handleMessage);
	}

	// 接收前端发送过来的数据
	function handleMessage(e) {
		const msg = JSON.stringify(JSON.parse(e));
    console.log("message from FE", msg);
    // 向所有客户端发送信息
		server.clients.forEach(function (c) {
			if (c.readyState === 1) {
				c.send(msg);
			}
		});
	}

	init();
})(Ws);
