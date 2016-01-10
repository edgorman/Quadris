var app = {
    initialize: function() {this.bindEvents();},
    bindEvents: function() {document.addEventListener('deviceready', this.onDeviceReady, false);},
    onDeviceReady: function() {/*onDeviceReady();**/}
};

var database = {
	db: "",
	
	init: function() {
		this.db = window.openDatabase("Database", "1.0", "DB", 200000);
    	this.db.transaction(database.populate, database.error, database.success);
	},
	
	populate: function(tx) {
		//TODO APPROPRIATE LINES BELOW FOR ROLLOUT
		//tx.executeSql('DROP TABLE IF EXISTS info');
    	tx.executeSql('CREATE TABLE IF NOT EXISTS info (id unique, username, background, score, played, grid, nerd, content, currScore, currPiece, currPieceX, currPieceY, currPieceR, currNext, currLevel)');
    	tx.executeSql('SELECT * FROM info', [], database.checkExists, database.error);
	},
	
	reset: function(tx) {
		tx.executeSql('DROP TABLE IF EXISTS info');
		tx.executeSql('CREATE TABLE IF NOT EXISTS info (id unique, username, background, score, played, grid, nerd, content, currScore, currPiece, currPieceX, currPieceY, currPieceR, currNext, currLevel)');
		tx.executeSql('SELECT * FROM info', [], database.checkExists, database.error);
	},
	
	checkExists: function(tx, results) {
		if(results.rows.length == 0) {
			toggleNotificationState("default", "Thankyou for downloading the app! :)");
			tx.executeSql('INSERT INTO info (id, username, background, score, played, grid, nerd, content, currScore, currPiece, currPieceX, currPieceY, currPieceR, currNext, currLevel) VALUES (1, "User", "#222222", "0", "0", "0", "0", "", "0", "", "", "", "", "", "1")');
			Game.gameFirstTime = true;
		}
	},
	
	error: function(err) {
		//alert("Error processing SQL: "+err.message+". ("+err.code+")");
		//var conf = confirm("Reset stored data about '"+Game.user.username+"'? \n(may fix the sql error)");
		//if(conf) this.db.transaction(database.reset, database.error, database.success);
		alert("Database Error: "+err.code+".\nDatabase has been reset, please perform the action again.\nIf you are seeing this message again, please report what you are attempting and the message below: \n'"+err.message+"'");
		
		//TODO temporarily store variables
		var tvusername = Game.user.username,
			tvbgColor = Game.user.backgroundColor,
			tvhighscore = Game.user.highscore,
			tvgamesPlayed = Game.user.gamesPlayed,
			tvshowGrid = Game.user.showGrid,
			tvshowStats = Game.user.showStats,
			tvpieceType = Game.piece.type,
			tvpieceNext = Game.piece.next,
			tvpieceX = Game.piece.x,
			tvpieceY = Game.piece.y,
			tvpieceR = Game.piece.rotation,
			tvgameLevel = Game.gameLevel,
			tvgameScore = Game.gameScore,
			tvgameContent = Game.board.content;
		this.db.transaction(database.reset, database.error, database.success);
		
		Game.user.username = tvusername;
		Game.user.backgroundColor = tvbgColor;
		Game.user.highscore = tvhighscore;
		Game.user.gamesPlayed = tvgamesPlayed;
		Game.user.showGrid = tvshowGrid;
		Game.user.showStats = tvshowStats;
		Game.piece.type = tvpieceType;
		Game.piece.next = tvpieceNext;
		Game.piece.x = tvpieceX;
		Game.piece.y = tvpieceY;
		Game.piece.rotation = tvpieceR;
		Game.gameLevel = tvgameLevel;
		Game.gameScore = tvgameScore;
		Game.board.content = tvgameContent;
		this.db.transaction(updateUserContentData, database.error);
		this.db.transaction(updateUserPlayedData, database.error);
	},
	
	success: function() {
		this.db = window.openDatabase("Database", "1.0", "DB", 200000);
		this.db.transaction(getUserSettingsData, database.error);
	}
}

