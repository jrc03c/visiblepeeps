<template>
	<div>
		<attention></attention>

		<side-menu></side-menu>
		
		<div id="main-content">
			<main-header></main-header>
			
			<div class="submit-page">
				<div v-if="$store.state.currentUser">
					
					<p>Hi again! We are so happy that you want to join! :D Remember that you can at any point return to this page to update your submitted tweet, update any categories you have picked, or (if you wish) delete your tweet from the site.</p><br>
						
					<p>Please only submit tweets that include the following hashtags: <span style="color:rgb(29,161,242);">#VisibleWomen · #VisibleWoman · #VisibleNB · #VisibileNBs</span></p>
						
					<br><br>
					
					<form @submit.prevent="save" @click="message = ''" @keydown="message = ''">
						<label for="tweet-url">
							<p style="font-weight:500;">Tweet URL</p>
						</label>
						
						<p style="font-style:italic; color:rgb(135,135,135); padding:0 0 1.75em;">This can be found by pressing the downward arrow in the top right corner on your tweet, and then clicking "Copy link to tweet."</p>	
						
						<input type="text" v-model="url" id="tweet-url" @keydown="message = ''">
						
						<br><br><br><br>
						
						<p style="font-weight:500;">Choose what level represents you</p>
						
						<br>
						
						<select name="level" v-model="selectedLevel">
							<option disabled value="">Please select one...</option>
							
							<option v-for="level in levels" :value="level">
								{{ level }}
							</option>
						</select>
						
						<br><br><br><br>
						
						<p style="font-weight:500;">Choose up to 3 categories that best describe your profession</p>
						<p style="font-style:italic; color:rgb(135,135,135);">If you feel like a category that represents you is missing, please feel free to contact us, and we will sort it out. You can find contact info on the <router-link to="/about">About</router-link> page under Site Issues.</p>
						
						<br>
						
						<div v-for="category in categories" class="profession" :class="{'checkbox-disabled': enoughCategories && !category.value}">
							<input type="checkbox" v-model="category.value" :id="category.name" :disabled="enoughCategories && !category.value">
							
							<label :for="category.name">
								{{ category.name }}
							</label>
						</div>
						
						<br><br><br><br>
						
						<input type="submit" value="Save"><a class="delete-profile" @click="$store.dispatch('deleteAccount')">Delete</a>
						
						<p v-if="message.length > 0" class="profile-msg" v-html="message"></p>
						
					</form>
				</div>
					
				<div v-else>
					<p>Hi! Before you can submit your tweet to the site, we need to ask you to log in with your Twitter account. This is necessary both to prevent any malicious misuse of the site and to verify that the tweet you submit is your own; but we do not store any personal data besides your username, and we can't access or control any part your Twitter account.</p><br>

					<p>Once you have made a submission and been approved, you can at any point return to this page to update your submitted tweet, update any categories you have picked, or (if you wish) delete your tweet from the site.</p><br><br>

					<p>
						<button @click="$store.dispatch('login')">Login</button>
					</p><br><br>
					
					<p><i>NOTE: Sometimes, there are problems with the login process. This is a known bug related to how Firebase authenticates with Twitter. If your login attempt fails, please just try again. Sorry for any inconvenience! :)</i></p>
				</div>
			</div>
		</div>
	</div>
</template>
		
