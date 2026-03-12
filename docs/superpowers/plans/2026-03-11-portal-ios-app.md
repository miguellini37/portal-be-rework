# Portal iOS App Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a native iOS app for Portal Jobs with full feature parity across all user roles (athlete, employer, school, admin).

**Architecture:** SwiftUI + MVVM with `@Observable` (iOS 18+). Pure Apple stack except `socket.io-client-swift` for real-time messaging. Keycloak PKCE auth via `ASWebAuthenticationSession`. Single `APIClient` actor with async/await for all REST calls.

**Tech Stack:** Swift 6, SwiftUI, iOS 18+, URLSession, ASWebAuthenticationSession, Security.framework (Keychain), socket.io-client-swift (SPM)

**Spec:** `docs/superpowers/specs/2026-03-11-portal-ios-app-design.md`

---

## Chunk 1: Project Setup & Core Infrastructure

### Task 1: Create Xcode project and SPM dependency

**Files:**
- Create: Xcode project via Xcode GUI (required — CLI cannot generate `.xcodeproj` with proper build settings)
- Create: `PortalApp/Info.plist`

- [ ] **Step 1: Create the Xcode project in Xcode**

Open Xcode → File → New → Project → iOS → App:
- Product Name: `PortalApp`
- Team: (your team)
- Organization Identifier: `com.portaljobs`
- Interface: SwiftUI
- Language: Swift
- Testing System: Swift Testing
- Storage: None
- Save to: `/Users/Shared/Portaljobs-repos/portal-ios/`

This creates `PortalApp.xcodeproj`, `PortalApp/` source directory, and `PortalAppTests/`.

- [ ] **Step 2: Initialize git repo**

```bash
cd /Users/Shared/Portaljobs-repos/portal-ios
git init
```

Create `.gitignore`:

```
# Xcode
*.xcuserdata/
DerivedData/
*.xcworkspace/xcuserdata/
build/

# SPM
.build/
.swiftpm/

# macOS
.DS_Store
```

- [ ] **Step 3: Configure custom URL scheme**

In Xcode: Select PortalApp target → Info tab → URL Types → Add:
- Identifier: `com.portaljobs.app`
- URL Schemes: `portaljobs`
- Role: Editor

Or manually add to `Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>portaljobs</string>
        </array>
        <key>CFBundleURLName</key>
        <string>com.portaljobs.app</string>
    </dict>
</array>
```

- [ ] **Step 4: Set deployment target to iOS 18.0**

In Xcode: Select PortalApp target → General → Minimum Deployments → iOS 18.0

- [ ] **Step 5: Add Socket.IO SPM dependency**

In Xcode: File → Add Package Dependencies → Enter URL: `https://github.com/socketio/socket.io-client-swift` → Version: Up to Next Major from `16.1.1` → Add to target: PortalApp

- [ ] **Step 6: Build to verify project compiles**

```bash
xcodebuild -project PortalApp.xcodeproj -scheme PortalApp -destination 'platform=iOS Simulator,name=iPhone 16' build
```

Expected: BUILD SUCCEEDED

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Initialize iOS project with SwiftUI and Socket.IO dependency"
```

---

### Task 2: Theme system

**Files:**
- Create: `PortalApp/PortalApp/Shared/Theme/PortalColors.swift`
- Create: `PortalApp/PortalApp/Shared/Theme/PortalTheme.swift`

- [ ] **Step 1: Create color definitions**

Create `PortalApp/PortalApp/Shared/Theme/PortalColors.swift`:

```swift
import SwiftUI

extension Color {
    static let portalBlue = Color(hex: 0x046ee5)
    static let portalNavy = Color(hex: 0x0a0f2e)
    static let portalNavyLight = Color(hex: 0x131a3e)
    static let portalSurface = Color(hex: 0xf8fafc)
    static let portalTextPrimary = Color(hex: 0x0a0f2e)
    static let portalTextSecondary = Color(hex: 0x64748b)
    static let portalTextTertiary = Color(hex: 0x94a3b8)
    static let portalSuccess = Color(hex: 0x10b981)
    static let portalWarning = Color(hex: 0xf59e0b)
    static let portalError = Color(hex: 0xef4444)

    init(hex: UInt, opacity: Double = 1.0) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xff) / 255,
            green: Double((hex >> 8) & 0xff) / 255,
            blue: Double(hex & 0xff) / 255,
            opacity: opacity
        )
    }
}
```

- [ ] **Step 2: Create theme struct**

Create `PortalApp/PortalApp/Shared/Theme/PortalTheme.swift`:

```swift
import SwiftUI

enum PortalTheme {
    static let navyGradient = LinearGradient(
        colors: [.portalNavy, .portalNavyLight],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let cornerRadius: CGFloat = 16
    static let cardPadding: CGFloat = 16
    static let sectionSpacing: CGFloat = 24
}
```

- [ ] **Step 3: Verify it compiles**

```bash
xcodebuild build -scheme PortalApp -destination 'platform=iOS Simulator,name=iPhone 16'
```

- [ ] **Step 4: Commit**

```bash
git add PortalApp/PortalApp/Shared/
git commit -m "Add theme system with Portal brand colors and gradients"
```

---

### Task 3: Keychain wrapper

**Files:**
- Create: `PortalApp/PortalApp/Core/Keychain/KeychainService.swift`
- Create: `PortalApp/PortalAppTests/Core/KeychainServiceTests.swift`

- [ ] **Step 1: Write the tests**

Create `PortalApp/PortalAppTests/Core/KeychainServiceTests.swift`:

```swift
import Testing
@testable import PortalApp

@Suite("KeychainService")
struct KeychainServiceTests {

    let keychain = KeychainService(service: "com.portaljobs.test")

    init() {
        // Clean up before each test
        keychain.delete(key: "testKey")
    }

    @Test func saveAndRetrieve() {
        keychain.save(key: "testKey", value: "testValue")
        let result = keychain.retrieve(key: "testKey")
        #expect(result == "testValue")
    }

    @Test func retrieveNonExistent() {
        let result = keychain.retrieve(key: "nonExistent")
        #expect(result == nil)
    }

    @Test func deleteKey() {
        keychain.save(key: "testKey", value: "testValue")
        keychain.delete(key: "testKey")
        let result = keychain.retrieve(key: "testKey")
        #expect(result == nil)
    }