var Game = {
	run: "",
	state: false,
	ups: 30,
	upsCount: 0,
	fpsCount: 0,
	gameClock: "",
	statsClock: "",
	gameLevel: 1,
	gameScore: 0,
	gameFirstTime: false,
	
	board: {
		rows: 20,
		columns: 10,
		content: [0,0,0,0,0,0,0,0,0,0,
				  0,0,0,0,0,0,0,0,0,0,
				  0,0,0,0,0,0,0,0,0,0,
				  0,0,0,0,0,0,0,0,0,0,
				  0,0,0,0,0,0,0,0,0,0,
				  0,0,0,0,0,0,0,0,0,0,
				  0,0,0,0,0,0,0,0,0,0,
				  0,0,0,0,0,0,0,0,0,0,
				  0,0,0,0,0,0,0,0,0,0,
				  0,0,0,0,0,0,0,0,0,0,
				  0,0,0,0,0,0,0,0,0,0,
				  0,0,0,0,0,0,0,0,0,0,
				  0,0,0,0,0,0,0,0,0,0,
				  0,0,0,0,0,0,0,0,0,0,
				  0,0,0,0,0,0,0,0,0,0,
				  0,0,0,0,0,0,0,0,0,0,
				  0,0,0,0,0,0,0,0,0,0,
				  0,0,0,0,0,0,0,0,0,0,
				  0,0,0,0,0,0,0,0,0,0,
				  0,0,0,0,0,0,0,0,0,0],
		reference: ["rgba(0,0,0,0)",
					"#FF0700",	//red
					"#FF9C00",	//orange
					"#00CED7",	//blue
					"#19FA00",	//green
					"#DC00DC",	//pink
					"#0294DA",	//cyan
					"#EEEE36"], // yellow
		pieces: [[[0,0,0,0, 0,1,1,0, 0,1,1,0, 0,0,0,0], [0,0,0,0, 0,1,1,0, 0,1,1,0, 0,0,0,0], [0,0,0,0, 0,1,1,0, 0,1,1,0, 0,0,0,0], [0,0,0,0, 0,1,1,0, 0,1,1,0, 0,0,0,0]],	//square	1
				 [[0,1,0,0, 0,1,0,0, 0,1,1,0, 0,0,0,0], [0,0,0,0, 0,1,1,1, 0,1,0,0, 0,0,0,0], [0,0,0,0, 0,1,1,0, 0,0,1,0, 0,0,1,0], [0,0,0,0, 0,0,1,0, 1,1,1,0, 0,0,0,0]],	//L			2
				 [[0,0,1,0, 0,0,1,0, 0,1,1,0, 0,0,0,0], [0,0,0,0, 0,1,0,0, 0,1,1,1, 0,0,0,0], [0,0,0,0, 0,1,1,0, 0,1,0,0, 0,1,0,0], [0,0,0,0, 1,1,1,0, 0,0,1,0, 0,0,0,0]],	//other L	3
				 [[0,1,0,0, 0,1,0,0, 0,1,0,0, 0,1,0,0], [0,0,0,0, 1,1,1,1, 0,0,0,0, 0,0,0,0], [0,1,0,0, 0,1,0,0, 0,1,0,0, 0,1,0,0], [0,0,0,0, 1,1,1,1, 0,0,0,0, 0,0,0,0]],	//I			4
				 [[0,0,1,0, 0,1,1,0, 0,1,0,0, 0,0,0,0], [0,0,0,0, 1,1,0,0, 0,1,1,0, 0,0,0,0], [0,0,1,0, 0,1,1,0, 0,1,0,0, 0,0,0,0], [0,0,0,0, 1,1,0,0, 0,1,1,0, 0,0,0,0]],	//Z			5
				 [[0,1,0,0, 0,1,1,0, 0,0,1,0, 0,0,0,0], [0,0,0,0, 0,0,1,1, 0,1,1,0, 0,0,0,0], [0,1,0,0, 0,1,1,0, 0,0,1,0, 0,0,0,0], [0,0,0,0, 0,0,1,1, 0,1,1,0, 0,0,0,0]],	//S			6
				 [[0,0,1,0, 0,1,1,0, 0,0,1,0, 0,0,0,0], [0,0,1,0, 0,1,1,1, 0,0,0,0, 0,0,0,0], [0,0,1,0, 0,0,1,1, 0,0,1,0, 0,0,0,0], [0,0,0,0, 0,1,1,1, 0,0,1,0, 0,0,0,0]]],	//T			7
		//		each rotation, each side separated by a space
		borders:[[[1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1], [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1], [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1], [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1]],
				 [[1,0,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1], [1,1,1,1, 1,0,1,1, 1,1,1,1, 1,1,1,1], [1,1,1,1, 1,1,1,1, 1,0,1,1, 1,1,1,1], [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,0,1]],
				 [[1,1,0,1, 1,1,1,1, 1,1,1,1, 1,1,1,1], [1,1,1,1, 1,1,0,1, 1,1,1,1, 1,1,1,1], [1,1,1,1, 1,1,1,1, 1,0,1,1, 1,1,1,1], [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,0,1,1]],
				 [[1,0,1,1, 2,2,2,2, 1,0,1,1, 1,1,1,1], [1,1,1,1, 1,0,1,1, 2,2,2,2, 1,0,1,1], [1,0,1,1, 2,2,2,2, 1,0,1,1, 1,1,1,1], [1,1,1,1, 1,0,1,1, 2,2,2,2, 1,0,1,1]],
				 [[1,1,0,1, 1,1,1,1, 1,1,1,1, 1,1,1,1], [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,0,1,1], [1,1,0,1, 1,1,1,1, 1,1,1,1, 1,1,1,1], [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,0,1,1]],
				 [[1,0,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1], [1,1,1,1, 1,0,1,1, 1,1,1,1, 1,1,1,1], [1,0,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1], [1,1,1,1, 1,0,1,1, 1,1,1,1, 1,1,1,1]],
				 [[1,1,0,1, 1,1,1,1, 1,1,1,1, 1,1,1,1], [1,1,0,1, 1,0,1,1, 2,2,2,2, 1,1,1,1], [1,1,0,1, 1,0,1,1, 1,1,1,1, 2,2,2,2], [1,1,1,1, 1,0,1,1, 1,1,1,1, 1,1,1,1]]],
	},
	
	user: {
		username: "User",
		backgroundColor: "#222222",
		highscore: "0",
		gamesPlayed: "0",
		showGrid: "0",
		showStats: "0",
		dead: false
	},
	
	piece: {
		x: 3,
		y: 0,
		type: null,
		rotation: 0,
		speed: 1000,
		interval: null,
		
		next: null,
		canvas: null,
		ctx: null,
		columns: 4,
		rows: 4
	},
	
    init: function() {
        Game.canvas = document.getElementsByName('main')[0];
        Game.canvas.width = window.innerWidth * 0.8;
        Game.canvas.height = window.innerHeight;
        Game.borderX = window.innerWidth;
	    Game.borderY = window.innerHeight;
        Game.ctx = Game.canvas.getContext('2d');
        
        Game.piece.canvas = document.getElementsByName('next-piece')[0];
        Game.piece.canvas.width = window.innerWidth * 0.165,
        Game.piece.canvas.height = window.innerWidth * 0.165,
        Game.piece.ctx = Game.piece.canvas.getContext('2d');
        Game.resize();
    },

    resize: function() {
        Game.canvas.width = window.innerWidth * 0.8;
        Game.canvas.height = window.innerHeight;
        
        Game.piece.canvas.width = window.innerWidth * 0.166;
        Game.piece.canvas.height = window.innerWidth * 0.166;
    },
    
    confirmAction: function(index) {
    	//0 = reset game
    	//1 = reset highscore/games played
    	if(index == 0){
    		Game.state = false;
    		$('.confirmPanel .modal-body p').html("Warning! Reseting your game will lose all progress!<br>Are you sure you want to abandon the current game?<br><br><small>Note: current game is paused</small>");
    		$('.confirmPanel .btn.btn-danger').attr("onclick","$('.confirmPanel').modal('hide'); Game.state = true;");
    		$('.confirmPanel .btn.btn-primary').attr("onclick","Game.reset(); $('.confirmPanel').modal('hide');");
    		
    		if(Game.gameScore == 0) {Game.reset(); return true;}
    	}
    	else if(index == 1){
    		$('.confirmPanel .modal-body p').html("Warning! This action cannot be undone!<br>Are you sure you want to reset your current progress and stats?");
    		$('.confirmPanel .btn.btn-danger').attr("onclick","$('.confirmPanel').modal('hide');");
    		$('.confirmPanel .btn.btn-primary').attr("onclick","resetUserSettings(); toggleNotificationState('success', 'Successfully reset your stats!'); $('.confirmPanel').modal('hide');");
    	}
    	$('.confirmPanel').modal("show");
    },
    
    reset: function() {
    	Game.gameLevel = 1;
    	Game.gameScore = 0;
    	Game.piece.x = 3;
    	Game.piece.y = 0;
    	Game.piece.type = null;
    	Game.piece.rotation = 0;
    	clearInterval(Game.piece.interval);
    	Game.piece.interval = null;
    	Game.board.content = [0,0,0,0,0,0,0,0,0,0,
							  0,0,0,0,0,0,0,0,0,0,
							  0,0,0,0,0,0,0,0,0,0,
							  0,0,0,0,0,0,0,0,0,0,
							  0,0,0,0,0,0,0,0,0,0,
							  0,0,0,0,0,0,0,0,0,0,
							  0,0,0,0,0,0,0,0,0,0,
							  0,0,0,0,0,0,0,0,0,0,
							  0,0,0,0,0,0,0,0,0,0,
							  0,0,0,0,0,0,0,0,0,0,
							  0,0,0,0,0,0,0,0,0,0,
							  0,0,0,0,0,0,0,0,0,0,
							  0,0,0,0,0,0,0,0,0,0,
							  0,0,0,0,0,0,0,0,0,0,
							  0,0,0,0,0,0,0,0,0,0,
							  0,0,0,0,0,0,0,0,0,0,
							  0,0,0,0,0,0,0,0,0,0,
							  0,0,0,0,0,0,0,0,0,0,
							  0,0,0,0,0,0,0,0,0,0,
							  0,0,0,0,0,0,0,0,0,0];
		Game.state = true;
		Game.user.dead = false;
		Game.gamesPlayed = String(parseInt(Game.user.gamesPlayed) + 1);
		
		database.db.transaction(updateUserContentData, database.error);
		database.db.transaction(updateUserPlayedData, database.error);
    },
    
    firstTime: function() {
    	if(Game.gameFirstTime){
    		Game.state = false;
    		$('.firstTime').addClass("active");
    		
    		setTimeout(function(){
    			$('.firstTime span:eq(0)').addClass("active");
    			var infoInc = 1;
    			var infoIncInt = setInterval(function(){
    				$('.firstTime span:eq('+infoInc+')').addClass("active");
    				infoInc++;
    			},350);
    			
    			setTimeout(function(){
    				clearInterval(infoIncInt);
    			},(350 * $('.firstTime span').length))
    		},500);
    		
    		Game.gameFirstTime = !Game.gameFirstTime;
    	}
    },
    
    tap: {
    	trigger: function() {
    		if(!Game.swipe.allowVerticalSwipeTwo){
				if(!Game.swipe.triggerEvent) {
					var rotationToBe = Game.piece.rotation;
					if(Game.piece.rotation != 3) rotationToBe++;
					else rotationToBe = 0;
					
					if(0 <= (Game.piece.x + Game.updateBorderSide(Game.piece.type, rotationToBe, 3)) &&
					   Game.board.columns >= (Game.piece.x + (4 - Game.updateBorderSide(Game.piece.type, rotationToBe, 1)))){
						
					   	var rotationBlocked = false;
					   	for(i = 0; i < Game.board.pieces[Game.piece.type][rotationToBe].length / 4; i++){
							for(j = 0; j < (Game.board.pieces[Game.piece.type][rotationToBe].length / 4); j++){
								if(Game.board.pieces[Game.piece.type][rotationToBe][((j*4)+i)] == 1){
									if(Game.board.content[((Game.piece.y * Game.board.columns + j * Game.board.columns) + (Game.piece.x + i))] != 0){
										rotationBlocked = true;
									}
								}
							}
						}
						if(!rotationBlocked) Game.piece.rotation = rotationToBe;
					}
					else{
						if(0 <= (Game.piece.x + Game.updateBorderSide(Game.piece.type, rotationToBe, 3))){
							
							var rotationBlocked = false;
							for(i = 0; i < Game.board.pieces[Game.piece.type][rotationToBe].length / 4; i++){
								for(j = 0; j < Game.board.pieces[Game.piece.type][rotationToBe].length / 4; j++){
									if(Game.board.pieces[Game.piece.type][rotationToBe][((i*4)+j)] == 1){
										if(Game.board.content[((Game.piece.y * Game.board.columns + i * Game.board.columns) + (Game.piece.x + j - (Math.abs((Game.piece.x + 4) - (Game.board.columns - Game.updateBorderSide(Game.piece.type, rotationToBe, 1))))))] != 0) rotationBlocked = true;
									}
								}
							}
							
							if(!rotationBlocked){Game.piece.rotation = rotationToBe; Game.piece.x -= (Math.abs((Game.piece.x + 4) - (Game.board.columns - Game.updateBorderSide(Game.piece.type, rotationToBe, 1))));}
						}
						else if(Game.board.columns >= (Game.piece.x + (4 - Game.updateBorderSide(Game.piece.type, rotationToBe, 1)))){
							
							var rotationBlocked = false;
							for(i = 0; i < Game.board.pieces[Game.piece.type][rotationToBe].length / 4; i++){
								for(j = 0; j < Game.board.pieces[Game.piece.type][rotationToBe].length / 4; j++){
									if(Game.board.pieces[Game.piece.type][rotationToBe][((i*4)+j)] == 1){
										if(Game.board.content[((Game.piece.y * Game.board.columns + i * Game.board.columns) + (Game.piece.x + j + (Math.abs(Game.piece.x - (0 - Game.updateBorderSide(Game.piece.type, rotationToBe, 3))))))] != 0) rotationBlocked = true;
									}
								}
							}
							
							if(!rotationBlocked){Game.piece.rotation = rotationToBe; Game.piece.x += (Math.abs(Game.piece.x - (0 - Game.updateBorderSide(Game.piece.type, rotationToBe, 3))));}
						}
					}
					if(!Game.state) Game.reset();
				}
    		}
    	}
    },
    
    swipe: {
    	allowEvent: false,
    	triggerEvent: false,
    	allowVerticalSwipe: false,
    	allowVerticalSwipeTwo: false,
    	origX: 0,
    	origY: 0,
    	currX: 0,
    	currY: 0,
    	
    	triggerUp: function() { },
    	triggerDown: function() {
    		if(Game.swipe.allowVerticalSwipe){
    			var swipeGood = true;
				var swipeYMax = 0;
				
				do{
					swipeYMax++;
					for(i = 0; i < (Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4); i++){
						for(j = 0; j < (Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4); j++){
							if(Game.board.pieces[Game.piece.type][Game.piece.rotation][((j*4)+i)] == 1){
								if(Game.board.content[((swipeYMax * Game.board.columns + j * Game.board.columns) + (Game.piece.x + i))] != 0) {
									swipeGood = false;
									swipeYMax--;
									i = (Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4);
									j = (Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4);
								}
							}
						}
					}
				}
				while(swipeGood);
				
	    		clearInterval(Game.piece.interval);
	    		//Game.swipe.allowVerticalSwipeTwo = true;
	    		Game.swipe.origX = Game.swipe.currX;
				Game.swipe.origY = Game.swipe.currY;
	    		Game.swipe.allowVerticalSwipe = false;
	    		Game.swipe.allowVerticalSwipeTwo = false;
	    		
	    		/*
	    		setTimeout(function(){
	    			Game.piece.y = swipeYMax;
	    			Game.updateUserPieces();
	    		},50);
	    		*/
	    		
	    		Game.piece.y = swipeYMax;
	    		Game.updateUserPieces();
	    		
	    		/*
	    		Game.piece.interval = setInterval(function(){
	    			if(Game.piece.y >= swipeYMax) {
	    				clearInterval(Game.piece.interval);
	    				Game.updateUserPieces();
			    		Game.swipe.origX = Game.swipe.currX;
						Game.swipe.origY = Game.swipe.currY;
			    		Game.swipe.allowVerticalSwipe = false;
			    		Game.swipe.allowVerticalSwipeTwo = false;
	    			}
	    			else {
	    				if(Math.abs(swipeYMax - Game.piece.y) > 2) Game.piece.y ++;
	    				else Game.piece.y++;
	    			}
	    		},2);
	    		*/
    		}
    	},
    	triggerLeft: function() {
    		if(!Game.swipe.allowVerticalSwipeTwo){
				if(Game.piece.x > 0 - Game.updateBorderSide(Game.piece.type, Game.piece.rotation, 3)){
					if(Math.floor(Math.abs(Game.swipe.origX - Game.swipe.currX) / ((Game.canvas.width/Game.board.columns)/1.7)) >= 1){
						var rotationBlocked = false;
					   	for(i = 0; i < Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4; i++){
							for(j = 0; j < (Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4); j++){
								if(Game.board.pieces[Game.piece.type][Game.piece.rotation][((j*4)+i)] == 1){
									if(!(Game.board.content[((Game.piece.y * Game.board.columns + j * Game.board.columns) + ((Game.piece.x - 1) + i))] == 0
									  || Game.board.content[((Game.piece.y * Game.board.columns + j * Game.board.columns) + ((Game.piece.x - 1) + i))] == undefined)){
										rotationBlocked = true;
									}
								}
							}
						}
						if(!rotationBlocked) Game.piece.x--;
						Game.swipe.origX = Game.swipe.currX;
					}
				}
			}
    	},
    	triggerRight: function() {
    		if(!Game.swipe.allowVerticalSwipeTwo){
				if(Game.piece.x < Game.board.columns - (4 - Game.updateBorderSide(Game.piece.type, Game.piece.rotation, 1))){
					if(Math.floor(Math.abs(Game.swipe.origX - Game.swipe.currX) / ((Game.canvas.width/Game.board.columns)/1.7)) >= 1){
						var rotationBlocked = false;
					   	for(i = 0; i < Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4; i++){
							for(j = 0; j < (Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4); j++){
								if(Game.board.pieces[Game.piece.type][Game.piece.rotation][((j*4)+i)] == 1){
									if(!(Game.board.content[((Game.piece.y * Game.board.columns + j * Game.board.columns) + ((Game.piece.x + 1) + i))] == 0
									  || Game.board.content[((Game.piece.y * Game.board.columns + j * Game.board.columns) + ((Game.piece.x + 1) + i))] == undefined)){
										rotationBlocked = true;
									}
								}
							}
						}
						if(!rotationBlocked) Game.piece.x++;
						Game.swipe.origX = Game.swipe.currX;
					}
				}
			}
		}
    },
    
    push: {
    	trigger: function(){
    		var rotationBlocked = false;
    		for(i = 0; i < Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4; i++){
				for(j = 0; j < (Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4); j++){
					if(Game.board.pieces[Game.piece.type][Game.piece.rotation][((j*4)+i)] == 1){
						if(((Game.piece.y * Game.board.columns + j * Game.board.columns) + ((Game.piece.x + 1) + i) + Game.board.columns) >= 200 ||
							 Game.board.content[((Game.piece.y * Game.board.columns + j * Game.board.columns) + ((Game.piece.x) + i) + Game.board.columns)] != 0){
							rotationBlocked = true;
						}
					}
				}
			}
			if(!rotationBlocked) Game.piece.y++;
    	}
    }
};

