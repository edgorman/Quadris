extends Node2D

var type setget , get_type
var alive = false setget set_alive, is_alive
var grid

func get_type():
	return type

func set_alive(value):
	alive = value

func is_alive():
	return alive

func get_layout():
	match get_node(".").rotation:
		90:
			return grid[1]
		180:
			return grid[2]
		270:
			return grid[3]
		_:
			return grid[0]
