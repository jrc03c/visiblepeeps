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
				let provider = new Firebase.auth.TwitterAuthProvider();
				
				Firebase.auth().signInWithPopup(provider).then(function(result){
					console.log(result);
				}).catch(function(error){
					console.error(error);
				});
			},
			
			logout: function(){
				Firebase.auth().signOut();
			},
		},
		
		mounted: function(){
			let self = this;
			
			Firebase.auth().onAuthStateChanged(function(user){
				self.isLoggedIn = !!user;
			});
		},
	});
</script>