//---- DOCUMENT READY ----//

(function() {
	var onEachFrame;
	if (window.webkitRequestAnimationFrame) {
		onEachFrame = function(cb) {
			var _cb = function() {
				cb();
				webkitRequestAnimationFrame(_cb);
			}
			_cb();
		};
	} else if (window.mozRequestAnimationFrame) {
		onEachFrame = function(cb) {
			var _cb = function() {
				cb();
				mozRequestAnimationFrame(_cb);
			}
			_cb();
		};
	} else {
		onEachFrame = function(cb) {
			setInterval(cb, 1000 / Game.ups);
		}
	}

	window.onEachFrame = onEachFrame;
})(); 

$(document).ready(function() {
	$(".ui-loader").hide();
	
	window.addEventListener('load', Game.init, false);
	window.addEventListener('resize', Game.resize, false);
	document.addEventListener("backbutton", function(e){
	    if($('.sidebar').hasClass("middle")) navigator.app.exitApp();
	    else toggleGameState(1);
	}, false);
	document.addEventListener("pause", function(e){
		if($('.sidebar').hasClass("left")) toggleGameState(1);
		database.db.transaction(updateUserContentData, database.error);
	}, false);

	$("canvas[name='main']")
		.on("tap", function(){Game.tap.trigger();})
		
        .on('vmousedown', function (e) {
        	Game.swipe.allowEvent = true;
        	Game.swipe.allowVerticalSwipe = true;
        	Game.swipe.origX = e.pageX;
        	Game.swipe.origY = e.pageY;
        })
        .on('vmousemove', function (e) {
        	if(Game.swipe.allowEvent){		//user is holding
        		if(Math.abs(Game.swipe.origX - e.pageX) >= (Game.canvas.width/(Game.board.columns*1.5)) || Math.abs(Game.swipe.origY - e.pageY) >= ((Game.canvas.height/Game.board.rows) * 3)){		//user has moved
        			Game.swipe.triggerEvent = true;
	        		Game.swipe.currX = e.pageX;
	        		Game.swipe.currY = e.pageY;
	        		
        			if(Math.abs(Game.swipe.origX - e.pageX) + 10 > Math.abs(Game.swipe.origY - e.pageY)){
        				if(Game.swipe.origX > e.pageX) Game.swipe.triggerLeft();
        				else Game.swipe.triggerRight();
        				Game.swipe.allowVerticalSwipe = false;
        			}
        			else{
        				if(Game.swipe.allowVerticalSwipe){
        					if(Game.swipe.origY > e.pageY) Game.swipe.triggerUp();
        					else Game.swipe.triggerDown();
        				}
        			}
	        	}
        	}
        })
        .on('vmouseup', function (e) {setTimeout(function(){Game.swipe.allowEvent = false; Game.swipe.triggerEvent = false; Game.swipe.allowVerticalSwipe = false;},100);})
        .on('vmouseleave', function (e){Game.swipe.allowEvent = false; Game.swipe.triggerEvent = false; Game.swipe.allowVerticalSwipe = false;})
    ;
    
    $(".sidebar").on("swipeleft", function(){
    	if($(".sidebar").hasClass("middle")) {toggleGameState(0);}
    	if($(".sidebar").hasClass("right")) {toggleGameState(1); /*if(!Game.state) toggleGameState(1);**/}
    	if($(".sidebar").hasClass("left")) ;//nothing
    })
    
    $(".sidebar").on("swiperight", function(){
    	if($(".sidebar").hasClass("middle")) {toggleGameState(2);}
    	if($(".sidebar").hasClass("left")) {toggleGameState(1);}
    	if($(".sidebar").hasClass("right")) ;//nothing
    })
	
	setTimeout(function(){
		$('.sidebar-inner.middle').addClass("active");
	},2000);
	
	window.onEachFrame(Game.run);
	database.init();
});

