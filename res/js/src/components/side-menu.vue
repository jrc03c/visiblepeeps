<template>
	<div>
		<button class="mobile-nav">&#x2630;</button>
		
		<div id="side-menu">
			<ul class="category">

								
				<li class="li-heading">ACCOUNT</li>
				<li><a style="font-weight:500;" class="fake-a" @click="logInOrOut">Login/out</a></li>
				<li style="font-weight:500;" v-if="$store.state.currentUser"><router-link to="/profile" class="fake-a">Profile</router-link></li>
				<span v-if="isAdmin">
		
					<li>
						<a @click="manage('adminUsers')" class="fake-a">
							Admin Users
						</a>
					</li>
					
					<li>
						<a @click="manage('flaggedUsers')" class="fake-a">
							Flagged Users
						</a>
					</li>
					
					<li>
						<a @click="manage('blockedUsers')" class="fake-a">
							Blocked Users
						</a>
					</li>
					
					<li>
						<a @click="manage('categories')" class="fake-a">
							Categories
						</a>
					</li>
					
				</span>	


				<br><br>

				<li class="li-fat">SHOW ALL</li>
				
				<br><br>

				<li class="li-heading">FILTER BY LEVEL</li>
				
				<li style="font-weight:500;" v-for="level in levels">
					<a @click="setCurrentLevel(level)" class="fake-a">
						{{ level }}
					</a>
				</li>
				
				<br><br>
				
				<li class="li-heading">FILTER BY PROFESSION</li>
				
				<li v-for="category in $store.state.categories">
					<a @click="$store.state.currentCategory = category" class="fake-a">
						{{ category }}
					</a>
				</li>
				
				<br><br>
								
				<li class="li-fat"><router-link to="/about" class="fake-a">About</router-link></li>
			</ul>
		</div>
	</div>
</template>

<script>
	let Vue = require("vue/dist/vue");
	let firebase = require("firebase/app");
	let $ = require("jquery");
	
	module.exports = Vue.component("side-menu", {
		data: function(){
			return {
				levels: ["Professional Creative", "Student", "Hobbyist"],
				isAdmin: false,
			};
		},
		
		methods: {
			logInOrOut: function(){
				let self = this;
				if (self.$store.state.currentUser) self.logout();
				else self.login();
			},
			
			// This is the typical Firebase / Twitter auth flow.
			login: function(){
				let provider = new firebase.auth.TwitterAuthProvider();
				
				firebase.auth().signInWithPopup(provider).then(function(result){
					let db = firebase.database();
					
					// We make sure that we grab the user's Twitter username.
					// For some stupid reason, this is the only time that
					// this information is available to us.
					let username = result.additionalUserInfo.username;
					
					// We store the username in the database under their 
					// Firebase auth UID.
					let ref = db.ref("/allUsers/" + result.user.uid + "/username");
					ref.set(username);
				}).catch(function(error){
					console.error(error);
				});
			},
			
			// This the typical Firebase sign-out method, though
			// this is where we also stop listening to the database
			// references.
			logout: function(){
				firebase.auth().signOut();
			},
			
			setCurrentLevel: function(level){
				let self = this;
				self.$store.state.currentLevel = level;
				self.$router.push("/");
			},
			
			setCurrentCategory: function(category){
				let self = this;
				self.$store.state.currentCategory = category;
				self.$router.push("/");
			},
			
			manage: function(page){
				let self = this;
				self.$router.push("/manage");
				self.$store.state.currentManagementView = page;
			}
		},
		
		mounted: function(){
			let self = this;
			let oldWidth = 0;

			function toggleMenu(e){
				e.preventDefault();
				$("#side-menu").slideToggle("fast");
				return false;
			}
			
			function setCSSRules(event){
				let newWidth = $(window).width();
				
				if (newWidth === oldWidth) return;
				
				if (newWidth > 1050) {
					$('.mobile-nav').css('display','none');
					$('#side-menu').show();
				}
				
				else {
					$('.mobile-nav').css('display','block');
					$('#side-menu').hide();
					$("#side-menu").click(toggleMenu);
				}
				
				oldWidth = newWidth;
			}
			
			$(window).ready(setCSSRules);
			$(window).resize(setCSSRules);
			$(".mobile-nav").click(toggleMenu);
						
			firebase.auth().onAuthStateChanged(function(user){
				self.$store.state.currentUser = user;
				
				if (user){
					let db = firebase.database();
					let ref1 = db.ref("/allUsers/" + user.uid);
					
					ref1.on("value", function(snapshot1){
						let userData = snapshot1.val();
						if (!userData) return;
						
						let ref2 = db.ref("/adminUsers/" + userData.username);
						
						ref2.on("value", function(snapshot2){
							let isAdmin = snapshot2.val();
							self.isAdmin = !!isAdmin;
						});
					});
				} else {
					self.isAdmin = false;
				}
			});
		},
	});
</script>
