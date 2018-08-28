<template>
	<div>
		<button class="mobile-nav">&#x2630;</button>
		
		<div id="side-menu">
			<ul class="category">
				<span v-if="$router.currentRoute.path === '/manage'">
					<li class="li-heading">MANAGE</li>
					
					<li>
						<a @click="$emit('manage', 'adminUsers')" class="fake-a">
							Admin Users
						</a>
					</li>
					
					<li>
						<a @click="$emit('manage', 'flaggedUsers')" class="fake-a">
							Flagged Users
						</a>
					</li>
					
					<li>
						<a @click="$emit('manage', 'blockedUsers')" class="fake-a">
							Blocked Users
						</a>
					</li>
					
					<li>
						<a @click="$emit('manage', 'categories')" class="fake-a">
							Categories
						</a>
					</li>
					
				</span>
				
				<br><br>
				
				<li class="li-heading">ACCOUNT</li>
				<li>Login/out</li>
				<li><router-link to="/profile" class="fake-a">Profile</router-link></li>
			
				<br><br>

				<li class="li-fat">SHOW ALL</li>
				
				<br><br>

				<li class="li-heading">FILTER BY LEVEL</li>
				
<!-- 				<li>
					<a @click="setCurrentLevel('ALL')" class="fake-a">
						All Levels
					</a>
				</li> -->
				
				<li v-for="level in levels">
					<a @click="setCurrentLevel(level)" class="fake-a">
						{{ level }}
					</a>
				</li>
				
				<br><br>
				
				<li class="li-heading">FILTER BY PROFESSION</li>
				
<!-- 				<li>
					<a @click="$store.state.currentCategory = 'ALL'" class="fake-a">
						All Artists
					</a>
				</li> -->
				
				<li v-for="category in $store.state.categories">
					<a @click="$store.state.currentCategory = category" class="fake-a">
						{{ category }}
					</a>
				</li>
				
				<br><br>
				
<!-- 				<li class="li-heading">OTHER</li> -->
				
				<li class="li-fat"><router-link to="/about" class="fake-a">About</router-link></li>
			</ul>
		</div>
	</div>
</template>

<script>
	let Vue = require("vue/dist/vue");
	let $ = require("jquery");
	
	module.exports = Vue.component("side-menu", {
		data: function(){
			return {
				levels: ["Professional Creative", "Student", "Hobbyist"],
			};
		},
		
		methods: {
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
		},
		
		mounted: function(){
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