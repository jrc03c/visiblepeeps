<template>
	<div>
		<side-menu></side-menu>
		
			<div id="manage-content">
		
				<div v-if="isLoggedIn && isAdmin">
					<router-view></router-view>
				</div>
				
				<div v-else>
					<h2>Log in</h2>
					
					<p>You are not logged in. Please log in to manage stuff.</p>
				</div>
			</div>
		
	</div>
</template>

<script>
	let Vue = require("vue/dist/vue");
	let firebase = require("firebase/app");
	let refs = [];
	
	module.exports = Vue.component("manage", {
		data: function(){
			return {
				isLoggedIn: false,
				isAdmin: false,
			};
		},
		
		watch: {
			"$store.state.currentUser": function(){
				let self = this;
				self.onAuthStateChanged();
			},
		},
		
		methods: {
			onAuthStateChanged: function(){
				let self = this;
				let user = self.$store.state.currentUser;
				
				// Set the isLoggedIn variable.
				self.isLoggedIn = !!user;
				
				// If the references are still listening, then 
				// turn them off.
				refs.forEach(function(ref){
					ref.off();
				});
				
				refs = [];
				
				// If the user is logged in, then...
				if (user){
					let db = firebase.database();
					
					// Get a reference to the logged-in user's data
					// in the database.
					let ref3 = db.ref("/allUsers/" + user.uid);
					refs.push(ref3);
					
					// Listen to this reference in case their data changes.
					ref3.on("value", function(snapshot){
						// Get their data.
						let userData = snapshot.val();
						
						// If the data doesn't exist, then return.
						if (!userData) return;
						
						// Get a reference to the list of /adminUsers.
						let ref1 = db.ref("/adminUsers");
						refs.push(ref1);
						
						// Listen to this reference.
						ref1.on("value", function(snapshot2){
							// Get the data.
							let adminUsers = snapshot2.val();
							
							// If there are no admin users, or if this user's
							// username is not in the list of adminUsers, then
							// redirect the user back to the home page.
							if (!adminUsers || !adminUsers[user.uid]){
								window.location.href = "/";
							}
							
							// Otherwise, store the list of adminUsers for later,
							// since we'll be adding and removing people from it.
							self.adminUsers = Object.keys(adminUsers);
							
							// Indicate that this user is an administrator.
							self.isAdmin = true;
						});
					});
				}
			},
		},
		
		mounted: function(){
			let self = this;
			self.onAuthStateChanged();
		},
		
		beforeDestroy: function(){
			refs.forEach(function(ref){
				ref.off();
			});
			
			refs = [];
		},
	});
</script>