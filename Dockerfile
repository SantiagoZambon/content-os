FROM python:3.12-slim

WORKDIR /app

# Deps primero para caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Código completo
COPY . .

# Compilar SASS al construir la imagen
RUN python -c "from src.build_assets import compile_sass; compile_sass()"

# Flask en modo producción, accesible desde la red
ENV FLASK_APP=src.app
EXPOSE 5000
CMD ["flask", "run", "--host", "0.0.0.0", "--port", "5000"]