function toggleGameState(x){
	$('.sidebar').removeClass('middle'); 
	$('.sidebar').removeClass('left'); 
	$('.sidebar').removeClass('right');
	 
	if(x == 0){
		$('.sidebar').addClass('left'); 
		$('.settings').addClass('active');
		
		if(Game.state){
			Game.stop();
			toggleNotificationState("default", "Game has been paused.");
			database.db.transaction(updateUserContentData, database.error);
		}
	}
	else if(x == 1){
		$('.sidebar').addClass('middle'); 
		$('.settings').removeClass('active');
		
		if(Game.state){
			Game.stop();
			toggleNotificationState("default", "Game has been paused.");
			database.db.transaction(updateUserContentData, database.error);
		}
	}
	else if(x == 2){
		$('.sidebar').addClass('right');
		$('.settings').removeClass('active');
		
		if(!Game.user.dead) Game.start();
		Game.firstTime();
	}
}

function toggleNotificationState(state, message){
	$('.navbar-notification').html(message);
	$('.navbar-notification').addClass(state);
	setTimeout(function(){$('.navbar-notification').removeClass(state);},3000);
}

/*---- STORAGE ----*/

function saveUserSettings(){
	var complete = true;
	if($('input[name="username"]').val() == ""){$('.settings-error:eq(0)').addClass('active');complete = false;	}
	if($('input[name="colour"]').val() == "" ||
	   $('input[name="colour"]').val().length <= 3 ||
	   $('input[name="colour"]').val()[0] != "#"){$('.settings-error:eq(1)').addClass('active');complete = false; }
	
	if(complete) {
		toggleNotificationState("success", "Successfully updated your settings!");
		database.db.transaction(updateUserSettingsData, database.error);
	}
	else{
		toggleNotificationState("error", "Please check the settings you updated!");
	}
	
	navigator.notification.vibrate(50);
	setTimeout(function(){navigator.notification.vibrate(50);},250)
}

