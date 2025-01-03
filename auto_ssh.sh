#!/bin/bash

# Help function
show_help() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  -i, --identity <file>    SSH identity file path"
    echo "  -p, --passphrase <pass>  SSH key passphrase"
    echo "  -u, --user <username>    SSH username"
    echo "  -h, --host <hostname>    Server hostname/IP"
    echo "  -c, --command <cmd>      Optional: Command to execute"
    echo "  --help                   Show this help message"
    exit 1
}

# Initialize variables
IDENTITY_FILE=""
PASSPHRASE=""
SERVER_USER=""
SERVER_HOST=""
REMOTE_COMMAND=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -i|--identity)
            IDENTITY_FILE="$2"
            shift 2
            ;;
        -p|--passphrase)
            PASSPHRASE="$2"
            shift 2
            ;;
        -u|--user)
            SERVER_USER="$2"
            shift 2
            ;;
        -h|--host)
            SERVER_HOST="$2"
            shift 2
            ;;
        -c|--command)
            REMOTE_COMMAND="$2"
            shift 2
            ;;
        --help)
            show_help
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            ;;
    esac
done

# Validate required arguments
if [ -z "$IDENTITY_FILE" ] || [ -z "$PASSPHRASE" ] || [ -z "$SERVER_USER" ] || [ -z "$SERVER_HOST" ]; then
    echo "Error: Missing required arguments"
    show_help
fi

# Check if the identity file exists
if [ ! -f "$IDENTITY_FILE" ]; then
    echo "Error: Identity file not found: $IDENTITY_FILE"
    exit 1
fi

# Start SSH agent
eval $(ssh-agent -s)

# Add the SSH key with passphrase
expect << EOF
spawn ssh-add $IDENTITY_FILE
expect "Enter passphrase"
send "$PASSPHRASE\r"
expect eof
EOF

# Connect to the server and execute command if provided
if [ -n "$REMOTE_COMMAND" ]; then
    ssh -o StrictHostKeyChecking=no -i "$IDENTITY_FILE" "${SERVER_USER}@${SERVER_HOST}" "$REMOTE_COMMAND"
else
    ssh -o StrictHostKeyChecking=no -i "$IDENTITY_FILE" "${SERVER_USER}@${SERVER_HOST}"
fi

# Clean up: kill SSH agent
ssh-agent -k
