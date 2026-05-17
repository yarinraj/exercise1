import sys
import socket

def main():
    # Reading arguments from the command line
    if len(sys.argv) < 3:
        sys.exit(1)

    server_ip = sys.argv[1]
    server_port = int(sys.argv[2])

    # Creating a TCP socket 
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    try:
        client_socket.connect((server_ip, server_port))
    except Exception:
        sys.exit(1)

    try:
        while True:
            # Reading a command from the user in the console
            try:
                command = input()
            except EOFError:
                break
            
            if not command.strip():
                continue
                
            # Sendin the command to the server with "\n"
            client_socket.sendall((command + "\n").encode('utf-8'))
            
            # Reading the response from the server until reading "\n" (which is the end of the output)
            response = ""
            while True:
                chunk = client_socket.recv(1024).decode('utf-8')
                if not chunk:
                    return
                response += chunk
                if response.endswith("\n"):
                    break
            
            # Printing the output from the server 
            print(response.rstrip("\n"))
            
    except KeyboardInterrupt:
        pass
    finally:
        client_socket.close()

if __name__ == "__main__":
    main()