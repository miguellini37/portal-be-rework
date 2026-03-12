# Portal iOS App — Design Spec

## Overview

Native iOS app for the Portal Jobs platform. One app, all user roles (athlete, employer, school, admin), role-based navigation adapting after login. Full feature parity with the web frontend.

**Platform:** iOS 18+, SwiftUI, pure Apple stack except Socket.IO client (required — backend uses Socket.IO)
**Visual style:** Hybrid — dark branded gradient headers, white content cards, system dark mode support
**Backend:** Existing NestJS/Fastify API at the same base URL, Keycloak auth at `auth.portaljobs.net`

---

## Architecture

SwiftUI + MVVM with `@Observable` (iOS 18).

```
PortalApp/
├── App/                    # App entry point, root auth state, URL scheme handling
├── Core/
│   ├── Auth/               # Keycloak PKCE via ASWebAuthenticationSession
│   ├── Networking/         # APIClient actor (URLSession async/await)
│   ├── Socket/             # Socket.IO client for real-time messaging
│   ├── Keychain/           # Token storage wrapper (Security.framework)
│   └── Models/             # Shared Codable models matching backend entities
├── Features/
│   ├── Home/               # Feed-first dashboard (role-adaptive)
│   ├── Jobs/               # Browse jobs/internships/NIL (athlete) / Manage postings (employer)
│   ├── Applications/       # Track status (athlete) / Review candidates (employer)
│   ├── Messaging/          # Conversations list + chat view
│   ├── Profile/            # View/edit profile (role-specific fields)
│   ├── Interviews/         # View (athlete) / Schedule+manage (employer)
│   ├── Company/            # Company profile, culture, benefits
│   ├── School/             # Dashboard, NIL oversight, career outcomes
│   └── Admin/              # User/org management
└── Shared/                 # Reusable UI components, extensions, theme
```

---

## Authentication

### Flow

1. App launches → check Keychain for refresh token
2. If valid refresh token → silently exchange for new access token → navigate to Home
3. If no token or refresh fails → show onboarding/login screen
4. Login taps → `ASWebAuthenticationSession` opens Keycloak login page at `auth.portaljobs.net/realms/portal-jobs/protocol/openid-connect/auth`
5. Keycloak redirects to `portaljobs://auth/callback?code=...`
6. App exchanges auth code for tokens (PKCE, no client secret)
7. Decode JWT → extract `permission` (role), `sub` (userId), `schoolId`, `companyId`
8. Store tokens in Keychain → navigate to Home

### Configuration

- Realm: `portal-jobs`
- Client: `portal-frontend` (public client, same as web)
- Redirect URI: `portaljobs://auth/callback`
- Grant type: Authorization Code with PKCE
- Custom URL scheme: `portaljobs://`
- No AASA / universal links in v1

### Token Management

- Access token: injected as `Authorization: Bearer` header on all API requests
- Refresh token: stored in Keychain, used to silently renew access tokens
- On 401 response: attempt token refresh → if fails, clear Keychain, return to login
- JWT decoded client-side for role/userId extraction (not for security validation)

---

## Networking

### APIClient

A Swift actor providing async/await methods for all backend endpoints. Single shared instance.

Responsibilities:
- Base URL configuration (from environment/build config)
- Automatic Bearer token injection from Keychain
- Automatic 401 → refresh token → retry (once)
- JSON encoding/decoding with `JSONDecoder` (default camelCase key strategy matching backend)
- Error type mapping (network, auth, validation, server)

### Socket.IO (Real-time Messaging)

The backend uses Socket.IO (not raw WebSocket), so the iOS app requires the `socket.io-client-swift` package (SPM). This is the only third-party dependency.

`SocketManager` connecting to `{baseURL}` with path `/subscription`.

- Connects on app foreground when authenticated (passes JWT via `auth.token`)
- Emits `subscribe` event with `{ userId }` after connection
- Listens for `newMessage` events → updates conversation state in real-time
- Emits `unsubscribe` on disconnect
- Auto-reconnect with exponential backoff on connection drop
- Disconnects on app background

---

## Navigation

### Tab Bar (5 tabs, middle 3 role-specific)

**Athlete:**
| Tab | Icon | Screen |
|-----|------|--------|
| Home | house.fill | Feed-first dashboard with recommended jobs, recent activity |
| Jobs | briefcase.fill | Browse jobs, internships, NIL deals (segmented control) |
| Applications | doc.text.fill | Application status list |
| Messages | message.fill | Conversations (badge for unread count) |
| Profile | person.fill | Athlete profile view/edit |

