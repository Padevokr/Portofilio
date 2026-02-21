from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path


HOST = "127.0.0.1"
PORT = 8000
ROOT_DIR = Path(__file__).resolve().parent


def main() -> None:
    # Serve project files from the folder where app.py is located.
    handler = lambda *args, **kwargs: SimpleHTTPRequestHandler(  # noqa: E731
        *args, directory=str(ROOT_DIR), **kwargs
    )
    server = ThreadingHTTPServer((HOST, PORT), handler)
    print(f"Portfolio is running on http://{HOST}:{PORT}")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
