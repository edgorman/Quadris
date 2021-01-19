extends Node2D

var grid
var type
var size
var scale_
var screen_offset
var start
var offset
var coords

func init(z, s, o):
	size = z
	scale_ = s
	screen_offset = o
	set_scale(Vector2(s, s))
	set_coords(start)

func get_type():
	return type
	
func get_coords():
	return coords

func set_coords(value):
	coords = value
	set_position(
		Vector2(
			((coords[0] + offset[0]) * size * scale_),
			((coords[1] + offset[1]) * size * scale_) + screen_offset
		)
	)

func get_layout():
	match int(get_node(".").rotation_degrees):
		90:
			return grid[1]
		180:
			return grid[2]
		270:
			return grid[3]
		_:
			return grid[0]

func get_blocks():
	var blocks = []
	var layout = get_layout()
	
	for y in range(4):
		for x in range(4):
			if layout[y][x] == 1:
				blocks.append([x, y])
	
	return blocks
