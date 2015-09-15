/*
* Game.Scene.Gorge: controls throwing characters into the gorge or walking them across the bridge.
* To keep things simple, we treat the characters as set pieces that get moved about.
*/

Game.Scene.new(Game.Scene.Basic, "Gorge", { 

	leaveListenForPlayer: function (evt, info) {
		var round = info.round;
		var game = round.game;
		var answer = info.args[0];
		var score = info.args[1];
		var subject = $("li.knight, li.king").first();
		
		switch (score) {
			case 0: // a wrong answer.
				throwTheSubjectIntoTheGorge(info, subject, round, game);
				// wait before transitioning out of this state.
				info.continue = false;
				break;
		}
	},
				
	leaveListenForPlayer: function (evt, info) {
		var round = info.round;
		var game = round.game;
		var responder = round.responder;
		var answer = info.args[0];
		var score = info.args[1];
		var subject = $("li.knight, li.king").first();
		var old_man = $("li.old_man");
		var _this = this;
    
		switch (score) {
			case 1:  // a correct answer.
				if (responder.cards.length) {
					// if there is a response, make it clickable and clear other cards.
					Game.clearCards("li.answers");
					Game.clearCards("li.old_man", ".prompt");

					// make the old man's answer feedback voice balloon clickable,
					// and use the click to send either a subject or him into the gorge.
      		var old_man_response_bubble = $("li.old_man .card.responder");
          console.log(old_man_response_bubble)
					old_man_response_bubble.find("button")
					.click(function () {
            debugger;
						if (subject.hasClass("king")) {
							Game.clearCards("li.old_man", ".responder");
							throwTheOldManIntoTheGorge(old_man, round, game);
						} else {
							letTheSubjectWalkAcrossTheBridge(subject, round);
						}
					});
					info.continue = false;
				}
				break;
		}
	},

	enterGivePrompt: function (evt, info) {
		if ($("li.knight, li.king").length == 0) {
			round.cancelTransition();
			game.nextTick().then(function () {
				Game.clearCards("li.old_man", ".prompt");
				Game.clearCards("li.answers");
				game.end();
			});
		}
	}
});




/***
 *** Animation utility functions.*** 
 ***/

function throwTheSubjectIntoTheGorge (info, subject, round, game) {
	// hold up advancing to the next round while we wait for this animation to complete.
	// we do this by adding a promise to the Responder, because all of the Responder's promises
	// have to be resolved before it will advance to the next round.
	this.dfd = $.Deferred();
	var _this = this;
	round.responder.addPromise(this.dfd.promise());

	subject
	// *** START ANIM.*** hoist him up,
	.animate({ "top": -300 }, { duration: 1000, easing: "swing",
		done: function subjectIsUp () {
			// drop him down,
			subject.addClass("falling")
			.animate({ "left": 300 }, { duration: 1000, queue: false }, "swing")
			.animate({ "opacity": 0 }, { duration: 1000, queue: false })
			.animate({ "top": 300 }, { duration: 1000, easing: "swing",
				done: function subjectIsGone () {
					// abort this round, and advance to the next one.
					subject.remove();
					_this.dfd.resolve();
					round.cancelTransition();
					// we pass next desired round through abort() to the game.
					round.abort(game.spec.Rounds[0], Game.clearCards);
				} // end subjectIsGone.
			});
		} // end subjectIsUp.
	});
}


function throwTheOldManIntoTheGorge (old_man, round, game) {
	old_man
	// *** START ANIM.*** hoist him up,
	.animate({ "top": -300 }, { duration: 1000, easing: "swing",
		done: function oldManIsUp() {
			// drop him down,
			var old_man = $("li.old_man");
			old_man.addClass("falling")
			.animate({ "left": 300 }, { duration: 1000, queue: false }, "swing")
			.animate({ "opacity": 0 }, { duration: 1000, queue: false })
			.animate({ "top": 300 }, { duration: 1000, easing: "swing",
				done: function oldManIsGone() {
					// end the game.
					old_man.remove();
					round.cancelTransition();
					// after one clock tick (to allow any cleanup), end the game.
					game.nextTick().then(function endTheGame() {
						Game.clearCards("li.old_man", ".prompt");
						Game.clearCards("li.answers");
						game.end();
					});
				} // end oldManIsGone.
			});
		} // end oldManIsUp.
	});
}


function letTheSubjectWalkAcrossTheBridge(subject, round) {
  debugger;
	subject.addClass("walker")
	// *** START ANIM.*** walk him to the middle of the bridge,
	.animate({ "left": 2 }, { duration: 2000, queue: false }, "swing")
	.animate({ "opacity": 0 }, { duration: 2000, queue: false })
	.animate({ "top": 32 }, { duration: 1000, easing: "swing",
		// walk him to the other side.
		done: function subjectIsInTheMiddleOfTheBridge() {
			subject.animate({ "top": -6 }, { duration: 1000, easing: "swing",
				// move on.
				done: function subjectIsGone() {
					subject.remove();
					round.transition();
				} // end subjectIsGone.
			});
		} // end subjectIsInTheMiddleOfTheBridge.
	});
}