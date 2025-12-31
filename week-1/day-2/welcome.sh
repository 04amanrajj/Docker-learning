#!/bin/bash
clear
echo -e "\033[1;36m"
echo "  _    _ ____  _    _ _   _ _______ _    _ "
echo " | |  | |  _ \| |  | | \ | |__   __| |  | |"
echo " | |  | | |_) | |  | |  \| |  | |  | |  | |"
echo " | |  | |  _ <| |  | | . \` |  | |  | |  | |"
echo " | |__| | |_) | |__| | |\  |  | |  | |__| |"
echo "  \____/|____/ \____/|_| \_|  |_|   \____/ "
echo "                                           "
echo "       🐳 UBUNTU CONTAINER SANDBOX 🐳      "
echo -e "\033[0m"
echo -e "\033[1;32m🚀 Your Ubuntu container is running successfully!\033[0m"
echo -e "\033[1;34m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
echo -e "🐳 Container Hostname  : \033[1;33m$(hostname)\033[0m"
echo -e "📅 Container Boot Time : $(date)"
echo -e "📦 OS Distribution     : \033[1;35mUbuntu 24.04 LTS (Noble Numbat)\033[0m"
echo -e "🧠 Available Memory    : \033[1;36m$(free -h | grep Mem | awk '{print $7}') free / $(free -h | grep Mem | awk '{print $2}') total\033[0m"
echo -e "\033[1;34m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
echo -e "\033[1;36mTry executing these commands inside this container:\033[0m"
echo -e "  1. \033[1;32mapt-get update\033[0m                 - Update package lists"
echo -e "  2. \033[1;32mapt-get install -y neofetch\033[0m    - Install a system info tool"
echo -e "  3. \033[1;32mneofetch\033[0m                       - View detailed container stats"
echo -e "  4. \033[1;32mtop\033[0m                            - Check active system processes"
echo -e "\033[1;34m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
echo -e "\033[1;33mKeeping container alive... Run 'docker stop' from host to exit.\033[0m"

# Keep the container running
tail -f /dev/null
