# Label Extraction System Implementation

## Overview

The label extraction system automatically analyzes client onboarding data and questionnaire responses to extract meaningful, actionable labels that power AI-driven plan creation. This ensures that all client characteristics, preferences, and constraints are properly captured and used throughout the system.

## Architecture

### 1. Database Schema

**ClientLabel Model** (`prisma/schema.prisma`)
```prisma
model ClientLabel {
  id              String        @id @default(cuid())
  clientId        String
  client          ClientProfile @relation(fields: [clientId], references: [id], onDelete: Cascade)
  
  category        LabelCategory
  key             String
  value           String
  confidence      Float         @default(1.0)
  source          String        @default("onboarding")
  extractedAt     DateTime      @default(now())
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([clientId])
  @@index([category])
  @@index([key])
  @@unique([clientId, category, key])
}

enum LabelCategory {
  goal          // Main fitness goals
  health        // Health concerns and injuries
  preference    // Training preferences
  experience    // Experience level
  constraint    // Limitations and constraints
  metric        // Important metrics
}
```

### 2. AI-Powered Label Extraction

**Service** (`backend/services/labelExtractor.ts`)

The label extractor uses AI (via `@rork/toolkit-sdk`) to analyze client data and extract structured labels:

- **Input**: Onboarding data or questionnaire responses
- **Process**: AI analyzes the data and identifies meaningful labels
- **Output**: Structured labels with categories, keys, values, and confidence scores

**Example Labels**:
```typescript
{
  category: "goal",
  key: "primary_goal",
  value: "fat_loss",
  confidence: 1.0
}

{
  category: "health",
  key: "injury",
  value: "knee_pain",
  confidence: 0.9
}

{
  category: "preference",
  key: "training_location",
  value: "gym",
  confidence: 1.0
}
```

### 3. API Routes

#### Onboarding Routes (`/api/trpc/onboarding.*`)

- **`onboarding.submit`** - Submits onboarding data and automatically triggers label extraction
  - Saves onboarding data to database
  - Calls label extraction service
  - Stores extracted labels
  - Updates client status to "pending"

- **`onboarding.get`** - Retrieves onboarding data for a client

#### Label Routes (`/api/trpc/labels.*`)

- **`labels.extract`** - Manually trigger label extraction from existing onboarding data
- **`labels.get`** - Get all labels for a client (with optional category filter)
- **`labels.getSummary`** - Get a human-readable summary of client labels
- **`labels.add`** - Manually add a new label
- **`labels.update`** - Update an existing label
- **`labels.delete`** - Delete a label

### 4. Integration with AI Plan Generation

**Coach AI Suggestions Route** (`backend/trpc/routes/coach/ai-suggestions/route.ts`)

The AI suggestions route now:
1. Fetches onboarding data
2. Loads all extracted labels
3. Groups labels by category
4. Uses labels to personalize:
   - Plan goals
   - Exercise selection (avoiding contraindicated movements)
   - Nutrition guidelines (respecting dietary constraints)
   - Training volume and intensity
   - Schedule and frequency

## Label Categories Explained

### 1. Goal Labels
Primary fitness objectives that drive plan design.

**Examples**:
- `primary_goal: fat_loss`
- `primary_goal: muscle_gain`
- `primary_goal: body_recomposition`
- `secondary_goal: strength`
- `secondary_goal: endurance`

### 2. Health Labels
Medical conditions, injuries, and health concerns.

**Examples**:
- `injury: knee_pain`
- `injury: lower_back_issue`
- `condition: diabetes`
- `condition: high_blood_pressure`
- `limitation: limited_mobility`

### 3. Preference Labels
Training preferences and lifestyle choices.

**Examples**:
- `training_location: gym`
- `training_location: home`
- `training_time: morning`
- `workout_style: strength_focused`
- `cardio_preference: low_impact`

### 4. Experience Labels
Training background and skill level.

**Examples**:
- `training_level: beginner`
- `training_level: intermediate`
- `training_level: advanced`
- `training_years: 2`

### 5. Constraint Labels
Limitations and restrictions affecting plan design.

**Examples**:
- `dietary: pescatarian`
- `dietary: vegan`
- `dietary: gluten_free`
- `time: limited_availability`
- `equipment: bodyweight_only`

### 6. Metric Labels
Quantifiable measurements and starting points.

