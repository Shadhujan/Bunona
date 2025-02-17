# Leaderboard Troubleshooting Guide

## 1. Database Connection Settings

### Current Configuration
```typescript
// src/lib/supabase.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verify environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}
```

### Verification Steps
1. Check `.env` file contains valid credentials:
   ```
   VITE_SUPABASE_URL=https://mwryjgrylxeuqsjjbtpf.supabase.co
   VITE_SUPABASE_ANON_KEY=[your-anon-key]
   ```
2. Verify Supabase project is active and accessible
3. Confirm API keys have necessary permissions

## 2. SQL Query Validation

### Current Query
```typescript
// src/lib/database.ts
const { data, error } = await supabase
  .from('user_stats')
  .select(`
    user_id,
    best_score,
    games_won,
    win_loss_ratio,
    profiles!user_stats_user_id_fkey (username)
  `)
  .order('best_score', { ascending: false })
  .limit(10);
```

### Expected Table Relationships
```sql
user_stats
  - user_id (FK -> profiles.id)
  - best_score
  - games_won
  - win_loss_ratio

profiles
  - id (PK)
  - username
```

### Error Messages
```
Error: Could not find a relationship between 'user_stats' and 'profiles' in the schema cache
Code: PGRST200
```

## 3. Error Handling Implementation

### Current Implementation
```typescript
try {
  const { data, error } = await supabase.from('user_stats')...
  if (error) throw error;
  return data.map((entry) => ({
    userId: entry.user_id,
    username: entry.profiles?.username,
    bestScore: entry.best_score,
    gamesWon: entry.games_won,
    winLossRatio: entry.win_loss_ratio,
  }));
} catch (error) {
  console.error('Error fetching leaderboard:', error);
  return [];
}
```

### Recommended Error Handling
1. Log detailed error information
2. Implement retry mechanism for transient failures
3. Provide user-friendly error messages
4. Cache previous results as fallback

## 4. Data Structure Validation

### Expected Data Structure
```typescript
interface LeaderboardEntry {
  userId: string;
  username: string;
  bestScore: number;
  gamesWon: number;
  winLossRatio: number;
}
```

### Verification Steps
1. Check database schema matches interface
2. Verify data types are consistent
3. Ensure all required fields are present
4. Validate foreign key constraints

## 5. Step-by-Step Testing Process

1. **Database Connection**
   ```typescript
   const { data, error } = await supabase.from('profiles').select('*').limit(1);
   if (error) console.error('Connection test failed:', error);
   ```

2. **Profiles Table**
   ```typescript
   const { data, error } = await supabase
     .from('profiles')
     .select('id, username')
     .limit(5);
   ```

3. **User Stats Table**
   ```typescript
   const { data, error } = await supabase
     .from('user_stats')
     .select('user_id, best_score')
     .limit(5);
   ```

4. **Join Query**
   ```typescript
   const { data, error } = await supabase
     .from('user_stats')
     .select('user_id, profiles!user_stats_user_id_fkey (username)')
     .limit(1);
   ```

## 6. Frontend-Database Mapping

### Data Flow
1. Database Query → Raw Data
   ```typescript
   {
     user_id: "uuid",
     best_score: 100,
     games_won: 5,
     win_loss_ratio: 0.8,
     profiles: { username: "player1" }
   }
   ```

2. Transformation → Frontend Model
   ```typescript
   {
     userId: "uuid",
     username: "player1",
     bestScore: 100,
     gamesWon: 5,
     winLossRatio: 0.8
   }
   ```

### Verification Steps
1. Log raw database response
2. Verify data transformation
3. Check frontend rendering
4. Validate error states

## Recent Changes Impact Analysis

1. Database Migrations
   - Added foreign key relationship
   - Updated RLS policies
   - Modified table structure

2. Code Changes
   - Updated query structure
   - Modified error handling
   - Adjusted data mapping

## Troubleshooting Checklist

- [ ] Verify database connection
- [ ] Check foreign key relationships
- [ ] Validate RLS policies
- [ ] Test individual queries
- [ ] Verify data transformation
- [ ] Check frontend rendering
- [ ] Monitor error logs
- [ ] Test error handling
- [ ] Validate data types
- [ ] Check permissions

## Common Issues and Solutions

1. **Missing Foreign Key**
   - Symptom: PGRST200 error
   - Solution: Add foreign key relationship

2. **Invalid Join Syntax**
   - Symptom: Query fails with syntax error
   - Solution: Use correct join notation with `!`

3. **Permission Issues**
   - Symptom: RLS policy blocks access
   - Solution: Verify and update policies

4. **Data Type Mismatch**
   - Symptom: Transformation errors
   - Solution: Ensure consistent types

## Support Resources

1. Supabase Documentation
   - [Foreign Keys](https://supabase.com/docs/guides/database/tables#foreign-keys)
   - [Querying Data](https://supabase.com/docs/reference/javascript/select)
   - [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

2. Debugging Tools
   - Supabase Dashboard
   - Database Logs
   - Network Inspector
   - React DevTools