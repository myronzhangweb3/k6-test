# Use the official k6 image as the base image
FROM grafana/k6:0.54.0

# Set the working directory inside the container
WORKDIR /app

# Copy the k6 script into the container
COPY . .