function resetUserSettings(){
	database.db.transaction(resetUserSettingsData, database.error);
	
	navigator.notification.vibrate(50);
	setTimeout(function(){navigator.notification.vibrate(50);},250)
}

function getUserSettingsData(tx) {
    tx.executeSql('SELECT * FROM info', [], querySuccess, database.error);
}

function updateUserSettingsData(tx) {
	tx.executeSql('UPDATE info SET username="'+$('input[name="username"]').val()+'", background="'+$('input[name="colour"]').val()+'", grid="'+(+$('input[name="grid"]').is(':checked'))+'", nerd="'+(+$('input[name="nerd"]').is(':checked'))+'"', [], getUserSettingsData, database.error);
}

function updateUserHighscoreData(tx) {
	tx.executeSql('UPDATE info SET score="'+Game.gameScore+'"', [], getUserSettingsData, database.error);
}

function updateUserPlayedData (tx) {
	tx.executeSql('UPDATE info SET played="'+Game.gamesPlayed+'"', [], getUserSettingsData, database.error);
}

function updateUserContentData (tx) {
	tx.executeSql('UPDATE info SET content="'+Game.board.content+'", currScore="'+Game.gameScore+'", currPiece="'+Game.piece.type+'", currPieceX="'+Game.piece.x+'", currPieceY="'+Game.piece.y+'", currPieceR="'+Game.piece.rotation+'", currNext="'+Game.piece.next+'", currLevel="'+Game.gameLevel+'"', [], getUserSettingsData, database.error);
}

function updateUserGameData (tx) {
	tx.executeSql('UPDATE info SET content="'+Game.board.content+'", currScore="'+Game.gameScore+'", currPiece="'+Game.piece.type+'", currPieceX="'+Game.piece.x+'", currPieceY="'+Game.piece.y+'", currPieceR="'+Game.piece.rotation+'", currNext="'+Game.piece.next+'", currLevel="'+Game.gameLevel+'"', [], function(){/*nothing*/}, database.error);
}

function resetUserSettingsData(tx) {
	tx.executeSql('UPDATE info SET score="0", played="0"', [], getUserSettingsData, database.error);
}

