#!/bin/bash

# OLX Classifieds - Quality Assurance Script
# This script performs comprehensive quality checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

SCORE=0
MAX_SCORE=0

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((SCORE++))
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${PURPLE}ℹ $1${NC}"
}

increment_max_score() {
    ((MAX_SCORE++))
}

# Check code quality
check_code_quality() {
    print_header "Code Quality Checks"
    
    # Backend code quality
    print_info "Checking backend code quality..."
    increment_max_score
    if [ -f "backend/package.json" ]; then
        cd backend
        if npm list eslint &>/dev/null; then
            if npm run lint &>/dev/null; then
                print_success "Backend ESLint passed"
            else
                print_error "Backend ESLint failed"
            fi
        else
            print_warning "ESLint not configured for backend"
        fi
        cd ..
    else
        print_error "Backend package.json not found"
    fi
    
    # Frontend code quality
    print_info "Checking frontend code quality..."
    increment_max_score
    if [ -f "frontend-web/package.json" ]; then
        cd frontend-web
        if npm list eslint &>/dev/null; then
            if npm run lint &>/dev/null; then
                print_success "Frontend ESLint passed"
            else
                print_error "Frontend ESLint failed"
            fi
        else
            print_warning "ESLint not configured for frontend"
        fi
        cd ..
    else
        print_error "Frontend package.json not found"
    fi
    
    # Mobile app code quality
    print_info "Checking mobile app code quality..."
    increment_max_score
    if [ -f "mobile-app/package.json" ]; then
        cd mobile-app
        if npm list eslint &>/dev/null; then
            if npm run lint &>/dev/null; then
                print_success "Mobile app ESLint passed"
            else
                print_error "Mobile app ESLint failed"
            fi
        else
            print_warning "ESLint not configured for mobile app"
        fi
        cd ..
    else
        print_error "Mobile app package.json not found"
    fi
    
    # Admin panel code quality
    print_info "Checking admin panel code quality..."
    increment_max_score
    if [ -f "admin-panel/package.json" ]; then
        cd admin-panel
        if npm list eslint &>/dev/null; then
            if npm run lint &>/dev/null; then
                print_success "Admin panel ESLint passed"
            else
                print_error "Admin panel ESLint failed"
            fi
        else
            print_warning "ESLint not configured for admin panel"
        fi
        cd ..
    else
        print_error "Admin panel package.json not found"
    fi
}

# Check TypeScript configuration
check_typescript() {
    print_header "TypeScript Configuration"
    
    # Check TypeScript configs
    increment_max_score
    if [ -f "frontend-web/tsconfig.json" ] && [ -f "mobile-app/tsconfig.json" ] && [ -f "admin-panel/tsconfig.json" ]; then
        print_success "TypeScript configurations present"
    else
        print_error "Missing TypeScript configurations"
    fi
    
    # Check type checking
    increment_max_score
    cd frontend-web
    if npm run type-check &>/dev/null; then
        print_success "Frontend TypeScript type checking passed"
    else
        print_error "Frontend TypeScript type checking failed"
    fi
    cd ..
    
    increment_max_score
    cd mobile-app
    if npm run type-check &>/dev/null; then
        print_success "Mobile app TypeScript type checking passed"
    else
        print_error "Mobile app TypeScript type checking failed"
    fi
    cd ..
    
    increment_max_score
    cd admin-panel
    if npm run type-check &>/dev/null; then
        print_success "Admin panel TypeScript type checking passed"
    else
        print_error "Admin panel TypeScript type checking failed"
    fi
    cd ..
}

# Check security
check_security() {
    print_header "Security Checks"
    
    # Check for known vulnerabilities
    print_info "Checking for known vulnerabilities..."
    
    increment_max_score
    cd backend
    if npm audit --audit-level=high &>/dev/null; then
        print_success "Backend: No high-severity vulnerabilities found"
    else
        print_error "Backend: High-severity vulnerabilities found"
    fi
    cd ..
    
    increment_max_score
    cd frontend-web
    if npm audit --audit-level=high &>/dev/null; then
        print_success "Frontend: No high-severity vulnerabilities found"
    else
        print_error "Frontend: High-severity vulnerabilities found"
    fi
    cd ..
    
    increment_max_score
    cd mobile-app
    if npm audit --audit-level=high &>/dev/null; then
        print_success "Mobile app: No high-severity vulnerabilities found"
    else
        print_error "Mobile app: High-severity vulnerabilities found"
    fi
    cd ..
    
    increment_max_score
    cd admin-panel
    if npm audit --audit-level=high &>/dev/null; then
        print_success "Admin panel: No high-severity vulnerabilities found"
    else
        print_error "Admin panel: High-severity vulnerabilities found"
    fi
    cd ..
    
    # Check for sensitive data in code
    print_info "Checking for sensitive data..."
    increment_max_score
    if ! grep -r "password.*=" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" . &>/dev/null; then
        print_success "No hardcoded passwords found"
    else
        print_error "Potential hardcoded passwords found"
    fi
    
    increment_max_score
    if ! grep -r "api.*key.*=" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" . &>/dev/null; then
        print_success "No hardcoded API keys found"
    else
        print_error "Potential hardcoded API keys found"
    fi
}

