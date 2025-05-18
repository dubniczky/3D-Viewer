port ?= 8000

# Start development server
dev::
	open -a "Firefox Developer Edition" http://localhost:$(port)
	python3 -m http.server --bind localhost $(port)