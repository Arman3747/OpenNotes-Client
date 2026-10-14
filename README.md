![App Screenshot](https://i.ibb.co/TD506KZZ/Open-Notes-Hero.png)

# Blogging Platform - (OpenNotes)

OpenNotes is a full-stack blogging platform where users can create, share, and discover articles with a rich-text editor and secure authentication.

## Live Link

- Please Visit [OpenNotes](https://open-notes-client.vercel.app/) !

## Table of Contents

- [Key Features of OpenNotes](#key-features-of-opennotes)
- [TECH STACK](#tech-stack)
  - [Frontend Tech Stack](#frontend-tech-stack)
  - [Backend Tech Stack](#backend-tech-stack)
- [Database Model](#database-model)
  - [User Model](#user-model)
  - [Categories Model](#categories-model)
  - [BlogPost Model](#blogpost-model)
  - [Comment Model](#comment-model)
- [ROUTES](#routes)
  - [AUTH Routes](#auth-routes)
  - [USER Routes](#user-routes)
  - [CATEGORY Routes](#category-routes)
  - [POSTS Routes](#posts-routes)
  - [COMMENTS Routes](#comments-routes)
- [npm packages in Server Side](#npm-packages-in-server-side)
- [Technologies Used](#technologies-used)
- [Installation and Setup Instructions](#installation-and-setup-instructions)
  - [1. Clone the Repositories](#1-clone-the-repositories)
  - [2. Client Setup](#2-client-setup)
  - [3. Server Setup](#3-server-setup)
- [Deployment](#deployment)

## Key Features of OpenNotes

### User accounts and authentication

- User registration and login with email and password.
- JWT authentication with access and refresh tokens.
- HTTP-only cookies for authentication.
- Logout functionality.
- Email verification.
- Forgot-password and reset-password flows.
- Change password for logged-in users.
- Protected routes and role-based access.
- Redirect users to their intended page after login.

### User profiles

- View and edit personal information.
- Upload or update a profile photo.
- Manage name, username, biography, phone, and country.
- Add website and Instagram links.
- Display post, follower, and following counts.

### Post creation and management

- Create, view, edit, and delete blog posts.
- Write formatted content using the Tiptap editor.
- Support headings, lists, links, quotes, and code blocks.
- Apply text alignment, text colours, and highlights.
- Upload and replace cover images.
- Assign categories and add multiple tags.
- Save posts as drafts or publish them.
- Set public or private visibility.
- Access posts through unique, readable slugs.
- Display reading time and publication dates.

### Browsing and discovery

- Browse the latest posts.
- View individual posts and author details.
- Navigate paginated post listings.
- Select the number of posts per page.
- View total posts and the current results range.
- Preserve pagination in the URL for sharing and navigation.

### Dashboard and administration

- Personal dashboard for managing posts.
- Edit posts directly from dashboard actions.
- Manage draft and published content.
- Support User, Admin, and Super Admin roles.
- Manage user accounts, roles, and account statuses.
- Restrict actions according to permissions.

### Interface and reliability

- Responsive layouts for desktop and mobile.
- Reusable shadcn/ui components.
- Client-side and server-side validation.
- Image type and size validation.
- Image previews before uploading.
- Loading indicators and disabled submission controls.
- Helpful validation, API-error, and empty-state messages.
- PostgreSQL storage managed through Prisma.

---

## TECH STACK

### Frontend Tech Stack

| Layer             | Technologies                               | Purpose                                              |
| ----------------- | ------------------------------------------ | ---------------------------------------------------- |
| Frontend          | **Next.js(App Router), React, TypeScript** | Pages, components, routing, and server actions       |
| Styling           | **Tailwind CSS, shadcn/ui**                | Styling and reusable UI components                   |
| Forms             | **React Hook Form, Zod**                   | Form handling and input validation                   |
| API communication | **Fetch API, JSON, FormData**              | Sending requests, structured data, and image uploads |
| Rich-text editor  | **Tiptap**                                 | Writing blog content and storing it as JSON          |
| Date formatting   | **date-fns**                               | Displaying readable dates                            |
| Icons             | **Lucide React**                           | Interface icons                                      |
| Deployment        | **Vercel**                                 | Deployment platform you’re configuring               |

---

### Backend Tech Stack

| Layer          | Technologies                                      | Purpose                                                                  |
| -------------- | ------------------------------------------------- | ------------------------------------------------------------------------ |
| Backend        | **Node.js, Express.js, TypeScript**               | REST APIs and business logic                                             |
| Database       | **PostgreSQL**                                    | Storing users, posts, categories, and comments                           |
| ORM            | **Prisma**                                        | Database queries, models, and migrations                                 |
| Authentication | **JWT, bcryptjs, HTTP-only cookies**              | Access/refresh tokens, password hashing, and cookie-based authentication |
| Middleware     | **cookie-parser, CORS**                           | Reading cookies and allowing frontend API requests                       |
| Image uploads  | **Multer, multer-storage-cloudinary, Cloudinary** | Receiving, storing, and serving images                                   |
| Deployment     | **Vercel**                                        | Deployment platform you’re configuring                                   |

---

## Database Model

### User Model

**Fields & Validation:**

Required indicates whether a value must be supplied when creating a user. Fields with defaults or automatic values can be omitted.

| Field          | Type       | Required | Details                                                                                                     |
| -------------- | ---------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| id             | string     | No       | Primary key; automatically generated UUID with `uuid()`                                                     |
| email          | string     | Yes      | Unique email address; email format validation is not defined in this model                                  |
| password       | string     | No       | Nullable password field; store a password hash, not plain text                                              |
| name           | string     | No       | User’s name; nullable                                                                                       |
| username       | string     | No       | Unique username when provided; nullable                                                                     |
| profilePhoto   | string     | No       | Profile photo reference or URL; nullable                                                                    |
| boi            | string     | No       | User biography; nullable; field name preserved as `boi`                                                     |
| role           | Role       | No       | Defaults to `USER`; allowed values depend on the `Role` enum definition `SUPER_ADMIN, ADMIN, USER`          |
| phone          | string     | No       | Phone number; nullable                                                                                      |
| country        | string     | No       | User’s country; nullable                                                                                    |
| status         | UserStatus | No       | Defaults to `ACTIVE`; allowed values depend on the `UserStatus` enum definition `ACTIVE, INACTIVE, BLOCKED` |
| isVerified     | boolean    | No       | Defaults to `false`; indicates whether the user is verified                                                 |
| website        | string     | No       | User’s website; nullable                                                                                    |
| instagram      | string     | No       | Instagram reference; nullable                                                                               |
| followersCount | integer    | No       | Followers count; defaults to `0`                                                                            |
| followingCount | integer    | No       | Following count; defaults to `0`                                                                            |
| postsCount     | integer    | No       | Post count; defaults to `0`                                                                                 |
| lastLoginAt    | DateTime   | No       | Last login timestamp; nullable                                                                              |
| deletedAt      | DateTime   | No       | Soft deletion timestamp; nullable                                                                           |
| createdAt      | DateTime   | No       | Automatically defaults to the current timestamp with `now()`                                                |
| updatedAt      | DateTime   | No       | Automatically managed by Prisma using `@updatedAt`                                                          |

**Relations:**

| Field     | Type           | Required | Details                                                                                    |
| --------- | -------------- | -------- | ------------------------------------------------------------------------------------------ |
| posts     | BlogPost[]     | No       | Related blog posts; can be empty                                                           |
| comments  | Comment[]      | No       | Related comments; can be empty                                                             |
| likes     | Like[]         | No       | Related likes; can be empty                                                                |
| bookmark  | Bookmark[]     | No       | Related bookmarks; can be empty                                                            |
| following | Follower[]     | No       | Follower records using the named relation `following`                                      |
| followers | Follower[]     | No       | Follower records using the named relation `followers`                                      |
| userId    | Notification[] | No       | Notification records using the named relation `userId`; a relation list, not a scalar ID   |
| senderId  | Notification[] | No       | Notification records using the named relation `senderId`; a relation list, not a scalar ID |
| analytics | Analytics[]    | No       | Related analytics records; can be empty                                                    |

---

### Categories Model

**Fields & Validation:**

| Field                | Type     | Required | Details                                                           |
| -------------------- | -------- | -------- | ----------------------------------------------------------------- |
| id                   | string   | No       | Primary key; automatically generated UUID using `uuid()`          |
| categoriesName       | string   | Yes      | Category name; no uniqueness or minimum length constraint defined |
| icon                 | string   | No       | Optional category icon reference; nullable                        |
| categoriesPostsCount | integer  | No       | Number of posts in the category; defaults to `0`                  |
| createdAt            | DateTime | No       | Creation timestamp; defaults to the current time using `now()`    |
| updatedAt            | DateTime | No       | Timestamp automatically managed by Prisma using `@updatedAt`      |

**Relations:**

| Field | Type       | Required | Details                               |
| ----- | ---------- | -------- | ------------------------------------- |
| posts | BlogPost[] | No       | Related blog posts; can be empty list |

---

### BlogPost Model

**Fields & Validation:**

Required indicates whether a value must be supplied when creating a blog post. Fields with defaults or automatic values can be omitted. Required foreign keys can also be populated through their corresponding relation inputs.

| Field         | Type               | Required | Details                                                                                                                                       |
| ------------- | ------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| id            | string             | No       | Primary key; automatically generated UUID with `uuid()`                                                                                       |
| title         | string             | Yes      | Blog post title; no minimum or maximum length defined in this model                                                                           |
| slug          | string             | No       | Unique slug when provided; nullable; no automatic slug generation defined                                                                     |
| content       | Json               | Yes      | JSON content for an editor such as Tiptap, Slate, BlockNote, Editor.js, or Draft.js; editor-specific structure is not validated by this model |
| coverImage    | string             | No       | Cover image reference or URL; nullable                                                                                                        |
| categoryId    | string             | Yes      | Foreign key referencing `Categories.id`; can be populated through the `category` relation                                                     |
| isFeatured    | boolean            | No       | Defaults to `false`; intended for admin-only changes, which must be enforced in application logic                                             |
| tags          | string[]           | No       | List of tag strings; can be empty; no explicit `@default` declared                                                                            |
| status        | BlogPostStatus     | No       | Defaults to `PUBLISHED`; other allowed values depend on the enum definition `DRAFT, PUBLISHED`                                                |
| visibility    | BlogPostVisibility | No       | Defaults to `PUBLIC`; other allowed values depend on the enum definition `PUBLIC, PRIVATE`                                                    |
| views         | integer            | No       | View count; defaults to `0`                                                                                                                   |
| readTime      | integer            | No       | Reading duration; nullable; unit is not specified in this model                                                                               |
| likesCount    | integer            | No       | Like count; defaults to `0`                                                                                                                   |
| commentsCount | integer            | No       | Comment count; defaults to `0`                                                                                                                |
| sharesCount   | integer            | No       | Share count; defaults to `0`                                                                                                                  |
| authorId      | string             | Yes      | Foreign key referencing `User.id`; can be populated through the `author` relation                                                             |
| createdAt     | DateTime           | No       | Automatically defaults to the current timestamp with `now()`                                                                                  |
| updatedAt     | DateTime           | No       | Automatically managed by Prisma using `@updatedAt`                                                                                            |
| publishedAt   | DateTime           | No       | Publication timestamp; nullable; not automatically set by this model                                                                          |

**Relations:**

| Field         | Type           | Required | Details                                                                                |
| ------------- | -------------- | -------- | -------------------------------------------------------------------------------------- |
| category      | Categories     | Yes      | Related category; linked through `categoryId` referencing `Categories.id`              |
| comments      | Comment[]      | No       | Related comments; can be empty                                                         |
| likes         | Like[]         | No       | Related likes; can be empty                                                            |
| bookmarks     | Bookmark[]     | No       | Related bookmarks; can be empty                                                        |
| Notifications | Notification[] | No       | Related notifications; can be empty; field capitalization preserved as `Notifications` |
| analytics     | Analytics[]    | No       | Related analytics records; can be empty                                                |
| author        | User           | Yes      | Related author; linked through `authorId` referencing `User.id`                        |

---

### Comment Model

**Fields & Validation:**

Required indicates whether a value must be supplied when creating a comment. Fields with defaults or automatic values can be omitted. Required foreign keys can also be populated through their corresponding relation inputs.

| Field      | Type     | Required | Details                                                                                    |
| ---------- | -------- | -------- | ------------------------------------------------------------------------------------------ |
| id         | string   | No       | Primary key; automatically generated UUID with `uuid()`                                    |
| content    | string   | Yes      | Comment text; no minimum or maximum length defined in this model                           |
| likesCount | integer  | No       | Like count; defaults to `0`                                                                |
| isEdited   | boolean  | No       | Defaults to `false`; indicates whether the comment has been edited                         |
| authorId   | string   | Yes      | Foreign key referencing `User.id`; can be populated through the `author` relation          |
| postId     | string   | Yes      | Foreign key referencing `BlogPost.id`; can be populated through the `commentPost` relation |
| createdAt  | DateTime | No       | Automatically defaults to the current timestamp with `now()`                               |
| updatedAt  | DateTime | No       | Automatically managed by Prisma using `@updatedAt`                                         |

**Relations:**

| Field       | Type     | Required | Details                                                                                  |
| ----------- | -------- | -------- | ---------------------------------------------------------------------------------------- |
| author      | User     | Yes      | Comment author; linked through `authorId` referencing `User.id`                          |
| commentPost | BlogPost | Yes      | Blog post associated with the comment; linked through `postId` referencing `BlogPost.id` |
| likes       | Like[]   | No       | Related likes; can be empty                                                              |

---

## ROUTES

### AUTH Routes

| Route                          | Method | Description             |
| ------------------------------ | ------ | ----------------------- |
| `/api/v1/auth/register`        | POST   | Create a new `USER`     |
| `/api/v1/auth/login`           | POST   | `USER` Login            |
| `/api/v1/auth/logout`          | POST   | `USER` Logout           |
| `/api/v1/auth/refresh-token`   | POST   | Get New `Refresh Token` |
| `/api/v1/auth/change-password` | POST   | Change User Password    |
| `/api/v1/auth/forgot-password` | POST   | Forgot Password         |
| `/api/v1/auth/reset-password`  | POST   | Reset User Password     |

### USER Routes

| Route                  | Method | Description                         |
| ---------------------- | ------ | ----------------------------------- |
| `/api/v1/user/me`      | GET    | GET `USER` Details                  |
| `/api/v1/user/:userId` | GET    | GET `USER` Details with `userId`    |
| `/api/v1/user/:userId` | PATCH  | Update `USER` Details with `userId` |

### CATEGORY Routes

| Route                            | Method | Description                                                        |
| -------------------------------- | ------ | ------------------------------------------------------------------ |
| `/api/v1/categories`             | GET    | GET All Category                                                   |
| `/api/v1/categories/:categoryId` | GET    | GET a single Category with categoryId                              |
| `/api/v1/categories`             | POST   | POST a Category - only `ADMIN AND SUPER_ADMIN` can post a Category |

### POSTS Routes

| Route                                  | Method | Description                   |
| -------------------------------------- | ------ | ----------------------------- |
| `/api/v1/post?page=1&limit=10`         | GET    | GET All POST                  |
| `/api/v1/post?search=nextjs&tag=react` | GET    | GET All POST                  |
| `/api/v1/post?authorId=USER_UUID`      | GET    | GET All POST                  |
| `/api/v1/post/:postId`                 | GET    | GET A Single POST with postId |
| `/api/v1/post/slug/:slug`              | GET    | GET A Single POST with slug   |
| `/api/v1/post`                         | POST   | CREATE A Single POST          |
| `/api/v1/post/:postId`                 | PATCH  | UPDATE A Single POST          |

---

### COMMENTS Routes

| Route                           | Method | Description                 |
| ------------------------------- | ------ | --------------------------- |
| `/api/v1/post/:postId/comments` | GET    | GET All Comments of a post  |
| `/api/v1/post/:postId/comments` | POST   | CREATE a Comments of a post |
| `/api/v1/comments/:commentId`   | PATCH  | UPDATE a Comment            |

---

## npm packages in Client Side

- Use [TypeScript](https://www.typescriptlang.org/) to add static typing, catch errors early, and make JavaScript code easier to maintain.
- Use [ESLint](https://eslint.org/) to detect code issues, enforce coding standards, and automatically fix supported problems in JavaScript and TypeScript projects.
- Use [node.js](https://nodejs.org/) for server-side scripting and building web applications.
- Use [lucide-react](https://lucide.dev/guide/react/) to add customizable SVG icons to React applications, with consistent styling and control over size, color, and stroke width.
- Use [Tailwind](https://tailwindcss.com/) CSS to build responsive, customizable interfaces quickly with utility classes.
- Use [Base UI](https://base-ui.com/) to build accessible, customizable React interfaces with unstyled components, giving you control over appearance and styling.
- Use [shadcn/ui](https://ui.shadcn.com/) to build consistent interfaces with customizable React components, including buttons, forms, dialogs, cards, and navigation menus.
- Use [Tiptap](https://tiptap.dev/) to build customizable rich-text editors with formatting, links, images, and structured content stored as JSON or HTML.
- Use [React](https://react.dev/) to build interactive user interfaces with reusable components, manage state, and update content dynamically as users interact with your application.
- Use [Next.js](https://nextjs.org/) to build full-stack React applications with file-based routing, server rendering, API endpoints, and optimized images for better performance.
- Use [React Hook Form](https://react-hook-form.com/) to manage form inputs, handle submissions, validate user data, and display errors while minimizing unnecessary re-renders.
- Use [date-fns](https://date-fns.org/) to format, parse, compare, and manipulate dates, calculate time differences, and display readable dates in JavaScript applications.
- Uses [JWT](https://jwt.io/) to securely transmit user authentication data between client and server in web applications.
- Use [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) to sign and verify JSON Web Tokens, supporting token-based authentication and validating token integrity in Node.js applications.
- Use [Zod](https://zod.dev/) to define validation schemas, validate incoming data, and infer TypeScript types automatically.
- Uses [Vercel](https://vercel.com/) for deploying, hosting, and scaling frontend web applications with speed, simplicity, and automation.

---

## Technologies Used in Client Side

- ![Node.js](https://img.shields.io/badge/nodedotjs-v20.9.1-155dfc?logo=nodedotjs&logoColor=%235FA04E)
- ![eslint](https://img.shields.io/badge/eslint-v9.0.0-155dfc?logo=eslint&logoColor=%234B32C3)
- ![typescript](https://img.shields.io/badge/typescript-v5.0.0-155dfc?logo=typescript&logoColor=%233178C6)
- ![lucide](https://img.shields.io/badge/lucide-v1.39.0-155dfc?logo=lucide&logoColor=%23F56565)
- ![tailwind](https://img.shields.io/badge/tailwind-v4.0.0-155dfc?logo=tailwind&logoColor=%2306B6D4)
- ![base_ui](https://img.shields.io/badge/baseui-v1.7.0-155dfc?logo=baseui&logoColor=%23EDEDED)
- ![shadcn/ui](https://img.shields.io/badge/shadcn_ui-v4.19.1-155dfc?logo=shadcnui&logoColor=%23000000)
- ![react](https://img.shields.io/badge/react-v19.2.4-155dfc?logo=react&logoColor=%2361DAFB)
- ![next.js](https://img.shields.io/badge/next.js-v16.2.6-155dfc?logo=nextdotjs&logoColor=%23000000)
- ![react-hook-form](https://img.shields.io/badge/react_hook_form-v7.88.0-155dfc?logo=reacthookform&logoColor=%23EC5990)
- ![date-fns](https://img.shields.io/badge/date_fns-v4.4.0-155dfc?logo=datefns&logoColor=%23770C56)
- ![zod](https://img.shields.io/badge/zod-v4.6.5-155dfc?logo=zod&logoColor=%23408AFF)
- ![jsonwebtoken](https://img.shields.io/badge/jsonwebtoken-v9.0.3-155dfc?logo=jsonwebtokens&logoColor=%23000000)
- ![.env](https://img.shields.io/badge/.env-v17.4.2-155dfc?logo=dotenv&logoColor=%23ECD53F)
- ![Vercel](https://img.shields.io/badge/Vercel-ffffff?logo=vercel&logoColor=%23000000)

## Installation and Setup Instructions

Follow the steps below to set up the **OpenNotes** application locally:

---

### 1. Clone the Repositories

```bash
git clone https://github.com/Arman3747/OpenNotes-Server.git
git clone https://github.com/Arman3747/OpenNotes-Client.git
```

---

### 2. Client Setup

```bash
cd OpenNotes-Client
npm install
```

Create a `.env.local` file in the root of the client folder and add the following:

```env

#BASE URL
BASE_API_URL=https://your-backend-domain/api/v1
NEXT_PUBLIC_BASE_API=https://your-backend-domain/api/v1

#jwt
JWT_ACCESS_SECRET = your_jwt_access_secret
JWT_REFRESH_SECRET = your_jwt_refresh_secret

```

Then start the client:

```bash
npm run dev
```

---

### 3. Server Setup

```bash
cd OpenNotes-Server
npm install
```

Create a `.env` file in the root of the server folder and add the following:

```env

# Server
PORT="5000"
NODE_ENV="development"

#DataBase
DATABASE_URL="postgresql://postgres:postgres_password@localhost:5432/db_name?schema=public"

#BCRYPT
SALT_ROUND=your_bcrypt_salt_round

#JWT
JWT_ACCESS_SECRET = your_jwt_access_secret
JWT_ACCESS_EXPIRES = your_jwt_access_expires_eg_1d
JWT_REFRESH_SECRET = your_jwt_refresh_secret
JWT_REFRESH_EXPIRES = your_jwt_refresh_expires_eg_30d
JWT_RESET_PASS_SECRET = your_jwt_reset_secret
JWT_RESET_PASS_EXPIRES = your_jwt_reset_expires_eg_10m

#RESET_PASS_LINK
RESET_PASS_LINK=http://localhost:3000/resetPassword

#Email sender
EMAIL=your_email_address
app_pass=smtp_password

#CLOUDINARY
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

```

Then start the server:

```bash
npm run dev
```

---

## Deployment

1. Push the code to GitHub.
2. Connect your repository to [Vercel](https://vercel.com/).
3. Set environment variables in Vercel dashboard.
4. Deploy the site. Live URL will be generated automatically.

- [OpenNotes Live Link](https://open-notes-client.vercel.app/) !

---

### Thank you for Reading!
