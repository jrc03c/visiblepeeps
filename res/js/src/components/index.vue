<template>
	<div>
		<side-menu></side-menu>
		
		<div id="main-content">
			<main-header></main-header>
			
			<p id="submit-button-container">
				<router-link to="/profile" class="submit-button">Submit Tweet</router-link>
			</p>

			<div class="module-grid" ref="tweetContainer"></div>
			
			<div v-if="!finishedLoading">
				<br><br><br>
				Loading...
				<br><br><br>
			</div>
		</div>
	</div>
</template>

<script>
	let Vue = require("vue/dist/vue");
	let firebase = require("firebase/app");
	require("./side-menu.vue");
	require("./main-header.vue");
	
	module.exports = Vue.component("index", {
		data: function(){
			return {
				lastUserUID: "-1",
				finishedLoading: true,
				numberOfTweetsToLoadAtOnce: 6,
			};
		},
		
		watch: {
			"$store.state.currentLevel": function(){
				let self = this;
				self.loadTweetsFromCategory(true);
			},
			
			"$store.state.currentCategory": function(){
				let self = this;
				self.loadTweetsFromCategory(false);
			},
		},
		
		methods: {
			loadTweetsFromCategory: function(shouldKeepCurrentTweets){
				let self = this;
				
				if (!self.finishedLoading) return;
				self.finishedLoading = false;
				
				let category = self.$store.state.currentCategory;
				let level = self.$store.state.currentLevel;
				
				if (!shouldKeepCurrentTweets){
					self.$refs.tweetContainer.innerHTML = "";
					self.lastUserUID = "-1";
				}
				
				let db = firebase.database();
				let ref = db.ref("/tweets/" + category).orderByKey().startAt(self.lastUserUID + "0").limitToFirst(self.numberOfTweetsToLoadAtOnce);
				
				ref.once("value").then(function(snapshot){
					let userUIDs = snapshot.val();
					if (!userUIDs) return;
					
					let uids = Object.keys(userUIDs);
					self.lastUserUID = uids[uids.length-1];
					
					let count = uids.length;
					
					uids.forEach(function(uid){						
						let ref2 = db.ref("/approvedUsers/" + uid);
						
						ref2.once("value").then(function(snapshot2){
							let hasBeenApproved = !!snapshot2.val();
							
							if (!hasBeenApproved){
								count--;
								if (count <= 0) self.finishedLoading = true;
							}
							
							let ref3 = db.ref("/allUsers/" + uid);
							
							ref3.once("value").then(function(snapshot3){
								let userData = snapshot3.val();
								
								if (!userData || !userData.profileTweet || !userData.professionalLevel || (level !== "ALL" && level !== userData.professionalLevel)){
									count--;
									if (count <= 0) self.finishedLoading = true;
									return;
								}
								
								let wrapper = document.createElement("div");
								
								// Create a blockquote element of class "twitter-tweet".
								let blockquote = document.createElement("blockquote");
								blockquote.className += "twitter-tweet";
								
								// Create an anchor element with the tweet's url as its href.
								let a = document.createElement("a");
								a.href = userData.profileTweet;
								
								let flagButton = document.createElement("button");
								flagButton.className += "flaggy";
								flagButton.innerText = "&#9872;";
								flagButton.onclick = function(){
									if (!self.$store.state.currentUser){
										alert("You must be logged in to report tweets. Please log in and then try again.");
										return;
									}
									
									let shouldFlag = confirm("Tweet flagging should be reserved for inappropriate or irrelevant tweets. Once a tweet has been flagged, we will review it for appropriateness and relevance. Please note that your username will be recorded if you choose to report this tweet. Would you like to report this tweet as inappropriate or irrelevant?");
									
									if (!shouldFlag) return;
									
									db.ref("/flaggedUsers/" + uid).set(self.$store.state.currentUser.uid);
								};
								
								// Create a script element with the Twitter widgets JS file
								// as its source.
								let script = document.createElement("script");
								script.src = "https://platform.twitter.com/widgets.js";
								script.onload = function(){
									count--;
									if (count <= 0) self.finishedLoading = true;
								};
								
								// Put the anchor element inside the blockquote element.
								blockquote.appendChild(a);
								
								// Put the blockquote and the script inside the tweetContainer
								// element, which is referenced up in the HTML.
								wrapper.appendChild(blockquote);
								wrapper.appendChild(flagButton);
								wrapper.appendChild(script);
								
								self.$refs.tweetContainer.appendChild(wrapper);
							});
						});
					});
				});
			},
		},
		
		mounted: function(){
			let self = this;
			
			self.loadTweetsFromCategory(false);
			
			window.addEventListener("scroll", function(event){
				let h = document.documentElement;
				let b = document.body;
				let st = "scrollTop";
				let sh = "scrollHeight";

				var percent = (h[st]||b[st]) / ((h[sh]||b[sh]) - h.clientHeight);
			
				if (percent > 0.8){
					self.loadTweetsFromCategory(true);
				}
			});
		},
	});
</script>