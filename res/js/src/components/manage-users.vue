<template>
	<div>
		<h2>Approved User Count</h2>
		
		<p>There are {{ approvedUsers.length }} approved users on the site!</p>
		
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
				<button style="margin:0 0.5em 0 0" @click="approveUser(user)">Approve</button>
				<button style="margin:0 2em 0 0" @click="blockUser(user)">Block</button>

				<a :href="'https://twitter.com/' + user.username">
					{{ user.username }}
				</a> / 
				
				<a :href="user.profileTweet" target="_blank">
					{{ user.profileTweet }}
				</a>
			</li>
		</ul>
		
		<div v-else style="padding:1em 0 0; font-size:13px;">
			There are currently no new users.
		</div>
		
		<h2>Flagged Users</h2>
		
		<ul v-if="flags.length > 0" class="manage-text">
			<li v-for="flag in flags">
				<button style="margin:0 2em 0 0" @click="resolveFlag(flag)">Resolve Flag</button>

				<a style="color:rgb(29,161,242);" :href="flag.flaggedUser.profileTweet">Tweet</a> by {{ flag.flaggedUser.username }}, flagged by {{ flag.flaggedBy.username }} (<a style="color:rgb(29,161,242);" :href="flag.flaggedBy.profileTweet">Tweet</a>)			
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
				<a :href="'https://twitter.com/' + user.username">{{ user.username }}</a> <span v-if="user.uid.length === 0">(deleted account)</span>
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
	
	// Keep track of all of the database-listening refs. We'll turn them all off before destroying the component.
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
				alwaysAdmins: ["jrc03c", "A_Werchmeister"],
				approvedUsers: [],
			};
		},
		
		methods: {
			addAdminUser: function(username){
				let self = this;
				let db = firebase.database();
				
				// Get the user from the database whose username matches the value from the input field. If there are multiple such users, then so be it; they'll all be added as admins, since we probably don't know which UID points to the actually-existing user. I mean, we could figure it out, but that'd take too much work.
				let ref = db.ref("/allUsers").orderByChild("username").equalTo(self.userToAdmin);
				
				ref.once("value").then(function(snapshot){
					let users = snapshot.val();
					
					// If there are no users that have that username, then ask the user to log in first so that we can create their UID.
					if (!users){
						alert("This user has not yet logged in. Please ask them to log in, and then try adding them as an administrator again.");
						return;
					}
					
					// Otherwise, all their UID to the list of admin users.
					Object.keys(users).forEach(function(uid){
						db.ref("/adminUsers/" + uid).set(true);
					});
				});
				
				// Reset the text input field.
				self.userToAdmin = "";
			},
			
			removeAdminUser: function(user){
				let self = this;
				
				// If the user to remove as an admin is in the list of "always admins" (i.e., super-admins), then don't remove them.
				if (self.alwaysAdmins.indexOf(user.username) > -1){
					alert("Nice try! But you can't remove " + user.username + ". That person is a super-admin!");
					return;
				}
				
				// Prompt for confirmation that this is really what we want to do.
				let shouldRemoveAdminUser = confirm("Are you sure that you want to remove " + user.username + " as an administrator?");
				
				// If we decide not to remove them, then don't do anything.
				if (!shouldRemoveAdminUser) return;
				
				// Otherwise, get a reference to /adminUsers in the database and set their UID's value to null.
				let db = firebase.database();
				db.ref("/adminUsers/" + user.uid).set(null);
			},
			
			approveUser: function(user){
				// When a new user signs up, they're automatically placed in the "new users" list. As long as a user is not in the "approved users" list, their tweet won't be displayed on the home page. This function (1) adds them to the approved users list, (2) removes them from the new users list, and (3) removes them from the blocked users list, in case they were there for some reason.
				let self = this;
				let db = firebase.database();
				
				let updates = {};
				updates["/approvedUsers/" + user.uid] = true;
				updates["/newUsers/" + user.uid] = null;
				updates["/blockedUsers/" + user.username] = null;
				
				db.ref().update(updates);
			},
			
			resolveFlag: function(flag){
				// When a user's tweet has been flagged, it shows up in the flagged users list. There are no automatic actions here. Either the admin can choose to take manual action and block someone (either the flagger or the flaggee), or they can do nothing. This function merely removes the flag and does nothing else.
				let self = this;
				let db = firebase.database();
				db.ref("/flaggedUsers/" + flag.flaggedUser.uid).set(null);
			},
			
			// This is where we block a user.
			blockUser: function(user){
				let self = this;
				let db = firebase.database();
				
				let updates = {};
				
				// If a UID has been supplied, then remove the user from the flagged users list, the new users list, and the approved users list.
				if (user.uid.length > 0) updates["/flaggedUsers/" + user.uid] = null;
				if (user.uid.length > 0) updates["/newUsers/" + user.uid] = null;
				if (user.uid.length > 0) updates["/approvedUsers/" + user.uid] = null;

				// Add the user to the blocked users list.
				updates["/blockedUsers/" + user.username] = true;
				
				// Push all the changes to the database.
				db.ref().update(updates);
			},
			
			blockUserByUsername: function(username){
				// We call this function when an admin has typed a username into the input field.
				let self = this;
				let db = firebase.database();
				
				// Get all of the users in the database whose username matches the one entered into the input field. Note that there may be multiple results, in which case we'll block all of them.
				let ref = db.ref("/allUsers").orderByChild("username").equalTo(username);
				
				ref.once("value").then(function(snapshot){
					let users = snapshot.val();
					
					if (!users){
						// If there are no users found with that username, then make an empty entry and block it.
						self.blockUser({
							username,
							uid: "",
						});
					} else {
						// Otherwise, block all of the UIDs.
						Object.keys(users).forEach(function(uid){
							self.blockUser(users[uid]);
						});
					}
				});
				
				// Reset the input field.
				self.userToBlock = "";
			},
			
			unblockUser: function(user){
				// Confirm that we really want to unblock them.
				let shouldUnblockUser = confirm("Are you sure that you want to unblock " + user.username + "?");
				
				// If we change our minds, then don't do anything.
				if (!shouldUnblockUser) return;
				
				// Remove them from the blocked users list and (if a UID has been supplied) add them to the approved users list.
				let db = firebase.database();
				db.ref("/blockedUsers/" + user.username).set(null);
				if (user.uid.length > 0) db.ref("/approvedUsers/" + user.uid).set(true);
			},
		},
		
		mounted: function(){
			let self = this;
			let db = firebase.database();
			
			// If the references are still listening, then turn them off.
			refs.forEach(function(ref){
				ref.off();
			});
			
			refs = [];			
			
			// This is a little helper function for turning a typical database object of key-value pairs in which the key represents a user UID into an array of user UIDs.
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
			
			// Use the helper function to get the list of admin users and new users.
			pushUserDataFromRefToList("adminUsers");
			pushUserDataFromRefToList("newUsers");
			pushUserDataFromRefToList("approvedUsers");
			
			// For flagged users and blocked users, the process is a little more complicated because we need to construct local data.
			let ref1 = db.ref("/flaggedUsers");
			refs.push(ref1);
			
			ref1.on("value", function(snapshot){
				self.flags = [];
				let flags = snapshot.val();
				if (!flags) return;
				
				// For each flag...
				Object.keys(flags).forEach(function(flaggedUser){
					let flaggedBy = flags[flaggedUser];
					
					// Create the flag object, which indicates who flagged whom.
					let flag = {
						flaggedUser: {username: "", uid: "", profileTweet: ""},
						flaggedBy: {username: "", uid: "", profileTweet: ""},
					};
					
					// Get the user data for the flaggee.
					db.ref("/allUsers/" + flaggedUser).once("value").then(function(snapshot2){
						let userData = snapshot2.val();
						if (!userData) return;
						userData.uid = flaggedUser;
						flag.flaggedUser = userData;
					});
					
					// Get the user data for the flagger.
					db.ref("/allUsers/" + flaggedBy).once("value").then(function(snapshot2){
						let userData = snapshot2.val();
						if (!userData) return;
						userData.uid = flaggedBy;
						flag.flaggedBy = userData;
					});
					
					// Push the flag object into the list of flags.
					self.flags.push(flag);
				});
			});
			
			let ref2 = db.ref("/blockedUsers");
			refs.push(ref2);
			
			ref2.on("value", function(snapshot2){
				self.blockedUsers = [];
				let blockedUsers = snapshot2.val();
				if (!blockedUsers) return;
				
				// Blocked users are listed by username, which means that it's possible that they don't exist in the list of all users (i.e., they were pre-blocked before they logged in, or remained blocked even after they deleted their account). So, for each username...
				Object.keys(blockedUsers).forEach(function(username){
					// Get the user data for the user whose username matches this one.
					let ref3 = db.ref("/allUsers").orderByChild("username").equalTo(username);
					
					ref3.once("value").then(function(snapshot3){
						let users = snapshot3.val();
						
						if (!users){
							// If there are no such users, then create an object with an empty UID.
							self.blockedUsers.push({
								username,
								uid: "",
							});
						} else {
							// Otherwise, push the user data into the list of blocked users.
							Object.keys(users).forEach(function(uid){
								let userData = users[uid];
								userData.uid = uid;
								self.blockedUsers.push(userData);
							});
						}
					});
				});
			});
		},
		
		beforeDestroy: function(){
			refs.forEach(function(ref){
				ref.off();
			});
			
			refs = [];
		},
	});
</script>