<template>
	<div>
		<form v-if="$store.state.currentUserName" @submit.prevent="submit">
			<input type="text" v-model="url" @keydown="message = ''">
		</form>
		
		<div v-else>
			You're not logged in. Only logged-in users can submit tweets for approval!
		</div>
		
		<p v-if="message.length > 0">
			{{ message }}
		</p>
	</div>
</template>

<script>
	let Vue = require("vue/dist/vue");
	let URL = require("url-parse");
	
	module.exports = Vue.component("vp-submit", {
		data: function(){
			return {
				url: "",
				message: "",
			};
		},
		
		methods: {
			submit: function(){
				let self = this;
				let url = new URL(self.url);
				
				if (url.hostname !== "twitter.com" || !url.pathname.includes("status")){
					self.message = "There was something wrong with the URL you provided. Please provide a URL that points directly to a tweet.";
					return;
				}
				
				self.url = "";
				self.message = "Thanks! We'll look it over!";
				
				setTimeout(function(){
					self.message = "";
				}, 3000);
			},
		},
	});
</script>