<template>
	<div>
		<h1>Tweets to Approve</h1>
		
		<ul v-if="$store.state.data.tweetsToApprove && $store.state.data.tweetsToApprove.length > 0">
			<li v-for="tweet in $store.state.data.tweetsToApprove">
				<a :href="tweet.href">{{ tweet.href }}</a>
				
				<button @click="approve(tweet)">Approve</button>
				<button @click="deny(tweet)">Deny</button>
			</li>
		</ul>
		
		<p v-else>
			(There are no tweets to approve right now!)
		</p>
		
		<h1>Admin Users</h1>
		
		<form @submit.prevent="addAdminUser(userToAdmin)">
			<input type="text" v-model="userToAdmin">
			<input type="submit" value="Block">
		</form>
		
		<ul>
			<li v-for="user in adminUsers">
				<a :href="'https://twitter.com/' + user.username">{{ user.username }}</a>
				
				<button @click="removeAdminUser(user.uid)">Remove</button>
			</li>
		</ul>
		
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
				userToAdmin: "",
			};
		},
		
		computed: {
			adminUsers: function(){
				let self = this;
				let out = [];
				
				let allUsers = Object.keys(self.$store.state.data.allUsers).map(function(key){
					return self.$store.state.data.allUsers[key];
				});
				
				self.$store.state.data.adminUsers.forEach(function(uid){
					let user = allUsers.find(function(u){
						return u.uid === uid;
					});
					
					out.push(user);
				});
				
				return out;
			},
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
				self.userToBlock = "";
			},
			
			addAdminUser: function(username){
				let self = this;
				
				let allUsers = Object.keys(self.$store.state.data.allUsers).map(function(key){
					return self.$store.state.data.allUsers[key];
				});
				
				let user = allUsers.find(function(u){
					return u.username === username;
				});
				
				if (!user){
					alert("This user has not logged in yet. Please ask them to log in first.");
					return;
				}
				
				self.$store.dispatch("addAdminUser", user.uid);
				self.userToAdmin = "";
			},
			
			removeAdminUser: function(uid){
				let self = this;
				self.$store.dispatch("removeAdminUser", uid);
			},
		},
	});
</script>