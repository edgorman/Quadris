extends Control

export(float, 16, 128) var MIN_DRAG_DISTANCE = 32
var touch_hold = false
var start_pos = Vector2()

func _input(event):
	# If user touches screen 
	if event is InputEventScreenTouch and not event.pressed:
		# If user is finishing their drag
		if touch_hold:
			print("end drag")
			touch_hold = false
		# Else user has touched screen
		else:
			print("touch")
	# Else user drags screen
	elif event is InputEventScreenDrag:
		# If user had not been dragging
		if not touch_hold:
			print("start drag")
			start_pos = event.position
		
		touch_hold = true
		
		# If x exceeds threshold
		if abs(start_pos.x - event.position.x) >= MIN_DRAG_DISTANCE:
			print("x ", -sign(start_pos.x - event.position.x))
			start_pos.x = event.position.x
		# If y exceeds threshold
		if abs(start_pos.y - event.position.y) >= MIN_DRAG_DISTANCE:
			print("y ", sign(start_pos.y - event.position.y))
			start_pos.y = event.position.y
		
