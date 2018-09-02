<template>
	<div>
		<h2>Categories</h2>
		
		<form @submit.prevent="addNewCategory(categoryToAdd)">
			<input type="text" v-model="categoryToAdd">
			<input type="submit" value="Add">
		</form>
		
		<ul v-if="$store.state.categories.length > 0" class="manage-text">
			<li v-for="category in $store.state.categories">
				<button  style="margin:0 2em 0 0" @click="removeCategory(category)">Delete</button>

				{{ category }}
			</li>
		</ul>
		
		<div v-else style="padding:1em 0 0; font-size:13px;">
			There are currently no categories.
		</div>
	</div>
</template>

<script>
	let Vue = require("vue/dist/vue");
	let firebase = require("firebase/app");

	module.exports = Vue.component("manage-users", {
		data: function(){
			return {
				categoryToAdd: "",
			};
		},
		
		methods: {
			addNewCategory: function(category){
				let self = this;
				let db = firebase.database();
				db.ref("/categoryList/" + self.categoryToAdd).set(true);
				self.categoryToAdd = "";
			},
			
			removeCategory: function(category){
				let self = this;
				let db = firebase.database();
				db.ref("/categoryList/" + category).set(null);
			},
		},
	});
</script>