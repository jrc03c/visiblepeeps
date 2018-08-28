<template>
	<div id="side-menu">
		<ul class="category">
			<li><a style="color:rgb(29,161,242);  font-weight:500;" href="">LOGIN/OUT</a></li>
			<li style="	font-weight:500;"><a href="/profile">PROFILE</a></li>
			
			<br><br>	
			
			<li><a style="font-weight:500;" href="">SHOW ALL</a></li>
			
			<br><br>
			
			<li style="color:rgb(29,161,242); font-weight:500;">FILTER BY LEVEL</li>	
			
			<li style="	font-weight:500;">
				<a @click="$store.state.currentLevel = 'ALL'" class="fake-a">
					All Levels
				</a>
			</li>
			<li style="	font-weight:500;">
				<a @click="$store.state.currentLevel = 'Professional Creative'" class="fake-a">
					Professional Creatives
				</a>
			</li>	
			<li style="	font-weight:500;">
				<a @click="$store.state.currentLevel = 'Student'" class="fake-a">
					Students
				</a>
			</li>	
			<li style="	font-weight:500;">
				<a @click="$store.state.currentLevel = 'Hobbyist'" class="fake-a">
					Hobbyists
				</a>
			</li>
			
			<br><br>
			
			<li style="font-weight:500;">FILTER BY PROFESSION</li>
			<li>
				<a @click="$store.state.currentCategory = 'ALL'" class="fake-a">
					All Artists
				</a>
			</li>
			<li v-for="category in $store.state.categories">
				<a @click="$store.state.currentCategory = category" class="fake-a">
					{{ category }}
				</a>
			</li>
			
			<br><br>
			
			<li style="	font-weight:500;"><a href="/about">ABOUT</a></li>
			
		</ul>
		
	</div>
</template>

<script>
	let Vue = require("vue/dist/vue");
	
	module.exports = Vue.component("side-menu", {});
</script>