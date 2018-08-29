<template>
	<div>
		<h2>Categories</h2>
		
		<form @submit.prevent="addNewCategory(categoryToAdd)">
			<input type="text" v-model="categoryToAdd">
			<input type="submit" value="Add">
		</form>
		
		<ul v-if="Object.keys(categories).length > 0" class="manage-text">
			<li v-for="category in Object.keys(categories)">
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
	let refs = [];

	module.exports = Vue.component("manage-users", {
		data: function(){
			return {
				categoryToAdd: "",
				categories: {},
			};
		},
		
		watch: {
			"$store.state.currentUser": function(){
				let self = this;
				self.onAuthStateChanged();
			},
		},
		
		methods: {
			addNewCategory: function(category){
				let self = this;
				self.categories[category] = true;
				let db = firebase.database();
				db.ref("/categoryList").set(self.categories);
				self.categoryToAdd = "";
			},
			
			removeCategory: function(category){
				let self = this;
				self.categories[category] = null;
				let db = firebase.database();
				db.ref("/categoryList").set(self.categories);
				db.ref("/tweets/" + category).set(null);
			},
			
			onAuthStateChanged: function(){
				let self = this;
				let user = self.$store.state.currentUser;
				
				// Set the isLoggedIn variable.
				self.isLoggedIn = !!user;
				
				// If the references are still listening, then 
				// turn them off.
				refs.forEach(function(ref){
					ref.off();
				});
				
				refs = [];
				
				// If the user is logged in, then...
				if (user){
					let db = firebase.database();
					
					let ref6 = db.ref("/categoryList");
					refs.push(ref6);
					
					ref6.on("value", function(snapshot){
						self.categories = {};
						let categories = snapshot.val();
						if (!categories) return;
						self.categories = categories;
					});
				}
			},
		},
		
		mounted: function(){
			let self = this;
			self.onAuthStateChanged();
		},
		
		beforeDestroy: function(){
			refs.forEach(function(ref){
				ref.off();
			});
			
			refs = [];
		},
	});
</script>