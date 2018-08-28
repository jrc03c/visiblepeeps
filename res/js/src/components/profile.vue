<template>
	<div>
		<side-menu></side-menu>
		
		<div id="main-content">
			<main-header></main-header>
			
			<div class="submit-page">
				<div v-if="isLoggedIn">
					
					<p>Hi! We are so happy you want to join! Once you have submitted your tweet, you can at any point return to this page and update your information. Totes! :D</p><br>
						
					<p>Please only submit tweets including the following hashtags: <span style="color:rgb(29,161,242);">#VisibleWomen · #VisibleWoman · #VisibleNB · #VisibileNBs</span></p>
						
					<br><br>
					
					<form @submit.prevent="save">
						<label for="tweet-url">
							<p style="font-weight:500;">Tweet URL</p>
						</label>
						
						<p style="font-style:italic; color:rgb(135,135,135);">This can be found by pressing the downward arrow in the top right corner on your tweet, and then clicking 'Copy link to tweet'.</p>	
						
						<input type="text" v-model="url" id="tweet-url" @keydown="message = ''">
						
						<br><br><br>
						
						<p style="font-weight:500;">Choose what level represents you</p>
						
						<br>
						
						<select name="level" v-model="selectedLevel">
							<option disabled value="">Please select one...</option>
							
							<option v-for="level in levels" :value="level">
								{{ level }}
							</option>
						</select>
						
						<br><br><br>
						
						<p style="font-weight:500;">Choose the profession that best describes you (Select up to 3)</p>
						<p style="font-style:italic; color:rgb(135,135,135);">If you feel like a category that represents you is missing, please feel free to contact us, and we will sort it out. You can find contact info on the about page under Site Issues.</p>
						
						<br>
						
						<div v-for="category in categories" class="profession">
							<input type="checkbox" v-model="category.value" :id="category.name">
							
							<label :for="category.name">
								{{ category.name }}
							</label>
						</div>
						
						<br><br><br>
						
						<input type="submit" value="Save"><a class="delete-profile" href="">Delete profile</a>
						
						<p v-if="message.length > 0" class="profile-msg">
							{{ message }}
						</p>
						
					</form>
				</div>
					
				<div v-else>
					<p>This page will act as your profile when you log in with your Twitter account. Once you have made a submission and been approved, you'll be able to update your submitted tweet, and any categories you have picked.</p>
					
					<p>Please log in with your Twitter account to create a profile page.</p>

					<button @click="logIn">Login</button>
				</div>
			</div>
		</div>
	</div>
</template>
		
<script>
	let Vue = require("vue/dist/vue");
	let firebase = require("firebase/app");

	module.exports = Vue.component("profile", {
		// The url variable keeps track of what the user types
		// into the text input field. The isLoggedIn makes it
		// so that only logged-in users can see the submission form.
		// The canSubmit variable helps to prevent spamming of 
		// the form; we use a 5-second timeout between submissions,
		// during which the canSubmit variable is set to false.
		// The message variable shows a message to the user if
		// something is wrong with the submission (like if their
		// url doesn't come from twitter.com, or if it doesn't contain
		// "status", or if they don't wait long enough between 
		// submissions). We also download the tweetsToApprove and 
		// the approvedTweets to make sure that we don't let the user
		// add duplicates. And finally, we download the user's data
		// so that we can attach their username to the tweet they
		// submit, which makes it easy for us to block them later
		// if we don't like the submissions they're making.
		data: function(){
			return {
				isLoggedIn: false,
				canSubmit: true,
				message: "",
				user: null,
				categories: [],
				selectedLevel: "",
				levels: ["Professional Creative", "Hobbyist", "Student"],
				url: "",
			};
		},
		
		methods: {
			// This is where we do all the submission magic.
			save: function(){
				let self = this;
				
				// Try to make a URL object out of the user's submission.
				let urlObj;
				
				try {
					urlObj = new URL(self.url);
				} catch (error){
					// If it fails, then it's probably because they didn't enter
					// a valid URL. Let them know about it and then return.
					self.message = "It looks like you entered an invalid URL. Please enter a URL that points directly to a tweet.";
					return;
				}
				
				// If the user's submission doesn't come from twitter.com or doesn't
				// include "status", then let them know about it and then return.
				let pathParts = urlObj.pathname.split("/");
				
				if (urlObj.hostname !== "twitter.com" || pathParts[2] !== "status"){
					self.message = "There was a problem with the URL you provided. Please enter a URL that points directly to a tweet.";
					return;
				}
				
				// Only allow users to submit tweets from their own profile.
				if (pathParts[1] !== self.user.username){
					self.message = "It looks like the tweet you provided isn't one of yours. Please only submit your own tweets. Thanks!";
					return;
				}
				
				// Update all of the category entries both in the user's profile part
				// of the database and in the category list itself.
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
				
				// If the user has at least one category checked, then the user
				// should also be added to the "ALL" category.
				if (hasAtLeastOneCategory){
					updates["/tweets/ALL/" + self.user.uid] = true;
				} else {
					updates["/tweets/ALL/" + self.user.uid] = true;
				}
				
				// Also update the user's profile tweet URL.
				updates["/allUsers/" + self.user.uid + "/profileTweet"] = "https://twitter.com/" + self.user.username + "/status/" + pathParts[3];
				
				// Also update the user's professional level.
				updates["/allUsers/" + self.user.uid + "/professionalLevel"] = self.selectedLevel;
				
				// Push the updates to the database.
				db.ref().update(updates).then(function(){
					self.message = "Saved!";
					
					setTimeout(function(){
						self.message = "";
					}, 3000);
				}).catch(function(error){
					self.message = "There was an error saving your profile information. :(";
				});
			},
		},
		
		mounted: function(){
			let self = this;
			
			// We listen to a bunch of database references. I'm not sure
			// whether this is optimal or not, but it is what it is. :) 
			// Anyway, I'm making references to them here so that I can 
			// turn them off when the user logs out.
			let ref1, ref2;
			
			// Listen for users logging in and out, and then...
			firebase.auth().onAuthStateChanged(function(user){
				// Unhide the #app element, which was hidden so as not
				// to show off its weird markup.
				document.getElementById("app").style.display = "block";
				
				// Set the isLoggedIn variable.
				self.isLoggedIn = !!user;
				
				// turn off listeners
				if (ref1) ref1.off();
				if (ref2) ref2.off();
				
				// If the user is logged in, then...
				if (user){
					let db = firebase.database();
					
					// Get a reference to the user's data in the database.
					ref1 = db.ref("/allUsers/" + user.uid);
					
					// Listen to that reference, in case the user suddenly
					// gets blocked or their data changes in some other way.
					ref1.on("value", function(snapshot){
						// Get their data.
						let userData = snapshot.val();
						
						// If for some reason the data doesn't exist,
						// then return.
						if (!userData) return;
						
						// Set their info into the user variable.
						self.user = userData;
						self.user.uid = user.uid;
						
						self.url = self.user.profileTweet || "";
						self.selectedLevel = self.user.professionalLevel || "";
						
						if (ref2) ref2.off();
						
						ref2 = db.ref("/categoryList");
						
						ref2.on("value", function(snapshot){
							self.categories = [];
							
							let categories = snapshot.val();
							if (!categories) return;
							
							Object.keys(categories).forEach(function(category){
								self.categories.push({
									name: category,
									value: self.user.categories && self.user.categories[category],
								});
							});
						});
					});
				}
			});
		},
	});
</script>