    @Test func overwriteExistingKey() {
        keychain.save(key: "testKey", value: "first")
        keychain.save(key: "testKey", value: "second")
        let result = keychain.retrieve(key: "testKey")
        #expect(result == "second")
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
xcodebuild test -scheme PortalApp -destination 'platform=iOS Simulator,name=iPhone 16'
```

Expected: FAIL — `KeychainService` not defined

- [ ] **Step 3: Implement KeychainService**

Create `PortalApp/PortalApp/Core/Keychain/KeychainService.swift`:

```swift
import Foundation
import Security

struct KeychainService {
    let service: String

    init(service: String = "com.portaljobs.app") {
        self.service = service
    }

    func save(key: String, value: String) {
        guard let data = value.data(using: .utf8) else { return }

        // Delete existing item first
        delete(key: key)

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ]

        SecItemAdd(query as CFDictionary, nil)
    }

    func retrieve(key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess, let data = result as? Data else {
            return nil
        }
        return String(data: data, encoding: .utf8)
    }

    func delete(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]

        SecItemDelete(query as CFDictionary)
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
xcodebuild test -scheme PortalApp -destination 'platform=iOS Simulator,name=iPhone 16'
```

Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add PortalApp/PortalApp/Core/Keychain/ PortalApp/PortalAppTests/Core/
git commit -m "Add KeychainService for secure token storage"
```

---

### Task 4: Codable models

**Files:**
- Create: `PortalApp/PortalApp/Core/Models/User.swift`
- Create: `PortalApp/PortalApp/Core/Models/Job.swift`
- Create: `PortalApp/PortalApp/Core/Models/Application.swift`
- Create: `PortalApp/PortalApp/Core/Models/Interview.swift`
- Create: `PortalApp/PortalApp/Core/Models/Company.swift`
- Create: `PortalApp/PortalApp/Core/Models/School.swift`
- Create: `PortalApp/PortalApp/Core/Models/Message.swift`
- Create: `PortalApp/PortalApp/Core/Models/Activity.swift`
- Create: `PortalApp/PortalApp/Core/Models/Enums.swift`

- [ ] **Step 1: Create enums**

Create `PortalApp/PortalApp/Core/Models/Enums.swift`:

```swift
import Foundation

enum UserPermission: String, Codable {
    case athlete
    case company
    case school
    case admin
}

enum JobType: String, Codable {
    case internship
    case job
    case nil_ = "nil"
}

enum JobStatus: String, Codable {
    case open
    case closed
    case filled
}

enum ApplicationStatus: String, Codable {
    case applied
    case underReview = "under_review"
    case interviewRequested = "interview_requested"
    case accepted
    case rejected
    case withdrawn
}

enum InterviewStatus: String, Codable {
    case scheduled
    case cancelled
    case complete
}

enum ActivityType: String, Codable {
    case application
    case interview
    case other
}
```

- [ ] **Step 2: Create User models**

Create `PortalApp/PortalApp/Core/Models/User.swift`:

```swift
import Foundation

struct User: Codable, Identifiable {
    let id: String
    var email: String?
    var permission: UserPermission?
    var firstName: String?
    var lastName: String?
    var phone: String?
    var location: String?
    var bio: String?
    var isVerified: Bool?
}

struct Athlete: Codable, Identifiable {
    let id: String
    var email: String?
    var firstName: String?
    var lastName: String?
    var phone: String?
    var location: String?
    var bio: String?
    var isVerified: Bool?
    var academics: Academics?
    var athletics: Athletics?
    var school: School?
}

struct Academics: Codable {
    var major: String?
    var minor: String?
    var gpa: String?
    var graduationDate: String?
    var awards: String?
    var coursework: String?
}

struct Athletics: Codable {
    var sport: String?
    var position: String?
    var division: String?
    var conference: String?
    var yearsPlayed: String?
    var leadershipRoles: String?
    var achievements: String?
    var statistics: String?
    var skills: [String]?
}

struct CompanyEmployee: Codable, Identifiable {
    let id: String
    var email: String?
    var firstName: String?
    var lastName: String?
    var phone: String?
    var bio: String?
    var linkedIn: String?
    var position: String?
    var roleType: String?
    var isFormerAthlete: Bool?
    var athleteSport: String?
    var athletePosition: String?
    var athleteUniversity: String?
    var athleteGraduationYear: String?
    var athleteAchievements: String?
    var company: Company?
}

struct SchoolEmployee: Codable, Identifiable {
    let id: String
    var email: String?
    var firstName: String?
    var lastName: String?
    var phone: String?
    var bio: String?
    var linkedIn: String?
    var position: String?
    var department: String?
    var officeLocation: String?
    var officeHours: String?
    var school: School?
}
```

- [ ] **Step 3: Create remaining models**

Create `PortalApp/PortalApp/Core/Models/Company.swift`:

```swift
import Foundation

struct Company: Codable, Identifiable {
    let id: String
    var companyName: String?
    var orgDomain: String?
    var industry: String?
    var culture: CompanyCulture?
    var benefits: CompanyBenefits?
    var recruiting: CompanyRecruiting?
    var ownerId: String?
}

struct CompanyCulture: Codable {
    var cultureValues: [String]?
    var environmentTiles: [String]?
    var thrivePoints: [String]?
}

struct CompanyBenefits: Codable {
    var baseSalaryMin: Double?
    var baseSalaryMax: Double?
    var commissionMin: Double?
    var commissionMax: Double?
    var totalCompMin: Double?
    var totalCompMax: Double?
    var specificBenefits: [String]?
}

struct CompanyRecruiting: Codable {
    var strategy: [String]?
    var processSteps: [String]?
    var recruiterIds: [String]?
}
```

Create `PortalApp/PortalApp/Core/Models/School.swift`:

```swift
import Foundation

struct School: Codable, Identifiable {
    let id: String
    var schoolName: String?
    var ownerId: String?
}
```

Create `PortalApp/PortalApp/Core/Models/Job.swift`:

```swift
import Foundation

struct Job: Codable, Identifiable {
    let id: String
    var position: String?
    var description: String?
    var industry: String?
    var experience: String?
    var applicationDeadline: String?
    var benefits: String?
    var type: JobType?
    var requirements: String?
    var location: String?
    var salary: Double?
    var tags: [String]?
    var paymentType: String?
    var duration: String?
    var athleteBenefits: String?
    var status: JobStatus?
    var createdDate: String?
    var company: Company?
    var companyId: String?
    var ownerId: String?
}
```

Create `PortalApp/PortalApp/Core/Models/Application.swift`:

```swift
import Foundation

struct Application: Codable, Identifiable {
    let id: String
    var creationDate: String?
    var terminalStatusDate: String?
    var employerReviewed: Bool?
    var status: ApplicationStatus?
    var job: Job?
    var jobId: String?
    var athleteId: String?
    var interview: Interview?
    var interviewId: String?
}
```

Create `PortalApp/PortalApp/Core/Models/Interview.swift`:

```swift
import Foundation

struct Interview: Codable, Identifiable {
    let id: String
    var dateTime: String?
    var location: String?
    var interviewer: String?
    var preparationTips: String?
    var status: InterviewStatus?
    var creationDate: String?
    var jobId: String?
    var applicationId: String?
    var companyId: String?
    var athleteId: String?
}
```

Create `PortalApp/PortalApp/Core/Models/Message.swift`:

```swift
import Foundation

struct Message: Codable, Identifiable {
    let id: String
    var conversationId: String?
    var fromUserId: String?
    var toUserId: String?
    var message: String?
    var readAt: String?
    var createdAt: String?
}

struct RecentConversation: Codable, Identifiable {
    let id: String
    var conversationId: String?
    var otherUserId: String?
    var otherUserName: String?
    var lastMessage: String?
    var lastMessageDate: String?
    var unreadCount: Int?
}

struct ConversationResponse: Codable {
    var messages: [Message]?
    var otherUser: UserToMessage?
}

struct UserToMessage: Codable, Identifiable {
    let id: String
    var firstName: String?
    var lastName: String?
    var email: String?
    var permission: UserPermission?
}

struct SendMessageResponse: Codable {
    var id: String?
    var conversationId: String?
    var fromUserId: String?
    var toUserId: String?
    var message: String?
    var createdAt: String?
}
```

Create `PortalApp/PortalApp/Core/Models/Activity.swift`:

```swift
import Foundation

struct Activity: Codable, Identifiable {
    let id: String
    var activityId: String?
    var type: ActivityType?
    var message: String?
    var date: String?
    var userId: String?
    var applicationId: String?
    var interviewId: String?
}
```

- [ ] **Step 4: Verify it compiles**

```bash
xcodebuild build -scheme PortalApp -destination 'platform=iOS Simulator,name=iPhone 16'
```

Expected: BUILD SUCCEEDED

- [ ] **Step 5: Commit**

```bash
git add PortalApp/PortalApp/Core/Models/
git commit -m "Add Codable models matching backend entities"
```

---

### Task 5: APIClient actor

**Files:**
- Create: `PortalApp/PortalApp/Core/Networking/APIClient.swift`
- Create: `PortalApp/PortalApp/Core/Networking/APIError.swift`
- Create: `PortalApp/PortalApp/Core/Networking/APIConfig.swift`

- [ ] **Step 1: Create API error types**

Create `PortalApp/PortalApp/Core/Networking/APIError.swift`:

```swift
import Foundation

enum APIError: Error, LocalizedError {
    case invalidURL
    case unauthorized
    case forbidden
    case notFound
    case serverError(statusCode: Int, body: String?)
    case decodingError(Error)
    case networkError(Error)
    case noData

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .unauthorized: return "Session expired. Please log in again."
        case .forbidden: return "You don't have permission to do this."
        case .notFound: return "Not found."
        case .serverError(let code, _): return "Server error (\(code))"
        case .decodingError(let error): return "Data error: \(error.localizedDescription)"
        case .networkError(let error): return "Network error: \(error.localizedDescription)"
        case .noData: return "No data received"
        }
    }
}
```

- [ ] **Step 2: Create API config**

Create `PortalApp/PortalApp/Core/Networking/APIConfig.swift`:

```swift
import Foundation

enum APIConfig {
    #if DEBUG
    static let baseURL = "http://localhost:3001"
    static let keycloakURL = "http://localhost:8180"
    #else
    static let baseURL = "https://api.portaljobs.net"
    static let keycloakURL = "https://auth.portaljobs.net"
    #endif

    static let keycloakRealm = "portal-jobs"
    static let keycloakClientId = "portal-frontend"
    static let redirectURI = "portaljobs://auth/callback"
}
```

- [ ] **Step 3: Create APIClient**

Create `PortalApp/PortalApp/Core/Networking/APIClient.swift`:

```swift
import Foundation

actor APIClient {
    static let shared = APIClient()

    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder
    private let keychain: KeychainService

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        self.session = URLSession(configuration: config)
        self.decoder = JSONDecoder()
        self.encoder = JSONEncoder()
        self.keychain = KeychainService()
    }

    // MARK: - Generic request methods

    func get<T: Decodable>(_ path: String, queryItems: [URLQueryItem]? = nil) async throws -> T {
        let request = try buildRequest(method: "GET", path: path, queryItems: queryItems)
        return try await execute(request)
    }

    func post<T: Decodable, B: Encodable>(_ path: String, body: B) async throws -> T {
        var request = try buildRequest(method: "POST", path: path)
        request.httpBody = try encoder.encode(body)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        return try await execute(request)
    }

    func post(_ path: String) async throws {
        let request = try buildRequest(method: "POST", path: path)
        try await executeVoid(request)
    }

    func put<T: Decodable, B: Encodable>(_ path: String, body: B) async throws -> T {
        var request = try buildRequest(method: "PUT", path: path)
        request.httpBody = try encoder.encode(body)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        return try await execute(request)
    }

    func patch<T: Decodable, B: Encodable>(_ path: String, body: B) async throws -> T {
        var request = try buildRequest(method: "PATCH", path: path)
        request.httpBody = try encoder.encode(body)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        return try await execute(request)
    }

    // MARK: - Token management

    func setTokens(accessToken: String, refreshToken: String) {
        keychain.save(key: "accessToken", value: accessToken)
        keychain.save(key: "refreshToken", value: refreshToken)
    }

    func clearTokens() {
        keychain.delete(key: "accessToken")
        keychain.delete(key: "refreshToken")
    }

    var hasTokens: Bool {
        keychain.retrieve(key: "refreshToken") != nil
    }

    var accessToken: String? {
        keychain.retrieve(key: "accessToken")
    }

    func tryRefreshToken() async throws {
        try await refreshAccessToken()
    }

    // MARK: - Private

    private func buildRequest(method: String, path: String, queryItems: [URLQueryItem]? = nil) throws -> URLRequest {
        guard var components = URLComponents(string: APIConfig.baseURL + "/" + path) else {
            throw APIError.invalidURL
        }
        if let queryItems, !queryItems.isEmpty {
            components.queryItems = queryItems
        }
        guard let url = components.url else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method

        if let token = keychain.retrieve(key: "accessToken") {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        return request
    }

    private func execute<T: Decodable>(_ request: URLRequest, isRetry: Bool = false) async throws -> T {
        do {
            let (data, response) = try await session.data(for: request)
            let statusCode = (response as? HTTPURLResponse)?.statusCode ?? 0

            if statusCode == 401 && !isRetry {
                try await refreshAccessToken()
                var retryRequest = request
                if let token = keychain.retrieve(key: "accessToken") {
                    retryRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
                }
                return try await execute(retryRequest, isRetry: true)
            }

            try validateResponse(statusCode: statusCode, data: data)

            do {
                return try decoder.decode(T.self, from: data)
            } catch {
                throw APIError.decodingError(error)
            }
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.networkError(error)
        }
    }

    private func executeVoid(_ request: URLRequest, isRetry: Bool = false) async throws {
        do {
            let (data, response) = try await session.data(for: request)
            let statusCode = (response as? HTTPURLResponse)?.statusCode ?? 0

            if statusCode == 401 && !isRetry {
                try await refreshAccessToken()
                var retryRequest = request
                if let token = keychain.retrieve(key: "accessToken") {
                    retryRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
                }
                try await executeVoid(retryRequest, isRetry: true)
                return
            }

            try validateResponse(statusCode: statusCode, data: data)
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.networkError(error)
        }
    }

    private func validateResponse(statusCode: Int, data: Data) throws {
        switch statusCode {
        case 200...299:
            return
        case 401:
            throw APIError.unauthorized
        case 403:
            throw APIError.forbidden
        case 404:
            throw APIError.notFound
        default:
            let body = String(data: data, encoding: .utf8)
            throw APIError.serverError(statusCode: statusCode, body: body)
        }
    }

    private func refreshAccessToken() async throws {
        guard let refreshToken = keychain.retrieve(key: "refreshToken") else {
            throw APIError.unauthorized
        }

        let tokenURL = "\(APIConfig.keycloakURL)/realms/\(APIConfig.keycloakRealm)/protocol/openid-connect/token"
        guard let url = URL(string: tokenURL) else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")

        let body = "grant_type=refresh_token&client_id=\(APIConfig.keycloakClientId)&refresh_token=\(refreshToken)"
        request.httpBody = body.data(using: .utf8)

        let (data, response) = try await session.data(for: request)
        let statusCode = (response as? HTTPURLResponse)?.statusCode ?? 0

        guard statusCode == 200 else {
            clearTokens()
            throw APIError.unauthorized
        }

        struct TokenResponse: Decodable {
            let accessToken: String
            let refreshToken: String

            enum CodingKeys: String, CodingKey {
                case accessToken = "access_token"
                case refreshToken = "refresh_token"
            }
        }

        let tokenResponse = try decoder.decode(TokenResponse.self, from: data)
        setTokens(accessToken: tokenResponse.accessToken, refreshToken: tokenResponse.refreshToken)
    }
}
```

- [ ] **Step 4: Verify it compiles**

```bash
xcodebuild build -scheme PortalApp -destination 'platform=iOS Simulator,name=iPhone 16'
```

Expected: BUILD SUCCEEDED

- [ ] **Step 5: Commit**

```bash
git add PortalApp/PortalApp/Core/Networking/
git commit -m "Add APIClient actor with auth token management and auto-refresh"
```

---

## Chunk 1b: Auth, Socket & Shared Components

### Task 6: Auth service

**Files:**
- Create: `PortalApp/PortalApp/Core/Auth/AuthService.swift`
- Create: `PortalApp/PortalApp/Core/Auth/AuthState.swift`
- Create: `PortalApp/PortalApp/Core/Auth/JWTDecoder.swift`

- [ ] **Step 1: Create JWT decoder**

Create `PortalApp/PortalApp/Core/Auth/JWTDecoder.swift`:

```swift
import Foundation

struct JWTPayload {
    let sub: String
    let email: String?
    let permission: UserPermission?
    let schoolId: String?
    let companyId: String?
    let exp: Date?
}

enum JWTDecoder {
    static func decode(_ jwt: String) -> JWTPayload? {
        let parts = jwt.split(separator: ".")
        guard parts.count == 3 else { return nil }

        let payload = String(parts[1])
        guard let data = base64URLDecode(payload) else { return nil }
        guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }

        let sub = json["sub"] as? String ?? ""
        let email = json["email"] as? String
        let permissionStr = json["permission"] as? String
        let permission = permissionStr.flatMap { UserPermission(rawValue: $0) }
        let schoolId = json["schoolId"] as? String
        let companyId = json["companyId"] as? String
        let expTimestamp = json["exp"] as? TimeInterval
        let exp = expTimestamp.map { Date(timeIntervalSince1970: $0) }

        return JWTPayload(
            sub: sub,
            email: email,
            permission: permission,
            schoolId: schoolId,
            companyId: companyId,
            exp: exp
        )
    }

    private static func base64URLDecode(_ string: String) -> Data? {
        var base64 = string
            .replacingOccurrences(of: "-", with: "+")
            .replacingOccurrences(of: "_", with: "/")

        let remainder = base64.count % 4
        if remainder > 0 {
            base64 += String(repeating: "=", count: 4 - remainder)
        }

        return Data(base64Encoded: base64)
    }
}
```

- [ ] **Step 2: Create AuthState**

Create `PortalApp/PortalApp/Core/Auth/AuthState.swift`:

```swift
import Foundation
import Observation

@Observable
final class AuthState {
    var isAuthenticated = false
    var isLoading = true
    var userId: String?
    var email: String?
    var permission: UserPermission?
    var schoolId: String?
    var companyId: String?

    var isAthlete: Bool { permission == .athlete }
    var isEmployer: Bool { permission == .company }
    var isSchool: Bool { permission == .school }
    var isAdmin: Bool { permission == .admin }

    func update(from jwt: JWTPayload) {
        userId = jwt.sub
        email = jwt.email
        permission = jwt.permission
        schoolId = jwt.schoolId
        companyId = jwt.companyId
        isAuthenticated = true
        isLoading = false
    }

    func clear() {
        userId = nil
        email = nil
        permission = nil
        schoolId = nil
        companyId = nil
        isAuthenticated = false
        isLoading = false
    }
}
```

- [ ] **Step 3: Create AuthService**

Create `PortalApp/PortalApp/Core/Auth/AuthService.swift`:

```swift
import Foundation
import AuthenticationServices
import CryptoKit

enum AuthService {

    static func login() async throws -> JWTPayload {
        let codeVerifier = generateCodeVerifier()
        let codeChallenge = generateCodeChallenge(from: codeVerifier)

        let authURL = buildAuthURL(codeChallenge: codeChallenge)
        let callbackURL = try await performWebAuth(url: authURL)
        let code = try extractCode(from: callbackURL)
        let tokens = try await exchangeCodeForTokens(code: code, codeVerifier: codeVerifier)

        await APIClient.shared.setTokens(
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        )

        guard let payload = JWTDecoder.decode(tokens.accessToken) else {
            throw APIError.unauthorized
        }

        return payload
    }

    static func tryRestoreSession() async -> JWTPayload? {
        guard await APIClient.shared.hasTokens,
              let token = await APIClient.shared.accessToken,
              let payload = JWTDecoder.decode(token) else {
            return nil
        }

        // Check if token is expired
        if let exp = payload.exp, exp < Date() {
            // Try refresh via dedicated method
            do {
                try await APIClient.shared.tryRefreshToken()
                guard let newToken = await APIClient.shared.accessToken,
                      let newPayload = JWTDecoder.decode(newToken) else {
                    return nil
                }
                return newPayload
            } catch {
                return nil
            }
        }

        return payload
    }

    static func logout() async {
        await APIClient.shared.clearTokens()
    }

    // MARK: - PKCE helpers

    private static func generateCodeVerifier() -> String {
        var buffer = [UInt8](repeating: 0, count: 32)
        _ = SecRandomCopyBytes(kSecRandomDefault, buffer.count, &buffer)
        return Data(buffer).base64URLEncodedString()
    }

    private static func generateCodeChallenge(from verifier: String) -> String {
        guard let data = verifier.data(using: .ascii) else { return verifier }
        let hash = SHA256.hash(data: data)
        return Data(hash).base64URLEncodedString()
    }

    private static func buildAuthURL(codeChallenge: String) -> URL {
        var components = URLComponents(string: "\(APIConfig.keycloakURL)/realms/\(APIConfig.keycloakRealm)/protocol/openid-connect/auth")!
        components.queryItems = [
            URLQueryItem(name: "client_id", value: APIConfig.keycloakClientId),
            URLQueryItem(name: "redirect_uri", value: APIConfig.redirectURI),
            URLQueryItem(name: "response_type", value: "code"),
            URLQueryItem(name: "scope", value: "openid"),
            URLQueryItem(name: "code_challenge", value: codeChallenge),
            URLQueryItem(name: "code_challenge_method", value: "S256")
        ]
        return components.url!
    }

    @MainActor
    private static func performWebAuth(url: URL) async throws -> URL {
        try await withCheckedThrowingContinuation { continuation in
            let session = ASWebAuthenticationSession(
                url: url,
                callbackURLScheme: "portaljobs"
            ) { callbackURL, error in
                if let error {
                    continuation.resume(throwing: error)
                } else if let callbackURL {
                    continuation.resume(returning: callbackURL)
                } else {
                    continuation.resume(throwing: APIError.unauthorized)
                }
            }
            session.presentationContextProvider = WebAuthPresentationContext.shared
            session.prefersEphemeralWebBrowserSession = false
            session.start()
        }
    }

    private static func extractCode(from url: URL) throws -> String {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
              let code = components.queryItems?.first(where: { $0.name == "code" })?.value else {
            throw APIError.unauthorized
        }
        return code
    }

    private static func exchangeCodeForTokens(code: String, codeVerifier: String) async throws -> TokenPair {
        let tokenURL = "\(APIConfig.keycloakURL)/realms/\(APIConfig.keycloakRealm)/protocol/openid-connect/token"
        guard let url = URL(string: tokenURL) else { throw APIError.invalidURL }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")

        let body = [
            "grant_type=authorization_code",
            "client_id=\(APIConfig.keycloakClientId)",
            "redirect_uri=\(APIConfig.redirectURI)",
            "code=\(code)",
            "code_verifier=\(codeVerifier)"
        ].joined(separator: "&")
        request.httpBody = body.data(using: .utf8)

        let (data, response) = try await URLSession.shared.data(for: request)
        let statusCode = (response as? HTTPURLResponse)?.statusCode ?? 0

        guard statusCode == 200 else {
            throw APIError.unauthorized
        }

        return try JSONDecoder().decode(TokenPair.self, from: data)
    }
}

private struct TokenPair: Decodable {
    let accessToken: String
    let refreshToken: String

    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
    }
}

// MARK: - Helpers

extension Data {
    func base64URLEncodedString() -> String {
        base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
}

@MainActor
final class WebAuthPresentationContext: NSObject, ASWebAuthenticationPresentationContextProviding {
    static let shared = WebAuthPresentationContext()

    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = scene.windows.first else {
            return ASPresentationAnchor()
        }
        return window
    }
}
```

- [ ] **Step 4: Verify it compiles**

```bash
xcodebuild build -scheme PortalApp -destination 'platform=iOS Simulator,name=iPhone 16'
```

Expected: BUILD SUCCEEDED

- [ ] **Step 5: Commit**

```bash
git add PortalApp/PortalApp/Core/Auth/
git commit -m "Add Keycloak PKCE auth with JWT decoding and session restore"
```

---

### Task 7: Socket.IO service

**Files:**
- Create: `PortalApp/PortalApp/Core/Socket/SocketService.swift`

- [ ] **Step 1: Create SocketService**

Create `PortalApp/PortalApp/Core/Socket/SocketService.swift`:

```swift
import Foundation
import SocketIO
import Observation

@Observable
final class SocketService {
    static let shared = SocketService()

    private var manager: SocketManager?
    private var socket: SocketIOClient?
    private(set) var isConnected = false

    var onNewMessage: ((SendMessageResponse) -> Void)?

    private init() {}

    func connect(userId: String, token: String) {
        let url = URL(string: APIConfig.baseURL)!
        manager = SocketManager(socketURL: url, config: [
            .path("/subscription"),
            .connectParams(["token": token]),
            .forceWebsockets(true),
            .reconnects(true),
            .reconnectWait(2),
            .reconnectWaitMax(30)
        ])

        socket = manager?.defaultSocket

        socket?.on(clientEvent: .connect) { [weak self] _, _ in
            self?.isConnected = true
            self?.socket?.emit("subscribe", ["userId": userId])
        }

        socket?.on(clientEvent: .disconnect) { [weak self] _, _ in
            self?.isConnected = false
        }

        socket?.on("newMessage") { [weak self] data, _ in
            guard let dict = data.first as? [String: Any],
                  let jsonData = try? JSONSerialization.data(withJSONObject: dict),
                  let message = try? JSONDecoder().decode(SendMessageResponse.self, from: jsonData) else {
                return
            }
            self?.onNewMessage?(message)
        }

        socket?.connect()
    }

    func disconnect() {
        socket?.disconnect()
        manager = nil
        socket = nil
        isConnected = false
    }
}
```

- [ ] **Step 2: Verify it compiles**

```bash
xcodebuild build -scheme PortalApp -destination 'platform=iOS Simulator,name=iPhone 16'
```

Expected: BUILD SUCCEEDED

- [ ] **Step 3: Commit**

```bash
git add PortalApp/PortalApp/Core/Socket/
git commit -m "Add Socket.IO service for real-time messaging"
```

---

### Task 8: Shared UI components

**Files:**
- Create: `PortalApp/PortalApp/Shared/Components/PortalCard.swift`
- Create: `PortalApp/PortalApp/Shared/Components/StatBadge.swift`
- Create: `PortalApp/PortalApp/Shared/Components/StatusPill.swift`
- Create: `PortalApp/PortalApp/Shared/Components/GradientHeader.swift`
- Create: `PortalApp/PortalApp/Shared/Components/FilterBar.swift`
- Create: `PortalApp/PortalApp/Shared/Components/EmptyState.swift`
- Create: `PortalApp/PortalApp/Shared/Components/LoadingState.swift`
- Create: `PortalApp/PortalApp/Shared/Components/JobCard.swift`
- Create: `PortalApp/PortalApp/Shared/Components/AthleteCard.swift`

- [ ] **Step 1: Create PortalCard**

Create `PortalApp/PortalApp/Shared/Components/PortalCard.swift`:

```swift
import SwiftUI

struct PortalCard<Content: View>: View {
    let content: Content
    var featured: Bool = false

    init(featured: Bool = false, @ViewBuilder content: () -> Content) {
        self.featured = featured
        self.content = content()
    }

    var body: some View {
        content
            .padding(PortalTheme.cardPadding)
            .background(Color(.systemBackground))
            .clipShape(RoundedRectangle(cornerRadius: PortalTheme.cornerRadius))
            .shadow(color: .black.opacity(0.06), radius: 8, y: 2)
            .overlay(
                RoundedRectangle(cornerRadius: PortalTheme.cornerRadius)
                    .stroke(
                        featured
                            ? LinearGradient(colors: [.portalBlue, .cyan], startPoint: .topLeading, endPoint: .bottomTrailing)
                            : LinearGradient(colors: [.clear], startPoint: .top, endPoint: .bottom),
                        lineWidth: featured ? 1.5 : 0
                    )
            )
    }
}
```

- [ ] **Step 2: Create StatBadge**

Create `PortalApp/PortalApp/Shared/Components/StatBadge.swift`:

```swift
import SwiftUI

struct StatBadge: View {
    let value: Int
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Text("\(value)")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundStyle(color)
            Text(label)
                .font(.caption2)
                .foregroundStyle(.portalTextTertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(color.opacity(0.1))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(color.opacity(0.2), lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}
```

- [ ] **Step 3: Create StatusPill**

Create `PortalApp/PortalApp/Shared/Components/StatusPill.swift`:

```swift
import SwiftUI

struct StatusPill: View {
    let status: ApplicationStatus

    var body: some View {
        Text(status.displayName)
            .font(.caption2)
            .fontWeight(.medium)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .foregroundStyle(status.color)
            .background(status.color.opacity(0.1))
            .clipShape(Capsule())
    }
}

extension ApplicationStatus {
    var displayName: String {
        switch self {
        case .applied: return "Applied"
        case .underReview: return "Under Review"
        case .interviewRequested: return "Interview"
        case .accepted: return "Accepted"
        case .rejected: return "Rejected"
        case .withdrawn: return "Withdrawn"
        }
    }

    var color: Color {
        switch self {
        case .applied: return .portalBlue
        case .underReview: return .portalWarning
        case .interviewRequested: return .portalBlue
        case .accepted: return .portalSuccess
        case .rejected: return .portalError
        case .withdrawn: return .portalTextTertiary
        }
    }
}
```

- [ ] **Step 4: Create GradientHeader**

Create `PortalApp/PortalApp/Shared/Components/GradientHeader.swift`:

```swift
import SwiftUI

struct GradientHeader<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal)
            .padding(.vertical, PortalTheme.sectionSpacing)
            .background(PortalTheme.navyGradient)
    }
}
```

- [ ] **Step 5: Create FilterBar**

Create `PortalApp/PortalApp/Shared/Components/FilterBar.swift`:

```swift
import SwiftUI

struct FilterBar: View {
    let filters: [String]
    @Binding var selected: Set<String>

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(filters, id: \.self) { filter in
                    let isActive = selected.contains(filter)
                    Button {
                        if isActive {
                            selected.remove(filter)
                        } else {
                            selected.insert(filter)
                        }
                    } label: {
                        Text(filter)
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .foregroundStyle(isActive ? .white : .portalTextSecondary)
                            .background(isActive ? Color.portalBlue : Color.portalSurface)
                            .clipShape(Capsule())
                            .overlay(
                                Capsule().stroke(isActive ? Color.clear : Color.portalTextTertiary.opacity(0.3), lineWidth: 1)
                            )
                    }
                }
            }
            .padding(.horizontal)
        }
    }
}
```

- [ ] **Step 6: Create EmptyState and LoadingState**

Create `PortalApp/PortalApp/Shared/Components/EmptyState.swift`:

```swift
import SwiftUI

struct EmptyState: View {
    let icon: String
    let title: String
    let message: String

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 48))
                .foregroundStyle(.portalTextTertiary)
            Text(title)
                .font(.headline)
                .foregroundStyle(.portalTextPrimary)
            Text(message)
                .font(.subheadline)
                .foregroundStyle(.portalTextSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(40)
        .frame(maxWidth: .infinity)
    }
}
```

Create `PortalApp/PortalApp/Shared/Components/LoadingState.swift`:

```swift
import SwiftUI

struct LoadingState: View {
    var body: some View {
        VStack(spacing: 16) {
            ForEach(0..<3, id: \.self) { _ in
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.portalSurface)
                    .frame(height: 80)
                    .shimmer()
            }
        }
        .padding()
    }
}

extension View {
    func shimmer() -> some View {
        self.redacted(reason: .placeholder)
    }
}
```

- [ ] **Step 7: Create SegmentedTypeControl**

Create `PortalApp/PortalApp/Shared/Components/SegmentedTypeControl.swift`:

```swift
import SwiftUI

struct SegmentedTypeControl: View {
    @Binding var selectedType: JobType?

    var body: some View {
        Picker("Type", selection: $selectedType) {
            Text("All").tag(nil as JobType?)
            Text("Jobs").tag(JobType.job as JobType?)
            Text("Internships").tag(JobType.internship as JobType?)
            Text("NIL Deals").tag(JobType.nil_ as JobType?)
        }
        .pickerStyle(.segmented)
        .padding(.horizontal)
    }
}
```

- [ ] **Step 8: Create JobCard and AthleteCard**

Create `PortalApp/PortalApp/Shared/Components/JobCard.swift`:

```swift
import SwiftUI

struct JobCard: View {
    let job: Job

    var body: some View {
        PortalCard {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(job.position ?? "Untitled Position")
                            .font(.headline)
                            .foregroundStyle(.portalTextPrimary)
                        Text(job.company?.companyName ?? "Unknown Company")
                            .font(.subheadline)
                            .foregroundStyle(.portalTextSecondary)
                    }
                    Spacer()
                    if let type = job.type {
                        Text(type.displayName)
                            .font(.caption2)
                            .fontWeight(.semibold)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .foregroundStyle(.white)
                            .background(type.color)
                            .clipShape(Capsule())
                    }
                }

                HStack(spacing: 12) {
                    if let location = job.location {
                        Label(location, systemImage: "mappin")
                            .font(.caption)
                            .foregroundStyle(.portalTextTertiary)
                    }
                    if let duration = job.duration {
                        Label(duration, systemImage: "clock")
                            .font(.caption)
                            .foregroundStyle(.portalTextTertiary)
                    }
                }
            }
        }
    }
}

extension JobType {
    var displayName: String {
        switch self {
        case .job: return "Job"
        case .internship: return "Internship"
        case .nil_: return "NIL"
        }
    }

    var color: Color {
        switch self {
        case .job: return .portalBlue
        case .internship: return .portalSuccess
        case .nil_: return .portalWarning
        }
    }
}
```

Create `PortalApp/PortalApp/Shared/Components/AthleteCard.swift`:

```swift
import SwiftUI

struct AthleteCard: View {
    let athlete: Athlete

    var body: some View {
        PortalCard {
            HStack(spacing: 12) {
                // Avatar
                Circle()
                    .fill(Color.portalBlue.opacity(0.15))
                    .frame(width: 48, height: 48)
                    .overlay(
                        Text(initials)
                            .font(.headline)
                            .foregroundStyle(.portalBlue)
                    )

                VStack(alignment: .leading, spacing: 4) {
                    Text("\(athlete.firstName ?? "") \(athlete.lastName ?? "")")
                        .font(.headline)
                        .foregroundStyle(.portalTextPrimary)

                    HStack(spacing: 8) {
                        if let sport = athlete.athletics?.sport {
                            Text(sport)
                                .font(.caption)
                                .foregroundStyle(.portalTextSecondary)
                        }
                        if let school = athlete.school?.schoolName {
                            Text(school)
                                .font(.caption)
                                .foregroundStyle(.portalTextTertiary)
                        }
                    }
                }

                Spacer()

                if let gpa = athlete.academics?.gpa {
                    VStack(spacing: 2) {
                        Text(gpa)
                            .font(.title3)
                            .fontWeight(.bold)
                            .foregroundStyle(.portalBlue)
                        Text("GPA")
                            .font(.caption2)
                            .foregroundStyle(.portalTextTertiary)
                    }
                }
            }
        }
    }

    private var initials: String {
        let first = athlete.firstName?.prefix(1) ?? ""
        let last = athlete.lastName?.prefix(1) ?? ""
        return "\(first)\(last)".uppercased()
    }
}
```

- [ ] **Step 9: Verify it compiles**

```bash
xcodebuild build -scheme PortalApp -destination 'platform=iOS Simulator,name=iPhone 16'
```

Expected: BUILD SUCCEEDED

- [ ] **Step 10: Commit**

```bash
git add PortalApp/PortalApp/Shared/Components/
git commit -m "Add shared UI components: cards, badges, pills, segmented control, filters, empty/loading states"
```

---

## Chunk 2: App Shell & Navigation

### Task 9: Root app with auth flow

**Files:**
- Modify: `PortalApp/PortalApp/PortalApp.swift`
- Create: `PortalApp/PortalApp/App/RootView.swift`
- Create: `PortalApp/PortalApp/Features/Login/LoginView.swift`

- [ ] **Step 1: Create LoginView**

Create `PortalApp/PortalApp/Features/Login/LoginView.swift`:

```swift
import SwiftUI

struct LoginView: View {
    let authState: AuthState
    @State private var isLoggingIn = false
    @State private var error: String?

    var body: some View {
        ZStack {
            PortalTheme.navyGradient.ignoresSafeArea()

            VStack(spacing: 32) {
                Spacer()

                // Logo area
                VStack(spacing: 12) {
                    Image(systemName: "bolt.fill")
                        .font(.system(size: 48))
                        .foregroundStyle(.portalBlue)
                    Text("Portal")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundStyle(.white)
                    Text("Connecting athletes with opportunity")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.6))
                }

                Spacer()

                VStack(spacing: 16) {
                    if let error {
                        Text(error)
                            .font(.caption)
                            .foregroundStyle(.portalError)
                            .padding(.horizontal)
                    }

                    Button {
                        Task { await login() }
                    } label: {
                        HStack {
                            if isLoggingIn {
                                ProgressView()
                                    .tint(.white)
                            }
                            Text("Get Started")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.portalBlue)
                        .foregroundStyle(.white)
                        .clipShape(Capsule())
                    }
                    .disabled(isLoggingIn)
                    .padding(.horizontal, 32)
                }

                Spacer()
                    .frame(height: 60)
            }
        }
    }

    private func login() async {
        isLoggingIn = true
        error = nil
        do {
            let payload = try await AuthService.login()
            authState.update(from: payload)
        } catch {
            self.error = error.localizedDescription
        }
        isLoggingIn = false
    }
}
```

- [ ] **Step 2: Create RootView**

Create `PortalApp/PortalApp/App/RootView.swift`:

```swift
import SwiftUI

struct RootView: View {
    @State private var authState = AuthState()

    var body: some View {
        Group {
            if authState.isLoading {
                ZStack {
                    PortalTheme.navyGradient.ignoresSafeArea()
                    ProgressView()
                        .tint(.white)
                        .scaleEffect(1.5)
                }
            } else if authState.isAuthenticated {
                MainTabView(authState: authState)
            } else {
                LoginView(authState: authState)
            }
        }
        .task {
            if let payload = await AuthService.tryRestoreSession() {
                authState.update(from: payload)
            } else {
                authState.isLoading = false
            }
        }
    }
}
```

- [ ] **Step 3: Update PortalApp entry point**

Update `PortalApp/PortalApp/PortalApp.swift`:

```swift
import SwiftUI

@main
struct PortalApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
        }
    }
}
```

- [ ] **Step 4: Commit** (won't compile yet — MainTabView needed in next task)

```bash
git add PortalApp/PortalApp/App/ PortalApp/PortalApp/Features/Login/ PortalApp/PortalApp/PortalApp.swift
git commit -m "Add root auth flow with login screen and session restore"
```

---

### Task 10: Main tab navigation

**Files:**
- Create: `PortalApp/PortalApp/App/MainTabView.swift`
- Create: `PortalApp/PortalApp/App/Tabs/AthleteTabView.swift`
- Create: `PortalApp/PortalApp/App/Tabs/EmployerTabView.swift`
- Create: `PortalApp/PortalApp/App/Tabs/SchoolTabView.swift`
- Create: `PortalApp/PortalApp/App/Tabs/AdminTabView.swift`

- [ ] **Step 1: Create role-specific tab views**

Create `PortalApp/PortalApp/App/Tabs/AthleteTabView.swift`:

```swift
import SwiftUI

struct AthleteTabView: View {
    let authState: AuthState

    var body: some View {
        TabView {
            Tab("Home", systemImage: "house.fill") {
                NavigationStack {
                    HomeFeedView(authState: authState)
                }
            }
            Tab("Jobs", systemImage: "briefcase.fill") {
                NavigationStack {
                    JobsBrowseView(authState: authState)
                }
            }
            Tab("Applications", systemImage: "doc.text.fill") {
                NavigationStack {
                    ApplicationsListView(authState: authState)
                }
            }
            Tab("Messages", systemImage: "message.fill") {
                NavigationStack {
                    MessagesListView(authState: authState)
                }
            }
            Tab("Profile", systemImage: "person.fill") {
                NavigationStack {
                    ProfileView(authState: authState)
                }
            }
        }
        .tint(.portalBlue)
    }
}
```

Create `PortalApp/PortalApp/App/Tabs/EmployerTabView.swift`:

```swift
import SwiftUI

struct EmployerTabView: View {
    let authState: AuthState

    var body: some View {
        TabView {
            Tab("Home", systemImage: "house.fill") {
                NavigationStack {
                    HomeFeedView(authState: authState)
                }
            }
            Tab("Jobs", systemImage: "briefcase.fill") {
                NavigationStack {
                    JobsManageView(authState: authState)
                }
            }
            Tab("Candidates", systemImage: "person.2.fill") {
                NavigationStack {
                    CandidatesView(authState: authState)
                }
            }
            Tab("Messages", systemImage: "message.fill") {
                NavigationStack {
                    MessagesListView(authState: authState)
                }
            }
            Tab("Profile", systemImage: "person.fill") {
                NavigationStack {
                    ProfileView(authState: authState)
                }
            }
        }
        .tint(.portalBlue)
    }
}
```

Create `PortalApp/PortalApp/App/Tabs/SchoolTabView.swift`:

```swift
import SwiftUI

struct SchoolTabView: View {
    let authState: AuthState

    var body: some View {
        TabView {
            Tab("Home", systemImage: "house.fill") {
                NavigationStack {
                    HomeFeedView(authState: authState)
                }
            }
            Tab("Dashboard", systemImage: "chart.bar.fill") {
                NavigationStack {
                    SchoolDashboardView(authState: authState)
                }
            }
            Tab("Athletes", systemImage: "figure.run") {
                NavigationStack {
                    SchoolAthletesView(authState: authState)
                }
            }
            Tab("Messages", systemImage: "message.fill") {
                NavigationStack {
                    MessagesListView(authState: authState)
                }
            }
            Tab("Profile", systemImage: "person.fill") {
                NavigationStack {
                    ProfileView(authState: authState)
                }
            }
        }
        .tint(.portalBlue)
    }
}
```

Create `PortalApp/PortalApp/App/Tabs/AdminTabView.swift`:

```swift
import SwiftUI

struct AdminTabView: View {
    let authState: AuthState

    var body: some View {
        TabView {
            Tab("Home", systemImage: "house.fill") {
                NavigationStack {
                    HomeFeedView(authState: authState)
                }
            }
            Tab("Users", systemImage: "person.3.fill") {
                NavigationStack {
                    AdminUsersView(authState: authState)
                }
            }
            Tab("Orgs", systemImage: "building.2.fill") {
                NavigationStack {
                    AdminOrgsView(authState: authState)
                }
            }
            Tab("Messages", systemImage: "message.fill") {
                NavigationStack {
                    MessagesListView(authState: authState)
                }
            }
            Tab("Profile", systemImage: "person.fill") {
                NavigationStack {
                    ProfileView(authState: authState)
                }
            }
        }
        .tint(.portalBlue)
    }
}
```

- [ ] **Step 2: Create MainTabView router**

Create `PortalApp/PortalApp/App/MainTabView.swift`:

```swift
import SwiftUI

struct MainTabView: View {
    let authState: AuthState

    var body: some View {
        switch authState.permission {
        case .athlete:
            AthleteTabView(authState: authState)
        case .company:
            EmployerTabView(authState: authState)
        case .school:
            SchoolTabView(authState: authState)
        case .admin:
            AdminTabView(authState: authState)
        case nil:
            // Default to athlete if permission unknown
            AthleteTabView(authState: authState)
        }
    }
}
```

- [ ] **Step 3: Create placeholder views for all referenced screens**

Create `PortalApp/PortalApp/Features/Placeholders.swift`:

```swift
import SwiftUI

// Placeholder views — each will be replaced with real implementations in later tasks

struct HomeFeedView: View {
    let authState: AuthState
    var body: some View {
        Text("Home").navigationTitle("Home")
    }
}

struct JobsBrowseView: View {
    let authState: AuthState
    var body: some View {
        Text("Jobs").navigationTitle("Jobs")
    }
}

struct ApplicationsListView: View {
    let authState: AuthState
    var body: some View {
        Text("Applications").navigationTitle("Applications")
    }
}

struct MessagesListView: View {
    let authState: AuthState
    var body: some View {
        Text("Messages").navigationTitle("Messages")
    }
}

struct ProfileView: View {
    let authState: AuthState
    var body: some View {
        Text("Profile").navigationTitle("Profile")
    }
}

struct JobsManageView: View {
    let authState: AuthState
    var body: some View {
        Text("Manage Jobs").navigationTitle("Jobs")
    }
}

struct CandidatesView: View {
    let authState: AuthState
    var body: some View {
        Text("Candidates").navigationTitle("Candidates")
    }
}

struct SchoolDashboardView: View {
    let authState: AuthState
    var body: some View {
        Text("Dashboard").navigationTitle("Dashboard")
    }
}

struct SchoolAthletesView: View {
    let authState: AuthState
    var body: some View {
        Text("Athletes").navigationTitle("Athletes")
    }
}

struct AdminUsersView: View {
    let authState: AuthState
    var body: some View {
        Text("Users").navigationTitle("Users")
    }
}

struct AdminOrgsView: View {
    let authState: AuthState
    var body: some View {
        Text("Organizations").navigationTitle("Organizations")
    }
}
```

- [ ] **Step 4: Delete ContentView.swift**

Remove the initial placeholder:

```bash
rm PortalApp/PortalApp/ContentView.swift
```

- [ ] **Step 5: Verify it compiles**

```bash
xcodebuild build -scheme PortalApp -destination 'platform=iOS Simulator,name=iPhone 16'
```

Expected: BUILD SUCCEEDED

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add role-based tab navigation with placeholder screens"
```

---

## Chunk 3: Feature Screens — Home & Jobs

### Task 11: Home feed view

**Files:**
- Create: `PortalApp/PortalApp/Features/Home/HomeFeedView.swift` (replaces placeholder in Placeholders.swift)
- Create: `PortalApp/PortalApp/Features/Home/HomeFeedViewModel.swift`

- [ ] **Step 1: Create HomeFeedViewModel**

Create `PortalApp/PortalApp/Features/Home/HomeFeedViewModel.swift`:

```swift
import Foundation
import Observation

@Observable
final class HomeFeedViewModel {
    var activities: [Activity] = []
    var recentJobs: [Job] = []
    var isLoading = true
    var error: String?

    func load(authState: AuthState) async {
        isLoading = true
        error = nil
        do {
            activities = try await APIClient.shared.get("activity", queryItems: [
                URLQueryItem(name: "limit", value: "10")
            ])

            if authState.isAthlete {
                recentJobs = try await APIClient.shared.get("getJobs")
            }
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }
}
```

- [ ] **Step 2: Create HomeFeedView**

Create `PortalApp/PortalApp/Features/Home/HomeFeedView.swift` (replaces placeholder):

```swift
import SwiftUI

struct HomeFeedView: View {
    let authState: AuthState
    @State private var viewModel = HomeFeedViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Gradient header
                GradientHeader {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Good \(greeting),")
                            .font(.title2)
                            .foregroundStyle(.white.opacity(0.7))
                        Text(authState.email ?? "Welcome")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundStyle(.white)
                    }
                }

                VStack(spacing: PortalTheme.sectionSpacing) {
                    // Activity feed
                    if viewModel.isLoading {
                        LoadingState()
                    } else if viewModel.activities.isEmpty {
                        EmptyState(
                            icon: "tray",
                            title: "No Activity Yet",
                            message: "Your recent activity will appear here"
                        )
                    } else {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Recent Activity")
                                .font(.headline)
                                .padding(.horizontal)

                            ForEach(viewModel.activities) { activity in
                                PortalCard {
                                    HStack(spacing: 12) {
                                        Image(systemName: activity.type?.icon ?? "circle")
                                            .foregroundStyle(.portalBlue)
                                            .frame(width: 32)
                                        VStack(alignment: .leading, spacing: 4) {
                                            Text(activity.message ?? "")
                                                .font(.subheadline)
                                                .foregroundStyle(.portalTextPrimary)
                                            if let date = activity.date {
                                                Text(date)
                                                    .font(.caption)
                                                    .foregroundStyle(.portalTextTertiary)
                                            }
                                        }
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }
                    }

                    // Recommended jobs (athlete only)
                    if authState.isAthlete && !viewModel.recentJobs.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Recommended For You")
                                .font(.headline)
                                .padding(.horizontal)

                            ForEach(viewModel.recentJobs.prefix(5)) { job in
                                NavigationLink(value: job.id) {
                                    JobCard(job: job)
                                }
                                .buttonStyle(.plain)
                                .padding(.horizontal)
                            }
                        }
                    }
                }
                .padding(.vertical)
            }
        }
        .background(Color.portalSurface)
        .navigationBarTitleDisplayMode(.inline)
        .refreshable { await viewModel.load(authState: authState) }
        .task { await viewModel.load(authState: authState) }
    }

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        if hour < 12 { return "morning" }
        if hour < 17 { return "afternoon" }
        return "evening"
    }
}

