extends Node2D

export(float, 16, 128) var MIN_X_DRAG_DISTANCE = 32
onready var swipe_start = Vector2()
var next_block = null
var next_block_scale = 0.75
var next_block_x_offset = 64
var next_block_y_offset = 80

func _on_Menu_button_down():
	# Switch to Menu scene
	return get_tree().change_scene("res://Scenes/Menu.tscn")

func _on_MenuButtons_gui_input(event):
	if event is InputEventScreenTouch and event.pressed:
		swipe_start = event.position
	if event is InputEventScreenTouch and not event.pressed:
		_calculate_swipe(event.position)

func _calculate_swipe(swipe_end):
	var swipe = swipe_end - swipe_start
	if abs(swipe.x) > MIN_X_DRAG_DISTANCE:
		if swipe.x > 0:
			swipe_start = swipe_end
		else:
			_on_Menu_button_down()

func _on_update_level(value):
	$Menu/Container/Level/Value.text = str(value)

func _on_update_score(value):
	$Menu/Container/Score/Value.text = str(value)

func _on_update_block(value):
	if next_block != null:
		$Menu/Container/Next.remove_child(next_block)
	next_block = load(value).instance()
	next_block.set_scale(Vector2(next_block_scale, next_block_scale))
	next_block.set_position(Vector2(next_block_x_offset, next_block_y_offset))
	$Menu/Container/Next.add_child(next_block)
