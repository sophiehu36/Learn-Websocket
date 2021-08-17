((doc, ls, location) => {
	const oMessage = doc.querySelector("#message");
	const oSendBtn = doc.querySelector("#send");
	const oList = doc.querySelector("#list");
	const ws = new WebSocket("ws:localhost:8000");
	let username = "";

	const init = () => {
		bindEvent();
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
		username = ls.getItem("username");
		// 用户名不存在时返回入口界面
		if (!username) {
			location.href = "entry.html";
			return;
		}
	}

	function handleClose(e) {
		console.log("Websocket close", e);
	}

	function handleError(e) {
		console.log("Websocket error", e);
	}

	// 获取到后端发送的数据，插入到页面
	function handleMessage(e) {
		console.log("Websocket message", e);
		const msgData = JSON.parse(e.data);
		oList.appendChild(createMsg(msgData));
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
	init();
	// } catch (e) {
	// 	console.log("catch", e);
	// 	reconnect(ws);
	// }
})(document, localStorage, location);
