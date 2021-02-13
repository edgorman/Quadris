extends Node2D

signal update_score(value)
signal update_level(value)
signal update_block(value)

# Debug variables
onready var CLEAN_LOAD = true
onready var ALLOW_UP_DIRECTION = false

# Constant variables
onready var SCREEN_SIZE_X = float(448)
onready var SCREEN_SIZE_Y = float(1024)
onready var BLOCK_SIZE = float(32)
onready var SCREEN_COLS = float(10)
onready var BLOCK_SCALE = (SCREEN_SIZE_X / SCREEN_COLS) / BLOCK_SIZE
onready var SCREEN_ROWS = floor(SCREEN_SIZE_Y / (BLOCK_SIZE * BLOCK_SCALE))
onready var BLOCK_OFFSET = fmod(SCREEN_SIZE_Y, BLOCK_SIZE * BLOCK_SCALE)
var NO_DIRECTION = Vector2(0, 0)
var UP_DIRECTION = Vector2(0, -1)
var RIGHT_DIRECTION = Vector2(1, 0)
var DOWN_DIRECTION = Vector2(0, 1)
var LEFT_DIRECTION = Vector2(-1, 0)

# Scene variables
onready var random_generator = RandomNumberGenerator.new()
onready var single_block = load("res://Objects/Game/Block.tscn")
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

# Function executed when scene enters tree
func _ready():
	# Store game state in file type
	var game_state = File.new()
	
	# If game state does not exist
	if not game_state.file_exists("user://gamestate.save") or CLEAN_LOAD:
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
			block.set_pos(block_data["position"])
			block.set_rot(block_data["rotation"])
			
			# Add block to scene
			add_child(block)
	
	# Update score and label
	emit_signal("update_score", score)
	emit_signal("update_level", level)
	emit_signal("update_block", "res://Objects/Game/" + next_block.get_type() + ".tscn")
	
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
	for block in get_children():
		game_state.store_line(to_json(
			{
				"type": block.get_type(),
				"pos": block.get_pos(),
				"rot": block.get_rot()
			}
		))
		
	# Close game state file
	game_state.close()

# Move block down by a single unit
func _on_Timer_timeout():
	# If block can still move down
	if can_move_to(DOWN_DIRECTION):
		curr_block.set_pos(
			Vector2(
				curr_block.get_x() + DOWN_DIRECTION[0], 
				curr_block.get_y() + DOWN_DIRECTION[1]
			)
		)
	# Else block hit bottom
	else:
		# Remove completed rows
		var rows_removed = 0
		for idx in range(SCREEN_ROWS - 1, -1, -1):
			# Check if row at idx is complete:
			while is_row_complete(idx):
				rows_removed += 1

				for block in get_children():
					# Check if block should be removed
					if block.get_y() == idx:
						remove_child(block)
					# Check if block is above row
					elif block.get_y() < idx:
						block.set_pos(
							Vector2(
								block.get_x() + DOWN_DIRECTION[0], 
								block.get_y() + DOWN_DIRECTION[1]
							)
						)
		
		# Update player score
		score += rows_removed * 10
		if rows_removed == 4:
			score += 60
		
		# Add next block to scene
		add_next_block()
		
		# Update score, label and next block
		emit_signal("update_score", score)
		emit_signal("update_level", level)
		emit_signal("update_block", "res://Objects/Game/" + next_block.get_type() + ".tscn")
		
		# Check if player has died
		if not can_move_to():
			print("[INFO]: Block cannot be placed, game has ended.")
			alive = false
			get_parent().get_node("Timer").stop()

# Move block in the direction passed
func _on_Controls_move_block(direction):
	# Ignore upwards movement
	if not ALLOW_UP_DIRECTION and direction == UP_DIRECTION:
		return
	
	# Drop down for downward movement
	if direction == DOWN_DIRECTION:
		# While current can move in direction
		while can_move_to(direction):
			curr_block.set_pos(
				Vector2(
					curr_block.get_x() + DOWN_DIRECTION[0],
					curr_block.get_y() + DOWN_DIRECTION[1]
				)
			)
		# Place block
		_on_Timer_timeout()
	else:
		# Check if current can move in direction
		if can_move_to(direction):
			curr_block.set_pos(
				Vector2(
					curr_block.get_x() + direction[0],
					curr_block.get_y() + direction[1]
				)
			)

# Rotate block in the angle passed
func _on_Controls_rotate_block():
	match int(curr_block.get_rot()):
		90:
			if can_move_to(NO_DIRECTION, 180):
				curr_block.set_rot(180)
		180:
			if can_move_to(NO_DIRECTION, 270):
				curr_block.set_rot(270)
		270:
			if can_move_to(NO_DIRECTION, 360):
				curr_block.set_rot(360)
		_:
			if can_move_to(NO_DIRECTION, 90):
				curr_block.set_rot(90)

# Return an instance of a random block
func get_random_block():
	random_generator.randomize()
	var keys = available_blocks.keys()
	var rand = random_generator.randi_range(0, len(keys)-1)
	var next = available_blocks[keys[rand]].instance()
	next.init(BLOCK_SIZE, BLOCK_SCALE, BLOCK_OFFSET)
	return next

# Add a new block to the scene
func add_next_block():
	# If current block exists
	if not curr_block == null:
		# Place inner blocks in scene
		for inner in curr_block.get_blocks():
			var block = single_block.instance()
			block.init(BLOCK_SIZE, BLOCK_SCALE, BLOCK_OFFSET, curr_block.get_color())
			block.set_pos(
				Vector2(
					inner[0] - 1, 
					inner[1] - 1
				)
			)
			add_child(block)
		
		# Remove block from scene
		remove_child(curr_block)

	# Add block to scene
	curr_block = next_block
	add_child(curr_block)
	
	# Generate next block
	next_block = get_random_block()

# Return whether can move in direction
func can_move_to(direction := Vector2(0, 0), rotation := curr_block.get_rot()):
	# Calculate moved pos of inner blocks
	var moved_blocks = []
	for inner in curr_block.get_blocks(rotation):
		moved_blocks.append([
			inner[0] + direction[0],
			inner[1] + direction[1]
		])
	
	# Check if moved blocks out of bounds
	for block in moved_blocks:
		if block[1] >= SCREEN_ROWS:
			return false
		if block[0] < 0:
			return false
		if block[0] >= SCREEN_COLS:
			return false
	
	# Check if overlaps with other blocks
	for block in get_children():
		# Ignore current block
		if block == curr_block:
			continue
		
		# Check if inner blocks in moved blocks
		for inner in block.get_blocks():
			if inner in moved_blocks:
				return false
	
	# Can move to that position and rotation
	return true

func is_row_complete(idx):
	var cols = []
	
	# For each block
	for block in get_children():
		# Check if inner block is at row index
		for inner in block.get_blocks():
			if inner[1] == idx:
				cols.append(inner[0])
	
	# Return true if row complete
	return len(cols) == SCREEN_COLS
