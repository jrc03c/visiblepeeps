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
	</div>
</template>

<script>
	let Vue = require("vue/dist/vue");
	let Firebase = require("firebase/app");
	
	module.exports = Vue.component("vp-manage", {
		methods: {
			approve: function(tweet){
				let self = this;
				self.$store.dispatch("approveTweet", tweet);
			},
			
			deny: function(tweet){
				let self = this;
			},
			
			blockUser: function(username){},
		},
	});
</script>