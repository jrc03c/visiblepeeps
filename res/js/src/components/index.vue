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
			
			<a class="fake-a" id="back-to-top-link" @click="scrollToTop">▲</a>
			
			<br><br><br>
		</div>
	</div>
</template>

<script>
	let Vue = require("vue/dist/vue");
	let firebase = require("firebase/app");
	let _ = require("lodash");
	require("./side-menu.vue");
	require("./main-header.vue");
	
	// Add shuffle capability to arrays. This enables us to randomize the order of the tweets we display.
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
	
	// Export the Vue component.
	module.exports = Vue.component("index", {
		data: function(){
			return {
				finishedLoading: true,
				numberOfTweetsToLoadAtOnce: 6,
				message: "",
				tweets: [],
				domElements: [],
				index: 0,
				count: 0,
			};
		},
		
		// We need to watch for the currentLevel and currentCategory variables in our Vuex Store. If they change, we fetch new tweets from the current category.
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
			// Here we fetch new tweets from the current category. Note that this function is throttled and will at most be called once per second. In other words, the user can't change professional levels or categories quicker than once per second. Hopefully, this throttling helps to cut down on duplicate tweet loading.
			fetchTweetsFromCategory: _.throttle(function(){
				let self = this;
				let category = self.$store.state.currentCategory;
				
				// Get a reference to all of the tweets in the current category.
				let db = firebase.database();
				let ref = db.ref("/tweets/" + category);
				
				// Indicate to users that we're loading new tweets.
				self.message = "Loading...";
				
				// Whenever we load new tweets, we insert their wrapper element into this list of DOM elements. Then, when the category is changed, we go back through and delete each element in the list. This is more effective than solely clearing out tweetContainer's innerHTML, since some tweets from the previous category may still load even after the new tweets have been fetched.
				self.domElements.forEach(function(el){
					el.parentElement.removeChild(el);
				});
				
				self.$refs.tweetContainer.innerHTML = "";				
				self.domElements = [];
				
				// Get the list of user UIDs from the category. I refer to them as "tweets" in this section, but that's technically not the data here; instead, it's a list of the users (by UID) that fall into that category.
				ref.once("value").then(function(snapshot){
					self.tweets = [];
					let tweets = snapshot.val();
					
					if (!tweets){
						// If there are no tweets returned from this query, then we're finished loading because there are no tweets in this category.
						self.message = "";
					} else {
						// Otherwise, grab the list of key values.
						self.tweets = Object.keys(tweets).shuffle();
					}
					
					// Reset the index. As we inject more tweets into the page, the index tells us how far into the list we've gotten.
					self.index = 0;
					
					// Inject the first of the tweets into the page.
					self.finishedLoading = true;
					self.loadMoreTweets();
				});
				
				// Continue injecting tweets until the height of the document is greater than the height of the page.
				let t = setInterval(function(){
					if (document.body.scrollHeight <= window.innerHeight){
						if (!self.finishedLoading) return;
						self.loadMoreTweets();
					} else {
						clearInterval(t);
					}
				}, 100);
			}, 1000),
			
			loadMoreTweets: function(){
				let self = this;
				
				// If there are no tweets returned from the query, or if the query hasn't taken place yet because the page has just finished loading, then don't do anything.
				if (self.tweets.length === 0) return;
				
				
				let db = firebase.database();
				let level = self.$store.state.currentLevel;
				let category = self.$store.state.currentCategory;
				
				// If we're still loading or injecting tweets, then don't do anything.
				if (!self.finishedLoading) return;
				
				// Okay. Now, we can start loading more tweets.
				self.finishedLoading = false;
				
				// Get only a subset of the total tweet list. Remember: the "tweet" list is really a list of user UIDs; hence the variable name here.
				let uids = self.tweets.slice(self.index, self.index + self.numberOfTweetsToLoadAtOnce);
				
				// Keep a count of how many tweets we've loaded. This is not necessarily the same as numberOfTweetsToLoadAtOnce, since fewer than the numberOfTweetsToLoadAtOnce may actually be left in the list.
				self.count = uids.length;
				
				// Bump the index up; i.e., move further into the list of tweets.
				self.index += self.numberOfTweetsToLoadAtOnce;
				
				// If there are no tweets left to load, then do nothing.
				if (self.count === 0){
					self.message = "";
					return;
				}
				
				uids.forEach(function(uid){
					// Check to see if this user is in the approvedUsers list.
					let ref2 = db.ref("/approvedUsers/" + uid);
					
					ref2.once("value").then(function(snapshot2){
						let hasBeenApproved = !!snapshot2.val();
						
						// If the user hasn't been approved, then we decrease the count. If the count is zero, then we're finished loading.
						if (!hasBeenApproved){
							self.count--;
							if (self.count <= 0) self.finishedLoading = true;
							self.message = "";
							return;
						}
						
						// If the user has been approved, then we'll get their data out of the database.
						let ref3 = db.ref("/allUsers/" + uid);
						
						ref3.once("value").then(function(snapshot3){
							let userData = snapshot3.val();
							
							// If there's not any user data, or if the user hasn't added a tweet URL yet, or if the user hasn't indicated a professional level, or if the current level doesn't match the user's level, or if the current category doesn't match the user's category, then decrease the count. If the count is zero, then we're finished loading.
							if (!userData || !userData.profileTweet || !userData.professionalLevel || (level !== "ALL" && level !== userData.professionalLevel) || (category !== "ALL" && !userData["categories"][category])){
								self.count--;
								if (self.count <= 0) self.finishedLoading = true;
								self.message = "";
								return;
							}
							
							// Otherwise, inject the tweet into the DOM.
							self.appendTweetToDOM(userData);
						});
					});
				});
			},
			
			appendTweetToDOM: function(userData){
				let self = this;
				
				// Create the wrapper element. This is necessary for the whole grid thing.
				let wrapper = document.createElement("div");
				wrapper.className += "tweet-wrapper";
				
				// Create a blockquote element of class "twitter-tweet". All parameters relevant to the Twitter Widgets API can be entered here as attributes using the "data-" prefix.
				let blockquote = document.createElement("blockquote");
				blockquote.className += "twitter-tweet";
				blockquote.setAttribute("data-dnt", true);
				blockquote.setAttribute("data-conversation", "none");
				
				// Create an anchor element with the tweet's url as its href.
				let a = document.createElement("a");
				a.href = userData.profileTweet;
				
				// Create the flag button. Notice that the opacity of the flag button is initially set to zero, since it otherwise shows up way earlier than the tweet itself and looks ugly.
				let flagButton = document.createElement("button");
				flagButton.className += "flaggy";
				flagButton.innerText = "⚑";
				flagButton.style.opacity = 0;
				
				// When the flag button is clicked...
				flagButton.onclick = function(){
					// If the user is not logged in, then do nothing.
					if (!self.$store.state.currentUser){
						alert("You must be logged in to report tweets. Please log in and then try again.");
						return;
					}
					
					// If the user doesn't confirm the flagging, then do nothing.
					let shouldFlag = confirm("Tweet flagging should be reserved for inappropriate or irrelevant tweets. Once a tweet has been flagged, we will review it for appropriateness and relevance. Would you like to report this tweet as inappropriate or irrelevant?");
					
					if (!shouldFlag) return;
					let userUid = self.$store.state.currentUser.uid;
					
					// Get the flagged user's username out of the database.
					db.ref("/allUsers/" + userUid + "/username").once("value").then(function(snapshot){
						let username = snapshot.val();
						if (!username) return;
						
						// Check to see if the flagging user is in the blocked users list.
						db.ref("/blockedUsers/" + username).once("value").then(function(snapshot){
							// If the flagging user is blocked, then do nothing.
							let isBlocked = !!snapshot.val();
							if (isBlocked) return;
							
							// Otherwise, set the UID of the flagged tweet's user as the key and the UID of the flagging user as the value.
							db.ref("/flaggedUsers/" + uid).set(userUid);
						});
					});
				};
				
				// Create a script element with the Twitter widgets JS file as its source.
				let script = document.createElement("script");
				script.src = "https://platform.twitter.com/widgets.js";
				
				// When the script has finished loading, decrease the count. If the count is zero, then we're finished loading.
				script.onload = function(){
					self.count--;
					if (self.count <= 0) self.finishedLoading = true;
					self.message = "";
					
					// Fade the flag button in.
					setTimeout(function(){
						let o = 0;
						let t = setInterval(function(){
							o += 1/60;
							flagButton.style.opacity = o;
							
							if (o >= 1){
								flagButton.style.opacity = 1;
								clearInterval(t);
							}
						}, 1000/60);
					}, 2000);
				};
				
				// Put the anchor element inside the blockquote element.
				try {
					blockquote.appendChild(a);
					
					// Put the blockquote and the script inside the tweetContainer element, which is referenced up in the HTML.
					wrapper.appendChild(blockquote);
					wrapper.appendChild(flagButton);
					wrapper.appendChild(script);
					
					// Push the wrapper into the DOM.
					self.$refs.tweetContainer.appendChild(wrapper);
					
					// Add the wrapper to the list of DOM elements that we'll later remove (when category or level is changed).
					self.domElements.push(wrapper);
				} catch (error){}
			},
			
			// This is connected to the "back to top" link at the bottom of the page.
			scrollToTop: function(){
				window.scrollTo(0, 0);
			},
		},
		
		// When the component has been mounted to the app...
		mounted: function(){
			let self = this;
			
			// Fetch the tweets from the current category.
			self.fetchTweetsFromCategory();
			
			// Add a scroll listener to the page. If the user has scrolled past 80% of the page height, then start loading more tweets. In other words, this is the "lazy-loading" stuff.
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