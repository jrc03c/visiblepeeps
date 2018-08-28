<template>
	<div>
		<side-menu></side-menu>
		
		<div id="main-content">
			<main-header></main-header>
			
			<p id="submit-button-container">
				<router-link to="/profile" class="submit-button">SUBMIT TWEET</router-link>
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
				let category = self.$store.state.currentCategory;
				let level = self.$store.state.currentLevel;
				
				if (!shouldKeepCurrentTweets){
					self.$refs.tweetContainer.innerHTML = "";
					self.lastUserUID = "-1";
				}
				
				let db = firebase.database();
				let ref = db.ref("/tweets/" + category).orderByKey().startAt(self.lastUserUID + "0").limitToFirst(12);
				
				ref.once("value").then(function(snapshot){
					let userUIDs = snapshot.val();
					if (!userUIDs) return;
					
					let uids = Object.keys(userUIDs);
					self.lastUserUID = uids[uids.length-1];
					
					uids.forEach(function(uid){
						let ref2 = db.ref("/allUsers/" + uid);
						
						ref2.once("value").then(function(snapshot2){
							let userData = snapshot2.val();
							
							if (!userData || !userData.profileTweet || !userData.professionalLevel || (level !== "ALL" && level !== userData.professionalLevel)){
								return;
							}
							
							// Create a blockquote element of class "twitter-tweet".
							let blockquote = document.createElement("blockquote");
							blockquote.className += "twitter-tweet";
							
							// Create an anchor element with the tweet's url as its href.
							let a = document.createElement("a");
							a.href = userData.profileTweet;
							
							// Create a script element with the Twitter widgets JS file
							// as its source.
							let script = document.createElement("script");
							script.src = "https://platform.twitter.com/widgets.js";
							
							// Put the anchor element inside the blockquote element.
							blockquote.appendChild(a);
							
							// Put the blockquote and the script inside the tweetContainer
							// element, which is referenced up in the HTML.
							self.$refs.tweetContainer.appendChild(blockquote);
							self.$refs.tweetContainer.appendChild(script);
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