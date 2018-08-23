<template>
	<div>
		<router-link to="/submit">Submit</router-link>
		
		<ul>
			<li v-for="tweet in $store.state.data.approvedTweets">
				<a :href="tweet">{{ tweet }}</a>
			</li>
		</ul>
	</div>
</template>

<script>
	let Vue = require("vue/dist/vue");
	
	module.exports = Vue.component("vp-landing", {
		
	});
</script>