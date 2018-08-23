<template>
	<div>
		This is the landing.
		
		<router-link to="/submit">Submit</router-link>
	</div>
</template>

<script>
	let Vue = require("vue/dist/vue");
	module.exports = Vue.component("vp-landing", {});
</script>