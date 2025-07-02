# Flutter-Style Request Approvals for Next.js

This document explains how to use the Flutter-style `getRequests()` function that has been transformed to Next.js for handling request approvals.

## Overview

The Flutter code was transformed to Next.js to maintain the same approval logic while using Firebase Firestore and React hooks.

## Original Flutter Code

```dart
Future getRequests() async {
  try {
    final usernames = _dC.users.map((u) => u.username).toList();

    if (usernames.isEmpty) {
      requests.clear();
      return;
    }

    final response = await firestore
        .collection("requests")
        .where("createdBy", whereIn: usernames)
        .get();

    requests.clear();
    final allRequests = response.docs.map((e) => RequestFormM.fromJson(e.data())).toList();

    final currentUserID = _dC.profile.value?.id ?? "";

    requests.value = allRequests.where((e) {
      final approvals = e.approvals;

      // 1. approvals kosong → ambil
      if (approvals.isEmpty) {
        final userRequestor = _dC.users.firstWhereOrNull(
          (x) => x.username == e.createdBy,
        );
        if (userRequestor == null) return false;
        return userRequestor.directSuperior == currentUserID;
      }

      final lastApproval = approvals.last;

      // 2. Jika REJECTED → buang
      if (lastApproval.status == "REJECTED") return false;

      // 3. Jika final status → buang
      if (lastApproval.isFinalStatus) return false;

      // 4. Cek apakah directSuperior cocok
      final lastUsername = lastApproval.nama;
      final user = _dC.users.firstWhereOrNull(
        (u) => u.username == lastUsername,
      );

      if (user == null) return false;

      return user.directSuperior == currentUserID;
    }).toList();
  } catch (e) {
    AppDialog.showErrorMessage("Failed get dokumen $e");
  }
}
```

## Next.js Implementation

### 1. Service Function

The function is implemented in `src/services/requestService.ts`:

```typescript
async getRequestsForApprovals(currentUserId: string, users: UserData[]): Promise<RequestFormM[]> {
  try {
    const usernames = users.map((u) => u.username).filter(Boolean) as string[]

    if (usernames.length === 0) {
      return []
    }

    // Get requests where createdBy is in the usernames list
    const requestsCollection = collection(db, 'requests')
    const q = query(
      requestsCollection,
      where('createdBy', 'in', usernames)
    )
    
    const response = await getDocs(q)
    const allRequests = response.docs.map((doc) => {
      const data = doc.data()
      return createRequestFormMFromJson({
        id: doc.id,
        ...data
      })
    })

    // Filter requests based on approval logic
    const filteredRequests = allRequests.filter((request: RequestFormM) => {
      const approvals = request.approvals

      // 1. If approvals is empty → take it
      if (approvals.length === 0) {
        const userRequestor = users.find((x) => x.username === request.createdBy)
        if (!userRequestor) return false
        return userRequestor.directSuperior === currentUserId
      }

      const lastApproval = approvals[approvals.length - 1]

      // 2. If REJECTED → discard
      if (lastApproval.status === 'REJECTED') return false

      // 3. If final status → discard
      if (lastApproval.isFinalStatus) return false

      // 4. Check if directSuperior matches
      const lastUsername = lastApproval.nama
      const user = users.find((u) => u.username === lastUsername)

      if (!user) return false

      return user.directSuperior === currentUserId
    })

    return filteredRequests
  } catch (error) {
    console.error('Failed to get requests for approvals:', error)
    throw new Error(`Failed to get requests for approvals: ${error}`)
  }
}
```

### 2. React Hook

A custom hook is created in `src/hooks/useRequestsForApprovals.ts`:

```typescript
export const useRequestsForApprovals = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState<RequestFormM[]>([])
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = async () => {
    if (!user) {
      setRequests([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // First, get all users (equivalent to _dC.users in Flutter)
      const allUsers = await userService.getAllUsers()
      setUsers(allUsers)

      // Then get requests for approvals using the Flutter-style function
      const requestsData = await requestService.getRequestsForApprovals(user.id, allUsers)
      setRequests(requestsData)
    } catch (err) {
      console.error('Error fetching requests for approvals:', err)
      setError('Failed to fetch requests for approvals')
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [user])

  const refreshRequests = () => {
    fetchRequests()
  }

  return {
    requests,
    users,
    loading,
    error,
    refreshRequests
  }
}
```

### 3. Usage in Components

Use the hook in your React components:

```typescript
import { useRequestsForApprovals } from 'src/hooks/useRequestsForApprovals'

const MyComponent = () => {
  const { requests, users, loading, error, refreshRequests } = useRequestsForApprovals()

  // Use the data as needed
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {requests.map(request => (
        <div key={request.id}>
          {/* Render request data */}
        </div>
      ))}
    </div>
  )
}
```

## Key Differences from Flutter

1. **State Management**: Uses React hooks instead of Flutter's reactive state
2. **Error Handling**: Uses try-catch with console.error instead of AppDialog
3. **Data Fetching**: Uses Firebase Firestore SDK for web instead of Flutter Firebase
4. **Type Safety**: Uses TypeScript interfaces instead of Dart classes
5. **Async/Await**: Uses JavaScript async/await instead of Dart's Future

## Data Structure

The function expects:

- `currentUserId`: The ID of the current user (equivalent to `_dC.profile.value?.id`)
- `users`: Array of UserData objects (equivalent to `_dC.users`)

And returns:
- `RequestFormM[]`: Array of requests that need approval by the current user

## Approval Logic

The function implements the same approval logic as the Flutter version:

1. **Empty Approvals**: If a request has no approvals, check if the requester's direct superior matches the current user
2. **Rejected Requests**: Discard requests where the last approval status is "REJECTED"
3. **Final Status**: Discard requests where the last approval is marked as final
4. **Direct Superior Check**: For requests with approvals, check if the last approver's direct superior matches the current user

## Example Pages

- `/requests/approvals` - Updated to use the new Flutter-style function
- `/requests/flutter-style-approvals` - Demo page showing the implementation with debug information

## Testing

To test the functionality:

1. Ensure you have users with `username` and `directSuperior` fields in your Firestore
2. Create requests with `createdBy` field matching user usernames
3. Add approval entries to requests as needed
4. Navigate to the approvals page to see the filtered results 