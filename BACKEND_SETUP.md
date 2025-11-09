# Backend Setup Guide for Frontend Integration

This guide will help you configure your backend to work properly with the frontend application.

## CORS Configuration

To allow your frontend (running on a different port or domain) to communicate with your backend, you need to configure CORS (Cross-Origin Resource Sharing).

### For Spring Boot (Java)

Add the following to your main application class or create a separate configuration class:

```java
@Configuration
@EnableWebMvc
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000", "http://127.0.0.1:8000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

Or using `@CrossOrigin` annotation on controllers:

```java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class YourController {
    // Your endpoints here
}
```

### For Node.js/Express

Install and configure CORS middleware:

```bash
npm install cors
```

```javascript
const cors = require('cors');

const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8000', 'http://127.0.0.1:8000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

### For ASP.NET Core

In `Startup.cs` or `Program.cs`:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddCors(options =>
    {
        options.AddDefaultPolicy(builder =>
        {
            builder.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
                   .AllowAnyHeader()
                   .AllowAnyMethod()
                   .AllowCredentials();
        });
    });
    
    // Other services...
}

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    app.UseCors();
    // Other middleware...
}
```

## Required API Endpoints

Make sure your backend implements the following endpoints that the frontend expects:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### User Management Endpoints
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile

### Account Management Endpoints
- `GET /api/accounts` - Get user's accounts
- `POST /api/accounts` - Create new account
- `PUT /api/accounts/{id}` - Update account
- `DELETE /api/accounts/{id}` - Delete account

### Transaction Endpoints
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/income` - Get income transactions
- `GET /api/transactions/expenses` - Get expense transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Categories Endpoints
- `GET /api/categories` - Get all categories
- `GET /api/categories/income` - Get income categories
- `GET /api/categories/expenses` - Get expense categories

### Goals Endpoints
- `GET /api/goals` - Get user's financial goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/{id}` - Update goal
- `DELETE /api/goals/{id}` - Delete goal

### Investment Endpoints
- `GET /api/investments` - Get user's investments
- `POST /api/investments` - Create new investment
- `PUT /api/investments/{id}` - Update investment
- `DELETE /api/investments/{id}` - Delete investment

### Reports Endpoints
- `GET /api/reports/monthly?month={month}&year={year}` - Monthly report
- `GET /api/reports/spending?period={period}` - Spending analytics
- `GET /api/reports/income?period={period}` - Income analytics
- `GET /api/reports/budget` - Budget analysis

## Authentication & Authorization

### JWT Token Structure
Your backend should return JWT tokens with this structure:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "isAdmin": false
}
```

### Protected Routes
All API endpoints except `/api/auth/*` should require authentication. Verify the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Error Response Format

Standardize error responses:

```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Database Schema Requirements

### Users Table
- id (Primary Key)
- username (Unique)
- email (Unique)
- password (Hashed)
- name
- role (default: 'user')
- created_at
- updated_at

### Accounts Table
- id (Primary Key)
- user_id (Foreign Key)
- name
- type (savings, checking, credit, etc.)
- bank
- number (last 4 digits)
- balance
- created_at
- updated_at

### Transactions Table
- id (Primary Key)
- user_id (Foreign Key)
- account_id (Foreign Key)
- type (income/expense)
- amount
- category
- description
- date
- created_at
- updated_at

### Goals Table
- id (Primary Key)
- user_id (Foreign Key)
- name
- category
- target_amount
- current_amount
- target_date
- priority
- created_at
- updated_at

### Investments Table
- id (Primary Key)
- user_id (Foreign Key)
- name
- type (stocks, mutual-funds, etc.)
- quantity
- amount (initial investment)
- current_value
- created_at
- updated_at

## Testing Your Backend

Use these curl commands to test your endpoints:

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"test@example.com","password":"password"}'

# Get accounts (replace TOKEN with actual JWT)
curl -X GET http://localhost:8080/api/accounts \
  -H "Authorization: Bearer TOKEN"

# Create account
curl -X POST http://localhost:8080/api/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"My Savings","type":"savings","balance":1000}'
```

## Frontend Configuration

The frontend is configured to connect to `http://localhost:8080` by default. If your backend runs on a different port, update `js/config.js`:

```javascript
const API_CONFIG = {
    BASE_URL: 'http://localhost:YOUR_PORT',
    // ... rest of config
};
```

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure CORS is properly configured on your backend
2. **401 Unauthorized**: Check JWT token validation
3. **404 Not Found**: Ensure all required endpoints are implemented
4. **Network Errors**: Verify backend is running and accessible

### Debug Tips:

- Check browser developer tools Network tab for API call details
- Enable CORS preflight handling for OPTIONS requests
- Log incoming requests on your backend
- Verify JWT token format and expiration

## Next Steps

1. Implement all required endpoints
2. Test each endpoint with curl or Postman
3. Start your backend server
4. Open the frontend application
5. Test the login functionality
6. Verify data loading in the dashboard

Your backend should now be ready to work with the frontend application!