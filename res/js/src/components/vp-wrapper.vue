<template>
	<div>
		<div v-if="isLoggedIn">
			<button @click="logout">Log out</button>
		</div>
		
		<div v-else>
			<button @click="login">Log in</button>
		</div>
		
		<router-view></router-view>
	</div>
</template>

<script>
	let Vue = require("vue/dist/vue");
	let Firebase = require("firebase/app");
	
	module.exports = Vue.component("vp-wrapper", {
		data: function(){
			return {
				isLoggedIn: false,
			};
		},
		
		methods: {
			login: function(){
				let self = this;
				let provider = new Firebase.auth.TwitterAuthProvider();
				
				Firebase.auth().signInWithPopup(provider).then(function(result){
					console.log(result);
					
					// set current user's username in the store
					self.$store.commit("setCurrentUserName", result.additionalUserInfo.username);
				}).catch(function(error){
					console.error(error);
				});
			},
			
			logout: function(){
				let self = this;
				Firebase.auth().signOut();
				
				// remove current user's username from the store
				self.$store.commit("setCurrentUserName", null);
			},
		},
		
		mounted: function(){
			let self = this;
			
			// listen for logging in / out
			Firebase.auth().onAuthStateChanged(function(user){
				self.isLoggedIn = !!user;
			});
		},
	});
</script>