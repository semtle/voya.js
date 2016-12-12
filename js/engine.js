//Made by, and copyright, @trevorsargent 2016
//p rints a line of text to the screen
function clear() {
	$("#console").html("<div id='placeholder'></div>")
}

function setup(data) {
	clear();
	data.player.currentLocation = applyPlaceDefaults(data.places[data.player.settings.startingPlace], data.defaults)
	printWelcome(data.messages.welcomeText);
	$("#image")
		.attr("src", data.settings["background-url"])
	$("title")
		.html(data.settings.title)
	$("#logo")
		.html(data.settings.title)
		//on pressing enter after providing a command
	$("#prepend")
		.html(data.settings.prepend)
	$("#command_line").attr("placeholder", data.messages.placeholder).val("").focus()
	return data;
}

function println(line) {
	if (line) {
		arr = line.split('\n');
		for (let i = 0; i < arr.length; i++) {
			$("<p>" + arr[i].trim() + "</p>")
				.insertBefore("#placeholder")
		}
	}
}

//a dds a blank line
function line() {
	$("<p></br></p>")
		.insertBefore("#placeholder")
}

// adds a number of blank lines
function lineNum(int) {
	for (let i = 0; i < int; i++) {
		line()
	}
}

// prints the welcome message
function printWelcome(welcomeText) {
	lineNum(8)
	println(welcomeText)
	line()
}

function trimInput(input, string) {
	return input.replace(string, "")
		.trim()
		.replace("the ", "")
		.replace("a ", "")
		.replace("to ", "")
		.trim();
}

// returns a description of a 'place'
function description(place, places) {
	let toReturn = "you're standing in the " + place.name + "."
	if (place.left != undefined) {
		toReturn += "</br>on your left is the " + places[place.left].name + "."
	}
	if (place.right != undefined) {
		toReturn += "</br>on your right is the " + places[place.right].name + "."
	}
	if (place.ahead != undefined) {
		toReturn += "</br>ahead of you is the " + places[place.ahead].name + "."
	}
	if (place.behind != undefined) {
		toReturn += "</br>behind you is the " + places[place.behind].name + "."
	}
	if (!place.settings.beenHere && place.messages.newText != "") {
		toReturn += "</br></br>" + place.messages.newText + "."
	}
	return toReturn
}

//returns a formatted list of everything in a hash
function hashList(hash, error) {
	let toReturn = ""
	if (Object.keys(hash)
		.length > 0) {
		for (let item in hash) {
			toReturn += item + ": (" + hash[item] + ") \n"
		}
		return toReturn
	} else {
		return error
	}
}

// adds an item a hash
function hashAdd(string, list) {
	if (string in list) {
		list[string]++
	} else {
		list[string] = 1
	}
	return list
}

// removes an item from a hash
function hashRemove(string, list) {
	if (string in list) {
		list[string]--
			if (list[string] <= 0) {
				delete list[string]
			}
	}
	return list
}

function canSee(player) {

	if (player.currentLocation.settings.islit) {
		return true
	}
	for (e in player.settings.lamps) {
		if (player.pockets[player.settings.lamps[e]]) {
			return true
		}
	}
	return false
}

//walks to the place
function walkTo(player, destination, places, defaults) {
	player.currentLocation.settings.beenHere = true
	destination = applyPlaceDefaults(placeFromString(placeName, places), defaults)
	player.currentLocation = destination
	return player
}

// returns whether a place is accessabel from another place
function locationIsAccessable(dest, source, places) {
	if (dest === undefined) {
		return false
	}
	if (places[source.ahead] === dest) {
		return true
	}
	if (places[source.behind] === dest) {
		return true
	}
	if (places[source.right] === dest) {
		return true
	}
	if (places[source.left] === dest) {
		return true
	}
	if (places[source.above] === dest) {
		return true
	}
	if (places[source.below] === dest) {
		return true
	}
	return false
}

function unlockLocation(destination, pockets) {
	if (pockets[destination.settings.key] && destination.settings.leaveUnlocked) {
		destination.settings.isLocked = false
	}
	return destination
}

function locationIsLocked(destination, pockets) {
	if (destination.settings.isLocked) {
		if (pockets[destination.settings.key]) {
			return false
		}
		return true
	}
	return false
}

// return an item in exchange for another item, based on the place
function exchange(item, place) {
	if (item in place.exchanges) {
		return place.exchanges[item]
	}
}

function placeFromString(placeName, places) {
	for (let e in places) {
		if (places[e].name == placeName) {
			return places[e]
		}
	}
}

//adds the gramatically appropriate article to the string passed
function addArticle(string) {
	let vowels = ['a', 'e', 'i', 'o', 'u'];
	let article = "";
	if (vowels.includes(string.charAt(0))) {
		article = "an ";
	} else {
		article = "a "
	}
	return article + " " + string;
}

function applyPlaceDefaults(place, defaults) {
	place.settings = place.settings || {}
	place.settings.beenHere = place.settings.beenHere || defaults.place.settings.beenHere
	place.settings.isLocked = place.settings.isLocked || defaults.place.settings.isLocked
	place.settings.isLit = place.settings.isLit || defaults.place.settings.isLit
	place.messages = place.messages || {}
	place.objects = place.objects || {}
	place.exchanges = place.exchanges || {}
	return place
}

