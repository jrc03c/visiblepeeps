<template>
	<div>
		<h2>Admin Users</h2>
		
		<form @submit.prevent="addAdminUser(userToAdmin)">
			<input type="text" v-model="userToAdmin">
			<input type="submit" value="Add">
		</form>
		
		<ul class="manage-text">
			<li v-for="username in adminUsers">
				<button style="margin:0 2em 0 0" @click="removeAdminUser(username)">Remove</button>
				<a :href="'https://twitter.com/' + username">{{ username }}</a>
			</li>
		</ul>
		
		<h2>New Users</h2>
		
		<ul v-if="newUsers.length > 0" class="manage-text">
			<li v-for="user in newUsers">
				<a :href="'https://twitter.com/' + user.username">
					{{ user.username }}
				</a> / 
				
				<a :href="user.profileTweet">
					{{ user.profileTweet }}
				</a>
				
				<button @click="approveUser(user)">Approve</button>
				<button @click="ignoreUser(user); blockUser(user.username)">Block</button>
			</li>
		</ul>
		
		<div v-else style="padding:1em 0 0; font-size:13px;">
			There are currently no new users.
		</div>
		
		<h2>Flagged Users</h2>
		
		<ul v-if="flaggedUsers.length > 0" class="manage-text">
			<li v-for="user in flaggedUsers">
				<a :href="'https://twitter.com/' + user.username">
					{{ user.username }}
				</a> / 
				
				<a :href="user.profileTweet">
					{{ user.profileTweet }}
				</a>
				
				<button @click="ignoreUser(user)">Ignore</button>
				<button @click="ignoreUser(user); blockUser(user.username)">Block</button>
			</li>
		</ul>
		
		<div v-else style="padding:1em 0 0; font-size:13px;">
			There are currently no flagged users.
		</div>
		
		<h2>Blocked Users</h2>
		
		<form @submit.prevent="blockUser(userToBlock)">
			<input type="text" v-model="userToBlock">
			<input type="submit" value="Block">
		</form>
		
		<ul v-if="blockedUsers.length > 0" class="manage-text">
			<li v-for="username in blockedUsers">
				<button style="margin:0 2em 0 0" @click="unblockUser(username)">Unblock</button>
				<a :href="'https://twitter.com/' + username">{{ username }}</a>
			</li>
		</ul>
		
		<div v-else style="padding:1em 0 0; font-size:13px;">
			There are currently no blocked users.
		</div>
	</div>
</template>

<script>
	let Vue = require("vue/dist/vue");
	let firebase = require("firebase/app");
	let refs = [];
	
	module.exports = Vue.component("manage-users", {
		data: function(){
			return {
				userToAdmin: "",
				adminUsers: [],
				userToBlock: "",
				blockedUsers: [],
				flaggedUsers: [],
				newUsers: [],
			};
		},
		
		watch: {
			"$store.state.currentUser": function(){
				let self = this;
				self.onAuthStateChanged();
			},
		},
		
		methods: {
			// This is where we add admin users.
			addAdminUser: function(username){
				let self = this;
				let db = firebase.database();
				
				// Get a reference to the /adminUsers list
				// in the database and set their username's
				// value to true.
				db.ref("/adminUsers/" + username).set(true);
				
				// Reset the userToAdmin variable, which will
				// reset the text input field.
				self.userToAdmin = "";
			},
			
			// This is where we remove an admin user.
			removeAdminUser: function(username){
				// Prompt for confirmation that this is really 
				// what we want to do.
				let shouldRemoveAdminUser = confirm("Are you sure that you want to remove " + username + " as an administrator?");
				
				// If we decide not to remove them, then return.
				if (!shouldRemoveAdminUser) return;
				
				// Otherwise, get a reference to /adminUsers in the 
				// database and set their username's value to null.
				let db = firebase.database();
				db.ref("/adminUsers/" + username).set(null);
			},
			
			approveUser: function(user){
				let self = this;
				let db = firebase.database();
				
				let updates = {};
				updates["/approvedUsers/" + user.uid] = true;
				updates["/newUsers/" + user.uid] = null;
				
				db.ref().update(updates);
			},
			
			// This is where we ignore a flagged user.
			ignoreUser: function(user){
				let self = this;
				let db = firebase.database();
				
				let updates = {};
				updates["/flaggedUsers/" + user.uid] = null;
				updates["/newUsers/" + user.uid] = null;
				
				db.ref().update(updates);
			},
			
			// This is where we block a user.
			blockUser: function(username){
				let self = this;
				let db = firebase.database();
				
				// Get a reference to /blockedUsers	in the database
				// and set their username's value to true.
				db.ref("/blockedUsers/" + username).set(true);
				
				// Reset the userToBlock variable, which will reset
				// the text input field.
				self.userToBlock = "";
			},
			
			// This is where we unblock a user.
			unblockUser: function(username){
				// Confirm that we really want to unblock them.
				let shouldUnblockUser = confirm("Are you sure that you want to unblock " + username + "?");
				
				// If we change our minds, then return.
				if (!shouldUnblockUser) return;
				
				// Get a reference to /blockedUsers in the database
				// and set their username's value to null.
				let db = firebase.database();
				db.ref("/blockedUsers/" + username).set(null);
			},
			
			onAuthStateChanged: function(){
				let self = this;
				let user = self.$store.state.currentUser;
				
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
						let user = snapshot.val();
						
						// If the data doesn't exist, then return.
						if (!user) return;
						
						// Get a reference to the list of /adminUsers.
						let ref1 = db.ref("/adminUsers");
						refs.push(ref1);
						
						// Listen to this reference.
						ref1.on("value", function(snapshot2){
							self.adminUsers = [];
							let adminUsers = snapshot2.val();
							if (!adminUsers) return;
							self.adminUsers = Object.keys(adminUsers);
						});
					});
					
					// Get a reference to /blockedUsers.
					let ref2 = db.ref("/blockedUsers");
					refs.push(ref2);
					
					// Listen to this reference.
					ref2.on("value", function(snapshot){
						self.blockedUsers = [];
						let blockedUsers = snapshot.val();
						if (!blockedUsers) return;
						self.blockedUsers = Object.keys(blockedUsers);
					});
					
					let ref4 = db.ref("/flaggedUsers");
					refs.push(ref4);
					
					ref4.on("value", function(snapshot){
						self.flaggedUsers = [];
						let flaggedUsers = snapshot.val();
						if (!flaggedUsers) return;
						
						Object.keys(flaggedUsers).forEach(function(uid){
							let ref5 = db.ref("/allUsers/" + uid);
							
							ref5.once("value").then(function(snapshot2){
								let userData = snapshot2.val();
								if (!userData) return;
								userData.uid = uid;
								self.flaggedUsers.push(userData);
							});
						});
					});
					
					let ref6 = db.ref("/newUsers");
					refs.push(ref6);
					
					ref6.on("value", function(snapshot){
						self.newUsers = [];
						let newUsers = snapshot.val();
						if (!newUsers) return;
						
						Object.keys(newUsers).forEach(function(uid){
							let ref7 = db.ref("/allUsers/" + uid);
							
							ref7.once("value").then(function(snapshot2){
								let userData = snapshot2.val();
								if (!userData) return;
								userData.uid = uid;
								self.newUsers.push(userData);
							});
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