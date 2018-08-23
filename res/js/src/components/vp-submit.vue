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
	let Firebase = require("firebase/app");
	let URL = require("url-parse");
	
	module.exports = Vue.component("vp-submit", {
		data: function(){
			return {
				canSubmit: true,
				url: "",
				message: "",
			};
		},
		
		methods: {
			submit: function(){
				let self = this;
				
				if (!self.canSubmit){
					self.message = "Please wait a few seconds and try again.";
					return;
				}
				
				let url = new URL(self.url);
				
				if (url.hostname !== "twitter.com" || !url.pathname.includes("status")){
					self.message = "There was something wrong with the URL you provided. Please provide a URL that points directly to a tweet.";
					return;
				}
				
				let alreadySubmitted = false;
				
				if (self.$store.state.data.tweetsToApprove){
					self.$store.state.data.tweetsToApprove.forEach(function(tweet){
						if (tweet.href === self.url) alreadySubmitted = true;
					});
				}
				
				if (!alreadySubmitted){
					url.submittedBy = self.$store.state.currentUserName;
					self.$store.dispatch("addTweetToApprove", url);
				}
				
				self.url = "";
				self.message = "Thanks! We'll look it over!";
				self.canSubmit = false;
				
				setTimeout(function(){
					self.message = "";
					self.canSubmit = true;
				}, 5000);
			},
		},
	});
</script>