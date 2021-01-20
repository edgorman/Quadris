extends Node2D

# Constant variables
onready var SCREEN_SIZE_X = float(448)
onready var SCREEN_SIZE_Y = float(1024)
onready var BLOCK_SIZE = float(32)
onready var SCREEN_COLS = 10
onready var BLOCK_SCALE = (SCREEN_SIZE_X / float(SCREEN_COLS)) / BLOCK_SIZE
onready var SCREEN_ROWS = floor(SCREEN_SIZE_Y / (BLOCK_SIZE * BLOCK_SCALE))
onready var BLOCK_OFFSET = fmod(SCREEN_SIZE_Y, BLOCK_SIZE * BLOCK_SCALE)
var UP_DIRECTION = Vector2(0, -1)
var RIGHT_DIRECTION = Vector2(1, 0)
var DOWN_DIRECTION = Vector2(0, 1)
var LEFT_DIRECTION = Vector2(-1, 0)

# Scene variables
onready var random_generator = RandomNumberGenerator.new()
onready var blocks_parent = $Blocks
onready var available_blocks = {
	"I-Block": load("res://Objects/Game/I-Block.tscn"),
	"L-Block": load("res://Objects/Game/L-Block.tscn"),
	"J-Block": load("res://Objects/Game/J-Block.tscn"),
	"O-Block": load("res://Objects/Game/O-Block.tscn"),
	"S-Block": load("res://Objects/Game/S-Block.tscn"),
	"Z-Block": load("res://Objects/Game/Z-Block.tscn"),
	"T-Block": load("res://Objects/Game/T-Block.tscn")
}

# Global variables
var alive
var score
var level
var speed
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
		speed = 1
		curr_block = null
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
		speed = game_data["speed"]
		curr_block = game_data["curr_block"]
		next_block = game_data["next_block"]
		
		# Update placed blocks with remaining information
		while game_state.get_position() < game_state.get_len():
			# Parse next line
			var block_data = parse_json(game_state.get_line())
			
			# Update block params
			var block = available_blocks[block_data["type"]].instance()
			block.init(BLOCK_SIZE, BLOCK_SCALE, BLOCK_OFFSET)
			block.set_coords(block_data["coords"])
			block.set_rotation_degrees(block_data["rotation"])
			
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
			"speed": speed,
			"curr_block": curr_block,
			"next_block": next_block
		}
	))
	
	# Save each block in block parent
	for block in blocks_parent.get_children():
		game_state.store_line(to_json(
			{
				"type": block.get_type(),
				"coords": block.get_coords(),
				"rotation": block.get_rotation_degrees()
			}
		))
		
	# Close game state file
	game_state.close()

# Move block down by a single unit
func _on_Timer_timeout():
	# If block can still move down
	if can_move_to(DOWN_DIRECTION):
		curr_block.set_coords(
			Vector2(
				curr_block.get_coords()[0] + DOWN_DIRECTION[0], 
				curr_block.get_coords()[1] + DOWN_DIRECTION[1]
			)
		)
	# Else block is placed
	else:
		add_next_block()
		
		# Check if player still alive
		if can_move_to():
			score += 10
			level = score % 100
		# Else player game ended
		else:
			print("[INFO]: Block cannot be placed, game has ended.")
			alive = false
			$Timer.stop()

# Move block in the direction passed
func _on_Controls_move_block(direction):
	# Ignore upwards movement
	if direction == UP_DIRECTION:
		return
	
	# Drop down for downward movement
	if direction == DOWN_DIRECTION:
		# While current can move in direction
		while can_move_to(direction):
			var curr_coords = curr_block.get_coords()
			curr_block.set_coords(
				Vector2(
					curr_coords[0] + direction[0],
					curr_coords[1] + direction[1]
				)
			)
	else:
		# Check if current can move in direction
		if can_move_to(direction):
			var curr_coords = curr_block.get_coords()
			curr_block.set_coords(
				Vector2(
					curr_coords[0] + direction[0],
					curr_coords[1] + direction[1]
				)
			)

# Rotate block in the angle passed
func _on_Controls_rotate_block():
	match int(curr_block.get_rotation_degrees()):
		90:
			if can_move_to(Vector2(0, 0), 180):
				curr_block.set_rotation_degrees(180)
		180:
			if can_move_to(Vector2(0, 0), 270):
				curr_block.set_rotation_degrees(270)
		270:
			if can_move_to(Vector2(0, 0), 360):
				curr_block.set_rotation_degrees(360)
		_:
			if can_move_to(Vector2(0, 0), 90):
				curr_block.set_rotation_degrees(90)

# Return an instance of a random block
func get_random_block():
	var keys = available_blocks.keys()
	random_generator.randomize()
	var numb = random_generator.randi_range(0, len(keys)-1)
	var next = available_blocks[keys[numb]].instance()
	next.init(BLOCK_SIZE, BLOCK_SCALE, BLOCK_OFFSET)
	return next

# Add a new block to the scene
func add_next_block():
	# Add block to scene
	curr_block = next_block
	blocks_parent.add_child(curr_block)
	
	# Generate next block
	next_block = get_random_block()

# Return whether can move in direction
func can_move_to(direction := Vector2(0, 0), rotation := int(curr_block.rotation_degrees)):
	# Calculate new position of block
	var curr_coords = curr_block.get_coords()
	var curr_blocks = curr_block.get_blocks(rotation)
	var new_blocks = []
	
	for n in range(len(curr_blocks)):
		new_blocks.append([
			curr_blocks[n][0] + direction[0] + curr_coords[0],
			curr_blocks[n][1] + direction[1] + curr_coords[1]
		])
	
	# Check if out of bounds
	for n in range(len(new_blocks)):
		var x = new_blocks[n][0]
		var y = new_blocks[n][1]
		# Check if above screen
		# if y < 0:
		# 	return false
		# Check if below screen
		if y >= SCREEN_ROWS:
			return false
		# Check if before screen
		if x < 0:
			return false
		# check if after screen
		if x >= SCREEN_COLS:
			return false
	
	# Check if overlaps with other blocks
	for other_block in blocks_parent.get_children():
		# Ignore current block
		if other_block == curr_block:
			continue
		
		var other_coords = other_block.get_coords()
		var other_blocks = other_block.get_blocks()
		
		# For each block in block
		for block in other_blocks:
			var x = block[0] + other_coords[0]
			var y = block[1] + other_coords[1]
			
			# Check if block in new blocks
			if [x, y] in new_blocks:
				return false
	
	return true
