<template>
	<div>
		<side-menu></side-menu>
		
		<div id="main-content">
			<main-header></main-header>
			
			<p id="submit-button-container">
				<router-link to="/submit" class="submit-button">Submit Tweet</router-link>
			</p>

			<div class="module-grid" ref="tweetContainer"></div>
			
			<div v-if="message.length > 0">
				<br><br><br>
				{{ message }}
				<br><br><br>
			</div>
		</div>
	</div>
</template>

<script>
	let Vue = require("vue/dist/vue");
	let firebase = require("firebase/app");
	let _ = require("lodash");
	require("./side-menu.vue");
	require("./main-header.vue");
	
	// Add shuffle capability to arrays.
	Array.prototype.shuffle = function(){
		let out = [];
		let copy = this.slice();
		
		while (copy.length > 0){
			let i = Math.floor(Math.random() * copy.length);
			let val = copy.splice(i, 1)[0];
			out.push(val);
		}
		
		return out;
	};
	
	module.exports = Vue.component("index", {
		data: function(){
			return {
				finishedLoading: true,
				numberOfTweetsToLoadAtOnce: 6,
				message: "",
				tweets: [],
				index: 0,
				count: 0,
			};
		},
		
		watch: {
			"$store.state.currentLevel": function(){
				let self = this;
				self.fetchTweetsFromCategory();
			},
			
			"$store.state.currentCategory": function(){
				let self = this;
				self.fetchTweetsFromCategory();
			},
		},
		
		methods: {
			fetchTweetsFromCategory: function(){
				let self = this;
				let category = self.$store.state.currentCategory;
				let db = firebase.database();
				let ref = db.ref("/tweets/" + category);
				
				self.$refs.tweetContainer.innerHTML = "";
				
				ref.once("value").then(function(snapshot){
					self.tweets = [];
					let tweets = snapshot.val();
					
					if (!tweets){
						self.message = "There are no more tweets in this category.";
					} else {
						self.tweets = Object.keys(tweets).shuffle();
					}
					
					self.index = 0;
					self.finishedLoading = true;
					
					self.loadMoreTweets();
				});
				
				let t = setInterval(function(){
					if (document.body.scrollHeight <= window.innerHeight){
						if (!self.finishedLoading) return;
						self.loadMoreTweets();
					} else {
						clearInterval(t);
					}
				}, 100);
			},
			
			loadMoreTweets: function(){
				let self = this;
				if (self.tweets.length === 0) return;
				let db = firebase.database();
				let level = self.$store.state.currentLevel;
				
				if (!self.finishedLoading) return;
				self.finishedLoading = false;
				self.message = "Loading...";
				
				let uids = self.tweets.slice(self.index, self.index + self.numberOfTweetsToLoadAtOnce);
				self.count = uids.length;
				self.index += self.numberOfTweetsToLoadAtOnce;
				
				if (self.count === 0){
					self.message = "There are no more tweets in this category.";
					return;
				}
				
				uids.forEach(function(uid){						
					let ref2 = db.ref("/approvedUsers/" + uid);
					
					ref2.once("value").then(function(snapshot2){
						let hasBeenApproved = !!snapshot2.val();
						
						if (!hasBeenApproved){
							self.count--;
							if (self.count <= 0) self.finishedLoading = true;
							self.message = "There are no more tweets in this category.";
							return;
						}
						
						let ref3 = db.ref("/allUsers/" + uid);
						
						ref3.once("value").then(function(snapshot3){
							let userData = snapshot3.val();
							
							if (!userData || !userData.profileTweet || !userData.professionalLevel || (level !== "ALL" && level !== userData.professionalLevel)){
								self.count--;
								if (self.count <= 0) self.finishedLoading = true;
								self.message = "There are no more tweets in this category.";
								return;
							}
							
							self.appendTweetToDOM(userData);
						});
					});
				});
			},
			
			appendTweetToDOM: function(userData, ){
				let self = this;
				
				let wrapper = document.createElement("div");
				wrapper.className += "tweet-wrapper";
				
				// Create a blockquote element of class "twitter-tweet".
				let blockquote = document.createElement("blockquote");
				blockquote.className += "twitter-tweet";
				blockquote.setAttribute("data-dnt", true);
				
				// Create an anchor element with the tweet's url as its href.
				let a = document.createElement("a");
				a.href = userData.profileTweet;
				
				let flagButton = document.createElement("button");
				flagButton.className += "flaggy";
				flagButton.innerText = "⚑";
				flagButton.style.opacity = 0;
				
				flagButton.onclick = function(){
					if (!self.$store.state.currentUser){
						alert("You must be logged in to report tweets. Please log in and then try again.");
						return;
					}
					
					let shouldFlag = confirm("Tweet flagging should be reserved for inappropriate or irrelevant tweets. Once a tweet has been flagged, we will review it for appropriateness and relevance. Please note that your username will be recorded if you choose to report this tweet. Would you like to report this tweet as inappropriate or irrelevant?");
					
					if (!shouldFlag) return;
					let userUid = self.$store.state.currentUser.uid;
					
					db.ref("/allUsers/" + userUid + "/username").once("value").then(function(snapshot){
						let username = snapshot.val();
						if (!username) return;
						
						db.ref("/blockedUsers/" + username).once("value").then(function(snapshot){
							let isBlocked = !!snapshot.val();
							if (isBlocked) return;
							db.ref("/flaggedUsers/" + uid).set(userUid);
						});
					});
				};
				
				// Create a script element with the Twitter widgets JS file
				// as its source.
				let script = document.createElement("script");
				script.src = "https://platform.twitter.com/widgets.js";
				
				script.onload = function(){
					self.count--;
					if (self.count <= 0) self.finishedLoading = true;
					self.message = "There are no more tweets in this category.";
					
					setTimeout(function(){
						flagButton.style.opacity = 1;
					}, 1000);
				};
				
				// Put the anchor element inside the blockquote element.
				try {
					blockquote.appendChild(a);
					
					// Put the blockquote and the script inside the tweetContainer
					// element, which is referenced up in the HTML.
					wrapper.appendChild(blockquote);
					wrapper.appendChild(flagButton);
					wrapper.appendChild(script);
					
					self.$refs.tweetContainer.appendChild(wrapper);
				} catch (error){}
			},
		},
		
		mounted: function(){
			let self = this;
			
			self.fetchTweetsFromCategory();
			
			window.addEventListener("scroll", function(event){
				let h = document.documentElement;
				let b = document.body;
				let st = "scrollTop";
				let sh = "scrollHeight";

				var percent = (h[st]||b[st]) / ((h[sh]||b[sh]) - h.clientHeight);
			
				if (percent > 0.8){
					self.loadMoreTweets();
				}
			});
		},
	});
</script>