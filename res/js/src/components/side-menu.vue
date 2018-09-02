<template>
	<div>
		<button class="mobile-nav">&#x2630;</button>
		
		<div id="side-menu">

			<ul class="category">				
				<li><router-link to="/submit" class="fake-a li-fat">Submit Tweet</router-link></li>
				<li v-if="$store.state.currentUser"><a style="font-weight:500;" class="fake-a li-fat" @click="$store.dispatch('logout')">Log out</a></li>
				
				<span v-if="$store.state.isAdmin">

					<li><a href="/" class="fake-a">Home</a></li>
		
					<li>
						<router-link to="/manage/users" class="fake-a">
							Users <span class="new-users" v-if="newUserCount > 0">({{ newUserCount }} new users)</span>
						</router-link>
					</li>
					
					<li>
						<router-link to="/manage/categories" class="fake-a">
							Categories
						</router-link>
					</li>
					
				</span>	


				<br><br>

				<li class="li-fat"><a class="fake-a" href="/">SHOW ALL</a></li>
				
				<br><br>

				<li class="li-heading">FILTER BY LEVEL</li>
				
				<li style="font-weight:500;" v-for="level in levels">
					<a @click="setCurrentLevel(level)" class="fake-a" :class="{'selected-menu-item': level === $store.state.currentLevel}">
						{{ level + "s" }}
						<!-- <span class="check-mark" v-if="level === $store.state.currentLevel">&#x2714;</span> -->
					</a>
				</li>
				
				<br><br>
				
				<li class="li-heading">FILTER BY PROFESSION</li>
				
				<li v-for="category in $store.state.categories">
					<a @click="setCurrentCategory(category)" class="fake-a" :class="{'selected-menu-item': category === $store.state.currentCategory}">
						{{ category }}
						<!-- <span class="check-mark" v-if="category === $store.state.currentCategory">&#x2714;</span> -->
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
				levels: ["Professional", "Student", "Hobbyist"],
				newUserCount: 0,
			};
		},
		
		watch: {
			"$store.state.isAdmin": function(){
				let self = this;
				let db = firebase.database();
				
				if (self.$store.state.isAdmin){
					db.ref("/newUsers").once("value").then(function(snapshot3){
						self.newUserCount = 0;
						let newUsers = snapshot3.val();
						if (!newUsers) return;
						self.newUserCount = Object.keys(newUsers).length;
					});
				}
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
				self.$router.push("/");
				
				if (self.$store.state.currentLevel === level){
					self.$store.state.currentLevel = "ALL";
				} else {
					self.$store.state.currentLevel = level;
				}
			},
			
			setCurrentCategory: function(category){
				let self = this;
				self.$router.push("/");
				
				if (self.$store.state.currentCategory === category){
					self.$store.state.currentCategory = "ALL";
				} else {
					self.$store.state.currentCategory = category;
				}
			},
		},
		
		mounted: function(){
			let self = this;
			
			let oldWidth = 0;
			
			function toggleMenu(e){
				// e.preventDefault();
				$("#side-menu").slideToggle("fast");
				// return false;
			}
			
			function setCSSRules(event){
				let newWidth = $(window).width();
			
				if (newWidth === oldWidth) return;
			
				if (newWidth > 1050) {
					$("#side-menu").off("click");
				} else {
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
