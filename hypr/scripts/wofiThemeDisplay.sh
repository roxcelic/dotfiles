options=$(echo "$1" | sed 's/,/\n/')
CHOICE=$(echo -e "$options" | wofi -n --dmenu --prompt "Select a theme:")

if [ -n "$CHOICE" ]; then
  echo "$CHOICE"
fi