**Employer (Company Employee):**
| Tab | Icon | Screen |
|-----|------|--------|
| Home | house.fill | Dashboard with recent applications, interview schedule |
| Jobs | briefcase.fill | Manage job/internship/NIL postings |
| Candidates | person.2.fill | Review applicants per job, update statuses |
| Messages | message.fill | Conversations |
| Profile | person.fill | Employee profile + company profile |

**School Employee:**
| Tab | Icon | Screen |
|-----|------|--------|
| Home | house.fill | University overview dashboard |
| Dashboard | chart.bar.fill | Analytics, career outcomes, NIL oversight |
| Athletes | figure.run | Student-athlete roster |
| Messages | message.fill | Conversations |
| Profile | person.fill | School employee profile |

**Admin:**
| Tab | Icon | Screen |
|-----|------|--------|
| Home | house.fill | Overview |
| Users | person.3.fill | All users list with filters |
| Orgs | building.2.fill | Companies + schools management |
| Messages | message.fill | Conversations |
| Profile | person.fill | Admin profile |

Each tab uses its own `NavigationStack` with typed navigation paths.

---

## Screens

### Universal

**Onboarding / Login**
- App logo, tagline, "Get Started" button
- Login triggers `ASWebAuthenticationSession`
- Registration handled by Keycloak (register link on Keycloak login page)
- After first login: app calls `POST /createProfile` to create the user's database record (with optional schoolId if provided during registration)

**Home Feed (role-adaptive)**
- Greeting header with user avatar/initials (dark gradient background)
- Stat badges row (applications, interviews, messages — role-appropriate counts)
- Activity feed: recent activity items from `GET /activity`
- Role-specific cards: recommended jobs (athlete), pending reviews (employer), overview metrics (school)

**Messages**
- Conversations list: `GET /getRecentMessages` — shows 10 recent conversations with last message preview, unread count badge, relative timestamp
- Conversation view: `GET /getConversation` — message bubbles, text input, real-time updates via Socket.IO
- Send message: `POST /sendMessage` (toUserId, message) — also emits via Socket.IO to recipient
- New message: search users via `GET /getUsersToMessage`, get user details via `GET /getUserForMessaging`
- Mark as read: `PATCH /markMessageRead` on view

**Profile View/Edit**
- View mode: display all profile fields, edit button
- Edit mode: form with role-specific fields, calls role-specific update endpoint:
  - Athlete: `PUT /updateAthlete` — firstName, lastName, phone, location, bio, academics (major, minor, GPA, graduationDate, awards, coursework), athletics (sport, position, division, conference, yearsPlayed, leadershipRoles, achievements, statistics, skills)
  - CompanyEmployee: `PUT /updateCompanyEmployee` — firstName, lastName, phone, bio, linkedIn, position, roleType, companyId, former athlete fields
  - SchoolEmployee: `PUT /updateSchoolEmployee` — firstName, lastName, phone, bio, linkedIn, position, department, officeLocation, officeHours, schoolId
- View other profiles: `GET /getAthlete/:id`, `GET /getCompanyEmployee/:id`, `GET /getSchoolEmployee/:id`

### Athlete Screens

**Jobs Tab**
- Segmented control: Jobs | Internships | NIL Deals (filters by `type` field)
- Feed-first layout: scrolling list of `JobCard` items
- Filter bar: horizontal scrolling chips for industry, experience, duration, company
- Search: text search via `wildcardTerm`
- Pull to refresh
- API: `GET /getJobs` with type and filter params

**Job Detail**
- Company name + logo area
- Position, description, requirements, location, salary/payment info, benefits
- Application deadline
- "Apply" button → `POST /createApplication`
- Link to company profile
- API: `GET /getJob/:id`

**Applications List**
- List of applications with status pills (applied, under_review, interview_requested, accepted, rejected, withdrawn)
- Each row: job title, company, status, applied date
- Tap → application detail with interview info if scheduled
- API: `GET /getApplications`

**Interview Detail**
- Date/time, location, interviewer name
- Preparation tips
- Status (scheduled, cancelled, complete)
- API: `GET /getInterview`

### Employer Screens

**Jobs Management Tab**
- Segmented control: Jobs | Internships | NIL Deals
- List of employer's postings with status (open, closed, filled), applicant count
- Create new posting: form with position, description, type, industry, experience, duration, salary, benefits, deadline
- Edit existing posting
- API: `POST /createJob`, `PUT /updateJob`, `GET /getJobs`