extension ActivityType {
    var icon: String {
        switch self {
        case .application: return "doc.text.fill"
        case .interview: return "calendar"
        case .other: return "bell.fill"
        }
    }
}
```

- [ ] **Step 3: Remove HomeFeedView from Placeholders.swift**

Remove the `HomeFeedView` placeholder from `PortalApp/PortalApp/Features/Placeholders.swift`.

- [ ] **Step 4: Verify it compiles**

```bash
xcodebuild build -scheme PortalApp -destination 'platform=iOS Simulator,name=iPhone 16'
```

- [ ] **Step 5: Commit**

```bash
git add PortalApp/PortalApp/Features/Home/ PortalApp/PortalApp/Features/Placeholders.swift
git commit -m "Implement Home feed with activity list and recommended jobs"
```

---

### Task 12: Jobs browse view (athlete)

**Files:**
- Create: `PortalApp/PortalApp/Features/Jobs/JobsBrowseView.swift`
- Create: `PortalApp/PortalApp/Features/Jobs/JobsBrowseViewModel.swift`
- Create: `PortalApp/PortalApp/Features/Jobs/JobDetailView.swift`

- [ ] **Step 1: Create JobsBrowseViewModel**

Create `PortalApp/PortalApp/Features/Jobs/JobsBrowseViewModel.swift`:

```swift
import Foundation
import Observation

@Observable
final class JobsBrowseViewModel {
    var jobs: [Job] = []
    var isLoading = true
    var error: String?
    var searchText = ""
    var selectedType: JobType? = nil
    var selectedFilters: Set<String> = []

    func load() async {
        isLoading = true
        error = nil
        do {
            var queryItems: [URLQueryItem] = []
            if let type = selectedType {
                queryItems.append(URLQueryItem(name: "type[]", value: type.rawValue))
            }
            if !searchText.isEmpty {
                queryItems.append(URLQueryItem(name: "wildcardTerm", value: searchText))
            }
            jobs = try await APIClient.shared.get("getJobs", queryItems: queryItems.isEmpty ? nil : queryItems)
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }
}
```

- [ ] **Step 2: Create JobsBrowseView**

Create `PortalApp/PortalApp/Features/Jobs/JobsBrowseView.swift`:

```swift
import SwiftUI

struct JobsBrowseView: View {
    let authState: AuthState
    @State private var viewModel = JobsBrowseViewModel()

    var body: some View {
        VStack(spacing: 0) {
            // Segmented control: Jobs | Internships | NIL Deals
            Picker("Type", selection: $viewModel.selectedType) {
                Text("All").tag(nil as JobType?)
                Text("Jobs").tag(JobType.job as JobType?)
                Text("Internships").tag(JobType.internship as JobType?)
                Text("NIL Deals").tag(JobType.nil_ as JobType?)
            }
            .pickerStyle(.segmented)
            .padding()

            // Job list
            ScrollView {
                if viewModel.isLoading {
                    LoadingState()
                } else if viewModel.jobs.isEmpty {
                    EmptyState(
                        icon: "briefcase",
                        title: "No Listings Found",
                        message: "Try adjusting your filters or check back later"
                    )
                } else {
                    LazyVStack(spacing: 12) {
                        ForEach(viewModel.jobs) { job in
                            NavigationLink {
                                JobDetailView(jobId: job.id, authState: authState)
                            } label: {
                                JobCard(job: job)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal)
                }
            }
        }
        .background(Color.portalSurface)
        .navigationTitle("Opportunities")
        .searchable(text: $viewModel.searchText, prompt: "Search jobs...")
        .refreshable { await viewModel.load() }
        .task { await viewModel.load() }
        .onChange(of: viewModel.selectedType) { _, _ in
            Task { await viewModel.load() }
        }
        .onSubmit(of: .search) {
            Task { await viewModel.load() }
        }
    }
}
```

- [ ] **Step 3: Create JobDetailView**

Create `PortalApp/PortalApp/Features/Jobs/JobDetailView.swift`:

```swift
import SwiftUI

@Observable
final class JobDetailViewModel {
    var job: Job?
    var isLoading = true
    var isApplying = false
    var applied = false
    var error: String?

    func load(jobId: String) async {
        isLoading = true
        do {
            job = try await APIClient.shared.get("getJob/\(jobId)")
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func apply(jobId: String) async {
        isApplying = true
        do {
            struct ApplyBody: Encodable { let jobId: String }
            let _: Application = try await APIClient.shared.post("createApplication", body: ApplyBody(jobId: jobId))
            applied = true
        } catch {
            self.error = error.localizedDescription
        }
        isApplying = false
    }
}

struct JobDetailView: View {
    let jobId: String
    let authState: AuthState
    @State private var viewModel = JobDetailViewModel()

    var body: some View {
        ScrollView {
            if viewModel.isLoading {
                LoadingState()
            } else if let job = viewModel.job {
                VStack(alignment: .leading, spacing: 20) {
                    // Header
                    GradientHeader {
                        VStack(alignment: .leading, spacing: 8) {
                            if let type = job.type {
                                Text(type.displayName)
                                    .font(.caption)
                                    .fontWeight(.semibold)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 4)
                                    .foregroundStyle(.white)
                                    .background(type.color)
                                    .clipShape(Capsule())
                            }
                            Text(job.position ?? "")
                                .font(.title)
                                .fontWeight(.bold)
                                .foregroundStyle(.white)
                            Text(job.company?.companyName ?? "")
                                .font(.title3)
                                .foregroundStyle(.white.opacity(0.7))
                        }
                    }

                    VStack(alignment: .leading, spacing: 20) {
                        // Quick info
                        HStack(spacing: 16) {
                            if let location = job.location {
                                Label(location, systemImage: "mappin")
                                    .font(.subheadline)
                                    .foregroundStyle(.portalTextSecondary)
                            }
                            if let salary = job.salary {
                                Label("$\(Int(salary))", systemImage: "dollarsign.circle")
                                    .font(.subheadline)
                                    .foregroundStyle(.portalTextSecondary)
                            }
                        }

                        if let description = job.description {
                            section("Description", content: description)
                        }
                        if let requirements = job.requirements {
                            section("Requirements", content: requirements)
                        }
                        if let benefits = job.benefits {
                            section("Benefits", content: benefits)
                        }
                        if let deadline = job.applicationDeadline {
                            section("Application Deadline", content: deadline)
                        }

                        // Apply button (athlete only)
                        if authState.isAthlete {
                            Button {
                                Task { await viewModel.apply(jobId: jobId) }
                            } label: {
                                HStack {
                                    if viewModel.isApplying {
                                        ProgressView().tint(.white)
                                    }
                                    Text(viewModel.applied ? "Applied!" : "Apply Now")
                                        .fontWeight(.semibold)
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(viewModel.applied ? Color.portalSuccess : Color.portalBlue)
                                .foregroundStyle(.white)
                                .clipShape(Capsule())
                            }
                            .disabled(viewModel.isApplying || viewModel.applied)
                        }
                    }
                    .padding()
                }
            }
        }
        .background(Color.portalSurface)
        .navigationBarTitleDisplayMode(.inline)
        .task { await viewModel.load(jobId: jobId) }
    }

    private func section(_ title: String, content: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.headline)
                .foregroundStyle(.portalTextPrimary)
            Text(content)
                .font(.body)
                .foregroundStyle(.portalTextSecondary)
        }
    }
}
```

- [ ] **Step 4: Remove JobsBrowseView from Placeholders.swift**

- [ ] **Step 5: Verify it compiles and commit**

```bash
xcodebuild build -scheme PortalApp -destination 'platform=iOS Simulator,name=iPhone 16'
git add PortalApp/PortalApp/Features/Jobs/ PortalApp/PortalApp/Features/Placeholders.swift
git commit -m "Implement Jobs browse with segmented type control and job detail"
```

---


## Chunk 4: Applications, Messaging, Profile


### Task 13: Applications List & Detail Views (Athlete)

**Files:** `Features/Applications/ApplicationsViewModel.swift`, `Features/Applications/ApplicationsListView.swift`, `Features/Applications/ApplicationDetailView.swift`

- [ ] **Step 1: Create `ApplicationsViewModel.swift`**

```swift
// Features/Applications/ApplicationsViewModel.swift

import Foundation

@Observable
final class ApplicationsViewModel {
    var applications: [Application] = []
    var isLoading = false
    var error: String?

    // Filter support
    var selectedStatus: ApplicationStatus?

    var filteredApplications: [Application] {
        guard let status = selectedStatus else { return applications }
        return applications.filter { $0.status == status }
    }

    var statusCounts: [ApplicationStatus: Int] {
        var counts: [ApplicationStatus: Int] = [:]
        for app in applications {
            counts[app.status, default: 0] += 1
        }
        return counts
    }

    func load() async {
        isLoading = true
        error = nil
        do {
            applications = try await APIClient.shared.get("/getApplications")
            // Sort by most recent first
            applications.sort { ($0.creationDate ?? "") > ($1.creationDate ?? "") }
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }
}
```

- [ ] **Step 2: Create `ApplicationsListView.swift`**

```swift
// Features/Applications/ApplicationsListView.swift

import SwiftUI

struct ApplicationsListView: View {
    @State private var viewModel = ApplicationsViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.applications.isEmpty {
                    LoadingState()
                } else if let error = viewModel.error, viewModel.applications.isEmpty {
                    EmptyState(
                        icon: "exclamationmark.triangle",
                        title: "Failed to Load",
                        message: error
                    )
                } else if viewModel.applications.isEmpty {
                    EmptyState(
                        icon: "doc.text",
                        title: "No Applications",
                        message: "You haven't applied to any jobs yet. Browse jobs to get started!"
                    )
                } else {
                    applicationsList
                }
            }
            .navigationTitle("Applications")
            .task { await viewModel.load() }
            .refreshable { await viewModel.load() }
        }
    }

    private var applicationsList: some View {
        VStack(spacing: 0) {
            statusFilterBar
            List {
                ForEach(viewModel.filteredApplications, id: \.id) { application in
                    NavigationLink(destination: ApplicationDetailView(application: application)) {
                        applicationRow(application)
                    }
                    .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                    .listRowSeparator(.hidden)
                }
            }
            .listStyle(.plain)
        }
    }

    private var statusFilterBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                filterChip(label: "All", count: viewModel.applications.count, status: nil)
                ForEach(ApplicationStatus.allCases, id: \.self) { status in
                    let count = viewModel.statusCounts[status] ?? 0
                    if count > 0 {
                        filterChip(label: status.displayName, count: count, status: status)
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
        }
        .background(Color(.systemGroupedBackground))
    }

    private func filterChip(label: String, count: Int, status: ApplicationStatus?) -> some View {
        Button {
            withAnimation(.easeInOut(duration: 0.2)) {
                viewModel.selectedStatus = (viewModel.selectedStatus == status) ? nil : status
            }
        } label: {
            HStack(spacing: 4) {
                Text(label)
                    .font(.subheadline)
                    .fontWeight(.medium)
                Text("\(count)")
                    .font(.caption)
                    .fontWeight(.bold)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(
                        viewModel.selectedStatus == status
                            ? Color.white.opacity(0.3)
                            : Color(.systemGray5)
                    )
                    .clipShape(Capsule())
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(
                viewModel.selectedStatus == status
                    ? Color.portalBlue
                    : Color(.systemBackground)
            )
            .foregroundStyle(viewModel.selectedStatus == status ? .white : .primary)
            .clipShape(Capsule())
            .overlay(
                Capsule()
                    .stroke(Color(.systemGray4), lineWidth: viewModel.selectedStatus == status ? 0 : 1)
            )
        }
    }

    private func applicationRow(_ application: Application) -> some View {
        PortalCard {
            VStack(alignment: .leading, spacing: 10) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(application.job?.title ?? "Position")
                            .font(.headline)
                            .foregroundStyle(.primary)
                        Text(application.job?.company ?? "Company")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    StatusPill(status: application.status)
                }

                Divider()

                HStack {
                    if let location = application.job?.location {
                        Label(location, systemImage: "mappin")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    if let date = application.creationDate {
                        Label(formattedDate(date), systemImage: "calendar")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                if application.interview != nil || application.interviewId != nil {
                    HStack(spacing: 4) {
                        Image(systemName: "person.2")
                            .font(.caption)
                        Text("Interview Scheduled")
                            .font(.caption)
                            .fontWeight(.medium)
                    }
                    .foregroundStyle(Color.portalBlue)
                }
            }
        }
    }

    private func formattedDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let date = formatter.date(from: dateString) else {
            // Try without fractional seconds
            formatter.formatOptions = [.withInternetDateTime]
            guard let date = formatter.date(from: dateString) else { return dateString }
            return date.formatted(date: .abbreviated, time: .omitted)
        }
        return date.formatted(date: .abbreviated, time: .omitted)
    }
}

#Preview {
    ApplicationsListView()
}
```

- [ ] **Step 3: Create `ApplicationDetailView.swift`**

```swift
// Features/Applications/ApplicationDetailView.swift

import SwiftUI

@Observable
final class ApplicationDetailViewModel {
    var interview: Interview?
    var isLoadingInterview = false
    var interviewError: String?

    func loadInterview(interviewId: String) async {
        isLoadingInterview = true
        interviewError = nil
        do {
            interview = try await APIClient.shared.get("/getInterview/\(interviewId)")
        } catch {
            interviewError = error.localizedDescription
        }
        isLoadingInterview = false
    }
}

struct ApplicationDetailView: View {
    let application: Application
    @State private var viewModel = ApplicationDetailViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                headerSection
                VStack(spacing: 16) {
                    statusSection
                    jobInfoSection
                    interviewSection
                    timelineSection
                }
                .padding(16)
            }
        }
        .navigationTitle("Application Details")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            if let interviewId = application.interviewId, application.interview == nil {
                await viewModel.loadInterview(interviewId: interviewId)
            }
        }
    }

    // MARK: - Header

    private var headerSection: some View {
        GradientHeader {
            VStack(spacing: 8) {
                Text(application.job?.title ?? "Position")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundStyle(.white)
                Text(application.job?.company ?? "Company")
                    .font(.headline)
                    .foregroundStyle(.white.opacity(0.85))
                StatusPill(status: application.status)
                    .padding(.top, 4)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
        }
    }

    // MARK: - Status

    private var statusSection: some View {
        PortalCard {
            VStack(alignment: .leading, spacing: 12) {
                Label("Status", systemImage: "flag")
                    .font(.headline)
                    .foregroundStyle(Color.portalNavy)

                HStack {
                    Text("Current Status:")
                        .foregroundStyle(.secondary)
                    Spacer()
                    StatusPill(status: application.status)
                }

                if application.employerReviewed == true {
                    HStack {
                        Text("Employer Reviewed:")
                            .foregroundStyle(.secondary)
                        Spacer()
                        Label("Reviewed", systemImage: "checkmark.circle.fill")
                            .font(.subheadline)
                            .foregroundStyle(.green)
                    }
                }
            }
        }
    }

    // MARK: - Job Info

    private var jobInfoSection: some View {
        PortalCard {
            VStack(alignment: .leading, spacing: 12) {
                Label("Job Information", systemImage: "briefcase")
                    .font(.headline)
                    .foregroundStyle(Color.portalNavy)

                if let job = application.job {
                    VStack(spacing: 10) {
                        jobInfoRow(label: "Title", value: job.title ?? "N/A")
                        jobInfoRow(label: "Company", value: job.company ?? "N/A")
                        if let location = job.location {
                            jobInfoRow(label: "Location", value: location)
                        }
                        if let type = job.type {
                            jobInfoRow(label: "Type", value: type)
                        }
                        if let salary = job.salary {
                            jobInfoRow(label: "Salary", value: salary)
                        }
                    }

                    if let description = job.description {
                        Divider()
                        Text("Description")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundStyle(.secondary)
                        Text(description)
                            .font(.subheadline)
                            .foregroundStyle(.primary)
                    }
                } else {
                    Text("Job details unavailable")
                        .foregroundStyle(.secondary)
                }
            }
        }
    }

    // MARK: - Interview

    private var interviewSection: some View {
        Group {
            let interview = application.interview ?? viewModel.interview
            if viewModel.isLoadingInterview {
                PortalCard {
                    HStack {
                        ProgressView()
                        Text("Loading interview details...")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .padding(.leading, 8)
                    }
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 8)
                }
            } else if let interview {
                PortalCard {
                    VStack(alignment: .leading, spacing: 12) {
                        Label("Interview", systemImage: "person.2")
                            .font(.headline)
                            .foregroundStyle(Color.portalNavy)

                        if let status = interview.status {
                            HStack {
                                Text("Status:")
                                    .foregroundStyle(.secondary)
                                Spacer()
                                interviewStatusBadge(status)
                            }
                        }

                        if let dateTime = interview.dateTime {
                            jobInfoRow(label: "Date & Time", value: formattedDateTime(dateTime))
                        }

                        if let location = interview.location {
                            jobInfoRow(label: "Location", value: location)
                        }

                        if let interviewer = interview.interviewer {
                            jobInfoRow(label: "Interviewer", value: interviewer)
                        }

                        if let tips = interview.preparationTips, !tips.isEmpty {
                            Divider()
                            Text("Preparation Tips")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundStyle(.secondary)
                            Text(tips)
                                .font(.subheadline)
                                .foregroundStyle(.primary)
                        }
                    }
                }
            } else if application.status == .interviewRequested {
                PortalCard {
                    VStack(spacing: 8) {
                        Image(systemName: "calendar.badge.clock")
                            .font(.title2)
                            .foregroundStyle(Color.portalBlue)
                        Text("Interview Requested")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        Text("Details will appear here once the interview is scheduled.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                }
            }
        }
    }

    // MARK: - Timeline

    private var timelineSection: some View {
        PortalCard {
            VStack(alignment: .leading, spacing: 12) {
                Label("Timeline", systemImage: "clock")
                    .font(.headline)
                    .foregroundStyle(Color.portalNavy)

                if let creationDate = application.creationDate {
                    timelineRow(
                        icon: "paperplane.fill",
                        label: "Applied",
                        date: creationDate,
                        color: .blue
                    )
                }

                if let terminalDate = application.terminalStatusDate {
                    timelineRow(
                        icon: application.status == .accepted ? "checkmark.circle.fill" :
                              application.status == .rejected ? "xmark.circle.fill" :
                              application.status == .withdrawn ? "arrow.uturn.left.circle.fill" :
                              "circle.fill",
                        label: application.status.displayName,
                        date: terminalDate,
                        color: application.status.color
                    )
                }
            }
        }
    }

    // MARK: - Helpers

    private func jobInfoRow(label: String, value: String) -> some View {
        HStack(alignment: .top) {
            Text("\(label):")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .frame(width: 100, alignment: .leading)
            Text(value)
                .font(.subheadline)
                .foregroundStyle(.primary)
            Spacer()
        }
    }

    private func interviewStatusBadge(_ status: InterviewStatus) -> some View {
        Text(status.rawValue.capitalized)
            .font(.caption)
            .fontWeight(.semibold)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(
                status == .scheduled ? Color.blue.opacity(0.15) :
                status == .complete ? Color.green.opacity(0.15) :
                Color.red.opacity(0.15)
            )
            .foregroundStyle(
                status == .scheduled ? .blue :
                status == .complete ? .green :
                .red
            )
            .clipShape(Capsule())
    }

    private func timelineRow(icon: String, label: String, date: String, color: Color) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundStyle(color)
                .frame(width: 24)
            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.subheadline)
                    .fontWeight(.medium)
                Text(formattedDate(date))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private func formattedDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let date = formatter.date(from: dateString) else {
            formatter.formatOptions = [.withInternetDateTime]
            guard let date = formatter.date(from: dateString) else { return dateString }
            return date.formatted(date: .abbreviated, time: .omitted)
        }
        return date.formatted(date: .abbreviated, time: .omitted)
    }

    private func formattedDateTime(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let date = formatter.date(from: dateString) else {
            formatter.formatOptions = [.withInternetDateTime]
            guard let date = formatter.date(from: dateString) else { return dateString }
            return date.formatted(date: .abbreviated, time: .shortened)
        }
        return date.formatted(date: .abbreviated, time: .shortened)
    }
}

#Preview {
    NavigationStack {
        ApplicationDetailView(application: Application(
            id: "1",
            creationDate: "2026-01-15T10:00:00.000Z",
            terminalStatusDate: nil,
            employerReviewed: true,
            status: .underReview,
            job: nil,
            jobId: "j1",
            athleteId: "a1",
            interview: nil,
            interviewId: nil
        ))
    }
}
```

- [ ] **Step 4: Remove any `ApplicationsListView` / `ApplicationDetailView` placeholders from `Placeholders.swift`**

- [ ] **Step 5: Verify compile**
```bash
xcodebuild build -scheme Portal -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | tail -5
```

- [ ] **Step 6: Commit**
```bash
git add Features/Applications/ApplicationsViewModel.swift Features/Applications/ApplicationsListView.swift Features/Applications/ApplicationDetailView.swift
git commit -m "Add applications list and detail views for athletes"
```

---

### Task 14: Messaging Views (Conversations, Chat, New Message)

**Files:** `Features/Messages/MessagesListViewModel.swift`, `Features/Messages/MessagesListView.swift`, `Features/Messages/ConversationViewModel.swift`, `Features/Messages/ConversationView.swift`, `Features/Messages/NewMessageView.swift`

- [ ] **Step 1: Create `MessagesListViewModel.swift`**

```swift
// Features/Messages/MessagesListViewModel.swift

import Foundation

@Observable
final class MessagesListViewModel {
    var conversations: [RecentConversation] = []
    var isLoading = false
    var error: String?

    var totalUnread: Int {
        conversations.reduce(0) { $0 + ($1.unreadCount ?? 0) }
    }

    func load() async {
        isLoading = true
        error = nil
        do {
            conversations = try await APIClient.shared.get("/getRecentMessages")
            conversations.sort { ($0.lastMessageDate ?? "") > ($1.lastMessageDate ?? "") }
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }
}
```

- [ ] **Step 2: Create `MessagesListView.swift`**

```swift
// Features/Messages/MessagesListView.swift

import SwiftUI

struct MessagesListView: View {
    @State private var viewModel = MessagesListViewModel()
    @State private var showNewMessage = false

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.conversations.isEmpty {
                    LoadingState()
                } else if let error = viewModel.error, viewModel.conversations.isEmpty {
                    EmptyState(
                        icon: "exclamationmark.triangle",
                        title: "Failed to Load",
                        message: error
                    )
                } else if viewModel.conversations.isEmpty {
                    EmptyState(
                        icon: "bubble.left.and.bubble.right",
                        title: "No Messages",
                        message: "Start a conversation to connect with employers, coaches, or athletes."
                    )
                } else {
                    conversationsList
                }
            }
            .navigationTitle("Messages")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showNewMessage = true
                    } label: {
                        Image(systemName: "square.and.pencil")
                            .foregroundStyle(Color.portalBlue)
                    }
                }
            }
            .sheet(isPresented: $showNewMessage) {
                NewMessageView()
            }
            .task { await viewModel.load() }
            .refreshable { await viewModel.load() }
        }
    }

    private var conversationsList: some View {
        List {
            ForEach(viewModel.conversations, id: \.conversationId) { conversation in
                NavigationLink(destination: ConversationView(
                    conversationId: conversation.conversationId ?? "",
                    otherUserId: conversation.otherUserId ?? "",
                    otherUserName: conversation.otherUserName ?? "User"
                )) {
                    conversationRow(conversation)
                }
                .listRowInsets(EdgeInsets(top: 10, leading: 16, bottom: 10, trailing: 16))
            }
        }
        .listStyle(.plain)
    }

    private func conversationRow(_ conversation: RecentConversation) -> some View {
        HStack(spacing: 12) {
            // Avatar
            ZStack {
                Circle()
                    .fill(Color.portalBlue.opacity(0.15))
                    .frame(width: 48, height: 48)
                Text(avatarInitials(conversation.otherUserName))
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundStyle(Color.portalBlue)
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(conversation.otherUserName ?? "Unknown User")
                        .font(.headline)
                        .fontWeight((conversation.unreadCount ?? 0) > 0 ? .bold : .regular)
                        .foregroundStyle(.primary)
                        .lineLimit(1)
                    Spacer()
                    if let date = conversation.lastMessageDate {
                        Text(relativeTimestamp(date))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                HStack {
                    Text(conversation.lastMessage ?? "")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                        .fontWeight((conversation.unreadCount ?? 0) > 0 ? .medium : .regular)
                    Spacer()
                    if let unread = conversation.unreadCount, unread > 0 {
                        Text("\(unread)")
                            .font(.caption2)
                            .fontWeight(.bold)
                            .foregroundStyle(.white)
                            .padding(.horizontal, 7)
                            .padding(.vertical, 3)
                            .background(Color.portalBlue)
                            .clipShape(Capsule())
                    }
                }
            }
        }
        .padding(.vertical, 2)
    }

    private func avatarInitials(_ name: String?) -> String {
        guard let name = name else { return "?" }
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return "\(parts[0].prefix(1))\(parts[1].prefix(1))".uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }

    private func relativeTimestamp(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        var date = formatter.date(from: dateString)
        if date == nil {
            formatter.formatOptions = [.withInternetDateTime]
            date = formatter.date(from: dateString)
        }
        guard let date else { return "" }

        let now = Date()
        let interval = now.timeIntervalSince(date)

        if interval < 60 {
            return "Just now"
        } else if interval < 3600 {
            let mins = Int(interval / 60)
            return "\(mins)m ago"
        } else if interval < 86400 {
            let hours = Int(interval / 3600)
            return "\(hours)h ago"
        } else if interval < 604800 {
            let days = Int(interval / 86400)
            return "\(days)d ago"
        } else {
            return date.formatted(date: .abbreviated, time: .omitted)
        }
    }
}

