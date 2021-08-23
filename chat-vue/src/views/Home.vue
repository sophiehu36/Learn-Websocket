<template>
	<div>
		<ul id="list">
			<li v-for="item in messageList" :key="item.id">
				<p>
					<span>{{ item.user }}</span>
					<i>{{ new Date(item.dateTime) }}</i>
				</p>
				<p>消息：{{ item.message }}</p>
			</li>
		</ul>
		<input
			type="text"
			id="message"
			placeholder="请输入消息"
			v-model="message"
		/>
		<button id="send" @click="handleSendBtnClick">发送</button>
	</div>
</template>

<script>
//心跳检测
var heartCheck = {
	timeout: 60000, //1分钟发一次心跳
	timeoutObj: null,
	serverTimeoutObj: null,
	reset: function() {
		// 重置，清除定时器
		clearTimeout(this.timeoutObj);
		clearTimeout(this.serverTimeoutObj);
		return this;
	},
	start: function(ws) {
		var self = this; // 避免和局部作用域的this混淆
		this.timeoutObj = setTimeout(function() {
			//这里发送一个心跳，后端收到后，返回一个心跳消息，
			//onmessage拿到返回的心跳就说明连接正常
			ws.send(JSON.stringify("ping"));
			console.log("ping!");
			self.serverTimeoutObj = setTimeout(function() {
				//如果超过一定时间还没重置，说明后端主动断开了
				ws.close(); //如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
			}, self.timeout);
		}, this.timeout); //外部的setTimeout会先于内部的setTimeout执行
	},
};

export default {
	name: "Home",
	data() {
		return {
			wsUrl: "ws:localhost:8000",
			ws: null,
			lockReconnect: false,
			message: "",
			messageList: [],
		};
	},
	mounted() {
		this.createWebSocket(this.wsUrl);
	},
	computed: {
		username() {
			return localStorage.getItem("username");
		},
	},
	methods: {
		createWebSocket(url) {
			try {
				// 如果当前浏览器支持WebSocket，就实例化一个WebSocket
				if ("WebSocket" in window) {
					this.ws = new WebSocket(url);
				}
				this.bindEvent(this.ws);
			} catch (e) {
				this.reconnect(url);
				console.log(e);
			}
		},
		reconnect(url) {
			if (this.lockReconnect) return;
			this.lockReconnect = true;
			setTimeout(function() {
				//没连接上会一直重连，设置延迟避免请求过多
				this.createWebSocket(url);
				this.lockReconnect = false;
			}, 2000);
		},
		bindEvent(ws) {
			ws.addEventListener("open", this.handleOpen, false);
			ws.addEventListener("close", this.handleClose, false);
			ws.addEventListener("error", this.handleError, false);
			ws.addEventListener("message", this.handleMessage, false);
		},
		handleOpen(e) {
			console.log("FE: Websocket open", e);
			heartCheck.reset().start(this.ws);
			// 用户名不存在时返回入口界面
			if (!this.username) {
				this.$router.push("/login");
				return;
			}
		},
		handleClose(e) {
			console.log("FE: Websocket close", e);
			this.reconnect(this.wsUrl);
		},
		handleError(e) {
			console.log("FE: Websocket error", e);
			this.reconnect(this.wsUrl);
		},
		handleMessage(e) {
			console.log("FE: Websocket message", e);
			heartCheck.reset().start(this.ws);
			const msgData = JSON.parse(e.data);
			console.log(msgData);
			if (msgData !== "ping") {
				this.messageList.push(msgData);
			}
		},
		handleSendBtnClick() {
			console.log("Send message to BE");
			const msg = this.message;
			// 去掉空格的信息长度为0，即没有内容
			if (!msg.trim().length) {
				return;
			}
			// 判断链接状态是否为1(OPEN,已经链接且可以通讯)
			if (this.ws.readyState !== 1) {
				this.ws.close();
			} else {
				this.ws.send(
					JSON.stringify({
						id: new Date().getDate() + this.username,
						user: this.username,
						dateTime: new Date().getTime(),
						message: msg,
					})
				);
				this.message = "";
			}
		},
	},
};
</script>

<style lang="scss" scoped></style>
