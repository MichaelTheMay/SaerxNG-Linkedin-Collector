# STEM Students Query Builder Example

## Based on Google Search Query

Original Google query demonstrates finding STEM students on LinkedIn:
```
(site:linkedin.com/in OR site:linkedin.com/pub) 
("student" OR "undergraduate" OR "bachelor" OR "masters" OR "graduate") 
("STEM" OR "science" OR "technology" OR "engineering" OR "mathematics" OR 
 "computer science" OR "physics" OR "data science" OR "software" OR 
 "biology" OR "chemistry" OR "mechanical engineering" OR 
 "electrical engineering" OR "civil engineering" OR "aerospace") 
("university" OR "college" OR "school") 
-jobs -recruiter -hiring -company -internship
```

## React UI Query Builder Setup

### Option 1: Full Combination (225 queries)

**Group 1 (OR) - Student Status:**
- student
- undergraduate  
- bachelor
- masters
- graduate

**Group 2 (OR) - STEM Fields:**
- STEM
- computer science
- data science
- engineering
- physics
- biology
- chemistry
- mathematics
- software engineering
- mechanical engineering
- electrical engineering

**Group 3 (OR) - Institution Type:**
- university
- college

**Generates**: 5 × 11 × 2 = **110 queries**

### Option 2: Targeted Approach (Recommended)

**Group 1 (AND) - University:**
- Stanford University
- MIT
- Harvard University
- UC Berkeley
- Caltech
- Carnegie Mellon

**Group 2 (OR) - Degree Level:**
- PhD
- graduate student
- masters
- undergraduate

**Group 3 (OR) - Major:**
- Computer Science
- Data Science
- Engineering
- Physics
- Mathematics

**Generates**: 6 × 4 × 5 = **120 queries**

### Option 3: High-Precision (Best Results)

**Group 1 (AND) - Specific School:**
- Stanford
- MIT

**Group 2 (AND) - Field:**
- Computer Science

**Group 3 (OR) - Status:**
- PhD student
- graduate student
- masters student

**Generates**: 2 × 1 × 3 = **6 queries**

## Example Generated Queries

Using Option 3, the Query Builder generates:

1. `Stanford AND "Computer Science" OR "PhD student"`
2. `Stanford AND "Computer Science" OR "graduate student"`
3. `Stanford AND "Computer Science" OR "masters student"`
4. `MIT AND "Computer Science" OR "PhD student"`
5. `MIT AND "Computer Science" OR "graduate student"`
6. `MIT AND "Computer Science" OR "masters student"`

## How to Use in React UI

### Step 1: Open Query Builder
1. Launch React UI: `http://localhost:5174`
2. Click green **"Query Builder"** button

### Step 2: Create Groups
1. Click **"Add Group"** for each keyword category
2. Select **AND** or **OR** operator
3. Add keywords to each group
4. See live count update

### Step 3: Generate & Search
1. Click **"Generate Queries"** button
2. Review generated queries in preview
3. Queries auto-added to keyword list
4. Click **"Run Search"** to execute

## Advanced Tips

### Exclude Patterns
To exclude jobs/recruiters (like Google query `-jobs -recruiter`), add exclusion keywords:

**Group 4 (AND) - Exclusions:**
- NOT jobs
- NOT recruiter
- NOT hiring

*(Note: Depends on SearxNG's exclusion support)*

### Progressive Refinement
1. Start with broad queries (fewer groups)
2. Run search and analyze results
3. Refine with additional groups
4. Re-run with narrowed focus

### Parallel Execution
For 100+ queries:
- Enable **Parallel Execution** checkbox
- Set **Throttle Limit** to 5-8
- Set **Delay** to 2-3 seconds
- Enable **Cache** to avoid re-scraping

## Expected Results

For STEM student searches, you should find:
- Current students at target universities
- PhD candidates and researchers
- Graduate students in technical fields
- Undergraduate STEM majors
- Recent graduates still listing student status

## Performance Estimate

| Queries | Parallel (5 threads) | Sequential |
|---------|---------------------|------------|
| 6 | ~15 seconds | ~30 seconds |
| 50 | ~2 minutes | ~8 minutes |
| 120 | ~5 minutes | ~20 minutes |
| 225 | ~9 minutes | ~40 minutes |

## Best Practices

1. **Start Small**: Test with 5-10 queries first
2. **Use Cache**: Avoid duplicate work
3. **Monitor Console**: Watch for errors
4. **Check SearxNG**: Ensure it's running
5. **Export All**: Get CSV, JSON, TXT, HTML formats
6. **Review Results**: Refine queries based on quality

## Sample Query Builder Configuration

```json
{
  "groups": [
    {
      "operator": "AND",
      "keywords": ["Stanford University", "MIT", "Harvard"]
    },
    {
      "operator": "AND", 
      "keywords": ["Computer Science", "Data Science"]
    },
    {
      "operator": "OR",
      "keywords": ["PhD student", "graduate student", "masters"]
    }
  ],
  "totalQueries": 18
}
```

This generates 18 highly targeted queries for finding CS graduate students at top universities!

