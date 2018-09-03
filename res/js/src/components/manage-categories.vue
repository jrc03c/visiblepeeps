<template>
	<div>
		<h2>Categories</h2>
		
		<form @submit.prevent="addNewCategory(categoryToAdd)">
			<input type="text" v-model="categoryToAdd">
			<input type="submit" value="Add">
		</form>
		
		<ul v-if="$store.state.categories.length > 0" class="manage-text">
			<li v-for="category in $store.state.categories">
				<button style="margin:0 2em 0 0" @click="removeCategory(category)">Delete</button>
				
				<button style="margin:0 2em 0 0" @click="renameCategory(category)">Rename</button>

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
			
			renameCategory: function(category){
				let self = this;
				let db = firebase.database();
				
				let newName = prompt("Category '" + category + "' should be renamed to what?");
				if (!newName || newName.length === 0) return;
				
				if (newName.toLowerCase() === "all"){
					alert("This is a reserved category name, so you can't use it. Sorry! Try a different name, please.");
					return;
				}
				
				// Rename category in category list.
				db.ref("/categoryList/" + category).set(null);
				db.ref("/categoryList/" + newName).set(true);
				
				// Rename category in tweet list.
				db.ref("/tweets/" + category).once("value").then(function(snapshot){
					let tweets = snapshot.val();
					if (!tweets) return;
					
					Object.keys(tweets).forEach(function(uid){
						db.ref("/tweets/" + category + "/" + uid).set(null);
						db.ref("/tweets/" + newName + "/" + uid).set(true);
					});
				});
				
				// Rename category for all artists.
				db.ref("/allUsers").orderByChild("categories/" + category).equalTo(true).once("value").then(function(snapshot){
					let users = snapshot.val();
					if (!users) return;
				
					Object.keys(users).forEach(function(uid){
						db.ref("/allUsers/" + uid + "/categories/" + category).set(null);
						db.ref("/allUsers/" + uid + "/categories/" + newName).set(true);
					});
				});
			},
		},
	});
</script>