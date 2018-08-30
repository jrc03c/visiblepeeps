<template>
	<div>
		<h2>Admin Users</h2>
		
		<form @submit.prevent="addAdminUser(userToAdmin)">
			<input type="text" v-model="userToAdmin">
			<input type="submit" value="Add">
		</form>
		
		<ul class="manage-text">
			<li v-for="user in adminUsers">
				<button style="margin:0 2em 0 0" @click="removeAdminUser(user)">Remove</button>
				<a :href="'https://twitter.com/' + user.username">{{ user.username }}</a>
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
				<button @click="ignoreUser(user); blockUser(user)">Block</button>
			</li>
		</ul>
		
		<div v-else style="padding:1em 0 0; font-size:13px;">
			There are currently no new users.
		</div>
		
		<h2>Flagged Users</h2>
		
		<ul v-if="flags.length > 0" class="manage-text">
			<li v-for="flag in flags">
				<a :href="flag.flaggedUser.profileTweet">tweet</a> by {{ flag.flaggedUser.username }}, flagged by {{ flag.flaggedBy.username }} (<a :href="flag.flaggedBy.profileTweet">tweet</a>)
				
				<button @click="resolveFlag(flag)">Resolve Flag</button>
			</li>
		</ul>
		
		<div v-else style="padding:1em 0 0; font-size:13px;">
			There are currently no flagged users.
		</div>
		
		<h2>Blocked Users</h2>
		
		<form @submit.prevent="blockUserByUsername(userToBlock)">
			<input type="text" v-model="userToBlock">
			<input type="submit" value="Block">
		</form>
		
		<ul v-if="blockedUsers.length > 0" class="manage-text">
			<li v-for="user in blockedUsers">
				<button style="margin:0 2em 0 0" @click="unblockUser(user)">Unblock</button>
				<a :href="'https://twitter.com/' + user.username">{{ user.username }}</a>
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
				userToBlock: "",
				adminUsers: [],
				blockedUsers: [],
				flags: [],
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
				
				let ref = db.ref("/allUsers").orderByChild("username").equalTo(self.userToAdmin);
				
				ref.once("value").then(function(snapshot){
					let users = snapshot.val();
					
					if (!users){
						alert("This user has not yet logged in. Please ask them to log in, and then try adding them as an administrator again.");
						return;
					}
					
					Object.keys(users).forEach(function(uid){
						db.ref("/adminUsers/" + uid).set(true);
					});
				});
				
				// // Reset the userToAdmin variable, which will
				// // reset the text input field.
				self.userToAdmin = "";
			},
			
			// This is where we remove an admin user.
			removeAdminUser: function(user){
				// Prompt for confirmation that this is really 
				// what we want to do.
				let shouldRemoveAdminUser = confirm("Are you sure that you want to remove " + user.username + " as an administrator?");
				
				// If we decide not to remove them, then return.
				if (!shouldRemoveAdminUser) return;
				
				// Otherwise, get a reference to /adminUsers in the 
				// database and set their username's value to null.
				let db = firebase.database();
				db.ref("/adminUsers/" + user.uid).set(null);
			},
			
			approveUser: function(user){
				let self = this;
				let db = firebase.database();
				
				let updates = {};
				updates["/approvedUsers/" + user.uid] = true;
				updates["/newUsers/" + user.uid] = null;
				updates["/blockedUsers/" + user.uid] = null;
				
				db.ref().update(updates);
			},
			
			resolveFlag: function(flag){
				let self = this;
				let db = firebase.database();
				db.ref("/flaggedUsers/" + flag.flaggedUser.uid).set(null);
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
			blockUser: function(user){
				let self = this;
				let db = firebase.database();
				
				// Get a reference to /blockedUsers	in the database
				// and set their username's value to true.
				db.ref("/blockedUsers/" + user.username).set(true);
				db.ref("/approvedUsers/" + user.uid).set(null);
			},
			
			blockUserByUsername: function(username){
				let self = this;
				let db = firebase.database();
				
				let ref = db.ref("/allUsers").orderByChild("username").equalTo(username);
				
				ref.once("value").then(function(snapshot){
					let users = snapshot.val();
					if (!users) return;
					
					Object.keys(users).forEach(function(uid){
						self.blockUser(users[uid]);
					});
				});
				
				self.userToBlock = "";
			},
			
			// This is where we unblock a user.
			unblockUser: function(user){
				// Confirm that we really want to unblock them.
				let shouldUnblockUser = confirm("Are you sure that you want to unblock " + user.username + "?");
				
				// If we change our minds, then return.
				if (!shouldUnblockUser) return;
				
				// Get a reference to /blockedUsers in the database
				// and set their username's value to null.
				let db = firebase.database();
				db.ref("/blockedUsers/" + user.username).set(null);
				db.ref("/approvedUsers/" + user.uid).set(true);
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
					
					function pushUserDataFromRefToList(list){
						let ref = db.ref("/" + list);
						refs.push(ref);
						
						ref.on("value", function(snapshot){
							self[list] = [];
							let data = snapshot.val();
							if (!data) return;
							
							Object.keys(data).forEach(function(uid){
								db.ref("/allUsers/" + uid).once("value").then(function(snapshot2){
									let userData = snapshot2.val();
									if (!userData) return;
									userData.uid = uid;
									self[list].push(userData);
								});
							});
						});
					}
					
					pushUserDataFromRefToList("adminUsers");
					pushUserDataFromRefToList("newUsers");
					
					let ref1 = db.ref("/flaggedUsers");
					refs.push(ref1);
					
					ref1.on("value", function(snapshot){
						self.flags = [];
						let flags = snapshot.val();
						if (!flags) return;
						
						Object.keys(flags).forEach(function(flaggedUser){
							let flaggedBy = flags[flaggedUser];
							
							let flag = {
								flaggedUser: {username: "", uid: "", profileTweet: ""},
								flaggedBy: {username: "", uid: "", profileTweet: ""},
							};
							
							db.ref("/allUsers/" + flaggedUser).once("value").then(function(snapshot2){
								let userData = snapshot2.val();
								if (!userData) return;
								userData.uid = flaggedUser;
								flag.flaggedUser = userData;
							});
							
							db.ref("/allUsers/" + flaggedBy).once("value").then(function(snapshot2){
								let userData = snapshot2.val();
								if (!userData) return;
								userData.uid = flaggedBy;
								flag.flaggedBy = userData;
							});
							
							self.flags.push(flag);
						});
					});
					
					let ref2 = db.ref("/blockedUsers");
					refs.push(ref2);
					
					ref2.on("value", function(snapshot2){
						self.blockedUsers = [];
						let blockedUsers = snapshot2.val();
						if (!blockedUsers) return;
						
						Object.keys(blockedUsers).forEach(function(username){
							let ref3 = db.ref("/allUsers").orderByChild("username").equalTo(username);
							
							ref3.once("value").then(function(snapshot3){
								let users = snapshot3.val();
								if (!users) return;
								
								Object.keys(users).forEach(function(uid){
									let userData = users[uid];
									userData.uid = uid;
									self.blockedUsers.push(userData);
								});
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