<script>
	let Vue = require("vue/dist/vue");
	let firebase = require("firebase/app");
	let refs = [];

	module.exports = Vue.component("profile", {
		data: function(){
			return {
				canSubmit: true,
				message: "",
				user: null,
				categories: [],
				maxCategoryCount: 3,
				selectedLevel: "",
				levels: ["Professional", "Hobbyist", "Student"],
				url: "",
			};
		},
		
		computed: {
			enoughCategories: function(){
				// The user can't select more than (for example) 3 categories at a time.
				let self = this;
				let count = 0;
				
				self.categories.forEach(function(category){
					if (category.value) count++;
				});
				
				return count >= self.maxCategoryCount;
			},
		},
		
		watch: {
			// Listen for user change events so that we can update their data in the page.
			"$store.state.currentUser": function(){
				let self = this;
				self.onAuthStateChanged();
			},
			
			"$store.state.categories": function(){
				let self = this;
				self.updateCategories();
			},
		},
		
		methods: {
			save: function(){
				let self = this;
				
				// Try to make a URL object out of the user's submission.
				let urlObj;
				
				try {
					urlObj = new URL(self.url.toLowerCase());
				} catch (error){
					// If it fails, then it's probably because they didn't enter a valid URL. Let them know about it and then return.
					self.message = "It looks like you entered an invalid URL. Please enter a URL that points directly to a tweet.";
					return;
				}
				
				// If the user's submission doesn't come from twitter.com or doesn't include "status", then let them know about it and then return.
				let pathParts = urlObj.pathname.split("/");
				
				if (urlObj.hostname !== "twitter.com" || pathParts[2] !== "status"){
					self.message = "There was a problem with the URL you provided. Please enter a URL that points directly to a tweet.";
					return;
				}
				
				// Only allow users to submit tweets from their own profile.
				if (pathParts[1].toLowerCase() !== self.user.username.toLowerCase()){
					self.message = "It looks like the tweet you provided isn't one of yours. Please only submit your own tweets. Thanks!";
					return;
				}
				
				// Update all of the category entries both in the user's profile part of the database and in the category list itself.
				let db = firebase.database();
				let hasAtLeastOneCategory = false;
				let updates = {};
				
				self.categories.forEach(function(category){
					let path1 = "/tweets/" + category.name + "/" + self.user.uid;
					let path2 = "/allUsers/" + self.user.uid + "/categories/" + category.name;
					
					if (category.value === true){
						updates[path1] = true;
						updates[path2] = true;
						hasAtLeastOneCategory = true;
					} else {
						updates[path1] = null;
						updates[path2] = null;
					}
				});
				
				// If the user has at least one category checked, then the user should also be added to the "ALL" category.
				if (hasAtLeastOneCategory){
					updates["/tweets/ALL/" + self.user.uid] = true;
				} else {
					updates["/tweets/ALL/" + self.user.uid] = null;
				}
				
				// Also update the user's profile tweet URL.
				updates["/allUsers/" + self.user.uid + "/profileTweet"] = "https://twitter.com/" + self.user.username.toLowerCase() + "/status/" + pathParts[3];
				
				// Also update the user's professional level.
				updates["/allUsers/" + self.user.uid + "/professionalLevel"] = self.selectedLevel;
				
				// Push the updates to the database.
				db.ref().update(updates).then(function(){
					self.message = "Saved!<br><br>Note that if you've just signed up, your submission will need to be approved before it'll appear on the home screen. Thanks!";
				}).catch(function(error){
					self.message = "There was an error saving your profile information. :(";
				});
			},
			
			onAuthStateChanged: function(){
				let self = this;
				let user = self.$store.state.currentUser;
				let db = firebase.database();
				
				// Turn off any listeners.
				refs.forEach(function(ref){
					ref.off();
				});
				
				refs = [];
				
				// If the user is logged in, then...
				if (user){
					// Get a reference to the user's data in the database.
					let ref1 = db.ref("/allUsers/" + user.uid);
					refs.push(ref1);
					
					// Listen to that reference, in case the user suddenly gets blocked or their data changes in some other way.
					ref1.on("value", function(snapshot){
						// Get their data.
						let userData = snapshot.val();
						
						// If for some reason the data doesn't exist, then return.
						if (!userData) return;
						
						// Set their info into the local user variable.
						self.user = userData;
						self.user.uid = user.uid;
						
						self.url = self.user.profileTweet || "";
						self.selectedLevel = self.user.professionalLevel || "";
						
						self.updateCategories();
					});
				}
			},
			
			updateCategories: function(){
				let self = this;
				self.categories = [];
				
				self.$store.state.categories.forEach(function(category){
					self.categories.push({
						name: category,
						value: self.user && self.user.categories && self.user.categories[category],
					});
				});
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