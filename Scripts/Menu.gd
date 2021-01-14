extends Node2D

func _ready():
	pass # Replace with function body.

func _on_StartGame_button_up():
	# Switch to Game scene
	get_tree().change_scene("res://Scenes/Game.tscn")

func _on_Settings_button_down():
	# Switch to Settings scene
	get_tree().change_scene("res://Scenes/Settings.tscn")
