#!/bin/bash

# OLX Classifieds Deployment Script
# Usage: ./scripts/deploy.sh [environment] [service]
# Example: ./scripts/deploy.sh production all

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-development}
SERVICE=${2:-all}
PROJECT_NAME="olx-classifieds"

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_success "Docker and Docker Compose are available"
}

# Check environment variables
check_env_vars() {
    local env_file=".env.${ENVIRONMENT}"
    
    if [[ ! -f "$env_file" ]]; then
        print_warning "Environment file $env_file not found. Using default values."
        return
    fi

    print_success "Environment file $env_file found"
    
    # Load environment variables
    export $(grep -v '^#' "$env_file" | xargs)
}

# Build Docker images
build_images() {
    print_status "Building Docker images for $ENVIRONMENT environment..."
    
    case $SERVICE in
        "all")
            docker-compose -f docker-compose.yml -f docker-compose.${ENVIRONMENT}.yml build
            ;;
        "backend")
            docker-compose -f docker-compose.yml -f docker-compose.${ENVIRONMENT}.yml build backend
            ;;
        "frontend")
            docker-compose -f docker-compose.yml -f docker-compose.${ENVIRONMENT}.yml build frontend
            ;;
        "admin")
            docker-compose -f docker-compose.yml -f docker-compose.${ENVIRONMENT}.yml build admin
            ;;
        *)
            print_error "Unknown service: $SERVICE"
            exit 1
            ;;
    esac
    
    print_success "Docker images built successfully"
}

# Start services
start_services() {
    print_status "Starting services..."
    
    case $SERVICE in
        "all")
            docker-compose -f docker-compose.yml -f docker-compose.${ENVIRONMENT}.yml up -d
            ;;
        *)
            docker-compose -f docker-compose.yml -f docker-compose.${ENVIRONMENT}.yml up -d $SERVICE
            ;;
    esac
    
    print_success "Services started successfully"
}

# Stop services
stop_services() {
    print_status "Stopping services..."
    
    docker-compose -f docker-compose.yml -f docker-compose.${ENVIRONMENT}.yml down
    
    print_success "Services stopped successfully"
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    # Wait for services to start
    sleep 10
    
    # Check backend health
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        print_success "Backend service is healthy"
    else
        print_error "Backend service is not responding"
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend service is healthy"
    else
        print_error "Frontend service is not responding"
    fi
    
    # Check admin panel
    if curl -f http://localhost:3001 > /dev/null 2>&1; then
        print_success "Admin panel is healthy"
    else
        print_error "Admin panel is not responding"
    fi
}

# Database migration and seeding
setup_database() {
    print_status "Setting up database..."
    
    # Wait for MongoDB to be ready
    print_status "Waiting for MongoDB to be ready..."
    timeout=60
    while ! docker-compose exec mongodb mongo --eval "print('MongoDB is ready')" > /dev/null 2>&1; do
        sleep 1
        timeout=$((timeout - 1))
        if [ $timeout -le 0 ]; then
            print_error "MongoDB failed to start within 60 seconds"
            exit 1
        fi
    done
    
    print_success "MongoDB is ready"
    
    # Run database migrations if needed
    if [ -f "backend/scripts/migrate.js" ]; then
        print_status "Running database migrations..."
        docker-compose exec backend node scripts/migrate.js
        print_success "Database migrations completed"
    fi
    
    # Seed initial data
    if [ -f "backend/scripts/seed.js" ]; then
        print_status "Seeding initial data..."
        docker-compose exec backend node scripts/seed.js
        print_success "Database seeding completed"
    fi
}

# Backup database
backup_database() {
    print_status "Creating database backup..."
    
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup MongoDB
    docker-compose exec mongodb mongodump --out /backup
    docker cp "$(docker-compose ps -q mongodb)":/backup "$BACKUP_DIR/mongodb"
    
    print_success "Database backup created in $BACKUP_DIR"
}

# View logs
view_logs() {
    local service=${1:-all}
    
    if [ "$service" = "all" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$service"
    fi
}

# Clean up
cleanup() {
    print_status "Cleaning up..."
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes (be careful with this in production)
    if [ "$ENVIRONMENT" != "production" ]; then
        docker volume prune -f
    fi
    
    print_success "Cleanup completed"
}

# Main deployment function
deploy() {
    print_status "Starting deployment for $ENVIRONMENT environment"
    print_status "Service: $SERVICE"
    
    check_docker
    check_env_vars
    
    # Stop existing services
    stop_services
    
    # Build new images
    build_images
    
    # Start services
    start_services
    
    # Setup database (only for full deployment)
    if [ "$SERVICE" = "all" ] || [ "$SERVICE" = "backend" ]; then
        setup_database
    fi
    
    # Check health
    check_health
    
    print_success "Deployment completed successfully!"
    print_status "Access the application at:"
    print_status "  Frontend: http://localhost:3000"
    print_status "  Admin Panel: http://localhost:3001"
    print_status "  API: http://localhost:5000"
}

# Print usage information
usage() {
    echo "Usage: $0 [COMMAND] [ENVIRONMENT] [SERVICE]"
    echo ""
    echo "Commands:"
    echo "  deploy     Deploy the application (default)"
    echo "  start      Start services"
    echo "  stop       Stop services"
    echo "  restart    Restart services"
    echo "  logs       View service logs"
    echo "  backup     Create database backup"
    echo "  cleanup    Clean up unused Docker resources"
    echo ""
    echo "Environments:"
    echo "  development (default)"
    echo "  staging"
    echo "  production"
    echo ""
    echo "Services:"
    echo "  all (default)"
    echo "  backend"
    echo "  frontend"
    echo "  admin"
    echo ""
    echo "Examples:"
    echo "  $0 deploy production all"
    echo "  $0 start development backend"
    echo "  $0 logs production frontend"
    echo "  $0 backup production"
}

# Parse command line arguments
COMMAND=${1:-deploy}

case $COMMAND in
    "deploy")
        deploy
        ;;
    "start")
        check_docker
        start_services
        ;;
    "stop")
        check_docker
        stop_services
        ;;
    "restart")
        check_docker
        stop_services
        start_services
        ;;
    "logs")
        check_docker
        view_logs $SERVICE
        ;;
    "backup")
        check_docker
        backup_database
        ;;
    "cleanup")
        check_docker
        cleanup
        ;;
    "help"|"-h"|"--help")
        usage
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        usage
        exit 1
        ;;
esac



