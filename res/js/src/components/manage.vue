<template>
	<div>
		<side-menu @manage="setCurrentView"></side-menu>
		
			<div id="manage-content">
		
				<div v-if="isLoggedIn && isAdmin">
					<div v-if="currentView === 'users'">
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
					
					<div v-if="currentView === 'categories'">
						<h2>Categories</h2>
						
						<form @submit.prevent="addNewCategory(categoryToAdd)">
							<input type="text" v-model="categoryToAdd">
							<input type="submit" value="Add">
						</form>
						
						<ul v-if="Object.keys(categories).length > 0" class="manage-text">
							<li v-for="category in Object.keys(categories)">
								<button  style="margin:0 2em 0 0" @click="removeCategory(category)">Delete</button>

								{{ category }}
							</li>
						</ul>
						
						<div v-else style="padding:1em 0 0; font-size:13px;">
							There are currently no categories.
						</div>
					</div>
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
				userToAdmin: "",
				adminUsers: [],
				userToBlock: "",
				blockedUsers: [],
				flaggedUsers: [],
				categoryToAdd: "",
				categories: {},
			};
		},
		
		computed: {
			currentView: function(){
				let self = this;
				return self.$store.state.currentManagementView;
			},
		},
		
		methods: {
			setCurrentView: function(view){
				let self = this;
				self.$store.state.currentManagementView = view;
			},
			
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
			
			// This is where we ignore a flagged user.
			ignoreUser: function(user){
				let self = this;
				let db = firebase.database();
				db.ref("/flaggedUsers/" + user.uid).set(null);
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
			
			addNewCategory: function(category){
				let self = this;
				self.categories[category] = true;
				let db = firebase.database();
				db.ref("/categoryList").set(self.categories);
				self.categoryToAdd = "";
			},
			
			removeCategory: function(category){
				let self = this;
				self.categories[category] = null;
				let db = firebase.database();
				db.ref("/categoryList").set(self.categories);
				db.ref("/tweets/" + category).set(null);
			},
		},
		
		mounted: function(){
			let self = this;
			
			// Listen for users logging in and out, and then...
			firebase.auth().onAuthStateChanged(function(user){
				// Unhide the #app element, which was hidden so as
				// not to show the weird markup.
				document.getElementById("app").style.display = "block";
				
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
						let user = snapshot.val();
						
						// If the data doesn't exist, then return.
						if (!user) return;
						
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
							if (!adminUsers || !adminUsers[user.username]){
								window.location.href = "/";
							}
							
							// Otherwise, store the list of adminUsers for later,
							// since we'll be adding and removing people from it.
							self.adminUsers = Object.keys(adminUsers);
							
							// Indicate that this user is an administrator.
							self.isAdmin = true;
						});
					});
					
					// Get a reference to /blockedUsers.
					let ref2 = db.ref("/blockedUsers");
					refs.push(ref2);
					
					// Listen to this reference.
					ref2.on("value", function(snapshot){
						// Get the data.
						let blockedUsers = snapshot.val();
						
						// If there are no blocked users, then
						// set blockedUsers to be an empty array,
						// then return.
						if (!blockedUsers){
							self.blockedUsers = [];
							return;
						}
						
						// Set blockedUsers to the list of usernames,
						// which are the keys to the data object.
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
								self.flaggedUsers.push(userData);
							});
						});
					});
					
					let ref6 = db.ref("/categoryList");
					refs.push(ref6);
					
					ref6.on("value", function(snapshot){
						self.categories = {};
						let categories = snapshot.val();
						if (!categories) return;
						self.categories = categories;
					});
				}
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