#Preview {
    MessagesListView()
}
```

- [ ] **Step 3: Create `ConversationViewModel.swift`**

```swift
// Features/Messages/ConversationViewModel.swift

import Foundation

@Observable
final class ConversationViewModel {
    var messages: [Message] = []
    var otherUser: UserToMessage?
    var isLoading = false
    var isSending = false
    var error: String?
    var messageText = ""

    private let conversationId: String
    private let otherUserId: String
    private var socketListenerAttached = false

    init(conversationId: String, otherUserId: String) {
        self.conversationId = conversationId
        self.otherUserId = otherUserId
    }

    func load() async {
        isLoading = true
        error = nil
        do {
            let response: ConversationResponse = try await APIClient.shared.get(
                "/getConversation/\(conversationId)"
            )
            messages = response.messages ?? []
            otherUser = response.otherUser
            // Sort chronologically (oldest first) for chat display
            messages.sort { ($0.createdAt ?? "") < ($1.createdAt ?? "") }
            // Mark messages as read
            await markAsRead()
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func sendMessage() async {
        let text = messageText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }

        isSending = true
        do {
            let body: [String: Any] = [
                "toUserId": otherUserId,
                "message": text
            ]
            let response: SendMessageResponse = try await APIClient.shared.post(
                "/sendMessage",
                body: body
            )
            // Append the sent message to the local list
            let sentMessage = Message(
                id: response.id,
                conversationId: response.conversationId,
                fromUserId: response.fromUserId,
                toUserId: response.toUserId,
                message: response.message,
                readAt: nil,
                createdAt: response.createdAt
            )
            messages.append(sentMessage)
            messageText = ""
        } catch {
            self.error = error.localizedDescription
        }
        isSending = false
    }

    func listenForNewMessages() {
        guard !socketListenerAttached else { return }
        socketListenerAttached = true
        SocketService.shared.onNewMessage { [weak self] message in
            guard let self else { return }
            // Only add if it belongs to this conversation
            if message.conversationId == self.conversationId {
                // Avoid duplicates
                if !self.messages.contains(where: { $0.id == message.id }) {
                    self.messages.append(message)
                    Task { await self.markAsRead() }
                }
            }
        }
    }

    func stopListening() {
        socketListenerAttached = false
        // SocketService handles cleanup as needed
    }

    private func markAsRead() async {
        do {
            let body: [String: Any] = ["conversationId": conversationId]
            let _: EmptyResponse = try await APIClient.shared.patch(
                "/markMessageRead",
                body: body
            )
        } catch {
            // Non-critical; don't surface to UI
        }
    }
}

/// Used when we don't care about the response body
private struct EmptyResponse: Decodable {}
```

- [ ] **Step 4: Create `ConversationView.swift`**

```swift
// Features/Messages/ConversationView.swift

import SwiftUI

struct ConversationView: View {
    let conversationId: String
    let otherUserId: String
    let otherUserName: String

    @Environment(AuthState.self) private var authState
    @State private var viewModel: ConversationViewModel

    init(conversationId: String, otherUserId: String, otherUserName: String) {
        self.conversationId = conversationId
        self.otherUserId = otherUserId
        self.otherUserName = otherUserName
        self._viewModel = State(initialValue: ConversationViewModel(
            conversationId: conversationId,
            otherUserId: otherUserId
        ))
    }

    var body: some View {
        VStack(spacing: 0) {
            messageList
            Divider()
            inputBar
        }
        .navigationTitle(otherUserName)
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.load()
            viewModel.listenForNewMessages()
        }
        .onDisappear {
            viewModel.stopListening()
        }
    }

    // MARK: - Message List

    private var messageList: some View {
        ScrollViewReader { proxy in
            ScrollView {
                if viewModel.isLoading && viewModel.messages.isEmpty {
                    LoadingState()
                        .padding(.top, 40)
                } else if viewModel.messages.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "bubble.left.and.bubble.right")
                            .font(.system(size: 40))
                            .foregroundStyle(Color(.systemGray4))
                        Text("No messages yet")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        Text("Send a message to start the conversation.")
                            .font(.caption)
                            .foregroundStyle(.tertiary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.top, 60)
                } else {
                    LazyVStack(spacing: 4) {
                        ForEach(viewModel.messages, id: \.id) { message in
                            messageBubble(message)
                                .id(message.id)
                        }
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                }
            }
            .onChange(of: viewModel.messages.count) { _, _ in
                if let lastId = viewModel.messages.last?.id {
                    withAnimation(.easeOut(duration: 0.3)) {
                        proxy.scrollTo(lastId, anchor: .bottom)
                    }
                }
            }
        }
    }

    private func messageBubble(_ message: Message) -> some View {
        let isMine = message.fromUserId == authState.userId

        return HStack {
            if isMine { Spacer(minLength: 60) }

            VStack(alignment: isMine ? .trailing : .leading, spacing: 2) {
                Text(message.message ?? "")
                    .font(.body)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 9)
                    .background(isMine ? Color.portalBlue : Color(.systemGray5))
                    .foregroundStyle(isMine ? .white : .primary)
                    .clipShape(RoundedRectangle(cornerRadius: 18))

                if let createdAt = message.createdAt {
                    Text(messageTimestamp(createdAt))
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                        .padding(.horizontal, 4)
                }
            }

            if !isMine { Spacer(minLength: 60) }
        }
        .padding(.vertical, 2)
    }

    // MARK: - Input Bar

    private var inputBar: some View {
        HStack(spacing: 10) {
            TextField("Type a message...", text: $viewModel.messageText, axis: .vertical)
                .textFieldStyle(.plain)
                .lineLimit(1...5)
                .padding(.horizontal, 14)
                .padding(.vertical, 9)
                .background(Color(.systemGray6))
                .clipShape(RoundedRectangle(cornerRadius: 20))

            Button {
                Task { await viewModel.sendMessage() }
            } label: {
                Group {
                    if viewModel.isSending {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Image(systemName: "arrow.up")
                            .fontWeight(.semibold)
                    }
                }
                .frame(width: 36, height: 36)
                .background(
                    viewModel.messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                        ? Color(.systemGray4)
                        : Color.portalBlue
                )
                .foregroundStyle(.white)
                .clipShape(Circle())
            }
            .disabled(
                viewModel.messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                || viewModel.isSending
            )
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color(.systemBackground))
    }

    // MARK: - Helpers

    private func messageTimestamp(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        var date = formatter.date(from: dateString)
        if date == nil {
            formatter.formatOptions = [.withInternetDateTime]
            date = formatter.date(from: dateString)
        }
        guard let date else { return "" }

        if Calendar.current.isDateInToday(date) {
            return date.formatted(date: .omitted, time: .shortened)
        } else {
            return date.formatted(date: .abbreviated, time: .shortened)
        }
    }
}

#Preview {
    NavigationStack {
        ConversationView(
            conversationId: "conv1",
            otherUserId: "user2",
            otherUserName: "Jane Smith"
        )
        .environment(AuthState())
    }
}
```

- [ ] **Step 5: Create `NewMessageView.swift`**

```swift
// Features/Messages/NewMessageView.swift

import SwiftUI

@Observable
final class NewMessageViewModel {
    var users: [UserToMessage] = []
    var filteredUsers: [UserToMessage] = []
    var searchText = ""
    var isLoading = false
    var error: String?

    func load() async {
        isLoading = true
        error = nil
        do {
            users = try await APIClient.shared.get("/getUsersToMessage")
            applyFilter()
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func applyFilter() {
        if searchText.isEmpty {
            filteredUsers = users
        } else {
            let query = searchText.lowercased()
            filteredUsers = users.filter { user in
                let fullName = "\(user.firstName ?? "") \(user.lastName ?? "")".lowercased()
                return fullName.contains(query)
                    || (user.email?.lowercased().contains(query) ?? false)
            }
        }
    }
}

struct NewMessageView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AuthState.self) private var authState
    @State private var viewModel = NewMessageViewModel()
    @State private var selectedUser: UserToMessage?
    @State private var navigateToConversation = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                searchBar
                Divider()
                Group {
                    if viewModel.isLoading {
                        LoadingState()
                    } else if viewModel.filteredUsers.isEmpty && !viewModel.searchText.isEmpty {
                        EmptyState(
                            icon: "person.slash",
                            title: "No Results",
                            message: "No users match your search."
                        )
                    } else if viewModel.users.isEmpty {
                        EmptyState(
                            icon: "person.2.slash",
                            title: "No Users Available",
                            message: "There are no users available to message at this time."
                        )
                    } else {
                        userList
                    }
                }
            }
            .navigationTitle("New Message")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
            .task { await viewModel.load() }
            .navigationDestination(isPresented: $navigateToConversation) {
                if let user = selectedUser {
                    ConversationView(
                        conversationId: "",
                        otherUserId: user.id ?? "",
                        otherUserName: "\(user.firstName ?? "") \(user.lastName ?? "")"
                    )
                }
            }
        }
    }

    private var searchBar: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(.secondary)
            TextField("Search by name or email...", text: $viewModel.searchText)
                .textFieldStyle(.plain)
                .autocorrectionDisabled()
                .textInputAutocapitalization(.never)
                .onChange(of: viewModel.searchText) { _, _ in
                    viewModel.applyFilter()
                }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
    }

    private var userList: some View {
        List {
            ForEach(viewModel.filteredUsers, id: \.id) { user in
                Button {
                    selectedUser = user
                    navigateToConversation = true
                } label: {
                    userRow(user)
                }
                .tint(.primary)
            }
        }
        .listStyle(.plain)
    }

    private func userRow(_ user: UserToMessage) -> some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(permissionColor(user.permission).opacity(0.15))
                    .frame(width: 44, height: 44)
                Text(userInitials(user))
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundStyle(permissionColor(user.permission))
            }

            VStack(alignment: .leading, spacing: 3) {
                Text("\(user.firstName ?? "") \(user.lastName ?? "")")
                    .font(.body)
                    .fontWeight(.medium)
                    .foregroundStyle(.primary)

                if let permission = user.permission {
                    Text(permissionLabel(permission))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(.vertical, 4)
    }

    private func userInitials(_ user: UserToMessage) -> String {
        let first = user.firstName?.prefix(1) ?? ""
        let last = user.lastName?.prefix(1) ?? ""
        return "\(first)\(last)".uppercased()
    }

    private func permissionColor(_ permission: UserPermission?) -> Color {
        switch permission {
        case .athlete: return Color.portalBlue
        case .company: return .orange
        case .school: return .green
        case .admin: return .purple
        case .none: return .gray
        }
    }

    private func permissionLabel(_ permission: UserPermission) -> String {
        switch permission {
        case .athlete: return "Athlete"
        case .company: return "Employer"
        case .school: return "School Staff"
        case .admin: return "Admin"
        }
    }
}

#Preview {
    NewMessageView()
        .environment(AuthState())
}
```

- [ ] **Step 6: Remove any messaging placeholders from `Placeholders.swift`**

- [ ] **Step 7: Verify compile**
```bash
xcodebuild build -scheme Portal -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | tail -5
```

- [ ] **Step 8: Commit**
```bash
git add Features/Messages/MessagesListViewModel.swift Features/Messages/MessagesListView.swift Features/Messages/ConversationViewModel.swift Features/Messages/ConversationView.swift Features/Messages/NewMessageView.swift
git commit -m "Add messaging views: conversations list, chat, and new message"
```

---

### Task 15: Profile View & Edit Forms

**Files:** `Features/Profile/ProfileViewModel.swift`, `Features/Profile/ProfileView.swift`, `Features/Profile/AthleteProfileForm.swift`, `Features/Profile/CompanyEmployeeProfileForm.swift`, `Features/Profile/SchoolEmployeeProfileForm.swift`

- [ ] **Step 1: Create `ProfileViewModel.swift`**

```swift
// Features/Profile/ProfileViewModel.swift

import Foundation

@Observable
final class ProfileViewModel {
    var athlete: Athlete?
    var companyEmployee: CompanyEmployee?
    var schoolEmployee: SchoolEmployee?

    var isLoading = false
    var isSaving = false
    var error: String?
    var saveSuccess = false
    var isEditing = false

    private let authState: AuthState

    init(authState: AuthState) {
        self.authState = authState
    }

    var displayName: String {
        if let a = athlete {
            return "\(a.firstName ?? "") \(a.lastName ?? "")"
        } else if let c = companyEmployee {
            return "\(c.firstName ?? "") \(c.lastName ?? "")"
        } else if let s = schoolEmployee {
            return "\(s.firstName ?? "") \(s.lastName ?? "")"
        }
        return authState.email ?? "User"
    }

    var permissionLabel: String {
        switch authState.permission {
        case .athlete: return "Athlete"
        case .company: return "Employer"
        case .school: return "School Staff"
        case .admin: return "Admin"
        case .none: return "User"
        }
    }

    func load() async {
        isLoading = true
        error = nil
        guard let userId = authState.userId else {
            error = "User ID not available"
            isLoading = false
            return
        }

        do {
            switch authState.permission {
            case .athlete:
                athlete = try await APIClient.shared.get("/getAthlete/\(userId)")
            case .company:
                companyEmployee = try await APIClient.shared.get("/getCompanyEmployee/\(userId)")
            case .school:
                schoolEmployee = try await APIClient.shared.get("/getSchoolEmployee/\(userId)")
            default:
                error = "Unsupported user type"
            }
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func saveAthlete(_ updated: Athlete) async {
        isSaving = true
        saveSuccess = false
        error = nil
        do {
            let data = try JSONEncoder().encode(updated)
            let body = try JSONSerialization.jsonObject(with: data) as? [String: Any] ?? [:]
            athlete = try await APIClient.shared.put("/updateAthlete", body: body)
            saveSuccess = true
            isEditing = false
        } catch {
            self.error = error.localizedDescription
        }
        isSaving = false
    }

    func saveCompanyEmployee(_ updated: CompanyEmployee) async {
        isSaving = true
        saveSuccess = false
        error = nil
        do {
            let data = try JSONEncoder().encode(updated)
            let body = try JSONSerialization.jsonObject(with: data) as? [String: Any] ?? [:]
            companyEmployee = try await APIClient.shared.put("/updateCompanyEmployee", body: body)
            saveSuccess = true
            isEditing = false
        } catch {
            self.error = error.localizedDescription
        }
        isSaving = false
    }

    func saveSchoolEmployee(_ updated: SchoolEmployee) async {
        isSaving = true
        saveSuccess = false
        error = nil
        do {
            let data = try JSONEncoder().encode(updated)
            let body = try JSONSerialization.jsonObject(with: data) as? [String: Any] ?? [:]
            schoolEmployee = try await APIClient.shared.put("/updateSchoolEmployee", body: body)
            saveSuccess = true
            isEditing = false
        } catch {
            self.error = error.localizedDescription
        }
        isSaving = false
    }

    func logout() {
        AuthService.logout()
        authState.clear()
    }
}
```

- [ ] **Step 2: Create `ProfileView.swift`**

```swift
// Features/Profile/ProfileView.swift

import SwiftUI

struct ProfileView: View {
    @Environment(AuthState.self) private var authState
    @State private var viewModel: ProfileViewModel?
    @State private var showLogoutAlert = false

    var body: some View {
        NavigationStack {
            Group {
                if let vm = viewModel {
                    if vm.isLoading && vm.athlete == nil && vm.companyEmployee == nil && vm.schoolEmployee == nil {
                        LoadingState()
                    } else if let error = vm.error, vm.athlete == nil && vm.companyEmployee == nil && vm.schoolEmployee == nil {
                        EmptyState(
                            icon: "exclamationmark.triangle",
                            title: "Failed to Load",
                            message: error
                        )
                    } else {
                        profileContent(vm)
                    }
                } else {
                    LoadingState()
                }
            }
            .navigationTitle("Profile")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    if let vm = viewModel {
                        Button(vm.isEditing ? "Cancel" : "Edit") {
                            withAnimation { vm.isEditing.toggle() }
                        }
                    }
                }
            }
            .alert("Sign Out", isPresented: $showLogoutAlert) {
                Button("Sign Out", role: .destructive) {
                    viewModel?.logout()
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("Are you sure you want to sign out?")
            }
            .task {
                if viewModel == nil {
                    viewModel = ProfileViewModel(authState: authState)
                }
                await viewModel?.load()
            }
            .refreshable { await viewModel?.load() }
        }
    }

    @ViewBuilder
    private func profileContent(_ vm: ProfileViewModel) -> some View {
        ScrollView {
            VStack(spacing: 0) {
                profileHeader(vm)

                VStack(spacing: 16) {
                    if vm.isEditing {
                        editForm(vm)
                    } else {
                        viewProfile(vm)
                    }

                    if let error = vm.error {
                        Text(error)
                            .font(.caption)
                            .foregroundStyle(.red)
                            .padding(.horizontal)
                    }

                    if vm.saveSuccess {
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                            Text("Profile updated successfully")
                        }
                        .font(.subheadline)
                        .foregroundStyle(.green)
                    }

                    logoutButton
                }
                .padding(16)
            }
        }
    }

    private func profileHeader(_ vm: ProfileViewModel) -> some View {
        GradientHeader {
            VStack(spacing: 10) {
                ZStack {
                    Circle()
                        .fill(.white.opacity(0.2))
                        .frame(width: 80, height: 80)
                    Text(initials(vm.displayName))
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundStyle(.white)
                }

                Text(vm.displayName)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundStyle(.white)

                Text(vm.permissionLabel)
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.85))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 4)
                    .background(.white.opacity(0.2))
                    .clipShape(Capsule())

                if let email = authState.email {
                    Text(email)
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.7))
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 24)
        }
    }

    @ViewBuilder
    private func viewProfile(_ vm: ProfileViewModel) -> some View {
        switch authState.permission {
        case .athlete:
            if let athlete = vm.athlete {
                athleteReadOnly(athlete)
            }
        case .company:
            if let emp = vm.companyEmployee {
                companyReadOnly(emp)
            }
        case .school:
            if let emp = vm.schoolEmployee {
                schoolReadOnly(emp)
            }
        default:
            EmptyView()
        }
    }

    @ViewBuilder
    private func editForm(_ vm: ProfileViewModel) -> some View {
        switch authState.permission {
        case .athlete:
            if let athlete = vm.athlete {
                AthleteProfileForm(athlete: athlete, isSaving: vm.isSaving) { updated in
                    Task { await vm.saveAthlete(updated) }
                }
            }
        case .company:
            if let emp = vm.companyEmployee {
                CompanyEmployeeProfileForm(employee: emp, isSaving: vm.isSaving) { updated in
                    Task { await vm.saveCompanyEmployee(updated) }
                }
            }
        case .school:
            if let emp = vm.schoolEmployee {
                SchoolEmployeeProfileForm(employee: emp, isSaving: vm.isSaving) { updated in
                    Task { await vm.saveSchoolEmployee(updated) }
                }
            }
        default:
            EmptyView()
        }
    }

    // MARK: - Read-Only Sections

    private func athleteReadOnly(_ athlete: Athlete) -> some View {
        VStack(spacing: 16) {
            PortalCard {
                VStack(alignment: .leading, spacing: 10) {
                    Label("Personal Info", systemImage: "person")
                        .font(.headline)
                        .foregroundStyle(Color.portalNavy)
                    profileRow("Phone", athlete.phone)
                    profileRow("Location", athlete.location)
                    if let bio = athlete.bio, !bio.isEmpty {
                        Divider()
                        Text(bio)
                            .font(.subheadline)
                            .foregroundStyle(.primary)
                    }
                }
            }

            PortalCard {
                VStack(alignment: .leading, spacing: 10) {
                    Label("Academics", systemImage: "graduationcap")
                        .font(.headline)
                        .foregroundStyle(Color.portalNavy)
                    profileRow("Major", athlete.major)
                    profileRow("Minor", athlete.minor)
                    if let gpa = athlete.gpa {
                        profileRow("GPA", String(format: "%.2f", gpa))
                    }
                    profileRow("Graduation", athlete.graduationDate)
                    profileRow("Awards", athlete.awards)
                    profileRow("Coursework", athlete.coursework)
                }
            }

            PortalCard {
                VStack(alignment: .leading, spacing: 10) {
                    Label("Athletics", systemImage: "sportscourt")
                        .font(.headline)
                        .foregroundStyle(Color.portalNavy)
                    profileRow("Sport", athlete.sport)
                    profileRow("Position", athlete.position)
                    profileRow("Division", athlete.division)
                    profileRow("Conference", athlete.conference)
                    if let years = athlete.yearsPlayed {
                        profileRow("Years Played", "\(years)")
                    }
                    profileRow("Leadership", athlete.leadershipRoles)
                    profileRow("Achievements", athlete.achievements)
                    profileRow("Statistics", athlete.statistics)
                    profileRow("Skills", athlete.skills)
                }
            }
        }
    }

    private func companyReadOnly(_ emp: CompanyEmployee) -> some View {
        VStack(spacing: 16) {
            PortalCard {
                VStack(alignment: .leading, spacing: 10) {
                    Label("Personal Info", systemImage: "person")
                        .font(.headline)
                        .foregroundStyle(Color.portalNavy)
                    profileRow("Phone", emp.phone)
                    profileRow("Position", emp.position)
                    profileRow("Role Type", emp.roleType)
                    profileRow("LinkedIn", emp.linkedIn)
                    if let bio = emp.bio, !bio.isEmpty {
                        Divider()
                        Text(bio)
                            .font(.subheadline)
                            .foregroundStyle(.primary)
                    }
                }
            }

            if emp.formerAthlete == true {
                PortalCard {
                    VStack(alignment: .leading, spacing: 10) {
                        Label("Former Athlete", systemImage: "sportscourt")
                            .font(.headline)
                            .foregroundStyle(Color.portalNavy)
                        profileRow("Sport", emp.formerAthleteSport)
                        profileRow("Division", emp.formerAthleteDivision)
                        profileRow("School", emp.formerAthleteSchool)
                    }
                }
            }
        }
    }

    private func schoolReadOnly(_ emp: SchoolEmployee) -> some View {
        VStack(spacing: 16) {
            PortalCard {
                VStack(alignment: .leading, spacing: 10) {
                    Label("Personal Info", systemImage: "person")
                        .font(.headline)
                        .foregroundStyle(Color.portalNavy)
                    profileRow("Phone", emp.phone)
                    profileRow("Position", emp.position)
                    profileRow("Department", emp.department)
                    profileRow("Office", emp.officeLocation)
                    profileRow("Office Hours", emp.officeHours)
                    profileRow("LinkedIn", emp.linkedIn)
                    if let bio = emp.bio, !bio.isEmpty {
                        Divider()
                        Text(bio)
                            .font(.subheadline)
                            .foregroundStyle(.primary)
                    }
                }
            }
        }
    }

    // MARK: - Helpers

    private func profileRow(_ label: String, _ value: String?) -> some View {
        Group {
            if let value, !value.isEmpty {
                HStack(alignment: .top) {
                    Text("\(label):")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .frame(width: 110, alignment: .leading)
                    Text(value)
                        .font(.subheadline)
                        .foregroundStyle(.primary)
                    Spacer()
                }
            }
        }
    }

    private var logoutButton: some View {
        Button {
            showLogoutAlert = true
        } label: {
            HStack {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                Text("Sign Out")
            }
            .font(.headline)
            .foregroundStyle(.red)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Color.red.opacity(0.1))
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .padding(.top, 8)
    }

    private func initials(_ name: String) -> String {
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return "\(parts[0].prefix(1))\(parts[1].prefix(1))".uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }
}

#Preview {
    ProfileView()
        .environment(AuthState())
}
```

- [ ] **Step 3: Create `AthleteProfileForm.swift`**

```swift
// Features/Profile/AthleteProfileForm.swift

import SwiftUI

struct AthleteProfileForm: View {
    @State private var firstName: String
    @State private var lastName: String
    @State private var phone: String
    @State private var location: String
    @State private var bio: String

    // Academics
    @State private var major: String
    @State private var minor: String
    @State private var gpa: String
    @State private var graduationDate: String
    @State private var awards: String
    @State private var coursework: String

    // Athletics
    @State private var sport: String
    @State private var position: String
    @State private var division: String
    @State private var conference: String
    @State private var yearsPlayed: String
    @State private var leadershipRoles: String
    @State private var achievements: String
    @State private var statistics: String
    @State private var skills: String

    let isSaving: Bool
    let onSave: (Athlete) -> Void

    private let originalAthlete: Athlete

