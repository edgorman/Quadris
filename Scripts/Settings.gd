extends Node2D

func _on_Menu_button_down():
	# Switch to Menu scene
	return get_tree().change_scene("res://Scenes/Menu.tscn")
