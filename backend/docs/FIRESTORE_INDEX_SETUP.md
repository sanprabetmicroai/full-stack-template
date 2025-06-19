# Firestore Index Setup

## OTP Verification Index

The OTP verification system requires a composite index in Firestore for efficient querying. The current implementation uses a workaround that filters in memory, but for better performance, you should create the required index.

### Required Index Configuration

**Collection**: `otps`

**Fields** (in order):
1. `identifier` (Ascending)
2. `tag` (Ascending) 
3. `identifierType` (Ascending)
4. `timestamp` (Descending)

### How to Create the Index

#### Option 1: Using Firebase Console (Recommended)

1. Go to the [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** > **Indexes**
4. Click **Create Index**
5. Configure the index:
   - **Collection ID**: `otps`
   - **Fields**:
     - `identifier` (Ascending)
     - `tag` (Ascending)
     - `identifierType` (Ascending)
     - `timestamp` (Descending)
6. Click **Create**

#### Option 2: Using the Direct Link

If you see an error message with a direct link to create the index, you can use that link directly. It will look something like:

```
https://console.firebase.google.com/v1/r/project/YOUR_PROJECT_ID/firestore/indexes?create_composite=...
```

#### Option 3: Using Firebase CLI

Create a `firestore.indexes.json` file in your project root:

```json
{
  "indexes": [
    {
      "collectionGroup": "otps",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "identifier",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "tag", 
          "order": "ASCENDING"
        },
        {
          "fieldPath": "identifierType",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        }
      ]
    }
  ]
}
```

Then deploy using:
```bash
firebase deploy --only firestore:indexes
```

### Current Workaround

Until the index is created, the system uses a workaround that:
1. Queries only by `identifier` (which doesn't require a composite index)
2. Filters by `tag` and `identifierType` in memory
3. Sorts by `timestamp` in memory

This works but is less efficient than using a proper composite index.

### Performance Impact

- **Without index**: Queries may be slower and more expensive
- **With index**: Queries are optimized and more efficient

### Monitoring

You can monitor index usage in the Firebase Console under **Firestore Database** > **Usage** > **Indexes**.

### Troubleshooting

If you see the error:
```
The query requires an index. You can create it here: [link]
```

1. Click the provided link to create the index
2. Wait for the index to build (this can take a few minutes)
3. Retry your operation

The index building process is automatic and you'll receive an email when it's complete. 