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
					self.$store.commit("setCurrentUserName", result.additionalUserInfo.username);
				}).catch(function(error){
					console.error(error);
				});
			},
			
			logout: function(){
				let self = this;
				Firebase.auth().signOut();
				self.$store.commit("setCurrentUserName", null);
			},
		},
		
		mounted: function(){
			let self = this;
			
			// listen for logging in / out
			Firebase.auth().onAuthStateChanged(function(user){
				self.isLoggedIn = !!user;
				
				if (user && localStorage.hasOwnProperty("currentUserName")){
					let currentUserName = localStorage.getItem("currentUserName");
					self.$store.commit("setCurrentUserName", currentUserName);
				}
			});
		},
	});
</script>