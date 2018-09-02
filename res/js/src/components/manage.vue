<template>
	<div>
		<side-menu></side-menu>
		
		<div id="manage-content">
			<div v-if="$store.state.currentUser && $store.state.isAdmin">
				<router-view></router-view>
			</div>
			
			<div v-else>
				<h2>Log in</h2>
				
				<p>You are not logged in. Please log in to manage stuff.</p>
			</div>
		</div>
	</div>
</template>

<script>
	let Vue = require("vue/dist/vue");
	let firebase = require("firebase/app");	
	module.exports = Vue.component("manage", {});
</script>