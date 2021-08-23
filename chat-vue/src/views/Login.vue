<template>
	<div>
		<input
			type="text"
			id="username"
			placeholder="请输入用户名"
			v-model="username"
		/>
		<button id="enter" @click="handleEnterBtnClick">进入聊天室</button>
	</div>
</template>

<script>
export default {
	name: "Login",
	data() {
		return {
			username: "",
		};
	},
	methods: {
		handleEnterBtnClick() {
			const username = this.username.trim();

			if (username.length < 6) {
				alert("用户名不得小于6位");
				return;
			}

			localStorage.setItem("username", username);
			this.$router.push({ name: "Home" });
		},
	},
};
</script>

<style lang="scss" scoped></style>
