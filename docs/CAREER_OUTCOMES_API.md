# Career Outcomes API

This document describes the career outcomes endpoints added to the Portal backend.

## Authentication & Permissions

All career outcomes endpoints require:
- Valid JWT authentication (via `JwtAuthGuard`)
- School permission (user must have `permission: 'school'`)
- School reference ID in the authenticated user's profile

## Endpoints

### GET /getStudentJobOutcomes

Returns job outcome metrics for students graduating in the next 12 months.

**Query Parameters:** None (uses authenticated user's schoolRefId)

**Response:**
```typescript
{
  placementRate: {
    current: number,      // Percentage (0-100) of students with accepted jobs
    lastYear: number      // Same metric for 12-24 months ago
  },
  averageSalary: {
    current: number,      // Average salary of placed students
    lastYear: number      // Same metric for 12-24 months ago
  },
  timeToPlacement: {
    current: number,      // Average months from graduation to job acceptance (in past year)
    lastYear: number      // Same metric for previous year
  },
  activeJobSeekers: {
    current: number,      // Number of graduating students without accepted jobs
    lastYear: number      // Same metric for 12-24 months ago
  }
}
```

### GET /getPlacementBySport

Returns placement statistics grouped by sport.

**Query Parameters:**
- `sport` (optional): Filter by specific sport
- `industry` (optional): Filter by job industry
- `year` (optional): Graduation year (defaults to current year)

**Response:**
```typescript
[
  {
    sport: string,              // Sport name
    athletesWithJobs: number,   // Number with accepted jobs
    totalAthletes: number       // Total graduating athletes
  },
  ...
]
```

### GET /getSalaryDistribution

Returns distribution of salaries across salary ranges.

**Query Parameters:**
- `sport` (optional): Filter by specific sport
- `industry` (optional): Filter by job industry
- `year` (optional): Graduation year (defaults to current year)

**Response:**
```typescript
{
  over100k: number,        // Count of jobs with salary >= $100,000
  range80kTo99k: number,   // Count of jobs with salary $80,000-$99,999
  range60kTo79k: number,   // Count of jobs with salary $60,000-$79,999
  range40kTo59k: number,   // Count of jobs with salary $40,000-$59,999
  under40k: number         // Count of jobs with salary < $40,000
}
```

### GET /getStudentOutcomes

Returns detailed list of students with their job status and metrics.

**Query Parameters:**
- `sport` (optional): Filter by specific sport
- `industry` (optional): Filter by job industry
- `year` (optional): Graduation year (defaults to current year)
- `hasJob` (optional): Filter by job status (true/false)

**Response:**
```typescript
[
  {
    id: string,
    name: string,
    sport: string,
    hasJob: boolean,
    major: string,
    gpa: number,
    industry: string,
    graduationDate: Date,
    internshipCount: number,
    nilCount: number,
    location: string
  },
  ...
]
```

## Business Logic Notes

1. **"Has a Job"**: An athlete is considered to have a job if they have an accepted application for a job of type 'job' (not internship or NIL).

2. **Graduation Periods**:
   - "Next year" = Next 12 months from today
   - "Last year" = 12-24 months ago from today
   - Year filters use calendar year (Jan 1 - Dec 31)

3. **Time to Placement**: Calculated as months between graduation date and job acceptance date. If the job was accepted before graduation, it counts as 0 months.

4. **Filters**: Industry and sport filters apply to the job and athlete respectively. The hasJob filter determines whether to include students with or without accepted jobs.
