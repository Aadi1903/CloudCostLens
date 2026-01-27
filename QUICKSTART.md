# Quick Start Guide - AWS Recommendation System

## Prerequisites Check

Run these commands to check if you have the required software:

```bash
# Check Java
java -version

# Check Node.js
node -version

# Check npm
npm -version
```

## Starting the Application

### Backend (Choose ONE option):

**Option A: Using IntelliJ IDEA / Eclipse / VS Code**
1. Open the `backend` folder in your IDE
2. Navigate to: `src/main/java/com/awsplanner/AwsPlannerApplication.java`
3. Right-click → Run 'AwsPlannerApplication'
4. Wait for "AWS Recommendation System is running!" message
5. Backend will be available at: http://localhost:8080

**Option B: Using Maven (if installed)**
```bash
cd backend
mvn spring-boot:run
```

**Option C: Install Maven First**
1. Download from: https://maven.apache.org/download.cgi
2. Extract to `C:\Program Files\Apache\maven`
3. Add to PATH: `C:\Program Files\Apache\maven\bin`
4. Restart terminal
5. Run: `mvn spring-boot:run` from backend folder

### Frontend:

```bash
cd frontend
npm run dev
```

Frontend will be available at: http://localhost:5173

## Troubleshooting

### "mvn is not recognized"
- Maven is not installed or not in PATH
- **Solution**: Use IDE (Option A) or install Maven (Option C)

### "npm run dev" fails
- Make sure you're in the `frontend` directory
- Run `npm install` first if you haven't

### Port already in use
- Backend (8080): Stop other Java applications
- Frontend (5173): Stop other Vite/React apps

## Testing the Application

Once both servers are running:

1. Open browser: http://localhost:5173
2. Click "Start Planning"
3. Fill in the form:
   - Application Type: Backend API
   - Traffic: Medium
   - Storage: 100 GB
   - Database: Yes
   - Operational Effort: Low
   - Budget: $100
4. Click "Get Recommendations"
5. View your recommended AWS architecture!

## Quick Test Scenarios

### Scenario 1: Static Website (Low Cost)
- Type: Static Website
- Traffic: Low
- Storage: 50 GB
- Database: No
- Effort: Low
- Budget: $20
- **Expected**: S3 + CloudFront

### Scenario 2: Backend API
- Type: Backend API
- Traffic: Medium
- Storage: 100 GB
- Database: Yes
- Effort: Low
- Budget: $100
- **Expected**: Lambda + DynamoDB + API Gateway

### Scenario 3: Full-Stack App
- Type: Full-Stack Web Application
- Traffic: High
- Storage: 500 GB
- Database: Yes
- Effort: Medium
- Budget: $200
- **Expected**: ECS + RDS + S3 + CloudFront