# Check documentation
check_documentation() {
    print_header "Documentation Checks"
    
    # Check for README files
    increment_max_score
    if [ -f "README.md" ]; then
        print_success "Main README.md exists"
    else
        print_error "Main README.md missing"
    fi
    
    increment_max_score
    if [ -f "README-DEPLOYMENT.md" ]; then
        print_success "Deployment documentation exists"
    else
        print_error "Deployment documentation missing"
    fi
    
    # Check for API documentation
    increment_max_score
    if [ -f "backend/API.md" ] || [ -d "backend/docs" ]; then
        print_success "API documentation exists"
    else
        print_warning "API documentation missing"
    fi
    
    # Check for component documentation
    increment_max_score
    if find . -name "*.md" -path "*/components/*" | head -1 &>/dev/null; then
        print_success "Component documentation found"
    else
        print_warning "Component documentation missing"
    fi
}

# Check project structure
check_project_structure() {
    print_header "Project Structure"
    
    # Check main directories
    increment_max_score
    if [ -d "backend" ] && [ -d "frontend-web" ] && [ -d "mobile-app" ] && [ -d "admin-panel" ]; then
        print_success "All main project directories exist"
    else
        print_error "Missing main project directories"
    fi
    
    # Check configuration files
    increment_max_score
    if [ -f "docker-compose.yml" ] && [ -f "env.example" ]; then
        print_success "Docker and environment configuration files exist"
    else
        print_error "Missing configuration files"
    fi
    
    # Check scripts directory
    increment_max_score
    if [ -d "scripts" ] && [ -f "scripts/deploy.sh" ]; then
        print_success "Deployment scripts exist"
    else
        print_error "Missing deployment scripts"
    fi
    
    # Check for .gitignore
    increment_max_score
    if [ -f ".gitignore" ]; then
        print_success ".gitignore file exists"
    else
        print_error ".gitignore file missing"
    fi
}

# Check dependencies
check_dependencies() {
    print_header "Dependency Checks"
    
    # Check for outdated packages
    print_info "Checking for outdated packages..."
    
    increment_max_score
    cd backend
    if npm outdated | grep -q "Package"; then
        print_warning "Backend has outdated packages"
    else
        print_success "Backend packages are up to date"
    fi
    cd ..
    
    increment_max_score
    cd frontend-web
    if npm outdated | grep -q "Package"; then
        print_warning "Frontend has outdated packages"
    else
        print_success "Frontend packages are up to date"
    fi
    cd ..
    
    # Check for unused dependencies
    print_info "Checking for unused dependencies..."
    increment_max_score
    if command -v npx &> /dev/null; then
        cd backend
        if npx depcheck &>/dev/null; then
            print_success "No unused backend dependencies found"
        else
            print_warning "Unused backend dependencies found"
        fi
        cd ..
    else
        print_warning "depcheck not available"
    fi
}

# Check build process
check_builds() {
    print_header "Build Process Checks"
    
    # Test production builds
    increment_max_score
    cd frontend-web
    if npm run build &>/dev/null; then
        print_success "Frontend production build successful"
    else
        print_error "Frontend production build failed"
    fi
    cd ..
    
    increment_max_score
    cd admin-panel
    if npm run build &>/dev/null; then
        print_success "Admin panel production build successful"
    else
        print_error "Admin panel production build failed"
    fi
    cd ..
    
    # Check mobile app build (if possible)
    increment_max_score
    cd mobile-app
    if [ -f "android/app/build.gradle" ]; then
        print_success "Mobile app Android configuration exists"
    else
        print_warning "Mobile app Android configuration missing"
    fi
    cd ..
}

# Check performance
check_performance() {
    print_header "Performance Checks"
    
    # Check bundle sizes
    increment_max_score
    if [ -d "frontend-web/build" ]; then
        BUNDLE_SIZE=$(du -sh frontend-web/build | cut -f1)
        print_info "Frontend bundle size: $BUNDLE_SIZE"
        print_success "Frontend build size checked"
    else
        print_warning "Frontend build not found"
    fi
    
    # Check for performance optimizations
    increment_max_score
    if grep -q "lazy\|Suspense\|memo" frontend-web/src/**/*.tsx 2>/dev/null; then
        print_success "Performance optimizations found in frontend"
    else
        print_warning "No performance optimizations detected"
    fi
    
    # Check image optimization
    increment_max_score
    if grep -q "next/image\|Image" frontend-web/src/**/*.tsx 2>/dev/null; then
        print_success "Image optimization components used"
    else
        print_warning "No image optimization detected"
    fi
}

