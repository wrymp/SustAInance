# API Documentation

## Login Endpoint
Authenticates users.

### Request
- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Content-Type:** `application/json`

### Request Body
```json
{
    "email": "user@example.com",
    "password": "userPassword123"
}
```

### Success Response 
``` json
{
    "status": 200,
    "message": "User authenticated",
    "data": {
        "user": {
            "id": 1,
            "email": "user@example.com",
            "name": "John Doe"
        }
    }
}
```

### Error Response

#### 400 Bad Request
``` json
{
    "status": 400,
    "message": "Validation failed",
    "data": {
        "errors": {
            "email": "Email is required",
            "password": "Password must be at least 8 characters"
        }
    }
}
```
#### 401 Unauthorized
``` json
{
    "status": 401,
    "message": "Authentication failed",
    "data": {
        "error": "Invalid email or password"
    }
}
```