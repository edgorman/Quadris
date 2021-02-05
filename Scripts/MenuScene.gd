extends Node2D

export(float, 16, 128) var MIN_X_DRAG_DISTANCE = 32
onready var swipe_start = Vector2()

func _on_StartGame_button_down():
	# Switch to Game scene
	return get_tree().change_scene("res://Scenes/Game.tscn")

func _on_Settings_button_down():
	# Switch to Settings scene
	return get_tree().change_scene("res://Scenes/Settings.tscn")

func _on_MenuButtons_gui_input(event):
	if event is InputEventScreenTouch and event.pressed:
		swipe_start = event.position
	if event is InputEventScreenTouch and not event.pressed:
		_calculate_swipe(event.position)

func _calculate_swipe(swipe_end):
	var swipe = swipe_end - swipe_start
	if abs(swipe.x) > MIN_X_DRAG_DISTANCE:
		if swipe.x > 0:
			_on_StartGame_button_down()
		else:
			_on_Settings_button_down()



