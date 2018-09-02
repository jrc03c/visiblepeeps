<template>
	<div>
		<h2>Categories</h2>
		
		<form @submit.prevent="addNewCategory(categoryToAdd)">
			<input type="text" v-model="categoryToAdd">
			<input type="submit" value="Add">
		</form>
		
		<ul v-if="categories.length > 0" class="manage-text">
			<li v-for="category in categories">
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
	
	// Keep track of this database-listening reference so that we can turn it off when we destroy the component.
	let categoryListRef;

	module.exports = Vue.component("manage-users", {
		data: function(){
			return {
				categoryToAdd: "",
				categories: [],
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
		
		mounted: function(){
			let self = this;
			let db = firebase.database();
			
			// Get the list of categories from the database.
			let categoryListRef = db.ref("/categoryList");
			
			categoryListRef.on("value", function(snapshot){
				self.categories = [];
				let categories = snapshot.val();
				if (!categories) return;
				self.categories = Object.keys(categories);
			});
		},
		
		beforeDestroy: function(){
			categoryListRef.off();
		},
	});
</script>