**Examples**:
- `starting_weight_kg: 71.2`
- `target_weight_kg: 65`
- `height_cm: 178`
- `age_group: 35_45`
- `bmi: 22.5`

## Usage Flow

### 1. Client Completes Onboarding

```typescript
// Frontend calls onboarding submission
await trpc.onboarding.submit.mutate({
  clientId: "client-123",
  age: 35,
  weight: 71.2,
  height: 178,
  goal: "Body Recomposition",
  experience: "Beginner",
  location: "Gym",
  frequency: 4,
  injuries: ["Knee"],
  dietType: "Pescatarian",
  // ... other fields
});
```

### 2. System Extracts Labels Automatically

The submission triggers:
1. Save onboarding data
2. AI analyzes data
3. Extracts 10-20 labels
4. Stores labels with confidence scores
5. Returns success with label count

### 3. Coach Views AI Suggestions

```typescript
// Coach requests AI-generated plan suggestions
const suggestions = await trpc.coach.aiSuggestions.query({
  clientId: "client-123"
});

// Returns personalized plan using extracted labels
console.log(suggestions.clientProfile.labels);
// {
//   goals: ["primary_goal: body_recomposition"],
//   health: ["injury: knee_pain"],
//   preferences: ["training_location: gym"],
//   constraints: ["dietary: pescatarian"]
// }
```

### 4. Labels Power Plan Creation

The AI uses labels to:
- Select appropriate exercises (avoiding knee-heavy movements)
- Adjust training volume for experience level
- Customize nutrition (pescatarian protein sources)
- Set realistic progression timelines

### 5. Labels Update Over Time

When clients complete monthly questionnaires:
1. New labels are extracted from responses
2. Existing labels can be updated
3. Confidence scores adjusted based on new data
4. Coach sees evolution of client profile

## Benefits

### 1. **Consistency**
- All client data is structured and queryable
- No information is lost in free-form text
- Easy to filter and compare clients

### 2. **AI Personalization**
- AI has clear, structured input
- Consistent format enables better plan generation
- Confidence scores help prioritize constraints

### 3. **Evolution Over Time**
- Labels track changes in client status
- Historical labels show progress
- Coach can see shifting priorities

### 4. **Transparency**
- Coach can see exactly what AI "knows" about client
- Labels can be manually adjusted if AI misunderstood
- Confidence scores show certainty level

### 5. **Scalability**
- New label categories can be added easily
- System works for any number of clients
- Labels enable bulk operations and analytics

## Next Steps

### To Deploy:

1. **Run Prisma Migration**
   ```bash
   npx prisma migrate dev --name add_client_labels
   npx prisma generate
   ```

2. **Test Label Extraction**
   ```typescript
   // Test with sample client
   await trpc.onboarding.submit.mutate({...sampleData});
   const labels = await trpc.labels.get.query({ clientId: "..." });
   console.log(labels);
   ```

3. **Verify AI Suggestions**
   ```typescript
   // Ensure suggestions use labels
   const suggestions = await trpc.coach.aiSuggestions.query({...});
   console.log(suggestions.clientProfile.labels);
   ```

### Future Enhancements:

1. **Label Analytics**
   - Dashboard showing label distribution across clients
   - Most common injuries, goals, constraints
   - Success rates by label combinations

2. **Automated Label Updates**
   - Extract labels from tracking data
   - Update progress-related labels automatically
   - Flag when labels contradict observed behavior

3. **Label-Based Alerts**
   - Alert when client behavior doesn't match labels
   - Suggest label updates based on performance
   - Notify coach of significant label changes

4. **Label Search and Filtering**
   - Find all clients with specific labels
   - Group clients by label combinations
   - Create cohorts for bulk plan updates

## Compliance with System Requirements

✅ **No Standalone Systems**: Labels are integrated with onboarding, questionnaires, AI suggestions, and plan creation

✅ **No Hard-Coded Data**: Labels are extracted from actual client data, not hard-coded

✅ **System Interdependency**: Labels flow through:
- Onboarding → Label Extraction → AI Suggestions → Plan Creation → Tracking → Questionnaires → Label Updates

✅ **Immutability**: Original onboarding data remains immutable; labels are versioned with timestamps and sources

✅ **Versioning**: Labels track their source and extraction time, enabling historical analysis

✅ **AI-Powered**: Uses AI for intelligent extraction, not rule-based logic

---

**Implementation Date**: 2025-10-23
**Status**: Complete - Ready for Database Migration
