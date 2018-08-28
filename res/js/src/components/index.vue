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
		
	});
</script>