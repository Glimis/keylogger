import sys
from pynput import keyboard


def on_press(key):
    if hasattr(key, 'char'):
        print(key.char, end='')
    else:
        print(key, end='')
    sys.stdout.flush()


with keyboard.Listener(
        on_press=on_press) as listener:
    listener.join()
