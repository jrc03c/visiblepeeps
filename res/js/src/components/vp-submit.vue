<template>
	<div>
		<form v-if="$store.state.currentUserName" @submit.prevent="submit">
			<input type="text" v-model="url">
		</form>
		
		<div v-else>
			You're not logged in. Only logged-in users can submit tweets for approval!
		</div>
	</div>
</template>

<script>
	let Vue = require("vue/dist/vue");
	
	module.exports = Vue.component("vp-submit", {
		data: function(){
			return {
				url: "",
			};
		},
		
		methods: {
			submit: function(){
				let self = this;
				console.log(self.url);
			},
		},
	});
</script>