extends Node2D

var grid = [[[1, 1]], [[2, 1]], [[2, 2]], [[1, 2]]]
var type
var size
var scale_
var color
var pos_vec
var start_vec = Vector2(0, 0)
var offset_block
var offset_screen

func init(z, s, o, c := $ColorRect.get_frame_color()):
	size = z
	scale_ = s
	color = c
	$ColorRect.set_frame_color(color)
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

func get_start_x():
	return start_vec[0]

func get_start_y():
	return start_vec[1]

func get_color():
	return color

func get_rot():
	return int(get_node(".").rotation_degrees)

func get_blocks(rotation := get_rot()):
	var blocks = []
	match int(rotation):
		90:
			blocks = [] + grid[1]
		180:
			blocks = [] + grid[2]
		270:
			blocks = [] + grid[3]
		_:
			blocks = [] + grid[0]
	
	for n in range(len(blocks)):
		blocks[n] = [
			blocks[n][0] + get_x(),
			blocks[n][1] + get_y()
		]
	return blocks

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
