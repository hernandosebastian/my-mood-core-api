# My Mood - Core API

> ⚠️ **Important:**  
> To install and run the frontend, please refer to the corresponding repository: [Frontend Repository](https://github.com/hernandosebastian/my-mood-core-ui).  

## Description

**My Mood** is a web platform that allows users to register, update, delete, and view statistics about their mood changes throughout the day.  
The goal is to discover emotional patterns and track personal well-being over time.  
The project is built following good software practices, is fully tested, and designed to be scalable.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Code Quality and Automation](#code-quality-and-automation)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [License](#license)

## Technologies Used

- **Backend**:
  - **Node.js**: v18.18.0
  - **NestJS**: v10.4.5
  - **TypeORM**: v0.3.20

- **Cloud Services**:
  - AWS S3 (Storage)
  - AWS SES (Email Sending)
  - AWS Cognito (Authentication)

- **Database**:
  - MySQL

- **Containerization (local development only)**:
  - Docker (used in Windows via WSL/Linux)

## Getting Started

### Prerequisites

Make sure you have installed:

- **Node.js** (v18.18.0)
- **npm** (package manager)
- **Docker** (running via WSL/Linux)

### Installing

Clone the repository:

```bash
git clone https://github.com/hernandosebastian/my-mood-core-api.git
```

Navigate to the project folder:

```bash
cd my-mood-core-api
```

Install dependencies:

```bash
npm ci
```

> ⚡ **Note:** The project uses `npm ci` to install exact dependency versions.  
> It was not tested with `yarn` or other package managers.

### Running the Application

#### Running the Backend

To start the development server:

```bash
npm run start:dev
```

#### Running the Database

To start the MySQL database using Docker:

```bash
docker compose up
```

This will initialize all required containers for the local environment.

## Architecture

The backend is built using **Hexagonal Architecture** principles, promoting a clear separation between core logic and external concerns.  
This approach ensures better maintainability, scalability, and testability.

For more information, refer to:  
[Hexagonal Architecture Demystified](https://madewithlove.com/blog/hexagonal-architecture-demystified/)

## Code Quality and Automation

The project ensures high code quality through the use of **ESLint** and **Prettier**. These tools enforce consistent coding style and formatting across the project.

For automation, **Husky** is configured to lint code before every commit and run tests before each push. If any test fails, the push is automatically blocked.

Additionally, when opening a Pull Request (PR), a **CI/CD pipeline** runs, which installs all dependencies and re-runs the tests to validate the integrity of the codebase before it is merged.

## Testing

- The project uses **Jest** as the main testing framework.
- Integration tests are written using **Supertest**.
- External services (such as AWS or authentication providers) are properly **mocked** to focus on the **internal behavior** of the application, not on external dependencies.
- Tests are designed to validate the internal logic and ensure the stability of all critical flows.

To run all tests:

```bash
npm run test
```

## Deployment

The **My Mood** platform is deployed as follows:

- **Railway**: Hosting the **frontend**, **backend**, and **database**.
- **Cloudflare**: Providing additional security and optimization.
- **Web App Domain**: [https://my-mood.com.ar/](https://my-mood.com.ar/)

```
[User] → [Cloudflare] → [Railway (Frontend/API/DB)]
```

## Documentation

The project includes a variety of documentation:

- Postman collection
- C4 diagrams (Level 1 and Level 2)
- Entity Relationship Diagram (ERD)
- Sequence diagrams

You can find them in the following directories:

| Type                        | Link                                                                                     |
|-----------------------------|------------------------------------------------------------------------------------------|
| **Postman Collection**       | [Postman Collection](https://github.com/hernandosebastian/my-mood-core-api/tree/main/docs/postman) |
| **C4 Diagrams**              | [C4 Diagrams](https://github.com/hernandosebastian/my-mood-core-api/tree/main/docs/diagrams/c4) |
| **ERD**                      | [Entity Relationship Diagram (ERD)](https://github.com/hernandosebastian/my-mood-core-api/tree/main/docs/diagrams/erd) |
| **Sequence Diagrams**        | [Sequence Diagrams](https://github.com/hernandosebastian/my-mood-core-api/tree/main/docs/diagrams/sequence) |

## License

The project is licensed under the **MIT License**.  
You can find the full text of the license here:  
[MIT License](https://github.com/hernandosebastian/my-mood-core-api/blob/main/LICENSE)
