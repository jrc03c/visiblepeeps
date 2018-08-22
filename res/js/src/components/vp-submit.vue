<template>
	<div v-if="authWasInitialized">
		<div v-if="!isLoggedIn">
			You're not logged in. <button @click="login">Log in</button>
		</div>
		
		<div v-else>
			You're logged in. Submit something. <button @click="logout">Log out</button>
		</div>
	</div>
</template>

<script>
	let Vue = require("vue/dist/vue");
	let Firebase = require("firebase/app");
	
	module.exports = Vue.component("vp-submit", {
		data: function(){
			return {
				authWasInitialized: false,
				isLoggedIn: false,
			};
		},
		
		methods: {
			login: function(){
				let self = this;
				let provider = new Firebase.auth.TwitterAuthProvider();
				
				Firebase.auth().signInWithPopup(provider).then(function(result){
					// something
				}).catch(function(error){
					console.error(error);
				});
			},
			
			logout: function(){
				let self = this;
				Firebase.auth().signOut();
				self.$router.push("/");
			},
		},
		
		mounted: function(){
			let self = this;
			
			Firebase.auth().onAuthStateChanged(function(user){
				self.authWasInitialized = true;
				self.isLoggedIn = !!user;
			});
		},
	});
</script>