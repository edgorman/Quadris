extends Node2D

func _ready():
	pass # Replace with function body.

func _on_Menu_button_down():
	# Switch to Menu scene
	get_tree().change_scene("res://Scenes/Menu.tscn")
