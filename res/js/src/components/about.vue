<template>
	<div>
		<div id="attention">HI FRIEND! We JUST launched the site! If you experience any issues or have any feedback, please feel free to contact either <a href="https://twitter.com/jrc03c">jrc03c</a> or <a href="https://twitter.com/A_Werchmeister">A_Werchmeister</a> on Twitter!</div>

		<side-menu></side-menu>
		
		<div id="main-content">
			<main-header></main-header>
			
			<div class="about-page">
				
				<p>Visible Peeps is a site where women, non-binary, and trans creators of all skill levels can share their tweets from the popular hashtags #VisibleWomen and #VisibleNB on Twitter. Started by the folks at <a href="https://milkfed.us/">Milkfed Criminal Masterminds</a>, these hashtags are intended to raise the visiblity of women, non-binary, and trans creators. The goal of this site is to facilitate the purpose of the hashtag by creating a place where people can explore and discover new creators, their tweets, and their work.</p><br>

				<p>Visible Peeps was built by <a href="https://twitter.com/jrc03c">Josh Castle</a> and designed by <a href="https://twitter.com/A_Werchmeister">Andreas Werchmeister</a>, together with the gracious support and help of <a href="https://twitter.com/LetsWoolgather">Toby Brommerich</a>, <a href="https://twitter.com/kylemadkins">Kyle Adkins</a>, and <a href="https://twitter.com/tarakeet">Tara Han-Tran Johnson</a> (who created the beautiful title logo).</p>

				<h3>How to use the site</h3>

				<p>To submit a tweet, all you have to do is click the "Submit Tweet" link on the menu. Before submitting a tweet, we ask that you log in with your Twitter account. This helps us to prevent malicious misuse of the site and to verify that the submitted tweet belongs to you; but we do not store any personal data besides your username, and we can't access or control any part your Twitter account. Once you have logged in using your Twitter account, you'll be able to submit your tweet by simply copying and pasting the URL to your tweet into the submission form, selecting up to three categories you want your tweet to appear in, and hitting the "Save" button. That's it! :D</p><br>

				<p>We approve all submissions before they appear publicly on the home page. Like the login requirement, this process helps us to cut down on abuse of the site. You can return to the submission page at any time to update your tweet, to update any of the categories you have selected, or (if you wish) to delete your tweet along with any information stored in the database.</p>

				<h3>Site issues</h3>

				<p>If you experience any issues with the site or if you'd like to share your feedback, please feel free to contact either <a href="https://twitter.com/jrc03c">jrc03c</a> or <a href="https://twitter.com/A_Werchmeister">A_Werchmeister</a> on Twitter!</p>

				<h3>Report inappropriate or irrelevant tweets</h3>

				<p>If you see a tweet that either is offensive or doesn't belong, please flag the tweet for review by clicking the red flag button in the bottom right corner of the tweet in question.</p>

				<h3>Legal</h3>

				<p>Copyright: We don't own any of the content contained within the tweets featured on the site. All tweets and their included content have been submitted by their respective owners.</p><br>
					
				<p>Personal Data: We don't store any personal data except your Twitter username, the categories you select for your tweet to be featured in, and the URL of your submitted tweet. You can delete these pieces of information at any point from the submission page.</p>

			</div>
		</div>
	</div>
</template>

<script>
	let Vue = require("vue/dist/vue");
	module.exports = Vue.component("about", {});
</script>