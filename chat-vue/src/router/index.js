import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
	{
		path: "/",
		name: "Home",
		// 异步路由，只有访问home页面时才加载对应资源
		component: () => import(/* webpackChunkName: "home" */ "@/views/Home.vue"),
	},
	{
		path: "/login",
		name: "Login",
		component: () =>
			import(/* webpackChunkName: "login" */ "@/views/Login.vue"),
		// 访问Login页面前执行
		beforeEnter: (to, from, next) => {
			const isLogin = localStorage.username;
			isLogin ? next({ name: "Home" }) : next();
		},
	},
];

const router = new VueRouter({
	mode: "history",
	base: process.env.BASE_URL,
	routes,
});

// beforeEach，路由切换前执行
// 验证是否登录，如果未登录就会跳转到Login
router.beforeEach((to, from, next) => {
	const isLogin = localStorage.username;
	const { name } = to;
	const isLoginOrRegister = name === "Login";
	// 如果打开的页面就是Login，就不再跳转
	// 避免死循环
	isLogin || isLoginOrRegister ? next() : next({ name: "Login" });
});

export default router;
