extends Area2D

signal rotate_block(degree)
signal move_block(direction)

export(float, 16, 128) var MIN_X_DRAG_DISTANCE = 32
export(float, 16, 128) var MIN_Y_DRAG_DISTANCE = 64
onready var touch_hold = false
onready var start_pos = Vector2()

func _on_Controls_input_event(_viewport, event, _shape_idx):
	# If user touches screen 
	if event is InputEventScreenTouch and not event.pressed:
		# If user is finishing their drag
		if touch_hold:
			touch_hold = false
		# Else user has touched screen
		else:
			emit_signal("rotate_block", 90)
	# Else user drags screen
	elif event is InputEventScreenDrag:
		# If user had not been dragging
		if not touch_hold:
			start_pos = event.position
		touch_hold = true
		
		# If x exceeds threshold
		if abs(start_pos.x - event.position.x) >= MIN_X_DRAG_DISTANCE:
			emit_signal(
				"move_block", 
				Vector2(
					-sign(start_pos.x - event.position.x),
					0
				)
			)
			start_pos.x = event.position.x
		# If y exceeds threshold
		if abs(start_pos.y - event.position.y) >= MIN_Y_DRAG_DISTANCE:
			emit_signal(
				"move_block", 
				Vector2(
					0,
					sign(start_pos.y - event.position.y)
				)
			)
			start_pos.y = event.position.y
