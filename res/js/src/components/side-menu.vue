<template>
	<div>
		<button class="mobile-nav">&#x2630;</button>
		
		<div id="side-menu">
			<ul class="category">

								
				<!-- <li class="li-heading">ACCOUNT</li> -->
				
				<li v-if="$store.state.currentUser"><router-link to="/profile" class="fake-a li-heading">Submit Tweet</router-link></li>
				<li><a class="fake-a li-fat" @click="logInOrOut">{{ $store.state.currentUser ? "Log out" : "Log in" }}</a></li>
				
				<span v-if="isAdmin">

					<li><router-link to="/" class="fake-a">Home</router-link></li>
		
					<li>
						<router-link to="/manage/users" class="fake-a">
							Users
						</router-link>
					</li>
					
					<li>
						<router-link to="/manage/categories" class="fake-a">
							Categories
						</router-link>
					</li>
					
				</span>	


				<br><br>

				<li class="li-fat"><a href="">SHOW ALL</a></li> <!-- Needs wiring -->
				
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
					<a @click="setCurrentCategory(category)" class="fake-a">
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
				levels: ["Professional Creatives", "Students", "Hobbyists"],
				isAdmin: false,
			};
		},
		
		watch: {
			"$store.state.currentUser": function(){
				let self = this;
				self.onAuthStateChanged();
			},
		},
		
		methods: {
			logInOrOut: function(){
				let self = this;
				if (self.$store.state.currentUser) self.$store.dispatch("logout");
				else self.$store.dispatch("login");
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
			
			onAuthStateChanged: function(){
				let self = this;
				let user = self.$store.state.currentUser;
				
				if (user){
					let db = firebase.database();
					let ref1 = db.ref("/allUsers/" + user.uid);
					
					ref1.on("value", function(snapshot1){
						let userData = snapshot1.val();
						if (!userData) return;
						
						let ref2 = db.ref("/adminUsers/" + user.uid);
						
						ref2.on("value", function(snapshot2){
							let isAdmin = snapshot2.val();
							self.isAdmin = !!isAdmin;
						});
					});
				} else {
					self.isAdmin = false;
				}
			},
		},
		
		mounted: function(){
			let self = this;
			self.onAuthStateChanged();
			
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
		},
	});
</script>