function querySuccess(tx, results) {
	Game.user.username = results.rows.item(0).username;
	Game.user.backgroundColor = results.rows.item(0).background;
	Game.user.highscore = results.rows.item(0).score;
	Game.user.gamesPlayed = results.rows.item(0).played;
	Game.user.showGrid = results.rows.item(0).grid;
	Game.user.showStats = results.rows.item(0).nerd;
	
	if(results.rows.item(0).currPiece != "" && results.rows.item(0).currPiece.length == 1) Game.piece.type = parseInt(results.rows.item(0).currPiece);
	if(results.rows.item(0).currNext != "" && results.rows.item(0).currNext.length == 1) Game.piece.next = parseInt(results.rows.item(0).currNext);
	
	if(results.rows.item(0).currPieceX != "" && results.rows.item(0).currPieceX.length == 1) Game.piece.x = parseInt(results.rows.item(0).currPieceX);
	if(results.rows.item(0).currPieceY != "" && results.rows.item(0).currPieceY.length == 1) Game.piece.y = parseInt(results.rows.item(0).currPieceY);
	if(results.rows.item(0).currPieceR != "" && results.rows.item(0).currPieceR.length == 1) Game.piece.rotation = parseInt(results.rows.item(0).currPieceR);
	
	if(results.rows.item(0).currLevel != "1") Game.gameLevel = parseInt(results.rows.item(0).currLevel);
	if(results.rows.item(0).currScore != "0") Game.gameScore = parseInt(results.rows.item(0).currScore);
	
	if(results.rows.item(0).content.length == 399){Game.board.content = (results.rows.item(0).content).split(",");}
	
	$('#score').html(Game.gameScore);
	$('#level').html(Game.gameLevel);
	$('.user-name').html(Game.user.username);
	$('input[name="username"]').val(Game.user.username);
	
	$('input[name="colour"]').val(Game.user.backgroundColor);
	for(i = 0; i < $('.settings-theme').length; i++){
		if(rgb2hex($('.settings-theme:eq('+i+')').css("background-color")) == Game.user.backgroundColor) $('.settings-theme:eq('+i+')').addClass("active");
	}
	
	$('.high-score').html(Game.user.highscore);
	$('.games-played').html(Game.user.gamesPlayed);
	
	if(Game.user.showGrid == "1") $('input[name="grid"]').prop('checked', true);
	else $('input[name="grid"]').prop('checked', false);
	
	clearInterval(Game.statsClock);
	if(Game.user.showStats == "1") {$('input[name="nerd"]').prop('checked', true); Game.statsClock = setInterval(function(){Game.stats(); Game.upsCount = 0, Game.fpsCount = 0;},1000);}
	else $('input[name="nerd"]').prop('checked', false);
	$('#stats').html("");
	
	$('.settings-error').removeClass('active');
}