    init(athlete: Athlete, isSaving: Bool, onSave: @escaping (Athlete) -> Void) {
        self.originalAthlete = athlete
        self.isSaving = isSaving
        self.onSave = onSave

        _firstName = State(initialValue: athlete.firstName ?? "")
        _lastName = State(initialValue: athlete.lastName ?? "")
        _phone = State(initialValue: athlete.phone ?? "")
        _location = State(initialValue: athlete.location ?? "")
        _bio = State(initialValue: athlete.bio ?? "")
        _major = State(initialValue: athlete.major ?? "")
        _minor = State(initialValue: athlete.minor ?? "")
        _gpa = State(initialValue: athlete.gpa != nil ? String(athlete.gpa!) : "")
        _graduationDate = State(initialValue: athlete.graduationDate ?? "")
        _awards = State(initialValue: athlete.awards ?? "")
        _coursework = State(initialValue: athlete.coursework ?? "")
        _sport = State(initialValue: athlete.sport ?? "")
        _position = State(initialValue: athlete.position ?? "")
        _division = State(initialValue: athlete.division ?? "")
        _conference = State(initialValue: athlete.conference ?? "")
        _yearsPlayed = State(initialValue: athlete.yearsPlayed != nil ? "\(athlete.yearsPlayed!)" : "")
        _leadershipRoles = State(initialValue: athlete.leadershipRoles ?? "")
        _achievements = State(initialValue: athlete.achievements ?? "")
        _statistics = State(initialValue: athlete.statistics ?? "")
        _skills = State(initialValue: athlete.skills ?? "")
    }

    var body: some View {
        VStack(spacing: 16) {
            // Personal Info Section
            PortalCard {
                VStack(alignment: .leading, spacing: 14) {
                    Label("Personal Info", systemImage: "person")
                        .font(.headline)
                        .foregroundStyle(Color.portalNavy)

                    formField("First Name", text: $firstName)
                    formField("Last Name", text: $lastName)
                    formField("Phone", text: $phone)
                        .keyboardType(.phonePad)
                    formField("Location", text: $location)

                    VStack(alignment: .leading, spacing: 4) {
                        Text("Bio")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        TextEditor(text: $bio)
                            .frame(minHeight: 80)
                            .padding(8)
                            .background(Color(.systemGray6))
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                }
            }

            // Academics Section
            PortalCard {
                VStack(alignment: .leading, spacing: 14) {
                    Label("Academics", systemImage: "graduationcap")
                        .font(.headline)
                        .foregroundStyle(Color.portalNavy)

                    formField("Major", text: $major)
                    formField("Minor", text: $minor)
                    formField("GPA", text: $gpa)
                        .keyboardType(.decimalPad)
                    formField("Graduation Date", text: $graduationDate)
                    formField("Awards", text: $awards)
                    formField("Relevant Coursework", text: $coursework)
                }
            }

            // Athletics Section
            PortalCard {
                VStack(alignment: .leading, spacing: 14) {
                    Label("Athletics", systemImage: "sportscourt")
                        .font(.headline)
                        .foregroundStyle(Color.portalNavy)

                    formField("Sport", text: $sport)
                    formField("Position", text: $position)
                    formField("Division", text: $division)
                    formField("Conference", text: $conference)
                    formField("Years Played", text: $yearsPlayed)
                        .keyboardType(.numberPad)
                    formField("Leadership Roles", text: $leadershipRoles)
                    formField("Achievements", text: $achievements)
                    formField("Statistics", text: $statistics)
                    formField("Skills", text: $skills)
                }
            }

            // Save Button
            Button {
                save()
            } label: {
                HStack {
                    if isSaving {
                        ProgressView()
                            .tint(.white)
                    }
                    Text(isSaving ? "Saving..." : "Save Changes")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Color.portalBlue)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .disabled(isSaving)
        }
    }

    private func formField(_ label: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
            TextField(label, text: text)
                .textFieldStyle(.plain)
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .background(Color(.systemGray6))
                .clipShape(RoundedRectangle(cornerRadius: 8))
        }
    }

    private func save() {
        var updated = originalAthlete
        updated.firstName = firstName.isEmpty ? nil : firstName
        updated.lastName = lastName.isEmpty ? nil : lastName
        updated.phone = phone.isEmpty ? nil : phone
        updated.location = location.isEmpty ? nil : location
        updated.bio = bio.isEmpty ? nil : bio
        updated.major = major.isEmpty ? nil : major
        updated.minor = minor.isEmpty ? nil : minor
        updated.gpa = Double(gpa)
        updated.graduationDate = graduationDate.isEmpty ? nil : graduationDate
        updated.awards = awards.isEmpty ? nil : awards
        updated.coursework = coursework.isEmpty ? nil : coursework
        updated.sport = sport.isEmpty ? nil : sport
        updated.position = position.isEmpty ? nil : position
        updated.division = division.isEmpty ? nil : division
        updated.conference = conference.isEmpty ? nil : conference
        updated.yearsPlayed = Int(yearsPlayed)
        updated.leadershipRoles = leadershipRoles.isEmpty ? nil : leadershipRoles
        updated.achievements = achievements.isEmpty ? nil : achievements
        updated.statistics = statistics.isEmpty ? nil : statistics
        updated.skills = skills.isEmpty ? nil : skills
        onSave(updated)
    }
}
```

- [ ] **Step 4: Create `CompanyEmployeeProfileForm.swift`**

```swift
// Features/Profile/CompanyEmployeeProfileForm.swift

import SwiftUI

struct CompanyEmployeeProfileForm: View {
    @State private var firstName: String
    @State private var lastName: String
    @State private var phone: String
    @State private var bio: String
    @State private var linkedIn: String
    @State private var position: String
    @State private var roleType: String

    // Former athlete fields
    @State private var formerAthlete: Bool
    @State private var formerAthleteSport: String
    @State private var formerAthleteDivision: String
    @State private var formerAthleteSchool: String

    let isSaving: Bool
    let onSave: (CompanyEmployee) -> Void

    private let originalEmployee: CompanyEmployee

    init(employee: CompanyEmployee, isSaving: Bool, onSave: @escaping (CompanyEmployee) -> Void) {
        self.originalEmployee = employee
        self.isSaving = isSaving
        self.onSave = onSave

        _firstName = State(initialValue: employee.firstName ?? "")
        _lastName = State(initialValue: employee.lastName ?? "")
        _phone = State(initialValue: employee.phone ?? "")
        _bio = State(initialValue: employee.bio ?? "")
        _linkedIn = State(initialValue: employee.linkedIn ?? "")
        _position = State(initialValue: employee.position ?? "")
        _roleType = State(initialValue: employee.roleType ?? "")
        _formerAthlete = State(initialValue: employee.formerAthlete ?? false)
        _formerAthleteSport = State(initialValue: employee.formerAthleteSport ?? "")
        _formerAthleteDivision = State(initialValue: employee.formerAthleteDivision ?? "")
        _formerAthleteSchool = State(initialValue: employee.formerAthleteSchool ?? "")
    }

    var body: some View {
        VStack(spacing: 16) {
            PortalCard {
                VStack(alignment: .leading, spacing: 14) {
                    Label("Personal Info", systemImage: "person")
                        .font(.headline)
                        .foregroundStyle(Color.portalNavy)

                    formField("First Name", text: $firstName)
                    formField("Last Name", text: $lastName)
                    formField("Phone", text: $phone)
                        .keyboardType(.phonePad)
                    formField("Position", text: $position)
                    formField("Role Type", text: $roleType)
                    formField("LinkedIn URL", text: $linkedIn)
                        .keyboardType(.URL)
                        .textInputAutocapitalization(.never)

                    VStack(alignment: .leading, spacing: 4) {
                        Text("Bio")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        TextEditor(text: $bio)
                            .frame(minHeight: 80)
                            .padding(8)
                            .background(Color(.systemGray6))
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                }
            }

            PortalCard {
                VStack(alignment: .leading, spacing: 14) {
                    Label("Athletic Background", systemImage: "sportscourt")
                        .font(.headline)
                        .foregroundStyle(Color.portalNavy)

                    Toggle("Former Athlete", isOn: $formerAthlete)
                        .tint(Color.portalBlue)

                    if formerAthlete {
                        formField("Sport", text: $formerAthleteSport)
                        formField("Division", text: $formerAthleteDivision)
                        formField("School", text: $formerAthleteSchool)
                    }
                }
            }

            Button {
                save()
            } label: {
                HStack {
                    if isSaving {
                        ProgressView()
                            .tint(.white)
                    }
                    Text(isSaving ? "Saving..." : "Save Changes")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Color.portalBlue)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .disabled(isSaving)
        }
    }

    private func formField(_ label: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
            TextField(label, text: text)
                .textFieldStyle(.plain)
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .background(Color(.systemGray6))
                .clipShape(RoundedRectangle(cornerRadius: 8))
        }
    }

    private func save() {
        var updated = originalEmployee
        updated.firstName = firstName.isEmpty ? nil : firstName
        updated.lastName = lastName.isEmpty ? nil : lastName
        updated.phone = phone.isEmpty ? nil : phone
        updated.bio = bio.isEmpty ? nil : bio
        updated.linkedIn = linkedIn.isEmpty ? nil : linkedIn
        updated.position = position.isEmpty ? nil : position
        updated.roleType = roleType.isEmpty ? nil : roleType
        updated.formerAthlete = formerAthlete
        updated.formerAthleteSport = formerAthleteSport.isEmpty ? nil : formerAthleteSport
        updated.formerAthleteDivision = formerAthleteDivision.isEmpty ? nil : formerAthleteDivision
        updated.formerAthleteSchool = formerAthleteSchool.isEmpty ? nil : formerAthleteSchool
        onSave(updated)
    }
}
```

- [ ] **Step 5: Create `SchoolEmployeeProfileForm.swift`**

```swift
// Features/Profile/SchoolEmployeeProfileForm.swift

import SwiftUI

struct SchoolEmployeeProfileForm: View {
    @State private var firstName: String
    @State private var lastName: String
    @State private var phone: String
    @State private var bio: String
    @State private var linkedIn: String
    @State private var position: String
    @State private var department: String
    @State private var officeLocation: String
    @State private var officeHours: String

    let isSaving: Bool
    let onSave: (SchoolEmployee) -> Void

    private let originalEmployee: SchoolEmployee

    init(employee: SchoolEmployee, isSaving: Bool, onSave: @escaping (SchoolEmployee) -> Void) {
        self.originalEmployee = employee
        self.isSaving = isSaving
        self.onSave = onSave

        _firstName = State(initialValue: employee.firstName ?? "")
        _lastName = State(initialValue: employee.lastName ?? "")
        _phone = State(initialValue: employee.phone ?? "")
        _bio = State(initialValue: employee.bio ?? "")
        _linkedIn = State(initialValue: employee.linkedIn ?? "")
        _position = State(initialValue: employee.position ?? "")
        _department = State(initialValue: employee.department ?? "")
        _officeLocation = State(initialValue: employee.officeLocation ?? "")
        _officeHours = State(initialValue: employee.officeHours ?? "")
    }

    var body: some View {
        VStack(spacing: 16) {
            PortalCard {
                VStack(alignment: .leading, spacing: 14) {
                    Label("Personal Info", systemImage: "person")
                        .font(.headline)
                        .foregroundStyle(Color.portalNavy)

                    formField("First Name", text: $firstName)
                    formField("Last Name", text: $lastName)
                    formField("Phone", text: $phone)
                        .keyboardType(.phonePad)
                    formField("LinkedIn URL", text: $linkedIn)
                        .keyboardType(.URL)
                        .textInputAutocapitalization(.never)

                    VStack(alignment: .leading, spacing: 4) {
                        Text("Bio")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        TextEditor(text: $bio)
                            .frame(minHeight: 80)
                            .padding(8)
                            .background(Color(.systemGray6))
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                }
            }

            PortalCard {
                VStack(alignment: .leading, spacing: 14) {
                    Label("School Details", systemImage: "building.columns")
                        .font(.headline)
                        .foregroundStyle(Color.portalNavy)

                    formField("Position", text: $position)
                    formField("Department", text: $department)
                    formField("Office Location", text: $officeLocation)
                    formField("Office Hours", text: $officeHours)
                }
            }

            Button {
                save()
            } label: {
                HStack {
                    if isSaving {
                        ProgressView()
                            .tint(.white)
                    }
                    Text(isSaving ? "Saving..." : "Save Changes")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Color.portalBlue)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .disabled(isSaving)
        }
    }

    private func formField(_ label: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
            TextField(label, text: text)
                .textFieldStyle(.plain)
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .background(Color(.systemGray6))
                .clipShape(RoundedRectangle(cornerRadius: 8))
        }
    }

    private func save() {
        var updated = originalEmployee
        updated.firstName = firstName.isEmpty ? nil : firstName
        updated.lastName = lastName.isEmpty ? nil : lastName
        updated.phone = phone.isEmpty ? nil : phone
        updated.bio = bio.isEmpty ? nil : bio
        updated.linkedIn = linkedIn.isEmpty ? nil : linkedIn
        updated.position = position.isEmpty ? nil : position
        updated.department = department.isEmpty ? nil : department
        updated.officeLocation = officeLocation.isEmpty ? nil : officeLocation
        updated.officeHours = officeHours.isEmpty ? nil : officeHours
        onSave(updated)
    }
}
```

- [ ] **Step 6: Remove any profile placeholders from `Placeholders.swift`**

- [ ] **Step 7: Verify compile**
```bash
xcodebuild build -scheme Portal -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | tail -5
```

- [ ] **Step 8: Commit**
```bash
git add Features/Profile/ProfileViewModel.swift Features/Profile/ProfileView.swift Features/Profile/AthleteProfileForm.swift Features/Profile/CompanyEmployeeProfileForm.swift Features/Profile/SchoolEmployeeProfileForm.swift
git commit -m "Add profile view/edit with forms for athlete, company, and school employees"
```

## Chunk 5: Employer Features

---

### Task 16: Jobs Management (Employer)

**Files:**
- `PortalApp/Features/Employer/JobsManageViewModel.swift`
- `PortalApp/Features/Employer/JobsManageView.swift`
- `PortalApp/Features/Employer/CreateJobView.swift`

- [ ] **Step 1: Create `JobsManageViewModel`**

```swift
// PortalApp/Features/Employer/JobsManageViewModel.swift

import Foundation

@Observable
final class JobsManageViewModel {
    var jobs: [Job] = []
    var isLoading = false
    var error: String?
    var selectedType: JobType? = nil

    var filteredJobs: [Job] {
        guard let selectedType else { return jobs }
        return jobs.filter { $0.type == selectedType }
    }

    var jobCount: Int {
        jobs.filter { $0.type == .job }.count
    }

    var internshipCount: Int {
        jobs.filter { $0.type == .internship }.count
    }

    var nilCount: Int {
        jobs.filter { $0.type == .nil_deal }.count
    }

    func load() async {
        isLoading = true
        error = nil
        do {
            jobs = try await APIClient.shared.get("/getJobs")
            isLoading = false
        } catch {
            self.error = error.localizedDescription
            isLoading = false
        }
    }

    func deleteJob(_ job: Job) async {
        do {
            let _: EmptyResponse = try await APIClient.shared.post("/deleteJob", body: ["jobId": job.id])
            jobs.removeAll { $0.id == job.id }
        } catch {
            self.error = error.localizedDescription
        }
    }
}
```

- [ ] **Step 2: Create `JobsManageView`**

```swift
// PortalApp/Features/Employer/JobsManageView.swift

import SwiftUI

struct JobsManageView: View {
    @State private var viewModel = JobsManageViewModel()
    @State private var showCreateJob = false
    @State private var editingJob: Job?

    private let typeOptions: [(String, JobType?)] = [
        ("All", nil),
        ("Jobs", .job),
        ("Internships", .internship),
        ("NIL", .nil_deal)
    ]

    var body: some View {
        VStack(spacing: 0) {
            // Segmented type control
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(typeOptions, id: \.0) { label, type in
                        Button {
                            withAnimation { viewModel.selectedType = type }
                        } label: {
                            Text(label)
                                .font(.subheadline.weight(.medium))
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(
                                    viewModel.selectedType == type
                                        ? Color.portalBlue
                                        : Color.portalBlue.opacity(0.1)
                                )
                                .foregroundStyle(
                                    viewModel.selectedType == type
                                        ? .white
                                        : Color.portalBlue
                                )
                                .clipShape(Capsule())
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.vertical, 12)
            }

            Divider()

            // Content
            if viewModel.isLoading {
                LoadingState(message: "Loading jobs...")
            } else if let error = viewModel.error {
                EmptyState(
                    icon: "exclamationmark.triangle",
                    title: "Error",
                    message: error
                )
            } else if viewModel.filteredJobs.isEmpty {
                EmptyState(
                    icon: "briefcase",
                    title: "No Jobs Yet",
                    message: "Create your first job posting to start attracting talent."
                )
            } else {
                List {
                    ForEach(viewModel.filteredJobs) { job in
                        JobManageRow(job: job)
                            .contentShape(Rectangle())
                            .onTapGesture { editingJob = job }
                            .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                                Button(role: .destructive) {
                                    Task { await viewModel.deleteJob(job) }
                                } label: {
                                    Label("Delete", systemImage: "trash")
                                }
                            }
                    }
                }
                .listStyle(.plain)
            }
        }
        .navigationTitle("Manage Jobs")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    showCreateJob = true
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .foregroundStyle(Color.portalBlue)
                }
            }
        }
        .sheet(isPresented: $showCreateJob) {
            NavigationStack {
                CreateJobView { await viewModel.load() }
            }
        }
        .sheet(item: $editingJob) { job in
            NavigationStack {
                CreateJobView(existingJob: job) { await viewModel.load() }
            }
        }
        .task { await viewModel.load() }
        .refreshable { await viewModel.load() }
    }
}

// MARK: - Job Row

private struct JobManageRow: View {
    let job: Job

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(job.position)
                    .font(.headline)

                HStack(spacing: 8) {
                    StatusPill(
                        text: job.type.rawValue.capitalized,
                        color: typeColor
                    )
                    StatusPill(
                        text: job.status.rawValue.capitalized,
                        color: statusColor
                    )
                }

                if let industry = job.industry {
                    Text(industry)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            // Applicant count
            VStack(spacing: 2) {
                Text("\(job.applicantCount ?? 0)")
                    .font(.title3.weight(.bold))
                    .foregroundStyle(Color.portalBlue)
                Text("Applicants")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(.vertical, 4)
    }

    private var typeColor: Color {
        switch job.type {
        case .job: return .blue
        case .internship: return .orange
        case .nil_deal: return .purple
        }
    }

    private var statusColor: Color {
        switch job.status {
        case .active: return .green
        case .closed: return .red
        case .draft: return .gray
        case .paused: return .yellow
        }
    }
}
```

- [ ] **Step 3: Create `CreateJobView`**

```swift
// PortalApp/Features/Employer/CreateJobView.swift

import SwiftUI

@Observable
final class CreateJobViewModel {
    var position = ""
    var description = ""
    var type: JobType = .job
    var industry = ""
    var experience = ""
    var duration = ""
    var salary = ""
    var benefits = ""
    var applicationDeadline: Date = Calendar.current.date(
        byAdding: .month, value: 1, to: .now
    ) ?? .now
    var isSubmitting = false
    var error: String?
    var didSave = false

    private var existingJobId: String?

    var isEditing: Bool { existingJobId != nil }

    var isValid: Bool {
        !position.trimmingCharacters(in: .whitespaces).isEmpty &&
        !description.trimmingCharacters(in: .whitespaces).isEmpty
    }

    func populate(from job: Job) {
        existingJobId = job.id
        position = job.position
        description = job.description ?? ""
        type = job.type
        industry = job.industry ?? ""
        experience = job.experience ?? ""
        duration = job.duration ?? ""
        salary = job.salary ?? ""
        benefits = job.benefits ?? ""
        if let deadline = job.applicationDeadline {
            applicationDeadline = deadline
        }
    }

    func submit() async {
        guard isValid else {
            error = "Position and description are required."
            return
        }
        isSubmitting = true
        error = nil

        let body: [String: Any] = [
            "position": position,
            "description": description,
            "type": type.rawValue,
            "industry": industry,
            "experience": experience,
            "duration": duration,
            "salary": salary,
            "benefits": benefits,
            "applicationDeadline": ISO8601DateFormatter().string(from: applicationDeadline)
        ]

        do {
            if let jobId = existingJobId {
                var updateBody = body
                updateBody["jobId"] = jobId
                let _: Job = try await APIClient.shared.put("/updateJob", body: updateBody)
            } else {
                let _: Job = try await APIClient.shared.post("/createJob", body: body)
            }
            didSave = true
            isSubmitting = false
        } catch {
            self.error = error.localizedDescription
            isSubmitting = false
        }
    }
}

struct CreateJobView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel = CreateJobViewModel()
    var existingJob: Job?
    var onSave: (() async -> Void)?

    var body: some View {
        Form {
            Section("Position Details") {
                TextField("Position Title", text: $viewModel.position)
                    .textInputAutocapitalization(.words)

                Picker("Type", selection: $viewModel.type) {
                    Text("Job").tag(JobType.job)
                    Text("Internship").tag(JobType.internship)
                    Text("NIL Deal").tag(JobType.nil_deal)
                }

                TextField("Industry", text: $viewModel.industry)
                    .textInputAutocapitalization(.words)
            }

            Section("Description") {
                TextEditor(text: $viewModel.description)
                    .frame(minHeight: 120)
            }

            Section("Requirements") {
                TextField("Experience Required", text: $viewModel.experience)
                TextField("Duration", text: $viewModel.duration)
            }

            Section("Compensation") {
                TextField("Salary", text: $viewModel.salary)
                    .keyboardType(.decimalPad)
                TextField("Benefits", text: $viewModel.benefits)
            }

            Section("Deadline") {
                DatePicker(
                    "Application Deadline",
                    selection: $viewModel.applicationDeadline,
                    in: Date.now...,
                    displayedComponents: .date
                )
            }

            if let error = viewModel.error {
                Section {
                    Text(error)
                        .foregroundStyle(.red)
                        .font(.caption)
                }
            }
        }
        .navigationTitle(viewModel.isEditing ? "Edit Job" : "Create Job")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") { dismiss() }
            }
            ToolbarItem(placement: .confirmationAction) {
                Button(viewModel.isEditing ? "Save" : "Create") {
                    Task {
                        await viewModel.submit()
                        if viewModel.didSave {
                            await onSave?()
                            dismiss()
                        }
                    }
                }
                .disabled(!viewModel.isValid || viewModel.isSubmitting)
            }
        }
        .onAppear {
            if let existingJob {
                viewModel.populate(from: existingJob)
            }
        }
        .interactiveDismissDisabled(viewModel.isSubmitting)
    }
}
```

- [ ] **Step 4: Remove placeholder**

In `Placeholders.swift`, delete:
```swift
struct JobsManageView: View {
    var body: some View { Text("Jobs Manage – coming soon") }
}
```

- [ ] **Step 5: Verify compile**

```bash
xcodebuild build -scheme PortalApp -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | tail -5
```

- [ ] **Step 6: Commit**

```bash
git add PortalApp/Features/Employer/JobsManageViewModel.swift \
       PortalApp/Features/Employer/JobsManageView.swift \
       PortalApp/Features/Employer/CreateJobView.swift \
       PortalApp/Placeholders.swift
git commit -m "Add employer jobs management with create/edit flow (Task 16)"
```

---

### Task 17: Candidates View (Employer)

**Files:**
- `PortalApp/Features/Employer/CandidatesViewModel.swift`
- `PortalApp/Features/Employer/CandidatesView.swift`
- `PortalApp/Features/Employer/ScheduleInterviewView.swift`

- [ ] **Step 1: Create `CandidatesViewModel`**

```swift
// PortalApp/Features/Employer/CandidatesViewModel.swift

import Foundation

@Observable
final class CandidatesViewModel {
    var applications: [Application] = []
    var jobs: [Job] = []
    var selectedJobId: String?
    var isLoading = false
    var error: String?

    var filteredApplications: [Application] {
        guard let selectedJobId else { return applications }
        return applications.filter { $0.jobId == selectedJobId }
    }

    func load() async {
        isLoading = true
        error = nil
        do {
            async let appsReq: [Application] = APIClient.shared.get("/getApplications")
            async let jobsReq: [Job] = APIClient.shared.get("/getJobs")
            let (apps, loadedJobs) = try await (appsReq, jobsReq)
            applications = apps
            jobs = loadedJobs
            isLoading = false
        } catch {
            self.error = error.localizedDescription
            isLoading = false
        }
    }

    func updateStatus(applicationId: String, status: ApplicationStatus) async {
        do {
            let body: [String: String] = [
                "applicationId": applicationId,
                "status": status.rawValue
            ]
            let updated: Application = try await APIClient.shared.patch(
                "/updateApplicationStatus", body: body
            )
            if let idx = applications.firstIndex(where: { $0.id == applicationId }) {
                applications[idx] = updated
            }
        } catch {
            self.error = error.localizedDescription
        }
    }
}
```

- [ ] **Step 2: Create `CandidatesView`**

```swift
// PortalApp/Features/Employer/CandidatesView.swift

import SwiftUI

struct CandidatesView: View {
    @State private var viewModel = CandidatesViewModel()
    @State private var selectedApplication: Application?
    @State private var scheduleTarget: Application?

    var body: some View {
        VStack(spacing: 0) {
            // Job filter bar
            if !viewModel.jobs.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        FilterChip(
                            title: "All Jobs",
                            isSelected: viewModel.selectedJobId == nil
                        ) {
                            viewModel.selectedJobId = nil
                        }

                        ForEach(viewModel.jobs) { job in
                            FilterChip(
                                title: job.position,
                                isSelected: viewModel.selectedJobId == job.id
                            ) {
                                viewModel.selectedJobId = job.id
                            }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 12)
                }

                Divider()
            }

