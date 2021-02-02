extends Node2D

var grid
var type
var size
var scale_
var pos_vec
var start_vec
var offset_block
var offset_screen

func init(z, s, o):
	size = z
	scale_ = s
	offset_screen = o
	offset_block = Vector2(2, 2)
	set_scale(Vector2(s, s))
	set_pos(start_vec)

func get_type():
	return type
	
func get_pos():
	return pos_vec

func get_x():
	return pos_vec[0]

func get_y():
	return pos_vec[1]

func get_rot():
	return int(get_node(".").rotation_degrees)

func get_blocks(rotation := get_rot()):
	match int(rotation):
		90:
			return grid[1]
		180:
			return grid[2]
		270:
			return grid[3]
		_:
			return grid[0]

func set_pos(v):
	pos_vec = v
	set_position(
		Vector2(
			((get_x() + offset_block[0]) * size * scale_),
			((get_y() + offset_block[1]) * size * scale_) + offset_screen
		)
	)

func set_rot(r):
	set_rotation_degrees(r)