function rgb2hex(orig){
	var rgb = orig.replace(/\s/g,'').match(/^rgba?\((\d+),(\d+),(\d+)/i);
 	return (rgb && rgb.length === 4) ? "#" +
  		("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  		("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  		("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : orig;
}

/*---- MAIN ----*/

Game.start = function(){Game.state = true;}
Game.stop = function(){Game.state = false; clearInterval(Game.piece.interval); Game.piece.interval = null;}
Game.stats = function(){$('#stats').html("FPS: "+Game.fpsCount+" UPS: "+Game.upsCount);}
Game.end = function(){
	Game.stop();
	Game.user.dead = true;
	setTimeout(function(){Game.drawEnd();},20);
	
	if(Game.gameScore > parseInt(Game.user.highscore)) {
		Game.user.highscore = String(Game.gameScore);
		database.db.transaction(updateUserHighscoreData, database.error);
		toggleNotificationState("success", "New Highscore!"); 
	}
	
	//Game.gamesPlayed = String(parseInt(Game.user.gamesPlayed) + 1);
	//database.db.transaction(updateUserPlayedData, database.error);
	
	if(Game.gameScore >= 2906){
		Game.board.content = [1,1,1,0,0,5,0,5,0,0,
							  0,1,0,0,5,0,5,0,5,0,
							  0,1,0,0,5,0,0,0,5,0,
							  0,1,0,0,0,5,0,5,0,0,
							  1,1,1,0,0,0,5,0,0,0,
							  0,0,0,0,0,0,0,0,0,0,
							  2,2,2,0,3,3,3,3,3,0,
							  2,0,2,0,3,0,3,0,3,0,
							  2,2,2,0,3,0,3,0,3,0,
							  2,0,2,0,3,0,0,0,3,0,
							  0,0,0,0,0,0,0,0,0,0,
							  4,4,4,0,5,0,0,0,6,0,
							  4,0,0,0,5,0,0,0,6,0,
							  4,4,4,0,5,0,0,0,6,0,
							  4,0,0,0,5,5,5,0,6,0,
							  4,4,4,0,0,0,0,0,6,0,
							  0,2,2,2,0,1,0,1,1,1,
							  0,2,0,2,0,0,0,0,1,0,
							  0,2,2,2,0,1,0,1,0,0,
							  0,2,0,2,0,1,0,1,1,1];
		Game.ctx.clearRect(0, 0, Game.canvas.width, Game.canvas.height);
		Game.piece.ctx.clearRect(0, 0, Game.piece.canvas.width, Game.piece.canvas.height);
		Game.ctx.globalAlpha = 1;
		Game.drawBackground();
		Game.drawSetPieces();
	}
	
	Game.board.content = [0,0,0,0,0,0,0,0,0,0,
						  0,0,0,0,0,0,0,0,0,0,
						  0,0,0,0,0,0,0,0,0,0,
						  0,0,0,0,0,0,0,0,0,0,
						  0,0,0,0,0,0,0,0,0,0,
						  0,0,0,0,0,0,0,0,0,0,
						  0,0,0,0,0,0,0,0,0,0,
						  0,0,0,0,0,0,0,0,0,0,
						  0,0,0,0,0,0,0,0,0,0,
						  0,0,0,0,0,0,0,0,0,0,
						  0,0,0,0,0,0,0,0,0,0,
						  0,0,0,0,0,0,0,0,0,0,
						  0,0,0,0,0,0,0,0,0,0,
						  0,0,0,0,0,0,0,0,0,0,
						  0,0,0,0,0,0,0,0,0,0,
						  0,0,0,0,0,0,0,0,0,0,
						  0,0,0,0,0,0,0,0,0,0,
						  0,0,0,0,0,0,0,0,0,0,
						  0,0,0,0,0,0,0,0,0,0,
						  0,0,0,0,0,0,0,0,0,0];
	database.db.transaction(updateUserContentData, database.error);
	
	Game.piece.x = 3;
	Game.piece.y = 0;
	Game.piece.type = null;
	Game.piece.rotation = 0;
	clearInterval(Game.piece.interval);
	Game.piece.interval = null;
	
	navigator.notification.vibrate(50);
	setTimeout(function(){
		Game.gameLevel = 1;
		Game.gameScore = 0;
		
		navigator.notification.vibrate(50);
	},250)
}

Game.run = (function() {
	var loops = 0, skipTicks = 1000 / Game.ups, maxFrameSkip = 5, nextGameTick = (new Date).getTime();

	return function() {
		loops = 0;

		while ((new Date).getTime() > nextGameTick && loops < maxFrameSkip) {
			Game.update();
			Game.upsCount++;
			nextGameTick += skipTicks;
			loops++;
		}
		
		if(loops) {
			Game.draw();
			Game.fpsCount++;
		}
	};
})();

/*---- UPDATE  ----*/

Game.update = function(){
	if(Game.state){
		$('#score').html(Game.gameScore);
		$('#level').html(Game.gameLevel);
		
		if(Game.piece.type != null) Game.updateLevelCheck();
		Game.updateLineCheck();
		Game.updateLevel();
		
		if(Game.piece.type == null || Game.piece.interval == null){
			if(Game.piece.next == null) Game.piece.next = Math.floor(Math.random() * Game.board.pieces.length);
			if(Game.piece.type == null) {
				Game.piece.type = Game.piece.next;
				Game.piece.next = Math.floor(Math.random() * Game.board.pieces.length);
				Game.piece.y = 0 - Game.updateBorderSide(Game.piece.type, Game.piece.rotation, 0);
				
				Game.updateLevelCheck();
			}
			Game.piece.interval = setInterval(function(){if(Game.state)Game.updateUserPieces();},Game.piece.speed - (50 * (Game.gameLevel - 1)));
		}
	}
}

Game.updateLevelCheck = function(){
   	for(i = 0; i < Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4; i++){
		for(j = 0; j < (Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4); j++){
			if(Game.board.pieces[Game.piece.type][Game.piece.rotation][((j*4)+i)] == 1){
				if(Game.board.content[(((Game.piece.y + j) * Game.board.columns) + Game.piece.x + i)] != 0) {
					database.db.transaction(updateUserContentData, database.error);
					setTimeout(function(){
						if(Game.state == true){
							Game.end();
						}
					},10);
				}
			}
		}
	}
}

Game.updateLevel = function(){
	if(Game.gameLevel != Math.floor(Game.gameScore/100) + 1){
		Game.gameLevel = Math.floor(Game.gameScore/100) + 1;
		toggleNotificationState("success", "Reached Level "+Game.gameLevel+"!")
		navigator.notification.vibrate(50);
	}
	
	if(Game.gameScore == 690) toggleNotificationState("success", "Heh... 69 ;).");
}

Game.updateLineCheck = function(){
	for(i = 0; i < Game.board.rows; i++){
		lineCheck = false;
		
		for(j = 0; j < Game.board.columns; j++){
			if(Game.board.content[((i*Game.board.columns)+j)] == 0) lineCheck = true;
		}
		
		if(!lineCheck){
			Game.gameScore += 10;
			for(k = i; k > -1; k--){
				for(l = 0; l < Game.board.columns; l++){
					if(k == 0) Game.board.content[((k*Game.board.columns)+l)] = 0;
					else Game.board.content[((k*Game.board.columns)+l)] = Game.board.content[((k*Game.board.columns)+l - Game.board.columns)];
				}
			}
		}
	}
}

Game.updateUserPieces = function(){
	if(Game.piece.y < Game.board.rows - (4 - Game.updateBorderSide(Game.piece.type, Game.piece.rotation, 2))){
		var stopIncrement = false;
		
		for(i = 0; i < Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4; i++){
			for(j = 0; j < (Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4); j++){
				if(Game.board.pieces[Game.piece.type][Game.piece.rotation][((j*4)+i)] == 1){
					if(Game.board.content[((Game.piece.y * Game.board.columns + j * Game.board.columns) + (Game.piece.x + i) + Game.board.columns)] != 0){
						stopIncrement = true;
					}
				}
			}
		}
		
		if(!stopIncrement) {
			Game.piece.y++;
			//TODO comment out if causes too much lag
			database.db.transaction(updateUserGameData, database.error);
		}
		else{
			for(i = 0; i < Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4; i++){
				for(j = 0; j < (Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4); j++){
					if(Game.board.pieces[Game.piece.type][Game.piece.rotation][((j*4)+i)] == 1){
						Game.board.content[(Game.piece.y * Game.board.columns + j * Game.board.columns) + (Game.piece.x + i)] = Game.piece.type + 1;
					}
				}
			}
			
			Game.piece.type = null;
			Game.piece.x = 3;
			Game.piece.y = 0;
			Game.piece.rotation = 0;
			clearInterval(Game.piece.interval);
			Game.piece.interval = null;
			Game.piece.speed = 1000;
		}
	}
	else{
		for(i = 0; i < Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4; i++){
			for(j = 0; j < (Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4); j++){
				if(Game.board.pieces[Game.piece.type][Game.piece.rotation][((j*4)+i)] == 1){
					Game.board.content[(Game.piece.y * Game.board.columns + j * Game.board.columns) + (Game.piece.x + i)] = Game.piece.type + 1;
				}
			}
		}
		
		Game.piece.type = null;
		Game.piece.x = 3;
		Game.piece.y = 0;
		Game.piece.rotation = 0;
		clearInterval(Game.piece.interval);
		Game.piece.interval = null;
		Game.piece.speed = 1000;
	}
	
}

Game.updateBorderSide = function(type, rotation, side){
	var temp1 = Game.board.borders[type][rotation][(side*4 + 0)];
	var temp2 = Game.board.borders[type][rotation][(side*4 + 1)];
	var temp3 = Game.board.borders[type][rotation][(side*4 + 2)];
	var temp4 = Game.board.borders[type][rotation][(side*4 + 3)];
	
	return Math.min(temp1, temp2, temp3, temp4);
}

Game.updateBorderSingle = function(type, rotation, side, indv){
	return Game.board.borders[type][rotation][(side*4 + indv)];
}

/*---- DRAW ----*/

Game.draw = function(){
	if(Game.state){
		Game.ctx.clearRect(0, 0, Game.canvas.width, Game.canvas.height);
		Game.piece.ctx.clearRect(0, 0, Game.piece.canvas.width, Game.piece.canvas.height);
		Game.ctx.globalAlpha = 1;
		Game.piece.ctx.globalAlpha = 1;
		
		Game.drawBackground();
		Game.drawGhostPieces();
		Game.drawSetPieces();
		Game.drawUserPieces();
		Game.drawNextPiece();
		if(Game.user.showGrid == "1") Game.drawGrid();
	}
}

Game.drawBackground = function(){
	Game.ctx.fillStyle = Game.user.backgroundColor;
	Game.ctx.fillRect(0,0, window.innerWidth, window.innerHeight);
	
	Game.piece.ctx.fillStyle = Game.user.backgroundColor;
	Game.piece.ctx.fillRect(0,0, Game.piece.canvas.width, Game.piece.canvas.height);
}

Game.drawUserPieces = function(){
	if(Game.piece.type != null){
		for(i = 0; i < (Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4); i++){
			for(j = 0; j < (Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4); j++){
				if(Game.board.pieces[Game.piece.type][Game.piece.rotation][((j*4)+i)] == 1) Game.ctx.fillStyle = Game.board.reference[Game.piece.type+1];
				else Game.ctx.fillStyle = "rgba(255,255,255,0)";
				
				Game.ctx.fillRect(Game.piece.x*(Game.canvas.width/Game.board.columns) + i*(Game.canvas.width/Game.board.columns)
								, Game.piece.y*(Game.canvas.height/Game.board.rows) + j *(Game.canvas.height/Game.board.rows)
								, (Game.canvas.width/Game.board.columns), (Game.canvas.height/Game.board.rows));
								
				if(Game.board.pieces[Game.piece.type][Game.piece.rotation][((j*4)+i)] == 1) Game.ctx.strokeStyle = "black";
				else Game.ctx.strokeStyle = "rgba(0,0,0,0)";
				
				Game.ctx.strokeRect(Game.piece.x*(Game.canvas.width/Game.board.columns) + i*(Game.canvas.width/Game.board.columns)
								  , Game.piece.y*(Game.canvas.height/Game.board.rows) + j*(Game.canvas.height/Game.board.rows)
								  , (Game.canvas.width/Game.board.columns), (Game.canvas.height/Game.board.rows));
			}
		}
	}
}

Game.drawSetPieces = function(){
	for(i = 0; i < Game.board.columns; i++){
		for(j = 0; j < Game.board.rows; j++){
			if(Game.board.content[((j*Game.board.columns)+i)] != 0){
				Game.ctx.fillStyle = Game.board.reference[Game.board.content[((j*Game.board.columns)+i)]];
				Game.ctx.fillRect(i*(Game.canvas.width/Game.board.columns), j*(Game.canvas.height/Game.board.rows), (Game.canvas.width/Game.board.columns), (Game.canvas.height/Game.board.rows));
				
				Game.ctx.strokeStyle = "black";
				Game.ctx.strokeRect(i*(Game.canvas.width/Game.board.columns), j*(Game.canvas.height/Game.board.rows), (Game.canvas.width/Game.board.columns), (Game.canvas.height/Game.board.rows));
			}
		}
	}
}

Game.drawGhostPieces = function(){
	if(Game.piece.type != null){
		Game.ctx.globalAlpha = 0.2;
		var ghostGood = true;
		var ghostYMax = Game.piece.y; //Game.board.rows - 2;
		
		do{
			ghostGood = true;
			ghostYMax++;
			for(i = 0; i < (Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4); i++){
				for(j = 0; j < (Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4); j++){
					if(Game.board.pieces[Game.piece.type][Game.piece.rotation][((j*4)+i)] == 1){
						if(Game.board.content[((ghostYMax * Game.board.columns + j * Game.board.columns) + (Game.piece.x + i))] != 0) {
							ghostGood = false;
							ghostYMax--;
							i = (Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4);
							j = (Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4);
						}
					}
				}
			}
		}
		while(ghostGood);
		
		for(i = 0; i < (Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4); i++){
			for(j = 0; j < (Game.board.pieces[Game.piece.type][Game.piece.rotation].length / 4); j++){
				if(Game.board.pieces[Game.piece.type][Game.piece.rotation][((j*4)+i)] == 1) Game.ctx.fillStyle = Game.board.reference[Game.piece.type+1];
				else Game.ctx.fillStyle = "rgba(0,0,0,0)";
				
				Game.ctx.fillRect(Game.piece.x*(Game.canvas.width/Game.board.columns) + i*(Game.canvas.width/Game.board.columns)
								, ghostYMax*(Game.canvas.height/Game.board.rows) + j *(Game.canvas.height/Game.board.rows)
								, (Game.canvas.width/Game.board.columns), (Game.canvas.height/Game.board.rows));
								
				if(Game.board.pieces[Game.piece.type][Game.piece.rotation][((j*4)+i)] == 1) Game.ctx.strokeStyle = "black";
				else Game.ctx.strokeStyle = "rgba(0,0,0,0)";
				
				Game.ctx.strokeRect(Game.piece.x*(Game.canvas.width/Game.board.columns) + i*(Game.canvas.width/Game.board.columns)
								, ghostYMax*(Game.canvas.height/Game.board.rows) + j*(Game.canvas.height/Game.board.rows)
								, (Game.canvas.width/Game.board.columns), (Game.canvas.height/Game.board.rows));
			}
		}
		Game.ctx.globalAlpha = 1;
	}
}

Game.drawNextPiece = function(){
	if(Game.piece.type != null){
		for(i = 0; i < Game.piece.columns; i++){
			for(j = 0; j < Game.piece.rows; j++){
				if(Game.board.pieces[Game.piece.next][0][((j*4)+i)] == 1) Game.piece.ctx.fillStyle = Game.board.reference[Game.piece.next+1];
				else Game.piece.ctx.fillStyle = "rgba(0,0,0,0)";
				
				Game.piece.ctx.fillRect(i*(Game.piece.canvas.width/Game.piece.columns), j*(Game.piece.canvas.height/Game.piece.rows), (Game.piece.canvas.width/Game.piece.columns), (Game.piece.canvas.height/Game.piece.rows));
				
				if(Game.board.pieces[Game.piece.next][0][((j*4)+i)] == 1) Game.piece.ctx.strokeStyle = "black";
				else Game.piece.ctx.strokeStyle = "rgba(0,0,0,0)";
				
				Game.piece.ctx.strokeRect(i*(Game.piece.canvas.width/Game.piece.columns), j*(Game.piece.canvas.height/Game.piece.rows), (Game.piece.canvas.width/Game.piece.columns), (Game.piece.canvas.height/Game.piece.rows));
				//Game.piece.ctx.strokeStyle = "black";
				//Game.piece.ctx.strokeRect(i*(Game.piece.canvas.width/Game.piece.columns), j*(Game.piece.canvas.height/Game.piece.rows), (Game.piece.canvas.width/Game.piece.columns), (Game.piece.canvas.height/Game.piece.rows));
			}
		}
	}
}

Game.drawEnd = function(){
	Game.ctx.fillStyle = "rgba(0,0,0,0.6)";
	Game.ctx.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
}

Game.drawGrid = function(){
	for(i = 0; i < Game.board.columns; i++){
		for(j = 0; j < Game.board.rows; j++){
			Game.ctx.strokeStyle = "black";
			Game.ctx.strokeRect(i*(Game.canvas.width/Game.board.columns), j*(Game.canvas.height/Game.board.rows), (Game.canvas.width/Game.board.columns), (Game.canvas.height/Game.board.rows));
		}
	}
}