            // Content
            if viewModel.isLoading {
                LoadingState(message: "Loading candidates...")
            } else if let error = viewModel.error {
                EmptyState(
                    icon: "exclamationmark.triangle",
                    title: "Error",
                    message: error
                )
            } else if viewModel.filteredApplications.isEmpty {
                EmptyState(
                    icon: "person.2",
                    title: "No Candidates",
                    message: "Candidates will appear here once athletes apply to your jobs."
                )
            } else {
                List {
                    ForEach(viewModel.filteredApplications) { application in
                        CandidateRow(application: application)
                            .contentShape(Rectangle())
                            .onTapGesture { selectedApplication = application }
                            .swipeActions(edge: .trailing) {
                                Button {
                                    scheduleTarget = application
                                } label: {
                                    Label("Interview", systemImage: "calendar.badge.plus")
                                }
                                .tint(Color.portalBlue)
                            }
                            .swipeActions(edge: .leading) {
                                Button {
                                    Task {
                                        await viewModel.updateStatus(
                                            applicationId: application.id,
                                            status: .reviewed
                                        )
                                    }
                                } label: {
                                    Label("Review", systemImage: "eye")
                                }
                                .tint(.orange)

                                Button {
                                    Task {
                                        await viewModel.updateStatus(
                                            applicationId: application.id,
                                            status: .accepted
                                        )
                                    }
                                } label: {
                                    Label("Accept", systemImage: "checkmark")
                                }
                                .tint(.green)
                            }
                    }
                }
                .listStyle(.plain)
            }
        }
        .navigationTitle("Candidates")
        .sheet(item: $selectedApplication) { application in
            NavigationStack {
                CandidateDetailSheet(
                    application: application,
                    onUpdateStatus: { status in
                        await viewModel.updateStatus(
                            applicationId: application.id,
                            status: status
                        )
                    },
                    onScheduleInterview: {
                        selectedApplication = nil
                        scheduleTarget = application
                    }
                )
            }
        }
        .sheet(item: $scheduleTarget) { application in
            NavigationStack {
                ScheduleInterviewView(application: application) {
                    await viewModel.load()
                }
            }
        }
        .task { await viewModel.load() }
        .refreshable { await viewModel.load() }
    }
}

// MARK: - Candidate Row

private struct CandidateRow: View {
    let application: Application

    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(Color.portalBlue.opacity(0.15))
                .frame(width: 44, height: 44)
                .overlay {
                    Text(initials)
                        .font(.headline)
                        .foregroundStyle(Color.portalBlue)
                }

            VStack(alignment: .leading, spacing: 4) {
                Text(application.athleteName ?? "Candidate")
                    .font(.headline)

                HStack(spacing: 6) {
                    if let sport = application.sport {
                        Text(sport)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    if let school = application.schoolName {
                        Text("·")
                            .foregroundStyle(.tertiary)
                        Text(school)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                Text(application.jobPosition ?? "Position")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }

            Spacer()

            StatusPill(
                text: application.status.rawValue.capitalized,
                color: statusColor
            )
        }
        .padding(.vertical, 4)
    }

    private var initials: String {
        guard let name = application.athleteName else { return "?" }
        let parts = name.split(separator: " ")
        let first = parts.first?.prefix(1) ?? ""
        let last = parts.count > 1 ? parts.last!.prefix(1) : ""
        return "\(first)\(last)".uppercased()
    }

    private var statusColor: Color {
        switch application.status {
        case .pending: return .orange
        case .reviewed: return .blue
        case .accepted: return .green
        case .rejected: return .red
        case .withdrawn: return .gray
        }
    }
}

// MARK: - Filter Chip

private struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline.weight(.medium))
                .lineLimit(1)
                .padding(.horizontal, 14)
                .padding(.vertical, 7)
                .background(isSelected ? Color.portalBlue : Color.portalBlue.opacity(0.1))
                .foregroundStyle(isSelected ? .white : Color.portalBlue)
                .clipShape(Capsule())
        }
    }
}

// MARK: - Candidate Detail Sheet

private struct CandidateDetailSheet: View {
    @Environment(\.dismiss) private var dismiss
    let application: Application
    let onUpdateStatus: (ApplicationStatus) async -> Void
    let onScheduleInterview: () -> Void

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                VStack(spacing: 8) {
                    Circle()
                        .fill(Color.portalBlue.opacity(0.15))
                        .frame(width: 72, height: 72)
                        .overlay {
                            Image(systemName: "person.fill")
                                .font(.title)
                                .foregroundStyle(Color.portalBlue)
                        }

                    Text(application.athleteName ?? "Candidate")
                        .font(.title2.weight(.bold))

                    HStack(spacing: 8) {
                        if let sport = application.sport {
                            Text(sport)
                        }
                        if let school = application.schoolName {
                            Text("·")
                            Text(school)
                        }
                    }
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                    StatusPill(
                        text: application.status.rawValue.capitalized,
                        color: .blue
                    )
                }
                .padding(.top)

                Divider()

                // Application info
                PortalCard {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Application Details")
                            .font(.headline)

                        if let position = application.jobPosition {
                            DetailRow(label: "Position", value: position)
                        }
                        if let date = application.appliedDate {
                            DetailRow(
                                label: "Applied",
                                value: date.formatted(date: .abbreviated, time: .omitted)
                            )
                        }
                        if let note = application.note {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Cover Note")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                Text(note)
                                    .font(.subheadline)
                            }
                        }
                    }
                }

                // Action buttons
                VStack(spacing: 10) {
                    Button {
                        onScheduleInterview()
                    } label: {
                        Label("Schedule Interview", systemImage: "calendar.badge.plus")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color.portalBlue)

                    HStack(spacing: 10) {
                        Button {
                            Task {
                                await onUpdateStatus(.accepted)
                                dismiss()
                            }
                        } label: {
                            Text("Accept")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(.green)

                        Button {
                            Task {
                                await onUpdateStatus(.rejected)
                                dismiss()
                            }
                        } label: {
                            Text("Reject")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(.red)
                    }
                }
            }
            .padding()
        }
        .navigationTitle("Candidate")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Close") { dismiss() }
            }
        }
    }
}

private struct DetailRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .font(.subheadline.weight(.medium))
        }
    }
}
```

- [ ] **Step 3: Create `ScheduleInterviewView`**

```swift
// PortalApp/Features/Employer/ScheduleInterviewView.swift

import SwiftUI

@Observable
final class ScheduleInterviewViewModel {
    var dateTime: Date = Calendar.current.date(
        byAdding: .day, value: 3, to: .now
    ) ?? .now
    var location = ""
    var interviewer = ""
    var preparationTips = ""
    var isSubmitting = false
    var error: String?
    var didSave = false

    var isValid: Bool {
        !location.trimmingCharacters(in: .whitespaces).isEmpty &&
        !interviewer.trimmingCharacters(in: .whitespaces).isEmpty &&
        dateTime > .now
    }

    func submit(applicationId: String, jobId: String) async {
        guard isValid else {
            error = "Please fill in all required fields and ensure the date is in the future."
            return
        }
        isSubmitting = true
        error = nil

        let body: [String: Any] = [
            "applicationId": applicationId,
            "jobId": jobId,
            "dateTime": ISO8601DateFormatter().string(from: dateTime),
            "location": location,
            "interviewer": interviewer,
            "preparationTips": preparationTips
        ]

        do {
            let _: Interview = try await APIClient.shared.post(
                "/createInterview", body: body
            )
            didSave = true
            isSubmitting = false
        } catch {
            self.error = error.localizedDescription
            isSubmitting = false
        }
    }
}

struct ScheduleInterviewView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel = ScheduleInterviewViewModel()
    let application: Application
    var onSave: (() async -> Void)?

    var body: some View {
        Form {
            Section("Interview Details") {
                DatePicker(
                    "Date & Time",
                    selection: $viewModel.dateTime,
                    in: Date.now...,
                    displayedComponents: [.date, .hourAndMinute]
                )

                TextField("Location", text: $viewModel.location)
                    .textInputAutocapitalization(.words)

                TextField("Interviewer Name", text: $viewModel.interviewer)
                    .textInputAutocapitalization(.words)
            }

            Section("Preparation Tips") {
                TextEditor(text: $viewModel.preparationTips)
                    .frame(minHeight: 80)
            }

            Section {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Candidate")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Text(application.athleteName ?? "Unknown")
                        .font(.subheadline.weight(.medium))
                }

                if let position = application.jobPosition {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Position")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Text(position)
                            .font(.subheadline.weight(.medium))
                    }
                }
            } header: {
                Text("Context")
            }

            if let error = viewModel.error {
                Section {
                    Text(error)
                        .foregroundStyle(.red)
                        .font(.caption)
                }
            }
        }
        .navigationTitle("Schedule Interview")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") { dismiss() }
            }
            ToolbarItem(placement: .confirmationAction) {
                Button("Schedule") {
                    Task {
                        await viewModel.submit(
                            applicationId: application.id,
                            jobId: application.jobId
                        )
                        if viewModel.didSave {
                            await onSave?()
                            dismiss()
                        }
                    }
                }
                .disabled(!viewModel.isValid || viewModel.isSubmitting)
            }
        }
        .interactiveDismissDisabled(viewModel.isSubmitting)
    }
}
```

- [ ] **Step 4: Remove placeholder**

In `Placeholders.swift`, delete:
```swift
struct CandidatesView: View {
    var body: some View { Text("Candidates – coming soon") }
}
```

- [ ] **Step 5: Verify compile**

```bash
xcodebuild build -scheme PortalApp -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | tail -5
```

- [ ] **Step 6: Commit**

```bash
git add PortalApp/Features/Employer/CandidatesViewModel.swift \
       PortalApp/Features/Employer/CandidatesView.swift \
       PortalApp/Features/Employer/ScheduleInterviewView.swift \
       PortalApp/Placeholders.swift
git commit -m "Add candidates view with status updates and interview scheduling (Task 17)"
```

---

### Task 18: Company Profile (Employer)

**Files:**
- `PortalApp/Features/Employer/CompanyProfileViewModel.swift`
- `PortalApp/Features/Employer/CompanyProfileView.swift`

- [ ] **Step 1: Create `CompanyProfileViewModel`**

```swift
// PortalApp/Features/Employer/CompanyProfileViewModel.swift

import Foundation

@Observable
final class CompanyProfileViewModel {
    var company: Company?
    var isLoading = false
    var isSaving = false
    var error: String?

    // Culture editing
    var editingCulture = false
    var cultureValues = ""
    var cultureEnvironment: [String] = []
    var cultureThrivePoints: [String] = []
    var newEnvironmentItem = ""
    var newThriveItem = ""

    // Benefits editing
    var editingBenefits = false
    var salaryMin = ""
    var salaryMax = ""
    var commissionMin = ""
    var commissionMax = ""
    var totalCompMin = ""
    var totalCompMax = ""
    var specificBenefits: [String] = []
    var newBenefitItem = ""

    // Recruiting editing
    var editingRecruiting = false
    var recruitingStrategy = ""
    var processSteps: [String] = []
    var newProcessStep = ""

    func load(companyId: String) async {
        isLoading = true
        error = nil
        do {
            let loaded: Company = try await APIClient.shared.get(
                "/getCompany/\(companyId)"
            )
            company = loaded
            populateEditFields(from: loaded)
            isLoading = false
        } catch {
            self.error = error.localizedDescription
            isLoading = false
        }
    }

    private func populateEditFields(from company: Company) {
        // Culture
        cultureValues = company.culture?.values ?? ""
        cultureEnvironment = company.culture?.environment ?? []
        cultureThrivePoints = company.culture?.thrivePoints ?? []

        // Benefits
        salaryMin = company.benefits?.salaryMin.map { String($0) } ?? ""
        salaryMax = company.benefits?.salaryMax.map { String($0) } ?? ""
        commissionMin = company.benefits?.commissionMin.map { String($0) } ?? ""
        commissionMax = company.benefits?.commissionMax.map { String($0) } ?? ""
        totalCompMin = company.benefits?.totalCompMin.map { String($0) } ?? ""
        totalCompMax = company.benefits?.totalCompMax.map { String($0) } ?? ""
        specificBenefits = company.benefits?.specificBenefits ?? []

        // Recruiting
        recruitingStrategy = company.recruiting?.strategy ?? ""
        processSteps = company.recruiting?.processSteps ?? []
    }

    func addEnvironmentItem() {
        let item = newEnvironmentItem.trimmingCharacters(in: .whitespaces)
        guard !item.isEmpty else { return }
        cultureEnvironment.append(item)
        newEnvironmentItem = ""
    }

    func addThriveItem() {
        let item = newThriveItem.trimmingCharacters(in: .whitespaces)
        guard !item.isEmpty else { return }
        cultureThrivePoints.append(item)
        newThriveItem = ""
    }

    func addBenefitItem() {
        let item = newBenefitItem.trimmingCharacters(in: .whitespaces)
        guard !item.isEmpty else { return }
        specificBenefits.append(item)
        newBenefitItem = ""
    }

    func addProcessStep() {
        let item = newProcessStep.trimmingCharacters(in: .whitespaces)
        guard !item.isEmpty else { return }
        processSteps.append(item)
        newProcessStep = ""
    }

    func saveCulture() async {
        guard let companyId = company?.id else { return }
        isSaving = true
        let body: [String: Any] = [
            "companyId": companyId,
            "culture": [
                "values": cultureValues,
                "environment": cultureEnvironment,
                "thrivePoints": cultureThrivePoints
            ]
        ]
        do {
            let updated: Company = try await APIClient.shared.put(
                "/updateCompany", body: body
            )
            company = updated
            populateEditFields(from: updated)
            editingCulture = false
            isSaving = false
        } catch {
            self.error = error.localizedDescription
            isSaving = false
        }
    }

    func saveBenefits() async {
        guard let companyId = company?.id else { return }
        isSaving = true
        let body: [String: Any] = [
            "companyId": companyId,
            "benefits": [
                "salaryMin": Int(salaryMin) as Any,
                "salaryMax": Int(salaryMax) as Any,
                "commissionMin": Int(commissionMin) as Any,
                "commissionMax": Int(commissionMax) as Any,
                "totalCompMin": Int(totalCompMin) as Any,
                "totalCompMax": Int(totalCompMax) as Any,
                "specificBenefits": specificBenefits
            ]
        ]
        do {
            let updated: Company = try await APIClient.shared.put(
                "/updateCompany", body: body
            )
            company = updated
            populateEditFields(from: updated)
            editingBenefits = false
            isSaving = false
        } catch {
            self.error = error.localizedDescription
            isSaving = false
        }
    }

    func saveRecruiting() async {
        guard let companyId = company?.id else { return }
        isSaving = true
        let body: [String: Any] = [
            "companyId": companyId,
            "recruiting": [
                "strategy": recruitingStrategy,
                "processSteps": processSteps
            ]
        ]
        do {
            let updated: Company = try await APIClient.shared.put(
                "/updateCompany", body: body
            )
            company = updated
            populateEditFields(from: updated)
            editingRecruiting = false
            isSaving = false
        } catch {
            self.error = error.localizedDescription
            isSaving = false
        }
    }
}
```

- [ ] **Step 2: Create `CompanyProfileView`**

```swift
// PortalApp/Features/Employer/CompanyProfileView.swift

import SwiftUI

struct CompanyProfileView: View {
    @State private var viewModel = CompanyProfileViewModel()
    let companyId: String

    var body: some View {
        Group {
            if viewModel.isLoading {
                LoadingState(message: "Loading company profile...")
            } else if let error = viewModel.error, viewModel.company == nil {
                EmptyState(
                    icon: "exclamationmark.triangle",
                    title: "Error",
                    message: error
                )
            } else if let company = viewModel.company {
                ScrollView {
                    VStack(spacing: 20) {
                        // Company header
                        GradientHeader {
                            VStack(spacing: 8) {
                                Text(company.companyName)
                                    .font(.title.weight(.bold))
                                    .foregroundStyle(.white)
                                if let industry = company.industry {
                                    Text(industry)
                                        .font(.subheadline)
                                        .foregroundStyle(.white.opacity(0.8))
                                }
                            }
                        }

                        VStack(spacing: 16) {
                            cultureSection
                            benefitsSection
                            recruitingSection
                        }
                        .padding(.horizontal)
                        .padding(.bottom, 24)
                    }
                }
            }
        }
        .navigationTitle("Company Profile")
        .navigationBarTitleDisplayMode(.inline)
        .task { await viewModel.load(companyId: companyId) }
        .refreshable { await viewModel.load(companyId: companyId) }
    }

    // MARK: - Culture Section

    @ViewBuilder
    private var cultureSection: some View {
        PortalCard {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Label("Culture", systemImage: "heart.fill")
                        .font(.headline)
                    Spacer()
                    Button(viewModel.editingCulture ? "Cancel" : "Edit") {
                        withAnimation {
                            viewModel.editingCulture.toggle()
                        }
                    }
                    .font(.subheadline)
                    .foregroundStyle(Color.portalBlue)
                }

                if viewModel.editingCulture {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Values")
                            .font(.subheadline.weight(.medium))
                        TextEditor(text: $viewModel.cultureValues)
                            .frame(minHeight: 60)
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color.gray.opacity(0.3))
                            )

                        Text("Environment")
                            .font(.subheadline.weight(.medium))
                        TagEditor(
                            items: $viewModel.cultureEnvironment,
                            newItem: $viewModel.newEnvironmentItem,
                            placeholder: "Add environment trait",
                            onAdd: { viewModel.addEnvironmentItem() }
                        )

                        Text("Thrive Points")
                            .font(.subheadline.weight(.medium))
                        TagEditor(
                            items: $viewModel.cultureThrivePoints,
                            newItem: $viewModel.newThriveItem,
                            placeholder: "Add thrive point",
                            onAdd: { viewModel.addThriveItem() }
                        )

                        Button {
                            Task { await viewModel.saveCulture() }
                        } label: {
                            Text("Save Culture")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color.portalBlue)
                        .disabled(viewModel.isSaving)
                    }
                } else {
                    if let values = viewModel.company?.culture?.values,
                       !values.isEmpty {
                        Text(values)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }

                    if let environment = viewModel.company?.culture?.environment,
                       !environment.isEmpty {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Environment")
                                .font(.caption.weight(.medium))
                                .foregroundStyle(.secondary)
                            TagListView(tags: environment, color: Color.portalBlue)
                        }
                    }

                    if let thrive = viewModel.company?.culture?.thrivePoints,
                       !thrive.isEmpty {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("You'll Thrive If...")
                                .font(.caption.weight(.medium))
                                .foregroundStyle(.secondary)
                            TagListView(tags: thrive, color: .green)
                        }
                    }
                }
            }
        }
    }

    // MARK: - Benefits Section

    @ViewBuilder
    private var benefitsSection: some View {
        PortalCard {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Label("Benefits", systemImage: "dollarsign.circle.fill")
                        .font(.headline)
                    Spacer()
                    Button(viewModel.editingBenefits ? "Cancel" : "Edit") {
                        withAnimation {
                            viewModel.editingBenefits.toggle()
                        }
                    }
                    .font(.subheadline)
                    .foregroundStyle(Color.portalBlue)
                }

                if viewModel.editingBenefits {
                    VStack(alignment: .leading, spacing: 12) {
                        CompRangeEditor(
                            label: "Salary",
                            minValue: $viewModel.salaryMin,
                            maxValue: $viewModel.salaryMax
                        )
                        CompRangeEditor(
                            label: "Commission",
                            minValue: $viewModel.commissionMin,
                            maxValue: $viewModel.commissionMax
                        )
                        CompRangeEditor(
                            label: "Total Comp",
                            minValue: $viewModel.totalCompMin,
                            maxValue: $viewModel.totalCompMax
                        )

                        Text("Specific Benefits")
                            .font(.subheadline.weight(.medium))
                        TagEditor(
                            items: $viewModel.specificBenefits,
                            newItem: $viewModel.newBenefitItem,
                            placeholder: "Add benefit",
                            onAdd: { viewModel.addBenefitItem() }
                        )

                        Button {
                            Task { await viewModel.saveBenefits() }
                        } label: {
                            Text("Save Benefits")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color.portalBlue)
                        .disabled(viewModel.isSaving)
                    }
                } else {
                    let benefits = viewModel.company?.benefits
                    if let salMin = benefits?.salaryMin,
                       let salMax = benefits?.salaryMax {
                        CompRangeRow(
                            label: "Salary",
                            min: salMin,
                            max: salMax
                        )
                    }
                    if let comMin = benefits?.commissionMin,
                       let comMax = benefits?.commissionMax {
                        CompRangeRow(
                            label: "Commission",
                            min: comMin,
                            max: comMax
                        )
                    }
                    if let tcMin = benefits?.totalCompMin,
                       let tcMax = benefits?.totalCompMax {
                        CompRangeRow(
                            label: "Total Comp",
                            min: tcMin,
                            max: tcMax
                        )
                    }
                    if let specific = benefits?.specificBenefits,
                       !specific.isEmpty {
                        TagListView(tags: specific, color: .green)
                    }
                }
            }
        }
    }

    // MARK: - Recruiting Section

    @ViewBuilder
    private var recruitingSection: some View {
        PortalCard {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Label("Recruiting", systemImage: "person.badge.plus")
                        .font(.headline)
                    Spacer()
                    Button(viewModel.editingRecruiting ? "Cancel" : "Edit") {
                        withAnimation {
                            viewModel.editingRecruiting.toggle()
                        }
                    }
                    .font(.subheadline)
                    .foregroundStyle(Color.portalBlue)
                }

                if viewModel.editingRecruiting {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Strategy")
                            .font(.subheadline.weight(.medium))
                        TextEditor(text: $viewModel.recruitingStrategy)
                            .frame(minHeight: 60)
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color.gray.opacity(0.3))
                            )

                        Text("Process Steps")
                            .font(.subheadline.weight(.medium))
                        TagEditor(
                            items: $viewModel.processSteps,
                            newItem: $viewModel.newProcessStep,
                            placeholder: "Add process step",
                            onAdd: { viewModel.addProcessStep() }
                        )

                        Button {
                            Task { await viewModel.saveRecruiting() }
                        } label: {
                            Text("Save Recruiting")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color.portalBlue)
                        .disabled(viewModel.isSaving)
                    }
                } else {
                    if let strategy = viewModel.company?.recruiting?.strategy,
                       !strategy.isEmpty {
                        Text(strategy)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    if let steps = viewModel.company?.recruiting?.processSteps,
                       !steps.isEmpty {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Hiring Process")
                                .font(.caption.weight(.medium))
                                .foregroundStyle(.secondary)
                            ForEach(Array(steps.enumerated()), id: \.offset) { idx, step in
                                HStack(alignment: .top, spacing: 8) {
                                    Text("\(idx + 1).")
                                        .font(.subheadline.weight(.bold))
                                        .foregroundStyle(Color.portalBlue)
                                        .frame(width: 20, alignment: .trailing)
                                    Text(step)
                                        .font(.subheadline)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Helper Views

private struct TagListView: View {
    let tags: [String]
    let color: Color

    var body: some View {
        FlowLayout(spacing: 6) {
            ForEach(tags, id: \.self) { tag in
                Text(tag)
                    .font(.caption)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(color.opacity(0.12))
                    .foregroundStyle(color)
                    .clipShape(Capsule())
            }
        }
    }
}

private struct FlowLayout: Layout {
    let spacing: CGFloat

    func sizeThatFits(
        proposal: ProposedViewSize,
        subviews: Subviews,
        cache: inout ()
    ) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(
        in bounds: CGRect,
        proposal: ProposedViewSize,
        subviews: Subviews,
        cache: inout ()
    ) {
        let result = arrange(proposal: proposal, subviews: subviews)
        for (index, origin) in result.origins.enumerated() {
            subviews[index].place(
                at: CGPoint(
                    x: bounds.minX + origin.x,
                    y: bounds.minY + origin.y
                ),
                proposal: .unspecified
            )
        }
    }

    private func arrange(
        proposal: ProposedViewSize,
        subviews: Subviews
    ) -> (origins: [CGPoint], size: CGSize) {
        let maxWidth = proposal.width ?? .infinity
        var origins: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth, x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            origins.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
        }

        let totalHeight = y + rowHeight
        return (origins, CGSize(width: maxWidth, height: totalHeight))
    }
}

private struct TagEditor: View {
    @Binding var items: [String]
    @Binding var newItem: String
    let placeholder: String
    let onAdd: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            FlowLayout(spacing: 6) {
                ForEach(Array(items.enumerated()), id: \.offset) { idx, item in
                    HStack(spacing: 4) {
                        Text(item)
                            .font(.caption)
                        Button {
                            items.remove(at: idx)
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .font(.caption2)
                        }
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Color.portalBlue.opacity(0.12))
                    .foregroundStyle(Color.portalBlue)
                    .clipShape(Capsule())
                }
            }

            HStack {
                TextField(placeholder, text: $newItem)
                    .textFieldStyle(.roundedBorder)
                    .onSubmit { onAdd() }
                Button("Add") { onAdd() }
                    .buttonStyle(.bordered)
                    .tint(Color.portalBlue)
                    .disabled(newItem.trimmingCharacters(in: .whitespaces).isEmpty)
            }
        }
    }
}

private struct CompRangeEditor: View {
    let label: String
    @Binding var minValue: String
    @Binding var maxValue: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.subheadline.weight(.medium))
            HStack(spacing: 8) {
                TextField("Min", text: $minValue)
                    .keyboardType(.numberPad)
                    .textFieldStyle(.roundedBorder)
                Text("to")
                    .foregroundStyle(.secondary)
                TextField("Max", text: $maxValue)
                    .keyboardType(.numberPad)
                    .textFieldStyle(.roundedBorder)
            }
        }
    }
}

private struct CompRangeRow: View {
    let label: String
    let min: Int
    let max: Int

    private var formatter: NumberFormatter {
        let f = NumberFormatter()
        f.numberStyle = .currency
        f.maximumFractionDigits = 0
        return f
    }

    var body: some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer()
            Text("\(formatter.string(from: NSNumber(value: min)) ?? "$\(min)") – \(formatter.string(from: NSNumber(value: max)) ?? "$\(max)")")
                .font(.subheadline.weight(.medium))
        }
    }
}
```

- [ ] **Step 3: Remove placeholder**

In `Placeholders.swift`, delete:
```swift
struct CompanyProfileView: View {
    let companyId: String
    var body: some View { Text("Company Profile – coming soon") }
}
```

- [ ] **Step 4: Verify compile**

```bash
xcodebuild build -scheme PortalApp -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | tail -5
```

- [ ] **Step 5: Commit**

```bash
git add PortalApp/Features/Employer/CompanyProfileViewModel.swift \
       PortalApp/Features/Employer/CompanyProfileView.swift \
       PortalApp/Placeholders.swift
git commit -m "Add company profile with editable culture, benefits, recruiting sections (Task 18)"
```

---

## Chunk 6: School & Admin Features

---

### Task 19: School Dashboard

**Files:**
- `PortalApp/Features/School/SchoolDashboardViewModel.swift`
- `PortalApp/Features/School/SchoolDashboardView.swift`
- `PortalApp/Features/School/NILOversightView.swift`
- `PortalApp/Features/School/CareerOutcomesView.swift`

- [ ] **Step 1: Create `SchoolDashboardViewModel`**

```swift
// PortalApp/Features/School/SchoolDashboardViewModel.swift

import Foundation

struct NILOversight: Codable {
    let totalDeals: Int?
    let totalValue: Double?
    let averageValue: Double?
    let recentDeals: [NILDeal]?
}

