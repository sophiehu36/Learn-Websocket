((doc, ls, location) => {
	const oMessage = doc.querySelector("#message");
	const oSendBtn = doc.querySelector("#send");
	const oList = doc.querySelector("#list");
	const wsUrl = "ws:localhost:8000";
	let username = "";

	const init = () => {
		bindEvent();
	};

	var lockReconnect = false; //避免ws重复连接
	var ws = null; // 判断当前浏览器是否支持WebSocket
	createWebSocket(wsUrl); //连接ws

	function createWebSocket(url) {
		try {
			if ("WebSocket" in window) {
				ws = new WebSocket(url);
			}
			init();
		} catch (e) {
			reconnect(url);
			console.log(e);
		}
	}

	// 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
	window.onbeforeunload = function () {
		ws.close();
	};

	function reconnect(url) {
		if (lockReconnect) return;
		lockReconnect = true;
		setTimeout(function () {
			//没连接上会一直重连，设置延迟避免请求过多
			createWebSocket(url);
			lockReconnect = false;
		}, 2000);
	}

	//心跳检测
	var heartCheck = {
		timeout: 6000, //1分钟发一次心跳
		timeoutObj: null,
		serverTimeoutObj: null,
		reset: function () {
			clearTimeout(this.timeoutObj);
			clearTimeout(this.serverTimeoutObj);
			return this;
		},
		start: function () {
			var self = this;
			this.timeoutObj = setTimeout(function () {
				//这里发送一个心跳，后端收到后，返回一个心跳消息，
				//onmessage拿到返回的心跳就说明连接正常
				ws.send(JSON.stringify("ping"));
				console.log("ping!");
				self.serverTimeoutObj = setTimeout(function () {
					//如果超过一定时间还没重置，说明后端主动断开了
					ws.close(); //如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
				}, self.timeout);
			}, this.timeout);
		},
	};

	function bindEvent() {
		oSendBtn.addEventListener("click", handleSendBtnClick, false);
		ws.addEventListener("open", handleOpen, false);
		ws.addEventListener("close", handleClose, false);
		ws.addEventListener("error", handleError, false);
		ws.addEventListener("message", handleMessage, false);
	}

	function handleSendBtnClick() {
		console.log("Send message");
		const msg = oMessage.value;
		// 去掉空格的信息长度为0，即没有内容
		if (!msg.trim().length) {
			return;
		}
		ws.send(
			JSON.stringify({
				user: username,
				dateTime: new Date().getTime(),
				message: msg,
			})
		);

		oMessage.value = "";
	}

	function handleOpen(e) {
		console.log("Websocket open", e);
		heartCheck.reset().start();
		username = ls.getItem("username");
		// 用户名不存在时返回入口界面
		if (!username) {
			location.href = "entry.html";
			return;
		}
	}

	function handleClose(e) {
		console.log("Websocket close", e);
		reconnect(wsUrl);
	}

	function handleError(e) {
		console.log("Websocket error", e);
		reconnect(wsUrl);
	}

	// 获取到后端发送的数据，插入到页面
	function handleMessage(e) {
		console.log("Websocket message", e);
		heartCheck.reset().start();
		const msgData = JSON.parse(e.data);
		console.log(msgData);
		if (msgData !== "ping") {
			oList.appendChild(createMsg(msgData));
		}
	}

	function createMsg(data) {
		const { user, dateTime, message } = data;

		const oItem = doc.createElement("li");
		oItem.innerHTML = `
    <p>
      <span>${user}</span>
      <i>${new Date(dateTime)}</i>
    </p>
    <p>消息：${message}</p>
    `;
		return oItem;
	}

	// try {
	// init();
	// } catch (e) {
	// 	console.log("catch", e);
	// 	reconnect(ws);
	// }
})(document, localStorage, location);
