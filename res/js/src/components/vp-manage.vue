<template>
	<div>
		<h1>Tweets to Approve</h1>
		
		<ul>
			<li v-for="tweet in $store.state.data.tweetsToApprove">
				<a :href="tweet.href">{{ tweet.href }}</a>
				
				<button @click="approve(tweet)">Approve</button>
				<button @click="deny(tweet)">Deny</button>
			</li>
		</ul>
		
		<h1>Blocked / Denied Tweets</h1>
		
		<h1>Admin Users</h1>
		
		<h1>Blocked Users</h1>
		
		<form @submit.prevent="block(userToBlock)">
			<input type="text" v-model="userToBlock">
			<input type="submit" value="Block">
		</form>
		
		<ul>
			<li v-for="username in $store.state.data.blockedUsers">
				<a :href="'https://twitter.com/' + username">{{ username }}</a>
				
				<button @click="unblock(username)">Unblock</button>
			</li>
		</ul>
	</div>
</template>

<script>
	let Vue = require("vue/dist/vue");
	let Firebase = require("firebase/app");
	
	module.exports = Vue.component("vp-manage", {
		data: function(){
			return {
				userToBlock: "",
			};
		},
		
		methods: {
			approve: function(tweet){
				let self = this;
				self.$store.dispatch("approveTweet", tweet);
			},
			
			deny: function(tweet){
				let self = this;
				self.$store.dispatch("denyTweet", tweet);
				
				let shouldBlockUser = confirm("Would you also like to block " + tweet.submittedBy + ", the user who submitted the tweet?");
				
				if (shouldBlockUser){
					self.block(tweet.submittedBy);
				}
			},
			
			block: function(username){
				let self = this;
				self.$store.dispatch("blockUser", username);
				self.userToBlock = "";
			},
			
			unblock: function(username){
				let self = this;
				self.$store.dispatch("unblockUser", username);
			},
		},
	});
</script>