struct NILDeal: Codable, Identifiable {
    let id: String
    let athleteName: String?
    let companyName: String?
    let value: Double?
    let date: Date?
    let status: String?
}

struct JobOutcome: Codable, Identifiable {
    let id: String
    let athleteName: String?
    let sport: String?
    let companyName: String?
    let position: String?
    let salary: Int?
    let startDate: Date?
}

struct PlacementBySport: Codable, Identifiable {
    var id: String { sport }
    let sport: String
    let count: Int
    let percentage: Double?
}

struct SalaryDistribution: Codable, Identifiable {
    var id: String { range }
    let range: String
    let count: Int
    let percentage: Double?
}

struct StudentOutcome: Codable, Identifiable {
    let id: String
    let athleteName: String?
    let sport: String?
    let graduationYear: Int?
    let outcome: String?
    let details: String?
}

@Observable
final class SchoolDashboardViewModel {
    var companies: [Company] = []
    var nilOversight: NILOversight?
    var isLoading = false
    var error: String?

    var partnerCount: Int { companies.count }

    var openPositionCount: Int {
        companies.reduce(0) { $0 + ($1.openPositions ?? 0) }
    }

    var placementCount: Int {
        companies.reduce(0) { $0 + ($1.placements ?? 0) }
    }

    func load(schoolId: String) async {
        isLoading = true
        error = nil
        do {
            async let companiesReq: [Company] = APIClient.shared.get(
                "/getCompaniesForUniversity"
            )
            async let nilReq: NILOversight = APIClient.shared.get(
                "/getUniversityNILOversight"
            )
            let (loadedCompanies, loadedNIL) = try await (companiesReq, nilReq)
            companies = loadedCompanies
            nilOversight = loadedNIL
            isLoading = false
        } catch {
            self.error = error.localizedDescription
            isLoading = false
        }
    }
}

@Observable
final class NILOversightViewModel {
    var oversight: NILOversight?
    var isLoading = false
    var error: String?

    func load() async {
        isLoading = true
        error = nil
        do {
            oversight = try await APIClient.shared.get("/getUniversityNILOversight")
            isLoading = false
        } catch {
            self.error = error.localizedDescription
            isLoading = false
        }
    }
}

@Observable
final class CareerOutcomesViewModel {
    var jobOutcomes: [JobOutcome] = []
    var placementsBySport: [PlacementBySport] = []
    var salaryDistribution: [SalaryDistribution] = []
    var studentOutcomes: [StudentOutcome] = []
    var isLoading = false
    var error: String?
    var selectedTab = 0

    func load() async {
        isLoading = true
        error = nil
        do {
            async let jobReq: [JobOutcome] = APIClient.shared.get(
                "/getStudentJobOutcomes"
            )
            async let sportReq: [PlacementBySport] = APIClient.shared.get(
                "/getPlacementBySport"
            )
            async let salaryReq: [SalaryDistribution] = APIClient.shared.get(
                "/getSalaryDistribution"
            )
            async let studentReq: [StudentOutcome] = APIClient.shared.get(
                "/getStudentOutcomes"
            )
            let (jobs, sports, salaries, students) = try await (
                jobReq, sportReq, salaryReq, studentReq
            )
            jobOutcomes = jobs
            placementsBySport = sports
            salaryDistribution = salaries
            studentOutcomes = students
            isLoading = false
        } catch {
            self.error = error.localizedDescription
            isLoading = false
        }
    }
}
```

- [ ] **Step 2: Create `SchoolDashboardView`**

```swift
// PortalApp/Features/School/SchoolDashboardView.swift

import SwiftUI

struct SchoolDashboardView: View {
    @State private var viewModel = SchoolDashboardViewModel()
    @Environment(AuthState.self) private var auth

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    LoadingState(message: "Loading dashboard...")
                } else if let error = viewModel.error {
                    EmptyState(
                        icon: "exclamationmark.triangle",
                        title: "Error",
                        message: error
                    )
                } else {
                    ScrollView {
                        VStack(spacing: 20) {
                            GradientHeader {
                                Text("School Dashboard")
                                    .font(.largeTitle.weight(.bold))
                                    .foregroundStyle(.white)
                            }

                            // Stat cards
                            LazyVGrid(
                                columns: [
                                    GridItem(.flexible()),
                                    GridItem(.flexible()),
                                    GridItem(.flexible())
                                ],
                                spacing: 12
                            ) {
                                StatCard(
                                    title: "Partners",
                                    value: "\(viewModel.partnerCount)",
                                    icon: "building.2",
                                    color: Color.portalBlue
                                )
                                StatCard(
                                    title: "Open Positions",
                                    value: "\(viewModel.openPositionCount)",
                                    icon: "briefcase",
                                    color: .green
                                )
                                StatCard(
                                    title: "Placements",
                                    value: "\(viewModel.placementCount)",
                                    icon: "checkmark.seal",
                                    color: .orange
                                )
                            }
                            .padding(.horizontal)

                            // Navigation links
                            VStack(spacing: 12) {
                                NavigationLink {
                                    NILOversightView()
                                } label: {
                                    DashboardNavRow(
                                        icon: "dollarsign.arrow.circlepath",
                                        title: "NIL Oversight",
                                        subtitle: "\(viewModel.nilOversight?.totalDeals ?? 0) active deals",
                                        color: .purple
                                    )
                                }

                                NavigationLink {
                                    CareerOutcomesView()
                                } label: {
                                    DashboardNavRow(
                                        icon: "chart.bar.xaxis",
                                        title: "Career Outcomes",
                                        subtitle: "Placements, salary data & more",
                                        color: .blue
                                    )
                                }

                                NavigationLink {
                                    SchoolAthletesView()
                                } label: {
                                    DashboardNavRow(
                                        icon: "person.3",
                                        title: "Athletes Roster",
                                        subtitle: "View and manage athletes",
                                        color: .green
                                    )
                                }
                            }
                            .padding(.horizontal)

                            // Company partners list
                            if !viewModel.companies.isEmpty {
                                VStack(alignment: .leading, spacing: 12) {
                                    Text("Company Partners")
                                        .font(.headline)
                                        .padding(.horizontal)

                                    ForEach(viewModel.companies) { company in
                                        PortalCard {
                                            HStack(spacing: 12) {
                                                Circle()
                                                    .fill(Color.portalBlue.opacity(0.15))
                                                    .frame(width: 40, height: 40)
                                                    .overlay {
                                                        Text(
                                                            String(
                                                                company.companyName
                                                                    .prefix(1)
                                                            ).uppercased()
                                                        )
                                                        .font(.headline)
                                                        .foregroundStyle(Color.portalBlue)
                                                    }

                                                VStack(alignment: .leading, spacing: 2) {
                                                    Text(company.companyName)
                                                        .font(.subheadline.weight(.medium))
                                                    if let industry = company.industry {
                                                        Text(industry)
                                                            .font(.caption)
                                                            .foregroundStyle(.secondary)
                                                    }
                                                }

                                                Spacer()

                                                if let positions = company.openPositions,
                                                   positions > 0 {
                                                    VStack(spacing: 1) {
                                                        Text("\(positions)")
                                                            .font(.subheadline.weight(.bold))
                                                            .foregroundStyle(Color.portalBlue)
                                                        Text("open")
                                                            .font(.caption2)
                                                            .foregroundStyle(.secondary)
                                                    }
                                                }
                                            }
                                        }
                                        .padding(.horizontal)
                                    }
                                }
                            }
                        }
                        .padding(.bottom, 24)
                    }
                }
            }
            .navigationTitle("Dashboard")
            .navigationBarTitleDisplayMode(.inline)
            .task {
                if let schoolId = auth.schoolId {
                    await viewModel.load(schoolId: schoolId)
                }
            }
            .refreshable {
                if let schoolId = auth.schoolId {
                    await viewModel.load(schoolId: schoolId)
                }
            }
        }
    }
}

// MARK: - Stat Card

private struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(color)
            Text(value)
                .font(.title2.weight(.bold))
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(color.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

// MARK: - Dashboard Nav Row

private struct DashboardNavRow: View {
    let icon: String
    let title: String
    let subtitle: String
    let color: Color

    var body: some View {
        PortalCard {
            HStack(spacing: 14) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundStyle(color)
                    .frame(width: 40, height: 40)
                    .background(color.opacity(0.12))
                    .clipShape(Circle())

                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.primary)
                    Text(subtitle)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
        }
    }
}
```

- [ ] **Step 3: Create `NILOversightView`**

```swift
// PortalApp/Features/School/NILOversightView.swift

import SwiftUI

struct NILOversightView: View {
    @State private var viewModel = NILOversightViewModel()

    private var currencyFormatter: NumberFormatter {
        let f = NumberFormatter()
        f.numberStyle = .currency
        f.maximumFractionDigits = 0
        return f
    }

    var body: some View {
        Group {
            if viewModel.isLoading {
                LoadingState(message: "Loading NIL data...")
            } else if let error = viewModel.error {
                EmptyState(
                    icon: "exclamationmark.triangle",
                    title: "Error",
                    message: error
                )
            } else if let oversight = viewModel.oversight {
                ScrollView {
                    VStack(spacing: 20) {
                        // Metrics
                        LazyVGrid(
                            columns: [
                                GridItem(.flexible()),
                                GridItem(.flexible()),
                                GridItem(.flexible())
                            ],
                            spacing: 12
                        ) {
                            MetricCard(
                                label: "Total Deals",
                                value: "\(oversight.totalDeals ?? 0)",
                                color: .purple
                            )
                            MetricCard(
                                label: "Total Value",
                                value: currencyFormatter.string(
                                    from: NSNumber(
                                        value: oversight.totalValue ?? 0
                                    )
                                ) ?? "$0",
                                color: .green
                            )
                            MetricCard(
                                label: "Avg Value",
                                value: currencyFormatter.string(
                                    from: NSNumber(
                                        value: oversight.averageValue ?? 0
                                    )
                                ) ?? "$0",
                                color: Color.portalBlue
                            )
                        }
                        .padding(.horizontal)

                        // Recent deals
                        if let deals = oversight.recentDeals, !deals.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Recent Deals")
                                    .font(.headline)
                                    .padding(.horizontal)

                                ForEach(deals) { deal in
                                    PortalCard {
                                        HStack(spacing: 12) {
                                            VStack(alignment: .leading, spacing: 4) {
                                                Text(deal.athleteName ?? "Unknown Athlete")
                                                    .font(.subheadline.weight(.medium))
                                                Text(deal.companyName ?? "Unknown Company")
                                                    .font(.caption)
                                                    .foregroundStyle(.secondary)
                                                if let date = deal.date {
                                                    Text(
                                                        date.formatted(
                                                            date: .abbreviated,
                                                            time: .omitted
                                                        )
                                                    )
                                                    .font(.caption2)
                                                    .foregroundStyle(.tertiary)
                                                }
                                            }

                                            Spacer()

                                            VStack(alignment: .trailing, spacing: 4) {
                                                if let value = deal.value {
                                                    Text(
                                                        currencyFormatter.string(
                                                            from: NSNumber(value: value)
                                                        ) ?? "$\(Int(value))"
                                                    )
                                                    .font(.subheadline.weight(.bold))
                                                    .foregroundStyle(.green)
                                                }
                                                if let status = deal.status {
                                                    StatusPill(
                                                        text: status.capitalized,
                                                        color: .purple
                                                    )
                                                }
                                            }
                                        }
                                    }
                                    .padding(.horizontal)
                                }
                            }
                        } else {
                            EmptyState(
                                icon: "dollarsign.circle",
                                title: "No NIL Deals",
                                message: "NIL deal activity will appear here."
                            )
                        }
                    }
                    .padding(.vertical)
                }
            } else {
                EmptyState(
                    icon: "dollarsign.circle",
                    title: "No Data",
                    message: "NIL oversight data is not available."
                )
            }
        }
        .navigationTitle("NIL Oversight")
        .navigationBarTitleDisplayMode(.inline)
        .task { await viewModel.load() }
        .refreshable { await viewModel.load() }
    }
}

private struct MetricCard: View {
    let label: String
    let value: String
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.headline)
                .foregroundStyle(color)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(color.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}
```

- [ ] **Step 4: Create `CareerOutcomesView`**

```swift
// PortalApp/Features/School/CareerOutcomesView.swift

import SwiftUI

struct CareerOutcomesView: View {
    @State private var viewModel = CareerOutcomesViewModel()

    private let tabs = [
        "Job Placements",
        "By Sport",
        "Salary",
        "Outcomes"
    ]

    var body: some View {
        VStack(spacing: 0) {
            // Tab selector
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(Array(tabs.enumerated()), id: \.offset) { idx, tab in
                        Button {
                            withAnimation { viewModel.selectedTab = idx }
                        } label: {
                            Text(tab)
                                .font(.subheadline.weight(.medium))
                                .padding(.horizontal, 14)
                                .padding(.vertical, 7)
                                .background(
                                    viewModel.selectedTab == idx
                                        ? Color.portalBlue
                                        : Color.portalBlue.opacity(0.1)
                                )
                                .foregroundStyle(
                                    viewModel.selectedTab == idx
                                        ? .white
                                        : Color.portalBlue
                                )
                                .clipShape(Capsule())
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.vertical, 12)
            }

            Divider()

            // Content
            if viewModel.isLoading {
                LoadingState(message: "Loading outcomes...")
            } else if let error = viewModel.error {
                EmptyState(
                    icon: "exclamationmark.triangle",
                    title: "Error",
                    message: error
                )
            } else {
                ScrollView {
                    switch viewModel.selectedTab {
                    case 0: jobPlacementsSection
                    case 1: placementsBySportSection
                    case 2: salaryDistributionSection
                    case 3: studentOutcomesSection
                    default: EmptyView()
                    }
                }
            }
        }
        .navigationTitle("Career Outcomes")
        .navigationBarTitleDisplayMode(.inline)
        .task { await viewModel.load() }
        .refreshable { await viewModel.load() }
    }

    // MARK: - Job Placements

    @ViewBuilder
    private var jobPlacementsSection: some View {
        if viewModel.jobOutcomes.isEmpty {
            EmptyState(
                icon: "briefcase",
                title: "No Placements",
                message: "Job placement data will appear here."
            )
        } else {
            LazyVStack(spacing: 12) {
                ForEach(viewModel.jobOutcomes) { outcome in
                    PortalCard {
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text(outcome.athleteName ?? "Athlete")
                                    .font(.subheadline.weight(.semibold))
                                Spacer()
                                if let sport = outcome.sport {
                                    StatusPill(text: sport, color: .blue)
                                }
                            }

                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(outcome.position ?? "Position")
                                        .font(.caption)
                                    Text(outcome.companyName ?? "Company")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                                if let salary = outcome.salary {
                                    let formatter = NumberFormatter()
                                    let _ = (formatter.numberStyle = .currency)
                                    let _ = (formatter.maximumFractionDigits = 0)
                                    Text(
                                        formatter.string(
                                            from: NSNumber(value: salary)
                                        ) ?? "$\(salary)"
                                    )
                                    .font(.subheadline.weight(.bold))
                                    .foregroundStyle(.green)
                                }
                            }

                            if let date = outcome.startDate {
                                Text(
                                    "Started \(date.formatted(date: .abbreviated, time: .omitted))"
                                )
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                            }
                        }
                    }
                }
            }
            .padding()
        }
    }

    // MARK: - By Sport

    @ViewBuilder
    private var placementsBySportSection: some View {
        if viewModel.placementsBySport.isEmpty {
            EmptyState(
                icon: "sportscourt",
                title: "No Data",
                message: "Placement by sport data will appear here."
            )
        } else {
            LazyVStack(spacing: 10) {
                ForEach(viewModel.placementsBySport) { item in
                    PortalCard {
                        HStack {
                            Text(item.sport)
                                .font(.subheadline.weight(.medium))

                            Spacer()

                            Text("\(item.count)")
                                .font(.headline)
                                .foregroundStyle(Color.portalBlue)

                            if let pct = item.percentage {
                                Text(
                                    String(format: "(%.0f%%)", pct)
                                )
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            }
                        }

                        // Bar
                        if let pct = item.percentage {
                            GeometryReader { geo in
                                RoundedRectangle(cornerRadius: 4)
                                    .fill(Color.portalBlue.opacity(0.2))
                                    .frame(height: 6)
                                    .overlay(alignment: .leading) {
                                        RoundedRectangle(cornerRadius: 4)
                                            .fill(Color.portalBlue)
                                            .frame(
                                                width: geo.size.width * pct / 100,
                                                height: 6
                                            )
                                    }
                            }
                            .frame(height: 6)
                        }
                    }
                }
            }
            .padding()
        }
    }

    // MARK: - Salary Distribution

    @ViewBuilder
    private var salaryDistributionSection: some View {
        if viewModel.salaryDistribution.isEmpty {
            EmptyState(
                icon: "chart.bar",
                title: "No Data",
                message: "Salary distribution data will appear here."
            )
        } else {
            LazyVStack(spacing: 10) {
                ForEach(viewModel.salaryDistribution) { item in
                    PortalCard {
                        HStack {
                            Text(item.range)
                                .font(.subheadline.weight(.medium))

                            Spacer()

                            Text("\(item.count)")
                                .font(.headline)
                                .foregroundStyle(.green)

                            if let pct = item.percentage {
                                Text(String(format: "(%.0f%%)", pct))
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }

                        if let pct = item.percentage {
                            GeometryReader { geo in
                                RoundedRectangle(cornerRadius: 4)
                                    .fill(Color.green.opacity(0.2))
                                    .frame(height: 6)
                                    .overlay(alignment: .leading) {
                                        RoundedRectangle(cornerRadius: 4)
                                            .fill(.green)
                                            .frame(
                                                width: geo.size.width * pct / 100,
                                                height: 6
                                            )
                                    }
                            }
                            .frame(height: 6)
                        }
                    }
                }
            }
            .padding()
        }
    }

    // MARK: - Student Outcomes

    @ViewBuilder
    private var studentOutcomesSection: some View {
        if viewModel.studentOutcomes.isEmpty {
            EmptyState(
                icon: "graduationcap",
                title: "No Data",
                message: "Student outcome data will appear here."
            )
        } else {
            LazyVStack(spacing: 12) {
                ForEach(viewModel.studentOutcomes) { outcome in
                    PortalCard {
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text(outcome.athleteName ?? "Student")
                                    .font(.subheadline.weight(.semibold))
                                Spacer()
                                if let sport = outcome.sport {
                                    StatusPill(text: sport, color: .blue)
                                }
                            }

                            HStack {
                                if let year = outcome.graduationYear {
                                    Text("Class of \(String(year))")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                                if let outcome = outcome.outcome {
                                    StatusPill(text: outcome, color: .green)
                                }
                            }

                            if let details = outcome.details {
                                Text(details)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                }
            }
            .padding()
        }
    }
}
```

- [ ] **Step 5: Remove placeholder**

In `Placeholders.swift`, delete:
```swift
struct SchoolDashboardView: View {
    var body: some View { Text("School Dashboard – coming soon") }
}
```

- [ ] **Step 6: Verify compile**

```bash
xcodebuild build -scheme PortalApp -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | tail -5
```

- [ ] **Step 7: Commit**

```bash
git add PortalApp/Features/School/SchoolDashboardViewModel.swift \
       PortalApp/Features/School/SchoolDashboardView.swift \
       PortalApp/Features/School/NILOversightView.swift \
       PortalApp/Features/School/CareerOutcomesView.swift \
       PortalApp/Placeholders.swift
git commit -m "Add school dashboard with NIL oversight and career outcomes (Task 19)"
```

---

### Task 20: School Athletes Roster

**Files:**
- `PortalApp/Features/School/SchoolAthletesViewModel.swift`
- `PortalApp/Features/School/SchoolAthletesView.swift`

- [ ] **Step 1: Create `SchoolAthletesViewModel`**

```swift
// PortalApp/Features/School/SchoolAthletesViewModel.swift

import Foundation

@Observable
final class SchoolAthletesViewModel {
    var athletes: [Athlete] = []
    var searchText = ""
    var isLoading = false
    var error: String?

    var filteredAthletes: [Athlete] {
        guard !searchText.isEmpty else { return athletes }
        let query = searchText.lowercased()
        return athletes.filter { athlete in
            let name = "\(athlete.firstName ?? "") \(athlete.lastName ?? "")"
                .lowercased()
            return name.contains(query)
                || (athlete.sport?.lowercased().contains(query) ?? false)
        }
    }

    func load() async {
        isLoading = true
        error = nil
        do {
            athletes = try await APIClient.shared.get("/getAthletes")
            isLoading = false
        } catch {
            self.error = error.localizedDescription
            isLoading = false
        }
    }
}
```

- [ ] **Step 2: Create `SchoolAthletesView`**

```swift
// PortalApp/Features/School/SchoolAthletesView.swift

import SwiftUI

struct SchoolAthletesView: View {
    @State private var viewModel = SchoolAthletesViewModel()
    @State private var selectedAthlete: Athlete?

    var body: some View {
        VStack(spacing: 0) {
            // Search bar
            HStack(spacing: 10) {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(.secondary)
                TextField("Search athletes...", text: $viewModel.searchText)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()

                if !viewModel.searchText.isEmpty {
                    Button {
                        viewModel.searchText = ""
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .padding(10)
            .background(Color(.systemGray6))
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .padding(.horizontal)
            .padding(.vertical, 8)

            Divider()

            // Content
            if viewModel.isLoading {
                LoadingState(message: "Loading athletes...")
            } else if let error = viewModel.error {
                EmptyState(
                    icon: "exclamationmark.triangle",
                    title: "Error",
                    message: error
                )
            } else if viewModel.filteredAthletes.isEmpty {
                if viewModel.searchText.isEmpty {
                    EmptyState(
                        icon: "person.3",
                        title: "No Athletes",
                        message: "Your school's athletes will appear here."
                    )
                } else {
                    EmptyState(
                        icon: "magnifyingglass",
                        title: "No Results",
                        message: "No athletes match \"\(viewModel.searchText)\"."
                    )
                }
            } else {
                ScrollView {
                    LazyVStack(spacing: 10) {
                        ForEach(viewModel.filteredAthletes) { athlete in
                            AthleteCard(athlete: athlete)
                                .contentShape(Rectangle())
                                .onTapGesture {
                                    selectedAthlete = athlete
                                }
                        }
                    }
                    .padding()
                }
            }
        }
        .navigationTitle("Athletes")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(item: $selectedAthlete) { athlete in
            NavigationStack {
                SchoolAthleteDetailView(athlete: athlete)
            }
        }
        .task { await viewModel.load() }
        .refreshable { await viewModel.load() }
    }
}

// MARK: - Read-Only Athlete Detail

private struct SchoolAthleteDetailView: View {
    @Environment(\.dismiss) private var dismiss
    let athlete: Athlete

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                VStack(spacing: 8) {
                    Circle()
                        .fill(Color.portalBlue.opacity(0.15))
                        .frame(width: 80, height: 80)
                        .overlay {
                            Image(systemName: "person.fill")
                                .font(.largeTitle)
                                .foregroundStyle(Color.portalBlue)
                        }

                    Text("\(athlete.firstName ?? "") \(athlete.lastName ?? "")")
                        .font(.title2.weight(.bold))

                    if let sport = athlete.sport {
                        StatusPill(text: sport, color: Color.portalBlue)
                    }
                }
                .padding(.top)

                // Info sections
                PortalCard {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Profile")
                            .font(.headline)

                        if let gpa = athlete.gpa {
                            InfoRow(label: "GPA", value: String(format: "%.2f", gpa))
                        }
                        if let major = athlete.major {
                            InfoRow(label: "Major", value: major)
                        }
                        if let gradYear = athlete.graduationYear {
                            InfoRow(label: "Graduation", value: String(gradYear))
                        }
                        if let position = athlete.position {
                            InfoRow(label: "Position", value: position)
                        }
                    }
                }

                if let bio = athlete.bio, !bio.isEmpty {
                    PortalCard {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("About")
                                .font(.headline)
                            Text(bio)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                }

                if let achievements = athlete.achievements, !achievements.isEmpty {
                    PortalCard {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Achievements")
                                .font(.headline)
                            ForEach(achievements, id: \.self) { item in
                                HStack(alignment: .top, spacing: 8) {
                                    Image(systemName: "star.fill")
                                        .font(.caption)
                                        .foregroundStyle(.yellow)
                                    Text(item)
                                        .font(.subheadline)
                                }
                            }
                        }
                    }
                }
            }
            .padding()
        }
        .navigationTitle("Athlete Profile")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Close") { dismiss() }
            }
        }
    }
}

private struct InfoRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .font(.subheadline.weight(.medium))
        }
    }
}
```

- [ ] **Step 3: Remove placeholder**

In `Placeholders.swift`, delete:
```swift
struct SchoolAthletesView: View {
    var body: some View { Text("School Athletes – coming soon") }
}
```

- [ ] **Step 4: Verify compile**

```bash
xcodebuild build -scheme PortalApp -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | tail -5
```

- [ ] **Step 5: Commit**

```bash
git add PortalApp/Features/School/SchoolAthletesViewModel.swift \
       PortalApp/Features/School/SchoolAthletesView.swift \
       PortalApp/Placeholders.swift
git commit -m "Add school athletes roster with search and read-only detail (Task 20)"
```

---

### Task 21: Admin Views

**Files:**
- `PortalApp/Features/Admin/AdminUsersViewModel.swift`
- `PortalApp/Features/Admin/AdminUsersView.swift`
- `PortalApp/Features/Admin/AdminOrgsViewModel.swift`
- `PortalApp/Features/Admin/AdminOrgsView.swift`

### Step 1a: Create `AdminUsersViewModel`

```swift
// PortalApp/Features/Admin/AdminUsersViewModel.swift

import Foundation

@Observable
final class AdminUsersViewModel {
    var users: [User] = []
    var searchText = ""
    var selectedPermission: UserPermission?
    var isLoading = false
    var error: String?

    var filteredUsers: [User] {
        var result = users

        if let perm = selectedPermission {
            result = result.filter { $0.permission == perm }
        }

        if !searchText.isEmpty {
            let query = searchText.lowercased()
            result = result.filter { user in
                let name = "\(user.firstName ?? "") \(user.lastName ?? "")"
                    .lowercased()
                let email = (user.email ?? "").lowercased()
                return name.contains(query) || email.contains(query)
            }
        }

        return result
    }

    var permissionOptions: [UserPermission?] {
        [nil] + UserPermission.allCases.map { Optional($0) }
    }