# Check testing
check_testing() {
    print_header "Testing Configuration"
    
    # Check test files exist
    increment_max_score
    if find backend -name "*.test.js" -o -name "*.spec.js" | head -1 &>/dev/null; then
        print_success "Backend tests exist"
    else
        print_warning "Backend tests missing"
    fi
    
    increment_max_score
    if find frontend-web -name "*.test.tsx" -o -name "*.spec.tsx" | head -1 &>/dev/null; then
        print_success "Frontend tests exist"
    else
        print_warning "Frontend tests missing"
    fi
    
    # Check test configuration
    increment_max_score
    if [ -f "backend/jest.config.js" ] || grep -q "jest" backend/package.json; then
        print_success "Backend test configuration exists"
    else
        print_warning "Backend test configuration missing"
    fi
}

# Generate quality report
generate_quality_report() {
    print_header "Quality Report"
    
    REPORT_DIR="quality-reports"
    mkdir -p $REPORT_DIR
    
    PERCENTAGE=$((SCORE * 100 / MAX_SCORE))
    
    cat > $REPORT_DIR/quality-report.md << EOF
# OLX Classifieds - Quality Assurance Report

## Overall Quality Score: $SCORE/$MAX_SCORE ($PERCENTAGE%)

**Date**: $(date)
**Environment**: $(uname -s) $(uname -r)

## Quality Metrics

### Code Quality
- ESLint configuration and compliance
- TypeScript type checking
- Code consistency and standards

### Security
- Vulnerability scanning
- Sensitive data detection
- Security best practices

### Documentation
- README files and setup guides
- API documentation
- Component documentation

### Project Structure
- Directory organization
- Configuration files
- Build scripts and deployment

### Dependencies
- Package management
- Outdated package detection
- Unused dependency analysis

### Performance
- Build optimization
- Bundle size analysis
- Performance patterns

### Testing
- Test coverage
- Test configuration
- Testing best practices

## Recommendations

EOF

    if [ $PERCENTAGE -ge 90 ]; then
        echo "### Excellent Quality! 🎉" >> $REPORT_DIR/quality-report.md
        echo "Your project demonstrates excellent quality standards." >> $REPORT_DIR/quality-report.md
    elif [ $PERCENTAGE -ge 75 ]; then
        echo "### Good Quality! 👍" >> $REPORT_DIR/quality-report.md
        echo "Your project has good quality with room for improvement." >> $REPORT_DIR/quality-report.md
    elif [ $PERCENTAGE -ge 50 ]; then
        echo "### Needs Improvement 🔧" >> $REPORT_DIR/quality-report.md
        echo "Your project needs attention in several areas." >> $REPORT_DIR/quality-report.md
    else
        echo "### Significant Issues ⚠️" >> $REPORT_DIR/quality-report.md
        echo "Your project requires immediate attention to quality issues." >> $REPORT_DIR/quality-report.md
    fi
    
    echo "" >> $REPORT_DIR/quality-report.md
    echo "### Next Steps" >> $REPORT_DIR/quality-report.md
    echo "1. Address failed quality checks" >> $REPORT_DIR/quality-report.md
    echo "2. Implement missing configurations" >> $REPORT_DIR/quality-report.md
    echo "3. Add comprehensive testing" >> $REPORT_DIR/quality-report.md
    echo "4. Improve documentation coverage" >> $REPORT_DIR/quality-report.md
    echo "5. Set up automated quality gates in CI/CD" >> $REPORT_DIR/quality-report.md
    
    print_success "Quality report generated: $REPORT_DIR/quality-report.md"
}

# Main execution
main() {
    echo "Starting comprehensive quality check for OLX Classifieds..."
    echo ""
    
    check_project_structure
    check_code_quality
    check_typescript
    check_security
    check_documentation
    check_dependencies
    check_builds
    check_performance
    check_testing
    
    generate_quality_report
    
    print_header "Quality Check Complete!"
    
    PERCENTAGE=$((SCORE * 100 / MAX_SCORE))
    
    if [ $PERCENTAGE -ge 90 ]; then
        print_success "Excellent quality score: $SCORE/$MAX_SCORE ($PERCENTAGE%)"
    elif [ $PERCENTAGE -ge 75 ]; then
        print_success "Good quality score: $SCORE/$MAX_SCORE ($PERCENTAGE%)"
    elif [ $PERCENTAGE -ge 50 ]; then
        print_warning "Moderate quality score: $SCORE/$MAX_SCORE ($PERCENTAGE%)"
    else
        print_error "Low quality score: $SCORE/$MAX_SCORE ($PERCENTAGE%)"
    fi
    
    echo ""
    echo "Check quality-reports/quality-report.md for detailed analysis"
}

# Run main function
main "$@"