**Candidates Tab**
- Filter by job posting
- List of applications per job: athlete name, sport, school, status
- Tap → athlete profile view
- Update status (under_review, interview_requested, accepted, rejected)
- Schedule interview: dateTime, location, interviewer, preparationTips
- API: `GET /getApplications`, `PATCH /updateApplicationStatus`, `POST /createInterview`

**Company Profile**
- View/edit company details: name, industry
- Culture section: values, environment, thrive points
- Benefits section: salary range, commission, specific benefits
- Recruiting section: strategy, process steps
- API: `PUT /updateCompany`, `GET /getCompany/:id`

### School Screens

**University Overview** (Home tab)
- Stat cards: placed graduates, active sponsors, total students
- Recent activity feed
- API: `GET /getUniversityOverview`

**Dashboard Tab**
- Companies & partnerships: partner companies, open positions, placements YTD, median salary (`GET /getCompaniesForUniversity`)
- NIL oversight: metrics summary, recent deals list (`GET /getUniversityNILOversight`)
- Career outcomes sub-screens:
  - Job placement outcomes (`GET /getStudentJobOutcomes`)
  - Placements by sport — filterable (`GET /getPlacementBySport`)
  - Salary distribution — filterable (`GET /getSalaryDistribution`)
  - Individual student outcomes — filterable list (`GET /getStudentOutcomes`)

**Athletes Tab**
- Student-athlete roster for the school
- Search/filter by name, sport, verified status
- Tap → athlete profile view
- API: `GET /getAthletes` filtered by schoolId

**School Employee Management**
- List school employees
- API: `GET /getSchoolEmployees`

### Admin Screens

**Users List**
- All users with filters: name search, permission type, schoolId, companyId
- API: `GET /getAllUsers`

**Organizations**
- Companies list (`GET /getAllCompanies`) + create (`POST /createCompany`) + update owner (`PATCH /updateCompanyOwner`)
- Schools list (`GET /getAllSchools`) + create (`POST /createSchool`) + update owner (`PATCH /updateSchoolOwner`)

**Whitelist Management**
- Add email to org whitelist: `POST /whiteListUser`
- View org users: `POST /getAllOrgUsers`

---

## Theme

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| primaryBlue | `#046ee5` | Buttons, links, active states, accents |
| navy | `#0a0f2e` | Dark backgrounds, header gradients, primary text |
| navyLight | `#131a3e` | Dark card backgrounds |
| surfaceGray | `#f8fafc` | Light page backgrounds |
| cardWhite | `#FFFFFF` | Content cards |
| textPrimary | `#0a0f2e` | Headings, body text |
| textSecondary | `#64748b` | Descriptions, labels |
| textTertiary | `#94a3b8` | Hints, timestamps |
| success | `#10b981` | Accepted, complete, positive metrics |
| warning | `#f59e0b` | Pending, attention needed |
| error | `#ef4444` | Rejected, errors, unread badges |

### Hybrid Visual Style

- **Header areas:** Dark gradient (`navy` → `navyLight`) with white text — used on Home hero, section tops
- **Content areas:** White cards on `surfaceGray` background — clean readability
- **Dark mode:** Content areas invert to dark surfaces; branded headers stay dark
- **Gradient accents:** Stat badges use subtle colored gradient backgrounds with colored borders

### Typography

System font (SF Pro) with Dynamic Type support. No custom fonts.

### Shared Components

- `PortalCard` — white rounded card with subtle shadow; gradient border variant for featured items
- `StatBadge` — compact stat display (number + label) with colored background tint
- `StatusPill` — rounded pill showing application/interview status with role-appropriate color
- `JobCard` — position title, company, location, type badge, posted date
- `AthleteCard` — avatar/initials, name, sport, school, GPA highlight
- `FilterBar` — horizontally scrolling filter chips with active state
- `SegmentedTypeControl` — Jobs | Internships | NIL Deals switcher
- `GradientHeader` — dark gradient section header with title and subtitle
- `EmptyState` — illustration + message for empty lists
- `LoadingState` — skeleton/shimmer loading placeholders

---

## Out of Scope for v1

- Push notifications (requires APNs + backend integration)
- File uploads / profile photos (backend doesn't support S3 yet)
- Universal links / deep links (requires AASA on backend)
- Offline caching / persistence
- App Store submission assets (screenshots, metadata)
- Analytics / crash reporting SDK
- Onboarding tutorial / walkthrough
