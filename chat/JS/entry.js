// const validateInput = () => {
// 	const button = document.getElementById("enter");
// 	button.addEventListener("click", function () {
// 		const value = document.getElementById("username").value;
// 		console.log(value);
// 		if (value.length < 6) {
// 			alert("用户名不得少于6位");
// 		}
// 	});
// };

// const __main = () => {
// 	validateInput();
// };

// __main();

((doc, ls, location) => {
	const oUsername = doc.querySelector("#username");
	const oEnterBtn = doc.querySelector("#enter");

	const init = () => {
		bindEvent();
	};

	function bindEvent() {
		oEnterBtn.addEventListener("click", handleEnterBtnClick, false);
	}

	function handleEnterBtnClick() {
		const username = oUsername.value.trim();

		if (username.length < 6) {
			alert("用户名不得小于6位");
			return;
		}

		ls.setItem("username", username);

		location.href = "index.html";
	}

	init();
})(document, localStorage, location);