// process the input from each command
function processInput(input, data) {
	let {
		settings,
		commands,
		player,
		places,
		messages,
		defaults
	} = data;

	// store in inputHistory
	if (input.length > 0) {
		println(settings.prepend + input)
		line()
	}

	//ask for help
	if (input.indexOf(commands.help) > -1) {
		println(messages.helpText)

		//look around describe where you are
	} else if (input.indexOf(commands.quit) > -1) {
		location.reload();
	} else if (input.indexOf(commands.observe) > -1) {
		if (canSee(player)) {
			println(description(player.currentLocation, places))
		} else {
			println(messages.visibilityError)
		}

		//walk places
	} else if (input.indexOf(commands.move) > -1) {
		// input = input.replace("walk to", "").trim().input.replace("the", "").trim()
		placeName = trimInput(input, commands.move)
		place = placeFromString(placeName, places)
		if (place != undefined) {
			place = applyPlaceDefaults(place, defaults)
			if (locationIsAccessable(place, player.currentLocation, places) && place != undefined) {
				if (!locationIsLocked(place, player.pockets)) {
					player = walkTo(player, placeName, places, defaults)
					if (player.currentLocation.settings.isLocked) {
						println(player.currentLocation.messages.successEntryGranted)
					}
					player.currentLocation = unlockLocation(player.currentLocation, player.pockets)
					if (player.currentLocation.leaveUnlocked) {
						println(player.currentLocation.messages.unlock)
					}
					println(messages.moveMessage + placeName)
				} else {
					println(place.messages.locked)
				}
			} else if (place === player.currentLocation) {
				println(messages.moveRedundancy + place.name)
			} else {
				println(messages.moveError)
			}
		} else {
			println(messages.moveError)
		}

		//take items
	} else if (input.indexOf(commands.gainItem) > -1) {

		item = trimInput(input, commands.gainItem)
		if (item in player.currentLocation.objects) {
			player.currentLocation.objects = hashRemove(item, player.currentLocation.objects)
			player.pockets = hashAdd(item, player.pockets)
			println(messages.pickUpSuccess + addArticle(item))
		} else {
			println(messages.pickUpError + addArticle(item))
		}

		//drop items
	} else if (input.indexOf(commands.loseItem) > -1) {
		item = trimInput(input, commands.loseItem)
		if (item in player.pockets) {
			player.pockets = hashRemove(item, player.pockets)
			println(messages.dropSuccess + addArticle(item))
			if (player.currentLocation.exchanges[item]) {
				player.pockets = hashAdd(player.currentLocation.exchanges[item], player.pockets)
				println(messages.exchangeSuccess + addArticle(player.currentLocation.exchanges[item]))
			} else {
				player.currentLocation.objects = hashAdd(item, player.currentLocation.objects)
			}

		} else {
			println(messages.dropError + addArticle(item))
		}

		//take inventory
	} else if (input.indexOf(commands.takeInventory) > -1) {
		if (player.pockets != {}) {
			println(hashList(player.pockets, messages.inventoryError))
		}

	} else if (input.indexOf(commands.perceiveItems) > -1) {
		println(hashList(player.currentLocation.objects))

	} else {
		if (input.length > 0) {
			println(messages.commandInvalid)
		}
	}
	Object.assign(data, {
		player,
		places
	})
	return data
}

$(document)
	.ready(function() {

		let data = {}
		let inputHistory = new Array()
		let numInputs = 0
		let selectInput = 0
		let fileExt = ".json"
		let files = []
		let playing = false

		lineNum(9)
		println("please enter the name of adventure to read, or type 'upload'")

		$.ajax({
			//This will retrieve the contents of the folder if the folder is configured as 'browsable'
			url: './roms/',
			success: function(data) {
				//List all xml file names in the page
				$(data).find('a:contains(' + fileExt + ')').each(function() {
					let filename = this.href.replace(window.location, "").replace("http:///", "");
					line()
					files.push(filename.replace(".json", ""))
				});

				for (var i in files) {
					line()
					println("- " + files[i])
				}
			}
		});

		$("form")
			.submit(function() {
				let input = $('#command_line')
					.val()
				input = input.trim();

				inputHistory.push(input)
				numInputs += 1
				selectInput = numInputs

				if (playing) {
					data = processInput(input, data)
				} else {
					let path = ""
					if (files.includes(input)) {
						path = "roms/" + input + ".json"
						$.getJSON(path, function(json) {
							data = json
							data = setup(data)
						})
					} else if (input.indexOf("upload") > -1) {
						$("#fileInput").change(function() {
							let fileUpload = document.getElementById("fileInput")
							if (typeof(FileReader) != "undefined") {
								var reader = new FileReader()
								reader.onload = function(e) {

									data = JSON.parse(e.target.result)
									data = setup(data)
								}
								reader.readAsText(fileUpload.files[0])
							} else {
								alert("This browser does not support HTML5.")
							}
						})
						$("#fileInput").trigger('click')

					}
					playing = true;

				}

				$("html, body")
					.animate({
						scrollTop: $(document)
							.height()
					}, 500)
				line()
				$("#command_line")
					.val("")
			})

		$(document)
			.on("keyup", function(e) {
				let code = e.which
				if (code == 38) { //up
					if (selectInput > 0) {
						selectInput--
						//alert(inputHistory[selectInput])
						$('#command_line')
							.val(inputHistory[selectInput])
					}
				} else if (code == 40) { //down

					if (selectInput < numInputs) {
						selectInput++
						$('#command_line')
							.val(inputHistory[selectInput])
					} else if (selectInput === numInputs) {
						$('#command_line')
							.val("")
					}
				}
			})

	})
