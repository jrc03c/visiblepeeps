let Vue = require("vue/dist/vue");
let VueRouter = require("vue-router");
let Vuex = require("vuex");
Vue.use(VueRouter);
Vue.use(Vuex);

let firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");
window.firebase = firebase;

window.onload = function(){
	firebase.initializeApp({
		apiKey: "AIzaSyDahkALUP2HDnuLqiXOt-ScOPobhqFoW84",
		authDomain: "visiblewomen-net.firebaseapp.com",
		databaseURL: "https://visiblewomen-net.firebaseio.com",
		projectId: "visiblewomen-net",
		storageBucket: "visiblewomen-net.appspot.com",
		messagingSenderId: "532732660193"
	});
	
	firebase.auth().onAuthStateChanged(function(user){
		store.state.currentUser = user;
	});
	
	let routes = [
		{path: "/", component: require("./components/index.vue")},
		{path: "/about", component: require("./components/about.vue")},
		{path: "/profile", component: require("./components/profile.vue")},
		{path: "/manage", component: require("./components/manage.vue"), children: [
			{path: "users", component: require("./components/manage-users.vue")},
			{path: "categories", component: require("./components/manage-categories.vue")},
		]},
	];
	
	let router = new VueRouter({routes});
	
	router.afterEach(function(to, from){
		window.scrollTo(0, 0);
	});
	
	let store = new Vuex.Store({
		state: {
			categories: [],
			currentLevel: "ALL",
			currentCategory: "ALL",
			currentUser: null,
		},
		getters: {},
		mutations: {},
		actions: {
			// This is the typical Firebase / Twitter auth flow.
			login: function(){
				let provider = new firebase.auth.TwitterAuthProvider();
				
				firebase.auth().signInWithPopup(provider).then(function(result){
					let db = firebase.database();
					
					// We make sure that we grab the user's Twitter username.
					// For some stupid reason, this is the only time that
					// this information is available to us.
					let username = result.additionalUserInfo.username;
					
					// We store the username in the database under their 
					// Firebase auth UID.
					db.ref("/allUsers/" + result.user.uid + "/username").set(username);
					db.ref("/allUsers/" + result.user.uid + "/uid").set(result.user.uid);
					
					let ref2 = db.ref("/approvedUsers/" + result.user.uid);
					
					ref2.once("value").then(function(snapshot){
						let hasBeenApproved = !!snapshot.val();
						
						if (!hasBeenApproved){
							let ref3 = db.ref("/newUsers/" + result.user.uid);
							ref3.set(true).then(function(){}).catch(function(error){});
						}
					});
				}).catch(function(error){
					console.error(error);
				});
			},
			
			// This the typical Firebase sign-out method, though
			// this is where we also stop listening to the database
			// references.
			logout: function(){
				firebase.auth().signOut();
			},
			
			deleteAccount: function(){
				let shouldDeleteAccount = confirm("Are you sure that you want to remove your tweet from this site?");
				
				if (!shouldDeleteAccount) return;
				
				let self = this;
				let db = firebase.database();
				let user = firebase.auth().currentUser;
				let categories = store.state.categories;
				let updates = {};
				
				updates["/allUsers/" + user.uid] = null;
				
				categories.forEach(function(category){
					updates["/tweets/" + category + "/" + user.uid] = null;
				});
				
				updates["/tweets/ALL/" + user.uid] = null;
				updates["/newUsers/" + user.uid] = null;
				
				db.ref().update(updates).then(function(){
					user.delete();
				}).catch(function(error){
					console.error(error);
				});
			},
		},
	});
	
	let app = new Vue({
		el: "#app",
		router,
		store,
		
		mounted: function(){
			let self = this;
			let db = firebase.database();
			
			let categoryListRef = db.ref("/categoryList");
			
			categoryListRef.on("value", function(snapshot){
				let categories = snapshot.val();
				if (!categories) return;
				store.state.categories = Object.keys(categories);
			});
		},
	});
	
	document.getElementById("app").style.display = "block";
};