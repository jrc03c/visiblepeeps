let Vue = require("vue/dist/vue");
let VueRouter = require("vue-router");
let Vuex = require("vuex");
Vue.use(VueRouter);
Vue.use(Vuex);

let firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");

window.onload = function(){
	// Initialize the Firebase app.
	firebase.initializeApp({
		apiKey: "AIzaSyDahkALUP2HDnuLqiXOt-ScOPobhqFoW84",
		authDomain: "visiblewomen-net.firebaseapp.com",
		databaseURL: "https://visiblewomen-net.firebaseio.com",
		projectId: "visiblewomen-net",
		storageBucket: "visiblewomen-net.appspot.com",
		messagingSenderId: "532732660193"
	});
	
	// Listen for auth state changes and for whether the currently-logged-in user is an admin.
	let adminRef;
	
	firebase.auth().onAuthStateChanged(function(user){
		store.state.currentUser = user;
		
		if (adminRef) adminRef.off();
		
		if (user){
			let db = firebase.database();
			adminRef = db.ref("/adminUsers/" + user.uid);
			
			adminRef.on("value", function(snapshot){
				store.state.isAdmin = !!snapshot.val();
			});
		} else {
			store.state.isAdmin = false;
		}
	});
	
	// Set up the routes.
	let routes = [
		{path: "/", component: require("./components/index.vue")},
		{path: "/about", component: require("./components/about.vue")},
		{path: "/submit", component: require("./components/submit.vue")},
		{path: "/manage", component: require("./components/manage.vue"), children: [
			{path: "users", component: require("./components/manage-users.vue")},
			{path: "categories", component: require("./components/manage-categories.vue")},
		]},
	];
	
	let router = new VueRouter({routes});
	
	// After moving to each new view, scroll back to the top of the page.
	router.afterEach(function(to, from){
		window.scrollTo(0, 0);
	});
	
	// Create the store.
	let store = new Vuex.Store({
		state: {
			categories: [],
			currentLevel: "ALL",
			currentCategory: "ALL",
			currentUser: null,
			isAdmin: false,
			newUserCount: 0,
		},
		getters: {},
		mutations: {},
		actions: {
			// This is the typical Firebase / Twitter auth flow.
			login: function(){
				let provider = new firebase.auth.TwitterAuthProvider();
				
				firebase.auth().signInWithPopup(provider).then(function(result){
					let db = firebase.database();
					
					// We make sure that we grab the user's Twitter username. For some stupid reason, this is the only time that this information is available to us.
					let username = result.additionalUserInfo.username.toLowerCase();
					
					// We store the username in the database under their Firebase auth UID.
					db.ref("/allUsers/" + result.user.uid + "/username").set(username);
					db.ref("/allUsers/" + result.user.uid + "/uid").set(result.user.uid);
					
					// Check to see if the user is in the approved users list. If they're not, then add them to the new users list. NOTE: This will mean that blocked users can log out, log back in, and be added to the new users list!
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
			
			logout: function(){
				firebase.auth().signOut();
			},
			
			deleteAccount: function(){
				// Check to see that the user really wants to delete their account.
				let shouldDeleteAccount = confirm("Are you sure that you want to remove your tweet from this site?");
				
				// If they don't, then do nothing.
				if (!shouldDeleteAccount) return;
				
				// Remove the user from as many locations in the database as a non-admin user has access to.
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
	
	// Create the Firebase app.
	let app = new Vue({
		el: "#app",
		router,
		store,
		
		mounted: function(){
			let self = this;
			let db = firebase.database();
			
			let categoryListRef = db.ref("/categoryList");
			
			categoryListRef.on("value", function(snapshot){
				store.state.categories = [];
				let categories = snapshot.val();
				if (!categories) return;
				store.state.categories = Object.keys(categories);
			});
			
			let newUsersRef = db.ref("/newUsers");
			
			newUsersRef.on("value", function(snapshot){
				store.state.newUsersCount = 0;
				let newUsers = snapshot.val();
				if (!newUsers) return;
				store.state.newUsersCount = Object.keys(newUsers).length;
			});
		},
	});
	
	document.getElementById("app").style.display = "block";
};