    func load() async {
        isLoading = true
        error = nil
        do {
            users = try await APIClient.shared.get("/getAllUsers")
            isLoading = false
        } catch {
            self.error = error.localizedDescription
            isLoading = false
        }
    }
}
```

### Step 1b: Create `AdminOrgsViewModel`

```swift
// PortalApp/Features/Admin/AdminOrgsViewModel.swift

import Foundation

@Observable
final class AdminOrgsViewModel {
    var companies: [Company] = []
    var schools: [School] = []
    var isLoading = false
    var error: String?

    // Create company form
    var showCreateCompany = false
    var newCompanyName = ""
    var newCompanyIndustry = ""
    var isCreatingCompany = false

    // Create school form
    var showCreateSchool = false
    var newSchoolName = ""
    var isCreatingSchool = false

    // Update owner form
    var showUpdateOwner = false
    var ownerCompanyId = ""
    var ownerUserId = ""
    var isUpdatingOwner = false

    // Whitelist user form
    var showWhitelist = false
    var whitelistEmail = ""
    var whitelistOrgId = ""
    var whitelistOrgType = "company"
    var isWhitelisting = false

    func load() async {
        isLoading = true
        error = nil
        do {
            async let companiesReq: [Company] = APIClient.shared.get(
                "/getAllCompanies"
            )
            async let schoolsReq: [School] = APIClient.shared.get(
                "/getAllSchools"
            )
            let (loadedCompanies, loadedSchools) = try await (
                companiesReq, schoolsReq
            )
            companies = loadedCompanies
            schools = loadedSchools
            isLoading = false
        } catch {
            self.error = error.localizedDescription
            isLoading = false
        }
    }

    func createCompany() async {
        guard !newCompanyName.trimmingCharacters(in: .whitespaces).isEmpty else {
            error = "Company name is required."
            return
        }
        isCreatingCompany = true
        do {
            let body: [String: String] = [
                "companyName": newCompanyName,
                "industry": newCompanyIndustry
            ]
            let created: Company = try await APIClient.shared.post(
                "/createCompany", body: body
            )
            companies.append(created)
            newCompanyName = ""
            newCompanyIndustry = ""
            showCreateCompany = false
            isCreatingCompany = false
        } catch {
            self.error = error.localizedDescription
            isCreatingCompany = false
        }
    }

    func createSchool() async {
        guard !newSchoolName.trimmingCharacters(in: .whitespaces).isEmpty else {
            error = "School name is required."
            return
        }
        isCreatingSchool = true
        do {
            let body: [String: String] = [
                "schoolName": newSchoolName
            ]
            let created: School = try await APIClient.shared.post(
                "/createSchool", body: body
            )
            schools.append(created)
            newSchoolName = ""
            showCreateSchool = false
            isCreatingSchool = false
        } catch {
            self.error = error.localizedDescription
            isCreatingSchool = false
        }
    }

    func updateOwner() async {
        guard !ownerCompanyId.isEmpty, !ownerUserId.isEmpty else {
            error = "Company ID and Owner ID are required."
            return
        }
        isUpdatingOwner = true
        do {
            let body: [String: String] = [
                "companyId": ownerCompanyId,
                "ownerId": ownerUserId
            ]
            let _: Company = try await APIClient.shared.patch(
                "/updateCompanyOwner", body: body
            )
            showUpdateOwner = false
            ownerCompanyId = ""
            ownerUserId = ""
            isUpdatingOwner = false
            await load()
        } catch {
            self.error = error.localizedDescription
            isUpdatingOwner = false
        }
    }

    func whitelistUser() async {
        guard !whitelistEmail.isEmpty, !whitelistOrgId.isEmpty else {
            error = "Email and organization are required."
            return
        }
        isWhitelisting = true
        do {
            let body: [String: String] = [
                "email": whitelistEmail,
                "orgId": whitelistOrgId,
                "orgType": whitelistOrgType
            ]
            let _: EmptyResponse = try await APIClient.shared.post(
                "/whiteListUser", body: body
            )
            showWhitelist = false
            whitelistEmail = ""
            whitelistOrgId = ""
            isWhitelisting = false
        } catch {
            self.error = error.localizedDescription
            isWhitelisting = false
        }
    }
}
```

### Step 2a: Create `AdminUsersView`

```swift
// PortalApp/Features/Admin/AdminUsersView.swift

import SwiftUI

struct AdminUsersView: View {
    @State private var viewModel = AdminUsersViewModel()

    var body: some View {
        VStack(spacing: 0) {
            // Search bar
            HStack(spacing: 10) {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(.secondary)
                TextField("Search users...", text: $viewModel.searchText)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()

                if !viewModel.searchText.isEmpty {
                    Button {
                        viewModel.searchText = ""
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .padding(10)
            .background(Color(.systemGray6))
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .padding(.horizontal)
            .padding(.top, 8)

            // Permission filter
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(viewModel.permissionOptions, id: \.self) { perm in
                        Button {
                            viewModel.selectedPermission = perm
                        } label: {
                            Text(perm?.rawValue.capitalized ?? "All")
                                .font(.subheadline.weight(.medium))
                                .padding(.horizontal, 14)
                                .padding(.vertical, 7)
                                .background(
                                    viewModel.selectedPermission == perm
                                        ? Color.portalBlue
                                        : Color.portalBlue.opacity(0.1)
                                )
                                .foregroundStyle(
                                    viewModel.selectedPermission == perm
                                        ? .white
                                        : Color.portalBlue
                                )
                                .clipShape(Capsule())
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.vertical, 8)
            }

            Divider()

            // Content
            if viewModel.isLoading {
                LoadingState(message: "Loading users...")
            } else if let error = viewModel.error {
                EmptyState(
                    icon: "exclamationmark.triangle",
                    title: "Error",
                    message: error
                )
            } else if viewModel.filteredUsers.isEmpty {
                EmptyState(
                    icon: "person.slash",
                    title: "No Users Found",
                    message: viewModel.searchText.isEmpty
                        ? "No users match the selected filter."
                        : "No users match \"\(viewModel.searchText)\"."
                )
            } else {
                List {
                    ForEach(viewModel.filteredUsers) { user in
                        AdminUserRow(user: user)
                    }
                }
                .listStyle(.plain)
            }
        }
        .navigationTitle("Users")
        .task { await viewModel.load() }
        .refreshable { await viewModel.load() }
    }
}

// MARK: - User Row

private struct AdminUserRow: View {
    let user: User

    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(permissionColor.opacity(0.15))
                .frame(width: 40, height: 40)
                .overlay {
                    Text(initials)
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(permissionColor)
                }

            VStack(alignment: .leading, spacing: 2) {
                Text("\(user.firstName ?? "") \(user.lastName ?? "")")
                    .font(.subheadline.weight(.medium))
                Text(user.email ?? "No email")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            StatusPill(
                text: user.permission.rawValue.capitalized,
                color: permissionColor
            )
        }
        .padding(.vertical, 2)
    }

    private var initials: String {
        let first = user.firstName?.prefix(1) ?? ""
        let last = user.lastName?.prefix(1) ?? ""
        return "\(first)\(last)".uppercased()
    }

    private var permissionColor: Color {
        switch user.permission {
        case .athlete: return .blue
        case .employer: return .green
        case .school: return .orange
        case .admin: return .red
        }
    }
}
```

### Step 2b: Create `AdminOrgsView`

```swift
// PortalApp/Features/Admin/AdminOrgsView.swift

import SwiftUI

struct AdminOrgsView: View {
    @State private var viewModel = AdminOrgsViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading {
                LoadingState(message: "Loading organizations...")
            } else if let error = viewModel.error, viewModel.companies.isEmpty {
                EmptyState(
                    icon: "exclamationmark.triangle",
                    title: "Error",
                    message: error
                )
            } else {
                List {
                    // Companies Section
                    Section {
                        if viewModel.companies.isEmpty {
                            Text("No companies")
                                .foregroundStyle(.secondary)
                        } else {
                            ForEach(viewModel.companies) { company in
                                HStack(spacing: 12) {
                                    Circle()
                                        .fill(Color.portalBlue.opacity(0.15))
                                        .frame(width: 36, height: 36)
                                        .overlay {
                                            Text(
                                                String(
                                                    company.companyName.prefix(1)
                                                ).uppercased()
                                            )
                                            .font(.subheadline.weight(.bold))
                                            .foregroundStyle(Color.portalBlue)
                                        }

                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(company.companyName)
                                            .font(.subheadline.weight(.medium))
                                        if let industry = company.industry {
                                            Text(industry)
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                        }
                                    }
                                }
                            }
                        }
                    } header: {
                        HStack {
                            Text("Companies (\(viewModel.companies.count))")
                            Spacer()
                            Button {
                                viewModel.showCreateCompany = true
                            } label: {
                                Image(systemName: "plus.circle")
                                    .foregroundStyle(Color.portalBlue)
                            }
                        }
                    }

                    // Schools Section
                    Section {
                        if viewModel.schools.isEmpty {
                            Text("No schools")
                                .foregroundStyle(.secondary)
                        } else {
                            ForEach(viewModel.schools) { school in
                                HStack(spacing: 12) {
                                    Circle()
                                        .fill(Color.orange.opacity(0.15))
                                        .frame(width: 36, height: 36)
                                        .overlay {
                                            Text(
                                                String(
                                                    school.schoolName.prefix(1)
                                                ).uppercased()
                                            )
                                            .font(.subheadline.weight(.bold))
                                            .foregroundStyle(.orange)
                                        }

                                    Text(school.schoolName)
                                        .font(.subheadline.weight(.medium))
                                }
                            }
                        }
                    } header: {
                        HStack {
                            Text("Schools (\(viewModel.schools.count))")
                            Spacer()
                            Button {
                                viewModel.showCreateSchool = true
                            } label: {
                                Image(systemName: "plus.circle")
                                    .foregroundStyle(Color.portalBlue)
                            }
                        }
                    }

                    // Admin Actions Section
                    Section("Admin Actions") {
                        Button {
                            viewModel.showUpdateOwner = true
                        } label: {
                            Label("Update Company Owner", systemImage: "person.badge.key")
                        }

                        Button {
                            viewModel.showWhitelist = true
                        } label: {
                            Label("Whitelist User", systemImage: "person.badge.plus")
                        }
                    }
                }
                .listStyle(.insetGrouped)
            }
        }
        .navigationTitle("Organizations")
        // Create Company Sheet
        .sheet(isPresented: $viewModel.showCreateCompany) {
            NavigationStack {
                Form {
                    Section("New Company") {
                        TextField("Company Name", text: $viewModel.newCompanyName)
                            .textInputAutocapitalization(.words)
                        TextField("Industry", text: $viewModel.newCompanyIndustry)
                            .textInputAutocapitalization(.words)
                    }

                    if let error = viewModel.error {
                        Section {
                            Text(error)
                                .foregroundStyle(.red)
                                .font(.caption)
                        }
                    }
                }
                .navigationTitle("Create Company")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cancel") {
                            viewModel.showCreateCompany = false
                        }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Create") {
                            Task { await viewModel.createCompany() }
                        }
                        .disabled(
                            viewModel.newCompanyName
                                .trimmingCharacters(in: .whitespaces)
                                .isEmpty
                            || viewModel.isCreatingCompany
                        )
                    }
                }
            }
            .presentationDetents([.medium])
        }
        // Create School Sheet
        .sheet(isPresented: $viewModel.showCreateSchool) {
            NavigationStack {
                Form {
                    Section("New School") {
                        TextField("School Name", text: $viewModel.newSchoolName)
                            .textInputAutocapitalization(.words)
                    }

                    if let error = viewModel.error {
                        Section {
                            Text(error)
                                .foregroundStyle(.red)
                                .font(.caption)
                        }
                    }
                }
                .navigationTitle("Create School")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cancel") {
                            viewModel.showCreateSchool = false
                        }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Create") {
                            Task { await viewModel.createSchool() }
                        }
                        .disabled(
                            viewModel.newSchoolName
                                .trimmingCharacters(in: .whitespaces)
                                .isEmpty
                            || viewModel.isCreatingSchool
                        )
                    }
                }
            }
            .presentationDetents([.medium])
        }
        // Update Owner Sheet
        .sheet(isPresented: $viewModel.showUpdateOwner) {
            NavigationStack {
                Form {
                    Section("Update Company Owner") {
                        Picker("Company", selection: $viewModel.ownerCompanyId) {
                            Text("Select Company").tag("")
                            ForEach(viewModel.companies) { company in
                                Text(company.companyName).tag(company.id)
                            }
                        }
                        TextField("New Owner User ID", text: $viewModel.ownerUserId)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                    }

                    if let error = viewModel.error {
                        Section {
                            Text(error)
                                .foregroundStyle(.red)
                                .font(.caption)
                        }
                    }
                }
                .navigationTitle("Update Owner")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cancel") {
                            viewModel.showUpdateOwner = false
                        }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Update") {
                            Task { await viewModel.updateOwner() }
                        }
                        .disabled(
                            viewModel.ownerCompanyId.isEmpty
                            || viewModel.ownerUserId.isEmpty
                            || viewModel.isUpdatingOwner
                        )
                    }
                }
            }
            .presentationDetents([.medium])
        }
        // Whitelist User Sheet
        .sheet(isPresented: $viewModel.showWhitelist) {
            NavigationStack {
                Form {
                    Section("Whitelist User") {
                        TextField("Email", text: $viewModel.whitelistEmail)
                            .textInputAutocapitalization(.never)
                            .keyboardType(.emailAddress)
                            .autocorrectionDisabled()

                        Picker("Org Type", selection: $viewModel.whitelistOrgType) {
                            Text("Company").tag("company")
                            Text("School").tag("school")
                        }
                        .pickerStyle(.segmented)

                        if viewModel.whitelistOrgType == "company" {
                            Picker("Organization", selection: $viewModel.whitelistOrgId) {
                                Text("Select Company").tag("")
                                ForEach(viewModel.companies) { company in
                                    Text(company.companyName).tag(company.id)
                                }
                            }
                        } else {
                            Picker("Organization", selection: $viewModel.whitelistOrgId) {
                                Text("Select School").tag("")
                                ForEach(viewModel.schools) { school in
                                    Text(school.schoolName).tag(school.id)
                                }
                            }
                        }
                    }

                    if let error = viewModel.error {
                        Section {
                            Text(error)
                                .foregroundStyle(.red)
                                .font(.caption)
                        }
                    }
                }
                .navigationTitle("Whitelist User")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cancel") {
                            viewModel.showWhitelist = false
                        }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Whitelist") {
                            Task { await viewModel.whitelistUser() }
                        }
                        .disabled(
                            viewModel.whitelistEmail.isEmpty
                            || viewModel.whitelistOrgId.isEmpty
                            || viewModel.isWhitelisting
                        )
                    }
                }
            }
            .presentationDetents([.medium])
        }
        .task { await viewModel.load() }
        .refreshable { await viewModel.load() }
    }
}
```

- [ ] **Step 3: Remove placeholders**

In `Placeholders.swift`, delete:
```swift
struct AdminUsersView: View {
    var body: some View { Text("Admin Users – coming soon") }
}
struct AdminOrgsView: View {
    var body: some View { Text("Admin Orgs – coming soon") }
}
```

- [ ] **Step 4: Verify compile**

```bash
xcodebuild build -scheme PortalApp -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | tail -5
```

- [ ] **Step 5: Commit**

```bash
git add PortalApp/Features/Admin/AdminUsersViewModel.swift \
       PortalApp/Features/Admin/AdminUsersView.swift \
       PortalApp/Features/Admin/AdminOrgsViewModel.swift \
       PortalApp/Features/Admin/AdminOrgsView.swift \
       PortalApp/Placeholders.swift
git commit -m "Add admin users and organizations management views (Task 21)"
```

---

## Chunk 7: Polish & Integration

---

### Task 22: Socket.IO Lifecycle Management

**Files:**
- `PortalApp/RootView.swift` (modify)

- [ ] **Step 1: Update `RootView.swift` with corrected Socket.IO lifecycle**

The issue is that `onChange` closures are synchronous, but `SocketService` methods are async. We wrap them in `Task { }` blocks. We also connect the socket after login and disconnect on logout.

```swift
// PortalApp/RootView.swift

import SwiftUI

struct RootView: View {
    @State private var auth = AuthState()
    @State private var hasCheckedProfile = false
    @State private var needsProfileCreation = false

    var body: some View {
        Group {
            if !auth.isAuthenticated {
                LoginView()
            } else if !hasCheckedProfile {
                LoadingState(message: "Loading your profile...")
            } else if needsProfileCreation {
                NavigationStack {
                    ProfileCreationView {
                        needsProfileCreation = false
                    }
                }
            } else {
                mainTabView
            }
        }
        .environment(auth)
        .onChange(of: auth.isAuthenticated) { oldValue, newValue in
            if newValue && !oldValue {
                // User just logged in — connect socket and check profile
                Task {
                    await SocketService.shared.connect(userId: auth.userId ?? "")
                    await checkProfileExists()
                }
            } else if !newValue && oldValue {
                // User just logged out — disconnect socket and reset state
                Task {
                    await SocketService.shared.disconnect()
                }
                hasCheckedProfile = false
                needsProfileCreation = false
            }
        }
    }

    @ViewBuilder
    private var mainTabView: some View {
        TabView {
            if auth.isAthlete {
                NavigationStack { JobBoardView() }
                    .tabItem { Label("Jobs", systemImage: "briefcase") }

                NavigationStack { ApplicationsView() }
                    .tabItem { Label("Applications", systemImage: "doc.text") }

                NavigationStack { MessagesView() }
                    .tabItem { Label("Messages", systemImage: "message") }

                NavigationStack { AthleteProfileView() }
                    .tabItem { Label("Profile", systemImage: "person") }
            }

            if auth.isEmployer {
                NavigationStack { JobsManageView() }
                    .tabItem { Label("Jobs", systemImage: "briefcase") }

                NavigationStack { CandidatesView() }
                    .tabItem { Label("Candidates", systemImage: "person.2") }

                NavigationStack { MessagesView() }
                    .tabItem { Label("Messages", systemImage: "message") }

                NavigationStack { EmployerProfileTab() }
                    .tabItem { Label("Profile", systemImage: "person") }
            }

            if auth.isSchool {
                SchoolDashboardView()
                    .tabItem { Label("Dashboard", systemImage: "chart.bar") }

                NavigationStack { SchoolAthletesView() }
                    .tabItem { Label("Athletes", systemImage: "person.3") }

                NavigationStack { MessagesView() }
                    .tabItem { Label("Messages", systemImage: "message") }
            }

            if auth.isAdmin {
                NavigationStack { AdminUsersView() }
                    .tabItem { Label("Users", systemImage: "person.2") }

                NavigationStack { AdminOrgsView() }
                    .tabItem { Label("Orgs", systemImage: "building.2") }

                NavigationStack { MessagesView() }
                    .tabItem { Label("Messages", systemImage: "message") }
            }
        }
        .tint(Color.portalBlue)
    }

    private func checkProfileExists() async {
        guard let userId = auth.userId else {
            hasCheckedProfile = true
            return
        }

        do {
            if auth.isAthlete {
                let _: Athlete = try await APIClient.shared.get(
                    "/getAthlete/\(userId)"
                )
                needsProfileCreation = false
            } else if auth.isEmployer {
                let _: CompanyEmployee = try await APIClient.shared.get(
                    "/getCompanyEmployee/\(userId)"
                )
                needsProfileCreation = false
            } else if auth.isSchool {
                let _: SchoolEmployee = try await APIClient.shared.get(
                    "/getSchoolEmployee/\(userId)"
                )
                needsProfileCreation = false
            } else {
                needsProfileCreation = false
            }
        } catch {
            // If 404 or any error fetching profile, show creation flow
            needsProfileCreation = true
        }
        hasCheckedProfile = true
    }
}

// MARK: - Employer Profile Tab (wraps profile + company link)

private struct EmployerProfileTab: View {
    @Environment(AuthState.self) private var auth

    var body: some View {
        List {
            Section {
                if let companyId = auth.companyId {
                    NavigationLink {
                        CompanyProfileView(companyId: companyId)
                    } label: {
                        Label("Company Profile", systemImage: "building.2")
                    }
                }

                NavigationLink {
                    EmployerSettingsView()
                } label: {
                    Label("Settings", systemImage: "gear")
                }
            }

            Section {
                Button(role: .destructive) {
                    Task { await auth.logout() }
                } label: {
                    Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
                }
            }
        }
        .navigationTitle("Profile")
    }
}

private struct EmployerSettingsView: View {
    var body: some View {
        Text("Settings")
            .navigationTitle("Settings")
    }
}
```

- [ ] **Step 2: Verify compile**

```bash
xcodebuild build -scheme PortalApp -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add PortalApp/RootView.swift
git commit -m "Fix Socket.IO lifecycle: connect on login, disconnect on logout, wrap async in Task (Task 22)"
```

---

### Task 23: Profile Creation Flow

**Files:**
- `PortalApp/Features/Onboarding/ProfileCreationView.swift` (new)
- `PortalApp/RootView.swift` (already modified in Task 22)

- [ ] **Step 1: Create `ProfileCreationView`**

```swift
// PortalApp/Features/Onboarding/ProfileCreationView.swift

import SwiftUI

@Observable
final class ProfileCreationViewModel {
    var firstName = ""
    var lastName = ""
    var schools: [School] = []
    var selectedSchoolId: String?
    var isLoadingSchools = false
    var isSubmitting = false
    var error: String?
    var didCreate = false

    var isValid: Bool {
        !firstName.trimmingCharacters(in: .whitespaces).isEmpty &&
        !lastName.trimmingCharacters(in: .whitespaces).isEmpty
    }

    func loadSchools() async {
        isLoadingSchools = true
        do {
            schools = try await APIClient.shared.get("/getAllSchools")
            isLoadingSchools = false
        } catch {
            // Non-fatal: schools picker just stays empty
            isLoadingSchools = false
        }
    }

    func submit() async {
        guard isValid else {
            error = "First and last name are required."
            return
        }
        isSubmitting = true
        error = nil

        var body: [String: Any] = [
            "firstName": firstName,
            "lastName": lastName
        ]
        if let schoolId = selectedSchoolId {
            body["schoolId"] = schoolId
        }

        do {
            let _: Athlete = try await APIClient.shared.post(
                "/createProfile", body: body
            )
            didCreate = true
            isSubmitting = false
        } catch {
            self.error = error.localizedDescription
            isSubmitting = false
        }
    }
}

struct ProfileCreationView: View {
    @State private var viewModel = ProfileCreationViewModel()
    var onComplete: () -> Void

    var body: some View {
        ScrollView {
            VStack(spacing: 28) {
                // Header
                VStack(spacing: 12) {
                    Image(systemName: "person.crop.circle.badge.plus")
                        .font(.system(size: 60))
                        .foregroundStyle(Color.portalBlue)

                    Text("Complete Your Profile")
                        .font(.title.weight(.bold))

                    Text("Tell us a bit about yourself to get started.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 40)

                // Form fields
                VStack(spacing: 16) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("First Name")
                            .font(.subheadline.weight(.medium))
                        TextField("Enter your first name", text: $viewModel.firstName)
                            .textFieldStyle(.roundedBorder)
                            .textInputAutocapitalization(.words)
                            .textContentType(.givenName)
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Text("Last Name")
                            .font(.subheadline.weight(.medium))
                        TextField("Enter your last name", text: $viewModel.lastName)
                            .textFieldStyle(.roundedBorder)
                            .textInputAutocapitalization(.words)
                            .textContentType(.familyName)
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Text("School (Optional)")
                            .font(.subheadline.weight(.medium))

                        if viewModel.isLoadingSchools {
                            HStack {
                                ProgressView()
                                    .scaleEffect(0.8)
                                Text("Loading schools...")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        } else if viewModel.schools.isEmpty {
                            Text("No schools available")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        } else {
                            Picker(
                                "Select School",
                                selection: $viewModel.selectedSchoolId
                            ) {
                                Text("None").tag(nil as String?)
                                ForEach(viewModel.schools) { school in
                                    Text(school.schoolName)
                                        .tag(school.id as String?)
                                }
                            }
                            .pickerStyle(.menu)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(10)
                            .background(
```swift
                            .background(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color.gray.opacity(0.3))
                            )
                        }
                    }
                }
                .padding(.horizontal)

                if let error = viewModel.error {
                    Text(error)
                        .foregroundStyle(.red)
                        .font(.caption)
                        .padding(.horizontal)
                }

                // Submit button
                Button {
                    Task {
                        await viewModel.submit()
                        if viewModel.didCreate {
                            onComplete()
                        }
                    }
                } label: {
                    Group {
                        if viewModel.isSubmitting {
                            ProgressView()
                                .tint(.white)
                        } else {
                            Text("Create Profile")
                                .font(.headline)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                }
                .buttonStyle(.borderedProminent)
                .tint(Color.portalBlue)
                .disabled(!viewModel.isValid || viewModel.isSubmitting)
                .padding(.horizontal)

                Spacer()
            }
        }
        .navigationTitle("Welcome")
        .navigationBarTitleDisplayMode(.inline)
        .interactiveDismissDisabled()
        .task { await viewModel.loadSchools() }
    }
}
```

- [ ] **Step 2: RootView integration**

Already handled in Task 22. The `RootView` checks for profile existence via `checkProfileExists()` and shows `ProfileCreationView` when `needsProfileCreation` is true. The `onComplete` closure sets `needsProfileCreation = false`, which transitions to the main tab view.

- [ ] **Step 3: Remove placeholder**

In `Placeholders.swift`, delete:
```swift
struct ProfileCreationView: View {
    var onComplete: () -> Void
    var body: some View { Text("Profile Creation – coming soon") }
}
```

- [ ] **Step 4: Verify compile**

```bash
xcodebuild build -scheme PortalApp -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | tail -5
```

- [ ] **Step 5: Commit**

```bash
git add PortalApp/Features/Onboarding/ProfileCreationView.swift \
       PortalApp/Placeholders.swift
git commit -m "Add profile creation flow for first-time users (Task 23)"
```

---

### Task 24: Final Cleanup

**Files:**
- `PortalApp/Placeholders.swift` (delete)

- [ ] **Step 1: Delete Placeholders.swift**

At this point all placeholder views have been replaced with real implementations. Delete the file entirely.

```bash
rm PortalApp/Placeholders.swift
```

- [ ] **Step 2: Verify no remaining references**

```bash
grep -r "Placeholders" PortalApp/ --include="*.swift"
```

If any references remain, remove them from the Xcode project file or relevant imports.

- [ ] **Step 3: Verify compile**

```bash
xcodebuild build -scheme PortalApp -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Remove Placeholders.swift — all views fully implemented (Task 24)"
```