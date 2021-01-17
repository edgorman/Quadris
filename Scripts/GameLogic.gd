extends Node2D

# Constant variables
onready var SCREEN_SIZE_X = 488
onready var SCREEN_SIZE_Y = 1024
onready var BLOCK_SIZE_X = 32
onready var BLOCK_SIZE_Y = 32
onready var SCREEN_COLS = 10
onready var BLOCK_SCALE = float(SCREEN_SIZE_X / SCREEN_COLS) / BLOCK_SIZE_X
onready var SCREEN_ROWS = floor(SCREEN_SIZE_Y / (BLOCK_SIZE_Y * BLOCK_SCALE))
onready var BLOCK_OFFSET = fmod(SCREEN_SIZE_Y, BLOCK_SIZE_Y * BLOCK_SCALE)

# Scene variables
onready var blocks_parent = $Blocks
onready var available_blocks = {
	"L-Block": load("res://Objects/Game/L-Block.tscn")
}

# Global variables
var alive
var score
var level
var curr_block
var next_block

# Debug variables
onready var clean_load = true

# Function executed when scene enters tree
func _ready():
	# Store game state in file type
	var game_state = File.new()
	
	# If game state does not exist
	if not game_state.file_exists("user://gamestate.save") or clean_load:
		# Create new game
		print("[INFO]: Game state not found, generating new game.")
		
		# Update global variable information
		alive = true
		score = 0
		level = 1
		next_block = get_random_block()
		
		# Add first block to scene
		add_next_block()

	# Else game state exists
	else:
		# Load game state
		print("[SUCCESS]: Game state found, loading saved game.")
		game_state.open("user://gamestate.save", File.READ)
		
		# Update global variable information
		var game_data = parse_json(game_state.get_line())
		alive = game_data["alive"]
		score = game_data["score"]
		level = game_data["level"]
		next_block = game_data["next_block"]
		
		# Update placed blocks with remaining information
		while game_state.get_position() < game_state.get_len():
			# Parse next line
			var block_data = parse_json(game_state.get_line())
			
			# Update block params
			var block = available_blocks[block_data["type"]].instance()
			block.set_position(block_data["position"])
			block.set_rotation_degrees(block_data["rotation"])
			block.set_scale(Vector2(BLOCK_SCALE, BLOCK_SCALE))
			block.set_alive(block_data["alive"])
			
			# Add block to scene
			blocks_parent.add_child(block)
	
	# Close game state file
	game_state.close()


# Function executed when scene leaves tree
func _exit_tree():
	# Store game state in file
	var game_state = File.new()
	game_state.open("user://gamestate.save", File.WRITE)
	
	# Update global variable information
	game_state.store_line(to_json(
		{
			"alive": alive,
			"score": score,
			"level": level,
			"next_block": next_block
		}
	))
	
	# Save each block in block parent
	for block in blocks_parent.get_children():
		game_state.store_line(to_json(
			{
				"type": block.get_type(),
				"position": block.get_position(),
				"rotation": block.get_rotation_degrees(),
				"alive": block.is_alive()
			}
		))
		
	# Close game state file
	game_state.close()

# Move block down by a single unit
func _on_Timer_timeout():
	for block in blocks_parent.get_children():
		if block.is_alive():
			block.set_position(
				Vector2(
					block.get_position()[0],
					block.get_position()[1] + (BLOCK_SCALE * BLOCK_SIZE_Y)
				)
			)

# Move block in the direction passed
func _on_Controls_move_block(direction):
	print("move" + String(direction[0]) + "," + String(direction[1]))

# Rotate block in the angle passed
func _on_Controls_rotate_block():
	print(curr_block.get_rotation_degrees())
	match int(curr_block.get_rotation_degrees()):
		90:
			curr_block.set_rotation_degrees(180)
		180:
			curr_block.set_rotation_degrees(270)
		270:
			curr_block.set_rotation_degrees(360)
		_:
			curr_block.set_rotation_degrees(90)

# Return an instance of a random block
func get_random_block():
	var keys = available_blocks.keys()
	var rand = RandomNumberGenerator.new()
	var numb = rand.randi_range(0, len(keys)-1)
	return available_blocks[keys[numb]].instance()

# Add a new block to the scene
func add_next_block():
	next_block.set_position(Vector2(0, 0+BLOCK_OFFSET))
	next_block.set_rotation_degrees(0)
	next_block.set_scale(Vector2(BLOCK_SCALE, BLOCK_SCALE))
	next_block.set_alive(true)
	
	# Add block to scene
	curr_block = next_block
	blocks_parent.add_child(curr_block)
	
	# Generate next block
	next_block = get_random_block()
