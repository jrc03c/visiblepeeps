<template>
	<div>
		<h1>Tweets to Approve</h1>
		
		<ul>
			<li v-for="tweet in tweetsToApprove">
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
		data: function(){
			return {
				tweetsToApprove: [],
			};
		},
		
		methods: {
			approve: function(tweet){
				let self = this;
				let db = Firebase.database();
				let ref = db.ref("/approved-tweets");
				let newApprovedTweet = ref.push();
				
				newApprovedTweet.set("https://twitter.com" + tweet.pathname).then(function(){
					self.tweetsToApprove.splice(self.tweetsToApprove.indexOf(tweet), 1);
				}).catch(function(error){
					console.error(error);
				});
			},
			
			deny: function(tweet){
				let self = this;
			},
			
			blockUser: function(username){},
		},
		
		mounted: function(){
			let self = this;
			
			let db = Firebase.database();
			let ref = db.ref("/tweets-to-approve");
			
			ref.once("value").then(function(snapshot){
				let tweetsToApprove = snapshot.val();
				if (!tweetsToApprove) return;
				self.tweetsToApprove = tweetsToApprove;
			});
		},
	});
</script>