# AI Recommendation Strategy: "Recommended for You"

To keep the recommendation engine lightweight and performant, we use a **Category-Based Boosting** approach.

### 1. Data Collection
- Track user interaction in the `rsvps` table.
- Each RSVP entry links a `user_id` to an `event_id`, which has a `category`.

### 2. Implementation in Go
When a user requests events, we can optionally pass a `user_id`.

```go
// internal/services/recommendation.go (Logic Concept)

func GetUserPreferences(userID uint) map[string]float64 {
    var results []struct {
        Category string
        Count    int
    }
    
    // Fetch last 20 RSVPs and count categories
    database.DB.Raw(`
        SELECT e.category, COUNT(*) as count
        FROM rsvps r
        JOIN events e ON r.event_id = e.id
        WHERE r.user_id = ?
        GROUP BY e.category
        ORDER BY count DESC
        LIMIT 5
    `, userID).Scan(&results)

    prefs := make(map[string]float64)
    for _, res := range results {
        // Normalize score (e.g., scale 0.1 to 1.0)
        prefs[res.Category] = float64(res.Count) * 0.1 
    }
    return prefs
}
```

### 3. Boosting Logic
In the `GetEvents` handler, we fetch the events as usual, then apply a "Score" to each event:
- **Base Score**: 1.0
- **Category Match**: Add `preference_weight` if the event category matches a top user category.
- **Distance Penalty**: Subtly decrease score as distance increases.

**Sort by:** `(Base Score + Category Match) / (1 + Distance)`

### 4. UI Highlighting
The React frontend can highlight "Recommended" events with a subtle glow effect or a special badge on the map popup.
```tsx
const isRecommended = event.score > threshold;
// Apply glowing CSS class
<div className={clsx(isRecommended && "shadow-[0_0_15px_rgba(59,130,246,0.6)]")}>
```
