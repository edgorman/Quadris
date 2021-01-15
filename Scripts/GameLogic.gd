extends Node2D

# Scene variables
onready var blocks_parent = get_node("Blocks")

# Global variables
var is_alive
var score
var level
var next_block


# Function executed when scene enters tree
func _ready():
	# Store game state in file type
	var game_state = File.new()
	
	# If game state does not exist
	if not game_state.file_exists("user://gamestate.save"):
		is_alive = true
		score = 0
		level = 1
		next_block = null
		return
	
	# Load game state
	game_state.open("user://gamestate.save", File.READ)
	
	# Update global variable information
	var game_data = parse_json(game_state.get_line())
	is_alive = game_data["is_alive"]
	score = game_data["score"]
	level = game_data["level"]
	next_block = game_data["next_block"]
	
	# Update placed blocks with remaining information
	while game_state.get_position() < game_state.get_len():
		# Parse next line
		var block_data = parse_json(game_state.get_line())
		
		# Update block params
		var block = load(block_data["filename"]).instance()
		block.set_position(block_data["position"])
		block.set_rotation(block_data["rotation"])
		block.set_is_alive(block_data["is_alive"])
		
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
			"is_alive": is_alive,
			"score": score,
			"level": level,
			"next_block": next_block
		}
	))
	
	# Save each block in block parent
	for block in blocks_parent.get_children():
		game_state.store_line(to_json(
			{
				"filename": block.filename,
				"position": block.get_position(),
				"rotation": block.get_rotation(),
				"is_alive": block.get_is_alive()
			}
		))
		
	# Close game state file
	game_state.close()

# Move block down by a single unit
func _on_Timer_timeout():
	var blocks = get_node("Blocks")
	print(blocks.get_child_count())


# Move block in the direction passed
func _on_Controls_move_block(direction):
	print("move" + String(direction[0]) + "," + String(direction[1]))


# Rotate block in the angle passed
func _on_Controls_rotate_block(degree):
	print("rotate " + String(degree))
